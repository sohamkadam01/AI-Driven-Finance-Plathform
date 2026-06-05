package com.College_project.project.controller;

import com.College_project.project.DTOs.BudgetHistoryDTO;
import com.College_project.project.DTOs.BudgetPerformanceDTO;
import com.College_project.project.DTOs.BudgetRequest;
import com.College_project.project.DTOs.BudgetResponse;
import com.College_project.project.models.Budget;
import com.College_project.project.repository.budgetRepository;
import com.College_project.project.service.BudgetService;
import com.College_project.project.security.UserDetailsImpl;
import jakarta.validation.Valid;
import com.College_project.project.repository.UserRepository;   
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;
    
    @Autowired
    private UserRepository userRepository;  // ✅ ADD THIS

    @PostMapping("/check-impact")
    public ResponseEntity<?> checkImpact(@RequestBody Map<String, Object> request,
                                        Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long categoryId = Long.valueOf(request.get("categoryId").toString());
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            LocalDate date = LocalDate.parse(request.get("date").toString());
            
            Map<String, Object> impact = budgetService.analyzeTransactionImpact(userDetails.getId(), categoryId, amount, date);
            return ResponseEntity.ok(impact);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Create a new budget for a category
     * POST /api/budgets/create
     */
    @PostMapping("/create")
    public ResponseEntity<?> createBudget(@Valid @RequestBody BudgetRequest request,
                                         Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            BudgetResponse response = budgetService.createBudget(userDetails.getId(), request);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Budget created successfully");
            result.put("budget", response);
            
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }


    /**
 * Get budgets for a specific month with query param
 * GET /api/budgets/my-budgets?month=2026-04-01
 */
@GetMapping("/my-budgets")
public ResponseEntity<?> getMyBudgets(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate month,
        Authentication authentication) {
    try {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<BudgetResponse> budgets = budgetService.getUserBudgets(userDetails.getId(), month);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("month", month);
        response.put("budgets", budgets);
        response.put("totalBudgets", budgets.size());
        
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        Map<String, Object> error = new HashMap<>();
        error.put("success", false);
        error.put("message", e.getMessage());
        return ResponseEntity.badRequest().body(error);
    }
}

    /**
     * Get all budgets for current month
     * GET /api/budgets/current-month
     */
    @GetMapping("/current-month")
    public ResponseEntity<?> getCurrentMonthBudgets(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        LocalDate currentMonth = LocalDate.now().withDayOfMonth(1);
        
        List<BudgetResponse> budgets = budgetService.getUserBudgets(userDetails.getId(), currentMonth);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("month", currentMonth);
        response.put("budgets", budgets);
        response.put("totalBudgets", budgets.size());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get budgets for a specific month
     * GET /api/budgets?year=2026&month=4
     */
    @GetMapping
    public ResponseEntity<?> getBudgetsByMonth(
            @RequestParam int year,
            @RequestParam int month,
            Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            LocalDate budgetMonth = LocalDate.of(year, month, 1);
            
            List<BudgetResponse> budgets = budgetService.getUserBudgets(userDetails.getId(), budgetMonth);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("year", year);
            response.put("month", month);
            response.put("budgets", budgets);
            response.put("totalBudgets", budgets.size());
            
            // Add summary statistics
            double totalBudget = budgets.stream()
                .mapToDouble(b -> b.getAmountLimit().doubleValue())
                .sum();
            double totalSpent = budgets.stream()
                .mapToDouble(b -> b.getSpentAmount().doubleValue())
                .sum();
            double overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
            
            Map<String, Object> summary = new HashMap<>();
            summary.put("totalBudget", totalBudget);
            summary.put("totalSpent", totalSpent);
            summary.put("remaining", totalBudget - totalSpent);
            summary.put("overallPercentage", Math.round(overallPercentage * 100.0) / 100.0);
            
            response.put("summary", summary);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error fetching budgets: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get budget summary (totals only)
     * GET /api/budgets/summary?year=2026&month=4
     */
    @GetMapping("/summary")
    public ResponseEntity<?> getBudgetSummary(
            @RequestParam int year,
            @RequestParam int month,
            Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            LocalDate budgetMonth = LocalDate.of(year, month, 1);
            
            BudgetResponse summary = budgetService.getBudgetSummary(userDetails.getId(), budgetMonth);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("year", year);
            response.put("month", month);
            response.put("totalBudget", summary.getAmountLimit());
            response.put("totalSpent", summary.getSpentAmount());
            response.put("remaining", summary.getAmountLimit().subtract(summary.getSpentAmount()));
            
            double percentage = summary.getAmountLimit().doubleValue() > 0 
                ? (summary.getSpentAmount().doubleValue() / summary.getAmountLimit().doubleValue()) * 100 
                : 0;
            response.put("percentageUsed", Math.round(percentage * 100.0) / 100.0);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error fetching summary: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Update a budget
     * PUT /api/budgets/{budgetId}
     */
    @PutMapping("/{budgetId}")
    public ResponseEntity<?> updateBudget(
            @PathVariable Long budgetId,
            @RequestBody Map<String, Object> updates,
            Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            // Extract fields from request
            BigDecimal newLimit = null;
            BigDecimal newThreshold = null;
            
            if (updates.get("amountLimit") != null) {
                newLimit = new BigDecimal(updates.get("amountLimit").toString());
            }
            if (updates.get("alertThreshold") != null) {
                newThreshold = new BigDecimal(updates.get("alertThreshold").toString());
            }
            
            BudgetResponse updatedBudget = budgetService.updateBudget(
                budgetId, 
                userDetails.getId(), 
                newLimit, 
                newThreshold
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Budget updated successfully");
            response.put("budget", updatedBudget);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Delete a budget
     * DELETE /api/budgets/{budgetId}
     */
    @DeleteMapping("/{budgetId}")
    public ResponseEntity<?> deleteBudget(@PathVariable Long budgetId,
                                         Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            budgetService.deleteBudget(budgetId, userDetails.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Budget deleted successfully");
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get budget by ID
     * GET /api/budgets/{budgetId}
     */
    @GetMapping("/{budgetId}")
    public ResponseEntity<?> getBudgetById(@PathVariable Long budgetId,
                                          Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            BudgetResponse budget = budgetService.getBudgetById(budgetId, userDetails.getId());
            
            return ResponseEntity.ok(budget);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(404).body(error);
        }
    }

    /**
     * Get budgets that are close to exceeding (over 80% spent)
     * GET /api/budgets/at-risk
     */
    @GetMapping("/at-risk")
    public ResponseEntity<?> getAtRiskBudgets(Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            LocalDate currentMonth = LocalDate.now().withDayOfMonth(1);
            
            List<BudgetResponse> budgets = budgetService.getUserBudgets(userDetails.getId(), currentMonth);
            
            List<BudgetResponse> atRiskBudgets = budgets.stream()
                .filter(budget -> budget.getSpentPercentage().doubleValue() >= 80)
                .collect(java.util.stream.Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("atRiskCount", atRiskBudgets.size());
            response.put("budgets", atRiskBudgets);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Refresh all budgets (recalculate spent amounts)
     * POST /api/budgets/refresh
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshBudgets(Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            LocalDate currentMonth = LocalDate.now().withDayOfMonth(1);
            
            List<BudgetResponse> budgets = budgetService.getUserBudgets(userDetails.getId(), currentMonth);
            
            // Update each budget's spent amount
            for (BudgetResponse budget : budgets) {
                budgetService.updateBudgetSpending(
                    userDetails.getId(),
                    budget.getCategoryId(),
                    currentMonth
                );
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "All budgets refreshed successfully");
            response.put("budgetsUpdated", budgets.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error refreshing budgets: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get spending breakdown by category for a month
     * GET /api/budgets/breakdown?year=2026&month=4
     */
    @GetMapping("/breakdown")
    public ResponseEntity<?> getSpendingBreakdown(
            @RequestParam int year,
            @RequestParam int month,
            Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            LocalDate budgetMonth = LocalDate.of(year, month, 1);
            
            List<BudgetResponse> budgets = budgetService.getUserBudgets(userDetails.getId(), budgetMonth);
            
            List<Map<String, Object>> breakdown = budgets.stream()
                .map(budget -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("categoryId", budget.getCategoryId());
                    item.put("categoryName", budget.getCategoryName());
                    item.put("icon", budget.getIcon());
                    item.put("limit", budget.getAmountLimit());
                    item.put("spent", budget.getSpentAmount());
                    item.put("remaining", budget.getAmountLimit().subtract(budget.getSpentAmount()));
                    
                    double percentage = budget.getAmountLimit().doubleValue() > 0 
                        ? (budget.getSpentAmount().doubleValue() / budget.getAmountLimit().doubleValue()) * 100 
                        : 0;
                    item.put("percentage", Math.round(percentage * 100.0) / 100.0);
                    
                    String status = percentage >= 100 ? "Exceeded" : (percentage >= 80 ? "Warning" : "Good");
                    item.put("status", status);
                    
                    return item;
                })
                .collect(java.util.stream.Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("year", year);
            response.put("month", month);
            response.put("breakdown", breakdown);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
 * GET /api/budgets/history
 * Get budget history for the user
 * 
 * Query Parameters:
 * - months: Number of months to look back (default: 12)
 */
@GetMapping("/history")
public ResponseEntity<?> getBudgetHistory(
        @RequestParam(defaultValue = "12") int months,
        Authentication authentication) {
    
    try {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        BudgetHistoryDTO history = budgetService.getBudgetHistory(userDetails.getId(), months);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("history", history);
        response.put("months", months);
        
        return ResponseEntity.ok(response);
        
    } catch (Exception e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage());
        return ResponseEntity.badRequest().body(error);
    }
}

/**
 * GET /api/budgets/history/category/{categoryId}
 * Get budget history for a specific category
 */
@GetMapping("/history/category/{categoryId}")
public ResponseEntity<?> getCategoryBudgetHistory(
        @PathVariable Long categoryId,
        @RequestParam(defaultValue = "12") int months,
        Authentication authentication) {
    
    try {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        Map<String, Object> history = new HashMap<>();
        List<Map<String, Object>> monthlyData = new ArrayList<>();
        
        LocalDate endDate = LocalDate.now().withDayOfMonth(1);
        LocalDate startDate = endDate.minusMonths(months - 1);
        
        for (int i = 0; i < months; i++) {
            LocalDate currentMonth = startDate.plusMonths(i);
            
            // ✅ FIXED: Use userRepository.findById() correctly
            Optional<Budget> budgetOpt = budgetService.getBudgetForCategoryAndMonth(
                userDetails.getId(), 
                categoryId, 
                currentMonth);
            
            // ✅ FIXED: Use budgetService to calculate spent amount
            BigDecimal spent = budgetService.calculateSpentAmountForMonth(
                userDetails.getId(), 
                categoryId, 
                currentMonth);
            
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", currentMonth);
            monthData.put("budgeted", budgetOpt.map(Budget::getAmountLimit).orElse(BigDecimal.ZERO));
            monthData.put("spent", spent);
            monthData.put("remaining", budgetOpt.map(b -> b.getAmountLimit().subtract(spent)).orElse(BigDecimal.ZERO));
            
            double percentage = 0;
            if (budgetOpt.isPresent() && budgetOpt.get().getAmountLimit().compareTo(BigDecimal.ZERO) > 0) {
                percentage = spent.doubleValue() / budgetOpt.get().getAmountLimit().doubleValue() * 100;
            }
            monthData.put("percentageUsed", Math.round(percentage * 10.0) / 10.0);
            
            monthlyData.add(monthData);
        }
        
        history.put("categoryId", categoryId);
        history.put("history", monthlyData);
        history.put("months", months);
        
        return ResponseEntity.ok(history);
        
    } catch (Exception e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage());
        return ResponseEntity.badRequest().body(error);
    }
}

/**
 * GET /api/budgets/performance
 * Get budget performance for current month
 */
@GetMapping("/performance")
public ResponseEntity<?> getBudgetPerformance(Authentication authentication) {
    try {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        BudgetPerformanceDTO performance = budgetService.getBudgetPerformance(userDetails.getId());
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("performance", performance);
        
        return ResponseEntity.ok(response);
        
    } catch (Exception e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage());
        return ResponseEntity.badRequest().body(error);
    }
}

/**
 * GET /api/budgets/performance/category/{categoryId}
 * Get performance for a specific category
 */
@GetMapping("/performance/category/{categoryId}")
public ResponseEntity<?> getCategoryPerformance(
        @PathVariable Long categoryId,
        Authentication authentication) {
    try {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        LocalDate currentMonth = LocalDate.now().withDayOfMonth(1);
        Optional<Budget> budgetOpt = budgetService.getBudgetForCategoryAndMonth(
            userDetails.getId(), categoryId, currentMonth);
        
        if (!budgetOpt.isPresent()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "No budget found for this category");
            return ResponseEntity.badRequest().body(error);
        }
        
        BudgetPerformanceDTO.CategoryPerformance performance = budgetService.getCategoryPerformance(
            userDetails.getId(), categoryId, currentMonth);
        
        return ResponseEntity.ok(performance);
        
    } catch (Exception e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage());
        return ResponseEntity.badRequest().body(error);
    }
}
}