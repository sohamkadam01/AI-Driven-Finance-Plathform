package com.College_project.project.DTOs;

import java.math.BigDecimal;
import java.time.LocalDate;

public class BillReminderDTO {
    private Long recurringId;
    private String name;
    private BigDecimal amount;
    private String categoryName;
    private LocalDate dueDate;
    private Integer daysUntilDue;
    private String reminderMessage;
    private String priority; // HIGH, MEDIUM, LOW
    
    public BillReminderDTO(Long recurringId, String name, BigDecimal amount, 
                          String categoryName, LocalDate dueDate, Integer daysUntilDue) {
        this.recurringId = recurringId;
        this.name = name;
        this.amount = amount;
        this.categoryName = categoryName;
        this.dueDate = dueDate;
        this.daysUntilDue = daysUntilDue;
        
        // Set priority based on days until due
        if (daysUntilDue <= 1) {
            this.priority = "HIGH";
            this.reminderMessage = "⚠️ URGENT: " + name + " is due tomorrow!";
        } else if (daysUntilDue <= 3) {
            this.priority = "MEDIUM";
            this.reminderMessage = "📅 Reminder: " + name + " is due in " + daysUntilDue + " days";
        } else {
            this.priority = "LOW";
            this.reminderMessage = "🔔 Upcoming: " + name + " will be due on " + dueDate;
        }
    }
    
    // Getters and Setters
    public Long getRecurringId() { return recurringId; }
    public void setRecurringId(Long recurringId) { this.recurringId = recurringId; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    
    public Integer getDaysUntilDue() { return daysUntilDue; }
    public void setDaysUntilDue(Integer daysUntilDue) { this.daysUntilDue = daysUntilDue; }
    
    public String getReminderMessage() { return reminderMessage; }
    public void setReminderMessage(String reminderMessage) { this.reminderMessage = reminderMessage; }
    
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
}