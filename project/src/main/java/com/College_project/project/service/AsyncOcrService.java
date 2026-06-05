package com.College_project.project.service;

import java.io.File;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.College_project.project.models.Alert;
import com.College_project.project.models.OcrDocument;
import com.College_project.project.models.User;
import com.College_project.project.repository.AlertRepository;
import com.College_project.project.repository.OcrDocumentRepository;
import com.College_project.project.repository.UserRepository;
import com.College_project.project.enums.AlertType;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class AsyncOcrService {

    @Autowired
    private OcrServiceClient ocrServiceClient;

    @Autowired
    private OcrTextParserService ocrTextParserService;

    @Autowired
    private OcrDocumentRepository ocrDocumentRepository;

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private UserRepository userRepository;

    @Async
    public void processReceiptAsync(Long documentId, Long userId, File tempFile) {
        log.info("🚀 Starting async processing for document ID: {}", documentId);
        
        try {
            // Step 1: OCR Extraction
            log.info("Step 1: Extracting text from image via OCR service...");
            OcrServiceClient.OcrResponse ocrResult = ocrServiceClient.extractText(tempFile).block();

            if (ocrResult == null || !ocrResult.isSuccess()) {
                updateDocumentStatus(documentId, "FAILED_OCR", "OCR extraction failed.");
                return;
            }

            // Step 2: Update document with extracted text
            OcrDocument document = ocrDocumentRepository.findById(documentId).orElse(null);
            if (document == null) return;

            document.setExtractedText(ocrResult.getExtracted_text());
            document.setDocumentType(resolveDocumentType(ocrResult));
            document.setExtractedVendor(extractVendor(ocrResult));
            document.setExtractedDate(extractDate(ocrResult));
            document.setExtractedAmount(extractAmount(ocrResult));
            document.setProcessingStatus("OCR_COMPLETED");
            ocrDocumentRepository.save(document);

            // Step 3: Financial Parsing and Budget Check
            log.info("Step 2: Parsing text and creating transaction...");
            OcrTextParserService.ProcessingResult result = ocrTextParserService.processOcrDocument(
                documentId, userId, false);

            // Step 4: Final Status and Notification
            String status = result.getErrorMessage() == null ? "COMPLETED" : "COMPLETED_WITH_ERRORS";
            if ("BUDGET_EXCEEDED".equals(result.getErrorMessage())) {
                status = "BUDGET_WARNING";
            } else if ("DUPLICATE_TRANSACTION".equals(result.getErrorMessage())) {
                status = "DUPLICATE";
            }

            document.setProcessingStatus(status);
            document.setProcessed(true);
            ocrDocumentRepository.save(document);

            // Create notification for user
            createNotification(userId, document, result);

            log.info("✅ Async processing completed for document ID: {}. Status: {}", documentId, status);

        } catch (Exception e) {
            log.error("❌ Error in async OCR processing: {}", e.getMessage(), e);
            updateDocumentStatus(documentId, "FAILED", e.getMessage());
        } finally {
            if (tempFile != null && tempFile.exists()) {
                tempFile.delete();
                log.info("Temporary file cleaned up.");
            }
        }
    }

    private void updateDocumentStatus(Long documentId, String status, String message) {
        ocrDocumentRepository.findById(documentId).ifPresent(doc -> {
            doc.setProcessingStatus(status);
            doc.setProcessed(true);
            ocrDocumentRepository.save(doc);
        });
    }

    private void createNotification(Long userId, OcrDocument doc, OcrTextParserService.ProcessingResult result) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) return;

            Alert alert = new Alert();
            alert.setUser(user);
            alert.setType(AlertType.RECEIPT_PROCESSED);
            alert.setCreatedAt(LocalDateTime.now());
            alert.setRead(false);
            alert.setActionUrl("/notifications");

            String vendor = doc.getExtractedVendor() != null ? doc.getExtractedVendor() : "Unknown Vendor";
            String amount = doc.getExtractedAmount() != null ? "₹" + doc.getExtractedAmount() : "N/A";

            if ("COMPLETED".equals(doc.getProcessingStatus())) {
                alert.setMessage(String.format("✅ Receipt Processed: %s (%s) has been automatically logged.", vendor, amount));
            } else if ("BUDGET_WARNING".equals(doc.getProcessingStatus())) {
                alert.setMessage(String.format("⚠️ Receipt Processed: %s (%s) was detected but exceeds your budget. Transaction was NOT created automatically.", vendor, amount));
            } else if ("DUPLICATE".equals(doc.getProcessingStatus())) {
                alert.setMessage(String.format("ℹ️ Duplicate Receipt: %s (%s) was already logged. No new transaction created.", vendor, amount));
            } else {
                alert.setMessage(String.format("❌ Receipt Processing Failed for %s. Please check the details manually.", doc.getFilename()));
            }

            alertRepository.save(alert);
        } catch (Exception e) {
            log.error("Failed to create notification: {}", e.getMessage());
        }
    }

    // Helper methods (cloned from OcrController for independence)
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

    private boolean hasStructuredAiData(OcrServiceClient.OcrResponse ocrResult) {
        return ocrResult.getAi_analysis() != null && ocrResult.getAi_analysis().isEnabled() && 
               ocrResult.getAi_analysis().isSuccess() && ocrResult.getAi_analysis().getExtracted_data() != null;
    }
}
