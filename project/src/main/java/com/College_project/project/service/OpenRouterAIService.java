// package com.College_project.project.service;

// import org.springframework.ai.chat.client.ChatClient;
// import org.springframework.ai.chat.messages.UserMessage;
// import org.springframework.ai.chat.prompt.Prompt;
// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.stereotype.Service;
// import reactor.core.publisher.Mono;

// import java.util.List;
// import java.util.Map;

// @Service
// public class OpenRouterAIService {
    
//     private final ChatClient chatClient;
    
//     @Value("${openrouter.site-url:http://localhost:8080}")
//     private String siteUrl;
    
//     @Value("${openrouter.site-name:Finance AI Platform}")
//     private String siteName;
    
//     public OpenRouterAIService(ChatClient.Builder chatClientBuilder) {
//         this.chatClient = chatClientBuilder
//                 .build();
//     }
    
//     /**
//      * Send a simple text prompt to the AI
//      */
//     public String sendMessage(String prompt) {
//         return chatClient.prompt()
//                 .user(prompt)
//                 .call()
//                 .content();
//     }
    
//     /**
//      * Send a financial advice prompt with context
//      */
//     public String getFinancialAdvice(String userContext, String question) {
//         String systemPrompt = """
//             You are a professional financial advisor AI. 
//             Provide accurate, helpful, and safe financial advice.
//             Always include disclaimers when appropriate.
//             Focus on Indian financial context when relevant.
//             """;
        
//         String userPrompt = String.format("""
//             User Financial Context: %s
            
//             User Question: %s
            
//             Please provide personalized financial advice.
//             """, userContext, question);
        
//         return chatClient.prompt()
//                 .system(systemPrompt)
//                 .user(userPrompt)
//                 .call()
//                 .content();
//     }
    
//     /**
//      * Analyze investment portfolio
//      */
//     public String analyzePortfolio(Map<String, Double> holdings, double totalValue) {
//         StringBuilder prompt = new StringBuilder();
//         prompt.append("Analyze this investment portfolio:\n\n");
//         prompt.append("Total Portfolio Value: ₹").append(totalValue).append("\n");
//         prompt.append("Holdings:\n");
        
//         for (Map.Entry<String, Double> entry : holdings.entrySet()) {
//             double percentage = (entry.getValue() / totalValue) * 100;
//             prompt.append(String.format("- %s: ₹%.2f (%.1f%%)\n", 
//                 entry.getKey(), entry.getValue(), percentage));
//         }
        
//         prompt.append("\nProvide:\n");
//         prompt.append("1. Risk assessment\n");
//         prompt.append("2. Diversification analysis\n");
//         prompt.append("3. 3 specific recommendations for improvement\n");
        
//         return chatClient.prompt()
//                 .user(prompt.toString())
//                 .call()
//                 .content();
//     }
    
//     /**
//      * Generate budget optimization suggestions
//      */
//     public String optimizeBudget(Map<String, Double> expenses, double monthlyIncome) {
//         String prompt = String.format("""
//             Monthly Income: ₹%.2f
//             Current Expenses:
//             %s
            
//             Suggest 5 specific ways to optimize this budget and save more money.
//             Calculate potential monthly savings for each suggestion.
//             """, monthlyIncome, formatExpenses(expenses));
        
//         return chatClient.prompt()
//                 .user(prompt)
//                 .call()
//                 .content();
//     }
    
//     private String formatExpenses(Map<String, Double> expenses) {
//         StringBuilder sb = new StringBuilder();
//         for (Map.Entry<String, Double> entry : expenses.entrySet()) {
//             sb.append(String.format("- %s: ₹%.2f\n", entry.getKey(), entry.getValue()));
//         }
//         return sb.toString();
//     }
// }