package com.College_project.project.DTOs;

import com.College_project.project.enums.TransactionType;
import java.time.LocalDate;

public class TransactionFilterRequest {
    
    private String search;           // Search in description
    private TransactionType type;    // INCOME or EXPENSE
    private Long categoryId;         // Filter by category
    private LocalDate startDate;     // Start date range
    private LocalDate endDate;       // End date range
    private Long accountId;          // Filter by bank account
    private Double minAmount;        // Minimum amount
    private Double maxAmount;        // Maximum amount
    private String sortBy;           // Sort field (date, amount, description)
    private String sortDirection;    // ASC or DESC
    private int page = 0;            // Pagination - page number
    private int size = 20;           // Pagination - page size
    
    // Getters and Setters
    public String getSearch() { return search; }
    public void setSearch(String search) { this.search = search; }
    
    public TransactionType getType() { return type; }
    public void setType(TransactionType type) { this.type = type; }
    
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    
    public Long getAccountId() { return accountId; }
    public void setAccountId(Long accountId) { this.accountId = accountId; }
    
    public Double getMinAmount() { return minAmount; }
    public void setMinAmount(Double minAmount) { this.minAmount = minAmount; }
    
    public Double getMaxAmount() { return maxAmount; }
    public void setMaxAmount(Double maxAmount) { this.maxAmount = maxAmount; }
    
    public String getSortBy() { return sortBy; }
    public void setSortBy(String sortBy) { this.sortBy = sortBy; }
    
    public String getSortDirection() { return sortDirection; }
    public void setSortDirection(String sortDirection) { this.sortDirection = sortDirection; }
    
    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }
    
    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }
}