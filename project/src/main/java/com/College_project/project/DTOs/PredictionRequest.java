package com.College_project.project.DTOs;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class PredictionRequest {
    
    @NotNull(message = "Start date is required")
    private LocalDate startDate;
    
    @NotNull(message = "End date is required")
    private LocalDate endDate;
    
    private String predictionMethod = "STATISTICAL"; // STATISTICAL or AI
    
    // Getters and Setters
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    
    public String getPredictionMethod() { return predictionMethod; }
    public void setPredictionMethod(String predictionMethod) { this.predictionMethod = predictionMethod; }
}