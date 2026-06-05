package com.College_project.project.models;


import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "budgets")
public class Budget {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long budgetId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
    
    @Column(nullable = false)
    private LocalDate month; // First day of the month
    
    @Column(nullable = false)
    private BigDecimal amountLimit;
    
    private BigDecimal spentAmount = BigDecimal.ZERO;
    
    private BigDecimal alertThreshold = new BigDecimal("80"); // 80% default
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructors
    public Budget() {
        this.createdAt = LocalDateTime.now();
    }
    
    public Budget(User user, Category category, LocalDate month, BigDecimal amountLimit) {
        this.user = user;
        this.category = category;
        this.month = month;
        this.amountLimit = amountLimit;
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getBudgetId() { return budgetId; }
    public void setBudgetId(Long budgetId) { this.budgetId = budgetId; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    
    public LocalDate getMonth() { return month; }
    public void setMonth(LocalDate month) { this.month = month; }
    
    public BigDecimal getAmountLimit() { return amountLimit; }
    public void setAmountLimit(BigDecimal amountLimit) { this.amountLimit = amountLimit; }
    
    public BigDecimal getSpentAmount() { return spentAmount; }
    public void setSpentAmount(BigDecimal spentAmount) { this.spentAmount = spentAmount; }
    
    public BigDecimal getAlertThreshold() { return alertThreshold; }
    public void setAlertThreshold(BigDecimal alertThreshold) { this.alertThreshold = alertThreshold; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    // Helper method
    public BigDecimal getRemainingAmount() {
        return amountLimit.subtract(spentAmount);
    }
    
    public BigDecimal getSpentPercentage() {
        if (amountLimit.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
        return spentAmount.multiply(new BigDecimal("100")).divide(amountLimit, 2, java.math.RoundingMode.HALF_UP);
    }
}