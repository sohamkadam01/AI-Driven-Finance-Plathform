package com.College_project.project.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.College_project.project.models.ChatHistory;

@Repository
public interface ChatHistoryRepository extends JpaRepository<ChatHistory, Long> {
    
    // Get recent messages for a user
    List<ChatHistory> findByUserIdOrderByTimestampDesc(Long userId, Pageable pageable);
    
    // Get messages by conversation ID
    List<ChatHistory> findByConversationIdOrderByTimestampAsc(String conversationId);
    
    // Get messages within date range
    List<ChatHistory> findByUserIdAndTimestampBetween(Long userId, LocalDateTime start, LocalDateTime end);
    
    // Count messages by role
    @Query("SELECT COUNT(c) FROM ChatHistory c WHERE c.userId = :userId AND c.role = :role")
    long countByUserIdAndRole(@Param("userId") Long userId, @Param("role") String role);
    
    // Get recent conversations (distinct conversation IDs)
    @Query("SELECT DISTINCT c.conversationId FROM ChatHistory c WHERE c.userId = :userId GROUP BY c.conversationId ORDER BY MAX(c.timestamp) DESC")
    List<String> findRecentConversationIds(@Param("userId") Long userId, Pageable pageable);
    
    // Delete old messages (for cleanup)
    void deleteByTimestampBefore(LocalDateTime date);
    
    // ✅ FIXED: Get last N messages for context - using JPQL instead of native SQL
    @Query("SELECT c FROM ChatHistory c WHERE c.userId = :userId ORDER BY c.timestamp DESC")
    List<ChatHistory> getLastNMessages(@Param("userId") Long userId, Pageable pageable);
}