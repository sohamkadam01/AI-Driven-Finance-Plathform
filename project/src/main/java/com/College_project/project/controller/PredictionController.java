package com.College_project.project.controller;

import com.College_project.project.DTOs.PredictionResponse;
import com.College_project.project.DTOs.ScenarioPredictionDTO;
import com.College_project.project.service.PredictionFacadeService;
import com.College_project.project.service.ScenarioPredictionService;
import com.College_project.project.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/predictions")
public class PredictionController {

    @Autowired
private ScenarioPredictionService scenarioPredictionService;
    
    @Autowired
    private PredictionFacadeService predictionFacadeService;
    
    @GetMapping("/statistical")
    public ResponseEntity<?> getStatisticalPrediction(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication authentication) {
        
        // Validate dates
        if (startDate.isAfter(endDate)) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Start date must be before end date");
            error.put("status", "FAILED");
            return ResponseEntity.badRequest().body(error);
        }
        
        if (startDate.isBefore(LocalDate.now())) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Start date cannot be in the past");
            error.put("status", "FAILED");
            return ResponseEntity.badRequest().body(error);
        }
        
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return buildUnauthorizedResponse();
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();
            
            PredictionResponse response = predictionFacadeService.getPrediction(
                userId, startDate, endDate, "STATISTICAL");
            
            return ResponseEntity.ok(response);
            
        } catch (ClassCastException e) {
            return buildAuthErrorResponse("Invalid authentication principal");
        } catch (IllegalArgumentException e) {
            return buildBadRequestResponse(e.getMessage());
        } catch (Exception e) {
            return buildErrorResponse(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/ai")
    public ResponseEntity<?> getAIPrediction(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication authentication) {
        
        // Validate dates
        if (startDate.isAfter(endDate)) {
            return buildBadRequestResponse("Start date must be before end date");
        }
        
        if (startDate.isBefore(LocalDate.now())) {
            return buildBadRequestResponse("Start date cannot be in the past");
        }
        
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return buildUnauthorizedResponse();
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();
            
            PredictionResponse response = predictionFacadeService.getPrediction(
                userId, startDate, endDate, "AI");
            
            return ResponseEntity.ok(response);
            
        } catch (ClassCastException e) {
            return buildAuthErrorResponse("Invalid authentication principal");
        } catch (IllegalArgumentException e) {
            return buildBadRequestResponse(e.getMessage());
        } catch (Exception e) {
            // Try to return statistical prediction as fallback
            try {
                if (authentication != null && authentication.isAuthenticated()) {
                    UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
                    PredictionResponse fallback = predictionFacadeService.getPrediction(
                        userDetails.getId(), startDate, endDate, "STATISTICAL");
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("error", e.getMessage());
                    response.put("fallbackUsed", true);
                    response.put("fallbackResponse", fallback);
                    return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT).body(response);
                }
            } catch (Exception ex) {
                // Ignore fallback error
            }
            return buildErrorResponse(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/auto")
    public ResponseEntity<?> getAutoPrediction(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication authentication) {
        
        // Validate dates
        if (startDate.isAfter(endDate)) {
            return buildBadRequestResponse("Start date must be before end date");
        }
        
        if (startDate.isBefore(LocalDate.now())) {
            return buildBadRequestResponse("Start date cannot be in the past");
        }
        
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return buildUnauthorizedResponse();
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();
            
            // AUTO mode: tries AI, falls back to statistical
            PredictionResponse response = predictionFacadeService.getPrediction(
                userId, startDate, endDate, "AUTO");
            
            return ResponseEntity.ok(response);
            
        } catch (ClassCastException e) {
            return buildAuthErrorResponse("Invalid authentication principal");
        } catch (IllegalArgumentException e) {
            return buildBadRequestResponse(e.getMessage());
        } catch (Exception e) {
            return buildErrorResponse(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Helper methods for consistent error responses
    private ResponseEntity<Map<String, String>> buildUnauthorizedResponse() {
        Map<String, String> error = new HashMap<>();
        error.put("error", "User not authenticated");
        error.put("status", "UNAUTHORIZED");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }
    
    private ResponseEntity<Map<String, String>> buildAuthErrorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        error.put("status", "UNAUTHORIZED");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }
    
    private ResponseEntity<Map<String, String>> buildBadRequestResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        error.put("status", "BAD_REQUEST");
        return ResponseEntity.badRequest().body(error);
    }
    
    private ResponseEntity<Map<String, String>> buildErrorResponse(String message, HttpStatus status) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        error.put("status", "ERROR");
        return ResponseEntity.status(status).body(error);
    }


    /**
 * GET /api/predictions/scenarios
 * Get best/worst case scenarios for future balance
 * 
 * Query Parameters:
 * - months: Number of months to predict (default: 3)
 */
@GetMapping("/scenarios")
public ResponseEntity<?> getScenarioPredictions(
        @RequestParam(defaultValue = "3") int months,
        Authentication authentication) {
    
    try {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        ScenarioPredictionDTO scenarios = scenarioPredictionService.getScenarioPredictions(
            userDetails.getId(), months);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("scenarios", scenarios);
        response.put("months", months);
        
        return ResponseEntity.ok(response);
        
    } catch (Exception e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage());
        return ResponseEntity.badRequest().body(error);
    }
}

/**
 * POST /api/predictions/compare
 * Compare statistical vs AI prediction methods side by side
 * 
 * Request Body: { "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD" }
 */
@PostMapping("/compare")
public ResponseEntity<?> comparePredictions(
        @RequestBody Map<String, String> request,
        Authentication authentication) {
    
    try {
        if (authentication == null || !authentication.isAuthenticated()) {
            return buildUnauthorizedResponse();
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        
        LocalDate startDate = LocalDate.parse(request.get("startDate"));
        LocalDate endDate = LocalDate.parse(request.get("endDate"));
        
        if (startDate.isAfter(endDate)) {
            return buildBadRequestResponse("Start date must be before end date");
        }
        
        // Fetch both predictions
        PredictionResponse statistical = null;
        PredictionResponse ai = null;
        String aiError = null;
        
        try {
            statistical = predictionFacadeService.getPrediction(userId, startDate, endDate, "STATISTICAL");
        } catch (Exception e) {
            // Statistical should always work
        }
        
        try {
            ai = predictionFacadeService.getPrediction(userId, startDate, endDate, "AI");
        } catch (Exception e) {
            aiError = e.getMessage();
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("statistical", statistical);
        response.put("ai", ai);
        response.put("aiError", aiError);
        response.put("comparisonDate", LocalDate.now().toString());
        response.put("startDate", startDate.toString());
        response.put("endDate", endDate.toString());
        
        return ResponseEntity.ok(response);
        
    } catch (Exception e) {
        return buildErrorResponse(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

}