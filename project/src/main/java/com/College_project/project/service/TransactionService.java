package com.College_project.project.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.College_project.project.DTOs.MonthlySummaryDTO;
import com.College_project.project.DTOs.TransactionFilterRequest;
import com.College_project.project.DTOs.TransactionFilterResponse;
import com.College_project.project.DTOs.TransactionRequest;
import com.College_project.project.DTOs.TransactionResponse;
import com.College_project.project.enums.AlertType;
import com.College_project.project.enums.TransactionType;
import com.College_project.project.models.BankAccount;
import com.College_project.project.models.Category;
import com.College_project.project.models.Transaction;
import com.College_project.project.models.User;
import com.College_project.project.repository.CategoryRepository;
import com.College_project.project.repository.OcrDocumentRepository;
import com.College_project.project.repository.UserRepository;
import com.College_project.project.repository.bankAccountRepository;
import com.College_project.project.repository.transactionRepository;
import com.College_project.project.repository.anomalyRepository;

@Service
public class TransactionService {
    
    private static final Logger log = LoggerFactory.getLogger(TransactionService.class);
    
    @Autowired
    private transactionRepository transactionRepository;
    
    @Autowired
    private bankAccountRepository bankAccountRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private CategorizationService categorizationService;

    @Autowired
    private BudgetService budgetService;

    @Autowired
    private OcrDocumentRepository ocrDocumentRepository;

    @Autowired
    private anomalyRepository anomalyRepository;

    @Autowired
    private AnomalyDetectionService anomalyDetectionService;

    @Autowired
    private AlertService alertService;

    @Transactional
    public Transaction addTransaction(Long userId, Long accountId, TransactionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        BankAccount bankAccount = bankAccountRepository.findById(accountId)
                .filter(acc -> acc.getUser().getUserId().equals(userId))
                .orElseThrow(() -> new RuntimeException("Bank account not found"));
        
        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setBankAccount(bankAccount);
        transaction.setAmount(request.getAmount());
        transaction.setType(request.getType());
        transaction.setDescription(request.getDescription());
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setLocation(request.getLocation());
        transaction.setCreatedAt(LocalDateTime.now());
        transaction.setStatus("COMPLETED");
        
        // Auto-categorize if category not provided
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            transaction.setCategory(category);
        } else {
            Category autoCategory = categorizationService.categorizeTransaction(request.getDescription());
            transaction.setCategory(autoCategory);
        }
        
        // Update account balance
        updateAccountBalance(bankAccount, request.getAmount(), request.getType());
        
        Transaction savedTransaction = transactionRepository.save(transaction);

        alertService.createAlert(
                user,
                AlertType.TRANSACTION_UPDATE,
                String.format("%s transaction recorded: Rs %s for %s",
                        savedTransaction.getType(), savedTransaction.getAmount(), savedTransaction.getDescription()),
                "/transactions");

        // Trigger Anomaly Detection
        anomalyDetectionService.detectAnomalies(savedTransaction);

        // Automatically trigger budget update and alert check if it's an expense
        if (savedTransaction.getType() == TransactionType.EXPENSE) {
            LocalDate budgetMonth = savedTransaction.getTransactionDate().withDayOfMonth(1);
            budgetService.updateBudgetSpending(userId, savedTransaction.getCategory().getCategoryId(), budgetMonth);
        }

        return savedTransaction;
    }
    
    private void updateAccountBalance(BankAccount account, BigDecimal amount, TransactionType type) {
        BigDecimal currentBalance = account.getCurrentBalance();
        if (type == TransactionType.EXPENSE) {
            if (currentBalance.compareTo(amount) < 0) {
                log.warn("Warning: Account {} is entering negative balance.", account.getAccountId());
            }
            account.setCurrentBalance(currentBalance.subtract(amount));
        } else {
            account.setCurrentBalance(currentBalance.add(amount));
        }
        account.setLastSyncedAt(LocalDateTime.now());
        bankAccountRepository.save(account);
    }
    

    // Add this method to your TransactionService class
public BigDecimal getTotalIncome(Long userId, LocalDate startDate, LocalDate endDate) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
    
    BigDecimal income = transactionRepository.sumAmountByUserAndTypeAndDateRange(
            user, TransactionType.INCOME, startDate, endDate);
    
    return income != null ? income : BigDecimal.ZERO;
}


    @Transactional(readOnly = true)
    public List<TransactionResponse> getUserTransactions(Long userId, LocalDate startDate, LocalDate endDate) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            List<Transaction> transactions;
            if (startDate != null && endDate != null) {
                transactions = transactionRepository.findByUserAndTransactionDateBetween(user, startDate, endDate);
            } else {
                // Limit to last 100 transactions to prevent memory issues
                Pageable pageable = PageRequest.of(0, 100, Sort.by("transactionDate").descending());
                transactions = transactionRepository.findByUser(user, pageable).getContent();
            }
            
            // Convert to DTO to avoid JSON serialization issues
            return transactions.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            log.error("Error fetching user transactions", e);
            throw new RuntimeException("Failed to fetch transactions: " + e.getMessage());
        }
    }
    
    public BigDecimal getTotalSpending(Long userId, LocalDate startDate, LocalDate endDate) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        BigDecimal spending = transactionRepository.sumAmountByUserAndTypeAndDateRange(
                user, TransactionType.EXPENSE, startDate, endDate);
        
        return spending != null ? spending : BigDecimal.ZERO;
    }

    @Transactional(readOnly = true)
    public TransactionFilterResponse getFilteredTransactions(Long userId, TransactionFilterRequest filterRequest) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Build sort object
            Sort sort = Sort.by(Sort.Direction.fromString(
                filterRequest.getSortDirection() != null ? filterRequest.getSortDirection() : "DESC"),
                filterRequest.getSortBy() != null ? filterRequest.getSortBy() : "transactionDate"
            );
            
            // Create pageable object with max size limit
            int pageSize = Math.min(filterRequest.getSize(), 100); // Max 100 per page
            Pageable pageable = PageRequest.of(
                filterRequest.getPage(),
                pageSize,
                sort
            );
            
            // Prepare filter parameters
            String search = filterRequest.getSearch();
            TransactionType type = filterRequest.getType();
            Long categoryId = filterRequest.getCategoryId();
            LocalDate startDate = filterRequest.getStartDate();
            LocalDate endDate = filterRequest.getEndDate();
            Long accountId = filterRequest.getAccountId();
            BigDecimal minAmount = filterRequest.getMinAmount() != null ? 
                BigDecimal.valueOf(filterRequest.getMinAmount()) : null;
            BigDecimal maxAmount = filterRequest.getMaxAmount() != null ? 
                BigDecimal.valueOf(filterRequest.getMaxAmount()) : null;
            
            // Execute query
            Page<Transaction> transactionPage = transactionRepository.findTransactionsWithFilters(
                user, search, type, categoryId, startDate, endDate, accountId, minAmount, maxAmount, pageable
            );
            
            // Get summary statistics
            BigDecimal totalIncome = transactionRepository.getTotalIncomeForFilters(
                user, search, categoryId, startDate, endDate
            );
            BigDecimal totalExpense = transactionRepository.getTotalExpenseForFilters(
                user, search, categoryId, startDate, endDate
            );
            
            // Get most common category
            List<Object[]> categoryStats = transactionRepository.getMostCommonCategory(
                user, search, startDate, endDate
            );
            String mostCommonCategory = categoryStats.isEmpty() ? "N/A" : (String) categoryStats.get(0)[0];
            
            // Build response
            TransactionFilterResponse response = new TransactionFilterResponse();
            
            // Convert transactions to response DTOs
            List<TransactionResponse> transactionResponses = transactionPage.getContent().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
            
            response.setTransactions(transactionResponses);
            response.setCurrentPage(transactionPage.getNumber());
            response.setTotalPages(transactionPage.getTotalPages());
            response.setTotalElements(transactionPage.getTotalElements());
            response.setPageSize(transactionPage.getSize());
            response.setHasNext(transactionPage.hasNext());
            response.setHasPrevious(transactionPage.hasPrevious());
            
            // Create summary
            TransactionFilterResponse.FilterSummary summary = new TransactionFilterResponse.FilterSummary();
            summary.setTotalIncome(totalIncome != null ? totalIncome.doubleValue() : 0);
            summary.setTotalExpense(totalExpense != null ? totalExpense.doubleValue() : 0);
            summary.setNetCashFlow(summary.getTotalIncome() - summary.getTotalExpense());
            summary.setTransactionCount(transactionPage.getTotalElements());
            summary.setMostCommonCategory(mostCommonCategory);
            summary.setAverageTransactionAmount(
                transactionPage.getTotalElements() > 0 ? 
                (summary.getTotalIncome() + summary.getTotalExpense()) / transactionPage.getTotalElements() : 0
            );
            
            response.setSummary(summary);
            
            return response;
            
        } catch (Exception e) {
            log.error("Error in getFilteredTransactions", e);
            throw new RuntimeException("Failed to fetch filtered transactions: " + e.getMessage());
        }
    }

    // Helper method to convert Transaction to TransactionResponse
    private TransactionResponse convertToResponse(Transaction transaction) {
        TransactionResponse response = new TransactionResponse();
        response.setTransactionId(transaction.getTransactionId());
        response.setAmount(transaction.getAmount());
        response.setType(transaction.getType());
        response.setDescription(transaction.getDescription());
        response.setTransactionDate(transaction.getTransactionDate());
        response.setCreatedAt(transaction.getCreatedAt());
        response.setLocation(transaction.getLocation());
        response.setStatus(transaction.getStatus());
        
        if (transaction.getCategory() != null) {
            response.setCategoryId(transaction.getCategory().getCategoryId());
            response.setCategoryName(transaction.getCategory().getName());
        }
        
        if (transaction.getBankAccount() != null) {
            response.setAccountId(transaction.getBankAccount().getAccountId());
            response.setBankName(transaction.getBankAccount().getBankName());
        }

        if (transaction.getOcrDocument() != null) {
            TransactionResponse.OcrData ocrData = new TransactionResponse.OcrData();
            ocrData.setDocumentId(transaction.getOcrDocument().getDocumentId());
            ocrData.setExtractedVendor(transaction.getOcrDocument().getExtractedVendor());
            ocrData.setExtractedAmount(transaction.getOcrDocument().getExtractedAmount());
            ocrData.setExtractedText(transaction.getOcrDocument().getExtractedText());
            ocrData.setProcessingStatus(transaction.getOcrDocument().getProcessingStatus());
            response.setOcrDocument(ocrData);
        }
        
        return response;
    }

    /**
     * Get monthly transaction summary for a specific month
     */
    public MonthlySummaryDTO getMonthlySummary(Long userId, int year, int month) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        
        // Get all transactions for the month
        List<Transaction> transactions = transactionRepository
                .findByUserAndTransactionDateBetween(user, startDate, endDate);
        
        // Calculate totals
        BigDecimal totalIncome = transactions.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalExpense = transactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal netSavings = totalIncome.subtract(totalExpense);
        BigDecimal savingsRate = BigDecimal.ZERO;
        if (totalIncome.compareTo(BigDecimal.ZERO) > 0) {
            savingsRate = netSavings.multiply(new BigDecimal("100"))
                    .divide(totalIncome, 2, java.math.RoundingMode.HALF_UP);
        }
        
        // Category breakdown
        Map<String, BigDecimal> categoryMap = new HashMap<>();
        for (Transaction t : transactions) {
            if (t.getType() == TransactionType.EXPENSE) {
                String categoryName = t.getCategory() != null ? t.getCategory().getName() : "Other";
                categoryMap.put(categoryName, 
                    categoryMap.getOrDefault(categoryName, BigDecimal.ZERO).add(t.getAmount()));
            }
        }
        
        // Calculate percentages and create category list
        List<MonthlySummaryDTO.CategorySummary> categoryBreakdown = new ArrayList<>();
        for (Map.Entry<String, BigDecimal> entry : categoryMap.entrySet()) {
            MonthlySummaryDTO.CategorySummary summary = new MonthlySummaryDTO.CategorySummary();
            summary.setCategoryName(entry.getKey());
            summary.setAmount(entry.getValue());
            double percentage = totalExpense.compareTo(BigDecimal.ZERO) > 0 ?
                entry.getValue().doubleValue() / totalExpense.doubleValue() * 100 : 0;
            summary.setPercentage(Math.round(percentage * 10.0) / 10.0);
            summary.setIcon(getCategoryIcon(entry.getKey()));
            categoryBreakdown.add(summary);
        }
        
        // Sort by amount descending
        categoryBreakdown.sort((a, b) -> b.getAmount().compareTo(a.getAmount()));
        
        // Get previous month comparison
        LocalDate prevMonthStart = startDate.minusMonths(1);
        LocalDate prevMonthEnd = prevMonthStart.withDayOfMonth(prevMonthStart.lengthOfMonth());
        
        List<Transaction> prevTransactions = transactionRepository
                .findByUserAndTransactionDateBetween(user, prevMonthStart, prevMonthEnd);
        
        BigDecimal prevTotalExpense = prevTransactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal expenseChange = totalExpense.subtract(prevTotalExpense);
        
        Map<String, BigDecimal> comparison = new HashMap<>();
        comparison.put("previousMonthExpense", prevTotalExpense);
        comparison.put("expenseChange", expenseChange);
        comparison.put("expenseChangePercentage", prevTotalExpense.compareTo(BigDecimal.ZERO) > 0 ?
            expenseChange.multiply(new BigDecimal("100")).divide(prevTotalExpense, 2, java.math.RoundingMode.HALF_UP) : BigDecimal.ZERO);
        
        // Generate insight
        String insight = generateMonthlyInsight(totalIncome, totalExpense, netSavings, savingsRate, expenseChange);
        
        // Build response
        MonthlySummaryDTO summary = new MonthlySummaryDTO();
        summary.setMonth(startDate);
        summary.setTotalIncome(totalIncome);
        summary.setTotalExpense(totalExpense);
        summary.setNetSavings(netSavings);
        summary.setSavingsRate(savingsRate);
        summary.setCategoryBreakdown(categoryBreakdown);
        summary.setPreviousMonthComparison(comparison);
        summary.setInsight(insight);
        
        return summary;
    }

    private String getCategoryIcon(String categoryName) {
        Map<String, String> icons = new HashMap<>();
        icons.put("Food & Dining", "🍔");
        icons.put("Coffee Shops", "☕");
        icons.put("Restaurants", "🍽️");
        icons.put("Shopping", "🛍️");
        icons.put("Transportation", "🚗");
        icons.put("Entertainment", "🎬");
        icons.put("Bills & Utilities", "💡");
        icons.put("Healthcare", "🏥");
        icons.put("Education", "📚");
        icons.put("Salary", "💰");
        icons.put("Freelance", "💼");
        icons.put("Rent", "🏠");
        icons.put("Groceries", "🛒");
        return icons.getOrDefault(categoryName, "📦");
    }

    private String generateMonthlyInsight(BigDecimal income, BigDecimal expense, 
                                           BigDecimal savings, BigDecimal savingsRate, 
                                           BigDecimal expenseChange) {
        StringBuilder insight = new StringBuilder();
        
        if (savingsRate.compareTo(new BigDecimal("30")) >= 0) {
            insight.append("Excellent month! You saved over 30% of your income. ");
        } else if (savingsRate.compareTo(new BigDecimal("20")) >= 0) {
            insight.append("Good job! You saved 20% of your income. ");
        } else if (savingsRate.compareTo(BigDecimal.ZERO) > 0) {
            insight.append("You saved ").append(savingsRate).append("% of your income. Try to increase by 5% next month. ");
        } else {
            insight.append("Your expenses exceeded income. Review your spending habits. ");
        }
        
        if (expenseChange.compareTo(BigDecimal.ZERO) > 0) {
            insight.append("Expenses increased by ₹").append(expenseChange).append(" compared to last month.");
        } else if (expenseChange.compareTo(BigDecimal.ZERO) < 0) {
            insight.append("Great! You reduced expenses by ₹").append(expenseChange.abs()).append(" compared to last month.");
        }
        
        return insight.toString();
    }

    public Transaction getTransaction(Long userId, Long transactionId) {
        return transactionRepository.findById(transactionId)
                .filter(t -> t.getUser().getUserId().equals(userId))
                .orElseThrow(() -> new RuntimeException("Transaction not found or unauthorized"));
    }

    @Transactional
    public Transaction updateTransaction(Long userId, Long transactionId, TransactionRequest request) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .filter(t -> t.getUser().getUserId().equals(userId))
                .orElseThrow(() -> new RuntimeException("Transaction not found or unauthorized"));

        BankAccount account = transaction.getBankAccount();
        BigDecimal oldAmount = transaction.getAmount();
        TransactionType oldType = transaction.getType();
        Category oldCategory = transaction.getCategory();
        LocalDate oldDate = transaction.getTransactionDate();

        // 1. Reverse old impact on balance
        if (oldType == TransactionType.EXPENSE) {
            account.setCurrentBalance(account.getCurrentBalance().add(oldAmount));
        } else {
            account.setCurrentBalance(account.getCurrentBalance().subtract(oldAmount));
        }

        // 2. Update transaction details
        transaction.setAmount(request.getAmount());
        transaction.setType(request.getType());
        transaction.setDescription(request.getDescription());
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setLocation(request.getLocation());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            transaction.setCategory(category);
        } else {
            Category autoCategory = categorizationService.categorizeTransaction(request.getDescription());
            transaction.setCategory(autoCategory);
        }

        // 3. Apply new impact on balance
        if (transaction.getType() == TransactionType.EXPENSE) {
            account.setCurrentBalance(account.getCurrentBalance().subtract(transaction.getAmount()));
        } else {
            account.setCurrentBalance(account.getCurrentBalance().add(transaction.getAmount()));
        }
        bankAccountRepository.save(account);

        Transaction updated = transactionRepository.save(transaction);

        // 4. Update budgets
        // Update old budget if it was an expense
        if (oldType == TransactionType.EXPENSE && oldCategory != null) {
            budgetService.updateBudgetSpending(userId, oldCategory.getCategoryId(), oldDate.withDayOfMonth(1));
        }
        
        // Update new budget if it's an expense
        if (updated.getType() == TransactionType.EXPENSE && updated.getCategory() != null) {
            LocalDate newBudgetMonth = updated.getTransactionDate().withDayOfMonth(1);
            budgetService.updateBudgetSpending(userId, updated.getCategory().getCategoryId(), newBudgetMonth);
        }

        return updated;
    }

    @Transactional
    public void deleteTransaction(Long userId, Long transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .filter(t -> t.getUser().getUserId().equals(userId))
                .orElseThrow(() -> new RuntimeException("Transaction not found or unauthorized"));

        log.info("Deleting transaction {} for user {} [type={}, amount={}, date={}, category={}]",
                transactionId, userId, transaction.getType(), transaction.getAmount(), transaction.getTransactionDate(),
                transaction.getCategory() != null ? transaction.getCategory().getCategoryId() : null);

        BankAccount account = transaction.getBankAccount();
        if (account == null) {
            throw new RuntimeException("Transaction bank account is missing");
        }

        if (account.getCurrentBalance() == null) {
            account.setCurrentBalance(BigDecimal.ZERO);
        }

        if (transaction.getType() == TransactionType.EXPENSE) {
            account.setCurrentBalance(account.getCurrentBalance().add(transaction.getAmount()));
        } else {
            account.setCurrentBalance(account.getCurrentBalance().subtract(transaction.getAmount()));
        }
        bankAccountRepository.save(account);

        if (transaction.getType() == TransactionType.EXPENSE
                && transaction.getCategory() != null
                && transaction.getTransactionDate() != null) {
            budgetService.updateBudgetSpending(userId, transaction.getCategory().getCategoryId(), transaction.getTransactionDate().withDayOfMonth(1));
        }

        // Handle OCR document deletion to allow re-uploading the same receipt
        if (transaction.getOcrDocument() != null) {
            com.College_project.project.models.OcrDocument ocrDoc = transaction.getOcrDocument();
            transaction.setOcrDocument(null);
            transactionRepository.save(transaction);

            log.info("Deleting associated OCR document {} for transaction {}", ocrDoc.getDocumentId(), transactionId);
            ocrDocumentRepository.delete(ocrDoc);
        }

        // Delete any anomaly records that reference this transaction first to avoid foreign key constraint failures.
        List<com.College_project.project.models.Anomaly> anomalies = anomalyRepository.findByTransaction(transaction);
        if (!anomalies.isEmpty()) {
            log.info("Deleting {} anomaly record(s) for transaction {}", anomalies.size(), transactionId);
            anomalyRepository.deleteAll(anomalies);
        }

        transactionRepository.delete(transaction);
    }
}
