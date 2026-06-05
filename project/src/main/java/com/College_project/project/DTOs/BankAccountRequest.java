package com.College_project.project.DTOs;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class BankAccountRequest {
    
    @NotBlank(message = "Bank name is required")
    @Size(min = 2, max = 100, message = "Bank name must be between 2 and 100 characters")
    private String bankName;
    
    @NotBlank(message = "Account number is required")
    @Pattern(regexp = "^[0-9]{9,18}$", message = "Account number must be 9-18 digits")
    private String accountNumber;
    
    @NotBlank(message = "Account type is required")
    @Pattern(regexp = "^(SAVINGS|CURRENT|CREDIT)$", message = "Account type must be SAVINGS, CURRENT, or CREDIT")
    private String accountType;
    
    @NotNull(message = "Current balance is required")
    @DecimalMin(value = "0.0", message = "Balance cannot be negative")
    private BigDecimal currentBalance;
    
    @Pattern(regexp = "^[A-Z]{3}$", message = "Currency must be 3 letters (INR, USD, etc.)")
    private String currency = "INR";
    
    // Getters and Setters
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
}