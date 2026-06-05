package com.College_project.project.controller;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.concurrent.DelegatingSecurityContextRunnable;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.College_project.project.security.UserDetailsImpl;
import com.College_project.project.service.AISmartBotService;
import com.College_project.project.service.IntentDetectionService;
import com.College_project.project.service.IntentDetectionService.Intent;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/smartbot")
@RequiredArgsConstructor
public class SmartBotController {

    private final AISmartBotService smartBotService;
    private final IntentDetectionService intentDetectionService;

    @PostMapping("/ask")
    public ResponseEntity<ApiResponse> askSmartBot(@Valid @RequestBody ChatRequest request,
                                                   Authentication authentication) {
        long startTime = System.currentTimeMillis();

        try {
            UserDetailsImpl userDetails = validateAuthentication(authentication);
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("User not authenticated"));
            }

            String userMessage = request.getMessage();
            if (userMessage == null || userMessage.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Message cannot be empty"));
            }

            if (userMessage.length() > 2000) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Message too long (max 2000 characters)"));
            }

            log.info("Processing chat request for user: {}, message length: {}",
                userDetails.getId(), userMessage.length());

            Intent intent = intentDetectionService.detectIntent(userMessage);
            log.info("Detected intent: {} for user: {}", intent, userDetails.getId());

            BigDecimal amount = null;
            String description = null;
            if (intent == Intent.ADD_EXPENSE || intent == Intent.ADD_INCOME) {
                amount = intentDetectionService.extractAmount(userMessage);
                description = intentDetectionService.extractDescription(userMessage);
            }

            String aiResponse = smartBotService.getChatResponseWithRouting(
                userDetails.getId(),
                userMessage,
                intent,
                amount,
                description
            );

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("intent", intent.toString());
            metadata.put("source", smartBotService.shouldUseRuleBasedResponse(intent) ? "rule-based" : "ai");
            metadata.put("responseTime", System.currentTimeMillis() - startTime);
            metadata.put("requiresTypingAnimation", true);

            long duration = System.currentTimeMillis() - startTime;
            log.info("Chat request completed for user: {} in {} ms", userDetails.getId(), duration);

            // mark request as completed (for rate limiting)
            smartBotService.markRequestCompleted(userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success(aiResponse, metadata));

        } catch (IllegalArgumentException e) {
            log.warn("Invalid request: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error processing chat request", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to process your request. Please try again."));
        }
    }

    @PostMapping("/ask-smart")
    public ResponseEntity<ApiResponse> askSmartBotSmart(@Valid @RequestBody ChatRequest request,
                                                         Authentication authentication) {
        long startTime = System.currentTimeMillis();

        try {
            UserDetailsImpl userDetails = validateAuthentication(authentication);
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("User not authenticated"));
            }

            String userMessage = request.getMessage();
            if (userMessage == null || userMessage.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Message cannot be empty"));
            }

            log.info("Processing smart chat request for user: {}", userDetails.getId());

            Intent intent = intentDetectionService.detectIntent(userMessage);
            log.info("Detected intent for smart chat: {}", intent);

            BigDecimal amount = null;
            String description = null;

            if (intent == Intent.ADD_EXPENSE || intent == Intent.ADD_INCOME) {
                amount = intentDetectionService.extractAmount(userMessage);
                description = intentDetectionService.extractDescription(userMessage);
            }

            String aiResponse = smartBotService.getChatResponseWithRouting(
                userDetails.getId(),
                userMessage,
                intent,
                amount,
                description
            );

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("intent", intent.toString());
            metadata.put("source", smartBotService.shouldUseRuleBasedResponse(intent) ? "rule-based" : "ai");
            metadata.put("responseTime", System.currentTimeMillis() - startTime);
            metadata.put("requiresTypingAnimation", true);
            metadata.put("typingSpeed", getTypingSpeedForIntent(intent));

            if (amount != null) metadata.put("extractedAmount", amount);
            if (description != null) metadata.put("extractedDescription", description);

            long duration = System.currentTimeMillis() - startTime;
            log.info("Smart chat completed in {} ms for intent: {}", duration, intent);

            // mark request completed
            smartBotService.markRequestCompleted(userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success(aiResponse, metadata));

        } catch (Exception e) {
            log.error("Error processing smart chat request", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to process your request."));
        }
    }

    @PostMapping("/ask-stream")
    public ResponseEntity<StreamingResponse> askSmartBotStream(@Valid @RequestBody ChatRequest request,
                                                               Authentication authentication) {
        try {
            UserDetailsImpl userDetails = validateAuthentication(authentication);
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(StreamingResponse.error("User not authenticated"));
            }

            String userMessage = request.getMessage();
            if (userMessage == null || userMessage.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(StreamingResponse.error("Message cannot be empty"));
            }

            Intent intent = intentDetectionService.detectIntent(userMessage);

            String fullResponse = smartBotService.getChatResponseWithRouting(
                userDetails.getId(),
                userMessage,
                intent
            );

            String[] chunks = splitIntoChunks(fullResponse, 5);
            return ResponseEntity.ok(StreamingResponse.success(fullResponse, chunks, intent.toString()));

        } catch (Exception e) {
            log.error("Error in stream chat", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(StreamingResponse.error("Failed to process request"));
        }
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamSmartBot(@RequestParam String message, Authentication authentication) {
        SseEmitter emitter = new SseEmitter(180_000L);

        try {
            UserDetailsImpl userDetails = validateAuthentication(authentication);
            if (userDetails == null) {
                emitter.send(SseEmitter.event().data("User not authenticated"));
                emitter.complete();
                return emitter;
            }

            if (message == null || message.trim().isEmpty()) {
                emitter.send(SseEmitter.event().data("Message cannot be empty"));
                emitter.complete();
                return emitter;
            }

            String userMessage = message.trim();
            Intent intent = intentDetectionService.detectIntent(userMessage);

            try {
                emitter.send(SseEmitter.event().name("connected").data("true"));
            } catch (Exception e) {
                log.warn("Failed to send connection event");
            }

            if (intent == Intent.APPLICATION_HELP || intent == Intent.HELP) {
                String response = smartBotService.getChatResponseWithRouting(
                    userDetails.getId(),
                    userMessage,
                    intent
                );
                try {
                    int chunkSize = 12;
                    for (int i = 0; i < response.length(); i += chunkSize) {
                        int end = Math.min(i + chunkSize, response.length());
                        Map<String, String> chunkMap = new HashMap<>();
                        chunkMap.put("text", response.substring(i, end));
                        chunkMap.put("source", "rule-based");
                        chunkMap.put("intent", intent.toString());
                        emitter.send(SseEmitter.event().data(chunkMap));
                        Thread.sleep(20);
                    }
                    smartBotService.markRequestCompleted(userDetails.getId());
                    emitter.send(SseEmitter.event().name("done").data("true"));
                    emitter.complete();
                } catch (Exception e) {
                    log.error("Failed to stream application help response", e);
                    emitter.completeWithError(e);
                }
                return emitter;
            }

            if (smartBotService.shouldUseRuleBasedResponse(intent)) {
                BigDecimal amount = null;
                String description = null;

                if (intent == Intent.ADD_EXPENSE || intent == Intent.ADD_INCOME) {
                    amount = intentDetectionService.extractAmount(userMessage);
                    description = intentDetectionService.extractDescription(userMessage);
                }

                final BigDecimal finalAmount = amount;
                final String finalDescription = description;

                SecurityContext securityContext = SecurityContextHolder.getContext();
                java.util.concurrent.CompletableFuture.runAsync(
                    new DelegatingSecurityContextRunnable(() -> {
                    try {
                        String response = smartBotService.getChatResponseWithRouting(
                            userDetails.getId(),
                            userMessage,
                            intent,
                            finalAmount,
                            finalDescription
                        );

                        String text = response == null || response.isBlank()
                            ? "I could not generate a response. Please try again."
                            : response;

                        int chunkSize = 12;
                        for (int i = 0; i < text.length(); i += chunkSize) {
                            int end = Math.min(i + chunkSize, text.length());
                            Map<String, String> chunkMap = new HashMap<>();
                            chunkMap.put("text", text.substring(i, end));
                            chunkMap.put("source", "rule-based");
                            chunkMap.put("intent", intent.toString());
                            emitter.send(SseEmitter.event().data(chunkMap));
                            Thread.sleep(20);
                        }
                        // mark success for rate-limiting
                        smartBotService.markRequestCompleted(userDetails.getId());
                        emitter.send(SseEmitter.event().name("done").data("true"));
                        emitter.complete();
                    } catch (Exception e) {
                        log.error("Failed to stream routed response", e);
                        try { emitter.completeWithError(e); } catch (Exception ex) {}
                    }
                }, securityContext)
                );
            } else {
                smartBotService.streamChatResponse(userDetails.getId(), userMessage, chunk -> {
                    try {
                        Map<String, String> chunkMap = new HashMap<>();
                        chunkMap.put("text", chunk);
                        emitter.send(SseEmitter.event().data(chunkMap));
                    } catch (Exception e) {
                        log.warn("Failed to send chat stream chunk", e);
                    }
                }).thenAccept(v -> {
                    try {
                        // mark success for rate-limiting when streaming completes
                        smartBotService.markRequestCompleted(userDetails.getId());
                        emitter.send(SseEmitter.event().name("done").data("true"));
                        emitter.complete();
                        log.debug("Chat stream completed for user: {}", userDetails.getId());
                    } catch (Exception e) {
                        log.debug("Emitter already completed or closed");
                    }
                }).exceptionally(ex -> {
                    log.error("Chat stream failed for user: {}", userDetails.getId(), ex);
                    try { emitter.completeWithError(ex); } catch (Exception e) {}
                    return null;
                });
            }

            emitter.onTimeout(() -> {
                log.warn("Chat stream timed out");
                emitter.complete();
            });

            return emitter;
        } catch (Exception e) {
            log.error("Error starting chat stream", e);
            emitter.completeWithError(e);
            return emitter;
        }
    }

    @PostMapping("/clear-history")
    public ResponseEntity<ApiResponse> clearHistory(Authentication authentication) {
        try {
            UserDetailsImpl userDetails = validateAuthentication(authentication);
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("User not authenticated"));
            }

            smartBotService.clearConversationHistory(userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success("Chat history cleared"));
        } catch (Exception e) {
            log.error("Error clearing chat history", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to clear chat history"));
        }
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse> getSummary(Authentication authentication) {
        try {
            UserDetailsImpl userDetails = validateAuthentication(authentication);
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("User not authenticated"));
            }

            Map<String, Object> summary = smartBotService.getChatSummary(userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success(summary.toString(), summary));
        } catch (Exception e) {
            log.error("Error getting chat summary", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to get chat summary"));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", System.currentTimeMillis());
        health.put("service", "SmartBot Service");
        health.put("version", "2.0.0");
        return ResponseEntity.ok(health);
    }

    @PostMapping("/detect-intent")
    public ResponseEntity<Map<String, Object>> detectIntent(@Valid @RequestBody ChatRequest request) {
        try {
            String userMessage = request.getMessage();
            Intent intent = intentDetectionService.detectIntent(userMessage);

            Map<String, Object> response = new HashMap<>();
            response.put("intent", intent.toString());
            response.put("message", userMessage);

            if (intent == Intent.ADD_EXPENSE || intent == Intent.ADD_INCOME) {
                BigDecimal amount = intentDetectionService.extractAmount(userMessage);
                String description = intentDetectionService.extractDescription(userMessage);
                if (amount != null) response.put("amount", amount);
                if (description != null) response.put("description", description);
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error detecting intent", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to detect intent"));
        }
    }

    private UserDetailsImpl validateAuthentication(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("Unauthenticated access attempt");
            return null;
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetailsImpl) {
            return (UserDetailsImpl) principal;
        }

        log.warn("Invalid principal type: {}", principal != null ? principal.getClass() : "null");
        return null;
    }

    private int getTypingSpeedForIntent(Intent intent) {
        switch (intent) {
            case GREETING: return 50;
            case HELP: return 30;
            case GET_BALANCE:
            case GET_NET_WORTH: return 40;
            case ADD_EXPENSE:
            case ADD_INCOME: return 35;
            default: return 45;
        }
    }

    private String[] splitIntoChunks(String text, int chunkSize) {
        int length = text.length();
        int numChunks = (int) Math.ceil((double) length / chunkSize);
        String[] chunks = new String[numChunks];

        for (int i = 0; i < numChunks; i++) {
            int start = i * chunkSize;
            int end = Math.min(start + chunkSize, length);
            chunks[i] = text.substring(start, end);
        }
        return chunks;
    }
}


// Request DTO
@lombok.Data
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
class ChatRequest {
    @NotBlank(message = "Message cannot be blank")
    private String message;
}

// Response DTO
@lombok.Data
@lombok.AllArgsConstructor
@lombok.NoArgsConstructor
class ApiResponse {
    private boolean success;
    private String message;
    private String response;
    private Map<String, Object> metadata;

    public static ApiResponse success(String response) {
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setSuccess(true);
        apiResponse.setMessage("success");
        apiResponse.setResponse(response);
        apiResponse.setMetadata(new HashMap<>());
        return apiResponse;
    }

    public static ApiResponse success(String response, Map<String, Object> metadata) {
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setSuccess(true);
        apiResponse.setMessage("success");
        apiResponse.setResponse(response);
        apiResponse.setMetadata(metadata);
        return apiResponse;
    }

    public static ApiResponse error(String message) {
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setSuccess(false);
        apiResponse.setMessage(message);
        apiResponse.setMetadata(new HashMap<>());
        return apiResponse;
    }
}

// Streaming Response DTO
@lombok.Data
@lombok.AllArgsConstructor
@lombok.NoArgsConstructor
class StreamingResponse {
    private boolean success;
    private String message;
    private String fullResponse;
    private String[] chunks;
    private String intent;
    private int typingSpeed;

    public static StreamingResponse success(String fullResponse, String[] chunks, String intent) {
        StreamingResponse response = new StreamingResponse();
        response.setSuccess(true);
        response.setMessage("success");
        response.setFullResponse(fullResponse);
        response.setChunks(chunks);
        response.setIntent(intent);
        response.setTypingSpeed(45);
        return response;
    }

    public static StreamingResponse error(String message) {
        StreamingResponse response = new StreamingResponse();
        response.setSuccess(false);
        response.setMessage(message);
        return response;
    }
}
