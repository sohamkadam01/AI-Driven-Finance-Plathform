package com.College_project.project.DTOs;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class BudgetPerformanceDTO {
    
    // Overall performance
    private int overallPerformanceScore;  // 0-100
    private String performanceGrade;      // A+, A, B+, B, C, D, F
    private String performanceStatus;     // EXCELLENT, GOOD, AVERAGE, POOR, CRITICAL
    
    // Summary statistics
    private PerformanceSummary summary;
    
    // Category-wise performance
    private List<CategoryPerformance> categoryPerformance;
    private List<CategoryPerformance> topPerformingCategories;
    private List<CategoryPerformance> bottomPerformingCategories;
    
    // Trends
    private PerformanceTrend trend;
    private Map<String, BigDecimal> monthlyPerformanceHistory;
    
    // Insights and recommendations
    private String overallInsight;
    private List<String> recommendations;
    private List<String> achievements;
    
    // Getters and Setters
    public int getOverallPerformanceScore() { return overallPerformanceScore; }
    public void setOverallPerformanceScore(int overallPerformanceScore) { this.overallPerformanceScore = overallPerformanceScore; }
    
    public String getPerformanceGrade() { return performanceGrade; }
    public void setPerformanceGrade(String performanceGrade) { this.performanceGrade = performanceGrade; }
    
    public String getPerformanceStatus() { return performanceStatus; }
    public void setPerformanceStatus(String performanceStatus) { this.performanceStatus = performanceStatus; }
    
    public PerformanceSummary getSummary() { return summary; }
    public void setSummary(PerformanceSummary summary) { this.summary = summary; }
    
    public List<CategoryPerformance> getCategoryPerformance() { return categoryPerformance; }
    public void setCategoryPerformance(List<CategoryPerformance> categoryPerformance) { this.categoryPerformance = categoryPerformance; }
    
    public List<CategoryPerformance> getTopPerformingCategories() { return topPerformingCategories; }
    public void setTopPerformingCategories(List<CategoryPerformance> topPerformingCategories) { this.topPerformingCategories = topPerformingCategories; }
    
    public List<CategoryPerformance> getBottomPerformingCategories() { return bottomPerformingCategories; }
    public void setBottomPerformingCategories(List<CategoryPerformance> bottomPerformingCategories) { this.bottomPerformingCategories = bottomPerformingCategories; }
    
    public PerformanceTrend getTrend() { return trend; }
    public void setTrend(PerformanceTrend trend) { this.trend = trend; }
    
    public Map<String, BigDecimal> getMonthlyPerformanceHistory() { return monthlyPerformanceHistory; }
    public void setMonthlyPerformanceHistory(Map<String, BigDecimal> monthlyPerformanceHistory) { this.monthlyPerformanceHistory = monthlyPerformanceHistory; }
    
    public String getOverallInsight() { return overallInsight; }
    public void setOverallInsight(String overallInsight) { this.overallInsight = overallInsight; }
    
    public List<String> getRecommendations() { return recommendations; }
    public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }
    
    public List<String> getAchievements() { return achievements; }
    public void setAchievements(List<String> achievements) { this.achievements = achievements; }
    
    // Inner class for Performance Summary
    public static class PerformanceSummary {
        private int totalCategoriesWithBudget;
        private int categoriesOnTrack;
        private int categoriesAtRisk;
        private int categoriesExceeded;
        private double onTrackPercentage;
        private BigDecimal totalBudgeted;
        private BigDecimal totalSpent;
        private BigDecimal totalSaved;
        private double averageUtilization;
        private String bestPerformingCategory;
        private String worstPerformingCategory;
        
        // Getters and Setters
        public int getTotalCategoriesWithBudget() { return totalCategoriesWithBudget; }
        public void setTotalCategoriesWithBudget(int totalCategoriesWithBudget) { this.totalCategoriesWithBudget = totalCategoriesWithBudget; }
        
        public int getCategoriesOnTrack() { return categoriesOnTrack; }
        public void setCategoriesOnTrack(int categoriesOnTrack) { this.categoriesOnTrack = categoriesOnTrack; }
        
        public int getCategoriesAtRisk() { return categoriesAtRisk; }
        public void setCategoriesAtRisk(int categoriesAtRisk) { this.categoriesAtRisk = categoriesAtRisk; }
        
        public int getCategoriesExceeded() { return categoriesExceeded; }
        public void setCategoriesExceeded(int categoriesExceeded) { this.categoriesExceeded = categoriesExceeded; }
        
        public double getOnTrackPercentage() { return onTrackPercentage; }
        public void setOnTrackPercentage(double onTrackPercentage) { this.onTrackPercentage = onTrackPercentage; }
        
        public BigDecimal getTotalBudgeted() { return totalBudgeted; }
        public void setTotalBudgeted(BigDecimal totalBudgeted) { this.totalBudgeted = totalBudgeted; }
        
        public BigDecimal getTotalSpent() { return totalSpent; }
        public void setTotalSpent(BigDecimal totalSpent) { this.totalSpent = totalSpent; }
        
        public BigDecimal getTotalSaved() { return totalSaved; }
        public void setTotalSaved(BigDecimal totalSaved) { this.totalSaved = totalSaved; }
        
        public double getAverageUtilization() { return averageUtilization; }
        public void setAverageUtilization(double averageUtilization) { this.averageUtilization = averageUtilization; }
        
        public String getBestPerformingCategory() { return bestPerformingCategory; }
        public void setBestPerformingCategory(String bestPerformingCategory) { this.bestPerformingCategory = bestPerformingCategory; }
        
        public String getWorstPerformingCategory() { return worstPerformingCategory; }
        public void setWorstPerformingCategory(String worstPerformingCategory) { this.worstPerformingCategory = worstPerformingCategory; }
    }
    
    // Inner class for Category Performance
    public static class CategoryPerformance {
        private Long categoryId;
        private String categoryName;
        private String categoryIcon;
        private BigDecimal budgeted;
        private BigDecimal spent;
        private BigDecimal remaining;
        private double utilizationPercentage;
        private int performanceScore;  // 0-100
        private String performanceLevel; // EXCELLENT, GOOD, WARNING, EXCEEDED
        private String trend; // IMPROVING, STABLE, DECLINING
        private BigDecimal threeMonthAverage;
        private String insight;
        
        // Getters and Setters
        public Long getCategoryId() { return categoryId; }
        public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
        
        public String getCategoryName() { return categoryName; }
        public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
        
        public String getCategoryIcon() { return categoryIcon; }
        public void setCategoryIcon(String categoryIcon) { this.categoryIcon = categoryIcon; }
        
        public BigDecimal getBudgeted() { return budgeted; }
        public void setBudgeted(BigDecimal budgeted) { this.budgeted = budgeted; }
        
        public BigDecimal getSpent() { return spent; }
        public void setSpent(BigDecimal spent) { this.spent = spent; }
        
        public BigDecimal getRemaining() { return remaining; }
        public void setRemaining(BigDecimal remaining) { this.remaining = remaining; }
        
        public double getUtilizationPercentage() { return utilizationPercentage; }
        public void setUtilizationPercentage(double utilizationPercentage) { this.utilizationPercentage = utilizationPercentage; }
        
        public int getPerformanceScore() { return performanceScore; }
        public void setPerformanceScore(int performanceScore) { this.performanceScore = performanceScore; }
        
        public String getPerformanceLevel() { return performanceLevel; }
        public void setPerformanceLevel(String performanceLevel) { this.performanceLevel = performanceLevel; }
        
        public String getTrend() { return trend; }
        public void setTrend(String trend) { this.trend = trend; }
        
        public BigDecimal getThreeMonthAverage() { return threeMonthAverage; }
        public void setThreeMonthAverage(BigDecimal threeMonthAverage) { this.threeMonthAverage = threeMonthAverage; }
        
        public String getInsight() { return insight; }
        public void setInsight(String insight) { this.insight = insight; }
    }
    
    // Inner class for Performance Trend
    public static class PerformanceTrend {
        private String direction; // IMPROVING, STABLE, DECLINING
        private double changePercentage;
        private List<MonthlyScore> monthlyScores;
        private String insight;
        
        // Getters and Setters
        public String getDirection() { return direction; }
        public void setDirection(String direction) { this.direction = direction; }
        
        public double getChangePercentage() { return changePercentage; }
        public void setChangePercentage(double changePercentage) { this.changePercentage = changePercentage; }
        
        public List<MonthlyScore> getMonthlyScores() { return monthlyScores; }
        public void setMonthlyScores(List<MonthlyScore> monthlyScores) { this.monthlyScores = monthlyScores; }
        
        public String getInsight() { return insight; }
        public void setInsight(String insight) { this.insight = insight; }
    }
    
    // Inner class for Monthly Score
    public static class MonthlyScore {
        private LocalDate month;
        private int score;
        private String grade;
        
        public MonthlyScore(LocalDate month, int score, String grade) {
            this.month = month;
            this.score = score;
            this.grade = grade;
        }
        
        public LocalDate getMonth() { return month; }
        public void setMonth(LocalDate month) { this.month = month; }
        
        public int getScore() { return score; }
        public void setScore(int score) { this.score = score; }
        
        public String getGrade() { return grade; }
        public void setGrade(String grade) { this.grade = grade; }
    }
}