package com.College_project.project.DTOs;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class MonthlyBillSummaryDTO {
    
    private int year;
    private int month;
    private LocalDate startDate;
    private LocalDate endDate;
    
    // Summary totals
    private SummaryTotals totals;
    
    // Bill breakdown
    private List<BillDetail> bills;
    private List<BillDetail> paidBills;
    private List<BillDetail> unpaidBills;
    private List<BillDetail> overdueBills;
    
    // Category breakdown
    private Map<String, CategoryTotal> categoryBreakdown;
    
    // Comparison with previous month
    private PreviousMonthComparison previousMonthComparison;
    
    // Trends and insights
    private String insight;
    private List<String> recommendations;
    
    // Getters and Setters
    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }
    
    public int getMonth() { return month; }
    public void setMonth(int month) { this.month = month; }
    
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    
    public SummaryTotals getTotals() { return totals; }
    public void setTotals(SummaryTotals totals) { this.totals = totals; }
    
    public List<BillDetail> getBills() { return bills; }
    public void setBills(List<BillDetail> bills) { this.bills = bills; }
    
    public List<BillDetail> getPaidBills() { return paidBills; }
    public void setPaidBills(List<BillDetail> paidBills) { this.paidBills = paidBills; }
    
    public List<BillDetail> getUnpaidBills() { return unpaidBills; }
    public void setUnpaidBills(List<BillDetail> unpaidBills) { this.unpaidBills = unpaidBills; }
    
    public List<BillDetail> getOverdueBills() { return overdueBills; }
    public void setOverdueBills(List<BillDetail> overdueBills) { this.overdueBills = overdueBills; }
    
    public Map<String, CategoryTotal> getCategoryBreakdown() { return categoryBreakdown; }
    public void setCategoryBreakdown(Map<String, CategoryTotal> categoryBreakdown) { this.categoryBreakdown = categoryBreakdown; }
    
    public PreviousMonthComparison getPreviousMonthComparison() { return previousMonthComparison; }
    public void setPreviousMonthComparison(PreviousMonthComparison previousMonthComparison) { this.previousMonthComparison = previousMonthComparison; }
    
    public String getInsight() { return insight; }
    public void setInsight(String insight) { this.insight = insight; }
    
    public List<String> getRecommendations() { return recommendations; }
    public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }
    
    // Inner class for Summary Totals
    public static class SummaryTotals {
        private BigDecimal totalBills;
        private BigDecimal totalPaid;
        private BigDecimal totalUnpaid;
        private BigDecimal totalOverdue;
        private int totalCount;
        private int paidCount;
        private int unpaidCount;
        private int overdueCount;
        private double paidPercentage;
        private double unpaidPercentage;
        
        // Getters and Setters
        public BigDecimal getTotalBills() { return totalBills; }
        public void setTotalBills(BigDecimal totalBills) { this.totalBills = totalBills; }
        
        public BigDecimal getTotalPaid() { return totalPaid; }
        public void setTotalPaid(BigDecimal totalPaid) { this.totalPaid = totalPaid; }
        
        public BigDecimal getTotalUnpaid() { return totalUnpaid; }
        public void setTotalUnpaid(BigDecimal totalUnpaid) { this.totalUnpaid = totalUnpaid; }
        
        public BigDecimal getTotalOverdue() { return totalOverdue; }
        public void setTotalOverdue(BigDecimal totalOverdue) { this.totalOverdue = totalOverdue; }
        
        public int getTotalCount() { return totalCount; }
        public void setTotalCount(int totalCount) { this.totalCount = totalCount; }
        
        public int getPaidCount() { return paidCount; }
        public void setPaidCount(int paidCount) { this.paidCount = paidCount; }
        
        public int getUnpaidCount() { return unpaidCount; }
        public void setUnpaidCount(int unpaidCount) { this.unpaidCount = unpaidCount; }
        
        public int getOverdueCount() { return overdueCount; }
        public void setOverdueCount(int overdueCount) { this.overdueCount = overdueCount; }
        
        public double getPaidPercentage() { return paidPercentage; }
        public void setPaidPercentage(double paidPercentage) { this.paidPercentage = paidPercentage; }
        
        public double getUnpaidPercentage() { return unpaidPercentage; }
        public void setUnpaidPercentage(double unpaidPercentage) { this.unpaidPercentage = unpaidPercentage; }
    }
    
    // Inner class for Bill Detail
    public static class BillDetail {
        private Long billId;
        private String name;
        private BigDecimal amount;
        private LocalDate dueDate;
        private LocalDate paidDate;
        private String category;
        private String categoryIcon;
        private String frequency;
        private String status; // PAID, UNPAID, OVERDUE
        private String paymentMethod;
        private int daysOverdue;
        
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
        
        public int getDaysOverdue() { return daysOverdue; }
        public void setDaysOverdue(int daysOverdue) { this.daysOverdue = daysOverdue; }
    }
    
    // Inner class for Category Total
    public static class CategoryTotal {
        private BigDecimal totalAmount;
        private int billCount;
        private int paidCount;
        private int unpaidCount;
        private String icon;
        
        public CategoryTotal(BigDecimal totalAmount, int billCount, int paidCount, int unpaidCount, String icon) {
            this.totalAmount = totalAmount;
            this.billCount = billCount;
            this.paidCount = paidCount;
            this.unpaidCount = unpaidCount;
            this.icon = icon;
        }
        
        // Getters and Setters
        public BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
        
        public int getBillCount() { return billCount; }
        public void setBillCount(int billCount) { this.billCount = billCount; }
        
        public int getPaidCount() { return paidCount; }
        public void setPaidCount(int paidCount) { this.paidCount = paidCount; }
        
        public int getUnpaidCount() { return unpaidCount; }
        public void setUnpaidCount(int unpaidCount) { this.unpaidCount = unpaidCount; }
        
        public String getIcon() { return icon; }
        public void setIcon(String icon) { this.icon = icon; }
    }
    
    // Inner class for Previous Month Comparison
    public static class PreviousMonthComparison {
        private BigDecimal previousTotal;
        private BigDecimal changeAmount;
        private double changePercentage;
        private String trend; // INCREASED, DECREASED, SAME
        private int previousBillCount;
        private int billCountChange;
        
        // Getters and Setters
        public BigDecimal getPreviousTotal() { return previousTotal; }
        public void setPreviousTotal(BigDecimal previousTotal) { this.previousTotal = previousTotal; }
        
        public BigDecimal getChangeAmount() { return changeAmount; }
        public void setChangeAmount(BigDecimal changeAmount) { this.changeAmount = changeAmount; }
        
        public double getChangePercentage() { return changePercentage; }
        public void setChangePercentage(double changePercentage) { this.changePercentage = changePercentage; }
        
        public String getTrend() { return trend; }
        public void setTrend(String trend) { this.trend = trend; }
        
        public int getPreviousBillCount() { return previousBillCount; }
        public void setPreviousBillCount(int previousBillCount) { this.previousBillCount = previousBillCount; }
        
        public int getBillCountChange() { return billCountChange; }
        public void setBillCountChange(int billCountChange) { this.billCountChange = billCountChange; }
    }
}