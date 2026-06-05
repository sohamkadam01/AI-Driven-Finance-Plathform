package com.College_project.project.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.College_project.project.models.OcrDocument;
import com.College_project.project.models.User;
import com.College_project.project.repository.OcrDocumentRepository;
import com.College_project.project.repository.UserRepository;
import com.College_project.project.security.UserDetailsImpl;
import com.College_project.project.service.OcrTextParserService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.MissingNode;

@RestController
@RequestMapping("/api/receipts")
public class ReceiptController {

    @Autowired
    private OcrDocumentRepository ocrDocumentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OcrTextParserService ocrTextParserService;

    @PostMapping("/save-extracted")
    public ResponseEntity<?> saveExtractedReceipt(
            @RequestBody JsonNode payload,
            @RequestParam(required = false, defaultValue = "false") boolean force,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "User not authenticated"
            ));
        }

        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            User user = userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String fileHash = textAt(payload, "file_hash");
            if (fileHash != null && !fileHash.isBlank()) {
                OcrDocument existingDoc = ocrDocumentRepository.findByFileHash(fileHash).orElse(null);
                if (existingDoc != null) {
                    if (existingDoc.isProcessed()) {
                        return ResponseEntity.ok(Map.of(
                                "success", true,
                                "message", "It seems this receipt is already uploaded. Are you trying to add it again?",
                                "data", Map.of(
                                        "documentId", existingDoc.getDocumentId(),
                                        "status", "DUPLICATE",
                                        "alreadyProcessed", true
                                )
                        ));
                    }

                    OcrTextParserService.ProcessingResult result =
                            ocrTextParserService.processOcrDocument(existingDoc.getDocumentId(), user.getUserId(), force);
                    return ResponseEntity.ok(buildProcessingResponse(result));
                }
            }

            String extractedText = firstText(payload.path("extracted_text"), payload.path("extractedText"));
            if (extractedText == null || extractedText.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Python OCR did not return any extracted text"
                ));
            }

            OcrDocument document = new OcrDocument();
            document.setUser(user);
            document.setFilename(defaultText(textAt(payload, "filename"), "receipt"));
            document.setFileHash(fileHash);
            document.setExtractedText(extractedText);
            document.setDocumentType(defaultText(extractDocumentType(payload), "RECEIPT"));
            document.setExtractedVendor(extractVendor(payload));
            document.setExtractedDate(extractDate(payload));
            document.setExtractedAmount(extractAmount(payload));
            document.setUploadedAt(LocalDateTime.now());
            document.setProcessed(false);
            document.setProcessingStatus("PENDING_CONFIRMATION");

            OcrDocument saved = ocrDocumentRepository.save(document);
            OcrTextParserService.ProcessingResult result =
                    ocrTextParserService.processOcrDocument(saved.getDocumentId(), user.getUserId(), force);

            return ResponseEntity.ok(buildProcessingResponse(result));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to save extracted receipt: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/process/{documentId}")
    public ResponseEntity<?> processSavedReceipt(
            @PathVariable Long documentId,
            @RequestParam(required = false, defaultValue = "false") boolean force,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "User not authenticated"
            ));
        }

        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            OcrTextParserService.ProcessingResult result =
                    ocrTextParserService.processOcrDocument(documentId, userDetails.getId(), force);
            return ResponseEntity.ok(buildProcessingResponse(result));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to process receipt: " + e.getMessage()
            ));
        }
    }

    private Map<String, Object> buildProcessingResponse(OcrTextParserService.ProcessingResult result) {
        Map<String, Object> data = new HashMap<>();
        data.put("documentId", result.getDocumentId());
        data.put("vendorName", result.getVendorName());
        data.put("extractedAmount", result.getTotalAmount());
        data.put("transactionDate", result.getTransactionDate());
        data.put("receiptType", result.getReceiptType());
        data.put("transactionsCreated", result.getTransactionsCreated());
        data.put("budgetImpact", result.getBudgetImpact());

        if (result.isBudgetExceeded() && result.getTransactionsCreated() == 0) {
            data.put("status", "BUDGET_WARNING");
            return Map.of(
                    "success", true,
                    "message", "Logging this receipt will exceed the budget.",
                    "data", data
            );
        }

        if (result.isDuplicateDetected()) {
            data.put("status", "DUPLICATE");
            return Map.of(
                    "success", true,
                    "message", "This receipt was already logged. Duplicate detected.",
                    "data", data
            );
        }

        if (result.getErrorMessage() != null) {
            data.put("status", "FAILED");
            data.put("error", result.getErrorMessage());
            return Map.of(
                    "success", false,
                    "message", result.getErrorMessage(),
                    "data", data
            );
        }

        data.put("status", "COMPLETED");
        return Map.of(
                "success", true,
                "message", "Receipt saved and transaction created successfully.",
                "data", data
        );
    }

    private String extractVendor(JsonNode payload) {
        JsonNode data = extractedData(payload);
        return firstText(
                data.path("merchant").path("name"),
                data.path("vendor").path("name"),
                data.path("merchant_name"),
                data.path("vendor_name"),
                data.path("store_name"),
                payload.path("extractedVendor")
        );
    }

    private String extractDate(JsonNode payload) {
        JsonNode data = extractedData(payload);
        return firstText(
                data.path("transaction").path("date"),
                data.path("date"),
                data.path("transaction_date"),
                data.path("receipt_date"),
                payload.path("extractedDate")
        );
    }

    private String extractAmount(JsonNode payload) {
        JsonNode data = extractedData(payload);
        return firstText(
                data.path("financial").path("amount_paid"),
                data.path("financial").path("total"),
                data.path("financial").path("grand_total"),
                data.path("amount_paid"),
                data.path("total"),
                data.path("amount"),
                payload.path("extractedAmount")
        );
    }

    private String extractDocumentType(JsonNode payload) {
        JsonNode data = extractedData(payload);
        return firstText(
                data.path("document_type"),
                data.path("receipt_type"),
                payload.path("document_type"),
                payload.path("documentType")
        );
    }

    private JsonNode extractedData(JsonNode payload) {
        JsonNode aiAnalysis = payload.path("ai_analysis");
        if (aiAnalysis.isTextual()) {
            return MissingNode.getInstance();
        }
        return aiAnalysis.path("extracted_data");
    }

    private String textAt(JsonNode payload, String fieldName) {
        return normalizeText(payload.path(fieldName));
    }

    private String firstText(JsonNode... nodes) {
        for (JsonNode node : nodes) {
            String value = normalizeText(node);
            if (value != null) {
                return value;
            }
        }
        return null;
    }

    private String normalizeText(JsonNode node) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return null;
        }
        String value = node.asText();
        return value != null && !value.isBlank() ? value : null;
    }

    private String defaultText(String value, String fallback) {
        return value != null && !value.isBlank() ? value : fallback;
    }
}
