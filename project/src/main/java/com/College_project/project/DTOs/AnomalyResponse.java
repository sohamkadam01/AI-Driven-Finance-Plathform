package com.College_project.project.DTOs;

import com.College_project.project.enums.AnomalySeverity;
import java.time.LocalDateTime;

public class AnomalyResponse {
    private Long anomalyId;
    private Long transactionId;
    private String transactionDescription;
    private Double transactionAmount;
    private String reason;
    private AnomalySeverity severity;
    private boolean isFraud;
    private LocalDateTime reportedAt;
    private String resolutionNote;
    
    // Constructor
    public AnomalyResponse(Long anomalyId, Long transactionId, String transactionDescription,
                          Double transactionAmount, String reason, AnomalySeverity severity,
                          boolean isFraud, LocalDateTime reportedAt, String resolutionNote) {
        this.anomalyId = anomalyId;
        this.transactionId = transactionId;
        this.transactionDescription = transactionDescription;
        this.transactionAmount = transactionAmount;
        this.reason = reason;
        this.severity = severity;
        this.isFraud = isFraud;
        this.reportedAt = reportedAt;
        this.resolutionNote = resolutionNote;
    }
    
    // Getters and Setters
    public Long getAnomalyId() { return anomalyId; }
    public void setAnomalyId(Long anomalyId) { this.anomalyId = anomalyId; }
    
    public Long getTransactionId() { return transactionId; }
    public void setTransactionId(Long transactionId) { this.transactionId = transactionId; }
    
    public String getTransactionDescription() { return transactionDescription; }
    public void setTransactionDescription(String transactionDescription) { this.transactionDescription = transactionDescription; }
    
    public Double getTransactionAmount() { return transactionAmount; }
    public void setTransactionAmount(Double transactionAmount) { this.transactionAmount = transactionAmount; }
    
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    
    public AnomalySeverity getSeverity() { return severity; }
    public void setSeverity(AnomalySeverity severity) { this.severity = severity; }
    
    public boolean isFraud() { return isFraud; }
    public void setFraud(boolean fraud) { isFraud = fraud; }
    
    public LocalDateTime getReportedAt() { return reportedAt; }
    public void setReportedAt(LocalDateTime reportedAt) { this.reportedAt = reportedAt; }
    
    public String getResolutionNote() { return resolutionNote; }
    public void setResolutionNote(String resolutionNote) { this.resolutionNote = resolutionNote; }
}