package com.College_project.project.models;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "ocr_documents")
public class OcrDocument {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long documentId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    private String filename;
    
    @Column(columnDefinition = "TEXT")
    private String extractedText;
    
    private String documentType;
    
    private LocalDateTime uploadedAt;
    
    private boolean processed = false;
    
    private String processingStatus;
    
    private String extractedAmount;
    private String extractedDate;
    private String extractedVendor;
    
    // ✅ ADDED: File hash for duplicate detection
    @Column(name = "file_hash", unique = true, length = 64)
    private String fileHash;
    
    // Constructors
    public OcrDocument() {}
    
    // Getters and Setters
    public Long getDocumentId() { return documentId; }
    public void setDocumentId(Long documentId) { this.documentId = documentId; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }
    
    public String getExtractedText() { return extractedText; }
    public void setExtractedText(String extractedText) { this.extractedText = extractedText; }
    
    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }
    
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
    
    public boolean isProcessed() { return processed; }
    public void setProcessed(boolean processed) { this.processed = processed; }
    
    public String getProcessingStatus() { return processingStatus; }
    public void setProcessingStatus(String processingStatus) { this.processingStatus = processingStatus; }
    
    public String getExtractedAmount() { return extractedAmount; }
    public void setExtractedAmount(String extractedAmount) { this.extractedAmount = extractedAmount; }
    
    public String getExtractedDate() { return extractedDate; }
    public void setExtractedDate(String extractedDate) { this.extractedDate = extractedDate; }
    
    public String getExtractedVendor() { return extractedVendor; }
    public void setExtractedVendor(String extractedVendor) { this.extractedVendor = extractedVendor; }
    
    // ✅ ADDED: Getter and Setter for fileHash
    public String getFileHash() { return fileHash; }
    public void setFileHash(String fileHash) { this.fileHash = fileHash; }
}