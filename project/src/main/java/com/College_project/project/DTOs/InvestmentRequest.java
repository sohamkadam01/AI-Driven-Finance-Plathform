package com.College_project.project.DTOs;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.College_project.project.enums.InvestmentType;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class InvestmentRequest {
    
    @NotBlank(message = "Investment name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;
    
    @NotNull(message = "Investment type is required")
    private InvestmentType type;
    
    @NotNull(message = "Amount invested is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amountInvested;
    
    private BigDecimal currentValue;
    
    // Allows any date (past, present, or future) - no validation on date
    // Just ensure it's not null
    private LocalDate purchaseDate;
    
    private String symbol;

        // ✅ ADD THIS - Bank account to deduct from
    @NotNull(message = "Bank account ID is required")
    private Long accountId;
    
    private Integer quantity;
    
    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public InvestmentType getType() { return type; }
    public void setType(InvestmentType type) { this.type = type; }
    
    public BigDecimal getAmountInvested() { return amountInvested; }
    public void setAmountInvested(BigDecimal amountInvested) { this.amountInvested = amountInvested; }
    
    public BigDecimal getCurrentValue() { return currentValue; }
    public void setCurrentValue(BigDecimal currentValue) { this.currentValue = currentValue; }
    
    public LocalDate getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(LocalDate purchaseDate) { this.purchaseDate = purchaseDate; }
    
    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }
    
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

        // ✅ ADD THESE GETTER AND SETTER FOR accountId
    public Long getAccountId() { return accountId; }
    public void setAccountId(Long accountId) { this.accountId = accountId; }
}