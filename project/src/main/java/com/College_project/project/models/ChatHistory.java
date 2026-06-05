package com.College_project.project.models;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "chat_history", indexes = {
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_timestamp", columnList = "timestamp"),
    @Index(name = "idx_session_id", columnList = "session_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(nullable = false, length = 20)
    private String role; // "user" or "assistant"
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;
    
    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;
    
    @Column(name = "session_id")
    private String sessionId; // Optional: track different chat sessions
    
    @Column(name = "conversation_id")
    private String conversationId; // Group messages by conversation
    
    @Column(name = "tokens_used")
    private Integer tokensUsed; // Optional: track token usage
    
    @Column(name = "response_time_ms")
    private Integer responseTimeMs; // Optional: track performance
    
    // Constructor for quick creation
    public ChatHistory(Long userId, String role, String content, LocalDateTime timestamp) {
        this.userId = userId;
        this.role = role;
        this.content = content;
        this.timestamp = timestamp;
    }
}
