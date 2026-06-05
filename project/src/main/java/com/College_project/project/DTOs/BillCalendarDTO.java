package com.College_project.project.DTOs;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class BillCalendarDTO {
    
    private int year;
    private int month;
    private List<CalendarDay> days;
    private List<UpcomingBill> upcomingBills;
    private MonthlySummary monthlySummary;
    private Map<String, BigDecimal> categoryBreakdown;
    
    // Getters and Setters
    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }
    
    public int getMonth() { return month; }
    public void setMonth(int month) { this.month = month; }
    
    public List<CalendarDay> getDays() { return days; }
    public void setDays(List<CalendarDay> days) { this.days = days; }
    
    public List<UpcomingBill> getUpcomingBills() { return upcomingBills; }
    public void setUpcomingBills(List<UpcomingBill> upcomingBills) { this.upcomingBills = upcomingBills; }
    
    public MonthlySummary getMonthlySummary() { return monthlySummary; }
    public void setMonthlySummary(MonthlySummary monthlySummary) { this.monthlySummary = monthlySummary; }
    
    public Map<String, BigDecimal> getCategoryBreakdown() { return categoryBreakdown; }
    public void setCategoryBreakdown(Map<String, BigDecimal> categoryBreakdown) { this.categoryBreakdown = categoryBreakdown; }
    
    // Inner class for Calendar Day
    public static class CalendarDay {
        private LocalDate date;
        private int dayOfMonth;
        private boolean isCurrentMonth;
        private boolean isToday;
        private List<BillEvent> events;
        private BigDecimal totalAmount;
        
        // Getters and Setters
        public LocalDate getDate() { return date; }
        public void setDate(LocalDate date) { this.date = date; }
        
        public int getDayOfMonth() { return dayOfMonth; }
        public void setDayOfMonth(int dayOfMonth) { this.dayOfMonth = dayOfMonth; }
        
        public boolean isCurrentMonth() { return isCurrentMonth; }
        public void setCurrentMonth(boolean isCurrentMonth) { this.isCurrentMonth = isCurrentMonth; }
        
        public boolean isToday() { return isToday; }
        public void setToday(boolean isToday) { this.isToday = isToday; }
        
        public List<BillEvent> getEvents() { return events; }
        public void setEvents(List<BillEvent> events) { this.events = events; }
        
        public BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    }
    
    // Inner class for Bill Event
    public static class BillEvent {
        private Long billId;
        private String name;
        private BigDecimal amount;
        private String category;
        private String categoryIcon;
        private String frequency;
        private boolean isPaid;
        private LocalDate dueDate;
        private String status; // PENDING, PAID, OVERDUE
        private String paymentMethod;
        
        // Getters and Setters
        public Long getBillId() { return billId; }
        public void setBillId(Long billId) { this.billId = billId; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
        
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        
        public String getCategoryIcon() { return categoryIcon; }
        public void setCategoryIcon(String categoryIcon) { this.categoryIcon = categoryIcon; }
        
        public String getFrequency() { return frequency; }
        public void setFrequency(String frequency) { this.frequency = frequency; }
        
        public boolean isPaid() { return isPaid; }
        public void setPaid(boolean isPaid) { this.isPaid = isPaid; }
        
        public LocalDate getDueDate() { return dueDate; }
        public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    }
    
    // Inner class for Upcoming Bill
    public static class UpcomingBill {
        private Long billId;
        private String name;
        private BigDecimal amount;
        private LocalDate dueDate;
        private int daysUntilDue;
        private String category;
        private String categoryIcon;
        private String priority; // HIGH, MEDIUM, LOW
        
        // Getters and Setters
        public Long getBillId() { return billId; }
        public void setBillId(Long billId) { this.billId = billId; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
        
        public LocalDate getDueDate() { return dueDate; }
        public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
        
        public int getDaysUntilDue() { return daysUntilDue; }
        public void setDaysUntilDue(int daysUntilDue) { this.daysUntilDue = daysUntilDue; }
        
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        
        public String getCategoryIcon() { return categoryIcon; }
        public void setCategoryIcon(String categoryIcon) { this.categoryIcon = categoryIcon; }
        
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
    }
    
    // Inner class for Monthly Summary
    public static class MonthlySummary {
        private BigDecimal totalDue;
        private BigDecimal totalPaid;
        private BigDecimal totalUnpaid;
        private int totalBills;
        private int paidCount;
        private int unpaidCount;
        private int overdueCount;
        
        // Getters and Setters
        public BigDecimal getTotalDue() { return totalDue; }
        public void setTotalDue(BigDecimal totalDue) { this.totalDue = totalDue; }
        
        public BigDecimal getTotalPaid() { return totalPaid; }
        public void setTotalPaid(BigDecimal totalPaid) { this.totalPaid = totalPaid; }
        
        public BigDecimal getTotalUnpaid() { return totalUnpaid; }
        public void setTotalUnpaid(BigDecimal totalUnpaid) { this.totalUnpaid = totalUnpaid; }
        
        public int getTotalBills() { return totalBills; }
        public void setTotalBills(int totalBills) { this.totalBills = totalBills; }
        
        public int getPaidCount() { return paidCount; }
        public void setPaidCount(int paidCount) { this.paidCount = paidCount; }
        
        public int getUnpaidCount() { return unpaidCount; }
        public void setUnpaidCount(int unpaidCount) { this.unpaidCount = unpaidCount; }
        
        public int getOverdueCount() { return overdueCount; }
        public void setOverdueCount(int overdueCount) { this.overdueCount = overdueCount; }
    }
}