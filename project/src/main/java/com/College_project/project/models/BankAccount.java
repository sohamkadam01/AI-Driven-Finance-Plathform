package com.College_project.project.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "bank_accounts")
public class BankAccount {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long accountId;
    
    @JsonIgnore  // ✅ Prevents recursion from User side
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private String bankName;
    
    private String accountNumber;
    
    private String accountType; // SAVINGS, CURRENT, CREDIT
    
    @Column(nullable = false)
    private BigDecimal currentBalance = BigDecimal.ZERO;
    
    private String currency = "INR";
    
    private boolean isActive = true;
    
    private LocalDateTime linkedDate;
    
    private LocalDateTime lastSyncedAt;
    
    // Constructors
    public BankAccount() {}
    
    public BankAccount(User user, String bankName, String accountNumber, String accountType) {
        this.user = user;
        this.bankName = bankName;
        this.accountNumber = accountNumber;
        this.accountType = accountType;
        this.linkedDate = LocalDateTime.now();
        this.lastSyncedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getAccountId() { return accountId; }
    public void setAccountId(Long accountId) { this.accountId = accountId; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
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
    
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
    
    public LocalDateTime getLinkedDate() { return linkedDate; }
    public void setLinkedDate(LocalDateTime linkedDate) { this.linkedDate = linkedDate; }
    
    public LocalDateTime getLastSyncedAt() { return lastSyncedAt; }
    public void setLastSyncedAt(LocalDateTime lastSyncedAt) { this.lastSyncedAt = lastSyncedAt; }
}