package com.College_project.project.DTOs;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class SavingsRateDTO {
    
    // Current period data
    private BigDecimal currentMonthlyIncome;
    private BigDecimal currentMonthlyExpenses;
    private BigDecimal currentMonthlySavings;
    private BigDecimal currentSavingsRate;
    private String savingsStatus; // EXCELLENT, GOOD, AVERAGE, POOR, CRITICAL
    
    // Historical trends
    private List<MonthlySavingsData> monthlyTrend;
    private List<YearlySavingsData> yearlyTrend;
    
    // Statistics
    private BigDecimal averageSavingsRate;
    private BigDecimal bestSavingsRate;
    private BigDecimal worstSavingsRate;
    private LocalDate bestMonth;
    private LocalDate worstMonth;
    private BigDecimal totalSavingsYTD;
    private BigDecimal projectedYearEndSavings;
    
    // Insights
    private String insight;
    private List<String> recommendations;
    
    // Getters and Setters
    public BigDecimal getCurrentMonthlyIncome() { return currentMonthlyIncome; }
    public void setCurrentMonthlyIncome(BigDecimal currentMonthlyIncome) { this.currentMonthlyIncome = currentMonthlyIncome; }
    
    public BigDecimal getCurrentMonthlyExpenses() { return currentMonthlyExpenses; }
    public void setCurrentMonthlyExpenses(BigDecimal currentMonthlyExpenses) { this.currentMonthlyExpenses = currentMonthlyExpenses; }
    
    public BigDecimal getCurrentMonthlySavings() { return currentMonthlySavings; }
    public void setCurrentMonthlySavings(BigDecimal currentMonthlySavings) { this.currentMonthlySavings = currentMonthlySavings; }
    
    public BigDecimal getCurrentSavingsRate() { return currentSavingsRate; }
    public void setCurrentSavingsRate(BigDecimal currentSavingsRate) { this.currentSavingsRate = currentSavingsRate; }
    
    public String getSavingsStatus() { return savingsStatus; }
    public void setSavingsStatus(String savingsStatus) { this.savingsStatus = savingsStatus; }
    
    public List<MonthlySavingsData> getMonthlyTrend() { return monthlyTrend; }
    public void setMonthlyTrend(List<MonthlySavingsData> monthlyTrend) { this.monthlyTrend = monthlyTrend; }
    
    public List<YearlySavingsData> getYearlyTrend() { return yearlyTrend; }
    public void setYearlyTrend(List<YearlySavingsData> yearlyTrend) { this.yearlyTrend = yearlyTrend; }
    
    public BigDecimal getAverageSavingsRate() { return averageSavingsRate; }
    public void setAverageSavingsRate(BigDecimal averageSavingsRate) { this.averageSavingsRate = averageSavingsRate; }
    
    public BigDecimal getBestSavingsRate() { return bestSavingsRate; }
    public void setBestSavingsRate(BigDecimal bestSavingsRate) { this.bestSavingsRate = bestSavingsRate; }
    
    public BigDecimal getWorstSavingsRate() { return worstSavingsRate; }
    public void setWorstSavingsRate(BigDecimal worstSavingsRate) { this.worstSavingsRate = worstSavingsRate; }
    
    public LocalDate getBestMonth() { return bestMonth; }
    public void setBestMonth(LocalDate bestMonth) { this.bestMonth = bestMonth; }
    
    public LocalDate getWorstMonth() { return worstMonth; }
    public void setWorstMonth(LocalDate worstMonth) { this.worstMonth = worstMonth; }
    
    public BigDecimal getTotalSavingsYTD() { return totalSavingsYTD; }
    public void setTotalSavingsYTD(BigDecimal totalSavingsYTD) { this.totalSavingsYTD = totalSavingsYTD; }
    
    public BigDecimal getProjectedYearEndSavings() { return projectedYearEndSavings; }
    public void setProjectedYearEndSavings(BigDecimal projectedYearEndSavings) { this.projectedYearEndSavings = projectedYearEndSavings; }
    
    public String getInsight() { return insight; }
    public void setInsight(String insight) { this.insight = insight; }
    
    public List<String> getRecommendations() { return recommendations; }
    public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }
    
    // Inner class for monthly savings data
    public static class MonthlySavingsData {
        private LocalDate month;
        private BigDecimal income;
        private BigDecimal expenses;
        private BigDecimal savings;
        private BigDecimal savingsRate;
        
        public MonthlySavingsData() {}
        
        public MonthlySavingsData(LocalDate month, BigDecimal income, BigDecimal expenses, 
                                  BigDecimal savings, BigDecimal savingsRate) {
            this.month = month;
            this.income = income;
            this.expenses = expenses;
            this.savings = savings;
            this.savingsRate = savingsRate;
        }
        
        // Getters and Setters
        public LocalDate getMonth() { return month; }
        public void setMonth(LocalDate month) { this.month = month; }
        
        public BigDecimal getIncome() { return income; }
        public void setIncome(BigDecimal income) { this.income = income; }
        
        public BigDecimal getExpenses() { return expenses; }
        public void setExpenses(BigDecimal expenses) { this.expenses = expenses; }
        
        public BigDecimal getSavings() { return savings; }
        public void setSavings(BigDecimal savings) { this.savings = savings; }
        
        public BigDecimal getSavingsRate() { return savingsRate; }
        public void setSavingsRate(BigDecimal savingsRate) { this.savingsRate = savingsRate; }
    }
    
    // Inner class for yearly savings data
    public static class YearlySavingsData {
        private int year;
        private BigDecimal totalIncome;
        private BigDecimal totalExpenses;
        private BigDecimal totalSavings;
        private BigDecimal averageSavingsRate;
        
        // Getters and Setters
        public int getYear() { return year; }
        public void setYear(int year) { this.year = year; }
        
        public BigDecimal getTotalIncome() { return totalIncome; }
        public void setTotalIncome(BigDecimal totalIncome) { this.totalIncome = totalIncome; }
        
        public BigDecimal getTotalExpenses() { return totalExpenses; }
        public void setTotalExpenses(BigDecimal totalExpenses) { this.totalExpenses = totalExpenses; }
        
        public BigDecimal getTotalSavings() { return totalSavings; }
        public void setTotalSavings(BigDecimal totalSavings) { this.totalSavings = totalSavings; }
        
        public BigDecimal getAverageSavingsRate() { return averageSavingsRate; }
        public void setAverageSavingsRate(BigDecimal averageSavingsRate) { this.averageSavingsRate = averageSavingsRate; }
    }
}