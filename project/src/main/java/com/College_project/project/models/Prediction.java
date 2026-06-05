package com.College_project.project.models;


import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import com.College_project.project.models.User;

@Entity
@Table(name = "predictions")
public class Prediction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long predictionId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    private LocalDateTime predictionDate;
    
    private BigDecimal predictedBalance;
    
    private BigDecimal confidenceScore; // 0-100
    
    private LocalDate forecastForDate;
    
    @Column(length = 500)
    private String factorsConsidered;
    
    private LocalDateTime createdAt;
    
    // Constructors
    public Prediction() {
        this.createdAt = LocalDateTime.now();
        this.predictionDate = LocalDateTime.now();
    }
    
    public Prediction(User user, BigDecimal predictedBalance, BigDecimal confidenceScore, 
                      LocalDate forecastForDate, String factorsConsidered) {
        this.user = user;
        this.predictedBalance = predictedBalance;
        this.confidenceScore = confidenceScore;
        this.forecastForDate = forecastForDate;
        this.factorsConsidered = factorsConsidered;
        this.predictionDate = LocalDateTime.now();
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getPredictionId() { return predictionId; }
    public void setPredictionId(Long predictionId) { this.predictionId = predictionId; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public LocalDateTime getPredictionDate() { return predictionDate; }
    public void setPredictionDate(LocalDateTime predictionDate) { this.predictionDate = predictionDate; }
    
    public BigDecimal getPredictedBalance() { return predictedBalance; }
    public void setPredictedBalance(BigDecimal predictedBalance) { this.predictedBalance = predictedBalance; }
    
    public BigDecimal getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(BigDecimal confidenceScore) { this.confidenceScore = confidenceScore; }
    
    public LocalDate getForecastForDate() { return forecastForDate; }
    public void setForecastForDate(LocalDate forecastForDate) { this.forecastForDate = forecastForDate; }
    
    public String getFactorsConsidered() { return factorsConsidered; }
    public void setFactorsConsidered(String factorsConsidered) { this.factorsConsidered = factorsConsidered; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}