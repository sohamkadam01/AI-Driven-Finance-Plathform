package com.College_project.project.service;

import com.College_project.project.DTOs.InvestmentAdviceRequest;
import com.College_project.project.DTOs.InvestmentAdviceResponse;
import com.College_project.project.enums.AlertType;
import com.College_project.project.models.User;
import com.College_project.project.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class InvestmentAdviceFacadeService {
    
    @Autowired
    private AIInvestmentAdviceService aiInvestmentAdviceService;
    
    @Autowired
    private InvestmentAdviceService fallbackInvestmentAdviceService;

    @Autowired
    private AlertService alertService;

    @Autowired
    private UserRepository userRepository;
    
    /**
     * Get investment advice - tries AI first, falls back to rule-based
     */
    public InvestmentAdviceResponse getInvestmentAdvice(Long userId, InvestmentAdviceRequest request, String method) {
        System.out.println("========== Investment Advice Facade ==========");
        System.out.println("Requested method: " + method);
        
        if ("AI".equalsIgnoreCase(method)) {
            System.out.println("Using AI-powered advice only");
            InvestmentAdviceResponse response = aiInvestmentAdviceService.getInvestmentAdviceAIOnly(userId, request);
            notifyAdviceReady(userId);
            return response;
        } else if ("RULE".equalsIgnoreCase(method)) {
            System.out.println("Using rule-based advice only");
            InvestmentAdviceResponse response = fallbackInvestmentAdviceService.getInvestmentAdvice(userId, request);
            notifyAdviceReady(userId);
            return response;
        } else {
            // AUTO mode - try AI first, fallback to rule-based
            System.out.println("Using AUTO mode (AI with fallback)");
            InvestmentAdviceResponse response = aiInvestmentAdviceService.getInvestmentAdviceWithAIFallback(userId, request);
            notifyAdviceReady(userId);
            return response;
        }
    }

    private void notifyAdviceReady(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        alertService.createAlert(
                user,
                AlertType.INVESTMENT_ADVICE,
                "Investment advice is ready. Review the latest recommendation before making changes.",
                "/investment-advice");
    }
}
