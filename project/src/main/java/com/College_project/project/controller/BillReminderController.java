package com.College_project.project.controller;

import com.College_project.project.DTOs.BillCalendarDTO;
import com.College_project.project.DTOs.BillReminderDTO;
import com.College_project.project.DTOs.MonthlyBillSummaryDTO;
import com.College_project.project.DTOs.RecurringTransactionRequest;
import com.College_project.project.DTOs.RecurringTransactionResponse;
import com.College_project.project.service.BillReminderService;
import com.College_project.project.security.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/bill-reminders")
public class BillReminderController {
    
    @Autowired
    private BillReminderService billReminderService;
    
    @PostMapping("/create")
    public ResponseEntity<?> createBillReminder(@Valid @RequestBody RecurringTransactionRequest request,
                                               Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        RecurringTransactionResponse response = billReminderService.createBillReminder(
            userDetails.getId(), request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/my-bills")
    public ResponseEntity<?> getMyBillReminders(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<RecurringTransactionResponse> bills = billReminderService.getUserBillReminders(
            userDetails.getId());
        return ResponseEntity.ok(bills);
    }
    
    @GetMapping("/upcoming")
    public ResponseEntity<?> getUpcomingBills(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<BillReminderDTO> upcomingBills = billReminderService.getUpcomingBills(
            userDetails.getId());
        return ResponseEntity.ok(upcomingBills);
    }
    
    @PutMapping("/{recurringId}/mark-paid")
    public ResponseEntity<?> markBillAsPaid(@PathVariable Long recurringId,
                                           @RequestParam(required = false) Long accountId,
                                           @RequestParam(required = false) Long transactionId,
                                           Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        billReminderService.markBillAsPaid(recurringId, userDetails.getId(), accountId, transactionId);
        return ResponseEntity.ok("Bill marked as paid! Next due date updated.");
    }
    
    @PutMapping("/{recurringId}/update")
    public ResponseEntity<?> updateBillReminder(@PathVariable Long recurringId,
                                               @Valid @RequestBody RecurringTransactionRequest request,
                                               Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        billReminderService.updateBillReminder(recurringId, userDetails.getId(), request);
        return ResponseEntity.ok("Bill reminder updated successfully");
    }
    
    @DeleteMapping("/{recurringId}")
    public ResponseEntity<?> deleteBillReminder(@PathVariable Long recurringId,
                                               Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        billReminderService.deleteBillReminder(recurringId, userDetails.getId());
        return ResponseEntity.ok("Bill reminder deleted successfully");
    }

    /**
 * GET /api/bill-reminders/calendar
 * Get bill calendar data for a specific month
 * 
 * Query Parameters:
 * - year: Year (e.g., 2026)
 * - month: Month (1-12)
 */
@GetMapping("/calendar")
public ResponseEntity<?> getBillCalendar(
        @RequestParam int year,
        @RequestParam int month,
        Authentication authentication) {
    
    try {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        BillCalendarDTO calendar = billReminderService.getBillCalendar(userDetails.getId(), year, month);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("calendar", calendar);
        
        return ResponseEntity.ok(response);
        
    } catch (Exception e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage());
        return ResponseEntity.badRequest().body(error);
    }
}

/**
 * POST /api/bill-reminders/calendar/mark-paid
 * Mark a bill as paid from calendar
 */
@PostMapping("/calendar/mark-paid")
public ResponseEntity<?> markBillAsPaidFromCalendar(
        @RequestBody Map<String, Object> request,
        Authentication authentication) {
    
    try {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        Long billId = ((Number) request.get("billId")).longValue();
        LocalDate paymentDate = LocalDate.parse((String) request.get("paymentDate"));
        BigDecimal amount = request.get("amount") != null ? 
            new BigDecimal(request.get("amount").toString()) : null;
        String paymentMethod = (String) request.get("paymentMethod");
        
        billReminderService.markBillAsPaidFromCalendar(userDetails.getId(), billId, paymentDate, amount, paymentMethod);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Bill marked as paid successfully");
        return ResponseEntity.ok(response);
        
    } catch (Exception e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage());
        return ResponseEntity.badRequest().body(error);
    }
}


/**
 * GET /api/bill-reminders/monthly-summary
 * Get monthly bill summary for a specific month
 * 
 * Query Parameters:
 * - year: Year (e.g., 2026)
 * - month: Month (1-12)
 */
@GetMapping("/monthly-summary")
public ResponseEntity<?> getMonthlyBillSummary(
        @RequestParam int year,
        @RequestParam int month,
        Authentication authentication) {
    
    try {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        MonthlyBillSummaryDTO summary = billReminderService.getMonthlyBillSummary(
            userDetails.getId(), year, month);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("summary", summary);
        
        return ResponseEntity.ok(response);
        
    } catch (Exception e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage());
        return ResponseEntity.badRequest().body(error);
    }
}

/**
 * GET /api/bill-reminders/monthly-summary/current
 * Get current month's bill summary
 */
@GetMapping("/monthly-summary/current")
public ResponseEntity<?> getCurrentMonthBillSummary(Authentication authentication) {
    try {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        LocalDate now = LocalDate.now();
        
        MonthlyBillSummaryDTO summary = billReminderService.getMonthlyBillSummary(
            userDetails.getId(), now.getYear(), now.getMonthValue());
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("summary", summary);
        
        return ResponseEntity.ok(response);
        
    } catch (Exception e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage());
        return ResponseEntity.badRequest().body(error);
    }
}

/**
 * GET /api/bill-reminders/history
 * Get bill payment history for past months
 * 
 * Query Parameters:
 * - months: Number of months of history (default: 12)
 */
@GetMapping("/history")
public ResponseEntity<?> getBillHistory(
        @RequestParam(defaultValue = "12") int months,
        Authentication authentication) {
    
    try {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        com.College_project.project.DTOs.BillHistoryDTO history = billReminderService.getBillHistory(
            userDetails.getId(), months);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("history", history);
        
        return ResponseEntity.ok(response);
        
    } catch (Exception e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage());
        return ResponseEntity.badRequest().body(error);
    }
}
}
