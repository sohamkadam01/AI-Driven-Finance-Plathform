package com.College_project.project.models;


import com.College_project.project.enums.InsightType;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.College_project.project.models.User;

@Entity
@Table(name = "insights")
public class Insight {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long insightId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Enumerated(EnumType.STRING)
    private InsightType type;
    
    @Column(nullable = false, length = 500)
    private String message;
    
    private String suggestedAction;
    
    private boolean isRead = false;
    
    private boolean isApplied = false;
    
    private LocalDateTime createdAt;
    
    // Constructors
    public Insight() {
        this.createdAt = LocalDateTime.now();
    }
    
    public Insight(User user, InsightType type, String message, String suggestedAction) {
        this.user = user;
        this.type = type;
        this.message = message;
        this.suggestedAction = suggestedAction;
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getInsightId() { return insightId; }
    public void setInsightId(Long insightId) { this.insightId = insightId; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public InsightType getType() { return type; }
    public void setType(InsightType type) { this.type = type; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public String getSuggestedAction() { return suggestedAction; }
    public void setSuggestedAction(String suggestedAction) { this.suggestedAction = suggestedAction; }
    
    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }
    
    public boolean isApplied() { return isApplied; }
    public void setApplied(boolean applied) { isApplied = applied; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}