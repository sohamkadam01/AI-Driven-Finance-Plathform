package com.College_project.project.controller;

import com.College_project.project.DTOs.AnomalyRequest;
import com.College_project.project.DTOs.AnomalyStatisticsDTO;
import com.College_project.project.models.Anomaly;
import com.College_project.project.service.AnomalyDetectionService;
import com.College_project.project.service.AnomalyStatisticsService;
import com.College_project.project.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/anomalies")
public class AnomalyController {
    
    @Autowired
    private AnomalyDetectionService anomalyDetectionService;

    @Autowired
private AnomalyStatisticsService anomalyStatisticsService;
    
    @GetMapping("/my-anomalies")
    public ResponseEntity<?> getUserAnomalies(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<Anomaly> anomalies = anomalyDetectionService.getUserAnomalies(userDetails.getId());
        return ResponseEntity.ok(anomalies);
    }
    
    @GetMapping("/high-priority")
    public ResponseEntity<?> getHighPriorityAnomalies(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<Anomaly> anomalies = anomalyDetectionService.getHighPriorityAnomalies(userDetails.getId());
        return ResponseEntity.ok(anomalies);
    }
    
    @PostMapping("/{anomalyId}/mark-fraud")
    public ResponseEntity<?> markAsFraud(@PathVariable Long anomalyId,
                                        @RequestBody(required = false) Map<String, String> request,
                                        Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String notes = request != null ? request.get("notes") : "Confirmed as fraudulent";
        anomalyDetectionService.markAsFraud(anomalyId, userDetails.getId(), notes);
        return ResponseEntity.ok("Transaction marked as fraud");
    }
    
    @PostMapping("/{anomalyId}/false-alarm")
    public ResponseEntity<?> markAsFalseAlarm(@PathVariable Long anomalyId,
                                             @RequestBody(required = false) Map<String, String> request,
                                             Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String notes = request != null ? request.get("notes") : "False alarm";
        anomalyDetectionService.markAsFalseAlarm(anomalyId, userDetails.getId(), notes);
        return ResponseEntity.ok("Marked as false alarm");
    }
    
    @PostMapping("/scan-recent")
    public ResponseEntity<?> scanRecentTransactions(Authentication authentication) {
        // Only allow if user has admin role, or just run for all
        anomalyDetectionService.scanRecentTransactions();
        return ResponseEntity.ok("Recent transactions scanned for anomalies");
    }
    
    @GetMapping("/stats")
    public ResponseEntity<?> getAnomalyStats(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<Anomaly> anomalies = anomalyDetectionService.getUserAnomalies(userDetails.getId());
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalAnomalies", anomalies.size());
        stats.put("highSeverity", anomalies.stream().filter(a -> a.getSeverity().toString().equals("HIGH")).count());
        stats.put("mediumSeverity", anomalies.stream().filter(a -> a.getSeverity().toString().equals("MEDIUM")).count());
        stats.put("lowSeverity", anomalies.stream().filter(a -> a.getSeverity().toString().equals("LOW")).count());
        stats.put("confirmedFraud", anomalies.stream().filter(Anomaly::isFraud).count());
        
        return ResponseEntity.ok(stats);
    }

    /**
 * GET /api/anomalies/statistics
 * Get anomaly detection statistics
 */
@GetMapping("/statistics")
public ResponseEntity<?> getAnomalyStatistics(Authentication authentication) {
    try {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        AnomalyStatisticsDTO statistics = anomalyStatisticsService.getAnomalyStatistics(userDetails.getId());
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("statistics", statistics);
        
        return ResponseEntity.ok(response);
        
    } catch (Exception e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage());
        return ResponseEntity.badRequest().body(error);
    }
}

/**
 * GET /api/anomalies/statistics/overview
 * Get simplified overview statistics for dashboard
 */
@GetMapping("/statistics/overview")
public ResponseEntity<?> getAnomalyOverview(Authentication authentication) {
    try {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        AnomalyStatisticsDTO statistics = anomalyStatisticsService.getAnomalyStatistics(userDetails.getId());
        
        Map<String, Object> overview = new HashMap<>();
        overview.put("totalAnomalies", statistics.getOverview().getTotalAnomalies());
        overview.put("pendingReview", statistics.getOverview().getPendingReview());
        overview.put("confirmedFraud", statistics.getOverview().getConfirmedFraud());
        overview.put("falseAlarms", statistics.getOverview().getFalseAlarms());
        overview.put("detectionRate", statistics.getOverview().getDetectionRate());
        overview.put("resolutionRate", statistics.getOverview().getResolutionRate());
        
        return ResponseEntity.ok(overview);
        
    } catch (Exception e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage());
        return ResponseEntity.badRequest().body(error);
    }
}
}