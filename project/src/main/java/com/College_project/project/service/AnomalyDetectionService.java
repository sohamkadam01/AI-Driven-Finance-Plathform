package com.College_project.project.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.College_project.project.enums.AlertType;
import com.College_project.project.enums.AnomalySeverity;
import com.College_project.project.enums.TransactionType;
import com.College_project.project.models.Anomaly;
import com.College_project.project.models.Transaction;
import com.College_project.project.models.User;
import com.College_project.project.repository.AlertRepository;
import com.College_project.project.repository.anomalyRepository;
import com.College_project.project.repository.transactionRepository;

@Service
public class AnomalyDetectionService {
    
    @Autowired
    private transactionRepository transactionRepository;
    
    @Autowired
    private anomalyRepository anomalyRepository;
    
    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @Value("${openrouter.api.key:}")
    private String apiKey;

    private final org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(AnomalyDetectionService.class);
    
    // Detect anomalies when a new transaction is added
    @Transactional
    public List<Anomaly> detectAnomalies(Transaction transaction) {
        List<Anomaly> detectedAnomalies = new ArrayList<>();
        User user = transaction.getUser();
        
        // 1. Check for unusually high amount
        Anomaly highAmountAnomaly = checkUnusualAmount(transaction, user);
        if (highAmountAnomaly != null) detectedAnomalies.add(highAmountAnomaly);
        
        // 2. Check for unusual location
        Anomaly locationAnomaly = checkUnusualLocation(transaction, user);
        if (locationAnomaly != null) detectedAnomalies.add(locationAnomaly);
        
        // 3. Check for unusual time
        Anomaly timeAnomaly = checkUnusualTime(transaction);
        if (timeAnomaly != null) detectedAnomalies.add(timeAnomaly);
        
        // 4. Check for duplicate transactions
        Anomaly duplicateAnomaly = checkDuplicateTransaction(transaction, user);
        if (duplicateAnomaly != null) detectedAnomalies.add(duplicateAnomaly);
        
        // 5. Check for rapid consecutive transactions
        Anomaly rapidAnomaly = checkRapidTransactions(transaction, user);
        if (rapidAnomaly != null) detectedAnomalies.add(rapidAnomaly);

        // 6. AI Smart Review (for high-value or already suspicious transactions)
        if (!detectedAnomalies.isEmpty() || (transaction.getAmount() != null && transaction.getAmount().doubleValue() > 10000)) {
            Anomaly aiAnomaly = checkWithAISmartReview(transaction);
            if (aiAnomaly != null) detectedAnomalies.add(aiAnomaly);
        }
        
        // Save all detected anomalies
        for (Anomaly anomaly : detectedAnomalies) {
            anomalyRepository.save(anomaly);
            createAlertForAnomaly(anomaly);
        }
        
        // Mark transaction as flagged if anomalies found
        if (!detectedAnomalies.isEmpty()) {
            transaction.setFlagged(true);
            transaction.setFlagReason(detectedAnomalies.get(0).getReason());
            transactionRepository.save(transaction);
        }
        
        return detectedAnomalies;
    }
    
    // Check for unusually high transaction amount
    private Anomaly checkUnusualAmount(Transaction transaction, User user) {
        // Get user's average transaction amount for last 30 days
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        List<Transaction> recentTransactions = transactionRepository
            .findByUserAndTransactionDateBetween(user, thirtyDaysAgo, LocalDate.now());
        
        if (recentTransactions.isEmpty()) return null;
        
        double avgAmount = recentTransactions.stream()
            .filter(t -> t.getType() == TransactionType.EXPENSE)
            .mapToDouble(t -> t.getAmount().doubleValue())
            .average()
            .orElse(0);
        
        double stdDev = calculateStandardDeviation(recentTransactions, avgAmount);
        double currentAmount = transaction.getAmount().doubleValue();
        
        // Require at least 5 transactions for a reliable average
        // and ensure the amount is significantly high (e.g., > ₹5000) or 3x standard deviations
        boolean isSignificantlyHigh = currentAmount > 5000 && currentAmount > (avgAmount * 2);
        
        if (recentTransactions.size() >= 5 && (stdDev > 0 && currentAmount > (avgAmount + (3 * stdDev)) || isSignificantlyHigh)) {
            Anomaly anomaly = new Anomaly();
            anomaly.setUser(user);
            anomaly.setTransaction(transaction);
            anomaly.setReason(String.format("Unusually high amount: ₹%.2f (Your average is ₹%.2f, %.1f times higher)", 
                           currentAmount, avgAmount, currentAmount / avgAmount));
            anomaly.setSeverity(currentAmount > (avgAmount + (5 * stdDev)) ? 
                               AnomalySeverity.HIGH : AnomalySeverity.MEDIUM);
            anomaly.setReportedAt(LocalDateTime.now());
            return anomaly;
        }
        
        return null;
    }
    
    // Check for unusual location (if transaction has location data)
    private Anomaly checkUnusualLocation(Transaction transaction, User user) {
        if (transaction.getLocation() == null || transaction.getLocation().isEmpty()) {
            return null;
        }
        
        // Get user's common locations from last 60 days
        LocalDate sixtyDaysAgo = LocalDate.now().minusDays(60);
        List<Transaction> recentTransactions = transactionRepository
            .findByUserAndTransactionDateBetween(user, sixtyDaysAgo, LocalDate.now());
        
        Set<String> commonLocations = recentTransactions.stream()
            .filter(t -> t.getLocation() != null && !t.getLocation().isEmpty())
            .map(Transaction::getLocation)
            .collect(Collectors.toSet());
        
        // If transaction location is new and not in common locations
        if (!commonLocations.isEmpty() && !commonLocations.contains(transaction.getLocation())) {
            Anomaly anomaly = new Anomaly();
            anomaly.setUser(user);
            anomaly.setTransaction(transaction);
            anomaly.setReason(String.format("Transaction from unusual location: %s", transaction.getLocation()));
            anomaly.setSeverity(AnomalySeverity.MEDIUM);
            anomaly.setReportedAt(LocalDateTime.now());
            return anomaly;
        }
        
        return null;
    }
    
    // Check for unusual time (late night transactions)
    private Anomaly checkUnusualTime(Transaction transaction) {
        // Check if transaction was created at unusual hour
        LocalDateTime now = LocalDateTime.now();
        int currentHour = now.getHour();
        
        if (currentHour >= 23 || currentHour <= 5) { // Between 11 PM and 5 AM
            Anomaly anomaly = new Anomaly();
            anomaly.setUser(transaction.getUser());
            anomaly.setTransaction(transaction);
            anomaly.setReason(String.format("Late night transaction at %d:00", currentHour));
            anomaly.setSeverity(AnomalySeverity.LOW);
            anomaly.setReportedAt(LocalDateTime.now());
            return anomaly;
        }
        
        return null;
    }
    
    // Check for duplicate transactions
    private Anomaly checkDuplicateTransaction(Transaction transaction, User user) {
        LocalDate twoDaysAgo = LocalDate.now().minusDays(2);
        List<Transaction> recentTransactions = transactionRepository
            .findByUserAndTransactionDateBetween(user, twoDaysAgo, LocalDate.now());
        
        for (Transaction t : recentTransactions) {
            if (t.getTransactionId().equals(transaction.getTransactionId())) continue;
            
            boolean sameAmount = t.getAmount().equals(transaction.getAmount());
            boolean similarDescription = t.getDescription() != null && 
                                        transaction.getDescription() != null &&
                                        t.getDescription().toLowerCase().contains(
                                            transaction.getDescription().toLowerCase().substring(0, 
                                            Math.min(5, transaction.getDescription().length()))
                                        );
            
            if (sameAmount && similarDescription) {
                Anomaly anomaly = new Anomaly();
                anomaly.setUser(user);
                anomaly.setTransaction(transaction);
                anomaly.setReason(String.format("Possible duplicate transaction: Similar to transaction on %s for same amount",
                               t.getTransactionDate()));
                anomaly.setSeverity(AnomalySeverity.MEDIUM);
                anomaly.setReportedAt(LocalDateTime.now());
                return anomaly;
            }
        }
        
        return null;
    }
    
    // Check for rapid consecutive transactions
    private Anomaly checkRapidTransactions(Transaction transaction, User user) {
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        
        List<Transaction> recentTransactions = transactionRepository
            .findByUserAndCreatedAtAfter(user, oneHourAgo);
        
        long countInLastHour = recentTransactions.size();
        
        if (countInLastHour >= 5) {
            Anomaly anomaly = new Anomaly();
            anomaly.setUser(user);
            anomaly.setTransaction(transaction);
            anomaly.setReason(String.format("Unusual activity: %d transactions in the last hour", 
                           countInLastHour + 1));
            anomaly.setSeverity(countInLastHour >= 10 ? AnomalySeverity.HIGH : AnomalySeverity.MEDIUM);
            anomaly.setReportedAt(LocalDateTime.now());
            return anomaly;
        }
        
        return null;
    }
    
    // AI Smart Review for suspicious transactions
    private Anomaly checkWithAISmartReview(Transaction transaction) {
        try {
            String prompt = buildAnomalyPrompt(transaction);
            String aiResponse = "";

            // 1. Try Ollama first
            try {
                aiResponse = callOllamaAPI(prompt);
            } catch (Exception e) {
                // 2. Try OpenRouter fallback
                if (apiKey != null && !apiKey.isEmpty()) {
                    aiResponse = callOpenRouterAPI(prompt);
                } else {
                    return null; // No AI available
                }
            }

            // Parse AI response
            com.fasterxml.jackson.databind.JsonNode jsonNode = objectMapper.readTree(aiResponse);
            boolean isSuspicious = jsonNode.path("isSuspicious").asBoolean();
            
            if (isSuspicious) {
                Anomaly anomaly = new Anomaly();
                anomaly.setUser(transaction.getUser());
                anomaly.setTransaction(transaction);
                anomaly.setReason("AI Smart Review: " + jsonNode.path("reason").asText());
                String severityStr = jsonNode.path("severity").asText("MEDIUM");
                try {
                    anomaly.setSeverity(AnomalySeverity.valueOf(severityStr));
                } catch (Exception e) {
                    anomaly.setSeverity(AnomalySeverity.MEDIUM);
                }
                anomaly.setReportedAt(LocalDateTime.now());
                return anomaly;
            }
        } catch (Exception e) {
            logger.warn("AI Smart Review failed: {}", e.getMessage());
        }
        return null;
    }

    private String buildAnomalyPrompt(Transaction t) {
        return String.format("""
            You are a fraud detection AI. Analyze this transaction for potential fraud or unusual behavior.
            User Profile: Regular spending at groceries and utilities.
            Transaction:
            - Amount: ₹%.2f
            - Description: %s
            - Category: %s
            - Time: %s
            
            Return ONLY valid JSON:
            {
                "isSuspicious": boolean,
                "reason": "short explanation",
                "severity": "LOW, MEDIUM, or HIGH"
            }
            """, t.getAmount(), t.getDescription(), 
            t.getCategory() != null ? t.getCategory().getName() : "Unknown",
            t.getTransactionDate());
    }

    private String callOllamaAPI(String prompt) throws Exception {
        String url = "http://localhost:11434/api/generate";
        Map<String, Object> body = new HashMap<>();
        body.put("model", "qwen2.5:3b");
        body.put("prompt", prompt);
        body.put("stream", false);
        
        String response = restTemplate.postForObject(url, body, String.class);
        return objectMapper.readTree(response).path("response").asText();
    }

    private String callOpenRouterAPI(String prompt) throws Exception {
        String url = "https://openrouter.ai/api/v1/chat/completions";
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "stepfun/step-3.5-flash");
        
        List<Map<String, String>> messages = new ArrayList<>();
        Map<String, String> msg = new HashMap<>();
        msg.put("role", "user");
        msg.put("content", prompt);
        messages.add(msg);
        requestBody.put("messages", messages);

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
        
        org.springframework.http.HttpEntity<Map<String, Object>> entity = new org.springframework.http.HttpEntity<>(requestBody, headers);
        String response = restTemplate.postForObject(url, entity, String.class);
        return objectMapper.readTree(response).path("choices").get(0).path("message").path("content").asText();
    }
    
    // Calculate standard deviation
    private double calculateStandardDeviation(List<Transaction> transactions, double mean) {
        if (transactions.isEmpty()) return 0;
        
        double variance = transactions.stream()
            .filter(t -> t.getType() == TransactionType.EXPENSE)
            .mapToDouble(t -> t.getAmount().doubleValue())
            .map(amount -> Math.pow(amount - mean, 2))
            .average()
            .orElse(0);
        return Math.sqrt(variance);
    }
    
    // Create alert for anomaly
    private void createAlertForAnomaly(Anomaly anomaly) {
        String shortReason = anomaly.getReason().split(":")[0];
        // Don't spam the same anomaly reason within a 1-hour window
        boolean duplicate = alertRepository.existsByUserAndMessageContainingAndCreatedAtAfter(
            anomaly.getUser(), shortReason, LocalDateTime.now().minusHours(1));
            
        if (duplicate) return;

        com.College_project.project.models.Alert alert = new com.College_project.project.models.Alert();
        alert.setUser(anomaly.getUser());
        alert.setType(AlertType.UNUSUAL_SPENDING);
        alert.setMessage(String.format("⚠️ Suspicious Activity Detected: %s\nSeverity: %s\nTransaction: %s for ₹%s",
                       anomaly.getReason(),
                       anomaly.getSeverity(),
                       anomaly.getTransaction().getDescription(),
                       anomaly.getTransaction().getAmount()));
        alert.setCreatedAt(LocalDateTime.now());
        alert.setRead(false);
        alert.setActionUrl("/transactions/" + anomaly.getTransaction().getTransactionId());
        alertRepository.save(alert);
    }
    
    // Scan recent transactions for anomalies
    @Transactional
    public void scanRecentTransactions() {
        LocalDate lastWeek = LocalDate.now().minusDays(7);
        List<Transaction> recentTransactions = transactionRepository
            .findByTransactionDateAfter(lastWeek);
        
        int scanned = 0;
        int anomaliesFound = 0;
        
        for (Transaction transaction : recentTransactions) {
            // Check if already flagged
            if (!transaction.isFlagged()) {
                scanned++;
                List<Anomaly> anomalies = detectAnomalies(transaction);
                anomaliesFound += anomalies.size();
            }
        }
        
        logger.info("Anomaly scan completed: Scanned {} transactions, Found {} anomalies", scanned, anomaliesFound);
    }
    
    // Get all anomalies for a user
    public List<Anomaly> getUserAnomalies(Long userId) {
        return anomalyRepository.findByUser_UserIdOrderByReportedAtDesc(userId);
    }
    
    // Get unresolved anomalies (HIGH priority)
    public List<Anomaly> getHighPriorityAnomalies(Long userId) {
        return anomalyRepository.findByUser_UserIdAndSeverityOrderByReportedAtDesc(userId, AnomalySeverity.HIGH);
    }
    
    // Mark anomaly as fraud
    @Transactional
    public void markAsFraud(Long anomalyId, Long userId, String notes) {
        Anomaly anomaly = anomalyRepository.findById(anomalyId)
                .orElseThrow(() -> new RuntimeException("Anomaly not found"));
        
        if (!anomaly.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        anomaly.setFraud(true);
        anomaly.setResolutionNote(notes);
        anomaly.setResolvedAt(LocalDateTime.now());
        anomalyRepository.save(anomaly);
        
        // Also flag the transaction
        Transaction transaction = anomaly.getTransaction();
        if (transaction != null) {
            transaction.setFlagged(true);
            transaction.setFlagReason("CONFIRMED FRAUD: " + anomaly.getReason());
            transactionRepository.save(transaction);
        }
    }

    @Transactional
    public void markAsFalseAlarm(Long anomalyId, Long userId, String notes) {
        Anomaly anomaly = anomalyRepository.findById(anomalyId)
                .orElseThrow(() -> new RuntimeException("Anomaly not found"));
        
        if (!anomaly.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        anomaly.setFraud(false);
        anomaly.setResolutionNote(notes);
        anomaly.setResolvedAt(LocalDateTime.now());
        anomalyRepository.save(anomaly);
    }
}
