package com.College_project.project.controller;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.College_project.project.DTOs.InvestmentAdviceRequest;
import com.College_project.project.DTOs.InvestmentAdviceResponse;
import com.College_project.project.DTOs.InvestmentRequest;
import com.College_project.project.DTOs.InvestmentResponse;
import com.College_project.project.DTOs.PortfolioPerformanceDTO;
import com.College_project.project.security.UserDetailsImpl;
import com.College_project.project.service.InvestmentAdviceFacadeService;
import com.College_project.project.service.InvestmentService;
import com.College_project.project.service.PortfolioPerformanceService;

import jakarta.validation.Valid;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/investments")
public class InvestmentController {
    
    private static final Logger log = LoggerFactory.getLogger(InvestmentController.class);

    @Autowired
    private PortfolioPerformanceService portfolioPerformanceService;
    
    @Autowired
    private InvestmentService investmentService;
    
    @Autowired
    private InvestmentAdviceFacadeService investmentAdviceFacadeService;
    
    // Test endpoint
    @GetMapping("/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok(Map.of("status", "Investment controller is working!"));
    }
    
    // ===== INVESTMENT CRUD OPERATIONS =====
    
    @PostMapping("/add")
    public ResponseEntity<?> addInvestment(@Valid @RequestBody InvestmentRequest request,
                                          Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            InvestmentResponse response = investmentService.addInvestment(userDetails.getId(), request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/my-investments")
    public ResponseEntity<?> getMyInvestments(Authentication authentication) {
        try {
            log.info("Fetching investments for user");
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            List<InvestmentResponse> investments = investmentService.getUserInvestments(userDetails.getId());
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("investments", investments);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/summary")
    public ResponseEntity<?> getInvestmentSummary(Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            InvestmentResponse summary = investmentService.getInvestmentSummary(userDetails.getId());
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("summary", summary);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PutMapping("/{investmentId}/update-value")
    public ResponseEntity<?> updateInvestmentValue(@PathVariable Long investmentId,
                                                   @RequestParam BigDecimal newValue,
                                                   Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            InvestmentResponse response = investmentService.updateInvestmentValue(
                investmentId, userDetails.getId(), newValue);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @DeleteMapping("/{investmentId}")
    public ResponseEntity<?> deleteInvestment(@PathVariable Long investmentId,
                                             Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            investmentService.deleteInvestment(investmentId, userDetails.getId());
            return ResponseEntity.ok(Map.of("message", "Investment deleted successfully"));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // ===== PERFORMANCE ENDPOINTS =====
    
    @GetMapping("/performance")
    public ResponseEntity<?> getPortfolioPerformance(
            @RequestParam(defaultValue = "6M") String period,
            Authentication authentication) {
        
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            PortfolioPerformanceDTO performance = portfolioPerformanceService.getPortfolioPerformance(
                userDetails.getId(), period);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("performance", performance);
            response.put("period", period);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/performance/asset-allocation")
    public ResponseEntity<?> getAssetAllocation(Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            List<PortfolioPerformanceDTO.AssetAllocation> allocation = 
                portfolioPerformanceService.getAssetAllocation(userDetails.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("allocation", allocation);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ===== INVESTMENT ADVICE ENDPOINTS =====

    @PostMapping("/advice/{method}")
    public ResponseEntity<?> getInvestmentAdvice(
            @PathVariable String method,
            @Valid @RequestBody InvestmentAdviceRequest request,
            Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            InvestmentAdviceResponse response = investmentAdviceFacadeService.getInvestmentAdvice(
                userDetails.getId(), request, method);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error getting investment advice", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}