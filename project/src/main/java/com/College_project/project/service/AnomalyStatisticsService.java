package com.College_project.project.service;

import com.College_project.project.DTOs.AnomalyStatisticsDTO;
import com.College_project.project.models.Anomaly;
import com.College_project.project.models.User;
import com.College_project.project.enums.AnomalySeverity;
import com.College_project.project.repository.anomalyRepository;
import com.College_project.project.repository.transactionRepository;
import com.College_project.project.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnomalyStatisticsService {
    
    @Autowired
    private anomalyRepository anomalyRepository;
    
    @Autowired
    private transactionRepository transactionRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Get comprehensive anomaly detection statistics
     * @param userId User ID
     * @return AnomalyStatisticsDTO with statistics
     */
    public AnomalyStatisticsDTO getAnomalyStatistics(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        AnomalyStatisticsDTO stats = new AnomalyStatisticsDTO();
        
        // Get all anomalies for the user
        List<Anomaly> anomalies = anomalyRepository.findByUser(user);
        
        // Calculate overview statistics
        stats.setOverview(calculateOverviewStats(anomalies, userId));
        
        // Calculate detection rate trend
        stats.setDetectionRateTrend(calculateDetectionRateTrend(userId));
        
        // Calculate severity breakdown
        stats.setSeverityBreakdown(calculateSeverityBreakdown(anomalies));
        
        // Calculate category breakdown
        stats.setCategoryBreakdown(calculateCategoryBreakdown(userId));
        
        // Calculate resolution statistics
        stats.setResolutionStats(calculateResolutionStats(anomalies, userId));
        
        // Calculate monthly trend
        stats.setMonthlyTrend(calculateMonthlyTrend(userId));
        
        // Generate insights and recommendations
        generateInsightsAndRecommendations(stats, anomalies);
        
        return stats;
    }
    
    /**
     * Calculate overview statistics
     */
    private AnomalyStatisticsDTO.OverviewStats calculateOverviewStats(List<Anomaly> anomalies, Long userId) {
        AnomalyStatisticsDTO.OverviewStats overview = new AnomalyStatisticsDTO.OverviewStats();
        
        long totalAnomalies = anomalies.size();
        long pendingReview = anomalies.stream()
                .filter(a -> a.getResolutionNote() == null)
                .count();
        long confirmedFraud = anomalies.stream()
                .filter(Anomaly::isFraud)
                .count();
        long falseAlarms = anomalies.stream()
                .filter(a -> !a.isFraud() && a.getResolutionNote() != null)
                .count();
        
        // Calculate detection rate (based on total transactions)
        long totalTransactions = transactionRepository.countByUser(userId);
        double detectionRate = totalTransactions > 0 ? 
                (double) totalAnomalies / totalTransactions * 100 : 0;
        
        // Calculate false positive rate
        double falsePositiveRate = totalAnomalies > 0 ?
                (double) falseAlarms / totalAnomalies * 100 : 0;
        
        // Calculate resolution rate
        double resolutionRate = totalAnomalies > 0 ?
                (double) (confirmedFraud + falseAlarms) / totalAnomalies * 100 : 0;
        
        // Calculate total financial impact (confirmed fraud amounts)
        BigDecimal totalFinancialImpact = anomalyRepository.getTotalFraudAmount(userId);
        if (totalFinancialImpact == null) totalFinancialImpact = BigDecimal.ZERO;
        
        overview.setTotalAnomalies(totalAnomalies);
        overview.setPendingReview(pendingReview);
        overview.setConfirmedFraud(confirmedFraud);
        overview.setFalseAlarms(falseAlarms);
        overview.setDetectionRate(Math.round(detectionRate * 100.0) / 100.0);
        overview.setFalsePositiveRate(Math.round(falsePositiveRate * 100.0) / 100.0);
        overview.setResolutionRate(Math.round(resolutionRate * 100.0) / 100.0);
        overview.setTotalFinancialImpact(totalFinancialImpact);
        
        return overview;
    }
    
    /**
     * Calculate detection rate trend over time
     */
    private AnomalyStatisticsDTO.DetectionRateTrend calculateDetectionRateTrend(Long userId) {
        AnomalyStatisticsDTO.DetectionRateTrend trend = new AnomalyStatisticsDTO.DetectionRateTrend();
        
        LocalDateTime threeMonthsAgo = LocalDateTime.now().minusMonths(3);
        List<Object[]> dailyCounts = anomalyRepository.getDailyAnomalyCounts(userId, threeMonthsAgo);
        
        // Get total transactions per day (simplified - using anomaly dates as proxy)
        Map<LocalDate, Long> anomalyCountByDay = new HashMap<>();
        for (Object[] row : dailyCounts) {
            LocalDate date = ((java.sql.Date) row[0]).toLocalDate();
            long count = ((Number) row[1]).longValue();
            anomalyCountByDay.put(date, count);
        }
        
        // Generate weekly trend points
        List<AnomalyStatisticsDTO.TrendPoint> weeklyTrend = new ArrayList<>();
        LocalDate currentDate = LocalDate.now().minusWeeks(4);
        
        for (int i = 0; i < 4; i++) {
            LocalDate weekStart = currentDate.plusWeeks(i);
            LocalDate weekEnd = weekStart.plusDays(6);
            
            long weekAnomalies = 0;
            for (Map.Entry<LocalDate, Long> entry : anomalyCountByDay.entrySet()) {
                if (!entry.getKey().isBefore(weekStart) && !entry.getKey().isAfter(weekEnd)) {
                    weekAnomalies += entry.getValue();
                }
            }
            
            // Estimate total transactions (using daily average of 10 transactions as baseline)
            long estimatedTransactions = 10 * 7;
            double detectionRate = estimatedTransactions > 0 ? 
                    (double) weekAnomalies / estimatedTransactions * 100 : 0;
            
            weeklyTrend.add(new AnomalyStatisticsDTO.TrendPoint(weekStart, 
                    Math.round(detectionRate * 100.0) / 100.0, weekAnomalies));
        }
        
        trend.setWeeklyTrend(weeklyTrend);
        
        // Calculate overall change
        if (weeklyTrend.size() >= 2) {
            double firstRate = weeklyTrend.get(0).getDetectionRate();
            double lastRate = weeklyTrend.get(weeklyTrend.size() - 1).getDetectionRate();
            trend.setOverallChange(Math.round((lastRate - firstRate) * 100.0) / 100.0);
            trend.setDirection(lastRate >= firstRate ? "INCREASING" : "DECREASING");
        } else {
            trend.setOverallChange(0);
            trend.setDirection("STABLE");
        }
        
        return trend;
    }
    
    /**
     * Calculate severity breakdown
     */
    private AnomalyStatisticsDTO.SeverityBreakdown calculateSeverityBreakdown(List<Anomaly> anomalies) {
        AnomalyStatisticsDTO.SeverityBreakdown breakdown = new AnomalyStatisticsDTO.SeverityBreakdown();
        
        long high = anomalies.stream()
                .filter(a -> a.getSeverity() == AnomalySeverity.HIGH)
                .count();
        long medium = anomalies.stream()
                .filter(a -> a.getSeverity() == AnomalySeverity.MEDIUM)
                .count();
        long low = anomalies.stream()
                .filter(a -> a.getSeverity() == AnomalySeverity.LOW)
                .count();
        
        long total = high + medium + low;
        
        breakdown.setHighSeverity(high);
        breakdown.setMediumSeverity(medium);
        breakdown.setLowSeverity(low);
        breakdown.setHighPercentage(total > 0 ? (double) high / total * 100 : 0);
        breakdown.setMediumPercentage(total > 0 ? (double) medium / total * 100 : 0);
        breakdown.setLowPercentage(total > 0 ? (double) low / total * 100 : 0);
        
        return breakdown;
    }
    
    /**
     * Calculate category breakdown for anomalies
     */
    private List<AnomalyStatisticsDTO.CategoryAnomalyStats> calculateCategoryBreakdown(Long userId) {
        List<AnomalyStatisticsDTO.CategoryAnomalyStats> categoryStats = new ArrayList<>();
        
        List<Object[]> results = anomalyRepository.getCategoryAnomalyStats(userId);
        
        for (Object[] row : results) {
            String categoryName = (String) row[0];
            Long count = ((Number) row[1]).longValue();
            BigDecimal totalAmount = (BigDecimal) row[2];
            
            // Get confirmed fraud count for this category
            // This would require a more complex query, simplified here
            long confirmedFraud = 0;
            double fraudRate = count > 0 ? (double) confirmedFraud / count * 100 : 0;
            
            AnomalyStatisticsDTO.CategoryAnomalyStats stats = new AnomalyStatisticsDTO.CategoryAnomalyStats();
            stats.setCategoryName(categoryName);
            stats.setAnomalyCount(count);
            stats.setConfirmedFraud(confirmedFraud);
            stats.setFraudRate(Math.round(fraudRate * 100.0) / 100.0);
            stats.setTotalAmount(totalAmount != null ? totalAmount : BigDecimal.ZERO);
            
            categoryStats.add(stats);
        }
        
        return categoryStats;
    }
    
    /**
     * Calculate resolution statistics
/**
 * Calculate resolution statistics
 */
/**
 * Calculate resolution statistics
 */
/**
 * Calculate resolution statistics
 */
private AnomalyStatisticsDTO.ResolutionStats calculateResolutionStats(List<Anomaly> anomalies, Long userId) {
    AnomalyStatisticsDTO.ResolutionStats stats = new AnomalyStatisticsDTO.ResolutionStats();
    
    long resolved = anomalies.stream()
            .filter(a -> a.getResolutionNote() != null)
            .count();
    long unresolved = anomalies.size() - resolved;
    
    // Calculate average resolution time in hours - FIXED for LocalDateTime
    double avgHours = anomalies.stream()
            .filter(a -> a.getResolutionNote() != null && a.getResolvedAt() != null)
            .mapToLong(a -> {
                // Calculate hours between reportedAt and resolvedAt
                return java.time.Duration.between(a.getReportedAt(), a.getResolvedAt()).toHours();
            })
            .average()
            .orElse(0);
    
    double avgDays = avgHours / 24;
    
    // Resolution by type
    Map<String, Long> resolutionByType = new HashMap<>();
    resolutionByType.put("CONFIRMED_FRAUD", anomalies.stream().filter(Anomaly::isFraud).count());
    resolutionByType.put("FALSE_ALARM", anomalies.stream()
            .filter(a -> !a.isFraud() && a.getResolutionNote() != null)
            .count());
    resolutionByType.put("PENDING", unresolved);
    
    stats.setResolved(resolved);
    stats.setUnresolved(unresolved);
    stats.setAvgResolutionTimeDays(Math.round(avgDays * 100.0) / 100.0);
    stats.setResolutionByType(resolutionByType);
    
    return stats;
}
    
    /**
     * Calculate monthly trend
     */
    private List<AnomalyStatisticsDTO.MonthlyTrend> calculateMonthlyTrend(Long userId) {
        List<AnomalyStatisticsDTO.MonthlyTrend> monthlyTrends = new ArrayList<>();
        
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);
        List<Object[]> monthlyCounts = anomalyRepository.getMonthlyAnomalyCounts(userId, sixMonthsAgo);
        
        // Get all anomalies to determine status
        List<Anomaly> allAnomalies = anomalyRepository.findByUser_UserIdOrderByReportedAtDesc(userId);
        Map<String, List<Anomaly>> anomaliesByMonth = allAnomalies.stream()
                .collect(Collectors.groupingBy(a -> a.getReportedAt().format(DateTimeFormatter.ofPattern("yyyy-MM"))));
        
        for (Object[] row : monthlyCounts) {
            String monthStr = (String) row[0];
            long total = ((Number) row[1]).longValue();
            
            String[] parts = monthStr.split("-");
            int year = Integer.parseInt(parts[0]);
            int month = Integer.parseInt(parts[1]);
            
            List<Anomaly> monthAnomalies = anomaliesByMonth.getOrDefault(monthStr, new ArrayList<>());
            long confirmed = monthAnomalies.stream().filter(Anomaly::isFraud).count();
            long falseAlarms = monthAnomalies.stream()
                    .filter(a -> !a.isFraud() && a.getResolutionNote() != null)
                    .count();
            long pending = total - confirmed - falseAlarms;
            
            AnomalyStatisticsDTO.MonthlyTrend trend = new AnomalyStatisticsDTO.MonthlyTrend();
            trend.setMonth(LocalDate.of(year, month, 1));
            trend.setTotalAnomalies(total);
            trend.setConfirmedFraud(confirmed);
            trend.setFalseAlarms(falseAlarms);
            trend.setPending(pending);
            
            monthlyTrends.add(trend);
        }
        
        // Reverse to show chronological order
        Collections.reverse(monthlyTrends);
        
        return monthlyTrends;
    }
    
    /**
     * Generate insights and recommendations
     */
    private void generateInsightsAndRecommendations(AnomalyStatisticsDTO stats, List<Anomaly> anomalies) {
        List<String> insights = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();
        
        AnomalyStatisticsDTO.OverviewStats overview = stats.getOverview();
        
        // Detection rate insight
        if (overview.getDetectionRate() > 5) {
            insights.add(String.format("🔍 High detection rate: %.1f%% of transactions flagged as anomalies", 
                overview.getDetectionRate()));
        } else if (overview.getDetectionRate() > 2) {
            insights.add(String.format("📊 Moderate detection rate: %.1f%% of transactions flagged", 
                overview.getDetectionRate()));
        } else {
            insights.add("✅ Low anomaly detection rate - your spending pattern is consistent");
        }
        
        // False positive insight
        if (overview.getFalsePositiveRate() > 30) {
            insights.add(String.format("⚠️ High false positive rate (%.1f%%). Review detection sensitivity.", 
                overview.getFalsePositiveRate()));
            recommendations.add("Adjust anomaly detection thresholds to reduce false alarms");
        }
        
        // Resolution insight
        if (overview.getResolutionRate() < 50 && overview.getTotalAnomalies() > 5) {
            insights.add("📋 Many anomalies pending review. Regular review improves security.");
            recommendations.add("Set up weekly anomaly review reminders");
        }
        
        // Severity insight
        AnomalyStatisticsDTO.SeverityBreakdown severity = stats.getSeverityBreakdown();
        if (severity.getHighSeverity() > 0) {
            insights.add(String.format("🚨 %d high severity anomalies require immediate attention", 
                severity.getHighSeverity()));
            recommendations.add("Review high severity anomalies first - they may indicate fraud");
        }
        
        // Financial impact insight
        if (overview.getTotalFinancialImpact().compareTo(BigDecimal.ZERO) > 0) {
            insights.add(String.format("💰 Confirmed fraud total: ₹%s", 
                overview.getTotalFinancialImpact().toPlainString()));
            recommendations.add("Contact your bank about confirmed fraudulent transactions");
        }
        
        // Category insights
        if (!stats.getCategoryBreakdown().isEmpty()) {
            AnomalyStatisticsDTO.CategoryAnomalyStats topCategory = stats.getCategoryBreakdown().get(0);
            insights.add(String.format("📂 Most anomalies occur in '%s' category", 
                topCategory.getCategoryName()));
        }
        
        // General recommendations
        if (recommendations.isEmpty()) {
            recommendations.add("✅ Your account security is good. Continue monitoring transactions");
            recommendations.add("📱 Enable real-time notifications for all transactions");
        }
        
        recommendations.add("🔒 Review flagged transactions promptly to prevent fraud");
        
        stats.setInsights(insights);
        stats.setRecommendations(recommendations);
    }
}