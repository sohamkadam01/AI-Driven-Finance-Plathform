package com.College_project.project.DTOs;

import com.College_project.project.enums.Frequency;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public class RecurringTransactionRequest {
    
    @NotBlank(message = "Bill name is required")
    @Size(min = 2, max = 100, message = "Bill name must be between 2 and 100 characters")
    private String name;
    
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;
    
    @NotNull(message = "Category ID is required")
    private Long categoryId;
    
    @NotNull(message = "Frequency is required")
    private Frequency frequency; // MONTHLY, YEARLY, WEEKLY
    
    @NotNull(message = "Next due date is required")
    @Future(message = "Next due date must be in the future")
    private LocalDate nextDueDate;
    
    @Min(value = 0, message = "Reminder days must be at least 0")
    @Max(value = 30, message = "Reminder days cannot exceed 30")
    private Integer reminderDaysBefore = 3; // Default: remind 3 days before
    
    private String description;
    private Long bankAccountId; // Optional: which account this bill is paid from
    
    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    
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
}