package com.College_project.project.DTOs;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class FinancialHealthDTO {
    
    // Overall score
    private int overallScore;  // 0-100
    private String grade;      // A+, A, B+, B, C, D, F
    private String status;     // EXCELLENT, GOOD, FAIR, POOR, CRITICAL
    
    // Component scores
    private ComponentScore savingsRateScore;
    private ComponentScore emergencyFundScore;
    private ComponentScore debtToIncomeScore;
    private ComponentScore budgetAdherenceScore;
    private ComponentScore investmentHealthScore;
    private ComponentScore billConsistencyScore;
    
    // Historical data
    private List<HistoricalScore> scoreHistory;
    private Map<String, BigDecimal> scoreTrend;
    
    // Detailed breakdown
    private Map<String, Object> details;
    private List<String> strengths;
    private List<String> weaknesses;
    private List<String> recommendations;
    
    // Summary
    private String summary;
    private LocalDate calculatedDate;
    
    // Getters and Setters
    public int getOverallScore() { return overallScore; }
    public void setOverallScore(int overallScore) { this.overallScore = overallScore; }
    
    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public ComponentScore getSavingsRateScore() { return savingsRateScore; }
    public void setSavingsRateScore(ComponentScore savingsRateScore) { this.savingsRateScore = savingsRateScore; }
    
    public ComponentScore getEmergencyFundScore() { return emergencyFundScore; }
    public void setEmergencyFundScore(ComponentScore emergencyFundScore) { this.emergencyFundScore = emergencyFundScore; }
    
    public ComponentScore getDebtToIncomeScore() { return debtToIncomeScore; }
    public void setDebtToIncomeScore(ComponentScore debtToIncomeScore) { this.debtToIncomeScore = debtToIncomeScore; }
    
    public ComponentScore getBudgetAdherenceScore() { return budgetAdherenceScore; }
    public void setBudgetAdherenceScore(ComponentScore budgetAdherenceScore) { this.budgetAdherenceScore = budgetAdherenceScore; }
    
    public ComponentScore getInvestmentHealthScore() { return investmentHealthScore; }
    public void setInvestmentHealthScore(ComponentScore investmentHealthScore) { this.investmentHealthScore = investmentHealthScore; }
    
    public ComponentScore getBillConsistencyScore() { return billConsistencyScore; }
    public void setBillConsistencyScore(ComponentScore billConsistencyScore) { this.billConsistencyScore = billConsistencyScore; }
    
    public List<HistoricalScore> getScoreHistory() { return scoreHistory; }
    public void setScoreHistory(List<HistoricalScore> scoreHistory) { this.scoreHistory = scoreHistory; }
    
    public Map<String, BigDecimal> getScoreTrend() { return scoreTrend; }
    public void setScoreTrend(Map<String, BigDecimal> scoreTrend) { this.scoreTrend = scoreTrend; }
    
    public Map<String, Object> getDetails() { return details; }
    public void setDetails(Map<String, Object> details) { this.details = details; }
    
    public List<String> getStrengths() { return strengths; }
    public void setStrengths(List<String> strengths) { this.strengths = strengths; }
    
    public List<String> getWeaknesses() { return weaknesses; }
    public void setWeaknesses(List<String> weaknesses) { this.weaknesses = weaknesses; }
    
    public List<String> getRecommendations() { return recommendations; }
    public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }
    
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    
    public LocalDate getCalculatedDate() { return calculatedDate; }
    public void setCalculatedDate(LocalDate calculatedDate) { this.calculatedDate = calculatedDate; }
    
    // Inner class for component scores
    public static class ComponentScore {
        private String name;
        private int score;  // 0-100
        private int weight; // percentage
        private int weightedScore;
        private String status;
        private String message;
        private BigDecimal actualValue;
        private String targetValue;
        
        public ComponentScore() {}
        
        public ComponentScore(String name, int score, int weight, String status, String message) {
            this.name = name;
            this.score = score;
            this.weight = weight;
            this.weightedScore = (score * weight) / 100;
            this.status = status;
            this.message = message;
        }
        
        // Getters and Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public int getScore() { return score; }
        public void setScore(int score) { this.score = score; }
        
        public int getWeight() { return weight; }
        public void setWeight(int weight) { this.weight = weight; }
        
        public int getWeightedScore() { return weightedScore; }
        public void setWeightedScore(int weightedScore) { this.weightedScore = weightedScore; }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        
        public BigDecimal getActualValue() { return actualValue; }
        public void setActualValue(BigDecimal actualValue) { this.actualValue = actualValue; }
        
        public String getTargetValue() { return targetValue; }
        public void setTargetValue(String targetValue) { this.targetValue = targetValue; }
    }
    
    // Inner class for historical scores
    public static class HistoricalScore {
        private LocalDate date;
        private int score;
        private String grade;
        
        public HistoricalScore() {}
        
        public HistoricalScore(LocalDate date, int score, String grade) {
            this.date = date;
            this.score = score;
            this.grade = grade;
        }
        
        public LocalDate getDate() { return date; }
        public void setDate(LocalDate date) { this.date = date; }
        
        public int getScore() { return score; }
        public void setScore(int score) { this.score = score; }
        
        public String getGrade() { return grade; }
        public void setGrade(String grade) { this.grade = grade; }
    }
}