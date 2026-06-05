package com.College_project.project.DTOs;

import java.math.BigDecimal;
import java.time.LocalDate;

public class BudgetResponse {
    private Long budgetId;
    private Long categoryId;
    private String categoryName;
    private String icon;  // Changed from categoryIcon to icon for consistency
    private String color;  // Changed from categoryColor to color
    private LocalDate month;
    private BigDecimal amountLimit;
    private BigDecimal spentAmount;
    private BigDecimal remainingAmount;
    private BigDecimal spentPercentage;
    private BigDecimal alertThreshold;
    private boolean isAlertTriggered;
    
    // Constructor matching your service call
    public BudgetResponse(Long budgetId, Long categoryId, String categoryName, 
                         String icon, String color, LocalDate month,
                         BigDecimal amountLimit, BigDecimal spentAmount, 
                         BigDecimal alertThreshold) {
        this.budgetId = budgetId;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.icon = icon;
        this.color = color;
        this.month = month;
        this.amountLimit = amountLimit;
        this.spentAmount = spentAmount != null ? spentAmount : BigDecimal.ZERO;
        this.alertThreshold = alertThreshold;
        
        // Calculate derived fields
        this.remainingAmount = this.amountLimit.subtract(this.spentAmount);
        if (this.amountLimit.compareTo(BigDecimal.ZERO) > 0) {
            this.spentPercentage = this.spentAmount
                .multiply(new BigDecimal("100"))
                .divide(this.amountLimit, 2, java.math.RoundingMode.HALF_UP);
        } else {
            this.spentPercentage = BigDecimal.ZERO;
        }
        
        this.isAlertTriggered = this.spentPercentage.compareTo(this.alertThreshold) >= 0;
    }
    
    // Default constructor
    public BudgetResponse() {}
    
    // Getters and Setters
    public Long getBudgetId() { 
        return budgetId; 
    }
    
    public void setBudgetId(Long budgetId) { 
        this.budgetId = budgetId; 
    }
    
    public Long getCategoryId() { 
        return categoryId; 
    }
    
    public void setCategoryId(Long categoryId) { 
        this.categoryId = categoryId; 
    }
    
    public String getCategoryName() { 
        return categoryName; 
    }
    
    public void setCategoryName(String categoryName) { 
        this.categoryName = categoryName; 
    }
    
    public String getIcon() { 
        return icon; 
    }
    
    public void setIcon(String icon) { 
        this.icon = icon; 
    }
    
    public String getColor() { 
        return color; 
    }
    
    public void setColor(String color) { 
        this.color = color; 
    }
    
    public LocalDate getMonth() { 
        return month; 
    }
    
    public void setMonth(LocalDate month) { 
        this.month = month; 
    }
    
    public BigDecimal getAmountLimit() { 
        return amountLimit; 
    }
    
    public void setAmountLimit(BigDecimal amountLimit) { 
        this.amountLimit = amountLimit; 
    }
    
    public BigDecimal getSpentAmount() { 
        return spentAmount; 
    }
    
    public void setSpentAmount(BigDecimal spentAmount) { 
        this.spentAmount = spentAmount; 
    }
    
    public BigDecimal getRemainingAmount() { 
        return remainingAmount; 
    }
    
    public void setRemainingAmount(BigDecimal remainingAmount) { 
        this.remainingAmount = remainingAmount; 
    }
    
    public BigDecimal getSpentPercentage() { 
        return spentPercentage; 
    }
    
    public void setSpentPercentage(BigDecimal spentPercentage) { 
        this.spentPercentage = spentPercentage; 
    }
    
    public BigDecimal getAlertThreshold() { 
        return alertThreshold; 
    }
    
    public void setAlertThreshold(BigDecimal alertThreshold) { 
        this.alertThreshold = alertThreshold; 
    }
    
    public boolean isAlertTriggered() { 
        return isAlertTriggered; 
    }
    
    public void setAlertTriggered(boolean alertTriggered) { 
        this.isAlertTriggered = alertTriggered; 
    }
    
    // Helper method to get spending status
    public String getStatus() {
        if (isAlertTriggered) {
            if (spentPercentage.compareTo(new BigDecimal("100")) >= 0) {
                return "EXCEEDED";
            }
            return "WARNING";
        }
        return "GOOD";
    }
}