package com.College_project.project.DTOs;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class PredictionResponse {
    private LocalDate predictionDate;
    private BigDecimal predictedBalance;
    private BigDecimal confidenceScore;
    private String method;
    private List<DailyPrediction> dailyPredictions;
    private Map<String, BigDecimal> categoryBreakdown;
    private String insights;
    private List<String> riskFactors;
    private List<String> recommendations;
    private BigDecimal currentBalance;
    private Map<String, BigDecimal> metrics;
    
    // Constructor
    public PredictionResponse(LocalDate predictionDate, BigDecimal predictedBalance, 
                             BigDecimal confidenceScore, String method) {
        this.predictionDate = predictionDate;
        this.predictedBalance = predictedBalance;
        this.confidenceScore = confidenceScore;
        this.method = method;
    }
    
    // Getters and Setters
    public LocalDate getPredictionDate() {
        return predictionDate;
    }
    
    public void setPredictionDate(LocalDate predictionDate) {
        this.predictionDate = predictionDate;
    }
    
    public BigDecimal getPredictedBalance() {
        return predictedBalance;
    }
    
    public void setPredictedBalance(BigDecimal predictedBalance) {
        this.predictedBalance = predictedBalance;
    }
    
    public BigDecimal getConfidenceScore() {
        return confidenceScore;
    }
    
    public void setConfidenceScore(BigDecimal confidenceScore) {
        this.confidenceScore = confidenceScore;
    }
    
    public String getMethod() {
        return method;
    }
    
    public void setMethod(String method) {
        this.method = method;
    }
    
    public List<DailyPrediction> getDailyPredictions() {
        return dailyPredictions;
    }
    
    public void setDailyPredictions(List<DailyPrediction> dailyPredictions) {
        this.dailyPredictions = dailyPredictions;
    }
    
    public Map<String, BigDecimal> getCategoryBreakdown() {
        return categoryBreakdown;
    }
    
    public void setCategoryBreakdown(Map<String, BigDecimal> categoryBreakdown) {
        this.categoryBreakdown = categoryBreakdown;
    }
    
    public String getInsights() {
        return insights;
    }
    
    public void setInsights(String insights) {
        this.insights = insights;
    }

    public List<String> getRiskFactors() {
        return riskFactors;
    }

    public void setRiskFactors(List<String> riskFactors) {
        this.riskFactors = riskFactors;
    }

    public List<String> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<String> recommendations) {
        this.recommendations = recommendations;
    }

    public BigDecimal getCurrentBalance() {
        return currentBalance;
    }

    public void setCurrentBalance(BigDecimal currentBalance) {
        this.currentBalance = currentBalance;
    }

    public Map<String, BigDecimal> getMetrics() {
        return metrics;
    }

    public void setMetrics(Map<String, BigDecimal> metrics) {
        this.metrics = metrics;
    }
}