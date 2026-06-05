package com.College_project.project.DTOs;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BankAccountResponse {
    private Long accountId;
    private String bankName;
    private String accountNumber; // Masked (e.g., ****1234)
    private String accountType;
    private BigDecimal currentBalance;
    private String currency;
    private LocalDateTime linkedDate;
    private boolean isActive;
    
    // Constructor
    public BankAccountResponse(Long accountId, String bankName, String accountNumber, 
                               String accountType, BigDecimal currentBalance, 
                               String currency, LocalDateTime linkedDate, boolean isActive) {
        this.accountId = accountId;
        this.bankName = bankName;
        this.accountNumber = maskAccountNumber(accountNumber);
        this.accountType = accountType;
        this.currentBalance = currentBalance;
        this.currency = currency;
        this.linkedDate = linkedDate;
        this.isActive = isActive;
    }
    
    private String maskAccountNumber(String accountNumber) {
        if (accountNumber == null || accountNumber.length() <= 4) {
            return "****";
        }
        return "****" + accountNumber.substring(accountNumber.length() - 4);
    }
    
    // Getters and Setters
    public Long getAccountId() { return accountId; }
    public void setAccountId(Long accountId) { this.accountId = accountId; }
    
    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }
    
    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }
    
    public String getAccountType() { return accountType; }
    public void setAccountType(String accountType) { this.accountType = accountType; }
    
    public BigDecimal getCurrentBalance() { return currentBalance; }
    public void setCurrentBalance(BigDecimal currentBalance) { this.currentBalance = currentBalance; }
    
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    
    public LocalDateTime getLinkedDate() { return linkedDate; }
    public void setLinkedDate(LocalDateTime linkedDate) { this.linkedDate = linkedDate; }
    
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
}