package com.College_project.project.DTOs;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class MonthlySummaryDTO {
    private LocalDate month;
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal netSavings;
    private BigDecimal savingsRate;
    private List<CategorySummary> categoryBreakdown;
    private Map<String, BigDecimal> previousMonthComparison;
    private String insight;
    
    // Getters and Setters
    public LocalDate getMonth() { return month; }
    public void setMonth(LocalDate month) { this.month = month; }
    
    public BigDecimal getTotalIncome() { return totalIncome; }
    public void setTotalIncome(BigDecimal totalIncome) { this.totalIncome = totalIncome; }
    
    public BigDecimal getTotalExpense() { return totalExpense; }
    public void setTotalExpense(BigDecimal totalExpense) { this.totalExpense = totalExpense; }
    
    public BigDecimal getNetSavings() { return netSavings; }
    public void setNetSavings(BigDecimal netSavings) { this.netSavings = netSavings; }
    
    public BigDecimal getSavingsRate() { return savingsRate; }
    public void setSavingsRate(BigDecimal savingsRate) { this.savingsRate = savingsRate; }
    
    public List<CategorySummary> getCategoryBreakdown() { return categoryBreakdown; }
    public void setCategoryBreakdown(List<CategorySummary> categoryBreakdown) { this.categoryBreakdown = categoryBreakdown; }
    
    public Map<String, BigDecimal> getPreviousMonthComparison() { return previousMonthComparison; }
    public void setPreviousMonthComparison(Map<String, BigDecimal> previousMonthComparison) { this.previousMonthComparison = previousMonthComparison; }
    
    public String getInsight() { return insight; }
    public void setInsight(String insight) { this.insight = insight; }
    
    // Inner class for category summary
    public static class CategorySummary {
        private String categoryName;
        private BigDecimal amount;
        private double percentage;
        private String icon;
        
        public String getCategoryName() { return categoryName; }
        public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
        
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
        
        public double getPercentage() { return percentage; }
        public void setPercentage(double percentage) { this.percentage = percentage; }
        
        public String getIcon() { return icon; }
        public void setIcon(String icon) { this.icon = icon; }
    }
}