package com.College_project.project.DTOs;

import jakarta.validation.constraints.NotNull;

public class AnomalyRequest {
    
    @NotNull(message = "Transaction ID is required")
    private Long transactionId;
    
    private String notes;
    
    // Getters and Setters
    public Long getTransactionId() { return transactionId; }
    public void setTransactionId(Long transactionId) { this.transactionId = transactionId; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}