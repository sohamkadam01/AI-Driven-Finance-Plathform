package com.College_project.project.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.io.File;
import java.util.Map;

@Service
public class OcrServiceClient {
    
    private final WebClient webClient;
    
    public OcrServiceClient(
            WebClient.Builder webClientBuilder,
            @Value("${ocr.service.url:http://localhost:8000}") String ocrServiceUrl) {
        this.webClient = webClientBuilder
                .baseUrl(ocrServiceUrl)
                .build();
    }
    
    /**
     * Send image to Python OCR service and get extracted text
     */
    public Mono<OcrResponse> extractText(File imageFile) {
        MultipartBodyBuilder bodyBuilder = new MultipartBodyBuilder();
        bodyBuilder.part("file", new FileSystemResource(imageFile));
        
        return webClient.post()
                .uri("/ocr/extract")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(bodyBuilder.build()))
                .retrieve()
                .bodyToMono(OcrResponse.class);
    }
    
    /**
     * Check if Python OCR service is healthy
     */
    public Mono<Map> healthCheck() {
        return webClient.get()
                .uri("/health")
                .retrieve()
                .bodyToMono(Map.class);
    }
    
    // Response DTO
    public static class OcrResponse {
        private boolean success;
        private String filename;
        private String extracted_text;
        private int text_length;
        private int word_count;
        private AiAnalysis ai_analysis;
        
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        
        public String getFilename() { return filename; }
        public void setFilename(String filename) { this.filename = filename; }
        
        public String getExtracted_text() { return extracted_text; }
        public void setExtracted_text(String extracted_text) { this.extracted_text = extracted_text; }
        
        public int getText_length() { return text_length; }
        public void setText_length(int text_length) { this.text_length = text_length; }
        
        public int getWord_count() { return word_count; }
        public void setWord_count(int word_count) { this.word_count = word_count; }

        public AiAnalysis getAi_analysis() { return ai_analysis; }
        public void setAi_analysis(AiAnalysis ai_analysis) { this.ai_analysis = ai_analysis; }
    }

    public static class AiAnalysis {
        private boolean enabled;
        private boolean success;
        private ExtractedData extracted_data;

        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean enabled) { this.enabled = enabled; }

        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }

        public ExtractedData getExtracted_data() { return extracted_data; }
        public void setExtracted_data(ExtractedData extracted_data) { this.extracted_data = extracted_data; }
    }

    public static class ExtractedData {
        private String document_type;
        private Merchant merchant;
        private TransactionData transaction;
        private Financial financial;
        private Payment payment;

        public String getDocument_type() { return document_type; }
        public void setDocument_type(String document_type) { this.document_type = document_type; }

        public Merchant getMerchant() { return merchant; }
        public void setMerchant(Merchant merchant) { this.merchant = merchant; }

        public TransactionData getTransaction() { return transaction; }
        public void setTransaction(TransactionData transaction) { this.transaction = transaction; }

        public Financial getFinancial() { return financial; }
        public void setFinancial(Financial financial) { this.financial = financial; }

        public Payment getPayment() { return payment; }
        public void setPayment(Payment payment) { this.payment = payment; }
    }

    public static class Merchant {
        private String name;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }

    public static class TransactionData {
        private String id;
        private String date;
        private String time;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }

        public String getTime() { return time; }
        public void setTime(String time) { this.time = time; }
    }

    public static class Financial {
        private Object total;
        private Object amount_paid;
        private String currency;

        public Object getTotal() { return total; }
        public void setTotal(Object total) { this.total = total; }

        public Object getAmount_paid() { return amount_paid; }
        public void setAmount_paid(Object amount_paid) { this.amount_paid = amount_paid; }

        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }
    }

    public static class Payment {
        private String method;
        private String bank_name;

        public String getMethod() { return method; }
        public void setMethod(String method) { this.method = method; }

        public String getBank_name() { return bank_name; }
        public void setBank_name(String bank_name) { this.bank_name = bank_name; }
    }
}
