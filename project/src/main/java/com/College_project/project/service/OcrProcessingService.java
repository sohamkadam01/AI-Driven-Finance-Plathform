// package com.College_project.project.service;

// import com.College_project.project.models.OcrDocument;
// import com.College_project.project.models.Transaction;
// import com.College_project.project.models.User;
// import com.College_project.project.models.BankAccount;
// import com.College_project.project.enums.TransactionType;
// import com.College_project.project.repository.OcrDocumentRepository;
// import com.College_project.project.repository.transactionRepository;
// import com.College_project.project.repository.bankAccountRepository;
// import com.College_project.project.repository.UserRepository;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;

// import java.math.BigDecimal;
// import java.time.LocalDate;
// import java.time.LocalDateTime;
// import java.time.format.DateTimeFormatter;
// import java.util.List;
// import java.util.regex.Matcher;
// import java.util.regex.Pattern;

// @Service
// public class OcrProcessingService {
    
//     @Autowired
//     private OcrDocumentRepository ocrDocumentRepository;
    
//     @Autowired
//     private transactionRepository transactionRepository;
    
//     @Autowired
//     private bankAccountRepository bankAccountRepository;  // ✅ ADD THIS
    
//     @Autowired
//     private UserRepository userRepository;
    
//     @Autowired
//     private CategorizationService categorizationService;
    
//     /**
//      * Process OCR document and create transactions from extracted text
//      */
//     @Transactional
//     public OcrDocument processDocument(Long documentId, Long userId) {
//         OcrDocument document = ocrDocumentRepository.findById(documentId)
//                 .orElseThrow(() -> new RuntimeException("Document not found"));
        
//         if (!document.getUser().getUserId().equals(userId)) {
//             throw new RuntimeException("Unauthorized");
//         }
        
//         String extractedText = document.getExtractedText();
        
//         // Extract financial information
//         extractAmount(document, extractedText);
//         extractDate(document, extractedText);
//         extractVendor(document, extractedText);
        
//         // Create transaction from extracted data
//         if (document.getExtractedAmount() != null && document.getExtractedDate() != null) {
//             createTransactionFromDocument(document);
//         }
        
//         document.setProcessed(true);
//         document.setProcessingStatus("PROCESSED");
        
//         return ocrDocumentRepository.save(document);
//     }
    
//     private void extractAmount(OcrDocument document, String text) {
//         if (text == null) return;
        
//         // ✅ IMPROVED: Multiple patterns for different amount formats
//         List<Pattern> amountPatterns = List.of(
//             Pattern.compile("(?:₹|Rs\\.?|INR)\\s*(\\d{1,3}(?:[,\\s]?\\d{3})*(?:\\.\\d{2})?)"),
//             Pattern.compile("(?:TOTAL|AMOUNT|PAID)\\s*:?\\s*(?:₹|Rs\\.?|INR)?\\s*(\\d{1,3}(?:[,\\s]?\\d{3})*(?:\\.\\d{2})?)", Pattern.CASE_INSENSITIVE),
//             Pattern.compile("\\b(\\d{1,3}(?:[,\\s]?\\d{3})*(?:\\.\\d{2})?)\\s*(?:₹|Rs\\.?|INR)")
//         );
        
//         for (Pattern pattern : amountPatterns) {
//             Matcher matcher = pattern.matcher(text);
//             if (matcher.find()) {
//                 String amountStr = matcher.group(1)
//                         .replaceAll("[,\\s]", "")  // Remove commas and spaces
//                         .trim();
//                 try {
//                     BigDecimal amount = new BigDecimal(amountStr);
//                     if (amount.compareTo(BigDecimal.ZERO) > 0) {
//                         document.setExtractedAmount(amount.toString());
//                         System.out.println("✅ Extracted amount: ₹" + amount);
//                         return;
//                     }
//                 } catch (NumberFormatException e) {
//                     // Try next pattern
//                 }
//             }
//         }
        
//         System.out.println("⚠️ No amount found in document");
//     }
    
//     private void extractDate(OcrDocument document, String text) {
//         if (text == null) return;
        
//         // ✅ IMPROVED: Multiple date formats
//         List<Pattern> datePatterns = List.of(
//             Pattern.compile("(\\d{2})[-/](\\d{2})[-/](\\d{4})"),  // DD/MM/YYYY
//             Pattern.compile("(\\d{4})[-/](\\d{2})[-/](\\d{2})"),  // YYYY-MM-DD
//             Pattern.compile("(\\d{2})[-/](\\d{2})[-/](\\d{2})"),  // DD/MM/YY
//             Pattern.compile("(?:DATE|DATE:|DUE DATE)\\s*:?\\s*(\\d{2}[-/]\\d{2}[-/]\\d{4})", Pattern.CASE_INSENSITIVE)
//         );
        
//         for (Pattern pattern : datePatterns) {
//             Matcher matcher = pattern.matcher(text);
//             if (matcher.find()) {
//                 String dateStr = matcher.group(0);
//                 try {
//                     LocalDate parsedDate = parseDate(dateStr);
//                     if (parsedDate != null) {
//                         document.setExtractedDate(parsedDate.toString());
//                         System.out.println("✅ Extracted date: " + parsedDate);
//                         return;
//                     }
//                 } catch (Exception e) {
//                     // Try next pattern
//                 }
//             }
//         }
        
//         System.out.println("⚠️ No date found in document, using current date");
//         document.setExtractedDate(LocalDate.now().toString());
//     }
    
//     private void extractVendor(OcrDocument document, String text) {
//         if (text == null) return;
        
//         String[] lines = text.split("\\n");
        
//         // Look for vendor name in first 5 lines (skip empty or common words)
//         for (int i = 0; i < Math.min(5, lines.length); i++) {
//             String line = lines[i].trim().toUpperCase();
            
//             // Skip lines that are likely not vendor names
//             if (line.length() < 3 || line.length() > 50) continue;
//             if (line.contains("RECEIPT") || line.contains("INVOICE") || 
//                 line.contains("BILL") || line.contains("DATE") || 
//                 line.contains("TIME") || line.contains("THANK") ||
//                 line.contains("TOTAL") || line.contains("AMOUNT")) {
//                 continue;
//             }
            
//             // Found potential vendor name
//             document.setExtractedVendor(capitalizeWords(line));
//             System.out.println("✅ Extracted vendor: " + line);
//             return;
//         }
        
//         System.out.println("⚠️ No vendor found");
//     }
    
//     private void createTransactionFromDocument(OcrDocument document) {
//         try {
//             BigDecimal amount = new BigDecimal(document.getExtractedAmount());
//             LocalDate transactionDate = parseDate(document.getExtractedDate());
//             String description = document.getExtractedVendor() != null ? 
//                 document.getExtractedVendor() : "OCR Import";
            
//             // ✅ FIXED: Get user's bank account
//             User user = document.getUser();
//             List<BankAccount> bankAccounts = bankAccountRepository.findByUserAndIsActive(user, true);
            
//             if (bankAccounts.isEmpty()) {
//                 System.err.println("❌ User has no active bank account. Cannot create transaction.");
//                 return;
//             }
            
//             BankAccount defaultAccount = bankAccounts.get(0);
            
//             // Determine if it's expense or income
//             TransactionType type = TransactionType.EXPENSE;
//             String text = document.getExtractedText() != null ? document.getExtractedText().toUpperCase() : "";
//             if (text.contains("SALARY") || text.contains("CREDIT") || 
//                 text.contains("DEPOSIT") || text.contains("REFUND")) {
//                 type = TransactionType.INCOME;
//             }
            
//             // Create transaction with bank account
//             Transaction transaction = new Transaction();
//             transaction.setUser(user);
//             transaction.setBankAccount(defaultAccount);  // ✅ CRITICAL: Set bank account
//             transaction.setAmount(amount);
//             transaction.setType(type);
//             transaction.setDescription(description.length() > 100 ? description.substring(0, 97) + "..." : description);
//             transaction.setTransactionDate(transactionDate);
//             transaction.setCreatedAt(LocalDateTime.now());
//             transaction.setStatus("COMPLETED");
//             transaction.setFlagged(false);
            
//             // Auto-categorize
//             transaction.setCategory(categorizationService.categorizeTransaction(description));
            
//             // ✅ Update bank account balance
//             if (type == TransactionType.EXPENSE) {
//                 defaultAccount.setCurrentBalance(defaultAccount.getCurrentBalance().subtract(amount));
//             } else {
//                 defaultAccount.setCurrentBalance(defaultAccount.getCurrentBalance().add(amount));
//             }
//             defaultAccount.setLastSyncedAt(LocalDateTime.now());
//             bankAccountRepository.save(defaultAccount);
            
//             Transaction saved = transactionRepository.save(transaction);
            
//             System.out.println("✅ Transaction created from OCR: " + description + 
//                                " - ₹" + amount + 
//                                " (Account: " + defaultAccount.getBankName() + ")");
            
//         } catch (Exception e) {
//             System.err.println("❌ Failed to create transaction: " + e.getMessage());
//             e.printStackTrace();
//         }
//     }
    
//     private LocalDate parseDate(String dateStr) {
//         if (dateStr == null) return LocalDate.now();
        
//         try {
//             // Try DD/MM/YYYY
//             if (dateStr.contains("/")) {
//                 String[] parts = dateStr.split("/");
//                 if (parts.length == 3) {
//                     int day = Integer.parseInt(parts[0]);
//                     int month = Integer.parseInt(parts[1]);
//                     int year = Integer.parseInt(parts[2]);
//                     if (year < 100) year += 2000;
//                     return LocalDate.of(year, month, day);
//                 }
//             }
            
//             // Try YYYY-MM-DD
//             if (dateStr.contains("-") && dateStr.length() == 10) {
//                 return LocalDate.parse(dateStr);
//             }
            
//             // Try DD-MM-YYYY
//             if (dateStr.contains("-")) {
//                 String[] parts = dateStr.split("-");
//                 if (parts.length == 3) {
//                     int day = Integer.parseInt(parts[0]);
//                     int month = Integer.parseInt(parts[1]);
//                     int year = Integer.parseInt(parts[2]);
//                     if (year < 100) year += 2000;
//                     return LocalDate.of(year, month, day);
//                 }
//             }
//         } catch (Exception e) {
//             System.err.println("Date parsing error: " + e.getMessage());
//         }
        
//         return LocalDate.now();
//     }
    
//     private String capitalizeWords(String text) {
//         if (text == null || text.isEmpty()) return text;
        
//         String[] words = text.toLowerCase().split(" ");
//         StringBuilder result = new StringBuilder();
//         for (String word : words) {
//             if (word.length() > 0) {
//                 result.append(Character.toUpperCase(word.charAt(0)))
//                       .append(word.substring(1))
//                       .append(" ");
//             }
//         }
//         return result.toString().trim();
//     }
// }