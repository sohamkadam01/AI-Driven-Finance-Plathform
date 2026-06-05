package com.College_project.project.service;

import com.College_project.project.DTOs.ScenarioPredictionDTO;
import com.College_project.project.models.Transaction;
import com.College_project.project.models.User;
import com.College_project.project.enums.TransactionType;
import com.College_project.project.repository.transactionRepository;
import com.College_project.project.repository.bankAccountRepository;
import com.College_project.project.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ScenarioPredictionService {
    
    @Autowired
    private transactionRepository transactionRepository;
    
    @Autowired
    private bankAccountRepository bankAccountRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Generate best/worst case scenarios for future balance
     * @param userId User ID
     * @param months Number of months to predict (default 3)
     * @return ScenarioPredictionDTO with optimistic, pessimistic, and most likely scenarios
     */
    public ScenarioPredictionDTO getScenarioPredictions(Long userId, int months) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Get historical data (last 6 months)
        LocalDate historicalStartDate = LocalDate.now().minusMonths(6);
        List<Transaction> historicalTransactions = transactionRepository
                .findByUserAndTransactionDateBetween(user, historicalStartDate, LocalDate.now());
        
        if (historicalTransactions.isEmpty()) {
            throw new RuntimeException("Insufficient transaction history for predictions");
        }
        
        // Calculate current balance
        BigDecimal currentBalance = getCurrentBalance(user);
        
        // Calculate statistics
        TransactionStats stats = calculateTransactionStats(historicalTransactions);
        
        // Generate three scenarios
        ScenarioPredictionDTO.Scenario optimistic = generateOptimisticScenario(stats, currentBalance, months);
        ScenarioPredictionDTO.Scenario pessimistic = generatePessimisticScenario(stats, currentBalance, months);
        ScenarioPredictionDTO.Scenario mostLikely = generateMostLikelyScenario(stats, currentBalance, months);
        
        // Calculate comparisons
        ScenarioPredictionDTO.ScenarioComparison comparison = calculateComparison(optimistic, pessimistic, mostLikely);
        
        // Assess risk
        ScenarioPredictionDTO.RiskAssessment riskAssessment = assessRisk(optimistic, pessimistic, mostLikely, currentBalance, stats);
        
        // Generate recommendations
        List<String> recommendations = generateRecommendations(optimistic, pessimistic, mostLikely, riskAssessment);
        
        // Build response
        ScenarioPredictionDTO response = new ScenarioPredictionDTO();
        response.setOptimistic(optimistic);
        response.setPessimistic(pessimistic);
        response.setMostLikely(mostLikely);
        response.setComparison(comparison);
        response.setRiskAssessment(riskAssessment);
        response.setRecommendations(recommendations);
        
        return response;
    }
    
    /**
     * Calculate transaction statistics from historical data
     */
    private TransactionStats calculateTransactionStats(List<Transaction> transactions) {
        TransactionStats stats = new TransactionStats();
        
        // Monthly income and expense
        Map<Integer, List<Transaction>> transactionsByMonth = transactions.stream()
                .collect(Collectors.groupingBy(t -> t.getTransactionDate().getMonthValue()));
        
        List<BigDecimal> monthlyIncomes = new ArrayList<>();
        List<BigDecimal> monthlyExpenses = new ArrayList<>();
        
        for (Map.Entry<Integer, List<Transaction>> entry : transactionsByMonth.entrySet()) {
            BigDecimal monthIncome = entry.getValue().stream()
                    .filter(t -> t.getType() == TransactionType.INCOME)
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            BigDecimal monthExpense = entry.getValue().stream()
                    .filter(t -> t.getType() == TransactionType.EXPENSE)
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            monthlyIncomes.add(monthIncome);
            monthlyExpenses.add(monthExpense);
        }
        
        // Calculate averages
        stats.avgMonthlyIncome = monthlyIncomes.stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(monthlyIncomes.size()), 2, RoundingMode.HALF_UP);
        
        stats.avgMonthlyExpense = monthlyExpenses.stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(monthlyExpenses.size()), 2, RoundingMode.HALF_UP);
        
        // Calculate standard deviations
        stats.incomeStdDev = calculateStdDev(monthlyIncomes, stats.avgMonthlyIncome);
        stats.expenseStdDev = calculateStdDev(monthlyExpenses, stats.avgMonthlyExpense);
        
        // Calculate min and max
        stats.minMonthlyIncome = monthlyIncomes.stream().min(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
        stats.maxMonthlyIncome = monthlyIncomes.stream().max(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
        stats.minMonthlyExpense = monthlyExpenses.stream().min(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
        stats.maxMonthlyExpense = monthlyExpenses.stream().max(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
        
        // Calculate variability (coefficient of variation)
        stats.incomeVariability = calculateVariability(monthlyIncomes);
        stats.expenseVariability = calculateVariability(monthlyExpenses);
        
        return stats;
    }
    
    /**
     * Generate optimistic scenario (best case)
     */
    private ScenarioPredictionDTO.Scenario generateOptimisticScenario(TransactionStats stats, 
                                                                       BigDecimal currentBalance, 
                                                                       int months) {
        ScenarioPredictionDTO.Scenario scenario = new ScenarioPredictionDTO.Scenario();
        scenario.setName("OPTIMISTIC");
        scenario.setConfidenceLevel(calculateConfidenceLevel(stats, "OPTIMISTIC"));
        
        List<ScenarioPredictionDTO.MonthlyBreakdown> breakdown = new ArrayList<>();
        BigDecimal runningBalance = currentBalance;
        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;
        
        LocalDate startDate = LocalDate.now();
        
        for (int i = 1; i <= months; i++) {
            LocalDate monthDate = startDate.plusMonths(i);
            ScenarioPredictionDTO.MonthlyBreakdown month = new ScenarioPredictionDTO.MonthlyBreakdown();
            month.setMonth(monthDate);
            
            // Optimistic: higher income, lower expenses
            BigDecimal monthlyIncome = stats.maxMonthlyIncome.multiply(BigDecimal.valueOf(1.1));
            BigDecimal monthlyExpense = stats.minMonthlyExpense.multiply(BigDecimal.valueOf(0.85));
            
            month.setIncome(monthlyIncome);
            month.setExpense(monthlyExpense);
            
            runningBalance = runningBalance.add(monthlyIncome).subtract(monthlyExpense);
            month.setBalance(runningBalance);
            
            breakdown.add(month);
            totalIncome = totalIncome.add(monthlyIncome);
            totalExpense = totalExpense.add(monthlyExpense);
        }
        
        scenario.setMonthlyBreakdown(breakdown);
        scenario.setPredictedBalance(runningBalance);
        scenario.setTotalIncome(totalIncome);
        scenario.setTotalExpense(totalExpense);
        scenario.setNetSavings(totalIncome.subtract(totalExpense));
        scenario.setMonthlyChange(totalIncome.subtract(totalExpense).divide(BigDecimal.valueOf(months), 2, RoundingMode.HALF_UP));
        scenario.setDescription("Best case scenario: Higher income and lower expenses. This assumes favorable market conditions and disciplined spending.");
        
        return scenario;
    }
    
    /**
     * Generate pessimistic scenario (worst case)
     */
    private ScenarioPredictionDTO.Scenario generatePessimisticScenario(TransactionStats stats, 
                                                                        BigDecimal currentBalance, 
                                                                        int months) {
        ScenarioPredictionDTO.Scenario scenario = new ScenarioPredictionDTO.Scenario();
        scenario.setName("PESSIMISTIC");
        scenario.setConfidenceLevel(calculateConfidenceLevel(stats, "PESSIMISTIC"));
        
        List<ScenarioPredictionDTO.MonthlyBreakdown> breakdown = new ArrayList<>();
        BigDecimal runningBalance = currentBalance;
        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;
        
        LocalDate startDate = LocalDate.now();
        
        for (int i = 1; i <= months; i++) {
            LocalDate monthDate = startDate.plusMonths(i);
            ScenarioPredictionDTO.MonthlyBreakdown month = new ScenarioPredictionDTO.MonthlyBreakdown();
            month.setMonth(monthDate);
            
            // Pessimistic: lower income, higher expenses
            BigDecimal monthlyIncome = stats.minMonthlyIncome.multiply(BigDecimal.valueOf(0.85));
            BigDecimal monthlyExpense = stats.maxMonthlyExpense.multiply(BigDecimal.valueOf(1.2));
            
            month.setIncome(monthlyIncome);
            month.setExpense(monthlyExpense);
            
            runningBalance = runningBalance.add(monthlyIncome).subtract(monthlyExpense);
            month.setBalance(runningBalance);
            
            breakdown.add(month);
            totalIncome = totalIncome.add(monthlyIncome);
            totalExpense = totalExpense.add(monthlyExpense);
        }
        
        scenario.setMonthlyBreakdown(breakdown);
        scenario.setPredictedBalance(runningBalance);
        scenario.setTotalIncome(totalIncome);
        scenario.setTotalExpense(totalExpense);
        scenario.setNetSavings(totalIncome.subtract(totalExpense));
        scenario.setMonthlyChange(totalIncome.subtract(totalExpense).divide(BigDecimal.valueOf(months), 2, RoundingMode.HALF_UP));
        scenario.setDescription("Worst case scenario: Lower income and higher expenses. This accounts for unexpected expenses or income reduction.");
        
        return scenario;
    }
    
    /**
     * Generate most likely scenario
     */
    private ScenarioPredictionDTO.Scenario generateMostLikelyScenario(TransactionStats stats, 
                                                                       BigDecimal currentBalance, 
                                                                       int months) {
        ScenarioPredictionDTO.Scenario scenario = new ScenarioPredictionDTO.Scenario();
        scenario.setName("MOST_LIKELY");
        scenario.setConfidenceLevel(calculateConfidenceLevel(stats, "MOST_LIKELY"));
        
        List<ScenarioPredictionDTO.MonthlyBreakdown> breakdown = new ArrayList<>();
        BigDecimal runningBalance = currentBalance;
        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;
        
        LocalDate startDate = LocalDate.now();
        
        for (int i = 1; i <= months; i++) {
            LocalDate monthDate = startDate.plusMonths(i);
            ScenarioPredictionDTO.MonthlyBreakdown month = new ScenarioPredictionDTO.MonthlyBreakdown();
            month.setMonth(monthDate);
            
            // Most likely: based on historical averages
            BigDecimal monthlyIncome = stats.avgMonthlyIncome;
            BigDecimal monthlyExpense = stats.avgMonthlyExpense;
            
            // Add some realistic variation
            if (i % 3 == 0) {
                monthlyExpense = monthlyExpense.multiply(BigDecimal.valueOf(1.1)); // Higher expenses every quarter
            }
            
            month.setIncome(monthlyIncome);
            month.setExpense(monthlyExpense);
            
            runningBalance = runningBalance.add(monthlyIncome).subtract(monthlyExpense);
            month.setBalance(runningBalance);
            
            breakdown.add(month);
            totalIncome = totalIncome.add(monthlyIncome);
            totalExpense = totalExpense.add(monthlyExpense);
        }
        
        scenario.setMonthlyBreakdown(breakdown);
        scenario.setPredictedBalance(runningBalance);
        scenario.setTotalIncome(totalIncome);
        scenario.setTotalExpense(totalExpense);
        scenario.setNetSavings(totalIncome.subtract(totalExpense));
        scenario.setMonthlyChange(totalIncome.subtract(totalExpense).divide(BigDecimal.valueOf(months), 2, RoundingMode.HALF_UP));
        scenario.setDescription("Most likely scenario: Based on your historical spending and income patterns. This is the most probable outcome.");
        
        return scenario;
    }
    
    /**
     * Calculate comparison between scenarios
     */
    private ScenarioPredictionDTO.ScenarioComparison calculateComparison(
            ScenarioPredictionDTO.Scenario optimistic,
            ScenarioPredictionDTO.Scenario pessimistic,
            ScenarioPredictionDTO.Scenario mostLikely) {
        
        ScenarioPredictionDTO.ScenarioComparison comparison = new ScenarioPredictionDTO.ScenarioComparison();
        
        comparison.setOptimisticVsMostLikely(
            optimistic.getPredictedBalance().subtract(mostLikely.getPredictedBalance()));
        
        comparison.setPessimisticVsMostLikely(
            mostLikely.getPredictedBalance().subtract(pessimistic.getPredictedBalance()));
        
        comparison.setRange(
            optimistic.getPredictedBalance().subtract(pessimistic.getPredictedBalance()));
        
        // Calculate volatility score based on range relative to most likely
        double volatility = comparison.getRange().doubleValue() / mostLikely.getPredictedBalance().doubleValue() * 100;
        comparison.setVolatilityScore(Math.min(100, Math.max(0, volatility)));
        
        return comparison;
    }
    
    /**
     * Assess risk based on scenarios
     */
    private ScenarioPredictionDTO.RiskAssessment assessRisk(
            ScenarioPredictionDTO.Scenario optimistic,
            ScenarioPredictionDTO.Scenario pessimistic,
            ScenarioPredictionDTO.Scenario mostLikely,
            BigDecimal currentBalance,
            TransactionStats stats) {
        
        ScenarioPredictionDTO.RiskAssessment risk = new ScenarioPredictionDTO.RiskAssessment();
        
        // Determine risk level
        BigDecimal pessimisticBalance = pessimistic.getPredictedBalance();
        BigDecimal monthlyExpense = stats.avgMonthlyExpense;
        
        // Calculate months of safety (how long current balance would last with no income)
        int monthsOfSafety = 0;
        if (monthlyExpense.compareTo(BigDecimal.ZERO) > 0) {
            monthsOfSafety = currentBalance.divide(monthlyExpense, 0, RoundingMode.DOWN).intValue();
        }
        risk.setMonthsOfSafety(monthsOfSafety);
        
        // Emergency buffer (6 months of expenses)
        BigDecimal emergencyBuffer = monthlyExpense.multiply(BigDecimal.valueOf(6));
        risk.setEmergencyBuffer(emergencyBuffer);
        
        // Determine risk level
        if (pessimisticBalance.compareTo(BigDecimal.ZERO) < 0) {
            risk.setRiskLevel("CRITICAL");
            risk.setRiskCategory("CRITICAL");
        } else if (pessimisticBalance.compareTo(emergencyBuffer) < 0) {
            risk.setRiskLevel("HIGH");
            risk.setRiskCategory("VOLATILE");
        } else if (mostLikely.getPredictedBalance().compareTo(emergencyBuffer) < 0) {
            risk.setRiskLevel("MEDIUM");
            risk.setRiskCategory("MODERATE");
        } else {
            risk.setRiskLevel("LOW");
            risk.setRiskCategory("STABLE");
        }
        
        // Identify risk factors
        List<String> riskFactors = new ArrayList<>();
        Map<String, BigDecimal> riskContributors = new HashMap<>();
        
        if (stats.expenseVariability > 30) {
            riskFactors.add("High spending variability");
            riskContributors.put("Spending Variability", BigDecimal.valueOf(stats.expenseVariability));
        }
        
        if (stats.incomeVariability > 25) {
            riskFactors.add("Income fluctuations");
            riskContributors.put("Income Variability", BigDecimal.valueOf(stats.incomeVariability));
        }
        
        if (monthsOfSafety < 3) {
            riskFactors.add("Low emergency buffer");
            riskContributors.put("Emergency Buffer Deficit", emergencyBuffer.subtract(currentBalance));
        }
        
        if (stats.avgMonthlyIncome.compareTo(stats.avgMonthlyExpense) <= 0) {
            riskFactors.add("Expenses exceed income");
            riskContributors.put("Monthly Deficit", stats.avgMonthlyExpense.subtract(stats.avgMonthlyIncome));
        }
        
        if (riskFactors.isEmpty()) {
            riskFactors.add("Moderate risk profile");
        }
        
        risk.setRiskFactors(riskFactors);
        risk.setRiskContributors(riskContributors);
        
        return risk;
    }
    
    /**
     * Generate recommendations based on scenarios
     */
    private List<String> generateRecommendations(
            ScenarioPredictionDTO.Scenario optimistic,
            ScenarioPredictionDTO.Scenario pessimistic,
            ScenarioPredictionDTO.Scenario mostLikely,
            ScenarioPredictionDTO.RiskAssessment risk) {
        
        List<String> recommendations = new ArrayList<>();
        
        // Pessimistic scenario recommendations
        if (pessimistic.getPredictedBalance().compareTo(BigDecimal.ZERO) < 0) {
            recommendations.add("⚠️ CRITICAL: Your balance may become negative in the pessimistic scenario. Reduce expenses immediately.");
            recommendations.add("📉 Build an emergency fund of at least ₹" + risk.getEmergencyBuffer().toPlainString());
        }
        
        // Risk-based recommendations
        if (risk.getRiskLevel().equals("HIGH") || risk.getRiskLevel().equals("CRITICAL")) {
            recommendations.add("🛡️ Prioritize building a 6-month emergency fund before major investments");
            recommendations.add("📊 Review and reduce discretionary spending by 15-20%");
        } else if (risk.getRiskLevel().equals("MEDIUM")) {
            recommendations.add("⚖️ Balance your portfolio with 60% safe investments, 40% growth investments");
            recommendations.add("💰 Increase your monthly savings by 5% to improve your safety buffer");
        } else {
            recommendations.add("🚀 Consider increasing investments by 10% to accelerate wealth building");
            recommendations.add("📈 Explore tax-saving investment options for better returns");
        }
        
        // Optimistic scenario opportunities
        if (optimistic.getPredictedBalance().compareTo(mostLikely.getPredictedBalance()) > 0) {
            BigDecimal difference = optimistic.getPredictedBalance().subtract(mostLikely.getPredictedBalance());
            recommendations.add("🎯 Potential upside of ₹" + difference.toPlainString() + " with disciplined saving");
        }
        
        // General recommendations
        if (!recommendations.contains("📊 Track your spending categories monthly")) {
            recommendations.add("📊 Track your spending categories monthly");
        }
        
        if (!recommendations.contains("🔄 Review and adjust your budget quarterly")) {
            recommendations.add("🔄 Review and adjust your budget quarterly");
        }
        
        return recommendations;
    }
    
    /**
     * Calculate standard deviation
     */
    private BigDecimal calculateStdDev(List<BigDecimal> values, BigDecimal mean) {
        if (values.size() < 2) return BigDecimal.ZERO;
        
        double sumSquaredDiff = values.stream()
                .mapToDouble(v -> Math.pow(v.doubleValue() - mean.doubleValue(), 2))
                .sum();
        
        double variance = sumSquaredDiff / (values.size() - 1);
        return BigDecimal.valueOf(Math.sqrt(variance));
    }
    
    /**
     * Calculate variability (coefficient of variation as percentage)
     */
    private double calculateVariability(List<BigDecimal> values) {
        if (values.isEmpty()) return 0;
        
        double mean = values.stream()
                .mapToDouble(BigDecimal::doubleValue)
                .average()
                .orElse(0);
        
        if (mean == 0) return 0;
        
        double stdDev = Math.sqrt(values.stream()
                .mapToDouble(v -> Math.pow(v.doubleValue() - mean, 2))
                .average()
                .orElse(0));
        
        return (stdDev / mean) * 100;
    }
    
    /**
     * Calculate confidence level for a scenario
     */
    private double calculateConfidenceLevel(TransactionStats stats, String scenarioType) {
        double baseConfidence = 70;
        
        // Adjust based on data consistency
        if (stats.expenseVariability < 15 && stats.incomeVariability < 15) {
            baseConfidence += 15;
        } else if (stats.expenseVariability > 40 || stats.incomeVariability > 40) {
            baseConfidence -= 20;
        } else if (stats.expenseVariability > 25 || stats.incomeVariability > 25) {
            baseConfidence -= 10;
        }
        
        // Adjust based on scenario type
        switch (scenarioType) {
            case "OPTIMISTIC":
                baseConfidence -= 10;
                break;
            case "PESSIMISTIC":
                baseConfidence -= 15;
                break;
            case "MOST_LIKELY":
                baseConfidence += 5;
                break;
        }
        
        return Math.min(95, Math.max(30, baseConfidence));
    }
    
    /**
     * Get current balance from bank accounts
     */
    private BigDecimal getCurrentBalance(User user) {
        return bankAccountRepository.findByUser(user).stream()
                .filter(acc -> acc.isActive())
                .map(acc -> acc.getCurrentBalance())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    // Inner class for transaction statistics
    private class TransactionStats {
        BigDecimal avgMonthlyIncome = BigDecimal.ZERO;
        BigDecimal avgMonthlyExpense = BigDecimal.ZERO;
        BigDecimal incomeStdDev = BigDecimal.ZERO;
        BigDecimal expenseStdDev = BigDecimal.ZERO;
        BigDecimal minMonthlyIncome = BigDecimal.ZERO;
        BigDecimal maxMonthlyIncome = BigDecimal.ZERO;
        BigDecimal minMonthlyExpense = BigDecimal.ZERO;
        BigDecimal maxMonthlyExpense = BigDecimal.ZERO;
        double incomeVariability = 0;
        double expenseVariability = 0;
    }
}