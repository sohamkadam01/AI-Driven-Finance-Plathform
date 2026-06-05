package com.College_project.project.DTOs;

import com.College_project.project.enums.InvestmentType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class InvestmentResponse {
    private Long investmentId;
    private String name;
    private InvestmentType type;
    private BigDecimal amountInvested;
    private BigDecimal currentValue;
    private BigDecimal profitLoss;
    private BigDecimal returnsPercentage;
    private LocalDate purchaseDate;
    private String symbol;
    private Integer quantity;
    private LocalDateTime createdAt;
    
    public InvestmentResponse(Long investmentId, String name, InvestmentType type,
                             BigDecimal amountInvested, BigDecimal currentValue,
                             LocalDate purchaseDate, String symbol, Integer quantity,
                             LocalDateTime createdAt) {
        this.investmentId = investmentId;
        this.name = name;
        this.type = type;
        this.amountInvested = amountInvested;
        this.currentValue = currentValue != null ? currentValue : amountInvested;
        this.purchaseDate = purchaseDate;
        this.symbol = symbol;
        this.quantity = quantity;
        this.createdAt = createdAt;
        
        // Calculate profit/loss
        this.profitLoss = this.currentValue.subtract(this.amountInvested);
        
        // Calculate returns percentage
        if (this.amountInvested.compareTo(BigDecimal.ZERO) > 0) {
            this.returnsPercentage = this.profitLoss
                .multiply(new BigDecimal("100"))
                .divide(this.amountInvested, 2, java.math.RoundingMode.HALF_UP);
        } else {
            this.returnsPercentage = BigDecimal.ZERO;
        }
    }
    
    // Getters and Setters
    public Long getInvestmentId() { return investmentId; }
    public void setInvestmentId(Long investmentId) { this.investmentId = investmentId; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public InvestmentType getType() { return type; }
    public void setType(InvestmentType type) { this.type = type; }
    
    public BigDecimal getAmountInvested() { return amountInvested; }
    public void setAmountInvested(BigDecimal amountInvested) { this.amountInvested = amountInvested; }
    
    public BigDecimal getCurrentValue() { return currentValue; }
    public void setCurrentValue(BigDecimal currentValue) { this.currentValue = currentValue; }
    
    public BigDecimal getProfitLoss() { return profitLoss; }
    public void setProfitLoss(BigDecimal profitLoss) { this.profitLoss = profitLoss; }
    
    public BigDecimal getReturnsPercentage() { return returnsPercentage; }
    public void setReturnsPercentage(BigDecimal returnsPercentage) { this.returnsPercentage = returnsPercentage; }
    
    public LocalDate getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(LocalDate purchaseDate) { this.purchaseDate = purchaseDate; }
    
    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }
    
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}