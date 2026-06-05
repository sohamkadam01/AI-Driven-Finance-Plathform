package com.College_project.project.controller;

import java.io.File;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.College_project.project.models.OcrDocument;
import com.College_project.project.models.User;
import com.College_project.project.repository.AlertRepository;
import com.College_project.project.repository.OcrDocumentRepository;
import com.College_project.project.repository.UserRepository;
import com.College_project.project.security.UserDetailsImpl;
import com.College_project.project.service.AsyncOcrService;
import com.College_project.project.service.OcrServiceClient;
import com.College_project.project.service.OcrTextParserService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/ocr")
public class OcrController {
    
    @Autowired
    private OcrServiceClient ocrServiceClient;
    
    @Autowired
    private OcrDocumentRepository ocrDocumentRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private OcrTextParserService ocrTextParserService;

    @Autowired
    private AsyncOcrService asyncOcrService;
    
    @Value("${spring.servlet.multipart.max-file-size:10MB}")
    private String maxFileSize;
    
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "OCR Controller");
        response.put("maxFileSize", maxFileSize);
        response.put("timestamp", LocalDateTime.now());
        
        try {
            @SuppressWarnings("rawtypes")
            Map pythonHealth = ocrServiceClient.healthCheck().block();
            response.put("pythonService", pythonHealth);
        } catch (Exception e) {
            response.put("pythonService", "Not available: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/process/{documentId}")
    public ResponseEntity<?> processDocument(
            @PathVariable Long documentId,
            @RequestParam(required = false, defaultValue = "false") boolean force,
            Authentication authentication) {
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        try {
            OcrTextParserService.ProcessingResult result = ocrTextParserService.processOcrDocument(documentId, userDetails.getId(), force);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Document processed successfully!");
            response.put("summary", result.toSummary());
            response.put("extractedItems", result.getExtractedTransactions());
            response.put("transactionsCreated", result.getCreatedTransactions().size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadReceipt(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        
        System.out.println("📤 Upload endpoint called with file: " + file.getOriginalFilename());
        
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
            
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "File is empty"
                ));
            }
            
            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || (!contentType.startsWith("image/") && !contentType.equals("application/pdf"))) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Invalid file type. Please upload an image or PDF."
                ));
            }
            
            // Validate file size (max 5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "File size must be less than 5MB"
                ));
            }
            
            // ✅ CHECK FOR DUPLICATE FILE BY HASH
            String fileHash = getFileHash(file);
            OcrDocument existingDoc = ocrDocumentRepository.findByFileHash(fileHash).orElse(null);
            
            if (existingDoc != null && existingDoc.isProcessed()) {
                System.out.println("⚠️ DUPLICATE FILE DETECTED! File already uploaded: " + existingDoc.getDocumentId());
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "It seems this receipt is already uploaded. Are you trying to add it again?",
                    "data", Map.of(
                        "documentId", existingDoc.getDocumentId(),
                        "alreadyProcessed", true,
                        "status", "DUPLICATE"
                    )
                ));
            }
            
            String filename = file.getOriginalFilename();
            File tempFile = File.createTempFile("ocr_upload_", "_" + filename);
            file.transferTo(tempFile);
            
            System.out.println("📄 File saved to temp location: " + tempFile.getAbsolutePath());
            
            // Save initial document record
            OcrDocument ocrDocument = new OcrDocument();
            ocrDocument.setUser(user);
            ocrDocument.setFilename(filename);
            ocrDocument.setFileHash(fileHash);
            ocrDocument.setUploadedAt(LocalDateTime.now());
            ocrDocument.setProcessed(false);
            ocrDocument.setProcessingStatus("PROCESSING");
            
            OcrDocument saved = ocrDocumentRepository.save(ocrDocument);
            
            // Trigger ASYNC processing
            asyncOcrService.processReceiptAsync(saved.getDocumentId(), user.getUserId(), tempFile);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Receipt uploaded successfully! We are processing it in the background.",
                "data", Map.of(
                    "documentId", saved.getDocumentId(),
                    "status", "PROCESSING",
                    "message", "Analyzing your receipt..."
                )
            ));
            
        } catch (Exception e) {
            log.error("❌ Upload error: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "Failed to upload receipt: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/status/{documentId}")
    public ResponseEntity<?> getProcessingStatus(
            @PathVariable Long documentId,
            Authentication authentication) {
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        OcrDocument doc = ocrDocumentRepository.findById(documentId).orElse(null);
        
        if (doc == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Document not found"));
        }
        
        if (!doc.getUser().getUserId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Unauthorized"));
        }
        
        Map<String, Object> status = new HashMap<>();
        status.put("documentId", doc.getDocumentId());
        status.put("processed", doc.isProcessed());
        status.put("status", doc.getProcessingStatus());
        
        if (doc.isProcessed()) {
            status.put("vendorName", doc.getExtractedVendor());
            status.put("extractedAmount", doc.getExtractedAmount());
            status.put("extractedDate", doc.getExtractedDate());
            status.put("receiptType", doc.getDocumentType());
        }
        
        return ResponseEntity.ok(status);
    }

    @PostMapping("/process-all")
    public ResponseEntity<?> processAllDocuments(Authentication authentication) {
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        
        try {
            ocrTextParserService.batchProcessDocuments();
            
            Map<String, String> response = new HashMap<>();
            response.put("success", "true");
            response.put("message", "All pending documents processed successfully!");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/document/{documentId}/analysis")
    public ResponseEntity<?> getDocumentAnalysis(
            @PathVariable Long documentId,
            Authentication authentication) {
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        OcrDocument document = ocrDocumentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        
        if (!document.getUser().getUserId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Unauthorized"));
        }
        
        Map<String, Object> analysis = new HashMap<>();
        analysis.put("documentId", document.getDocumentId());
        analysis.put("filename", document.getFilename());
        analysis.put("uploadedAt", document.getUploadedAt());
        analysis.put("processed", document.isProcessed());
        analysis.put("extractedAmount", document.getExtractedAmount());
        analysis.put("extractedDate", document.getExtractedDate());
        analysis.put("extractedVendor", document.getExtractedVendor());
        analysis.put("fullText", document.getExtractedText());
        
        return ResponseEntity.ok(analysis);
    }
    
    @PostMapping("/extract")
    public ResponseEntity<?> extractTextFromImage(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
        }
        
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            User user = userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
            }
            
            String filename = file.getOriginalFilename();
            File tempFile = File.createTempFile("ocr_sync_", "_" + filename);
            file.transferTo(tempFile);
            
            OcrServiceClient.OcrResponse ocrResult = ocrServiceClient.extractText(tempFile).block();
            
            if (ocrResult == null || !ocrResult.isSuccess()) {
                return ResponseEntity.badRequest().body(Map.of("error", "OCR extraction failed"));
            }

            OcrDocument ocrDocument = new OcrDocument();
            ocrDocument.setUser(user);
            ocrDocument.setFilename(filename);
            ocrDocument.setExtractedText(ocrResult.getExtracted_text());
            ocrDocument.setDocumentType(resolveDocumentType(ocrResult));
            ocrDocument.setUploadedAt(LocalDateTime.now());
            ocrDocument.setExtractedVendor(extractVendor(ocrResult));
            ocrDocument.setExtractedDate(extractDate(ocrResult));
            ocrDocument.setExtractedAmount(extractAmount(ocrResult));
            ocrDocument.setProcessed(false);
            ocrDocument.setProcessingStatus("PENDING_CONFIRMATION");
            
            OcrDocument saved = ocrDocumentRepository.save(ocrDocument);
            
            if (tempFile.exists()) tempFile.delete();

            return ResponseEntity.ok(Map.of(
                "success", true,
                "documentId", saved.getDocumentId(),
                "extractedText", saved.getExtractedText(),
                "extractedVendor", saved.getExtractedVendor() != null ? saved.getExtractedVendor() : "Unknown",
                "extractedAmount", saved.getExtractedAmount() != null ? saved.getExtractedAmount() : "0",
                "extractedDate", saved.getExtractedDate() != null ? saved.getExtractedDate() : "",
                "documentType", saved.getDocumentType()
            ));
            
        } catch (Exception e) {
            System.err.println("Extract error: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error", "message", e.getMessage()));
        }
    }

    private boolean hasStructuredAiData(OcrServiceClient.OcrResponse ocrResult) {
        OcrServiceClient.AiAnalysis aiAnalysis = ocrResult.getAi_analysis();
        return aiAnalysis != null && aiAnalysis.isEnabled() && aiAnalysis.isSuccess() && aiAnalysis.getExtracted_data() != null;
    }

    private String resolveDocumentType(OcrServiceClient.OcrResponse ocrResult) {
        if (!hasStructuredAiData(ocrResult)) return "RECEIPT";
        String type = ocrResult.getAi_analysis().getExtracted_data().getDocument_type();
        return type != null && !type.isBlank() ? type.toUpperCase() : "RECEIPT";
    }

    private String extractVendor(OcrServiceClient.OcrResponse ocrResult) {
        if (!hasStructuredAiData(ocrResult)) return null;
        OcrServiceClient.Merchant merchant = ocrResult.getAi_analysis().getExtracted_data().getMerchant();
        return merchant != null ? merchant.getName() : null;
    }

    private String extractDate(OcrServiceClient.OcrResponse ocrResult) {
        if (!hasStructuredAiData(ocrResult)) return null;
        OcrServiceClient.TransactionData transaction = ocrResult.getAi_analysis().getExtracted_data().getTransaction();
        return transaction != null ? transaction.getDate() : null;
    }

    private String extractAmount(OcrServiceClient.OcrResponse ocrResult) {
        if (!hasStructuredAiData(ocrResult)) return null;
        OcrServiceClient.Financial financial = ocrResult.getAi_analysis().getExtracted_data().getFinancial();
        if (financial == null) return null;
        Object amount = financial.getAmount_paid() != null ? financial.getAmount_paid() : financial.getTotal();
        return amount != null ? amount.toString() : null;
    }

    @PostMapping("/sync-legacy")
    public ResponseEntity<?> syncLegacyData() {
        int linkedCount = ocrTextParserService.linkExistingTransactionsToReceipts();
        return ResponseEntity.ok(Map.of(
            "message", "Legacy sync completed",
            "linkedTransactions", linkedCount
        ));
    }

    // Helper methods for file hash
    private String getFileHash(MultipartFile file) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(file.getBytes());
        return bytesToHex(hash);
    }

    private String bytesToHex(byte[] hash) {
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }
}