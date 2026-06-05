package com.College_project.project.DTOs;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class ScenarioPredictionDTO {
    
    // Scenario types
    private Scenario optimistic;
    private Scenario pessimistic;
    private Scenario mostLikely;
    
    // Comparison
    private ScenarioComparison comparison;
    
    // Risk assessment
    private RiskAssessment riskAssessment;
    
    // Recommendations
    private List<String> recommendations;
    
    // Getters and Setters
    public Scenario getOptimistic() { return optimistic; }
    public void setOptimistic(Scenario optimistic) { this.optimistic = optimistic; }
    
    public Scenario getPessimistic() { return pessimistic; }
    public void setPessimistic(Scenario pessimistic) { this.pessimistic = pessimistic; }
    
    public Scenario getMostLikely() { return mostLikely; }
    public void setMostLikely(Scenario mostLikely) { this.mostLikely = mostLikely; }
    
    public ScenarioComparison getComparison() { return comparison; }
    public void setComparison(ScenarioComparison comparison) { this.comparison = comparison; }
    
    public RiskAssessment getRiskAssessment() { return riskAssessment; }
    public void setRiskAssessment(RiskAssessment riskAssessment) { this.riskAssessment = riskAssessment; }
    
    public List<String> getRecommendations() { return recommendations; }
    public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }
    
    // Inner class for Scenario
    public static class Scenario {
        private String name; // OPTIMISTIC, PESSIMISTIC, MOST_LIKELY
        private BigDecimal predictedBalance;
        private BigDecimal totalIncome;
        private BigDecimal totalExpense;
        private BigDecimal netSavings;
        private BigDecimal monthlyChange;
        private double confidenceLevel; // 0-100
        private List<MonthlyBreakdown> monthlyBreakdown;
        private String description;
        
        // Getters and Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public BigDecimal getPredictedBalance() { return predictedBalance; }
        public void setPredictedBalance(BigDecimal predictedBalance) { this.predictedBalance = predictedBalance; }
        
        public BigDecimal getTotalIncome() { return totalIncome; }
        public void setTotalIncome(BigDecimal totalIncome) { this.totalIncome = totalIncome; }
        
        public BigDecimal getTotalExpense() { return totalExpense; }
        public void setTotalExpense(BigDecimal totalExpense) { this.totalExpense = totalExpense; }
        
        public BigDecimal getNetSavings() { return netSavings; }
        public void setNetSavings(BigDecimal netSavings) { this.netSavings = netSavings; }
        
        public BigDecimal getMonthlyChange() { return monthlyChange; }
        public void setMonthlyChange(BigDecimal monthlyChange) { this.monthlyChange = monthlyChange; }
        
        public double getConfidenceLevel() { return confidenceLevel; }
        public void setConfidenceLevel(double confidenceLevel) { this.confidenceLevel = confidenceLevel; }
        
        public List<MonthlyBreakdown> getMonthlyBreakdown() { return monthlyBreakdown; }
        public void setMonthlyBreakdown(List<MonthlyBreakdown> monthlyBreakdown) { this.monthlyBreakdown = monthlyBreakdown; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }
    
    // Inner class for Monthly Breakdown
    public static class MonthlyBreakdown {
        private LocalDate month;
        private BigDecimal income;
        private BigDecimal expense;
        private BigDecimal balance;
        
        // Getters and Setters
        public LocalDate getMonth() { return month; }
        public void setMonth(LocalDate month) { this.month = month; }
        
        public BigDecimal getIncome() { return income; }
        public void setIncome(BigDecimal income) { this.income = income; }
        
        public BigDecimal getExpense() { return expense; }
        public void setExpense(BigDecimal expense) { this.expense = expense; }
        
        public BigDecimal getBalance() { return balance; }
        public void setBalance(BigDecimal balance) { this.balance = balance; }
    }
    
    // Inner class for Scenario Comparison
    public static class ScenarioComparison {
        private BigDecimal optimisticVsMostLikely;
        private BigDecimal pessimisticVsMostLikely;
        private BigDecimal range;
        private double volatilityScore;
        
        // Getters and Setters
        public BigDecimal getOptimisticVsMostLikely() { return optimisticVsMostLikely; }
        public void setOptimisticVsMostLikely(BigDecimal optimisticVsMostLikely) { this.optimisticVsMostLikely = optimisticVsMostLikely; }
        
        public BigDecimal getPessimisticVsMostLikely() { return pessimisticVsMostLikely; }
        public void setPessimisticVsMostLikely(BigDecimal pessimisticVsMostLikely) { this.pessimisticVsMostLikely = pessimisticVsMostLikely; }
        
        public BigDecimal getRange() { return range; }
        public void setRange(BigDecimal range) { this.range = range; }
        
        public double getVolatilityScore() { return volatilityScore; }
        public void setVolatilityScore(double volatilityScore) { this.volatilityScore = volatilityScore; }
    }
    
    // Inner class for Risk Assessment
    public static class RiskAssessment {
        private String riskLevel; // LOW, MEDIUM, HIGH, CRITICAL
        private String riskCategory; // STABLE, MODERATE, VOLATILE, CRITICAL
        private BigDecimal emergencyBuffer;
        private int monthsOfSafety;
        private List<String> riskFactors;
        private Map<String, BigDecimal> riskContributors;
        
        // Getters and Setters
        public String getRiskLevel() { return riskLevel; }
        public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
        
        public String getRiskCategory() { return riskCategory; }
        public void setRiskCategory(String riskCategory) { this.riskCategory = riskCategory; }
        
        public BigDecimal getEmergencyBuffer() { return emergencyBuffer; }
        public void setEmergencyBuffer(BigDecimal emergencyBuffer) { this.emergencyBuffer = emergencyBuffer; }
        
        public int getMonthsOfSafety() { return monthsOfSafety; }
        public void setMonthsOfSafety(int monthsOfSafety) { this.monthsOfSafety = monthsOfSafety; }
        
        public List<String> getRiskFactors() { return riskFactors; }
        public void setRiskFactors(List<String> riskFactors) { this.riskFactors = riskFactors; }
        
        public Map<String, BigDecimal> getRiskContributors() { return riskContributors; }
        public void setRiskContributors(Map<String, BigDecimal> riskContributors) { this.riskContributors = riskContributors; }
    }
}