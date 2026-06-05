package com.College_project.project.DTOs;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class AnomalyStatisticsDTO {
    
    // Overview statistics
    private OverviewStats overview;
    
    // Detection rate over time
    private DetectionRateTrend detectionRateTrend;
    
    // Severity breakdown
    private SeverityBreakdown severityBreakdown;
    
    // Category-wise anomalies
    private List<CategoryAnomalyStats> categoryBreakdown;
    
    // Resolution statistics
    private ResolutionStats resolutionStats;
    
    // Monthly trend
    private List<MonthlyTrend> monthlyTrend;
    
    // Insights
    private List<String> insights;
    private List<String> recommendations;
    
    // Getters and Setters
    public OverviewStats getOverview() { return overview; }
    public void setOverview(OverviewStats overview) { this.overview = overview; }
    
    public DetectionRateTrend getDetectionRateTrend() { return detectionRateTrend; }
    public void setDetectionRateTrend(DetectionRateTrend detectionRateTrend) { this.detectionRateTrend = detectionRateTrend; }
    
    public SeverityBreakdown getSeverityBreakdown() { return severityBreakdown; }
    public void setSeverityBreakdown(SeverityBreakdown severityBreakdown) { this.severityBreakdown = severityBreakdown; }
    
    public List<CategoryAnomalyStats> getCategoryBreakdown() { return categoryBreakdown; }
    public void setCategoryBreakdown(List<CategoryAnomalyStats> categoryBreakdown) { this.categoryBreakdown = categoryBreakdown; }
    
    public ResolutionStats getResolutionStats() { return resolutionStats; }
    public void setResolutionStats(ResolutionStats resolutionStats) { this.resolutionStats = resolutionStats; }
    
    public List<MonthlyTrend> getMonthlyTrend() { return monthlyTrend; }
    public void setMonthlyTrend(List<MonthlyTrend> monthlyTrend) { this.monthlyTrend = monthlyTrend; }
    
    public List<String> getInsights() { return insights; }
    public void setInsights(List<String> insights) { this.insights = insights; }
    
    public List<String> getRecommendations() { return recommendations; }
    public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }
    
    // ==================== INNER CLASSES ====================
    
    // Inner class for Overview Stats
    public static class OverviewStats {
        private long totalAnomalies;
        private long pendingReview;
        private long confirmedFraud;
        private long falseAlarms;
        private double detectionRate;
        private double falsePositiveRate;
        private double resolutionRate;
        private BigDecimal totalFinancialImpact;
        
        // Getters and Setters
        public long getTotalAnomalies() { return totalAnomalies; }
        public void setTotalAnomalies(long totalAnomalies) { this.totalAnomalies = totalAnomalies; }
        
        public long getPendingReview() { return pendingReview; }
        public void setPendingReview(long pendingReview) { this.pendingReview = pendingReview; }
        
        public long getConfirmedFraud() { return confirmedFraud; }
        public void setConfirmedFraud(long confirmedFraud) { this.confirmedFraud = confirmedFraud; }
        
        public long getFalseAlarms() { return falseAlarms; }
        public void setFalseAlarms(long falseAlarms) { this.falseAlarms = falseAlarms; }
        
        public double getDetectionRate() { return detectionRate; }
        public void setDetectionRate(double detectionRate) { this.detectionRate = detectionRate; }
        
        public double getFalsePositiveRate() { return falsePositiveRate; }
        public void setFalsePositiveRate(double falsePositiveRate) { this.falsePositiveRate = falsePositiveRate; }
        
        public double getResolutionRate() { return resolutionRate; }
        public void setResolutionRate(double resolutionRate) { this.resolutionRate = resolutionRate; }
        
        public BigDecimal getTotalFinancialImpact() { return totalFinancialImpact; }
        public void setTotalFinancialImpact(BigDecimal totalFinancialImpact) { this.totalFinancialImpact = totalFinancialImpact; }
    }
    
    // Inner class for Detection Rate Trend
    public static class DetectionRateTrend {
        private List<TrendPoint> weeklyTrend;
        private List<TrendPoint> monthlyTrend;
        private double overallChange;
        private String direction;
        
        // Getters and Setters
        public List<TrendPoint> getWeeklyTrend() { return weeklyTrend; }
        public void setWeeklyTrend(List<TrendPoint> weeklyTrend) { this.weeklyTrend = weeklyTrend; }
        
        public List<TrendPoint> getMonthlyTrend() { return monthlyTrend; }
        public void setMonthlyTrend(List<TrendPoint> monthlyTrend) { this.monthlyTrend = monthlyTrend; }
        
        public double getOverallChange() { return overallChange; }
        public void setOverallChange(double overallChange) { this.overallChange = overallChange; }
        
        public String getDirection() { return direction; }
        public void setDirection(String direction) { this.direction = direction; }
    }
    
    // Inner class for Trend Point
    public static class TrendPoint {
        private LocalDate date;
        private double detectionRate;
        private long anomaliesCount;
        
        public TrendPoint() {}
        
        public TrendPoint(LocalDate date, double detectionRate, long anomaliesCount) {
            this.date = date;
            this.detectionRate = detectionRate;
            this.anomaliesCount = anomaliesCount;
        }
        
        // Getters and Setters
        public LocalDate getDate() { return date; }
        public void setDate(LocalDate date) { this.date = date; }
        
        public double getDetectionRate() { return detectionRate; }
        public void setDetectionRate(double detectionRate) { this.detectionRate = detectionRate; }
        
        public long getAnomaliesCount() { return anomaliesCount; }
        public void setAnomaliesCount(long anomaliesCount) { this.anomaliesCount = anomaliesCount; }
    }
    
    // Inner class for Severity Breakdown
    public static class SeverityBreakdown {
        private long highSeverity;
        private long mediumSeverity;
        private long lowSeverity;
        private double highPercentage;
        private double mediumPercentage;
        private double lowPercentage;
        
        // Getters and Setters
        public long getHighSeverity() { return highSeverity; }
        public void setHighSeverity(long highSeverity) { this.highSeverity = highSeverity; }
        
        public long getMediumSeverity() { return mediumSeverity; }
        public void setMediumSeverity(long mediumSeverity) { this.mediumSeverity = mediumSeverity; }
        
        public long getLowSeverity() { return lowSeverity; }
        public void setLowSeverity(long lowSeverity) { this.lowSeverity = lowSeverity; }
        
        public double getHighPercentage() { return highPercentage; }
        public void setHighPercentage(double highPercentage) { this.highPercentage = highPercentage; }
        
        public double getMediumPercentage() { return mediumPercentage; }
        public void setMediumPercentage(double mediumPercentage) { this.mediumPercentage = mediumPercentage; }
        
        public double getLowPercentage() { return lowPercentage; }
        public void setLowPercentage(double lowPercentage) { this.lowPercentage = lowPercentage; }
    }
    
    // Inner class for Category Anomaly Stats
    public static class CategoryAnomalyStats {
        private String categoryName;
        private long anomalyCount;
        private long confirmedFraud;
        private double fraudRate;
        private BigDecimal totalAmount;
        
        // Getters and Setters
        public String getCategoryName() { return categoryName; }
        public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
        
        public long getAnomalyCount() { return anomalyCount; }
        public void setAnomalyCount(long anomalyCount) { this.anomalyCount = anomalyCount; }
        
        public long getConfirmedFraud() { return confirmedFraud; }
        public void setConfirmedFraud(long confirmedFraud) { this.confirmedFraud = confirmedFraud; }
        
        public double getFraudRate() { return fraudRate; }
        public void setFraudRate(double fraudRate) { this.fraudRate = fraudRate; }
        
        public BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    }
    
    // Inner class for Resolution Stats
    public static class ResolutionStats {
        private long resolved;
        private long unresolved;
        private double avgResolutionTimeDays;
        private Map<String, Long> resolutionByType;
        
        // Getters and Setters
        public long getResolved() { return resolved; }
        public void setResolved(long resolved) { this.resolved = resolved; }
        
        public long getUnresolved() { return unresolved; }
        public void setUnresolved(long unresolved) { this.unresolved = unresolved; }
        
        public double getAvgResolutionTimeDays() { return avgResolutionTimeDays; }
        public void setAvgResolutionTimeDays(double avgResolutionTimeDays) { this.avgResolutionTimeDays = avgResolutionTimeDays; }
        
        public Map<String, Long> getResolutionByType() { return resolutionByType; }
        public void setResolutionByType(Map<String, Long> resolutionByType) { this.resolutionByType = resolutionByType; }
    }
    
    // Inner class for Monthly Trend
    public static class MonthlyTrend {
        private LocalDate month;
        private long totalAnomalies;
        private long confirmedFraud;
        private long falseAlarms;
        private long pending;
        
        // Getters and Setters
        public LocalDate getMonth() { return month; }
        public void setMonth(LocalDate month) { this.month = month; }
        
        public long getTotalAnomalies() { return totalAnomalies; }
        public void setTotalAnomalies(long totalAnomalies) { this.totalAnomalies = totalAnomalies; }
        
        public long getConfirmedFraud() { return confirmedFraud; }
        public void setConfirmedFraud(long confirmedFraud) { this.confirmedFraud = confirmedFraud; }
        
        public long getFalseAlarms() { return falseAlarms; }
        public void setFalseAlarms(long falseAlarms) { this.falseAlarms = falseAlarms; }
        
        public long getPending() { return pending; }
        public void setPending(long pending) { this.pending = pending; }
    }
}