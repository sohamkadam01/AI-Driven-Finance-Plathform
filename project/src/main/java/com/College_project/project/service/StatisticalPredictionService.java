package com.College_project.project.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.College_project.project.DTOs.DailyPrediction;
import com.College_project.project.DTOs.PredictionResponse;
import com.College_project.project.enums.TransactionType;
import com.College_project.project.models.RecurringTransaction;
import com.College_project.project.models.Transaction;
import com.College_project.project.models.User;
import com.College_project.project.repository.RecurringTransactionRepository;
import com.College_project.project.repository.UserRepository;
import com.College_project.project.repository.bankAccountRepository;
import com.College_project.project.repository.transactionRepository;

@Service
public class StatisticalPredictionService {
    
    @Autowired
    private transactionRepository transactionRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private bankAccountRepository bankAccountRepository;
    
    @Autowired
    private RecurringTransactionRepository recurringTransactionRepository;
    
    public PredictionResponse predictFutureBalance(Long userId, LocalDate startDate, LocalDate endDate) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Get historical data (last 3 months)
        LocalDate historicalStartDate = LocalDate.now().minusMonths(3);
        LocalDate historicalEndDate = LocalDate.now();
        
        List<Transaction> historicalTransactions = transactionRepository
                .findByUserAndTransactionDateBetween(user, historicalStartDate, historicalEndDate);
        
        if (historicalTransactions.isEmpty()) {
            throw new RuntimeException("Insufficient transaction history for prediction. Please add more transactions.");
        }
        
        // Calculate weekly averages
        Map<String, BigDecimal> weeklyAverages = calculateWeeklyAverages(historicalTransactions);
        
        // Get current balance from bank accounts
        BigDecimal currentBalance = getCurrentBalance(user);
        
        // Get active bill reminders
        List<RecurringTransaction> activeBills = recurringTransactionRepository.findByUserAndIsActiveTrue(user);
        
        // Generate daily predictions
        List<DailyPrediction> dailyPredictions = generateDailyPredictions(
            currentBalance, weeklyAverages, activeBills, startDate, endDate);
        
        // Calculate final predicted balance
        BigDecimal predictedBalance = dailyPredictions.isEmpty() ? 
            currentBalance : dailyPredictions.get(dailyPredictions.size() - 1).getPredictedBalance();
        
        // Calculate confidence score
        BigDecimal confidenceScore = calculateConfidenceScore(historicalTransactions);
        
        // Get category breakdown
        Map<String, BigDecimal> categoryBreakdown = getCategoryBreakdown(historicalTransactions);
        
        // Generate insights
        String insights = generateInsights(weeklyAverages, predictedBalance, currentBalance);
        
        PredictionResponse response = new PredictionResponse(
            endDate, predictedBalance, confidenceScore, "STATISTICAL");
        response.setDailyPredictions(dailyPredictions);
        response.setCategoryBreakdown(categoryBreakdown);
        response.setInsights(insights);
        response.setCurrentBalance(currentBalance);
        response.setMetrics(calculateMetrics(historicalTransactions));

        List<String> riskFactors = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();
        
        if (predictedBalance.compareTo(currentBalance) >= 0) {
            riskFactors.add("Inflation eroding purchasing power of stagnant savings.");
            riskFactors.add("Potential missed market investment opportunities.");
            
            recommendations.add("Allocate a portion of your surplus savings to diversified mutual funds or fixed deposits.");
            recommendations.add("Automate regular transfers to a separate high-yield savings account.");
            recommendations.add("Consider setting up a recurring monthly investment (SIP) to build long-term wealth.");
        } else {
            riskFactors.add("Spending exceeding income, leading to cash flow depletion.");
            riskFactors.add("High reliance on discretionary purchases.");
            riskFactors.add("Insufficient emergency buffer for upcoming scheduled bills.");
            
            recommendations.add("Review discretionary spending categories (e.g. Dining, Shopping) and cut non-essentials.");
            recommendations.add("Set up a strict weekly budget and monitor transaction alerts closely.");
            recommendations.add("Ensure sufficient balance is maintained in your account for upcoming recurring bills.");
        }
        
        response.setRiskFactors(riskFactors);
        response.setRecommendations(recommendations);
        
        return response;
    }
    
    private Map<String, BigDecimal> calculateWeeklyAverages(List<Transaction> transactions) {
        Map<String, BigDecimal> averages = new HashMap<>();
        
        // Group transactions by day of week
        Map<Integer, BigDecimal> incomeByDay = new HashMap<>();
        Map<Integer, BigDecimal> expenseByDay = new HashMap<>();
        Map<Integer, Integer> incomeCount = new HashMap<>();
        Map<Integer, Integer> expenseCount = new HashMap<>();
        
        // Initialize maps
        for (int i = 1; i <= 7; i++) {
            incomeByDay.put(i, BigDecimal.ZERO);
            expenseByDay.put(i, BigDecimal.ZERO);
            incomeCount.put(i, 0);
            expenseCount.put(i, 0);
        }
        
        // Calculate totals per day of week - EXCLUDING recurring transactions to avoid double counting
        for (Transaction t : transactions) {
            // Skip recurring transactions as they are added explicitly in generateDailyPredictions
            if (t.isRecurring()) continue;

            int dayOfWeek = t.getTransactionDate().getDayOfWeek().getValue();
            if (t.getType() == TransactionType.INCOME) {
                incomeByDay.put(dayOfWeek, incomeByDay.get(dayOfWeek).add(t.getAmount()));
                incomeCount.put(dayOfWeek, incomeCount.get(dayOfWeek) + 1);
            } else {
                expenseByDay.put(dayOfWeek, expenseByDay.get(dayOfWeek).add(t.getAmount()));
                expenseCount.put(dayOfWeek, expenseCount.get(dayOfWeek) + 1);
            }
        }
        
        // Calculate global averages - EXCLUDING recurring transactions
        BigDecimal totalIncome = transactions.stream()
            .filter(t -> t.getType() == TransactionType.INCOME && !t.isRecurring())
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalExpense = transactions.stream()
            .filter(t -> t.getType() == TransactionType.EXPENSE && !t.isRecurring())
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        long daysInPeriod = ChronoUnit.DAYS.between(
            LocalDate.now().minusMonths(3), LocalDate.now());
        if (daysInPeriod == 0) daysInPeriod = 1;
        
        BigDecimal globalDailyIncome = totalIncome.divide(BigDecimal.valueOf(daysInPeriod), 2, RoundingMode.HALF_UP);
        BigDecimal globalDailyExpense = totalExpense.divide(BigDecimal.valueOf(daysInPeriod), 2, RoundingMode.HALF_UP);
        
        // Store averages with fallback
        for (int i = 1; i <= 7; i++) {
            BigDecimal avgIncome = incomeCount.get(i) > 0 ? 
                incomeByDay.get(i).divide(BigDecimal.valueOf(incomeCount.get(i)), 2, RoundingMode.HALF_UP) : 
                globalDailyIncome;
            BigDecimal avgExpense = expenseCount.get(i) > 0 ? 
                expenseByDay.get(i).divide(BigDecimal.valueOf(expenseCount.get(i)), 2, RoundingMode.HALF_UP) : 
                globalDailyExpense;
            
            averages.put("income_day_" + i, avgIncome);
            averages.put("expense_day_" + i, avgExpense);
        }
        
        averages.put("globalDailyIncome", globalDailyIncome);
        averages.put("globalDailyExpense", globalDailyExpense);
        averages.put("weeklyAvgExpense", globalDailyExpense.multiply(BigDecimal.valueOf(7)));
        
        return averages;
    }
    
    private List<DailyPrediction> generateDailyPredictions(BigDecimal currentBalance, 
                                                            Map<String, BigDecimal> averages,
                                                            List<RecurringTransaction> activeBills,
                                                            LocalDate startDate, 
                                                            LocalDate endDate) {
        List<DailyPrediction> predictions = new ArrayList<>();
        BigDecimal runningBalance = currentBalance;
        long days = ChronoUnit.DAYS.between(startDate, endDate);
        
        for (int i = 0; i <= days; i++) {
            LocalDate currentDate = startDate.plusDays(i);
            DailyPrediction daily = new DailyPrediction();
            daily.setDate(currentDate);
            
            int dayOfWeek = currentDate.getDayOfWeek().getValue();
            
            // 1. Regular predicted income/expense from history
            BigDecimal predictedIncome = averages.getOrDefault("income_day_" + dayOfWeek, averages.get("globalDailyIncome"));
            BigDecimal predictedExpense = averages.getOrDefault("expense_day_" + dayOfWeek, averages.get("globalDailyExpense"));
            
            // 2. Add scheduled bill reminders for this specific date
            BigDecimal scheduledBills = getScheduledBillsForDate(activeBills, currentDate);
            
            // Total expense = statistical average + actual scheduled bills
            BigDecimal totalExpense = predictedExpense.add(scheduledBills);
            
            // Round to nearest whole number
            predictedIncome = predictedIncome.setScale(0, RoundingMode.HALF_UP);
            totalExpense = totalExpense.setScale(0, RoundingMode.HALF_UP);
            
            daily.setPredictedIncome(predictedIncome);
            daily.setPredictedExpense(totalExpense);
            
            runningBalance = runningBalance.add(predictedIncome).subtract(totalExpense);
            daily.setPredictedBalance(runningBalance.setScale(2, RoundingMode.HALF_UP));
            
            predictions.add(daily);
        }
        
        return predictions;
    }

    private BigDecimal getScheduledBillsForDate(List<RecurringTransaction> bills, LocalDate date) {
        BigDecimal total = BigDecimal.ZERO;
        for (RecurringTransaction bill : bills) {
            if (isBillDueOnDate(bill, date)) {
                total = total.add(bill.getAmount());
            }
        }
        return total;
    }

    private boolean isBillDueOnDate(RecurringTransaction bill, LocalDate date) {
        LocalDate dueDate = bill.getNextDueDate();
        if (dueDate == null || dueDate.isAfter(date)) return false;
        if (dueDate.isEqual(date)) return true;

        // Simple repetition check based on frequency
        LocalDate current = dueDate;
        int maxIterations = 500; // Safety break
        int iterations = 0;
        
        while (current.isBefore(date) && iterations < maxIterations) {
            iterations++;
            switch (bill.getFrequency()) {
                case DAILY: 
                    current = current.plusDays(1); 
                    break;
                case WEEKLY: 
                    current = current.plusWeeks(1); 
                    break;
                case MONTHLY: 
                    current = current.plusMonths(1); 
                    break;
                case YEARLY: 
                    current = current.plusYears(1); 
                    break;
                default: 
                    return false;
            }
            if (current.isEqual(date)) return true;
        }
        return false;
    }
    
    private BigDecimal getCurrentBalance(User user) {
        return bankAccountRepository.findByUser(user).stream()
                .filter(acc -> acc.isActive())
                .map(acc -> acc.getCurrentBalance())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    private BigDecimal calculateConfidenceScore(List<Transaction> transactions) {
        if (transactions.size() < 10) {
            return new BigDecimal("30.00");
        }
        
        // Calculate spending consistency
        List<BigDecimal> weeklyTotals = new ArrayList<>();
        Map<Integer, List<BigDecimal>> weeklySpending = new HashMap<>();
        
        for (Transaction t : transactions) {
            if (t.getType() == TransactionType.EXPENSE) {
                int week = t.getTransactionDate().getDayOfYear() / 7;
                weeklySpending.computeIfAbsent(week, k -> new ArrayList<>()).add(t.getAmount());
            }
        }
        
        for (List<BigDecimal> week : weeklySpending.values()) {
            BigDecimal weekTotal = week.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
            weeklyTotals.add(weekTotal);
        }
        
        if (weeklyTotals.size() < 2) {
            return new BigDecimal("40.00");
        }
        
        double avg = weeklyTotals.stream().mapToDouble(BigDecimal::doubleValue).average().orElse(0);
        if (avg <= 0) {
            return new BigDecimal("40.00");
        }
        double variance = weeklyTotals.stream()
                .mapToDouble(v -> Math.pow(v.doubleValue() - avg, 2))
                .average()
                .orElse(0);
        double stdDev = Math.sqrt(variance);
        double cv = stdDev / avg;
        
        int confidence;
        if (cv < 0.2) confidence = 85;
        else if (cv < 0.35) confidence = 70;
        else if (cv < 0.5) confidence = 55;
        else if (cv < 0.7) confidence = 45;
        else confidence = 35;
        
        if (transactions.size() > 50) confidence += 10;
        else if (transactions.size() > 30) confidence += 5;
        else if (transactions.size() < 15) confidence -= 10;
        
        return new BigDecimal(Math.min(90, Math.max(30, confidence)));
    }
    
    private Map<String, BigDecimal> getCategoryBreakdown(List<Transaction> transactions) {
        Map<String, BigDecimal> breakdown = new LinkedHashMap<>();
        
        Map<String, BigDecimal> categoryTotals = new HashMap<>();
        for (Transaction t : transactions) {
            if (t.getType() == TransactionType.EXPENSE) {
                String categoryName = t.getCategory() != null ? t.getCategory().getName() : "Uncategorized";
                categoryTotals.put(categoryName, 
                    categoryTotals.getOrDefault(categoryName, BigDecimal.ZERO).add(t.getAmount()));
            }
        }
        
        categoryTotals.entrySet().stream()
            .sorted(Map.Entry.<String, BigDecimal>comparingByValue().reversed())
            .limit(5)
            .forEach(entry -> breakdown.put(entry.getKey(), entry.getValue()));
        
        return breakdown;
    }
    
    private String generateInsights(Map<String, BigDecimal> averages, 
                                    BigDecimal predictedBalance, 
                                    BigDecimal currentBalance) {
        StringBuilder insights = new StringBuilder();
        
        BigDecimal dailyExpense = averages.get("globalDailyExpense");
        BigDecimal dailyIncome = averages.get("globalDailyIncome");
        
        BigDecimal monthlyIncome = dailyIncome.multiply(BigDecimal.valueOf(30));
        BigDecimal monthlyExpense = dailyExpense.multiply(BigDecimal.valueOf(30));
        BigDecimal monthlySavings = monthlyIncome.subtract(monthlyExpense);
        
        if (monthlySavings.compareTo(BigDecimal.ZERO) > 0) {
            insights.append(String.format("💰 You save ₹%.0f per month on average. ", monthlySavings));
        } else {
            insights.append(String.format("⚠️ Your monthly expenses (₹%.0f) exceed your income (₹%.0f). ", 
                monthlyExpense, monthlyIncome));
        }
        
        // Find highest spending day
        Map<Integer, BigDecimal> expenseByDay = new HashMap<>();
        for (int i = 1; i <= 7; i++) {
            expenseByDay.put(i, averages.getOrDefault("expense_day_" + i, BigDecimal.ZERO));
        }
        
        int maxDay = expenseByDay.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse(1);
        
        String[] dayNames = {"", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"};
        insights.append(String.format("📊 Your highest spending day is %s. ", dayNames[maxDay]));
        
        if (predictedBalance.compareTo(currentBalance) > 0) {
            insights.append("📈 Your balance is expected to grow over this period. ");
        } else {
            insights.append("📉 Your balance may decrease. Consider reviewing your expenses. ");
        }
        
        return insights.toString();
    }

    private Map<String, BigDecimal> calculateMetrics(List<Transaction> transactions) {
        Map<String, BigDecimal> metrics = new HashMap<>();
        List<BigDecimal> expenseAmounts = new ArrayList<>();
        
        for (Transaction t : transactions) {
            if (t.getType() == TransactionType.EXPENSE) {
                expenseAmounts.add(t.getAmount());
            }
        }
        
        if (expenseAmounts.size() < 2) {
            metrics.put("mae", new BigDecimal("150.00"));
            metrics.put("rmse", new BigDecimal("200.00"));
            return metrics;
        }
        
        double sum = 0;
        for (BigDecimal amt : expenseAmounts) {
            sum += amt.doubleValue();
        }
        double avg = sum / expenseAmounts.size();
        
        double sumSqDiff = 0;
        for (BigDecimal amt : expenseAmounts) {
            sumSqDiff += Math.pow(amt.doubleValue() - avg, 2);
        }
        double variance = sumSqDiff / expenseAmounts.size();
        double stdDev = Math.sqrt(variance);
        
        double mae = stdDev * 0.7979;
        double rmse = stdDev;
        
        if (mae < 50.0) mae = 50.0;
        if (rmse < 70.0) rmse = 70.0;
        
        metrics.put("mae", BigDecimal.valueOf(mae).setScale(2, RoundingMode.HALF_UP));
        metrics.put("rmse", BigDecimal.valueOf(rmse).setScale(2, RoundingMode.HALF_UP));
        return metrics;
    }
}
