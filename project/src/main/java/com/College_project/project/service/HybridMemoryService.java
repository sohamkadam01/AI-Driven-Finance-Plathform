package com.College_project.project.service;

import java.time.LocalDateTime;
import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.Collections;
import java.util.Deque;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;      // ✅ ADD THIS
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.College_project.project.DTOs.ChatMessageDTO;
import com.College_project.project.models.ChatHistory;
import com.College_project.project.repository.ChatHistoryRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class HybridMemoryService {
    
    private final ChatHistoryRepository chatHistoryRepository;
    
    // In-memory cache for active sessions (fast access)
    private final Map<Long, Deque<ChatMessageDTO>> sessionCache = new ConcurrentHashMap<>();
    
    // Configuration
    private static final int MAX_SESSION_MESSAGES = 20;    // Keep last 20 messages in memory
    private static final int MAX_CONTEXT_MESSAGES = 10;   // Use last 10 for context
    private static final long SESSION_TIMEOUT_MINUTES = 30; // Clear inactive sessions
    
    /**
     * Main entry point to add a message
     */
    public void addMessage(Long userId, String role, String content, String conversationId) {
        ChatMessageDTO message = new ChatMessageDTO(role, content, LocalDateTime.now(), conversationId);
        
        // 1. Update cache IMMEDIATELY (synchronous)
        addToSessionCache(userId, message);
        
        // 2. Persist to DB (asynchronous)
        saveToDatabaseAsync(userId, role, content, conversationId);
    }

    @Async
    private void saveToDatabaseAsync(Long userId, String role, String content, String conversationId) {
        try {
            ChatHistory history = new ChatHistory();
            history.setUserId(userId);
            history.setRole(role);
            history.setContent(content);
            history.setTimestamp(LocalDateTime.now());
            history.setConversationId(conversationId);
            chatHistoryRepository.save(history);
            log.debug("Saved message to database for user: {}", userId);
        } catch (Exception e) {
            log.error("Failed to save message to database: {}", e.getMessage());
        }
    }
    
    /**
     * Add message to in-memory session cache
     */
    private void addToSessionCache(Long userId, ChatMessageDTO message) {
        Deque<ChatMessageDTO> messages = sessionCache.computeIfAbsent(userId, 
            k -> new ArrayDeque<>());
        
        messages.addLast(message);
        
        // Keep only last N messages
        while (messages.size() > MAX_SESSION_MESSAGES) {
            messages.pollFirst();
        }
        
        log.debug("Session cache size for user {}: {}", userId, messages.size());
    }
    
    /**
     * Get conversation context for LLM prompt (combines memory + recent history)
     */
    public String getConversationContext(Long userId, String conversationId) {
        // 1. Ensure we have something in cache
        Deque<ChatMessageDTO> sessionMessages = sessionCache.get(userId);
        
        if (sessionMessages == null || sessionMessages.isEmpty()) {
            log.info("Session cache empty for user {}, attempting to load from database...", userId);
            loadPreviousConversations(userId, MAX_CONTEXT_MESSAGES);
            sessionMessages = sessionCache.get(userId);
        }

        StringBuilder context = new StringBuilder();
        context.append("<CONVERSATION_HISTORY>\n");
        
        if (sessionMessages != null && !sessionMessages.isEmpty()) {
            // Get the most recent ones for the context window
            List<ChatMessageDTO> recentMessages = sessionMessages.stream()
                .skip(Math.max(0, sessionMessages.size() - MAX_CONTEXT_MESSAGES))
                .collect(Collectors.toList());
            
            for (ChatMessageDTO msg : recentMessages) {
                context.append(msg.getRole().toUpperCase())
                       .append(": ").append(msg.getContent()).append("\n");
            }
        }
        
        context.append("</CONVERSATION_HISTORY>\n");
        return context.toString();
    }
    
    /**
     * Load previous conversation history from database (when user starts new session)
     */
 public List<ChatMessageDTO> loadPreviousConversations(Long userId, int limit) {
    try {
        // ✅ Create Pageable object from the limit
        Pageable pageable = PageRequest.of(0, limit);
        List<ChatHistory> history = chatHistoryRepository.getLastNMessages(userId, pageable);
        
        List<ChatMessageDTO> messages = history.stream()
            .map(h -> new ChatMessageDTO(h.getRole(), h.getContent(), 
                  h.getTimestamp(), h.getConversationId()))
            .collect(Collectors.toList());
        
        // Load into session cache
        if (!messages.isEmpty()) {
            Deque<ChatMessageDTO> deque = new ArrayDeque<>();
            messages.forEach(deque::addLast);
            sessionCache.put(userId, deque);
            log.info("Loaded {} previous messages for user: {}", messages.size(), userId);
        }
        
        return messages;
        
    } catch (Exception e) {
        log.error("Failed to load previous conversations: {}", e.getMessage());
        return Collections.emptyList();
    }
}
    
    /**
     * Get summary of user's chat patterns (for analytics)
     */
    public Map<String, Object> getUserChatSummary(Long userId) {
        Map<String, Object> summary = new HashMap<>();
        
        try {
            long totalMessages = chatHistoryRepository.countByUserIdAndRole(userId, "user");
            long totalResponses = chatHistoryRepository.countByUserIdAndRole(userId, "assistant");
            
            summary.put("totalUserMessages", totalMessages);
            summary.put("totalAssistantResponses", totalResponses);
            summary.put("totalInteractions", totalMessages + totalResponses);
            summary.put("sessionCacheSize", sessionCache.getOrDefault(userId, new ArrayDeque<>()).size());
            
        } catch (Exception e) {
            log.error("Failed to get user chat summary: {}", e.getMessage());
        }
        
        return summary;
    }
    
    /**
     * Clear session cache for a user
     */
    public void clearSessionCache(Long userId) {
        sessionCache.remove(userId);
        log.info("Cleared session cache for user: {}", userId);
    }
    
    /**
     * Start a new conversation (generate new conversation ID)
     */
    public String startNewConversation(Long userId) {
        String conversationId = UUID.randomUUID().toString();
        log.info("Started new conversation {} for user: {}", conversationId, userId);
        return conversationId;
    }
    
    /**
     * Clean up inactive sessions (should be called by scheduler)
     */
    public void cleanupInactiveSessions() {
        // This would typically be called by a scheduled task
        // For now, we'll just log the size
        log.info("Active sessions in cache: {}", sessionCache.size());
    }
    
    /**
     * Get relevant past conversations based on current query (semantic search)
     * This is a simplified version - can be enhanced with vector search
     */
    public List<ChatMessageDTO> getRelevantPastConversations(Long userId, String currentQuery, int limit) {
        try {
            // Simple keyword-based search
            // For better results, use vector database or full-text search
            List<ChatHistory> relevantHistory = chatHistoryRepository.findByUserIdOrderByTimestampDesc(
                userId, PageRequest.of(0, limit * 2));
            
            String[] keywords = currentQuery.toLowerCase().split("\\s+");
            
            List<ChatMessageDTO> relevant = relevantHistory.stream()
                .filter(h -> {
                    String content = h.getContent().toLowerCase();
                    return Arrays.stream(keywords).anyMatch(content::contains);
                })
                .map(h -> new ChatMessageDTO(h.getRole(), h.getContent(), 
                      h.getTimestamp(), h.getConversationId()))
                .limit(limit)
                .collect(Collectors.toList());
            
            log.debug("Found {} relevant past messages for user: {}", relevant.size(), userId);
            return relevant;
            
        } catch (Exception e) {
            log.error("Failed to get relevant conversations: {}", e.getMessage());
            return Collections.emptyList();
        }
    }
}