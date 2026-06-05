package com.College_project.project.DTOs;

import com.College_project.project.enums.Frequency;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class RecurringTransactionResponse {
    private Long recurringId;
    private String name;
    private BigDecimal amount;
    private Long categoryId;
    private String categoryName;
    private String categoryIcon;
    private Frequency frequency;
    private LocalDate nextDueDate;
    private Integer reminderDaysBefore;
    private String description;
    private Long bankAccountId;
    private String bankName;
    private boolean isActive;
    private LocalDateTime createdAt;
    private Integer daysUntilDue;
    
    public RecurringTransactionResponse(Long recurringId, String name, BigDecimal amount,
                                        Long categoryId, String categoryName, String categoryIcon,
                                        Frequency frequency, LocalDate nextDueDate,
                                        Integer reminderDaysBefore, String description,
                                        Long bankAccountId, String bankName, 
                                        boolean isActive, LocalDateTime createdAt) {
        this.recurringId = recurringId;
        this.name = name;
        this.amount = amount;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.categoryIcon = categoryIcon;
        this.frequency = frequency;
        this.nextDueDate = nextDueDate;
        this.reminderDaysBefore = reminderDaysBefore;
        this.description = description;
        this.bankAccountId = bankAccountId;
        this.bankName = bankName;
        this.isActive = isActive;
        this.createdAt = createdAt;
        
        // Calculate days until due when the bill has a due date.
        this.daysUntilDue = nextDueDate != null
            ? (int) java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), nextDueDate)
            : 0;
    }
    
    // Getters and Setters
    public Long getRecurringId() { return recurringId; }
    public void setRecurringId(Long recurringId) { this.recurringId = recurringId; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    
    public String getCategoryIcon() { return categoryIcon; }
    public void setCategoryIcon(String categoryIcon) { this.categoryIcon = categoryIcon; }
    
    public Frequency getFrequency() { return frequency; }
    public void setFrequency(Frequency frequency) { this.frequency = frequency; }
    
    public LocalDate getNextDueDate() { return nextDueDate; }
    public void setNextDueDate(LocalDate nextDueDate) { this.nextDueDate = nextDueDate; }
    
    public Integer getReminderDaysBefore() { return reminderDaysBefore; }
    public void setReminderDaysBefore(Integer reminderDaysBefore) { this.reminderDaysBefore = reminderDaysBefore; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Long getBankAccountId() { return bankAccountId; }
    public void setBankAccountId(Long bankAccountId) { this.bankAccountId = bankAccountId; }
    
    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }
    
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public Integer getDaysUntilDue() { return daysUntilDue; }
    public void setDaysUntilDue(Integer daysUntilDue) { this.daysUntilDue = daysUntilDue; }
}
