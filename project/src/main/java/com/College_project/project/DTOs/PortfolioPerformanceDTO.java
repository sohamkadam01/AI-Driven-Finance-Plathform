package com.College_project.project.DTOs;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class PortfolioPerformanceDTO {
    
    // Current portfolio status
    private PortfolioSummary summary;
    
    // Performance over time
    private List<PerformancePoint> performanceHistory;
    private List<PerformancePoint> weeklyPerformance;
    private List<PerformancePoint> monthlyPerformance;
    private List<PerformancePoint> yearlyPerformance;
    
    // Returns analysis
    private ReturnsAnalysis returnsAnalysis;
    
    // Benchmark comparison
    private BenchmarkComparison benchmarkComparison;
    
    // Asset allocation
    private List<AssetAllocation> assetAllocation;
    
    // Top performers
    private List<InvestmentPerformance> topPerformers;
    private List<InvestmentPerformance> bottomPerformers;
    
    // Insights
    private String overallInsight;
    private List<String> recommendations;
    
    // Getters and Setters
    public PortfolioSummary getSummary() { return summary; }
    public void setSummary(PortfolioSummary summary) { this.summary = summary; }
    
    public List<PerformancePoint> getPerformanceHistory() { return performanceHistory; }
    public void setPerformanceHistory(List<PerformancePoint> performanceHistory) { this.performanceHistory = performanceHistory; }
    
    public List<PerformancePoint> getWeeklyPerformance() { return weeklyPerformance; }
    public void setWeeklyPerformance(List<PerformancePoint> weeklyPerformance) { this.weeklyPerformance = weeklyPerformance; }
    
    public List<PerformancePoint> getMonthlyPerformance() { return monthlyPerformance; }
    public void setMonthlyPerformance(List<PerformancePoint> monthlyPerformance) { this.monthlyPerformance = monthlyPerformance; }
    
    public List<PerformancePoint> getYearlyPerformance() { return yearlyPerformance; }
    public void setYearlyPerformance(List<PerformancePoint> yearlyPerformance) { this.yearlyPerformance = yearlyPerformance; }
    
    public ReturnsAnalysis getReturnsAnalysis() { return returnsAnalysis; }
    public void setReturnsAnalysis(ReturnsAnalysis returnsAnalysis) { this.returnsAnalysis = returnsAnalysis; }
    
    public BenchmarkComparison getBenchmarkComparison() { return benchmarkComparison; }
    public void setBenchmarkComparison(BenchmarkComparison benchmarkComparison) { this.benchmarkComparison = benchmarkComparison; }
    
    public List<AssetAllocation> getAssetAllocation() { return assetAllocation; }
    public void setAssetAllocation(List<AssetAllocation> assetAllocation) { this.assetAllocation = assetAllocation; }
    
    public List<InvestmentPerformance> getTopPerformers() { return topPerformers; }
    public void setTopPerformers(List<InvestmentPerformance> topPerformers) { this.topPerformers = topPerformers; }
    
    public List<InvestmentPerformance> getBottomPerformers() { return bottomPerformers; }
    public void setBottomPerformers(List<InvestmentPerformance> bottomPerformers) { this.bottomPerformers = bottomPerformers; }
    
    public String getOverallInsight() { return overallInsight; }
    public void setOverallInsight(String overallInsight) { this.overallInsight = overallInsight; }
    
    public List<String> getRecommendations() { return recommendations; }
    public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }
    
    // Inner class for Portfolio Summary
    public static class PortfolioSummary {
        private BigDecimal totalInvested;
        private BigDecimal currentValue;
        private BigDecimal totalProfitLoss;
        private double totalReturnsPercentage;
        private int numberOfInvestments;
        private int numberOfProfitableInvestments;
        private int numberOfLossMakingInvestments;
        private LocalDate lastUpdated;
        
        // Getters and Setters
        public BigDecimal getTotalInvested() { return totalInvested; }
        public void setTotalInvested(BigDecimal totalInvested) { this.totalInvested = totalInvested; }
        
        public BigDecimal getCurrentValue() { return currentValue; }
        public void setCurrentValue(BigDecimal currentValue) { this.currentValue = currentValue; }
        
        public BigDecimal getTotalProfitLoss() { return totalProfitLoss; }
        public void setTotalProfitLoss(BigDecimal totalProfitLoss) { this.totalProfitLoss = totalProfitLoss; }
        
        public double getTotalReturnsPercentage() { return totalReturnsPercentage; }
        public void setTotalReturnsPercentage(double totalReturnsPercentage) { this.totalReturnsPercentage = totalReturnsPercentage; }
        
        public int getNumberOfInvestments() { return numberOfInvestments; }
        public void setNumberOfInvestments(int numberOfInvestments) { this.numberOfInvestments = numberOfInvestments; }
        
        public int getNumberOfProfitableInvestments() { return numberOfProfitableInvestments; }
        public void setNumberOfProfitableInvestments(int numberOfProfitableInvestments) { this.numberOfProfitableInvestments = numberOfProfitableInvestments; }
        
        public int getNumberOfLossMakingInvestments() { return numberOfLossMakingInvestments; }
        public void setNumberOfLossMakingInvestments(int numberOfLossMakingInvestments) { this.numberOfLossMakingInvestments = numberOfLossMakingInvestments; }
        
        public LocalDate getLastUpdated() { return lastUpdated; }
        public void setLastUpdated(LocalDate lastUpdated) { this.lastUpdated = lastUpdated; }
    }
    
    // Inner class for Performance Point
    public static class PerformancePoint {
        private LocalDate date;
        private BigDecimal value;
        private BigDecimal investedAmount;
        private BigDecimal returns;
        private double returnsPercentage;
        
        // Getters and Setters
        public LocalDate getDate() { return date; }
        public void setDate(LocalDate date) { this.date = date; }
        
        public BigDecimal getValue() { return value; }
        public void setValue(BigDecimal value) { this.value = value; }
        
        public BigDecimal getInvestedAmount() { return investedAmount; }
        public void setInvestedAmount(BigDecimal investedAmount) { this.investedAmount = investedAmount; }
        
        public BigDecimal getReturns() { return returns; }
        public void setReturns(BigDecimal returns) { this.returns = returns; }
        
        public double getReturnsPercentage() { return returnsPercentage; }
        public void setReturnsPercentage(double returnsPercentage) { this.returnsPercentage = returnsPercentage; }
    }
    
    // Inner class for Returns Analysis
    public static class ReturnsAnalysis {
        private BigDecimal totalReturns;
        private double totalReturnsPercentage;
        private double annualizedReturns;
        private double cagr; // Compound Annual Growth Rate
        private BigDecimal bestDayReturn;
        private BigDecimal worstDayReturn;
        private LocalDate bestDayDate;
        private LocalDate worstDayDate;
        private double volatility; // Standard deviation of returns
        private double sharpeRatio;
        private double maxDrawdown;
        private String drawdownPeriod;
        
        // Getters and Setters
        public BigDecimal getTotalReturns() { return totalReturns; }
        public void setTotalReturns(BigDecimal totalReturns) { this.totalReturns = totalReturns; }
        
        public double getTotalReturnsPercentage() { return totalReturnsPercentage; }
        public void setTotalReturnsPercentage(double totalReturnsPercentage) { this.totalReturnsPercentage = totalReturnsPercentage; }
        
        public double getAnnualizedReturns() { return annualizedReturns; }
        public void setAnnualizedReturns(double annualizedReturns) { this.annualizedReturns = annualizedReturns; }
        
        public double getCagr() { return cagr; }
        public void setCagr(double cagr) { this.cagr = cagr; }
        
        public BigDecimal getBestDayReturn() { return bestDayReturn; }
        public void setBestDayReturn(BigDecimal bestDayReturn) { this.bestDayReturn = bestDayReturn; }
        
        public BigDecimal getWorstDayReturn() { return worstDayReturn; }
        public void setWorstDayReturn(BigDecimal worstDayReturn) { this.worstDayReturn = worstDayReturn; }
        
        public LocalDate getBestDayDate() { return bestDayDate; }
        public void setBestDayDate(LocalDate bestDayDate) { this.bestDayDate = bestDayDate; }
        
        public LocalDate getWorstDayDate() { return worstDayDate; }
        public void setWorstDayDate(LocalDate worstDayDate) { this.worstDayDate = worstDayDate; }
        
        public double getVolatility() { return volatility; }
        public void setVolatility(double volatility) { this.volatility = volatility; }
        
        public double getSharpeRatio() { return sharpeRatio; }
        public void setSharpeRatio(double sharpeRatio) { this.sharpeRatio = sharpeRatio; }
        
        public double getMaxDrawdown() { return maxDrawdown; }
        public void setMaxDrawdown(double maxDrawdown) { this.maxDrawdown = maxDrawdown; }
        
        public String getDrawdownPeriod() { return drawdownPeriod; }
        public void setDrawdownPeriod(String drawdownPeriod) { this.drawdownPeriod = drawdownPeriod; }
    }
    
    // Inner class for Benchmark Comparison
    public static class BenchmarkComparison {
        private double portfolioReturn;
        private double benchmarkReturn;
        private double outperformance;
        private String benchmarkName;
        private List<PerformancePoint> benchmarkHistory;
        
        // Getters and Setters
        public double getPortfolioReturn() { return portfolioReturn; }
        public void setPortfolioReturn(double portfolioReturn) { this.portfolioReturn = portfolioReturn; }
        
        public double getBenchmarkReturn() { return benchmarkReturn; }
        public void setBenchmarkReturn(double benchmarkReturn) { this.benchmarkReturn = benchmarkReturn; }
        
        public double getOutperformance() { return outperformance; }
        public void setOutperformance(double outperformance) { this.outperformance = outperformance; }
        
        public String getBenchmarkName() { return benchmarkName; }
        public void setBenchmarkName(String benchmarkName) { this.benchmarkName = benchmarkName; }
        
        public List<PerformancePoint> getBenchmarkHistory() { return benchmarkHistory; }
        public void setBenchmarkHistory(List<PerformancePoint> benchmarkHistory) { this.benchmarkHistory = benchmarkHistory; }
    }
    
    // Inner class for Asset Allocation
    public static class AssetAllocation {
        private String assetType;
        private BigDecimal amount;
        private double percentage;
        private double returns;
        private String icon;
        private String color;
        
        // Getters and Setters
        public String getAssetType() { return assetType; }
        public void setAssetType(String assetType) { this.assetType = assetType; }
        
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
        
        public double getPercentage() { return percentage; }
        public void setPercentage(double percentage) { this.percentage = percentage; }
        
        public double getReturns() { return returns; }
        public void setReturns(double returns) { this.returns = returns; }
        
        public String getIcon() { return icon; }
        public void setIcon(String icon) { this.icon = icon; }
        
        public String getColor() { return color; }
        public void setColor(String color) { this.color = color; }
    }
    
    // Inner class for Investment Performance
    public static class InvestmentPerformance {
        private Long investmentId;
        private String name;
        private String symbol;
        private String type;
        private BigDecimal invested;
        private BigDecimal currentValue;
        private BigDecimal profitLoss;
        private double returnsPercentage;
        private String trend; // UP, DOWN, STABLE
        
        // Getters and Setters
        public Long getInvestmentId() { return investmentId; }
        public void setInvestmentId(Long investmentId) { this.investmentId = investmentId; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getSymbol() { return symbol; }
        public void setSymbol(String symbol) { this.symbol = symbol; }
        
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        
        public BigDecimal getInvested() { return invested; }
        public void setInvested(BigDecimal invested) { this.invested = invested; }
        
        public BigDecimal getCurrentValue() { return currentValue; }
        public void setCurrentValue(BigDecimal currentValue) { this.currentValue = currentValue; }
        
        public BigDecimal getProfitLoss() { return profitLoss; }
        public void setProfitLoss(BigDecimal profitLoss) { this.profitLoss = profitLoss; }
        
        public double getReturnsPercentage() { return returnsPercentage; }
        public void setReturnsPercentage(double returnsPercentage) { this.returnsPercentage = returnsPercentage; }
        
        public String getTrend() { return trend; }
        public void setTrend(String trend) { this.trend = trend; }
    }
}