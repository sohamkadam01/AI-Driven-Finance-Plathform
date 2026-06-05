package com.College_project.project.controller;

import com.College_project.project.DTOs.FinancialHealthDTO;
import com.College_project.project.DTOs.NetWorthTrendDTO;
import com.College_project.project.DTOs.SavingsRateDTO;
import com.College_project.project.service.AISmartBotService;
import com.College_project.project.service.FinancialHealthService;
import com.College_project.project.service.NetWorthService;
import com.College_project.project.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    
    @Autowired
    private NetWorthService netWorthService;


@Autowired
private FinancialHealthService financialHealthService;  // Add this line

@Autowired
private AISmartBotService aiSmartBotService;
    
    /**
     * GET /api/dashboard/net-worth/current
     * Get current net worth snapshot
     */
    @GetMapping("/net-worth/current")
    public ResponseEntity<?> getCurrentNetWorth(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "User not authenticated");
                return ResponseEntity.status(401).body(error);
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            NetWorthTrendDTO netWorth = netWorthService.getCurrentNetWorth(userDetails.getId());
            
            return ResponseEntity.ok(netWorth);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * GET /api/dashboard/net-worth/trend
     * Get net worth trend over time
     * 
     * Query Parameters:
     * - period: daily, weekly, monthly, yearly (default: monthly)
     * - months: number of months to look back (default: 12)
     */
    @GetMapping("/net-worth/trend")
    public ResponseEntity<?> getNetWorthTrend(
            @RequestParam(defaultValue = "monthly") String period,
            @RequestParam(defaultValue = "12") int months,
            Authentication authentication) {
        
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "User not authenticated");
                return ResponseEntity.status(401).body(error);
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            NetWorthTrendDTO trend = netWorthService.getNetWorthTrend(userDetails.getId(), period, months);
            
            return ResponseEntity.ok(trend);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * GET /api/dashboard/net-worth/monthly
     * Get monthly net worth summary for last N months
     */
    @GetMapping("/net-worth/monthly")
    public ResponseEntity<?> getMonthlyNetWorth(
            @RequestParam(defaultValue = "12") int months,
            Authentication authentication) {
        
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "User not authenticated");
                return ResponseEntity.status(401).body(error);
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            NetWorthTrendDTO trend = netWorthService.getNetWorthTrend(userDetails.getId(), "monthly", months);
            
            // Return only monthly trend data
            Map<String, Object> response = new HashMap<>();
            response.put("monthlyTrend", trend.getMonthlyTrend());
            response.put("currentNetWorth", trend.getCurrentNetWorth());
            response.put("percentageChange", trend.getPercentageChange());
            response.put("highestNetWorth", trend.getHighestNetWorth());
            response.put("lowestNetWorth", trend.getLowestNetWorth());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/savings-rate/current")
public ResponseEntity<?> getCurrentSavingsRate(Authentication authentication) {
    try {
        if (authentication == null || !authentication.isAuthenticated()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "User not authenticated");
            return ResponseEntity.status(401).body(error);
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        SavingsRateDTO savingsRate = netWorthService.getCurrentSavingsRate(userDetails.getId());
        
        return ResponseEntity.ok(savingsRate);
        
    } catch (Exception e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage());
        return ResponseEntity.badRequest().body(error);
    }
}

/**
 * GET /api/dashboard/savings-rate/trend
 * Get savings rate trend over time
 * 
 * Query Parameters:
 * - months: number of months to look back (default: 12)
 */
@GetMapping("/savings-rate/trend")
public ResponseEntity<?> getSavingsRateTrend(
        @RequestParam(defaultValue = "12") int months,
        Authentication authentication) {
    
    try {
        if (authentication == null || !authentication.isAuthenticated()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "User not authenticated");
            return ResponseEntity.status(401).body(error);
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<SavingsRateDTO.MonthlySavingsData> trend = 
                netWorthService.getSavingsRateTrend(userDetails.getId(), months);
        
        Map<String, Object> response = new HashMap<>();
        response.put("trend", trend);
        response.put("months", months);
        
        return ResponseEntity.ok(response);
        
    } catch (Exception e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage());
        return ResponseEntity.badRequest().body(error);
    }
}

/**
 * GET /api/dashboard/savings-rate/summary
 * Get savings rate summary with insights
 */
@GetMapping("/savings-rate/summary")
public ResponseEntity<?> getSavingsRateSummary(
        @RequestParam(defaultValue = "12") int months,
        Authentication authentication) {
    
    try {
        if (authentication == null || !authentication.isAuthenticated()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "User not authenticated");
            return ResponseEntity.status(401).body(error);
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        SavingsRateDTO savingsRate = netWorthService.getCurrentSavingsRate(userDetails.getId());
        
        // Create a summary response
        Map<String, Object> summary = new HashMap<>();
        summary.put("currentSavingsRate", savingsRate.getCurrentSavingsRate());
        summary.put("savingsStatus", savingsRate.getSavingsStatus());
        summary.put("monthlyIncome", savingsRate.getCurrentMonthlyIncome());
        summary.put("monthlyExpenses", savingsRate.getCurrentMonthlyExpenses());
        summary.put("monthlySavings", savingsRate.getCurrentMonthlySavings());
        summary.put("averageSavingsRate", savingsRate.getAverageSavingsRate());
        summary.put("bestSavingsRate", savingsRate.getBestSavingsRate());
        summary.put("worstSavingsRate", savingsRate.getWorstSavingsRate());
        summary.put("totalSavingsYTD", savingsRate.getTotalSavingsYTD());
        summary.put("projectedYearEndSavings", savingsRate.getProjectedYearEndSavings());
        summary.put("insight", savingsRate.getInsight());
        summary.put("recommendations", savingsRate.getRecommendations());
        
        return ResponseEntity.ok(summary);
        
    } catch (Exception e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage());
        return ResponseEntity.badRequest().body(error);
    }
}

@GetMapping("/financial-health")
public ResponseEntity<?> getFinancialHealth(Authentication authentication) {
    try {
        if (authentication == null || !authentication.isAuthenticated()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "User not authenticated");
            return ResponseEntity.status(401).body(error);
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        FinancialHealthDTO health = financialHealthService.calculateFinancialHealth(userDetails.getId());
        
        return ResponseEntity.ok(health);
        
    } catch (Exception e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage());
        return ResponseEntity.badRequest().body(error);
    }
}

@GetMapping("/financial-health/ai-report")
public ResponseEntity<?> getFinancialHealthAiReport(Authentication authentication) {
    try {
        if (authentication == null || !authentication.isAuthenticated()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "User not authenticated");
            return ResponseEntity.status(401).body(error);
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String report = aiSmartBotService.generateFinancialInsightsReport(userDetails.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("report", report);
        response.put("generatedAt", java.time.LocalDateTime.now());
        response.put("source", "ai");

        return ResponseEntity.ok(response);

    } catch (Exception e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage());
        return ResponseEntity.badRequest().body(error);
    }
}

@GetMapping("/savings-rate/ai-improvement")
public ResponseEntity<?> getSavingsRateAiImprovement(Authentication authentication) {
    try {
        if (authentication == null || !authentication.isAuthenticated()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "User not authenticated");
            return ResponseEntity.status(401).body(error);
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Map<String, Object> response = aiSmartBotService.generateSavingsRateImprovementAdvice(userDetails.getId());
        response.put("generatedAt", java.time.LocalDateTime.now());

        return ResponseEntity.ok(response);

    } catch (Exception e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage());
        return ResponseEntity.badRequest().body(error);
    }
}

/**
 * GET /api/dashboard/financial-health/score
 * Get just the financial health score
 */
@GetMapping("/financial-health/score")
public ResponseEntity<?> getFinancialHealthScore(Authentication authentication) {
    try {
        if (authentication == null || !authentication.isAuthenticated()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "User not authenticated");
            return ResponseEntity.status(401).body(error);
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        FinancialHealthDTO health = financialHealthService.calculateFinancialHealth(userDetails.getId());
        
        Map<String, Object> response = new HashMap<>();
        response.put("score", health.getOverallScore());
        response.put("grade", health.getGrade());
        response.put("status", health.getStatus());
        response.put("summary", health.getSummary());
        
        return ResponseEntity.ok(response);
        
    } catch (Exception e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage());
        return ResponseEntity.badRequest().body(error);
    }
}

/**
 * GET /api/dashboard/financial-health/components
 * Get component scores breakdown
 */
@GetMapping("/financial-health/components")
public ResponseEntity<?> getFinancialHealthComponents(Authentication authentication) {
    try {
        if (authentication == null || !authentication.isAuthenticated()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "User not authenticated");
            return ResponseEntity.status(401).body(error);
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        FinancialHealthDTO health = financialHealthService.calculateFinancialHealth(userDetails.getId());
        
        Map<String, Object> response = new HashMap<>();
        response.put("savingsRate", health.getSavingsRateScore());
        response.put("emergencyFund", health.getEmergencyFundScore());
        response.put("debtToIncome", health.getDebtToIncomeScore());
        response.put("budgetAdherence", health.getBudgetAdherenceScore());
        response.put("investmentHealth", health.getInvestmentHealthScore());
        response.put("billConsistency", health.getBillConsistencyScore());
        
        return ResponseEntity.ok(response);
        
    } catch (Exception e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage());
        return ResponseEntity.badRequest().body(error);
    }
}

}
