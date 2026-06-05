package com.College_project.project.DTOs;

import java.util.List;
import com.College_project.project.DTOs.TransactionResponse;
public class TransactionFilterResponse {
    private List<TransactionResponse> transactions;
    private int currentPage;
    private int totalPages;
    private long totalElements;
    private int pageSize;
    private boolean hasNext;
    private boolean hasPrevious;
    private FilterSummary summary;
    
    // Getters and Setters
    public List<TransactionResponse> getTransactions() { return transactions; }
    public void setTransactions(List<TransactionResponse> transactions) { this.transactions = transactions; }
    
    public int getCurrentPage() { return currentPage; }
    public void setCurrentPage(int currentPage) { this.currentPage = currentPage; }
    
    public int getTotalPages() { return totalPages; }
    public void setTotalPages(int totalPages) { this.totalPages = totalPages; }
    
    public long getTotalElements() { return totalElements; }
    public void setTotalElements(long totalElements) { this.totalElements = totalElements; }
    
    public int getPageSize() { return pageSize; }
    public void setPageSize(int pageSize) { this.pageSize = pageSize; }
    
    public boolean isHasNext() { return hasNext; }
    public void setHasNext(boolean hasNext) { this.hasNext = hasNext; }
    
    public boolean isHasPrevious() { return hasPrevious; }
    public void setHasPrevious(boolean hasPrevious) { this.hasPrevious = hasPrevious; }
    
    public FilterSummary getSummary() { return summary; }
    public void setSummary(FilterSummary summary) { this.summary = summary; }
    
    // Inner class for summary statistics
    public static class FilterSummary {
        private double totalIncome;
        private double totalExpense;
        private double netCashFlow;
        private long transactionCount;
        private String mostCommonCategory;
        private double averageTransactionAmount;
        
        // Getters and Setters
        public double getTotalIncome() { return totalIncome; }
        public void setTotalIncome(double totalIncome) { this.totalIncome = totalIncome; }
        
        public double getTotalExpense() { return totalExpense; }
        public void setTotalExpense(double totalExpense) { this.totalExpense = totalExpense; }
        
        public double getNetCashFlow() { return netCashFlow; }
        public void setNetCashFlow(double netCashFlow) { this.netCashFlow = netCashFlow; }
        
        public long getTransactionCount() { return transactionCount; }
        public void setTransactionCount(long transactionCount) { this.transactionCount = transactionCount; }
        
        public String getMostCommonCategory() { return mostCommonCategory; }
        public void setMostCommonCategory(String mostCommonCategory) { this.mostCommonCategory = mostCommonCategory; }
        
        public double getAverageTransactionAmount() { return averageTransactionAmount; }
        public void setAverageTransactionAmount(double averageTransactionAmount) { this.averageTransactionAmount = averageTransactionAmount; }
    }
}