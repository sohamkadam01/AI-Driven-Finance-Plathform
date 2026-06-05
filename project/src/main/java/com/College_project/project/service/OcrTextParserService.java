package com.College_project.project.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.College_project.project.enums.TransactionType;
import com.College_project.project.models.BankAccount;
import com.College_project.project.models.OcrDocument;
import com.College_project.project.models.Transaction;
import com.College_project.project.models.User;
import com.College_project.project.repository.CategoryRepository;
import com.College_project.project.repository.OcrDocumentRepository;
import com.College_project.project.repository.UserRepository;
import com.College_project.project.repository.bankAccountRepository;
import com.College_project.project.repository.transactionRepository;


@Service
public class OcrTextParserService {
    
    @Autowired
    private OcrDocumentRepository ocrDocumentRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private transactionRepository transactionRepository;

    @Autowired
    private bankAccountRepository bankAccountRepository;

    /**
     * One-time utility to link historical transactions to their source receipts
     * based on amount, date, and user matching.
     */
    @Transactional
    public int linkExistingTransactionsToReceipts() {
        List<Transaction> unlinkedTransactions = transactionRepository.findAll().stream()
                .filter(t -> t.getOcrDocument() == null)
                .collect(Collectors.toList());
        
        int linkedCount = 0;
        for (Transaction tx : unlinkedTransactions) {
            List<OcrDocument> possibleDocs = ocrDocumentRepository.findByUser(tx.getUser()).stream()
                    .filter(doc -> doc.isProcessed() && 
                                  doc.getExtractedAmount() != null &&
                                  new BigDecimal(doc.getExtractedAmount()).compareTo(tx.getAmount()) == 0 &&
                                  doc.getExtractedDate() != null &&
                                  doc.getExtractedDate().equals(tx.getTransactionDate().toString()))
                    .collect(Collectors.toList());
            
            if (possibleDocs.size() == 1) {
                tx.setOcrDocument(possibleDocs.get(0));
                transactionRepository.save(tx);
                linkedCount++;
            }
        }
        return linkedCount;
    }
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private CategorizationService categorizationService;
    
    @Autowired
    private BudgetService budgetService;
    
    // Common amount patterns for different receipt types
    private static final List<Pattern> AMOUNT_PATTERNS = Arrays.asList(
        Pattern.compile("(?:TOTAL|AMOUNT|GRAND TOTAL|NET TOTAL|BILL TOTAL)\\s*:?\\s*(?:₹|Rs\\.?|INR)\\s*([\\d,\\.]+)", Pattern.CASE_INSENSITIVE),
        Pattern.compile("(?:DEPOSIT\\s+AMOUNT|AMOUNT\\s+PAID|PAYMENT\\s+AMOUNT)\\s*[=:]?\\s*(?:₹|Rs\\.?|INR)?\\s*([\\d,\\.]+)", Pattern.CASE_INSENSITIVE),
        Pattern.compile("(?:RESERVATION\\s+TOTAL|ROOM\\s+CHARGE|HOTEL\\s+TOTAL)\\s*:?\\s*(?:₹|Rs\\.?|INR)\\s*([\\d,\\.]+)", Pattern.CASE_INSENSITIVE),
        Pattern.compile("(?:DUE|BALANCE\\s+DUE)\\s*:?\\s*(?:₹|Rs\\.?|INR)\\s*([\\d,\\.]+)", Pattern.CASE_INSENSITIVE),
        Pattern.compile("(?:PAID|CREDIT|DEBIT)\\s*:?\\s*(?:₹|Rs\\.?|INR)\\s*([\\d,\\.]+)", Pattern.CASE_INSENSITIVE),
        Pattern.compile("(?:₹|Rs\\.?|INR)\\s*([\\d,\\.]+(?:\\s*,\\s*\\d{3})*)")
    );
    
    // Date patterns
    private static final List<Pattern> DATE_PATTERNS = Arrays.asList(
        Pattern.compile("(\\d{2})[-/](\\d{2})[-/](\\d{4})"),
        Pattern.compile("(\\d{4})[-/](\\d{2})[-/](\\d{2})"),
        Pattern.compile("(\\d{2})[-/](\\d{2})[-/](\\d{2})"),
        Pattern.compile("(?:DATE|DATE:)\\s*(\\d{2}[-/]\\d{2}[-/]\\d{4})", Pattern.CASE_INSENSITIVE)
    );
    
    /**
     * Check for duplicate transaction before creating
     */
    private boolean isDuplicateTransaction(User user, BigDecimal amount, LocalDate date, String vendor) {
        LocalDate startDate = date.minusDays(1);
        LocalDate endDate = date.plusDays(1);
        
        List<Transaction> recentTransactions = transactionRepository
            .findByUserAndTransactionDateBetween(user, startDate, endDate);
        
        return recentTransactions.stream().anyMatch(t -> 
            t.getAmount().compareTo(amount) == 0 &&
            t.getDescription() != null && 
            t.getDescription().toLowerCase().contains(vendor.toLowerCase())
        );
    }
    
    /**
     * Main method to process OCR document and extract financial data
     */
    @Transactional
    public ProcessingResult processOcrDocument(Long documentId, Long userId, boolean forceCreate) {
        ProcessingResult result = new ProcessingResult();
        result.setDocumentId(documentId);
        result.setExtractedTransactions(new ArrayList<>());
        result.setCreatedTransactions(new ArrayList<>());
        
        try {
            System.out.println("========== STARTING OCR PROCESSING ==========");
            System.out.println("Document ID: " + documentId);
            
            // Get document
            OcrDocument document = ocrDocumentRepository.findById(documentId)
                    .orElseThrow(() -> new RuntimeException("Document not found with id: " + documentId));
            
            if (!document.getUser().getUserId().equals(userId)) {
                throw new RuntimeException("Unauthorized: Document does not belong to user");
            }
            
            String text = document.getExtractedText();
            if (text == null || text.trim().isEmpty()) {
                throw new RuntimeException("No extracted text found in document");
            }
            
            System.out.println("Raw text length: " + text.length());
            System.out.println("Raw text preview: " + text.substring(0, Math.min(500, text.length())));
            
            // Check if user has a bank account
            User user = document.getUser();
            List<BankAccount> userAccounts = bankAccountRepository.findByUserAndIsActive(user, true);
            
            if (userAccounts.isEmpty()) {
                String errorMsg = "User has no active bank account. Please add a bank account first.";
                System.err.println("❌ " + errorMsg);
                result.setErrorMessage(errorMsg);
                document.setProcessingStatus("FAILED_NO_ACCOUNT");
                ocrDocumentRepository.save(document);
                return result;
            }
            
            BankAccount defaultAccount = userAccounts.get(0);
            System.out.println("Using bank account: ID=" + defaultAccount.getAccountId() + 
                               ", Bank=" + defaultAccount.getBankName() +
                               ", Balance=₹" + defaultAccount.getCurrentBalance());
            
            String cleanedText = cleanText(text);
            
            // Prioritize AI Data from database
            ParsedData parsedData = new ParsedData();
            boolean useAiFallback = false;
            
            if (document.getExtractedAmount() != null && !document.getExtractedAmount().isEmpty()) {
                try {
                    parsedData.amount = new BigDecimal(document.getExtractedAmount().replaceAll("[^\\d.]", ""));
                    parsedData.vendorName = document.getExtractedVendor() != null ? document.getExtractedVendor() : "Unknown Vendor";
                    if (document.getExtractedDate() != null && !document.getExtractedDate().isEmpty()) {
                        try {
                            parsedData.transactionDate = LocalDate.parse(document.getExtractedDate());
                        } catch (Exception e) {
                            parsedData.transactionDate = extractDate(cleanedText);
                        }
                    } else {
                        parsedData.transactionDate = LocalDate.now();
                    }
                    parsedData.receiptType = document.getDocumentType() != null ? document.getDocumentType() : "GENERAL";
                    parsedData.lineItems = extractLineItems(cleanedText);
                    System.out.println("🤖 Using highly accurate Ollama AI data from Database!");
                } catch (Exception e) {
                    System.err.println("⚠️ Failed to parse AI data, falling back to Regex: " + e.getMessage());
                    useAiFallback = true;
                }
            } else {
                useAiFallback = true;
            }
            
            if (useAiFallback) {
                System.out.println("⚠️ Using legacy Regex fallback parser!");
                parsedData = extractAllData(cleanedText);
            }
            
            // Set results
            result.setVendorName(parsedData.vendorName);
            result.setTransactionDate(parsedData.transactionDate);
            result.setTotalAmount(parsedData.amount);
            result.setReceiptType(parsedData.receiptType);
            result.setExtractedTransactions(parsedData.lineItems);
            
            // ✅ CHECK FOR DUPLICATE TRANSACTION FIRST
            if (parsedData.amount != null && parsedData.amount.compareTo(BigDecimal.ZERO) > 0) {
                if (isDuplicateTransaction(user, parsedData.amount, parsedData.transactionDate, parsedData.vendorName)) {
                    System.out.println("⚠️ DUPLICATE TRANSACTION DETECTED! Skipping creation.");
                    result.setErrorMessage("DUPLICATE_TRANSACTION");
                    result.setDuplicateDetected(true);
                    updateDocumentStatus(document, parsedData, false);
                    return result;
                }
            }
            
            // Early Detection for Budget Checking
            TransactionType type = determineTransactionType(parsedData);
            String categoryText = parsedData.vendorName + " " + parsedData.receiptType;
            com.College_project.project.models.Category category = categorizationService.categorizeTransaction(categoryText);

            // Budget Validation: Check if this spending will exceed the user's budget
            if (type == TransactionType.EXPENSE && category != null && parsedData.amount != null) {
                try {
                    LocalDate budgetMonth = parsedData.transactionDate.withDayOfMonth(1);
                    Map<String, Object> budgetImpact = budgetService.analyzeTransactionImpact(
                        user.getUserId(), category.getCategoryId(), parsedData.amount, budgetMonth);
                    result.setBudgetImpact(budgetImpact);
                    result.setBudgetExceeded(Boolean.TRUE.equals(budgetImpact.get("isOverBudget")));
                } catch (Exception e) {
                    System.err.println("⚠️ Budget check failed: " + e.getMessage());
                }
            }

            System.out.println("Extracted Vendor: " + parsedData.vendorName);
            System.out.println("Extracted Date: " + parsedData.transactionDate);
            System.out.println("Extracted Amount: ₹" + parsedData.amount);
            System.out.println("Receipt Type: " + parsedData.receiptType);
            System.out.println("Line Items Found: " + parsedData.lineItems.size());
            
            // Create transaction if amount found
            if (parsedData.amount != null && parsedData.amount.compareTo(BigDecimal.ZERO) > 0 && (!result.isBudgetExceeded() || forceCreate)) {
                Transaction transaction = createTransactionWithRetry(
                    user, defaultAccount, parsedData, cleanedText, document);
                
                if (transaction != null) {
                    List<Transaction> createdList = new ArrayList<>();
                    createdList.add(transaction);
                    result.setCreatedTransactions(createdList);
                    result.setTransactionsCreated(1);
                    System.out.println("✅ Transaction created successfully!");
                    
                    if (forceCreate) {
                        result.setErrorMessage(null);
                    }
                } else {
                    result.setErrorMessage("Failed to create transaction after retries");
                }
            } else if (result.isBudgetExceeded() && !forceCreate) {
                result.setErrorMessage("BUDGET_EXCEEDED");
            } else {
                System.out.println("⚠️ No valid amount found in document");
                result.setErrorMessage("No valid amount could be extracted from this document");
            }
            
            // Update document status
            updateDocumentStatus(document, parsedData, result.getErrorMessage() == null);
            
            System.out.println("========== OCR PROCESSING COMPLETED ==========");
            
        } catch (Exception e) {
            System.err.println("❌ Error processing document: " + e.getMessage());
            e.printStackTrace();
            result.setErrorMessage(e.getMessage());
            
            try {
                OcrDocument document = ocrDocumentRepository.findById(documentId).orElse(null);
                if (document != null) {
                    document.setProcessingStatus("FAILED");
                    document.setProcessed(true);
                    ocrDocumentRepository.save(document);
                }
            } catch (Exception ex) {
                System.err.println("Failed to update document status: " + ex.getMessage());
            }
        }
        
        return result;
    }
    
    /**
     * Extract all possible data from text using multiple strategies
     */
    private ParsedData extractAllData(String text) {
        ParsedData data = new ParsedData();
        
        data.vendorName = extractVendorName(text);
        data.transactionDate = extractDate(text);
        data.amount = extractAmountWithMultiplePatterns(text);
        data.lineItems = extractLineItems(text);
        data.receiptType = detectReceiptType(text);
        
        return data;
    }
    
    /**
     * Extract amount using multiple patterns and strategies
     */
    private BigDecimal extractAmountWithMultiplePatterns(String text) {
        List<BigDecimal> foundAmounts = new ArrayList<>();
        
        for (Pattern pattern : AMOUNT_PATTERNS) {
            Matcher matcher = pattern.matcher(text);
            while (matcher.find()) {
                String amountStr = matcher.group(1).replaceAll("[,\\s]", "");
                try {
                    BigDecimal amount = new BigDecimal(amountStr);
                    if (isValidAmount(amount)) {
                        System.out.println("Found amount via pattern: " + amount);
                        foundAmounts.add(amount);
                    }
                } catch (NumberFormatException e) {}
            }
        }
        
        Pattern currencyPattern = Pattern.compile("[₹Rs\\.]+\\s*(\\d+(?:[,\\.]\\d{2})?)", Pattern.CASE_INSENSITIVE);
        Matcher currencyMatcher = currencyPattern.matcher(text);
        while (currencyMatcher.find()) {
            String amountStr = currencyMatcher.group(1).replaceAll(",", "");
            try {
                BigDecimal amount = new BigDecimal(amountStr);
                if (isValidAmount(amount)) {
                    System.out.println("Found amount via currency: " + amount);
                    foundAmounts.add(amount);
                }
            } catch (NumberFormatException e) {}
        }
        
        if (foundAmounts.isEmpty()) {
            return null;
        }
        
        return foundAmounts.stream().max(BigDecimal::compareTo).orElse(null);
    }
    
    private boolean isValidAmount(BigDecimal amount) {
        return amount.compareTo(new BigDecimal("10")) >= 0 && 
               amount.compareTo(new BigDecimal("10000000")) <= 0;
    }
    
    /**
     * Extract line items from receipt text
     */
    private List<ExtractedTransaction> extractLineItems(String text) {
        List<ExtractedTransaction> items = new ArrayList<>();
        String[] lines = text.split("\\n");
        
        Pattern itemPattern = Pattern.compile("^(.+?)\\s+(?:₹|Rs\\.?)?\\s*(\\d+(?:[,\\.]\\d{2})?)$");
        Pattern quantityPattern = Pattern.compile("(\\d+)\\s*[xX]\\s*(?:₹|Rs\\.?)\\s*(\\d+(?:[,\\.]\\d{2})?)");
        
        for (String line : lines) {
            line = line.trim();
            if (line.isEmpty() || line.length() < 5) continue;
            if (isNonItemLine(line)) continue;
            
            Matcher qtyMatcher = quantityPattern.matcher(line);
            if (qtyMatcher.find()) {
                ExtractedTransaction item = new ExtractedTransaction();
                item.setDescription(line.substring(0, Math.min(50, line.length())));
                try {
                    BigDecimal price = new BigDecimal(qtyMatcher.group(2).replace(",", ""));
                    item.setAmount(price);
                    item.setQuantity(Integer.parseInt(qtyMatcher.group(1)));
                    item.setUnitPrice(price);
                    item.setType(TransactionType.EXPENSE);
                    items.add(item);
                } catch (NumberFormatException e) {}
                continue;
            }
            
            Matcher itemMatcher = itemPattern.matcher(line);
            if (itemMatcher.find()) {
                ExtractedTransaction item = new ExtractedTransaction();
                String description = itemMatcher.group(1).trim();
                if (description.length() > 3 && description.length() < 50) {
                    item.setDescription(description);
                    try {
                        BigDecimal amount = new BigDecimal(itemMatcher.group(2).replace(",", ""));
                        item.setAmount(amount);
                        item.setType(TransactionType.EXPENSE);
                        items.add(item);
                    } catch (NumberFormatException e) {}
                }
            }
        }
        
        return items;
    }
    
    private boolean isNonItemLine(String line) {
        String upperLine = line.toUpperCase();
        return upperLine.contains("TOTAL") || upperLine.contains("SUBTOTAL") ||
               upperLine.contains("TAX") || upperLine.contains("GST") ||
               upperLine.contains("DATE") || upperLine.contains("TIME") ||
               upperLine.contains("THANK") || upperLine.contains("RECEIPT") ||
               upperLine.contains("INVOICE") || upperLine.contains("BILL") ||
               upperLine.length() < 4;
    }
    
    private Transaction createTransactionWithRetry(User user, BankAccount bankAccount, 
                                                    ParsedData data, String fullText, OcrDocument document) {
        int maxRetries = 3;
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return createTransaction(user, bankAccount, data, fullText, document);
            } catch (Exception e) {
                System.err.println("Transaction creation attempt " + attempt + " failed: " + e.getMessage());
                if (attempt == maxRetries) return null;
                try { Thread.sleep(100); } catch (InterruptedException ie) {}
            }
        }
        return null;
    }
    
    private Transaction createTransaction(User user, BankAccount bankAccount, 
                                          ParsedData data, String fullText, OcrDocument document) {
        try {
            Transaction transaction = new Transaction();
            transaction.setUser(user);
            transaction.setBankAccount(bankAccount);
            transaction.setAmount(data.amount);
            transaction.setType(determineTransactionType(data));
            transaction.setDescription(buildDescription(data));
            transaction.setTransactionDate(data.transactionDate != null ? data.transactionDate : LocalDate.now());
            transaction.setCreatedAt(LocalDateTime.now());
            transaction.setStatus("COMPLETED");
            transaction.setFlagged(false);
            transaction.setOcrDocument(document);
            
            String categoryText = data.vendorName + " " + data.receiptType;
            transaction.setCategory(categorizationService.categorizeTransaction(categoryText));
            
            if (transaction.getType() == TransactionType.EXPENSE) {
                bankAccount.setCurrentBalance(bankAccount.getCurrentBalance().subtract(data.amount));
            } else {
                bankAccount.setCurrentBalance(bankAccount.getCurrentBalance().add(data.amount));
            }
            bankAccount.setLastSyncedAt(LocalDateTime.now());
            bankAccountRepository.save(bankAccount);
            
            Transaction saved = transactionRepository.save(transaction);
            
            if (saved.getType() == TransactionType.EXPENSE && saved.getCategory() != null) {
                try {
                    LocalDate budgetMonth = saved.getTransactionDate().withDayOfMonth(1);
                    budgetService.updateBudgetSpending(
                        user.getUserId(), saved.getCategory().getCategoryId(), budgetMonth);
                    System.out.println("📊 Budget spending updated for category: " + saved.getCategory().getName());
                } catch (Exception e) {
                    System.err.println("⚠️ Budget update failed (non-critical): " + e.getMessage());
                }
            }
            
            System.out.println("✅ Transaction saved: ID=" + saved.getTransactionId() + 
                               ", Amount=₹" + data.amount + 
                               ", Desc=" + transaction.getDescription());
            return saved;
        } catch (Exception e) {
            System.err.println("❌ Failed to create transaction: " + e.getMessage());
            throw new RuntimeException("Transaction creation failed", e);
        }
    }
    
    private TransactionType determineTransactionType(ParsedData data) {
        String type = data.receiptType != null ? data.receiptType.toUpperCase() : "";
        String vendor = data.vendorName != null ? data.vendorName.toUpperCase() : "";

        if (type.contains("INCOME") || type.contains("DEPOSIT") || 
            vendor.contains("SALARY") || vendor.contains("PAYROLL") ||
            vendor.contains("REFUND") || vendor.contains("CASHBACK") ||
            vendor.contains("INTEREST")) {
            return TransactionType.INCOME;
        }
        return TransactionType.EXPENSE;
    }
    
    private String buildDescription(ParsedData data) {
        StringBuilder desc = new StringBuilder();
        if (data.vendorName != null && !data.vendorName.equals("Unknown Vendor")) {
            desc.append(data.vendorName);
        } else {
            desc.append(data.receiptType);
        }
        
        if (!data.lineItems.isEmpty() && data.lineItems.size() <= 3) {
            desc.append(" - ");
            for (int i = 0; i < Math.min(2, data.lineItems.size()); i++) {
                if (i > 0) desc.append(", ");
                desc.append(data.lineItems.get(i).getDescription());
            }
        }
        
        return desc.length() > 100 ? desc.substring(0, 97) + "..." : desc.toString();
    }
    
    private void updateDocumentStatus(OcrDocument document, ParsedData data, boolean success) {
        document.setProcessed(true);
        document.setProcessingStatus(success ? "COMPLETED" : "PARTIAL");
        if (data.amount != null) {
            document.setExtractedAmount(data.amount.toString());
        }
        if (data.transactionDate != null) {
            document.setExtractedDate(data.transactionDate.toString());
        }
        document.setExtractedVendor(data.vendorName);
        ocrDocumentRepository.save(document);
    }
    
    private String cleanText(String text) {
        if (text == null) return "";
        
        String cleaned = text.replaceAll("\\r\\n|\\r|\\n", " ")
                             .replaceAll("\\s+", " ")
                             .trim();
        
        cleaned = cleaned.replaceAll("(\\d+)\\s*,\\s*(\\d+)", "$1$2");
        cleaned = cleaned.replaceAll("[rR]\\s*(\\d+)", "$1");
        cleaned = cleaned.replaceAll("<\\s*(\\d+)", "$1");
        cleaned = cleaned.replaceAll("[₹]", "INR ");
        cleaned = cleaned.replaceAll("Rs\\.?", "INR ");
        
        return cleaned;
    }
    
    private String extractVendorName(String text) {
        String[] lines = text.split("\\n");
        
        for (int i = 0; i < Math.min(8, lines.length); i++) {
            String line = lines[i].trim().toUpperCase();
            if (isValidVendorLine(line)) {
                return capitalizeWords(line);
            }
        }
        
        Pattern[] vendorPatterns = {
            Pattern.compile("(HOTEL\\s+[A-Z\\s]+)", Pattern.CASE_INSENSITIVE),
            Pattern.compile("(RESTAURANT\\s+[A-Z\\s]+)", Pattern.CASE_INSENSITIVE),
            Pattern.compile("(CAFE\\s+[A-Z\\s]+)", Pattern.CASE_INSENSITIVE),
            Pattern.compile("(STORE\\s+[A-Z\\s]+)", Pattern.CASE_INSENSITIVE)
        };
        
        for (Pattern pattern : vendorPatterns) {
            Matcher matcher = pattern.matcher(text.toUpperCase());
            if (matcher.find()) {
                return capitalizeWords(matcher.group(1).trim());
            }
        }
        
        return "Unknown Vendor";
    }
    
    private boolean isValidVendorLine(String line) {
        if (line.contains("RECEIPT") || line.contains("INVOICE") || 
            line.contains("BILL") || line.contains("THANK YOU") ||
            line.contains("DATE:") || line.contains("TIME:") ||
            line.contains("GUEST") || line.contains("ROOM NO") ||
            line.contains("TRANSACTION") || line.contains("BANK") ||
            line.contains("TOTAL") || line.contains("AMOUNT") ||
            line.isEmpty() || line.length() < 4 || line.length() > 60) {
            return false;
        }
        return true;
    }
    
    private String capitalizeWords(String text) {
        String[] words = text.toLowerCase().split(" ");
        StringBuilder result = new StringBuilder();
        for (String word : words) {
            if (word.length() > 0) {
                result.append(Character.toUpperCase(word.charAt(0)))
                      .append(word.substring(1))
                      .append(" ");
            }
        }
        return result.toString().trim();
    }
    
    private LocalDate extractDate(String text) {
        for (Pattern pattern : DATE_PATTERNS) {
            Matcher matcher = pattern.matcher(text);
            if (matcher.find()) {
                try {
                    if (matcher.groupCount() >= 3) {
                        int first = Integer.parseInt(matcher.group(1));
                        int second = Integer.parseInt(matcher.group(2));
                        int third = Integer.parseInt(matcher.group(3));
                        
                        if (third >= 1000) {
                            return LocalDate.of(third, second, first);
                        } else if (first > 31) {
                            return LocalDate.of(first, second, third);
                        } else {
                            int year = third >= 100 ? third : 2000 + third;
                            return LocalDate.of(year, second, first);
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Date parsing error: " + e.getMessage());
                }
            }
        }
        return LocalDate.now();
    }
    
    private String detectReceiptType(String text) {
        String upperText = text.toUpperCase();
        
        if (upperText.contains("SALARY") || upperText.contains("PAYSLIP") || 
            upperText.contains("CREDIT NOTE") || upperText.contains("REFUND") ||
            upperText.contains("INTEREST CREDIT") || upperText.contains("DIVIDEND") ||
            upperText.contains("PAYOUT") || upperText.contains("EARNINGS") ||
            upperText.contains("CASHBACK") || upperText.contains("FUNDS RECEIVED") ||
            upperText.contains("DEPOSIT")) {
            return "INCOME";
        }
        
        if (upperText.contains("HOTEL") || upperText.contains("ROOM") || 
            upperText.contains("RESERVATION") || upperText.contains("GUEST")) {
            return "HOTEL";
        } else if (upperText.contains("RESTAURANT") || upperText.contains("CAFE") || 
                   upperText.contains("COFFEE") || upperText.contains("DINING") ||
                   upperText.contains("SWIGGY") || upperText.contains("ZOMATO")) {
            return "RESTAURANT";
        } else if (upperText.contains("GROCERY") || upperText.contains("SUPERMARKET") || 
                   upperText.contains("MART") || upperText.contains("RETAIL") ||
                   upperText.contains("STORE")) {
            return "GROCERY";
        } else if (upperText.contains("UBER") || upperText.contains("OLA") || 
                   upperText.contains("TAXI") || upperText.contains("TRANSPORT") ||
                   upperText.contains("FUEL") || upperText.contains("PETROL") ||
                   upperText.contains("DIESEL")) {
            return "TRANSPORT";
        } else if (upperText.contains("AMAZON") || upperText.contains("FLIPKART") || 
                   upperText.contains("SHOPPING") || upperText.contains("CLOTHING") ||
                   upperText.contains("APPAREL")) {
            return "SHOPPING";
        } else if (upperText.contains("ELECTRICITY") || upperText.contains("WATER") || 
                   upperText.contains("BILL") || upperText.contains("UTILITY") ||
                   upperText.contains("RECHARGE") || upperText.contains("INTERNET")) {
            return "UTILITY";
        } else if (upperText.contains("HOSPITAL") || upperText.contains("PHARMACY") || 
                   upperText.contains("MEDICAL") || upperText.contains("HEALTHCARE")) {
            return "HEALTHCARE";
        }
        
        return "GENERAL";
    }
    
    @Transactional
    public void batchProcessDocuments() {
        System.out.println("========== BATCH PROCESSING STARTED ==========");
        List<OcrDocument> unprocessedDocs = ocrDocumentRepository.findByProcessedFalse();
        System.out.println("Found " + unprocessedDocs.size() + " unprocessed documents");
        
        int successCount = 0;
        int failCount = 0;
        
        for (OcrDocument doc : unprocessedDocs) {
            try {
                System.out.println("\nProcessing document " + (successCount + failCount + 1));
                processOcrDocument(doc.getDocumentId(), doc.getUser().getUserId(), false);
                successCount++;
            } catch (Exception e) {
                failCount++;
                System.err.println("❌ Failed: " + doc.getFilename() + " - " + e.getMessage());
                doc.setProcessingStatus("FAILED");
                doc.setProcessed(true);
                ocrDocumentRepository.save(doc);
            }
        }
        
        System.out.println("\n========== BATCH PROCESSING COMPLETED ==========");
        System.out.println("✅ Successful: " + successCount);
        System.out.println("❌ Failed: " + failCount);
    }
    
    // ==================== INNER CLASSES ====================
    
    public static class ParsedData {
        String vendorName = "Unknown Vendor";
        LocalDate transactionDate = LocalDate.now();
        BigDecimal amount = null;
        String receiptType = "GENERAL";
        List<ExtractedTransaction> lineItems = new ArrayList<>();
    }
    
    public static class ExtractedTransaction {
        private String description;
        private BigDecimal amount;
        private int quantity = 1;
        private BigDecimal unitPrice;
        private TransactionType type;
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
        public BigDecimal getUnitPrice() { return unitPrice; }
        public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
        public TransactionType getType() { return type; }
        public void setType(TransactionType type) { this.type = type; }
    }
    
    public static class ProcessingResult {
        private Long documentId;
        private List<ExtractedTransaction> extractedTransactions = new ArrayList<>();
        private List<Transaction> createdTransactions = new ArrayList<>();
        private BigDecimal totalAmount;
        private String vendorName;
        private LocalDate transactionDate;
        private String receiptType;
        private int transactionsCreated = 0;
        private String errorMessage;
        private boolean budgetExceeded = false;
        private Map<String, Object> budgetImpact;
        private boolean duplicateDetected = false;
        
        public Long getDocumentId() { return documentId; }
        public void setDocumentId(Long documentId) { this.documentId = documentId; }
        
        public List<ExtractedTransaction> getExtractedTransactions() { return extractedTransactions; }
        public void setExtractedTransactions(List<ExtractedTransaction> extractedTransactions) { 
            this.extractedTransactions = extractedTransactions != null ? extractedTransactions : new ArrayList<>();
        }
        
        public List<Transaction> getCreatedTransactions() { return createdTransactions; }
        public void setCreatedTransactions(List<Transaction> createdTransactions) { 
            this.createdTransactions = createdTransactions != null ? createdTransactions : new ArrayList<>();
        }
        
        public BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
        
        public String getVendorName() { return vendorName; }
        public void setVendorName(String vendorName) { this.vendorName = vendorName; }
        
        public LocalDate getTransactionDate() { return transactionDate; }
        public void setTransactionDate(LocalDate transactionDate) { this.transactionDate = transactionDate; }
        
        public String getReceiptType() { return receiptType; }
        public void setReceiptType(String receiptType) { this.receiptType = receiptType; }
        
        public int getTransactionsCreated() { return transactionsCreated; }
        public void setTransactionsCreated(int transactionsCreated) { this.transactionsCreated = transactionsCreated; }
        
        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

        public boolean isBudgetExceeded() { return budgetExceeded; }
        public void setBudgetExceeded(boolean budgetExceeded) { this.budgetExceeded = budgetExceeded; }

        public Map<String, Object> getBudgetImpact() { return budgetImpact; }
        public void setBudgetImpact(Map<String, Object> budgetImpact) { this.budgetImpact = budgetImpact; }
        
        public boolean isDuplicateDetected() { return duplicateDetected; }
        public void setDuplicateDetected(boolean duplicateDetected) { this.duplicateDetected = duplicateDetected; }
        
        public Map<String, Object> toSummary() {
            Map<String, Object> summary = new HashMap<>();
            summary.put("documentId", documentId);
            summary.put("totalAmount", totalAmount);
            summary.put("vendorName", vendorName);
            summary.put("transactionDate", transactionDate);
            summary.put("receiptType", receiptType);
            summary.put("transactionsCreated", transactionsCreated);
            summary.put("itemsFound", extractedTransactions != null ? extractedTransactions.size() : 0);
            summary.put("budgetExceeded", budgetExceeded);
            summary.put("budgetImpact", budgetImpact);
            summary.put("duplicateDetected", duplicateDetected);
            if (errorMessage != null) {
                summary.put("error", errorMessage);
            }
            return summary;
        }
    }
}
