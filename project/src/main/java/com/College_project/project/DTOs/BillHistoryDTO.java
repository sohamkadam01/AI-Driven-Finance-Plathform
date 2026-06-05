package com.College_project.project.DTOs;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class BillHistoryDTO {
    
    private List<HistoricalBill> bills;
    private Map<String, YearlySummary> yearlySummaries;
    private List<PaymentTimeline> paymentTimeline;
    private HistoryStatistics statistics;
    private List<String> insights;
    
    // Getters and Setters
    public List<HistoricalBill> getBills() { return bills; }
    public void setBills(List<HistoricalBill> bills) { this.bills = bills; }
    
    public Map<String, YearlySummary> getYearlySummaries() { return yearlySummaries; }
    public void setYearlySummaries(Map<String, YearlySummary> yearlySummaries) { this.yearlySummaries = yearlySummaries; }
    
    public List<PaymentTimeline> getPaymentTimeline() { return paymentTimeline; }
    public void setPaymentTimeline(List<PaymentTimeline> paymentTimeline) { this.paymentTimeline = paymentTimeline; }
    
    public HistoryStatistics getStatistics() { return statistics; }
    public void setStatistics(HistoryStatistics statistics) { this.statistics = statistics; }
    
    public List<String> getInsights() { return insights; }
    public void setInsights(List<String> insights) { this.insights = insights; }
    
    // Inner class for Historical Bill
    public static class HistoricalBill {
        private Long billId;
        private String name;
        private BigDecimal amount;
        private LocalDate dueDate;
        private LocalDate paidDate;
        private String category;
        private String categoryIcon;
        private String frequency;
        private String status; // PAID, MISSED, CANCELLED
        private String paymentMethod;
        private int daysLate;
        private BigDecimal lateFee;
        
        // Getters and Setters
        public Long getBillId() { return billId; }
        public void setBillId(Long billId) { this.billId = billId; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
        
        public LocalDate getDueDate() { return dueDate; }
        public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
        
        public LocalDate getPaidDate() { return paidDate; }
        public void setPaidDate(LocalDate paidDate) { this.paidDate = paidDate; }
        
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        
        public String getCategoryIcon() { return categoryIcon; }
        public void setCategoryIcon(String categoryIcon) { this.categoryIcon = categoryIcon; }
        
        public String getFrequency() { return frequency; }
        public void setFrequency(String frequency) { this.frequency = frequency; }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
        
        public int getDaysLate() { return daysLate; }
        public void setDaysLate(int daysLate) { this.daysLate = daysLate; }
        
        public BigDecimal getLateFee() { return lateFee; }
        public void setLateFee(BigDecimal lateFee) { this.lateFee = lateFee; }
    }
    
    // Inner class for Yearly Summary
    public static class YearlySummary {
        private int year;
        private BigDecimal totalBills;
        private BigDecimal totalPaid;
        private BigDecimal totalMissed;
        private int totalCount;
        private int paidCount;
        private int missedCount;
        private double onTimePercentage;
        private Map<String, CategoryYearlyData> categoryBreakdown;
        
        // Getters and Setters
        public int getYear() { return year; }
        public void setYear(int year) { this.year = year; }
        
        public BigDecimal getTotalBills() { return totalBills; }
        public void setTotalBills(BigDecimal totalBills) { this.totalBills = totalBills; }
        
        public BigDecimal getTotalPaid() { return totalPaid; }
        public void setTotalPaid(BigDecimal totalPaid) { this.totalPaid = totalPaid; }
        
        public BigDecimal getTotalMissed() { return totalMissed; }
        public void setTotalMissed(BigDecimal totalMissed) { this.totalMissed = totalMissed; }
        
        public int getTotalCount() { return totalCount; }
        public void setTotalCount(int totalCount) { this.totalCount = totalCount; }
        
        public int getPaidCount() { return paidCount; }
        public void setPaidCount(int paidCount) { this.paidCount = paidCount; }
        
        public int getMissedCount() { return missedCount; }
        public void setMissedCount(int missedCount) { this.missedCount = missedCount; }
        
        public double getOnTimePercentage() { return onTimePercentage; }
        public void setOnTimePercentage(double onTimePercentage) { this.onTimePercentage = onTimePercentage; }
        
        public Map<String, CategoryYearlyData> getCategoryBreakdown() { return categoryBreakdown; }
        public void setCategoryBreakdown(Map<String, CategoryYearlyData> categoryBreakdown) { this.categoryBreakdown = categoryBreakdown; }
    }
    
    // Inner class for Category Yearly Data
    public static class CategoryYearlyData {
        private BigDecimal totalAmount;
        private int count;
        private int paidCount;
        private int missedCount;
        
        public CategoryYearlyData(BigDecimal totalAmount, int count, int paidCount, int missedCount) {
            this.totalAmount = totalAmount;
            this.count = count;
            this.paidCount = paidCount;
            this.missedCount = missedCount;
        }
        
        // Getters and Setters
        public BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
        
        public int getCount() { return count; }
        public void setCount(int count) { this.count = count; }
        
        public int getPaidCount() { return paidCount; }
        public void setPaidCount(int paidCount) { this.paidCount = paidCount; }
        
        public int getMissedCount() { return missedCount; }
        public void setMissedCount(int missedCount) { this.missedCount = missedCount; }
    }
    
    // Inner class for Payment Timeline
    public static class PaymentTimeline {
        private LocalDate date;
        private BigDecimal amount;
        private int billsPaid;
        private List<String> billNames;
        
        // Getters and Setters
        public LocalDate getDate() { return date; }
        public void setDate(LocalDate date) { this.date = date; }
        
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
        
        public int getBillsPaid() { return billsPaid; }
        public void setBillsPaid(int billsPaid) { this.billsPaid = billsPaid; }
        
        public List<String> getBillNames() { return billNames; }
        public void setBillNames(List<String> billNames) { this.billNames = billNames; }
    }
    
    // Inner class for History Statistics
    public static class HistoryStatistics {
        private BigDecimal totalSpentAllTime;
        private BigDecimal averageMonthlyBill;
        private BigDecimal highestBill;
        private String highestBillName;
        private LocalDate highestBillDate;
        private String mostPaidCategory;
        private String mostMissedCategory;
        private double onTimePaymentRate;
        private int totalBillsPaid;
        private int totalBillsMissed;
        private int consecutiveOnTimePayments;
        private String bestMonth;
        private String worstMonth;
        
        // Getters and Setters
        public BigDecimal getTotalSpentAllTime() { return totalSpentAllTime; }
        public void setTotalSpentAllTime(BigDecimal totalSpentAllTime) { this.totalSpentAllTime = totalSpentAllTime; }
        
        public BigDecimal getAverageMonthlyBill() { return averageMonthlyBill; }
        public void setAverageMonthlyBill(BigDecimal averageMonthlyBill) { this.averageMonthlyBill = averageMonthlyBill; }
        
        public BigDecimal getHighestBill() { return highestBill; }
        public void setHighestBill(BigDecimal highestBill) { this.highestBill = highestBill; }
        
        public String getHighestBillName() { return highestBillName; }
        public void setHighestBillName(String highestBillName) { this.highestBillName = highestBillName; }
        
        public LocalDate getHighestBillDate() { return highestBillDate; }
        public void setHighestBillDate(LocalDate highestBillDate) { this.highestBillDate = highestBillDate; }
        
        public String getMostPaidCategory() { return mostPaidCategory; }
        public void setMostPaidCategory(String mostPaidCategory) { this.mostPaidCategory = mostPaidCategory; }
        
        public String getMostMissedCategory() { return mostMissedCategory; }
        public void setMostMissedCategory(String mostMissedCategory) { this.mostMissedCategory = mostMissedCategory; }
        
        public double getOnTimePaymentRate() { return onTimePaymentRate; }
        public void setOnTimePaymentRate(double onTimePaymentRate) { this.onTimePaymentRate = onTimePaymentRate; }
        
        public int getTotalBillsPaid() { return totalBillsPaid; }
        public void setTotalBillsPaid(int totalBillsPaid) { this.totalBillsPaid = totalBillsPaid; }
        
        public int getTotalBillsMissed() { return totalBillsMissed; }
        public void setTotalBillsMissed(int totalBillsMissed) { this.totalBillsMissed = totalBillsMissed; }
        
        public int getConsecutiveOnTimePayments() { return consecutiveOnTimePayments; }
        public void setConsecutiveOnTimePayments(int consecutiveOnTimePayments) { this.consecutiveOnTimePayments = consecutiveOnTimePayments; }
        
        public String getBestMonth() { return bestMonth; }
        public void setBestMonth(String bestMonth) { this.bestMonth = bestMonth; }
        
        public String getWorstMonth() { return worstMonth; }
        public void setWorstMonth(String worstMonth) { this.worstMonth = worstMonth; }
    }
}
