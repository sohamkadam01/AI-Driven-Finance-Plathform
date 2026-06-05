package com.College_project.project.controller;

import com.College_project.project.service.OpenRouterChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/ai")
public class AIChatController {
    
    @Autowired
    private OpenRouterChatService chatService;
    
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("model", "stepfun/step-3.5-flash");
        response.put("provider", "OpenRouter");
        response.put("message", "AI Chat service is ready!");
        response.put("timestamp", LocalDateTime.now());
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody Map<String, String> request) {
        try {
            String message = request.get("message");
            if (message == null || message.trim().isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Message cannot be empty");
                error.put("success", false);
                return ResponseEntity.badRequest().body(error);
            }
            
            String response = chatService.chat(message);
            
            Map<String, Object> result = new HashMap<>();
            result.put("userMessage", message);
            result.put("aiResponse", response);
            result.put("timestamp", LocalDateTime.now());
            result.put("success", true);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("success", false);
            return ResponseEntity.status(500).body(error);
        }
    }
    
    @PostMapping("/test")
    public ResponseEntity<?> test() {
        try {
            String response = chatService.chat("What is compound interest? Answer in one sentence.");
            
            Map<String, Object> result = new HashMap<>();
            result.put("testResponse", response);
            result.put("timestamp", LocalDateTime.now());
            result.put("success", true);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("success", false);
            return ResponseEntity.status(500).body(error);
        }
    }
}