package com.College_project.project.DTOs;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class NetWorthTrendDTO {
    
    // Single point data
    private BigDecimal currentNetWorth;
    private BigDecimal totalAssets;
    private BigDecimal totalLiabilities;
    
    // Trend data
    private List<NetWorthPoint> trendData;
    private List<NetWorthPoint> monthlyTrend;
    private List<NetWorthPoint> yearlyTrend;
    
    // Summary statistics
    private BigDecimal highestNetWorth;
    private BigDecimal lowestNetWorth;
    private BigDecimal averageNetWorth;
    private BigDecimal percentageChange;
    private LocalDate highestDate;
    private LocalDate lowestDate;
    
    // Getters and Setters
    public BigDecimal getCurrentNetWorth() { return currentNetWorth; }
    public void setCurrentNetWorth(BigDecimal currentNetWorth) { this.currentNetWorth = currentNetWorth; }
    
    public BigDecimal getTotalAssets() { return totalAssets; }
    public void setTotalAssets(BigDecimal totalAssets) { this.totalAssets = totalAssets; }
    
    public BigDecimal getTotalLiabilities() { return totalLiabilities; }
    public void setTotalLiabilities(BigDecimal totalLiabilities) { this.totalLiabilities = totalLiabilities; }
    
    public List<NetWorthPoint> getTrendData() { return trendData; }
    public void setTrendData(List<NetWorthPoint> trendData) { this.trendData = trendData; }
    
    public List<NetWorthPoint> getMonthlyTrend() { return monthlyTrend; }
    public void setMonthlyTrend(List<NetWorthPoint> monthlyTrend) { this.monthlyTrend = monthlyTrend; }
    
    public List<NetWorthPoint> getYearlyTrend() { return yearlyTrend; }
    public void setYearlyTrend(List<NetWorthPoint> yearlyTrend) { this.yearlyTrend = yearlyTrend; }
    
    public BigDecimal getHighestNetWorth() { return highestNetWorth; }
    public void setHighestNetWorth(BigDecimal highestNetWorth) { this.highestNetWorth = highestNetWorth; }
    
    public BigDecimal getLowestNetWorth() { return lowestNetWorth; }
    public void setLowestNetWorth(BigDecimal lowestNetWorth) { this.lowestNetWorth = lowestNetWorth; }
    
    public BigDecimal getAverageNetWorth() { return averageNetWorth; }
    public void setAverageNetWorth(BigDecimal averageNetWorth) { this.averageNetWorth = averageNetWorth; }
    
    public BigDecimal getPercentageChange() { return percentageChange; }
    public void setPercentageChange(BigDecimal percentageChange) { this.percentageChange = percentageChange; }
    
    public LocalDate getHighestDate() { return highestDate; }
    public void setHighestDate(LocalDate highestDate) { this.highestDate = highestDate; }
    
    public LocalDate getLowestDate() { return lowestDate; }
    public void setLowestDate(LocalDate lowestDate) { this.lowestDate = lowestDate; }
    
    // Inner class for trend points
    public static class NetWorthPoint {
        private LocalDate date;
        private BigDecimal netWorth;
        private BigDecimal assets;
        private BigDecimal liabilities;
        
        public NetWorthPoint() {}
        
        public NetWorthPoint(LocalDate date, BigDecimal netWorth) {
            this.date = date;
            this.netWorth = netWorth;
        }
        
        public NetWorthPoint(LocalDate date, BigDecimal netWorth, BigDecimal assets, BigDecimal liabilities) {
            this.date = date;
            this.netWorth = netWorth;
            this.assets = assets;
            this.liabilities = liabilities;
        }
        
        // Getters and Setters
        public LocalDate getDate() { return date; }
        public void setDate(LocalDate date) { this.date = date; }
        
        public BigDecimal getNetWorth() { return netWorth; }
        public void setNetWorth(BigDecimal netWorth) { this.netWorth = netWorth; }
        
        public BigDecimal getAssets() { return assets; }
        public void setAssets(BigDecimal assets) { this.assets = assets; }
        
        public BigDecimal getLiabilities() { return liabilities; }
        public void setLiabilities(BigDecimal liabilities) { this.liabilities = liabilities; }
    }
}