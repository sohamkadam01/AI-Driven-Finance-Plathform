package com.College_project.project.DTOs;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class BudgetHistoryDTO {
    
    private List<MonthlyBudgetSummary> monthlyHistory;
    private Map<String, BigDecimal> categoryAverages;
    private BudgetPerformanceSummary performanceSummary;
    private List<BudgetTrend> trends;
    
    // Getters and Setters
    public List<MonthlyBudgetSummary> getMonthlyHistory() { return monthlyHistory; }
    public void setMonthlyHistory(List<MonthlyBudgetSummary> monthlyHistory) { this.monthlyHistory = monthlyHistory; }
    
    public Map<String, BigDecimal> getCategoryAverages() { return categoryAverages; }
    public void setCategoryAverages(Map<String, BigDecimal> categoryAverages) { this.categoryAverages = categoryAverages; }
    
    public BudgetPerformanceSummary getPerformanceSummary() { return performanceSummary; }
    public void setPerformanceSummary(BudgetPerformanceSummary performanceSummary) { this.performanceSummary = performanceSummary; }
    
    public List<BudgetTrend> getTrends() { return trends; }
    public void setTrends(List<BudgetTrend> trends) { this.trends = trends; }
    
    // Inner class for monthly budget summary
    public static class MonthlyBudgetSummary {
        private LocalDate month;
        private BigDecimal totalBudget;
        private BigDecimal totalSpent;
        private BigDecimal remaining;
        private double overallUtilization;
        private int budgetCount;
        private int exceededCount;
        private int atRiskCount;
        private List<CategoryBudgetDetail> categoryDetails;
        
        // Getters and Setters
        public LocalDate getMonth() { return month; }
        public void setMonth(LocalDate month) { this.month = month; }
        
        public BigDecimal getTotalBudget() { return totalBudget; }
        public void setTotalBudget(BigDecimal totalBudget) { this.totalBudget = totalBudget; }
        
        public BigDecimal getTotalSpent() { return totalSpent; }
        public void setTotalSpent(BigDecimal totalSpent) { this.totalSpent = totalSpent; }
        
        public BigDecimal getRemaining() { return remaining; }
        public void setRemaining(BigDecimal remaining) { this.remaining = remaining; }
        
        public double getOverallUtilization() { return overallUtilization; }
        public void setOverallUtilization(double overallUtilization) { this.overallUtilization = overallUtilization; }
        
        public int getBudgetCount() { return budgetCount; }
        public void setBudgetCount(int budgetCount) { this.budgetCount = budgetCount; }
        
        public int getExceededCount() { return exceededCount; }
        public void setExceededCount(int exceededCount) { this.exceededCount = exceededCount; }
        
        public int getAtRiskCount() { return atRiskCount; }
        public void setAtRiskCount(int atRiskCount) { this.atRiskCount = atRiskCount; }
        
        public List<CategoryBudgetDetail> getCategoryDetails() { return categoryDetails; }
        public void setCategoryDetails(List<CategoryBudgetDetail> categoryDetails) { this.categoryDetails = categoryDetails; }
    }
    
    // Inner class for category budget detail
    public static class CategoryBudgetDetail {
        private String categoryName;
        private String categoryIcon;
        private BigDecimal budgeted;
        private BigDecimal spent;
        private BigDecimal remaining;
        private double percentageUsed;
        private String status; // GOOD, WARNING, EXCEEDED
        
        // Getters and Setters
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
        
        public double getPercentageUsed() { return percentageUsed; }
        public void setPercentageUsed(double percentageUsed) { this.percentageUsed = percentageUsed; }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
    
    // Inner class for budget performance summary
    public static class BudgetPerformanceSummary {
        private int totalMonthsTracked;
        private int monthsOnTrack;
        private int monthsOverBudget;
        private double averageUtilization;
        private BigDecimal totalBudgetedOverPeriod;
        private BigDecimal totalSpentOverPeriod;
        private BigDecimal totalSavedOverPeriod;
        private String bestMonth;
        private String worstMonth;
        
        // Getters and Setters
        public int getTotalMonthsTracked() { return totalMonthsTracked; }
        public void setTotalMonthsTracked(int totalMonthsTracked) { this.totalMonthsTracked = totalMonthsTracked; }
        
        public int getMonthsOnTrack() { return monthsOnTrack; }
        public void setMonthsOnTrack(int monthsOnTrack) { this.monthsOnTrack = monthsOnTrack; }
        
        public int getMonthsOverBudget() { return monthsOverBudget; }
        public void setMonthsOverBudget(int monthsOverBudget) { this.monthsOverBudget = monthsOverBudget; }
        
        public double getAverageUtilization() { return averageUtilization; }
        public void setAverageUtilization(double averageUtilization) { this.averageUtilization = averageUtilization; }
        
        public BigDecimal getTotalBudgetedOverPeriod() { return totalBudgetedOverPeriod; }
        public void setTotalBudgetedOverPeriod(BigDecimal totalBudgetedOverPeriod) { this.totalBudgetedOverPeriod = totalBudgetedOverPeriod; }
        
        public BigDecimal getTotalSpentOverPeriod() { return totalSpentOverPeriod; }
        public void setTotalSpentOverPeriod(BigDecimal totalSpentOverPeriod) { this.totalSpentOverPeriod = totalSpentOverPeriod; }
        
        public BigDecimal getTotalSavedOverPeriod() { return totalSavedOverPeriod; }
        public void setTotalSavedOverPeriod(BigDecimal totalSavedOverPeriod) { this.totalSavedOverPeriod = totalSavedOverPeriod; }
        
        public String getBestMonth() { return bestMonth; }
        public void setBestMonth(String bestMonth) { this.bestMonth = bestMonth; }
        
        public String getWorstMonth() { return worstMonth; }
        public void setWorstMonth(String worstMonth) { this.worstMonth = worstMonth; }
    }
    
    // Inner class for budget trend
    public static class BudgetTrend {
        private String categoryName;
        private List<TrendPoint> monthlySpending;
        private double trendDirection; // positive = increasing, negative = decreasing
        private String insight;
        
        // Getters and Setters
        public String getCategoryName() { return categoryName; }
        public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
        
        public List<TrendPoint> getMonthlySpending() { return monthlySpending; }
        public void setMonthlySpending(List<TrendPoint> monthlySpending) { this.monthlySpending = monthlySpending; }
        
        public double getTrendDirection() { return trendDirection; }
        public void setTrendDirection(double trendDirection) { this.trendDirection = trendDirection; }
        
        public String getInsight() { return insight; }
        public void setInsight(String insight) { this.insight = insight; }
    }
    
    // Inner class for trend point
    public static class TrendPoint {
        private LocalDate month;
        private BigDecimal amount;
        
        public TrendPoint(LocalDate month, BigDecimal amount) {
            this.month = month;
            this.amount = amount;
        }
        
        public LocalDate getMonth() { return month; }
        public void setMonth(LocalDate month) { this.month = month; }
        
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
    }
}