package com.College_project.project.service;

import com.College_project.project.DTOs.PredictionResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;

@Service
public class PredictionFacadeService {
    
    @Autowired
    private StatisticalPredictionService statisticalPredictionService;
    
    @Autowired
    private AIPredictionService aiPredictionService;
    
    /**
     * Get prediction using specified method
     * @param method - "STATISTICAL", "AI", or "AUTO" (tries AI first, falls back to statistical)
     */
    public PredictionResponse getPrediction(Long userId, LocalDate startDate, 
                                            LocalDate endDate, String method) {
        if ("STATISTICAL".equalsIgnoreCase(method)) {
            return statisticalPredictionService.predictFutureBalance(userId, startDate, endDate);
        } else if ("AI".equalsIgnoreCase(method)) {
            return aiPredictionService.predictWithAIFallback(userId, startDate, endDate);
        } else {
            // AUTO mode: try AI first, fall back to statistical
            return aiPredictionService.predictWithAIFallback(userId, startDate, endDate);
        }
    }
}