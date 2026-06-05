package com.College_project.project.controller;

import com.College_project.project.models.Alert;
import com.College_project.project.repository.AlertRepository;
import com.College_project.project.service.AIFinancialInsightService;
import com.College_project.project.service.AlertService;
import com.College_project.project.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/alerts")
public class AlertController {
    
    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private AlertService alertService;
    
    @Autowired
    private AIFinancialInsightService insightService;
    
    @Autowired
    private com.College_project.project.repository.UserRepository userRepository;
    
    /**
     * POST /api/alerts/generate-insight
     * Manually trigger AI insight generation for the authenticated user
     */
    @PostMapping("/generate-insight")
    public ResponseEntity<?> generateInsight(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        com.College_project.project.models.User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        try {
            insightService.generateInsightForUser(user);
            return ResponseEntity.ok(Map.of("success", true, "message", "AI insight generation triggered"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * GET /api/alerts/unread
     * Get all unread alerts for the authenticated user
     */
    @GetMapping("/unread")
    public ResponseEntity<?> getUnreadAlerts(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "User not authenticated");
            return ResponseEntity.status(401).body(error);
        }
        
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            List<Map<String, Object>> alerts = alertService.getUserUnreadAlerts(userDetails.getId()).stream()
                    .map(this::toAlertResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(alerts);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * GET /api/alerts/all
     * Get all alerts for the authenticated user (ordered by newest first)
     */
    @GetMapping("/all")
    public ResponseEntity<?> getAllAlerts(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "User not authenticated");
            return ResponseEntity.status(401).body(error);
        }
        
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            List<Map<String, Object>> alerts = alertService.getUserAllAlerts(userDetails.getId()).stream()
                    .map(this::toAlertResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(alerts);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * PUT /api/alerts/{alertId}/read
     * Mark a specific alert as read
     */
    @PutMapping("/{alertId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long alertId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "User not authenticated");
            return ResponseEntity.status(401).body(error);
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        int updated = alertRepository.markAsRead(alertId, userDetails.getId());
        
        if (updated > 0) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Alert marked as read"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Alert not found or already read"));
        }
    }
    
    /**
     * PUT /api/alerts/mark-all-read
     * Mark all alerts as read for the authenticated user
     */
    @PutMapping("/mark-all-read")
    public ResponseEntity<?> markAllAsRead(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "User not authenticated");
            return ResponseEntity.status(401).body(error);
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        int updated = alertRepository.markAllAsRead(userDetails.getId());
        
        return ResponseEntity.ok(Map.of(
            "success", true, 
            "message", "All alerts marked as read",
            "updatedCount", updated
        ));
    }
    
    /**
     * GET /api/alerts/count/unread
     * Get count of unread alerts
     */
    @GetMapping("/count/unread")
    public ResponseEntity<?> getUnreadCount(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "User not authenticated");
            return ResponseEntity.status(401).body(error);
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        long count = alertService.getUnreadCount(userDetails.getId());
        
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    private Map<String, Object> toAlertResponse(Alert alert) {
        Map<String, Object> response = new HashMap<>();
        response.put("alertId", alert.getAlertId());
        response.put("type", alert.getType());
        response.put("message", alert.getMessage());
        response.put("read", alert.isRead());
        response.put("createdAt", alert.getCreatedAt() != null ? alert.getCreatedAt() : LocalDateTime.now());
        response.put("actionUrl", alert.getActionUrl());
        return response;
    }
}
