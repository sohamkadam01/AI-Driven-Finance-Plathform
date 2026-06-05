package com.College_project.project.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class OpenRouterChatService {
    
    @Value("${openrouter.api.key:}")
    private String apiKey;
    
    private final RestTemplate restTemplate = createRestTemplateWithTimeout(3000, 10000);

    private static RestTemplate createRestTemplateWithTimeout(int connectTimeoutMs, int readTimeoutMs) {
        org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(connectTimeoutMs);
        factory.setReadTimeout(readTimeoutMs);
        return new RestTemplate(factory);
    }
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    public String chat(String userMessage) {
        try {
            String url = "https://openrouter.ai/api/v1/chat/completions";
            
            // Build request body
            Map<String, Object> requestBody = new LinkedHashMap<>();
            requestBody.put("model", "stepfun/step-3.5-flash");
            
            List<Map<String, String>> messages = new ArrayList<>();
            Map<String, String> userMessageMap = new LinkedHashMap<>();
            userMessageMap.put("role", "user");
            userMessageMap.put("content", userMessage);
            messages.add(userMessageMap);
            requestBody.put("messages", messages);
            requestBody.put("temperature", 0.7);
            requestBody.put("max_tokens", 4096);
            
            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            System.out.println("Calling OpenRouter API...");
            System.out.println("URL: " + url);
            System.out.println("Request: " + objectMapper.writeValueAsString(requestBody));
            
            // Make request
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, String.class);
            
            System.out.println("Response Status: " + response.getStatusCode());
            System.out.println("Response Body: " + response.getBody());
            
            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode json = objectMapper.readTree(response.getBody());
                String content = json.path("choices").get(0).path("message").path("content").asText();
                return content;
            } else {
                return "API Error: " + response.getStatusCode();
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }
    
    public String chatWithSystemPrompt(String userMessage, String systemPrompt) {
        try {
            String url = "https://openrouter.ai/api/v1/chat/completions";
            
            Map<String, Object> requestBody = new LinkedHashMap<>();
            requestBody.put("model", "stepfun/step-3.5-flash");
            
            List<Map<String, String>> messages = new ArrayList<>();
            
            Map<String, String> systemMessageMap = new LinkedHashMap<>();
            systemMessageMap.put("role", "system");
            systemMessageMap.put("content", systemPrompt);
            messages.add(systemMessageMap);
            
            Map<String, String> userMessageMap = new LinkedHashMap<>();
            userMessageMap.put("role", "user");
            userMessageMap.put("content", userMessage);
            messages.add(userMessageMap);
            
            requestBody.put("messages", messages);
            requestBody.put("temperature", 0.7);
            requestBody.put("max_tokens", 4096);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode json = objectMapper.readTree(response.getBody());
                return json.path("choices").get(0).path("message").path("content").asText();
            } else {
                return "API Error: " + response.getStatusCode();
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }
}
