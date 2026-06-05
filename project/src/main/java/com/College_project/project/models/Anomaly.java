package com.College_project.project.models;

import com.College_project.project.enums.AnomalySeverity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "anomalies")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Anomaly {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long anomalyId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id")
    private Transaction transaction;
    
    @Column(nullable = false, length = 500)
    private String reason;
    
    @Enumerated(EnumType.STRING)
    private AnomalySeverity severity;
    
    private boolean isFraud = false;
    
    private LocalDateTime reportedAt;
    
    private LocalDateTime resolvedAt;  // ✅ Changed from String to LocalDateTime
    
    @Column(length = 500)
    private String resolutionNote;
    
    // Constructors
    public Anomaly() {
        this.reportedAt = LocalDateTime.now();
    }
    
    public Anomaly(User user, Transaction transaction, String reason, AnomalySeverity severity) {
        this.user = user;
        this.transaction = transaction;
        this.reason = reason;
        this.severity = severity;
        this.reportedAt = LocalDateTime.now();
        this.isFraud = false;
    }
    
    // Getters and Setters
    public Long getAnomalyId() {
        return anomalyId;
    }
    
    public void setAnomalyId(Long anomalyId) {
        this.anomalyId = anomalyId;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public Transaction getTransaction() {
        return transaction;
    }
    
    public void setTransaction(Transaction transaction) {
        this.transaction = transaction;
    }
    
    public String getReason() {
        return reason;
    }
    
    public void setReason(String reason) {
        this.reason = reason;
    }
    
    public AnomalySeverity getSeverity() {
        return severity;
    }
    
    public void setSeverity(AnomalySeverity severity) {
        this.severity = severity;
    }
    
    public boolean isFraud() {
        return isFraud;
    }
    
    public void setFraud(boolean fraud) {
        isFraud = fraud;
    }
    
    public LocalDateTime getReportedAt() {
        return reportedAt;
    }
    
    public void setReportedAt(LocalDateTime reportedAt) {
        this.reportedAt = reportedAt;
    }
    
    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }
    
    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }
    
    public String getResolutionNote() {
        return resolutionNote;
    }
    
    public void setResolutionNote(String resolutionNote) {
        this.resolutionNote = resolutionNote;
    }
}