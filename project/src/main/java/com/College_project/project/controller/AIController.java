// package com.College_project.project.controller;

// import com.College_project.project.service.OpenRouterAIService;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// import java.time.LocalDateTime;
// import java.util.HashMap;
// import java.util.Map;

// @CrossOrigin(origins = "*")
// @RestController
// @RequestMapping("/api/ai")
// public class AIController {
    
//     @Autowired
//     private OpenRouterAIService aiService;
    
//     @GetMapping("/health")
//     public ResponseEntity<?> healthCheck() {
//         Map<String, Object> response = new HashMap<>();
//         response.put("status", "UP");
//         response.put("model", "stepfun/step-3.5-flash");
//         response.put("provider", "OpenRouter");
//         response.put("message", "AI service is ready!");
//         response.put("timestamp", LocalDateTime.now());
//         return ResponseEntity.ok(response);
//     }
    
//     @PostMapping("/chat")
//     public ResponseEntity<?> chat(@RequestBody ChatRequest request) {
//         try {
//             String response = aiService.sendMessage(request.getMessage());
            
//             Map<String, Object> result = new HashMap<>();
//             result.put("response", response);
//             result.put("timestamp", LocalDateTime.now());
//             result.put("success", true);
            
//             return ResponseEntity.ok(result);
//         } catch (Exception e) {
//             Map<String, Object> error = new HashMap<>();
//             error.put("error", e.getMessage());
//             error.put("success", false);
//             return ResponseEntity.status(500).body(error);
//         }
//     }
    
//     @PostMapping("/financial-advice")
//     public ResponseEntity<?> getFinancialAdvice(@RequestBody FinancialAdviceRequest request) {
//         try {
//             String advice = aiService.getFinancialAdvice(
//                 request.getUserContext(), 
//                 request.getQuestion()
//             );
            
//             Map<String, Object> response = new HashMap<>();
//             response.put("advice", advice);
//             response.put("timestamp", LocalDateTime.now());
//             response.put("model", "stepfun/step-3.5-flash");
            
//             return ResponseEntity.ok(response);
//         } catch (Exception e) {
//             return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
//         }
//     }
    
//     @PostMapping("/analyze-portfolio")
//     public ResponseEntity<?> analyzePortfolio(@RequestBody PortfolioRequest request) {
//         try {
//             String analysis = aiService.analyzePortfolio(
//                 request.getHoldings(), 
//                 request.getTotalValue()
//             );
            
//             return ResponseEntity.ok(Map.of(
//                 "analysis", analysis,
//                 "timestamp", LocalDateTime.now()
//             ));
//         } catch (Exception e) {
//             return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
//         }
//     }
    
//     // Inner DTO classes
//     static class ChatRequest {
//         private String message;
//         public String getMessage() { return message; }
//         public void setMessage(String message) { this.message = message; }
//     }
    
//     static class FinancialAdviceRequest {
//         private String userContext;
//         private String question;
//         public String getUserContext() { return userContext; }
//         public void setUserContext(String userContext) { this.userContext = userContext; }
//         public String getQuestion() { return question; }
//         public void setQuestion(String question) { this.question = question; }
//     }
    
//     static class PortfolioRequest {
//         private Map<String, Double> holdings;
//         private double totalValue;
//         public Map<String, Double> getHoldings() { return holdings; }
//         public void setHoldings(Map<String, Double> holdings) { this.holdings = holdings; }
//         public double getTotalValue() { return totalValue; }
//         public void setTotalValue(double totalValue) { this.totalValue = totalValue; }
//     }
// }