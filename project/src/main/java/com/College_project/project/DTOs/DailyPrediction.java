package com.College_project.project.DTOs;

import java.math.BigDecimal;
import java.time.LocalDate;

public class DailyPrediction {
    private LocalDate date;
    private BigDecimal predictedBalance;
    private BigDecimal predictedIncome;
    private BigDecimal predictedExpense;
    
    // Constructors
    public DailyPrediction() {}
    
    public DailyPrediction(LocalDate date, BigDecimal predictedBalance, 
                          BigDecimal predictedIncome, BigDecimal predictedExpense) {
        this.date = date;
        this.predictedBalance = predictedBalance;
        this.predictedIncome = predictedIncome;
        this.predictedExpense = predictedExpense;
    }
    
    // Getters and Setters
    public LocalDate getDate() {
        return date;
    }
    
    public void setDate(LocalDate date) {
        this.date = date;
    }
    
    public BigDecimal getPredictedBalance() {
        return predictedBalance;
    }
    
    public void setPredictedBalance(BigDecimal predictedBalance) {
        this.predictedBalance = predictedBalance;
    }
    
    public BigDecimal getPredictedIncome() {
        return predictedIncome;
    }
    
    public void setPredictedIncome(BigDecimal predictedIncome) {
        this.predictedIncome = predictedIncome;
    }
    
    public BigDecimal getPredictedExpense() {
        return predictedExpense;
    }
    
    public void setPredictedExpense(BigDecimal predictedExpense) {
        this.predictedExpense = predictedExpense;
    }
}