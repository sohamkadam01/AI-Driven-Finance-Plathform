package com.College_project.project.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.College_project.project.enums.AlertType;
import com.College_project.project.models.Alert;
import com.College_project.project.models.User;
import com.College_project.project.repository.AlertRepository;
import com.College_project.project.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class AIFinancialInsightService {

    private final UserRepository userRepository;
    private final AlertRepository alertRepository;
    private final AISmartBotService smartBotService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = createRestTemplateWithTimeout(1500, 8000);

    private static RestTemplate createRestTemplateWithTimeout(int connectTimeoutMs, int readTimeoutMs) {
        org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(connectTimeoutMs);
        factory.setReadTimeout(readTimeoutMs);
        return new RestTemplate(factory);
    }

    @Value("${openrouter.api.key:}")
    private String apiKey;

    @Value("${ollama.url:http://localhost:11434}")
    private String ollamaUrl;

    // Run every day at 10:00 AM
    @Scheduled(cron = "0 0 10 * * ?")
    public void generateDailyInsights() {
        log.info("Starting daily AI financial insight generation");
        List<User> users = userRepository.findAll();
        for (User user : users) {
            try {
                generateInsightForUser(user);
            } catch (Exception e) {
                log.error("Failed to generate insight for user: {}", user.getUserId(), e);
            }
        }
    }

    public void generateInsightForUser(User user) {
        Long userId = user.getUserId();
        
        // Check if we already gave an insight today (last 18 hours to be safe)
        LocalDateTime today = LocalDateTime.now().minusHours(18);
        boolean alreadyGenerated = alertRepository.existsByUser_UserIdAndTypeAndCreatedAtAfter(
                userId, AlertType.FINANCIAL_INSIGHT, today);
        
        if (alreadyGenerated) {
            log.debug("Insight already generated recently for user {}", userId);
            return;
        }

        log.info("Generating AI financial insight for user: {}", userId);
        
        // 1. Gather context
        String context = smartBotService.gatherContextOptimized(userId, user);
        
        // 2. Build Prompt
        String prompt = buildInsightPrompt(user.getName(), context);
        
        // 3. Call AI
        String insightText = callAI(prompt);
        
        if (insightText != null && !insightText.trim().isEmpty()) {
            // 4. Save as Alert
            Alert alert = new Alert();
            alert.setUser(user);
            alert.setType(AlertType.FINANCIAL_INSIGHT);
            alert.setMessage(insightText.trim());
            alert.setCreatedAt(LocalDateTime.now());
            alert.setRead(false);
            alert.setActionUrl("/notifications");
            alertRepository.save(alert);
            log.info("Saved AI financial insight for user: {}", userId);
        }
    }

    private String buildInsightPrompt(String name, String context) {
        return String.format("""
            You are SmartBot, a personal financial advisor AI. 
            Analyze the following financial profile for %s and provide ONE concise, actionable financial insight or tip for today.
            
            Rules:
            1. Be professional yet friendly.
            2. Focus on one thing: savings, a budget warning, an investment tip, or a spending habit.
            3. Keep it under 200 characters.
            4. Do NOT use markdown. Just plain text.
            5. If everything looks perfect, give a word of encouragement.
            
            %s
            
            Today's Insight:""", name, context);
    }

    private String callAI(String prompt) {
        // Try Ollama first
        try {
            return callOllama(prompt);
        } catch (Exception e) {
            log.warn("Ollama failed for insight, trying OpenRouter: {}", e.getMessage());
            if (apiKey != null && !apiKey.isEmpty()) {
                return callOpenRouter(prompt);
            }
        }
        return null;
    }

    private String callOllama(String prompt) throws Exception {
        String url = ollamaUrl + "/api/generate";
        Map<String, Object> body = new HashMap<>();
        body.put("model", "qwen2.5:3b");
        body.put("prompt", prompt);
        body.put("stream", false);
        
        String response = restTemplate.postForObject(url, body, String.class);
        return objectMapper.readTree(response).path("response").asText();
    }

    private String callOpenRouter(String prompt) {
        try {
            String url = "https://openrouter.ai/api/v1/chat/completions";
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "stepfun/step-3.5-flash");
            
            List<Map<String, String>> messages = new ArrayList<>();
            Map<String, String> msg = new HashMap<>();
            msg.put("role", "user");
            msg.put("content", prompt);
            messages.add(msg);
            requestBody.put("messages", messages);

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + apiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            String response = restTemplate.postForObject(url, entity, String.class);
            return objectMapper.readTree(response).path("choices").get(0).path("message").path("content").asText();
        } catch (Exception e) {
            log.error("OpenRouter failed for insight", e);
            return null;
        }
    }
}
