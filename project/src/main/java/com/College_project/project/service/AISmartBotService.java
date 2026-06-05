package com.College_project.project.service;

import java.math.BigDecimal;
import java.net.HttpURLConnection;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Consumer;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.concurrent.DelegatingSecurityContextExecutorService;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.College_project.project.DTOs.ChatMessageDTO;
import com.College_project.project.DTOs.FinancialHealthDTO;
import com.College_project.project.models.Alert;
import com.College_project.project.models.Anomaly;
import com.College_project.project.models.Category;
import com.College_project.project.models.Investment;
import com.College_project.project.models.Transaction;
import com.College_project.project.models.User;
import com.College_project.project.repository.AlertRepository;
import com.College_project.project.repository.CategoryRepository;
import com.College_project.project.repository.UserRepository;
import com.College_project.project.repository.anomalyRepository;
import com.College_project.project.repository.bankAccountRepository;
import com.College_project.project.repository.investmentRepository;
import com.College_project.project.repository.transactionRepository;
import com.College_project.project.service.IntentDetectionService.Intent;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AISmartBotService {

    private final NetWorthService netWorthService;
    private final bankAccountRepository bankRepo;
    private final BillReminderService billService;
    private final transactionRepository transactionRepo;
    private final BudgetService budgetService;
    private final AnomalyStatisticsService anomalyService;
    private final AIInvestmentAdviceService investmentService;
    private final FinancialHealthService financialHealthService;
    private final UserRepository userRepository;
    private final AlertRepository alertRepo;
    private final CategoryRepository categoryRepo;
    private final anomalyRepository anomalyRepo;
    private final investmentRepository investmentRepo;
    
    // Increase read timeout to accommodate longer model generations
    private final RestTemplate restTemplate = createRestTemplateWithTimeout(1500, 120000);
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static RestTemplate createRestTemplateWithTimeout(int connectTimeoutMs, int readTimeoutMs) {
        org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(connectTimeoutMs);
        factory.setReadTimeout(readTimeoutMs);
        return new RestTemplate(factory);
    }
    
    // Thread pool for parallel context gathering (propagate Spring SecurityContext)
    private final ExecutorService executorService = new DelegatingSecurityContextExecutorService(
        Executors.newFixedThreadPool(10)
    );
    
    // Scheduled executor for cache eviction
    private final java.util.concurrent.ScheduledExecutorService scheduler =
        java.util.concurrent.Executors.newSingleThreadScheduledExecutor();

    @jakarta.annotation.PostConstruct
    private void initEviction() {
        // Evict stale entries every 5 minutes
        scheduler.scheduleAtFixedRate(() -> {
            long now = System.currentTimeMillis();
            contextCache.entrySet().removeIf(e -> e.getValue().isExpired(300_000));
            lastRequestTime.entrySet().removeIf(e -> now - e.getValue() > 300_000);
        }, 5, 5, java.util.concurrent.TimeUnit.MINUTES);
    }
    
    @Value("${openrouter.api.key:}")
    private String apiKey;
    
    @Value("${ollama.url:http://localhost:11434}")
    private String ollamaUrl;
    
    @Value("${ollama.model:qwen2.5:3b}")
    private String ollamaModel;
    
    @Value("${openrouter.model:stepfun/step-3.5-flash}")
    private String openRouterModel;
    
    // Cache for frequent data (30 seconds TTL)
    private final Map<Long, CachedContext> contextCache = new ConcurrentHashMap<>();
    
    // Rate limiting
    private final Map<Long, Long> lastRequestTime = new ConcurrentHashMap<>();
    private static final long MIN_REQUEST_INTERVAL_MS = 1000;
    
    @Autowired
    private IntentDetectionService intentDetectionService;
    
    @Autowired
    private SystemActionHandler systemActionHandler;
    
    @Autowired
    private HybridMemoryService memoryService;
    
    // Store current conversation ID per user
    private final Map<Long, String> userConversations = new ConcurrentHashMap<>();

    // Simple circuit-breaker for Ollama: counts consecutive failures
    private final AtomicInteger ollamaFailureCount = new AtomicInteger(0);
    // when > now(), circuit is open and we should avoid calling Ollama
    private volatile long ollamaCircuitOpenUntil = 0L;
    private static final int OLLAMA_MAX_CONSECUTIVE_FAILURES = 3;
    private static final long OLLAMA_CIRCUIT_OPEN_MS = 60_000; // 1 minute

    // ========== MAIN CHAT RESPONSE METHOD (WITH MEMORY) ==========
    public String generateFinancialInsightsReport(Long userId) {
        if (!validateUser(userId)) return getFallbackResponse();

        User user = getUserOrThrow(userId);
        String healthJson = "{}";
        try {
            healthJson = objectMapper.writeValueAsString(financialHealthService.calculateFinancialHealth(userId));
        } catch (Exception e) {
            log.warn("Financial health JSON unavailable for AI report: {}", e.getMessage());
        }

        String context = gatherContextOptimized(userId, user);
        String prompt = """
            You are SmartBot, an AI financial analyst. Create a concise AI Financial Insights Report for %s.

            Use only the verified application data below. Do not invent facts, transaction names, bank names,
            exact dates, returns, or balances that are not present. If data is missing or estimated, say so clearly.
            This is educational guidance, not certified financial advice.
            Surround important numbers, risks, and short priority phrases with **double asterisks** so the UI can highlight them.

            Required format:
            AI FINANCIAL INSIGHTS REPORT
            Snapshot:
            - 2 to 3 bullets about current financial condition.
            Key Risks:
            - 2 to 4 bullets, prioritized by urgency.
            Smart Actions:
            - 3 to 5 practical next steps.
            Confidence:
            - State High, Medium, or Low based on data completeness, with one reason.
            Note:
            - One sentence that the report depends on user-entered/linked data accuracy.

            Financial health JSON:
            %s

            Dashboard context:
            %s
            """.formatted(user.getName(), healthJson, context);

        try {
            return callOllama(prompt);
        } catch (Exception e) {
            log.warn("Ollama AI report failed: {}", e.getMessage());
            if (apiKey != null && !apiKey.isEmpty()) {
                try {
                    return callOpenRouterWithRetry(prompt);
                } catch (Exception ex) {
                    log.warn("OpenRouter AI report failed: {}", ex.getMessage());
                }
            }
            return generateFinancialReportFallback(userId, user);
        }
    }

    public Map<String, Object> generateSavingsRateImprovementAdvice(Long userId) {
        Map<String, Object> response = new HashMap<>();
        if (!validateUser(userId)) {
            response.put("advice", getFallbackResponse());
            response.put("source", "unavailable");
            return response;
        }

        User user = getUserOrThrow(userId);
        com.College_project.project.DTOs.SavingsRateDTO savings = netWorthService.getCurrentSavingsRate(userId);
        BigDecimal currentRate = savings.getCurrentSavingsRate() != null ? savings.getCurrentSavingsRate() : BigDecimal.ZERO;
        BigDecimal income = savings.getCurrentMonthlyIncome() != null ? savings.getCurrentMonthlyIncome() : BigDecimal.ZERO;

        LocalDate monthStart = LocalDate.now().withDayOfMonth(1);
        LocalDate monthEnd = monthStart.withDayOfMonth(monthStart.lengthOfMonth());
        List<Transaction> monthTransactions = transactionRepo.findByUserAndTransactionDateBetween(user, monthStart, monthEnd);

        Map<String, BigDecimal> expenseByCategory = monthTransactions.stream()
            .filter(t -> t.getType() != null && "EXPENSE".equalsIgnoreCase(t.getType().toString()))
            .filter(t -> t.getAmount() != null)
            .collect(Collectors.groupingBy(
                t -> t.getCategory() != null && t.getCategory().getName() != null
                    ? t.getCategory().getName()
                    : "Uncategorized",
                LinkedHashMap::new,
                Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
            ));

        List<Map<String, Object>> topCategories = expenseByCategory.entrySet().stream()
            .sorted(Map.Entry.<String, BigDecimal>comparingByValue().reversed())
            .limit(5)
            .map(e -> {
                Map<String, Object> category = new HashMap<>();
                category.put("name", e.getKey());
                category.put("amount", e.getValue());
                return category;
            })
            .collect(Collectors.toList());

        String topExpenseCategories = expenseByCategory.entrySet().stream()
            .sorted(Map.Entry.<String, BigDecimal>comparingByValue().reversed())
            .limit(5)
            .map(e -> e.getKey() + ": ₹" + e.getValue())
            .collect(Collectors.joining(", "));

        String recentExpenses = monthTransactions.stream()
            .filter(t -> t.getType() != null && "EXPENSE".equalsIgnoreCase(t.getType().toString()))
            .filter(t -> t.getAmount() != null)
            .sorted(Comparator.comparing(Transaction::getAmount).reversed())
            .limit(5)
            .map(t -> (t.getDescription() != null ? t.getDescription() : "Expense") + " ₹" + t.getAmount())
            .collect(Collectors.joining(", "));

        BigDecimal targetRate = currentRate.compareTo(BigDecimal.ZERO) < 0
            ? BigDecimal.ZERO
            : currentRate.add(new BigDecimal("5"));
        if (currentRate.compareTo(new BigDecimal("20")) < 0 && targetRate.compareTo(new BigDecimal("20")) > 0) {
            targetRate = new BigDecimal("20");
        }
        BigDecimal targetMonthlySavings = income.compareTo(BigDecimal.ZERO) > 0
            ? income.multiply(targetRate).divide(new BigDecimal("100"), 2, java.math.RoundingMode.HALF_UP)
            : BigDecimal.ZERO;
        BigDecimal targetExpenseLimit = income.subtract(targetMonthlySavings);

        response.put("currentSavingsRate", currentRate);
        response.put("monthlyIncome", income);
        response.put("monthlyExpenses", savings.getCurrentMonthlyExpenses());
        response.put("monthlySavings", savings.getCurrentMonthlySavings());
        response.put("targetSavingsRate", targetRate);
        response.put("targetMonthlySavings", targetMonthlySavings);
        response.put("targetExpenseLimit", targetExpenseLimit);
        response.put("topExpenseCategories", topCategories);

        String prompt = """
            You are SmartBot, an AI savings coach inside a personal finance application.
            Give practical advice to improve the user's savings rate using only the verified app data below.
            Do not invent transaction details, incomes, balances, or categories.
            Keep it concise and action-focused.
            Use important numbers exactly as provided. Surround key numbers and important short phrases with **double asterisks** for highlighting.

            Required format:
            AI SAVINGS RATE IMPROVEMENT PLAN
            Current Snapshot:
            - 2 bullets explaining the current savings-rate situation.
            Biggest Opportunities:
            - 2 to 4 bullets based on expenses/category patterns.
            Action Plan:
            - 4 practical steps the user can apply this month.
            Target:
            - Suggest a realistic next savings-rate target and explain why.
            Note:
            - One sentence saying this depends on user-entered/linked data accuracy.

            User: %s
            Current savings rate: %s%%
            Monthly income: ₹%s
            Monthly expenses: ₹%s
            Monthly savings: ₹%s
            Savings status: %s
            Top expense categories this month: %s
            Largest recent expenses this month: %s
            """.formatted(
                user.getName(),
                savings.getCurrentSavingsRate(),
                savings.getCurrentMonthlyIncome(),
                savings.getCurrentMonthlyExpenses(),
                savings.getCurrentMonthlySavings(),
                savings.getSavingsStatus(),
                topExpenseCategories.isBlank() ? "No expense categories found" : topExpenseCategories,
                recentExpenses.isBlank() ? "No recent expenses found" : recentExpenses
            );

        try {
            response.put("advice", callOllama(prompt));
            response.put("source", "ai");
            response.put("engine", "Ollama");
        } catch (Exception e) {
            log.warn("Ollama savings-rate improvement advice failed: {}", e.getMessage());
            if (apiKey != null && !apiKey.isEmpty()) {
                try {
                    response.put("advice", callOpenRouterWithRetry(prompt));
                    response.put("source", "ai");
                    response.put("engine", "OpenRouter");
                    return response;
                } catch (Exception ex) {
                    log.warn("OpenRouter savings-rate improvement advice failed: {}", ex.getMessage());
                }
            }
            response.put("advice", generateSavingsRateImprovementFallback(savings, topExpenseCategories));
            response.put("source", "fallback");
            response.put("engine", "Calculated fallback");
        }

        return response;
    }

    public String getChatResponse(Long userId, String userMessage) {
        return getChatResponse(userId, userMessage, null);
    }

    public String getChatResponse(Long userId, String userMessage, String actionResult) {
        if (!validateUser(userId)) return getFallbackResponse();
        
        if (!checkRateLimit(userId)) {
            return "Please wait a moment before sending another message.";
        }
        
        User user = getUserOrThrow(userId);
        
        // Initialize memory service with error handling
        String conversationId;
        String conversationContext = "";
        List<ChatMessageDTO> relevantPast = new java.util.ArrayList<>();
        
        try {
            conversationId = userConversations.computeIfAbsent(userId, 
                id -> memoryService.startNewConversation(id));
            
            memoryService.addMessage(userId, "user", userMessage, conversationId);
            conversationContext = memoryService.getConversationContext(userId, conversationId);
            relevantPast = memoryService.getRelevantPastConversations(userId, userMessage, 3);
        } catch (Exception e) {
            log.warn("Memory service failed for user {}, using context-free mode: {}", userId, e.getMessage());
            conversationId = "fallback-" + userId;
            conversationContext = "";
            // Continue without memory - not a fatal error
        }
        
        StringBuilder relevantContext = new StringBuilder();
        if (!relevantPast.isEmpty()) {
            relevantContext.append("<RELEVANT_PAST_CONVERSATIONS>\n");
            for (ChatMessageDTO msg : relevantPast) {
                relevantContext.append(msg.getRole().toUpperCase())
                               .append(": ").append(msg.getContent()).append("\n");
            }
            relevantContext.append("</RELEVANT_PAST_CONVERSATIONS>\n");
        }
        
        try {
            String context = gatherContextOptimized(userId, user);
            String prompt = buildSystemPromptWithMemory(user.getName(), context, 
                conversationContext, relevantContext.toString(), userMessage, actionResult);
            
            // Try Local Ollama first
            try {
                log.info("Attempting local Ollama for user: {}", userId);
                String aiResponse = callOllama(prompt);
                
                // Add AI response to memory (async, non-blocking failure)
                try {
                    memoryService.addMessage(userId, "assistant", aiResponse, conversationId);
                } catch (Exception e) {
                    log.debug("Failed to add message to memory, continuing anyway", e);
                }
                
                return aiResponse;
            } catch (Exception e) {
                log.warn("Ollama failed: {}", e.getMessage());
                
                // Try OpenRouter fallback
                if (apiKey != null && !apiKey.isEmpty()) {
                    try {
                        log.info("Attempting OpenRouter fallback for user: {}", userId);
                        String aiResponse = callOpenRouterWithRetry(prompt);
                        
                        try {
                            memoryService.addMessage(userId, "assistant", aiResponse, conversationId);
                        } catch (Exception ex) {
                            log.debug("Failed to add message to memory", ex);
                        }
                        
                        return aiResponse;
                    } catch (Exception ex) {
                        log.error("OpenRouter failed: {}", ex.getMessage());
                    }
                }
            }
            
            log.info("Ollama and OpenRouter failed. Invoking smart fallback for user: {}", userId);
            String fallbackResponse = generateSmartFallbackResponse(userId, user, userMessage);
            try {
                memoryService.addMessage(userId, "assistant", fallbackResponse, conversationId);
            } catch (Exception e) {
                log.debug("Failed to add fallback response to memory", e);
            }
            return fallbackResponse;
            
        } catch (Exception e) {
            log.error("Error getting chat response for user {}", userId, e);
            return generateSmartFallbackResponse(userId, user, userMessage);
        }
    }
    
    // ========== METHOD WITH INTENT ROUTING (3 parameters) ==========
    public String getChatResponseWithRouting(Long userId, String userMessage) {
        if (!validateUser(userId)) return getFallbackResponse();

        Intent detectedIntent = intentDetectionService.detectIntent(userMessage);
        if (detectedIntent == Intent.APPLICATION_HELP || detectedIntent == Intent.HELP) {
            return systemActionHandler.handleApplicationHelp(userMessage);
        }
        
        if (!checkRateLimit(userId)) {
            return "Please wait a moment before sending another message.";
        }

        String ruleBasedResponse = handleRuleBasedIntent(userId, userMessage, detectedIntent);
        if (ruleBasedResponse != null) {
            log.info("Using rule-based response for intent: {} and user: {}", detectedIntent, userId);
            return ruleBasedResponse;
        }

        if (!isDirectActionIntent(detectedIntent)) {
            log.info("Using AI response for general intent: {} and user: {}", detectedIntent, userId);
            return getChatResponse(userId, userMessage);
        }
        
        log.info("Detected intent: {} for user: {}", detectedIntent, userId);
        
        switch (detectedIntent) {
            case MARK_BILL_PAID: {
                String actionResult = systemActionHandler.handleMarkBillPaid(userId, userMessage);
                if (actionResult != null && (actionResult.contains("✅") || actionResult.contains("✓") || actionResult.toLowerCase().contains("success"))) {
                    return actionResult;
                }
                return actionResult;
            }
                
            case ADD_EXPENSE: {
                String actionResult = systemActionHandler.handleAddExpense(userId, userMessage, intentDetectionService);
                if (actionResult != null && (actionResult.contains("✅") || actionResult.contains("✓") || actionResult.toLowerCase().contains("success"))) {
                    return actionResult;
                }
                return actionResult;
            }
                
            case ADD_INCOME: {
                String actionResult = systemActionHandler.handleAddIncome(userId, userMessage, intentDetectionService);
                if (actionResult != null && (actionResult.contains("✅") || actionResult.contains("✓") || actionResult.toLowerCase().contains("success"))) {
                    return actionResult;
                }
                return actionResult;
            }
            
            case GET_UPCOMING_BILLS:
                return systemActionHandler.handleGetUpcomingBills(userId);

            case GET_RECENT_TRANSACTIONS:
                return systemActionHandler.handleGetRecentTransactions(userId);

            default:
                return getChatResponse(userId, userMessage);
        }
    }
    
    // ========== OVERLOADED METHOD WITH ALL PARAMETERS ==========
    public String getChatResponseWithRouting(Long userId, String userMessage, 
                                             Intent intent, BigDecimal amount, 
                                             String description) {
        if (!validateUser(userId)) return getFallbackResponse();

        if (intent == Intent.APPLICATION_HELP || intent == Intent.HELP) {
            return systemActionHandler.handleApplicationHelp(userMessage);
        }

        if (!checkRateLimit(userId)) {
            return "Please wait a moment before sending another message.";
        }

        String ruleBasedResponse = handleRuleBasedIntent(userId, userMessage, intent);
        if (ruleBasedResponse != null) {
            log.info("Using rule-based response for intent: {} and user: {}", intent, userId);
            return ruleBasedResponse;
        }

        if (!isDirectActionIntent(intent)) {
            log.info("Using AI response for general intent: {} and user: {}", intent, userId);
            return getChatResponse(userId, userMessage);
        }
        
        log.info("Processing routed chat with intent: {}, amount: {}, description: {}", 
                 intent, amount, description);
        
        switch (intent) {
            case MARK_BILL_PAID: {
                String actionResult = systemActionHandler.handleMarkBillPaid(userId, userMessage);
                if (actionResult != null && (actionResult.contains("✅") || actionResult.contains("✓") || actionResult.toLowerCase().contains("success"))) {
                    return actionResult;
                }
                return actionResult;
            }
                
            case ADD_EXPENSE: {
                String actionResult;
                if (amount != null && description != null) {
                    actionResult = systemActionHandler.handleAddExpenseWithData(userId, amount, description);
                } else if (amount != null) {
                    actionResult = systemActionHandler.handleAddExpense(userId, amount, userMessage);
                } else {
                    actionResult = systemActionHandler.handleAddExpense(userId, userMessage, intentDetectionService);
                }
                if (actionResult != null && (actionResult.contains("✅") || actionResult.contains("✓") || actionResult.toLowerCase().contains("success"))) {
                    return actionResult;
                }
                return actionResult;
            }
                
            case ADD_INCOME: {
                String actionResult;
                if (amount != null && description != null) {
                    actionResult = systemActionHandler.handleAddIncomeWithData(userId, amount, description);
                } else if (amount != null) {
                    actionResult = systemActionHandler.handleAddIncome(userId, amount, userMessage);
                } else {
                    actionResult = systemActionHandler.handleAddIncome(userId, userMessage, intentDetectionService);
                }
                if (actionResult != null && (actionResult.contains("✅") || actionResult.contains("✓") || actionResult.toLowerCase().contains("success"))) {
                    return actionResult;
                }
                return actionResult;
            }
            
            case GET_ANOMALIES: {
                try {
                    User user = getUserOrThrow(userId);
                    String anomalyResponse = getAnomaliesForResponse(userId, user);
                    return anomalyResponse;
                } catch (Exception e) {
                    log.error("Error fetching anomalies", e);
                    return "I couldn't fetch your anomaly data. Please try again later.";
                }
            }

            case GET_UPCOMING_BILLS:
                return systemActionHandler.handleGetUpcomingBills(userId);

            case GET_RECENT_TRANSACTIONS:
                return systemActionHandler.handleGetRecentTransactions(userId);
            
            default:
                return getChatResponse(userId, userMessage);
        }
    }
    
    // ========== OVERLOADED METHOD WITHOUT AMOUNT/DESCRIPTION ==========
    public String getChatResponseWithRouting(Long userId, String userMessage, Intent intent) {
        if (intent == Intent.APPLICATION_HELP || intent == Intent.HELP) {
            return systemActionHandler.handleApplicationHelp(userMessage);
        }
        return getChatResponseWithRouting(userId, userMessage, intent, null, null);
    }

    public boolean isDirectActionIntent(Intent intent) {
        return intent == Intent.ADD_EXPENSE
            || intent == Intent.ADD_INCOME
            || intent == Intent.MARK_BILL_PAID
            || intent == Intent.GET_UPCOMING_BILLS
            || intent == Intent.GET_RECENT_TRANSACTIONS;
    }

    public boolean shouldUseRuleBasedResponse(Intent intent) {
        return isDirectActionIntent(intent) || isRuleBasedRegularIntent(intent);
    }

    public boolean isRuleBasedRegularIntent(Intent intent) {
        return intent == Intent.GET_BALANCE
            || intent == Intent.GET_NET_WORTH
            || intent == Intent.GET_SAVINGS_RATE
            || intent == Intent.GET_SPENDING
            || intent == Intent.GET_INCOME
            || intent == Intent.GET_BUDGET_STATUS
            || intent == Intent.GET_BUDGET_SUMMARY
            || intent == Intent.CHECK_BUDGET
            || intent == Intent.GET_UPCOMING_BILLS
            || intent == Intent.GET_BILL_STATUS
            || intent == Intent.GET_RECENT_TRANSACTIONS
            || intent == Intent.GET_INVESTMENT_SUMMARY
            || intent == Intent.GET_PORTFOLIO_PERFORMANCE
            || intent == Intent.GET_ANOMALIES
            || intent == Intent.FINANCE_EDUCATION
            || intent == Intent.APPLICATION_HELP
            || intent == Intent.HELP
            || intent == Intent.GREETING;
    }

    private String handleRuleBasedIntent(Long userId, String userMessage, Intent intent) {
        if (intent == null) {
            return null;
        }

        switch (intent) {
            case GET_BALANCE:
                return systemActionHandler.handleGetBalance(userId);
            case GET_NET_WORTH:
                return systemActionHandler.handleGetNetWorth(userId);
            case GET_SAVINGS_RATE:
                return systemActionHandler.handleGetSavingsRate(userId);
            case GET_SPENDING:
                return systemActionHandler.handleGetSpending(userId);
            case GET_INCOME:
                return systemActionHandler.handleGetIncome(userId);
            case GET_BUDGET_STATUS:
            case GET_BUDGET_SUMMARY:
            case CHECK_BUDGET:
                return systemActionHandler.handleGetBudgetStatus(userId);
            case GET_UPCOMING_BILLS:
            case GET_BILL_STATUS:
                return systemActionHandler.handleGetUpcomingBills(userId);
            case GET_RECENT_TRANSACTIONS:
                return systemActionHandler.handleGetRecentTransactions(userId);
            case GET_INVESTMENT_SUMMARY:
            case GET_PORTFOLIO_PERFORMANCE:
                return systemActionHandler.handleGetInvestmentSummary(userId);
            case GET_ANOMALIES:
                return getAnomaliesForResponse(userId, getUserOrThrow(userId));
            case FINANCE_EDUCATION:
                return systemActionHandler.handleFinanceEducation(userMessage);
            case APPLICATION_HELP:
            case HELP:
                return systemActionHandler.handleApplicationHelp(userMessage);
            case GREETING:
                return "Hi! I can answer from your real app data: balance, spending, income, savings rate, budgets, bills, recent transactions, investments, and anomaly alerts.";
            default:
                return null;
        }
    }

    // ========== STREAMING METHOD ==========
    public CompletableFuture<Void> streamChatResponse(Long userId, String userMessage, Consumer<String> chunkConsumer) {
        if (!validateUser(userId)) {
            chunkConsumer.accept(getFallbackResponse());
            return CompletableFuture.completedFuture(null);
        }
        
        if (!checkRateLimit(userId)) {
            chunkConsumer.accept("Please wait a moment before sending another message.");
            return CompletableFuture.completedFuture(null);
        }
        
        User user = getUserOrThrow(userId);
        
        return CompletableFuture.supplyAsync(() -> gatherContextOptimized(userId, user), executorService)
            .thenApply(context -> buildSystemPrompt(user.getName(), context, userMessage))
            .thenAccept(prompt -> {
                CompletableFuture<Void> streamFuture = CompletableFuture.runAsync(() -> {
                    try {
                        streamOllamaWithTimeout(prompt, chunkConsumer);
                    } catch (Exception e) {
                        log.warn("Ollama streaming failed: {}", e.getMessage());
                        handleStreamFallback(userId, user, userMessage, prompt, chunkConsumer, e);
                    }
                }, executorService);
                
                try {
                    streamFuture.get(150, TimeUnit.SECONDS);
                } catch (TimeoutException e) {
                    log.warn("Streaming timeout for user {}", userId);
                    streamFallbackDirect(userId, user, userMessage, chunkConsumer);
                } catch (Exception e) {
                    log.error("Unexpected error in streaming", e);
                    streamFallbackDirect(userId, user, userMessage, chunkConsumer);
                }
            });
    }
    
    // ========== PRIVATE HELPER METHODS ==========
    
    private void streamOllamaWithTimeout(String prompt, Consumer<String> chunkConsumer) throws Exception {
        // Circuit-breaker: avoid calling Ollama when it's been failing repeatedly
        long now = System.currentTimeMillis();
        if (ollamaCircuitOpenUntil > now) {
            throw new RuntimeException("Ollama circuit open until " + ollamaCircuitOpenUntil);
        }

        String url = ollamaUrl + "/api/generate";
        
        Map<String, Object> request = new HashMap<>();
        request.put("model", ollamaModel);
        request.put("prompt", prompt);
        request.put("stream", true);
        request.put("options", Map.of(
            "num_predict", 1400,
            "temperature", 0.7,
            "timeout", 180
        ));
        
        var conn = (java.net.HttpURLConnection) new java.net.URL(url).openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setConnectTimeout(1500);
        // Allow longer responses to finish instead of cutting advice off midway.
        conn.setReadTimeout(180000);
        conn.setDoOutput(true);
        
        try (var os = conn.getOutputStream()) {
            os.write(objectMapper.writeValueAsBytes(request));
        }
        
        int responseCode = conn.getResponseCode();
        if (responseCode != HttpURLConnection.HTTP_OK) {
            // Try to read error stream for better diagnostics
            String errorBody = "";
            try (var errStream = conn.getErrorStream()) {
                if (errStream != null) {
                    try (var errReader = new java.io.BufferedReader(new java.io.InputStreamReader(errStream, "UTF-8"))) {
                        StringBuilder sb = new StringBuilder();
                        String l;
                        while ((l = errReader.readLine()) != null) {
                            sb.append(l).append('\n');
                        }
                        errorBody = sb.toString();
                    }
                }
            } catch (Exception ignore) {
            }
            throw new RuntimeException("Ollama returned error code: " + responseCode + " body: " + errorBody);
        }
        
        try (var reader = new java.io.BufferedReader(new java.io.InputStreamReader(conn.getInputStream(), "UTF-8"))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) continue;
                
                JsonNode node = objectMapper.readTree(line);
                String chunk = node.path("response").asText();
                if (chunk != null && !chunk.isEmpty()) {
                    chunkConsumer.accept(chunk);
                }
                if (node.path("done").asBoolean()) break;
            }
        }
    }
    
    private void handleStreamFallback(Long userId, User user, String userMessage, String prompt, Consumer<String> chunkConsumer, Exception e) {
        log.warn("Using OpenRouter fallback for streaming");
        
        if (apiKey != null && !apiKey.isEmpty()) {
            try {
                String fullResponse = callOpenRouterWithRetry(prompt);
                if (fullResponse != null && !fullResponse.isEmpty()) {
                    int chunkSize = 12;
                    for (int i = 0; i < fullResponse.length(); i += chunkSize) {
                        int end = Math.min(i + chunkSize, fullResponse.length());
                        chunkConsumer.accept(fullResponse.substring(i, end));
                        try {
                            Thread.sleep(20);
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                            break;
                        }
                    }
                } else {
                    streamFallbackDirect(userId, user, userMessage, chunkConsumer);
                }
            } catch (Exception ex) {
                log.error("OpenRouter fallback failed", ex);
                streamFallbackDirect(userId, user, userMessage, chunkConsumer);
            }
        } else {
            streamFallbackDirect(userId, user, userMessage, chunkConsumer);
        }
    }
    
    public String gatherContextOptimized(Long userId, User user) {
        CachedContext cached = contextCache.get(userId);
        if (cached != null && !cached.isExpired(30000)) {
            log.debug("Using cached context for user {}", userId);
            return cached.context;
        }
        
        CompletableFuture<String> netWorthFuture = CompletableFuture.supplyAsync(() -> 
            getNetWorthContext(userId), executorService);
        CompletableFuture<String> savingsFuture = CompletableFuture.supplyAsync(() -> 
            getSavingsContext(userId), executorService);
        CompletableFuture<String> budgetFuture = CompletableFuture.supplyAsync(() -> 
            getBudgetContext(userId), executorService);
        CompletableFuture<String> billsFuture = CompletableFuture.supplyAsync(() -> 
            getBillsContext(userId), executorService);
        CompletableFuture<String> transactionsFuture = CompletableFuture.supplyAsync(() -> 
            getTransactionsContext(user), executorService);
        CompletableFuture<String> spendingInsightsFuture = CompletableFuture.supplyAsync(() ->
            getSpendingInsightsContext(userId, user), executorService);
        CompletableFuture<String> alertsFuture = CompletableFuture.supplyAsync(() -> 
            getAlertsContext(userId), executorService);
        CompletableFuture<String> anomaliesFuture = CompletableFuture.supplyAsync(() -> 
            getAnomaliesContext(user), executorService);
        CompletableFuture<String> investmentsFuture = CompletableFuture.supplyAsync(() -> 
            getInvestmentsContext(user), executorService);
        CompletableFuture<String> categoriesFuture = CompletableFuture.supplyAsync(() -> 
            getCategoriesContext(), executorService);
        
        try {
            String context = CompletableFuture.allOf(netWorthFuture, savingsFuture, budgetFuture, 
                    billsFuture, transactionsFuture, spendingInsightsFuture, alertsFuture, anomaliesFuture,
                    investmentsFuture, categoriesFuture)
                .thenApply(v -> {
                    StringBuilder sb = new StringBuilder("<USER_FINANCIAL_PROFILE>\n");
                    sb.append(netWorthFuture.join());
                    sb.append(savingsFuture.join());
                    sb.append(budgetFuture.join());
                    sb.append(billsFuture.join());
                    sb.append(transactionsFuture.join());
                    sb.append(spendingInsightsFuture.join());
                    sb.append(alertsFuture.join());
                    sb.append(anomaliesFuture.join());
                    sb.append(investmentsFuture.join());
                    sb.append(categoriesFuture.join());
                    sb.append("<CURRENT_DATE>").append(LocalDate.now()).append("</CURRENT_DATE>\n");
                    sb.append("</USER_FINANCIAL_PROFILE>\n");
                    return sb.toString();
                }).get(10, TimeUnit.SECONDS);
            
            contextCache.put(userId, new CachedContext(context, System.currentTimeMillis()));
            return context;
            
        } catch (Exception e) {
            log.error("Error gathering context for user {}", userId, e);
            return getMinimalContext();
        }
    }

    private String getAlertsContext(Long userId) {
        try {
            List<Alert> alerts = alertRepo.findByUser_UserIdOrderByCreatedAtDesc(userId);
            if (alerts != null && !alerts.isEmpty()) {
                String alertsStr = alerts.stream().limit(5)
                    .filter(a -> a.getMessage() == null || !a.getMessage().toLowerCase().contains("receipts processed"))
                    .map(a -> String.format("[%s: %s (Read: %b)]",
                        a.getType() != null ? a.getType() : "ALERT", a.getMessage(), a.isRead()))
                    .collect(Collectors.joining(", "));
                if (alertsStr.isBlank()) {
                    return "<RECENT_ALERTS>No recent financial alerts</RECENT_ALERTS>\n";
                }
                return String.format("<RECENT_ALERTS>%s</RECENT_ALERTS>\n", alertsStr);
            }
            return "<RECENT_ALERTS>No recent alerts</RECENT_ALERTS>\n";
        } catch (Exception e) {
            return "<RECENT_ALERTS>UNAVAILABLE</RECENT_ALERTS>\n";
        }
    }

    private String getAnomaliesContext(User user) {
        try {
            List<Anomaly> anomalies = anomalyRepo.findByUser(user);
            if (anomalies != null && !anomalies.isEmpty()) {
                String anomaliesStr = anomalies.stream().limit(5)
                    .map(a -> String.format("[Severity: %s, Message: %s, Resolved: %b]",
                        a.getSeverity(), a.getReason(), a.getResolutionNote() != null))
                    .collect(Collectors.joining(", "));
                return String.format("<SUSPICIOUS_ANOMALIES>%s</SUSPICIOUS_ANOMALIES>\n", anomaliesStr);
            }
            return "<SUSPICIOUS_ANOMALIES>No suspicious anomalies detected</SUSPICIOUS_ANOMALIES>\n";
        } catch (Exception e) {
            return "<SUSPICIOUS_ANOMALIES>UNAVAILABLE</SUSPICIOUS_ANOMALIES>\n";
        }
    }

    private String getInvestmentsContext(User user) {
        try {
            List<Investment> investments = investmentRepo.findByUser(user);
            if (investments != null && !investments.isEmpty()) {
                String investmentsStr = investments.stream()
                    .map(i -> String.format("[%s (%s): Invested ₹%.2f, Current Value ₹%.2f, Returns: %.2f%%]",
                        i.getName(), i.getType(), i.getAmountInvested(), i.getCurrentValue(), 
                        i.getReturns() != null ? i.getReturns() : java.math.BigDecimal.ZERO))
                    .collect(Collectors.joining(", "));
                return String.format("<USER_INVESTMENTS>%s</USER_INVESTMENTS>\n", investmentsStr);
            }
            return "<USER_INVESTMENTS>No active investments recorded</USER_INVESTMENTS>\n";
        } catch (Exception e) {
            return "<USER_INVESTMENTS>UNAVAILABLE</USER_INVESTMENTS>\n";
        }
    }

    private String getCategoriesContext() {
        try {
            List<Category> categories = categoryRepo.findAll();
            if (categories != null && !categories.isEmpty()) {
                String categoriesStr = categories.stream()
                    .map(Category::getName)
                    .distinct()
                    .collect(Collectors.joining(", "));
                return String.format("<TRANSACTION_CATEGORIES>%s (Spending breakdown available)</TRANSACTION_CATEGORIES>\n", categoriesStr);
            }
            return "<TRANSACTION_CATEGORIES>No categories set</TRANSACTION_CATEGORIES>\n";
        } catch (Exception e) {
            return "<TRANSACTION_CATEGORIES>UNAVAILABLE</TRANSACTION_CATEGORIES>\n";
        }
    }
    
    private String getNetWorthContext(Long userId) {
        try {
            var nw = netWorthService.getCurrentNetWorth(userId);
            return String.format("<NET_WORTH>Current: ₹%.2f, Assets: ₹%.2f, Liabilities: ₹%.2f</NET_WORTH>\n",
                nw.getCurrentNetWorth(), nw.getTotalAssets(), nw.getTotalLiabilities());
        } catch (Exception e) {
            log.debug("Net worth unavailable for user {}", userId);
            return "<NET_WORTH>UNAVAILABLE</NET_WORTH>\n";
        }
    }
    
    private String getSavingsContext(Long userId) {
        try {
            var s = netWorthService.getCurrentSavingsRate(userId);
            return String.format("<SAVINGS>Rate: %.1f%%, Income: ₹%.2f, MonthlySavings: ₹%.2f, Status: %s</SAVINGS>\n",
                s.getCurrentSavingsRate(), s.getCurrentMonthlyIncome(), 
                s.getCurrentMonthlySavings(), s.getSavingsStatus());
        } catch (Exception e) {
            return "<SAVINGS>UNAVAILABLE</SAVINGS>\n";
        }
    }
    
    private String getBudgetContext(Long userId) {
        try {
            com.College_project.project.DTOs.BudgetResponse summary = budgetService.getBudgetSummary(userId, LocalDate.now());
            if (summary != null && summary.getAmountLimit() != null) {
                BigDecimal limit = summary.getAmountLimit();
                BigDecimal spent = summary.getSpentAmount() != null ? summary.getSpentAmount() : java.math.BigDecimal.ZERO;
                if (limit.compareTo(java.math.BigDecimal.ZERO) <= 0) {
                    return String.format(
                        "<BUDGET_SUMMARY>Status: NOT_CONFIGURED, Total Limit: ₹%.2f, Spent: ₹%.2f. Do not describe this as over budget; recommend creating a realistic monthly budget.</BUDGET_SUMMARY>\n",
                        limit, spent);
                }
                BigDecimal remaining = limit.subtract(spent);
                double pct = limit.compareTo(java.math.BigDecimal.ZERO) > 0
                    ? spent.doubleValue() / limit.doubleValue() * 100 : 0;
                return String.format(
                    "<BUDGET_SUMMARY>Total Limit: ₹%.2f, Spent: ₹%.2f, Remaining: ₹%.2f, Utilization: %.1f%%</BUDGET_SUMMARY>\n",
                    limit, spent, remaining, pct);
            }
            return "<BUDGET_SUMMARY>No active budgets set for this month.</BUDGET_SUMMARY>\n";
        } catch (Exception e) {
            log.warn("Budget summary unavailable: {}", e.getMessage());
            return "<BUDGET_SUMMARY>UNAVAILABLE</BUDGET_SUMMARY>\n";
        }
    }
    
    private String getBillsContext(Long userId) {
        try {
            List<com.College_project.project.DTOs.BillReminderDTO> bills = billService.getUpcomingBills(userId);
            if (bills != null && !bills.isEmpty()) {
                String billsStr = bills.stream().limit(5)
                    .map(b -> String.format("[%s: ₹%.2f due in %d days on %s]",
                        b.getName(), b.getAmount(), b.getDaysUntilDue(), b.getDueDate()))
                    .collect(Collectors.joining(", "));
                return String.format("<UPCOMING_BILLS>%s</UPCOMING_BILLS>\n", billsStr);
            }
            return "<UPCOMING_BILLS>No pending bills in the next 30 days.</UPCOMING_BILLS>\n";
        } catch (Exception e) {
            return "<UPCOMING_BILLS>UNAVAILABLE</UPCOMING_BILLS>\n";
        }
    }
    
    private String getTransactionsContext(User user) {
        try {
            var txs = transactionRepo.findTop10ByUserOrderByCreatedAtDesc(user);
            if (txs != null && !txs.isEmpty()) {
                String txsStr = txs.stream().limit(5)
                    .map(t -> String.format("[%s: ₹%.2f]", 
                        t.getDescription() != null ? t.getDescription() : "Transaction", 
                        t.getAmount()))
                    .collect(Collectors.joining(" "));
                return String.format("<RECENT_TRANSACTIONS>%s</RECENT_TRANSACTIONS>\n", txsStr);
            }
            return "<RECENT_TRANSACTIONS>No recent transactions</RECENT_TRANSACTIONS>\n";
        } catch (Exception e) {
            return "<RECENT_TRANSACTIONS>UNAVAILABLE</RECENT_TRANSACTIONS>\n";
        }
    }

    private String getSpendingInsightsContext(Long userId, User user) {
        try {
            LocalDate start = LocalDate.now().withDayOfMonth(1);
            LocalDate end = LocalDate.now();
            List<Transaction> txs = transactionRepo.findByUserAndTransactionDateBetween(user, start, end);
            if (txs == null || txs.isEmpty()) {
                txs = transactionRepo.findTop10ByUserOrderByCreatedAtDesc(user);
            }

            if (txs == null || txs.isEmpty()) {
                return "<SPENDING_INSIGHTS>No transaction data available for spending analysis.</SPENDING_INSIGHTS>\n";
            }

            List<Transaction> expenses = txs.stream()
                .filter(t -> t.getType() != null && "EXPENSE".equalsIgnoreCase(t.getType().toString()))
                .filter(t -> t.getAmount() != null)
                .toList();

            BigDecimal totalExpense = expenses.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            double averageDailyExpense = LocalDate.now().getDayOfMonth() > 0
                ? totalExpense.doubleValue() / LocalDate.now().getDayOfMonth()
                : totalExpense.doubleValue();

            var savings = netWorthService.getCurrentSavingsRate(userId);
            BigDecimal monthlySavings = savings.getCurrentMonthlySavings() != null
                ? savings.getCurrentMonthlySavings() : BigDecimal.ZERO;
            BigDecimal monthlyIncome = savings.getCurrentMonthlyIncome() != null
                ? savings.getCurrentMonthlyIncome() : BigDecimal.ZERO;

            String budgetStatus = "UNKNOWN";
            try {
                var budget = budgetService.getBudgetSummary(userId, LocalDate.now());
                if (budget == null || budget.getAmountLimit() == null
                        || budget.getAmountLimit().compareTo(BigDecimal.ZERO) <= 0) {
                    budgetStatus = "NOT_CONFIGURED";
                } else if (budget.getSpentAmount() != null
                        && budget.getSpentAmount().compareTo(budget.getAmountLimit()) > 0) {
                    budgetStatus = "EXCEEDED";
                } else {
                    budgetStatus = "ACTIVE";
                }
            } catch (Exception ignored) {
                budgetStatus = "UNAVAILABLE";
            }

            Map<String, BigDecimal> categoryTotals = new LinkedHashMap<>();
            for (Transaction t : expenses) {
                String category = t.getCategory() != null && t.getCategory().getName() != null
                    ? t.getCategory().getName() : "Uncategorized";
                categoryTotals.merge(category, t.getAmount(), BigDecimal::add);
            }

            String topCategories = categoryTotals.entrySet().stream()
                .sorted(Map.Entry.<String, BigDecimal>comparingByValue().reversed())
                .limit(3)
                .map(e -> String.format("%s ₹%.2f", e.getKey(), e.getValue()))
                .collect(Collectors.joining("; "));

            String highValueExpenses = expenses.stream()
                .sorted(Comparator.comparing(Transaction::getAmount).reversed())
                .limit(3)
                .map(t -> String.format("%s ₹%.2f (%s)",
                    cleanTransactionDescription(t.getDescription()),
                    t.getAmount(),
                    t.getCategory() != null ? t.getCategory().getName() : "Uncategorized"))
                .collect(Collectors.joining("; "));

            String recurringCandidates = expenses.stream()
                .filter(t -> t.isRecurring() || looksLikeSubscription(t.getDescription()))
                .limit(5)
                .map(t -> String.format("%s ₹%.2f", cleanTransactionDescription(t.getDescription()), t.getAmount()))
                .collect(Collectors.joining("; "));

            List<String> recommendations = new ArrayList<>();
            if (monthlySavings.compareTo(BigDecimal.ZERO) < 0) {
                recommendations.add(String.format("Monthly savings are negative by ₹%.2f, so expenses are exceeding available income/savings; first target is to reduce or delay expenses by at least this amount.", monthlySavings.abs()));
            }
            if ("NOT_CONFIGURED".equals(budgetStatus)) {
                recommendations.add("No monthly budget is configured; create category limits before treating spending as over budget.");
            }
            if (!highValueExpenses.isBlank()) {
                recommendations.add("Review the largest expenses first and mark each as essential, deferrable, or avoidable.");
            }
            if (!recurringCandidates.isBlank()) {
                recommendations.add("Audit recurring subscriptions and cancel unused services.");
            }
            if (!topCategories.isBlank()) {
                recommendations.add("Set a monthly cap for the top spending categories instead of listing transactions only.");
            }
            if (averageDailyExpense > 0) {
                recommendations.add(String.format("Use ₹%.2f as the current daily spending pace and set a lower daily target for the rest of the month.", averageDailyExpense));
            }

            return String.format(
                "<SPENDING_INSIGHTS>Period: %s to %s; Monthly Income: ₹%.2f; Monthly Savings: ₹%.2f; Total Expenses Analyzed: ₹%.2f; Average Daily Expense Pace: ₹%.2f; Budget Status: %s; Top Categories: %s; High Value Expenses: %s; Recurring/Subscription Candidates: %s; Coaching Recommendations: %s</SPENDING_INSIGHTS>\n",
                start, end, monthlyIncome, monthlySavings, totalExpense, averageDailyExpense, budgetStatus,
                topCategories.isBlank() ? "None identified" : topCategories,
                highValueExpenses.isBlank() ? "None identified" : highValueExpenses,
                recurringCandidates.isBlank() ? "None identified" : recurringCandidates,
                recommendations.isEmpty() ? "Use transaction data to give practical spending advice." : String.join(" ", recommendations));
        } catch (Exception e) {
            log.warn("Spending insights unavailable: {}", e.getMessage());
            return "<SPENDING_INSIGHTS>UNAVAILABLE</SPENDING_INSIGHTS>\n";
        }
    }

    private String cleanTransactionDescription(String description) {
        if (description == null || description.isBlank()) {
            return "Transaction";
        }
        return description.replaceAll("\\s+", " ").trim();
    }

    private boolean looksLikeSubscription(String description) {
        if (description == null) {
            return false;
        }
        String value = description.toLowerCase();
        return value.contains("netflix")
            || value.contains("spotify")
            || value.contains("prime")
            || value.contains("hotstar")
            || value.contains("youtube")
            || value.contains("subscription")
            || value.contains("monthly")
            || value.contains("auto debit")
            || value.contains("autopay");
    }
    
    private String callOllama(String prompt) {
        // Circuit-breaker: avoid calling Ollama when it's been failing repeatedly
        long now = System.currentTimeMillis();
        if (ollamaCircuitOpenUntil > now) {
            throw new RuntimeException("Ollama circuit open until " + ollamaCircuitOpenUntil);
        }

        String url = ollamaUrl + "/api/generate";
        Map<String, Object> request = new HashMap<>();
        request.put("model", ollamaModel);
        request.put("prompt", prompt);
        request.put("stream", false);
        request.put("options", Map.of("timeout", 120));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

        int maxAttempts = 3;
        long baseDelay = 500; // ms

        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

                if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                    try {
                        JsonNode root = objectMapper.readTree(response.getBody());
                        // success -> reset failure counter
                        ollamaFailureCount.set(0);
                        return root.path("response").asText();
                    } catch (Exception e) {
                        throw new RuntimeException("Failed to parse Ollama response", e);
                    }
                }

                throw new RuntimeException("Ollama returned status: " + response.getStatusCode());

            } catch (Exception e) {
                int failures = ollamaFailureCount.incrementAndGet();
                log.warn("Ollama attempt {}/{} failed: {} (failures={})", attempt, maxAttempts, e.getMessage(), failures);

                if (failures >= OLLAMA_MAX_CONSECUTIVE_FAILURES) {
                    ollamaCircuitOpenUntil = System.currentTimeMillis() + OLLAMA_CIRCUIT_OPEN_MS;
                    log.error("Ollama circuit opened until {} after {} failures", ollamaCircuitOpenUntil, failures);
                }

                if (attempt == maxAttempts) {
                    throw new RuntimeException("Ollama failed after retries: " + e.getMessage(), e);
                }

                // exponential backoff with jitter
                try {
                    long delay = baseDelay * (1L << (attempt - 1));
                    long jitter = ThreadLocalRandom.current().nextLong(0, 200);
                    Thread.sleep(Math.min(delay + jitter, 5000));
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Interrupted while backing off", ie);
                }
            }
        }

        throw new RuntimeException("Unreachable: Ollama retry loop ended unexpectedly");
    }
    
    private String callOpenRouterWithRetry(String prompt) throws Exception {
        int maxRetries = 2;
        int retryDelay = 1000;
        
        for (int i = 0; i < maxRetries; i++) {
            try {
                return callOpenRouter(prompt);
            } catch (RestClientException e) {
                if (i == maxRetries - 1) throw e;
                Thread.sleep(retryDelay * (i + 1));
                log.warn("OpenRouter attempt {} failed, retrying...", i + 1);
            }
        }
        throw new RuntimeException("OpenRouter failed after retries");
    }
    
    private String callOpenRouter(String prompt) {
        String url = "https://openrouter.ai/api/v1/chat/completions";
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", openRouterModel);
        requestBody.put("max_tokens", 1000);
        requestBody.put("temperature", 0.7);
        requestBody.put("messages", List.of(Map.of("role", "user", "content", prompt)));
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);
        
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
        
        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            try {
                JsonNode root = objectMapper.readTree(response.getBody());
                String content = root.path("choices").get(0).path("message").path("content").asText();
                return content.replace("?", "₹");
            } catch (Exception e) {
                throw new RuntimeException("Failed to parse OpenRouter response", e);
            }
        }
        throw new RuntimeException("OpenRouter returned status: " + response.getStatusCode());
    }
    
    private String buildSystemPrompt(String username, String context, String userMessage) {
        String cleanContext = context.replace("?", "₹");
        
        return String.format("""
            You are "SmartBot", the precise AI Financial Advisor for %s.
            
            CRITICAL INSTRUCTIONS:
            - Accuracy is your #1 priority. Do NOT hallucinate or shorten numbers.
            - Use ONLY the exact figures provided in the DATA block below.
            - If the query asks for information or data NOT present in the USER DATA block, or if you do not know the answer, respond with exactly: "Sorry, I don't know." or "Sorry, I do not have that information." Do not make up or estimate any numbers.
            - Keep responses concise (max 300 words).
            - Use ₹ symbol for currency.
            - For advice questions such as improving spending habits, do NOT dump raw data. Use SPENDING_INSIGHTS to give a diagnosis, explain the cause, and provide concrete next actions.
            - Treat questions like "how do you manage daily expenses" as asking how the USER should manage their expenses. Answer with expense analysis and a plan, not a generic explanation.
            - If Budget Status is NOT_CONFIGURED, say no budget is set and recommend creating one. Do NOT call the user over budget when the limit is ₹0.
            - Highlight high-value expenses, recurring subscriptions, negative savings, and top categories when present.
            
            USER DATA (TRUSTED - USE ONLY THIS):
            %s
            
            USER QUERY:
            %s
            
            RESPONSE FORMAT:
            1. Start with: "Hello %s! Here is your financial breakdown:"
            2. Use bullet points (•) with spaces.
            3. Include Net Worth, Savings Rate if relevant; for coaching questions, prioritize recommendations over transaction lists.
            4. End with: SUGGESTED_QUESTIONS: ["Question 1", "Question 2"]
            
            Style: Professional, clear, concise.
            """, username, cleanContext, userMessage, username);
    }
    
    private String buildSystemPromptWithMemory(String username, String context, 
                                                String conversationContext, 
                                                String relevantPastContext, 
                                                String userMessage,
                                                String actionResult) {
        String cleanContext = context.replace("?", "₹");
        
        String actionResultBlock = "";
        if (actionResult != null && !actionResult.isEmpty()) {
            actionResultBlock = "\n<SYSTEM_ACTION_RESULT>\n" + actionResult + "\n</SYSTEM_ACTION_RESULT>\n"
                + "\nIMPORTANT: The database action has ALREADY been successfully completed. "
                + "Do NOT ask the user if they want to perform this action or suggest performing it. "
                + "Instead, confirm the action in a warm, natural, and highly conversational way. "
                + "Incorporate details they mentioned (e.g. description, emotional context) and offer a brief personalized financial tip or encouragement.\n";
        }
        
        return String.format("""
            You are "SmartBot", the highly intelligent Strategic Wealth Coach and AI Financial Advisor for %s.
            
            CORE MISSION:
            - Help %s achieve financial freedom by providing strategic, data-driven insights.
            - You have access to their real-time financial data (Balance, Net Worth, Budgets, Transactions).
            - You excel at providing "Out of the Box" advice on improving savings, optimizing investments, and managing debt.

            QUESTION UNDERSTANDING GUIDELINES:
            - Before answering, identify what the user is really asking: information lookup, financial analysis, advice, action request, explanation, or emotional support.
            - Read the full USER QUERY carefully and use CONVERSATION HISTORY to resolve references like "that", "this", "last one", or "my previous question".
            - Answer the exact question asked first, then add helpful context only if it improves the answer.
            - If the query is unclear, incomplete, or could mean multiple things, ask one concise clarifying question instead of guessing.
            - If the user asks for a comparison, recommendation, or decision, state the key assumption you are using before giving the answer.
            - Do not provide generic financial advice when the user asked for a specific number, status, explanation, or app action.

            STRATEGIC ADVICE GUIDELINES:
            - If the user asks how to improve their savings rate, look at their specific spending and budget data and suggest where they can cut back.
            - If the user asks how to manage daily expenses, improve spending habits, spend less, reduce expenses, or control costs, use SPENDING_INSIGHTS first. Give a short diagnosis, then 4-6 personalized actions.
            - For daily expense management, mention the average daily expense pace when available and suggest a lower daily/weekly cap.
            - For spending advice, do not list recent transactions as the main answer. Mention only the largest or recurring items that explain the advice.
            - If Budget Status is NOT_CONFIGURED, state that no budget is set; do not say spending exceeded a ₹0 budget. Recommend a starter budget using the user's top categories.
            - If monthly savings are negative, explain that expenses exceed available savings/income and suggest a recovery target at least equal to the negative savings amount.
            - Treat bank-name transaction descriptions cautiously: say they may be transfers, loan payments, deposits, or real expenses and ask the user to categorize them if unclear.
            - If they ask about investments, explain the benefits of SIPs, diversification, and compound interest using their current portfolio as a reference.
            - Be proactive: if you notice a negative trend in their data, point it out gently and suggest a fix.

            EMOTIONAL INTELLIGENCE GUIDELINES:
            - First infer the user's emotional state from their message: confused, anxious, frustrated, excited, disappointed, stressed, neutral, or confident.
            - Match your tone to that emotion before giving financial advice.
            - If the user sounds anxious, stressed, or disappointed, start with calm reassurance and one small next action.
            - If the user sounds confused, simplify the explanation and avoid jargon.
            - If the user sounds frustrated, acknowledge the friction briefly and focus on fixing the issue.
            - If the user sounds excited or confident, be encouraging while still checking risks and numbers.
            - Never shame the user about spending, debt, income, or mistakes.
            - Do not mention the detected emotion as a label unless it is helpful. Show empathy naturally.
            
            CRITICAL INSTRUCTIONS:
            - ACCURACY: Use ONLY the exact figures provided in the DATA block.
            - UNKNOWN INFORMATION: If the user query refers to entities, data, or questions for which no relevant information exists in the DATA SOURCE block below, respond with exactly: "Sorry, I don't know." or "Sorry, I do not have that information." Do not hallucinate or make up any figures.
            - PERSONALIZATION: Always tailor your advice to %s's unique numbers.
            - ACTIONABLE ADVICE: End your response with a clear "Next Step" or "Strategic Pro-Tip".
            - QUALITY: Keep internal/technical status messages out of user-facing coaching unless they are directly relevant.
            - CONTEXT: Use the CONVERSATION HISTORY to maintain a continuous advisory relationship.
            - CURRENCY: Always use the ₹ symbol.
            
            - HIGHLIGHTING: Wrap important numbers, risks, warnings, due dates, decisions, and next actions in **bold** so the app can highlight them.

            DATA SOURCE (TRUSTED):
            %s
            %s
            
            CONVERSATION HISTORY:
            %s
            
            RELEVANT MEMORY:
            %s
            
            USER QUERY:
            %s
            
            RESPONSE FORMAT:
            1. Be warm, professional, and coach-like.
            2. Start by directly addressing the user's main question in one sentence.
            3. Include one short empathetic sentence that fits the user's tone when appropriate.
            4. For complex advice, explain the "Why" behind your recommendation.
            5. Use bullet points for structured data or steps.
            6. End with SUGGESTED_QUESTIONS: ["Question A", "Question B"] to guide their next move.
            """, username, username, username, cleanContext, actionResultBlock, conversationContext, relevantPastContext, userMessage);
    }
    
    private boolean validateUser(Long userId) {
        if (userId == null) {
            log.error("User ID is null");
            return false;
        }
        return true;
    }
    
    private User getUserOrThrow(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found: " + userId));
    }
    
    private boolean checkRateLimit(Long userId) {
        Long lastRequest = lastRequestTime.get(userId);
        long now = System.currentTimeMillis();
        
        if (lastRequest != null && (now - lastRequest) < MIN_REQUEST_INTERVAL_MS) {
            log.warn("Rate limit exceeded for user {}", userId);
            return false;
        }
        
        // Do NOT update the timestamp here. Caller should record only on successful processing
        return true;
    }

    // Record a successful request timestamp (call after a successful response)
    public void markRequestCompleted(Long userId) {
        try {
            lastRequestTime.put(userId, System.currentTimeMillis());
        } catch (Exception e) {
            log.warn("Failed to mark request time for user {}: {}", userId, e.getMessage());
        }
    }
    
    private String getMinimalContext() {
        return "<USER_FINANCIAL_PROFILE>\n" +
               "<NET_WORTH>UNAVAILABLE</NET_WORTH>\n" +
               "<SAVINGS>UNAVAILABLE</SAVINGS>\n" +
               "<CURRENT_DATE>" + LocalDate.now() + "</CURRENT_DATE>\n" +
               "</USER_FINANCIAL_PROFILE>\n";
    }
    
    private void streamFallbackDirect(Long userId, User user, String userMessage, Consumer<String> chunkConsumer) {
        String fallbackResponse = generateSmartFallbackResponse(userId, user, userMessage);
        int chunkSize = 12;
        for (int i = 0; i < fallbackResponse.length(); i += chunkSize) {
            int end = Math.min(i + chunkSize, fallbackResponse.length());
            chunkConsumer.accept(fallbackResponse.substring(i, end));
            try {
                Thread.sleep(20);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                break;
            }
        }
    }

    private String generateSmartFallbackResponse(Long userId, User user, String query) {
        String lowerQuery = query.toLowerCase();
        
        // CRITICAL FIX: Check if this is a non-financial query
        if (!isFinancialQuery(lowerQuery)) {
            return "Sorry, I don't know how to help with that. I'm your financial advisor.\n\n" +
                   "I can help with:\n" +
                   "• Your balance and net worth\n" +
                   "• Spending and income tracking\n" +
                   "• Budget management\n" +
                   "• Bill reminders and payments\n" +
                   "• Investment advice\n" +
                   "• Anomaly detection for suspicious transactions\n" +
                   "• Financial education (SIP, mutual funds, etc.)\n\n" +
                   "Try asking: \"What's my balance?\" or \"How much did I spend this month?\"";
        }
        
        StringBuilder response = new StringBuilder();
        String username = user.getName() != null ? user.getName() : "there";
        
        response.append("Hello ").append(username).append("! Here is your real-time financial breakdown:\n\n");
        
        double netWorth = 0.0, assets = 0.0, liabilities = 0.0;
        try {
            var nw = netWorthService.getCurrentNetWorth(userId);
            netWorth = nw.getCurrentNetWorth().doubleValue();
            assets = nw.getTotalAssets().doubleValue();
            liabilities = nw.getTotalLiabilities().doubleValue();
        } catch (Exception e) {}
        
        double savingsRate = 0.0, income = 0.0, monthlySavings = 0.0;
        String savingsStatus = "Neutral";
        try {
            var s = netWorthService.getCurrentSavingsRate(userId);
            if (s.getCurrentSavingsRate() != null) {
                savingsRate = s.getCurrentSavingsRate().doubleValue();
            }
            if (s.getCurrentMonthlyIncome() != null) {
                income = s.getCurrentMonthlyIncome().doubleValue();
            }
            if (s.getCurrentMonthlySavings() != null) {
                monthlySavings = s.getCurrentMonthlySavings().doubleValue();
            }
            savingsStatus = s.getSavingsStatus();
        } catch (Exception e) {}

        List<com.College_project.project.models.Transaction> transactions = null;
        try {
            transactions = transactionRepo.findTop10ByUserOrderByCreatedAtDesc(user);
        } catch (Exception e) {}

        List<?> bills = null;
        try {
            bills = billService.getUpcomingBills(userId);
        } catch (Exception e) {}

        boolean matched = false;

        if (lowerQuery.contains("net worth") || lowerQuery.contains("networth") || lowerQuery.contains("assets") || lowerQuery.contains("liabilities") || lowerQuery.contains("debt")) {
            matched = true;
            response.append("• **Net Worth Status**:\n");
            response.append("  - Your current Net Worth is **₹").append(String.format("%,.2f", netWorth)).append("**.\n");
            response.append("  - Total Assets tracked: **₹").append(String.format("%,.2f", assets)).append("**.\n");
            response.append("  - Total Outstanding Liabilities/Debts: **₹").append(String.format("%,.2f", liabilities)).append("**.\n\n");
            response.append("• **Strategic Pro-Tip**:\n");
            if (liabilities > 0) {
                response.append("  - Focus on reducing your liabilities to increase your net worth. Prioritize high-interest debts first.\n");
            } else {
                response.append("  - Great job keeping liabilities at zero! Consider directing your idle assets into mutual funds or SIPs.\n");
            }
        }
        
        if (lowerQuery.contains("saving") || lowerQuery.contains("income") || lowerQuery.contains("salary") || lowerQuery.contains("save")) {
            matched = true;
            response.append("• **Savings & Income Analytics**:\n");
            response.append("  - Your current monthly savings rate is **").append(String.format("%.1f", savingsRate)).append("%**.\n");
            response.append("  - Total monthly income detected: **₹").append(String.format("%,.2f", income)).append("**.\n");
            response.append("  - Current monthly savings: **₹").append(String.format("%,.2f", monthlySavings)).append("**.\n");
            response.append("  - Savings Health: **").append(savingsStatus).append("**.\n\n");
            response.append("• **Next Step**:\n");
            if (savingsRate < 20.0) {
                response.append("  - Your savings rate is below the recommended 20%. Try setting up a strict budget for entertainment or dining out to boost your savings.\n");
            } else {
                response.append("  - You have a strong savings rate! Maintain this momentum and allocate a portion to an automated monthly SIP.\n");
            }
        }

        if (isExpenseManagementQuery(lowerQuery)) {
            matched = true;
            response.append("• **Spending Habit Diagnosis**:\n");
            if (monthlySavings < 0) {
                response.append("  - Your monthly savings are negative by **₹")
                        .append(String.format("%,.2f", Math.abs(monthlySavings)))
                        .append("**, which means expenses are currently outrunning your available savings.\n");
            } else {
                response.append("  - Your monthly savings are **₹")
                        .append(String.format("%,.2f", monthlySavings))
                        .append("**. The goal is to protect this amount before increasing discretionary spending.\n");
            }

            if (transactions != null && !transactions.isEmpty()) {
                List<com.College_project.project.models.Transaction> expenses = transactions.stream()
                    .filter(t -> t.getAmount() != null)
                    .filter(t -> t.getType() != null && "EXPENSE".equalsIgnoreCase(t.getType().toString()))
                    .sorted(Comparator.comparing(com.College_project.project.models.Transaction::getAmount).reversed())
                    .limit(3)
                    .toList();
                if (!expenses.isEmpty()) {
                    response.append("  - Review your largest recent expenses first: ");
                    response.append(expenses.stream()
                        .map(t -> "**" + (t.getDescription() != null ? t.getDescription() : "Transaction")
                            + " ₹" + String.format("%,.2f", t.getAmount()) + "**")
                        .collect(Collectors.joining(", ")))
                        .append(".\n");
                }

                List<com.College_project.project.models.Transaction> recurring = transactions.stream()
                    .filter(t -> t.getAmount() != null)
                    .filter(t -> t.isRecurring() || looksLikeSubscription(t.getDescription()))
                    .limit(3)
                    .toList();
                if (!recurring.isEmpty()) {
                    response.append("  - Subscription candidates found: ");
                    response.append(recurring.stream()
                        .map(t -> "**" + (t.getDescription() != null ? t.getDescription() : "Subscription")
                            + " ₹" + String.format("%,.2f", t.getAmount()) + "**")
                        .collect(Collectors.joining(", ")))
                        .append(". Cancel or pause anything unused.\n");
                }
            }

            response.append("\n• **Action Plan**:\n");
            response.append("  - Create a monthly budget first, because a **₹0.00** budget means no limit is configured, not that every rupee is overspending.\n");
            response.append("  - Set category caps for food, subscriptions, and discretionary purchases, then check progress weekly.\n");
            response.append("  - For every large transaction, label it as **essential**, **delayable**, or **avoidable** before spending again.\n");
            response.append("  - Set a recovery target of at least **₹").append(String.format("%,.2f", Math.max(0, Math.abs(monthlySavings)))).append("** this month to move savings back toward positive.\n");
            response.append("  - If a transaction looks like a bank transfer or loan movement, categorize it correctly so it is not treated as normal spending.\n");
        }
        
        if ((lowerQuery.contains("transaction") || lowerQuery.contains("spent") || lowerQuery.contains("spend") || lowerQuery.contains("history") || lowerQuery.contains("recent") || lowerQuery.contains("purchase") || lowerQuery.contains("expense"))
                && !isExpenseManagementQuery(lowerQuery)) {
            matched = true;
            response.append("• **Recent Transactions**:\n");
            if (transactions != null && !transactions.isEmpty()) {
                for (int i = 0; i < Math.min(5, transactions.size()); i++) {
                    var t = transactions.get(i);
                    String typeSign = t.getType() != null && t.getType().toString().equalsIgnoreCase("INCOME") ? "+" : "-";
                    response.append("  - **").append(t.getDescription() != null ? t.getDescription() : "Transaction").append("** (")
                            .append(t.getCategory() != null ? t.getCategory().getName() : "General").append("): ")
                            .append(typeSign).append("₹").append(String.format("%,.2f", t.getAmount())).append("\n");
                }
            } else {
                response.append("  - No recent transactions found in your database.\n");
            }
            response.append("\n• **Strategic Pro-Tip**:\n");
            response.append("  - Review your frequent small transactions. Micro-spending on food or subscriptions often adds up to a significant portion of monthly expenses.\n");
        }
        
        if (lowerQuery.contains("bill") || lowerQuery.contains("upcoming") || lowerQuery.contains("reminder") || lowerQuery.contains("due") || lowerQuery.contains("pending")) {
            matched = true;
            response.append("• **Upcoming Bills & Reminders**:\n");
            if (bills != null && !bills.isEmpty()) {
                response.append("  - You have **").append(bills.size()).append("** upcoming bills tracked in the system.\n");
                response.append("  - Please check the **Bill Reminders** section on the dashboard to view dates, payment links, and due amounts.\n");
            } else {
                response.append("  - Great news! You have no pending bills due soon.\n");
            }
            response.append("\n• **Next Step**:\n");
            response.append("  - Set up auto-debit for your recurring bills to avoid any late fees and improve your credit profile.\n");
        }
        
        if (lowerQuery.contains("budget") || lowerQuery.contains("limit")) {
            matched = true;
            response.append("• **Budget Insights**:\n");
            try {
                com.College_project.project.DTOs.BudgetResponse budgetSummary = budgetService.getBudgetSummary(userId, java.time.LocalDate.now());
                if (budgetSummary != null && budgetSummary.getAmountLimit() != null) {
                    java.math.BigDecimal limit = budgetSummary.getAmountLimit();
                    java.math.BigDecimal spent = budgetSummary.getSpentAmount() != null ? budgetSummary.getSpentAmount() : java.math.BigDecimal.ZERO;
                    java.math.BigDecimal remaining = limit.subtract(spent);
                    double pct = limit.compareTo(java.math.BigDecimal.ZERO) > 0
                        ? spent.doubleValue() / limit.doubleValue() * 100 : 0;
                    response.append(String.format("  - Here is your current budget data: Total Limit: ₹%.2f, Spent: ₹%.2f, Remaining: ₹%.2f, Utilization: %.1f%%\n", limit, spent, remaining, pct));
                } else {
                    response.append("  - No active budget limits have been created yet.\n");
                }
            } catch (Exception e) {
                response.append("  - Budget service is temporarily unavailable, but you can configure limits in the **Budgets** section.\n");
            }
            response.append("\n• **Next Step**:\n");
            response.append("  - Keep your overall spending under **80%** of your budget limits to ensure you hit your savings target.\n");
        }

        if (lowerQuery.contains("invest") || lowerQuery.contains("sip") || lowerQuery.contains("mutual fund") || lowerQuery.contains("advice") || lowerQuery.contains("grow") || lowerQuery.contains("wealth") || lowerQuery.contains("stock")) {
            matched = true;
            response.append("• **Investment & Wealth Growth Advice**:\n");
            response.append("  - Based on your net worth of **₹").append(String.format("%,.2f", netWorth)).append("** and monthly savings rate of **").append(String.format("%.1f", savingsRate)).append("%**:\n");
            response.append("  - **Emergency Fund**: Ensure you have at least **3 to 6 months** of living expenses (approx. **₹").append(String.format("%,.2f", (income - monthlySavings) * 4)).append("**) in a liquid savings account.\n");
            response.append("  - **SIP Allocation**: Direct 60% of your savings into diversified equity mutual funds via systematic investment plans (SIP).\n");
            response.append("  - **Debt Control**: Prioritize paying off debts before initiating aggressive investment strategies.\n\n");
            response.append("• **Strategic Pro-Tip**:\n");
            response.append("  - Compounding is powerful. An investment of just **₹5,000/month** at 12% return grows to over **₹4.1 Lakhs** in 5 years!\n");
        }

        if (!matched) {
            response.append("• **Your Financial Overview**:\n");
            response.append("  - Net Worth: **₹").append(String.format("%,.2f", netWorth)).append("**\n");
            response.append("  - Monthly Savings Rate: **").append(String.format("%.1f", savingsRate)).append("%**\n");
            response.append("  - Current Monthly Income: **₹").append(String.format("%,.2f", income)).append("**\n");
            response.append("  - Current Monthly Savings: **₹").append(String.format("%,.2f", monthlySavings)).append("**\n\n");
            response.append("• **Quick Insights**:\n");
            if (savingsRate < 20.0) {
                response.append("  - Your savings rate is currently **").append(String.format("%.1f", savingsRate)).append("%**. Consider using our **Budgeting tool** to monitor expenses and find places to save.\n");
            } else {
                response.append("  - Your savings rate of **").append(String.format("%.1f", savingsRate)).append("%** is excellent! You can explore the **Investments** page for growth recommendations.\n");
            }
            if (liabilities > 0) {
                response.append("  - You have **₹").append(String.format("%,.2f", liabilities)).append("** in liabilities. Focus on high-interest repayment plans first.\n");
            }
        }
        
        response.append("\nSUGGESTED_QUESTIONS: [\"Show my recent transactions\", \"How is my net worth?\", \"Give me investment advice\", \"What is my savings rate?\"]");
        
        return response.toString();
    }

    private String getFallbackResponse() {
        return "I apologize, but I'm experiencing technical difficulties. " +
               "Please try again in a few minutes. " +
               "You can check your dashboard for financial insights in the meantime.";
    }

    private String generateFinancialReportFallback(Long userId, User user) {
        try {
            FinancialHealthDTO health = financialHealthService.calculateFinancialHealth(userId);
            StringBuilder report = new StringBuilder();
            report.append("AI FINANCIAL INSIGHTS REPORT\n\n");
            report.append("Snapshot:\n");
            report.append("- Your current financial health score is ")
                    .append(health.getOverallScore()).append("/100");
            if (health.getStatus() != null) {
                report.append(" (").append(health.getStatus()).append(")");
            }
            report.append(".\n");
            if (health.getSummary() != null && !health.getSummary().isBlank()) {
                report.append("- ").append(health.getSummary()).append("\n");
            }

            report.append("\nKey Risks:\n");
            if (health.getWeaknesses() != null && !health.getWeaknesses().isEmpty()) {
                for (String weakness : health.getWeaknesses()) {
                    report.append("- Improve ").append(weakness).append("; this is lowering the total score.\n");
                }
            } else {
                report.append("- No major risk category is currently flagged, but this depends on complete transaction, bill, budget, and account data.\n");
            }

            report.append("\nSmart Actions:\n");
            if (health.getRecommendations() != null && !health.getRecommendations().isEmpty()) {
                for (String recommendation : health.getRecommendations()) {
                    report.append("- ").append(recommendation).append("\n");
                }
            } else {
                report.append("- Keep transactions, budgets, bills, and investments updated so future reports stay accurate.\n");
            }

            report.append("\nConfidence:\n");
            report.append("- Medium. The report is grounded in your app data, but some categories depend on recent transaction completeness.\n");

            report.append("\nNote:\n");
            report.append("- This report is an AI backup summary based on user-entered and linked data, not certified financial advice.");
            return report.toString();
        } catch (Exception e) {
            log.warn("AI report fallback failed for user {}: {}", user.getUserId(), e.getMessage());
            return getFallbackResponse();
        }
    }

    private String generateSavingsRateImprovementFallback(com.College_project.project.DTOs.SavingsRateDTO savings,
                                                          String topExpenseCategories) {
        BigDecimal rate = savings.getCurrentSavingsRate() != null ? savings.getCurrentSavingsRate() : BigDecimal.ZERO;
        BigDecimal income = savings.getCurrentMonthlyIncome() != null ? savings.getCurrentMonthlyIncome() : BigDecimal.ZERO;
        BigDecimal expenses = savings.getCurrentMonthlyExpenses() != null ? savings.getCurrentMonthlyExpenses() : BigDecimal.ZERO;
        BigDecimal monthlySavings = savings.getCurrentMonthlySavings() != null ? savings.getCurrentMonthlySavings() : BigDecimal.ZERO;

        StringBuilder advice = new StringBuilder();
        advice.append("AI SAVINGS RATE IMPROVEMENT PLAN\n\n");
        advice.append("Current Snapshot:\n");
        advice.append("- Your current savings rate is ").append(rate).append("%.\n");
        advice.append("- Monthly income is ₹").append(income)
                .append(", expenses are ₹").append(expenses)
                .append(", and monthly savings are ₹").append(monthlySavings).append(".\n\n");

        advice.append("Biggest Opportunities:\n");
        if (topExpenseCategories != null && !topExpenseCategories.isBlank()) {
            advice.append("- Review these high-spend categories first: ").append(topExpenseCategories).append(".\n");
        } else {
            advice.append("- Add or categorize more transactions so the app can identify specific spending patterns.\n");
        }
        if (rate.compareTo(BigDecimal.ZERO) < 0) {
            advice.append("- Your expenses are higher than income, so the first goal is to move savings back above 0%.\n");
        } else if (rate.compareTo(new BigDecimal("20")) < 0) {
            advice.append("- Your rate is below the common 20% savings benchmark, so small expense cuts can make a visible difference.\n");
        } else {
            advice.append("- Your savings rate is healthy; the opportunity is to protect it and automate investing/saving.\n");
        }

        advice.append("\nAction Plan:\n");
        advice.append("- Set a category budget for the top 2 spending categories this month.\n");
        advice.append("- Move a fixed amount to savings immediately after income is received.\n");
        advice.append("- Pause or reduce non-essential recurring expenses for one billing cycle.\n");
        advice.append("- Review large expenses before purchase and delay anything non-urgent by 48 hours.\n\n");

        advice.append("Target:\n");
        advice.append("- Aim to improve by 5 percentage points next month, then work toward 20% if your income supports it.\n\n");
        advice.append("Note:\n");
        advice.append("- This depends on the accuracy of your user-entered or linked account data.");
        return advice.toString();
    }

    private boolean isExpenseManagementQuery(String lowerQuery) {
        boolean mentionsExpenses = lowerQuery.contains("spending")
            || lowerQuery.contains("expense")
            || lowerQuery.contains("expenses")
            || lowerQuery.contains("spend")
            || lowerQuery.contains("cost")
            || lowerQuery.contains("costs");

        boolean asksForManagement = lowerQuery.contains("manage")
            || lowerQuery.contains("management")
            || lowerQuery.contains("daily")
            || lowerQuery.contains("weekly")
            || lowerQuery.contains("habit")
            || lowerQuery.contains("improve")
            || lowerQuery.contains("reduce")
            || lowerQuery.contains("control")
            || lowerQuery.contains("advice")
            || lowerQuery.contains("cut")
            || lowerQuery.contains("budgeting");

        return mentionsExpenses && asksForManagement;
    }
    
    // Method to clear conversation history
    public void clearConversationHistory(Long userId) {
        memoryService.clearSessionCache(userId);
        userConversations.remove(userId);
        contextCache.remove(userId);
        lastRequestTime.remove(userId);
        log.info("Cleared conversation history for user: {}", userId);
    }
    
    // Method to get chat summary
    public Map<String, Object> getChatSummary(Long userId) {
        return memoryService.getUserChatSummary(userId);
    }
    
    // ========== HELPER METHODS FOR NON-FINANCIAL QUERY DETECTION ==========
    
    private boolean isFinancialQuery(String lowerQuery) {
        String[] financialKeywords = {
            "balance", "money", "funds", "net worth", "networth", "wealth",
            "savings", "save", "income", "earn", "salary", "spending", "spend",
            "expense", "bill", "payment", "budget", "invest", "investment",
            "portfolio", "sip", "mutual fund", "transaction", "category",
            "alert", "anomal", "suspicious", "fraud", "debt", "loan", "credit",
            "financial", "wealth", "asset", "liability", "cash", "account",
            "recurring", "reminder", "payment"
        };
        
        for (String keyword : financialKeywords) {
            if (lowerQuery.contains(keyword)) {
                return true;
            }
        }
        
        return false;
    }
    
    private String getAnomaliesForResponse(Long userId, User user) {
        try {
            List<Anomaly> anomalies = anomalyRepo.findByUser(user);
            if (anomalies == null || anomalies.isEmpty()) {
                return "✅ Great news! No suspicious anomalies detected in your transactions.";
            }
            
            StringBuilder response = new StringBuilder();
            response.append("🚨 **Suspicious Anomalies Detected**\n\n");
            
            int count = 0;
            for (Anomaly anomaly : anomalies) {
                if (count >= 5) break;
                
                String icon = "🔴";
                if (anomaly.getSeverity() != null) {
                    if (anomaly.getSeverity().toString().equalsIgnoreCase("LOW")) icon = "🟡";
                    else if (anomaly.getSeverity().toString().equalsIgnoreCase("MEDIUM")) icon = "🟠";
                    else if (anomaly.getSeverity().toString().equalsIgnoreCase("HIGH")) icon = "🔴";
                }
                
                response.append(String.format("%s **%s** (Severity: %s)\n", 
                    icon, anomaly.getReason(), anomaly.getSeverity()));
                
                if (anomaly.getResolutionNote() != null && !anomaly.getResolutionNote().isEmpty()) {
                    response.append(String.format("   ✅ Resolved: %s\n", anomaly.getResolutionNote()));
                } else {
                    response.append("   ⏳ Status: Under Investigation\n");
                }
                response.append("\n");
                count++;
            }
            
            response.append("\n💡 **Recommendation:** Review these transactions carefully. If you recognize them, you can mark them as safe. If not, consider contacting your bank.");
            
            return response.toString();
            
        } catch (Exception e) {
            log.error("Error fetching anomalies for user {}", userId, e);
            return "I couldn't fetch your anomaly data. Please try again later.";
        }
    }
    
    private static class CachedContext {
        final String context;
        final long timestamp;
        
        CachedContext(String context, long timestamp) {
            this.context = context;
            this.timestamp = timestamp;
        }
        
        boolean isExpired(long ttlMs) {
            return System.currentTimeMillis() - timestamp > ttlMs;
        }
    }
}
