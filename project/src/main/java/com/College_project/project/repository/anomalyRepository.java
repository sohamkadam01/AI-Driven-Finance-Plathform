package com.College_project.project.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.College_project.project.enums.AnomalySeverity;
import com.College_project.project.models.Anomaly;
import com.College_project.project.models.Transaction;
import com.College_project.project.models.User;

@Repository
public interface anomalyRepository extends JpaRepository<Anomaly, Long> {
    
    // Existing methods
    List<Anomaly> findByUser(User user);
    List<Anomaly> findByUserAndSeverity(User user, AnomalySeverity severity);
    List<Anomaly> findByTransaction(Transaction transaction);
    List<Anomaly> findByIsFraud(boolean isFraud);
    List<Anomaly> findByUser_UserIdOrderByReportedAtDesc(Long userId);
    List<Anomaly> findByUser_UserIdAndSeverityOrderByReportedAtDesc(Long userId, AnomalySeverity severity);
    
    // NEW METHODS FOR STATISTICS
    
    // Count anomalies by severity
    @Query("SELECT COUNT(a) FROM Anomaly a WHERE a.user.userId = :userId AND a.severity = :severity")
    long countByUserIdAndSeverity(@Param("userId") Long userId, @Param("severity") AnomalySeverity severity);
    
    // Count resolved vs unresolved
    @Query("SELECT COUNT(a) FROM Anomaly a WHERE a.user.userId = :userId AND a.resolutionNote IS NOT NULL")
    long countResolvedByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(a) FROM Anomaly a WHERE a.user.userId = :userId AND a.resolutionNote IS NULL")
    long countUnresolvedByUserId(@Param("userId") Long userId);
    
    // Count by fraud status
    @Query("SELECT COUNT(a) FROM Anomaly a WHERE a.user.userId = :userId AND a.isFraud = true")
    long countFraudByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(a) FROM Anomaly a WHERE a.user.userId = :userId AND a.isFraud = false AND a.resolutionNote IS NOT NULL")
    long countFalseAlarmsByUserId(@Param("userId") Long userId);
    
    // Monthly anomaly counts - FIXED: Use native query for MySQL
    @Query(value = "SELECT DATE_FORMAT(a.reported_at, '%Y-%m'), COUNT(*) FROM anomalies a " +
           "WHERE a.user_id = :userId AND a.reported_at >= :startDate " +
           "GROUP BY DATE_FORMAT(a.reported_at, '%Y-%m') ORDER BY DATE_FORMAT(a.reported_at, '%Y-%m')", 
           nativeQuery = true)
    List<Object[]> getMonthlyAnomalyCounts(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate);
    
    // Category-wise anomaly stats - FIXED: Use native query
    @Query(value = "SELECT c.name, COUNT(a.anomaly_id), SUM(t.amount) FROM anomalies a " +
           "JOIN transactions t ON a.transaction_id = t.transaction_id " +
           "LEFT JOIN categories c ON t.category_id = c.category_id " +
           "WHERE a.user_id = :userId AND t.category_id IS NOT NULL " +
           "GROUP BY c.name ORDER BY COUNT(a.anomaly_id) DESC", 
           nativeQuery = true)
    List<Object[]> getCategoryAnomalyStats(@Param("userId") Long userId);
    
    // Average resolution time in hours - FIXED: Use native query with TIMESTAMPDIFF
    @Query(value = "SELECT AVG(TIMESTAMPDIFF(HOUR, a.reported_at, a.resolved_at)) FROM anomalies a " +
           "WHERE a.user_id = :userId AND a.resolved_at IS NOT NULL", 
           nativeQuery = true)
    Double getAverageResolutionHours(@Param("userId") Long userId);
    
    // Weekly detection rate trend - FIXED: Use native query
    @Query(value = "SELECT DATE(a.reported_at), COUNT(*) FROM anomalies a " +
           "WHERE a.user_id = :userId AND a.reported_at >= :startDate " +
           "GROUP BY DATE(a.reported_at) ORDER BY DATE(a.reported_at)", 
           nativeQuery = true)
    List<Object[]> getDailyAnomalyCounts(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate);
    
    // Total financial impact (sum of transaction amounts for confirmed fraud) - FIXED: Use native query
    @Query(value = "SELECT COALESCE(SUM(t.amount), 0) FROM anomalies a " +
           "JOIN transactions t ON a.transaction_id = t.transaction_id " +
           "WHERE a.user_id = :userId AND a.is_fraud = true", 
           nativeQuery = true)
    BigDecimal getTotalFraudAmount(@Param("userId") Long userId);
}