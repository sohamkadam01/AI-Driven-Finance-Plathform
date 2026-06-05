import re
import os

filepath = 'project/src/main/java/com/College_project/project/service/OcrTextParserService.java'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace the single line extractAllData with the AI logic
old_logic = """            // Extract all information
            ParsedData parsedData = extractAllData(cleanedText);"""
new_logic = """            // ✅ Prioritize AI Data from database!
            ParsedData parsedData = new ParsedData();
            boolean useAiFallback = false;
            
            if (document.getExtractedAmount() != null && !document.getExtractedAmount().isEmpty() && !document.getExtractedAmount().equals("null")) {
                try {
                    parsedData.amount = new BigDecimal(document.getExtractedAmount().replaceAll("[^\\\\d.]", ""));
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
            }"""

if old_logic in content:
    content = content.replace(old_logic, new_logic)
    print("Patched AI logic.")

# 2. Remove Strategy 3
old_strategy3 = """        // Strategy 3: Look for large numbers
        Pattern largeNumberPattern = Pattern.compile("\\\\b(\\\\d{4,})\\\\b");
        Matcher numberMatcher = largeNumberPattern.matcher(text);
        while (numberMatcher.find()) {
            try {
                BigDecimal amount = new BigDecimal(numberMatcher.group(1));
                if (isValidAmount(amount) && amount.compareTo(new BigDecimal("1000000")) < 0) {
                    System.out.println("Found large number: " + amount);
                    foundAmounts.add(amount);
                }
            } catch (NumberFormatException e) {
                // Skip invalid numbers
            }
        }"""
if old_strategy3 in content:
    content = content.replace(old_strategy3, "        // Strategy 3: Look for large numbers REMOVED")
    print("Patched Strategy 3.")

# 3. Fix the spaces
old_spaces = """        // Fix number formatting: remove spaces between digits
        cleaned = cleaned.replaceAll("(\\\\d+)\\\\s*,\\\\s*(\\\\d+)", "$1$2");
        cleaned = cleaned.replaceAll("(\\\\d+)\\\\s+(\\\\d{3})", "$1$2");"""
new_spaces = """        // Fix number formatting: remove spaces around commas
        cleaned = cleaned.replaceAll("(\\\\d+)\\\\s*,\\\\s*(\\\\d+)", "$1$2");
        // Removed: merging space-separated digits (corrupts phone numbers like 1800 11 2211)"""
if old_spaces in content:
    content = content.replace(old_spaces, new_spaces)
    print("Patched regex spaces.")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Java OCR Service updated successfully!")
