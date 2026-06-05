package com.College_project.project.controller;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.College_project.project.DTOs.MonthlySummaryDTO;
import com.College_project.project.DTOs.TransactionFilterRequest;
import com.College_project.project.DTOs.TransactionFilterResponse;
import com.College_project.project.DTOs.TransactionRequest;
import com.College_project.project.enums.TransactionType;
import com.College_project.project.models.Transaction;
import com.College_project.project.security.UserDetailsImpl;
import com.College_project.project.service.TransactionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {
    
    private static final Logger log = LoggerFactory.getLogger(TransactionController.class);
    
    @Autowired
    private TransactionService transactionService;
    
    /**
     * Add a new transaction
     * POST /api/transactions/add/{accountId}
     */
    @PostMapping("/add/{accountId}")
    public ResponseEntity<?> addTransaction(@PathVariable Long accountId,
                                           @Valid @RequestBody TransactionRequest request,
                                           Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Transaction transaction = transactionService.addTransaction(userDetails.getId(), accountId, request);
            return ResponseEntity.ok(transaction);
        } catch (Exception e) {
            log.error("Error adding transaction", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get user's transactions with basic filters
     * GET /api/transactions/my-transactions
     */
    @GetMapping("/my-transactions")
    public ResponseEntity<?> getMyTransactions(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) Integer limit,
            Authentication authentication) {
        
        try {
            log.info("Fetching transactions for user with params - startDate: {}, endDate: {}, page: {}, limit: {}", 
                startDate, endDate, page, limit);
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            // Use pagination to prevent memory issues
            int pageSize = (limit != null && limit <= 100) ? limit : (size != null ? Math.min(size, 100) : 20);
            
            // Always use filtered response with pagination for better performance
            TransactionFilterRequest filterRequest = new TransactionFilterRequest();
            filterRequest.setStartDate(startDate);
            filterRequest.setEndDate(endDate);
            filterRequest.setType(type);
            filterRequest.setPage(page);
            filterRequest.setSize(pageSize);
            filterRequest.setSortBy("transactionDate");
            filterRequest.setSortDirection("DESC");
            
            TransactionFilterResponse response = transactionService.getFilteredTransactions(
                userDetails.getId(), filterRequest);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching transactions", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("cause", e.getCause() != null ? e.getCause().toString() : "Unknown");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Get total spending
     * GET /api/transactions/spending
     */
    @GetMapping("/spending")
    public ResponseEntity<?> getTotalSpending(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            java.math.BigDecimal spending = transactionService.getTotalSpending(
                    userDetails.getId(), startDate, endDate);
            
            Map<String, Object> response = new HashMap<>();
            response.put("userId", userDetails.getId());
            response.put("totalSpending", spending != null ? spending : 0);
            response.put("currency", "INR");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting total spending", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/transactions/filter
     * Get transactions with advanced filtering and pagination
     */
    @GetMapping("/filter")
    public ResponseEntity<?> getFilteredTransactions(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long accountId,
            @RequestParam(required = false) Double minAmount,
            @RequestParam(required = false) Double maxAmount,
            @RequestParam(defaultValue = "transactionDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            TransactionFilterRequest filterRequest = new TransactionFilterRequest();
            filterRequest.setSearch(search);
            filterRequest.setType(type);
            filterRequest.setCategoryId(categoryId);
            filterRequest.setStartDate(startDate);
            filterRequest.setEndDate(endDate);
            filterRequest.setAccountId(accountId);
            filterRequest.setMinAmount(minAmount);
            filterRequest.setMaxAmount(maxAmount);
            filterRequest.setSortBy(sortBy);
            filterRequest.setSortDirection(sortDirection);
            filterRequest.setPage(page);
            filterRequest.setSize(Math.min(size, 100)); // Max 100 per page
            
            TransactionFilterResponse response = transactionService.getFilteredTransactions(
                userDetails.getId(), filterRequest);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error in filtered transactions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/monthly-summary")
    public ResponseEntity<?> getMonthlySummary(
            @RequestParam int year,
            @RequestParam int month,
            Authentication authentication) {
        
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            MonthlySummaryDTO summary = transactionService.getMonthlySummary(
                userDetails.getId(), year, month);
            
            return ResponseEntity.ok(summary);
            
        } catch (Exception e) {
            log.error("Error getting monthly summary", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get a specific transaction
     * GET /api/transactions/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getTransaction(@PathVariable Long id, Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Transaction transaction = transactionService.getTransaction(userDetails.getId(), id);
            return ResponseEntity.ok(transaction);
        } catch (Exception e) {
            log.error("Error getting transaction", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update a transaction
     * PUT /api/transactions/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTransaction(@PathVariable Long id,
                                              @Valid @RequestBody TransactionRequest request,
                                              Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Transaction transaction = transactionService.updateTransaction(userDetails.getId(), id, request);
            return ResponseEntity.ok(transaction);
        } catch (Exception e) {
            log.error("Error updating transaction", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete a transaction
     * DELETE /api/transactions/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTransaction(@PathVariable Long id, Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            transactionService.deleteTransaction(userDetails.getId(), id);
            return ResponseEntity.ok(Map.of("message", "Transaction deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting transaction", e);
            String message = e.getMessage();
            if (message != null && message.contains("not found or unauthorized")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", message));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", message != null ? message : "Internal server error"));
        }
    }
}