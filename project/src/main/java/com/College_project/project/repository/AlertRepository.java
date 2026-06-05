package com.College_project.project.repository;

import com.College_project.project.enums.AlertType;
import com.College_project.project.models.Alert;
import com.College_project.project.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    
    // Find alerts by user (using User object)
    List<Alert> findByUser(User user);
    
    // Find alerts by user ID and read status
    List<Alert> findByUser_UserIdAndIsRead(Long userId, boolean isRead);
    
    // Find all alerts for a user ordered by creation date (NEWEST FIRST)
    List<Alert> findByUser_UserIdOrderByCreatedAtDesc(Long userId);

    // Find current alerts for a user ordered by creation date (NEWEST FIRST)
    List<Alert> findByUser_UserIdAndCreatedAtAfterOrderByCreatedAtDesc(Long userId, LocalDateTime date);
    
    // Find unread alerts for a user
    List<Alert> findByUser_UserIdAndIsReadOrderByCreatedAtDesc(Long userId, boolean isRead);

    // Find current unread alerts for a user
    List<Alert> findByUser_UserIdAndIsReadAndCreatedAtAfterOrderByCreatedAtDesc(Long userId, boolean isRead, LocalDateTime date);
    
    // Find alerts by type
    List<Alert> findByUser_UserIdAndType(Long userId, String type);
    
    // Count unread alerts for a user
    long countByUser_UserIdAndIsRead(Long userId, boolean isRead);

    // Count current unread alerts for a user
    long countByUser_UserIdAndIsReadAndCreatedAtAfter(Long userId, boolean isRead, LocalDateTime date);
    
    // Mark alert as read
    @Modifying
    @Transactional
    @Query("UPDATE Alert a SET a.isRead = true WHERE a.alertId = :alertId AND a.user.userId = :userId")
    int markAsRead(@Param("alertId") Long alertId, @Param("userId") Long userId);
    
    // Mark all alerts as read for a user
    @Modifying
    @Transactional
    @Query("UPDATE Alert a SET a.isRead = true WHERE a.user.userId = :userId AND a.isRead = false")
    int markAllAsRead(@Param("userId") Long userId);
    
    // Find alerts created after a specific date
    List<Alert> findByUser_UserIdAndCreatedAtAfter(Long userId, LocalDateTime date);
    
    // Delete old alerts (older than specified days)
    @Modifying
    @Transactional
    @Query("DELETE FROM Alert a WHERE a.user.userId = :userId AND a.createdAt < :date")
    int deleteOldAlerts(@Param("userId") Long userId, @Param("date") LocalDateTime date);
    
    // Check if an alert already exists for a specific type and date
    boolean existsByUser_UserIdAndTypeAndCreatedAtAfter(Long userId, AlertType type, LocalDateTime createdAt);
    
    // Check if an alert already exists for a specific message (to avoid duplicates)
    boolean existsByUserAndMessageContainingAndCreatedAtAfter(User user, String message, LocalDateTime dateTime);
}
