package com.College_project.project.service;

import com.College_project.project.DTOs.BillCalendarDTO;
import com.College_project.project.DTOs.BillHistoryDTO;
import com.College_project.project.DTOs.BillReminderDTO;
import com.College_project.project.DTOs.MonthlyBillSummaryDTO;
import com.College_project.project.DTOs.RecurringTransactionRequest;
import com.College_project.project.DTOs.RecurringTransactionResponse;
import com.College_project.project.DTOs.TransactionRequest;
import com.College_project.project.models.*;
import com.College_project.project.enums.AlertType;
import com.College_project.project.enums.Frequency;
import com.College_project.project.enums.TransactionType;
import com.College_project.project.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.time.temporal.ChronoUnit;

@Service
public class BillReminderService {
    
    @Autowired
    private RecurringTransactionRepository recurringTransactionRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private bankAccountRepository bankAccountRepository;
    
    @Autowired
    private AlertRepository alertRepository;
    
    @Autowired
    private transactionRepository transactionRepository;

    @Autowired
    private TransactionService transactionService;
    
    @Transactional
    public RecurringTransactionResponse createBillReminder(Long userId, RecurringTransactionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        
        BankAccount bankAccount = null;
        if (request.getBankAccountId() != null) {
            bankAccount = bankAccountRepository.findById(request.getBankAccountId())
                    .orElseThrow(() -> new RuntimeException("Bank account not found"));
        }
        
        RecurringTransaction recurring = new RecurringTransaction();
        recurring.setUser(user);
        recurring.setName(request.getName());
        recurring.setAmount(request.getAmount());
        recurring.setCategory(category);
        recurring.setFrequency(request.getFrequency());
        recurring.setNextDueDate(request.getNextDueDate());
        recurring.setReminderDaysBefore(request.getReminderDaysBefore());
        recurring.setDescription(request.getDescription());
        recurring.setBankAccount(bankAccount);
        recurring.setActive(true);
        recurring.setCreatedAt(LocalDateTime.now());
        recurring.setAutoDetected(false);
        
        RecurringTransaction saved = recurringTransactionRepository.save(recurring);
        
        // Create initial reminder alert only for current or future bills.
        if (!saved.getNextDueDate().isBefore(LocalDate.now())) {
            createReminderAlert(saved);
        }
        
        return convertToResponse(saved);
    }
    
    // FIXED: Method signature accepts Long userId
    public List<RecurringTransactionResponse> getUserBillReminders(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return recurringTransactionRepository.findByUserAndIsActiveTrue(user).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    // Alternative: If you want to pass User object directly
    public List<RecurringTransactionResponse> getUserBillReminders(User user) {
        return recurringTransactionRepository.findByUserAndIsActiveTrue(user).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public List<BillReminderDTO> getUpcomingBills(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        LocalDate today = LocalDate.now();
        LocalDate nextMonth = today.plusMonths(1);
        
        List<RecurringTransaction> bills = recurringTransactionRepository
                .findByUserAndIsActiveTrueAndNextDueDateBetween(user, today, nextMonth);
        
        return bills.stream()
                .map(bill -> new BillReminderDTO(
                    bill.getRecurringId(),
                    bill.getName() != null ? bill.getName() : "Bill",
                    bill.getAmount() != null ? bill.getAmount() : BigDecimal.ZERO,
                    bill.getCategory() != null ? bill.getCategory().getName() : "Uncategorized",
                    bill.getNextDueDate(),
                    (int) java.time.temporal.ChronoUnit.DAYS.between(today, bill.getNextDueDate())
                ))
                .sorted((b1, b2) -> b1.getDaysUntilDue().compareTo(b2.getDaysUntilDue()))
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void markBillAsPaid(Long recurringId, Long userId, Long accountId, Long transactionId) {
        RecurringTransaction recurring = recurringTransactionRepository.findById(recurringId)
                .orElseThrow(() -> new RuntimeException("Bill reminder not found"));
        
        if (!recurring.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        if (transactionId == null) {
            BankAccount paymentAccount = resolvePaymentAccount(recurring, userId, accountId);

            TransactionRequest paymentRequest = new TransactionRequest();
            paymentRequest.setAmount(recurring.getAmount());
            paymentRequest.setType(TransactionType.EXPENSE);
            paymentRequest.setDescription("Bill payment: " + recurring.getName());
            paymentRequest.setTransactionDate(LocalDate.now());
            if (recurring.getCategory() != null) {
                paymentRequest.setCategoryId(recurring.getCategory().getCategoryId());
            }

            transactionService.addTransaction(userId, paymentAccount.getAccountId(), paymentRequest);
        }
        
        // Update next due date based on frequency
        LocalDate nextDate = calculateNextDueDate(recurring.getNextDueDate(), recurring.getFrequency());
        recurring.setNextDueDate(nextDate);
        recurring.setUpdatedAt(LocalDateTime.now());
        recurringTransactionRepository.save(recurring);
        
        // Create success alert
        Alert alert = new Alert();
        alert.setUser(recurring.getUser());
        alert.setType(AlertType.BILL_REMINDER);
        alert.setMessage("✅ " + recurring.getName() + " marked as paid! Next due date: " + nextDate);
        alert.setCreatedAt(LocalDateTime.now());
        alert.setRead(false);
        alert.setActionUrl("/bills");
        alertRepository.save(alert);
    }

    private BankAccount resolvePaymentAccount(RecurringTransaction recurring, Long userId, Long accountId) {
        if (accountId != null) {
            return bankAccountRepository.findById(accountId)
                    .filter(account -> account.getUser().getUserId().equals(userId))
                    .filter(BankAccount::isActive)
                    .orElseThrow(() -> new RuntimeException("Payment account not found"));
        }

        if (recurring.getBankAccount() != null && recurring.getBankAccount().isActive()) {
            return recurring.getBankAccount();
        }

        List<BankAccount> activeAccounts = bankAccountRepository.findByUserAndIsActive(recurring.getUser(), true);

        if (activeAccounts.isEmpty()) {
            throw new RuntimeException("Add a bank account before marking this bill as paid");
        }

        if (activeAccounts.size() > 1) {
            throw new RuntimeException("Please choose which account to use for this payment");
        }

        return activeAccounts.get(0);
    }
    
    @Transactional
    public void updateBillReminder(Long recurringId, Long userId, RecurringTransactionRequest request) {
        RecurringTransaction recurring = recurringTransactionRepository.findById(recurringId)
                .orElseThrow(() -> new RuntimeException("Bill reminder not found"));
        
        if (!recurring.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        recurring.setName(request.getName());
        recurring.setAmount(request.getAmount());
        recurring.setFrequency(request.getFrequency());
        recurring.setNextDueDate(request.getNextDueDate());
        recurring.setReminderDaysBefore(request.getReminderDaysBefore());
        recurring.setDescription(request.getDescription());
        recurring.setUpdatedAt(LocalDateTime.now());
        
        if (request.getBankAccountId() != null) {
            BankAccount bankAccount = bankAccountRepository.findById(request.getBankAccountId())
                    .orElseThrow(() -> new RuntimeException("Bank account not found"));
            recurring.setBankAccount(bankAccount);
        }
        
        recurringTransactionRepository.save(recurring);
    }
    
    @Transactional
    public void deleteBillReminder(Long recurringId, Long userId) {
        RecurringTransaction recurring = recurringTransactionRepository.findById(recurringId)
                .orElseThrow(() -> new RuntimeException("Bill reminder not found"));
        
        if (!recurring.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        recurring.setActive(false); // Soft delete
        recurring.setUpdatedAt(LocalDateTime.now());
        recurringTransactionRepository.save(recurring);
    }
    
    @Transactional
    @Scheduled(cron = "0 0 8 * * ?") // Runs every day at 8:00 AM
    public void checkAndSendReminders() {
        LocalDate today = LocalDate.now();
        LocalDate reminderDate = today.plusDays(3); // Check for bills due in next 3 days
        
        List<RecurringTransaction> upcomingBills = recurringTransactionRepository
                .findByIsActiveTrueAndNextDueDateBetween(today, reminderDate);
        
        for (RecurringTransaction bill : upcomingBills) {
            int daysUntilDue = (int) java.time.temporal.ChronoUnit.DAYS.between(today, bill.getNextDueDate());
            
            if (daysUntilDue <= bill.getReminderDaysBefore()) {
                createReminderAlert(bill);
            }
        }
    }
    
    private void createReminderAlert(RecurringTransaction bill) {
        int daysUntilDue = (int) java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), bill.getNextDueDate());

        if (daysUntilDue < 0) {
            return;
        }
        
        String message;
        String priority;
        
        if (daysUntilDue == 0) {
            priority = "URGENT";
            message = String.format("URGENT: %s of Rs %.2f is due today. Please pay before the due date.",
                bill.getName(), bill.getAmount());
        } else if (daysUntilDue == 1) {
            priority = "URGENT";
            message = String.format("URGENT: %s of Rs %.2f is due tomorrow. Please pay before the due date.",
                bill.getName(), bill.getAmount());
        } else if (daysUntilDue <= 3) {
            priority = "REMINDER";
            message = String.format("REMINDER: %s of Rs %.2f is due in %d days on %s.",
                bill.getName(), bill.getAmount(), daysUntilDue, bill.getNextDueDate());
        } else {
            priority = "UPCOMING";
            message = String.format("UPCOMING: %s of Rs %.2f will be due on %s.",
                bill.getName(), bill.getAmount(), bill.getNextDueDate());
        }
        
        // Check if we already sent a reminder for this bill recently
        boolean existingAlert = alertRepository.existsByUserAndMessageContainingAndCreatedAtAfter(
            bill.getUser(), bill.getName(), LocalDateTime.now().minusDays(1));
        
        if (!existingAlert) {
            Alert alert = new Alert();
            alert.setUser(bill.getUser());
            alert.setType(AlertType.BILL_REMINDER);
            alert.setMessage(message);
            alert.setCreatedAt(LocalDateTime.now());
            alert.setRead(false);
            alert.setActionUrl("/bills/" + bill.getRecurringId());
            alertRepository.save(alert);
            
            System.out.println("Sent " + priority + " reminder for: " + bill.getName());
        }
    }
    
    private LocalDate calculateNextDueDate(LocalDate currentDueDate, Frequency frequency) {
        switch (frequency) {
            case MONTHLY:
                return currentDueDate.plusMonths(1);
            case YEARLY:
                return currentDueDate.plusYears(1);
            case WEEKLY:
                return currentDueDate.plusWeeks(1);
            case DAILY:
                return currentDueDate.plusDays(1);
            default:
                return currentDueDate.plusMonths(1);
        }
    }
    
    private RecurringTransactionResponse convertToResponse(RecurringTransaction recurring) {
        String bankName = recurring.getBankAccount() != null ? 
            recurring.getBankAccount().getBankName() : null;
        Category category = recurring.getCategory();
        
        return new RecurringTransactionResponse(
            recurring.getRecurringId(),
            recurring.getName() != null ? recurring.getName() : "Bill",
            recurring.getAmount() != null ? recurring.getAmount() : BigDecimal.ZERO,
            category != null ? category.getCategoryId() : null,
            category != null ? category.getName() : "Uncategorized",
            category != null ? category.getIcon() : null,
            recurring.getFrequency(),
            recurring.getNextDueDate(),
            recurring.getReminderDaysBefore(),
            recurring.getDescription(),
            recurring.getBankAccount() != null ? recurring.getBankAccount().getAccountId() : null,
            bankName,
            recurring.isActive(),
            recurring.getCreatedAt()
        );
    }

    /**
 * Get bill calendar data for a specific month
 * @param userId User ID
 * @param year Year (e.g., 2026)
 * @param month Month (1-12)
 * @return BillCalendarDTO with calendar data
 */
public BillCalendarDTO getBillCalendar(Long userId, int year, int month) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
    
    BillCalendarDTO calendar = new BillCalendarDTO();
    calendar.setYear(year);
    calendar.setMonth(month);
    
    LocalDate startDate = LocalDate.of(year, month, 1);
    LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
    
    // Get all recurring transactions for the user
    List<RecurringTransaction> allBills = recurringTransactionRepository
            .findByUserAndIsActiveTrue(user);
    
    // Get paid bills (transactions that match recurring bills)
    List<Transaction> paidTransactions = transactionRepository
            .findByUserAndTransactionDateBetween(user, startDate, endDate);
    
    Set<Long> paidBillIds = paidTransactions.stream()
            .filter(t -> t.getDescription() != null)
            .map(t -> t.getDescription().hashCode())
            .map(Long::valueOf)
            .collect(Collectors.toSet());
    
    // Generate calendar days
    List<BillCalendarDTO.CalendarDay> days = generateCalendarDays(startDate, endDate, allBills, paidTransactions);
    calendar.setDays(days);
    
    // Get upcoming bills (next 30 days)
    List<BillCalendarDTO.UpcomingBill> upcomingBills = getUpcomingBills(user, allBills, paidTransactions);
    calendar.setUpcomingBills(upcomingBills);
    
    // Calculate monthly summary
    BillCalendarDTO.MonthlySummary summary = calculateMonthlySummary(allBills, paidTransactions, startDate, endDate);
    calendar.setMonthlySummary(summary);
    
    // Get category breakdown
    Map<String, BigDecimal> categoryBreakdown = getCategoryBreakdownForMonth(allBills, paidTransactions, startDate, endDate);
    calendar.setCategoryBreakdown(categoryBreakdown);
    return calendar;
}

/**
 * Generate calendar days with bill events
 */
private List<BillCalendarDTO.CalendarDay> generateCalendarDays(LocalDate startDate, LocalDate endDate,
                                                                List<RecurringTransaction> bills,
                                                                List<Transaction> paidTransactions) {
    List<BillCalendarDTO.CalendarDay> days = new ArrayList<>();
    LocalDate currentDate = startDate;
    LocalDate today = LocalDate.now();
    
    // Get paid dates
    Set<LocalDate> paidDates = paidTransactions.stream()
            .map(Transaction::getTransactionDate)
            .collect(Collectors.toSet());
    
    while (!currentDate.isAfter(endDate)) {
        BillCalendarDTO.CalendarDay day = new BillCalendarDTO.CalendarDay();
        day.setDate(currentDate);
        day.setDayOfMonth(currentDate.getDayOfMonth());
        day.setCurrentMonth(true);
        day.setToday(currentDate.equals(today));
        
        List<BillCalendarDTO.BillEvent> events = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;
        
        // Find bills due on this date
        for (RecurringTransaction bill : bills) {
            if (isBillDueOnDate(bill, currentDate)) {
                BillCalendarDTO.BillEvent event = new BillCalendarDTO.BillEvent();
                event.setBillId(bill.getRecurringId());
                event.setName(bill.getName());
                event.setAmount(bill.getAmount());
                event.setCategory(bill.getCategory() != null ? bill.getCategory().getName() : "Other");
                event.setCategoryIcon(bill.getCategory() != null ? bill.getCategory().getIcon() : "📄");
                event.setFrequency(bill.getFrequency().toString());
                event.setDueDate(currentDate);
                
                // Check if paid
                boolean isPaid = paidDates.contains(currentDate);
                event.setPaid(isPaid);
                event.setStatus(isPaid ? "PAID" : (currentDate.isBefore(today) ? "OVERDUE" : "PENDING"));
                
                events.add(event);
                totalAmount = totalAmount.add(bill.getAmount());
            }
        }
        
        day.setEvents(events);
        day.setTotalAmount(totalAmount);
        days.add(day);
        
        currentDate = currentDate.plusDays(1);
    }
    
    return days;
}

/**
 * Check if a bill is due on a specific date
 */
private boolean isBillDueOnDate(RecurringTransaction bill, LocalDate date) {
    LocalDate nextDueDate = bill.getNextDueDate();
    
    if (nextDueDate == null) return false;
    
    // Check if due on exact date
    if (nextDueDate.equals(date)) return true;
    
    // For monthly bills, check if due on same day of month
    if (bill.getFrequency() == Frequency.MONTHLY) {
        return nextDueDate.getDayOfMonth() == date.getDayOfMonth() && 
               date.isAfter(nextDueDate.minusMonths(1));
    }
    
    // For weekly bills
    if (bill.getFrequency() == Frequency.WEEKLY) {
        long weeksBetween = ChronoUnit.WEEKS.between(nextDueDate, date);
        return weeksBetween >= 0 && weeksBetween % 1 == 0;
    }
    
    return false;
}

/**
 * Get upcoming bills for the next 30 days
 */
private List<BillCalendarDTO.UpcomingBill> getUpcomingBills(User user, 
                                                             List<RecurringTransaction> bills,
                                                             List<Transaction> paidTransactions) {
    List<BillCalendarDTO.UpcomingBill> upcoming = new ArrayList<>();
    LocalDate today = LocalDate.now();
    LocalDate endDate = today.plusDays(30);
    
    Set<LocalDate> paidDates = paidTransactions.stream()
            .map(Transaction::getTransactionDate)
            .collect(Collectors.toSet());
    
    for (RecurringTransaction bill : bills) {
        LocalDate nextDue = bill.getNextDueDate();
        
        if (nextDue != null && !nextDue.isBefore(today) && !nextDue.isAfter(endDate)) {
            boolean isPaid = paidDates.contains(nextDue);
            
            if (!isPaid) {
                BillCalendarDTO.UpcomingBill upcomingBill = new BillCalendarDTO.UpcomingBill();
                upcomingBill.setBillId(bill.getRecurringId());
                upcomingBill.setName(bill.getName());
                upcomingBill.setAmount(bill.getAmount());
                upcomingBill.setDueDate(nextDue);
                upcomingBill.setDaysUntilDue((int) ChronoUnit.DAYS.between(today, nextDue));
                upcomingBill.setCategory(bill.getCategory() != null ? bill.getCategory().getName() : "Other");
                upcomingBill.setCategoryIcon(bill.getCategory() != null ? bill.getCategory().getIcon() : "📄");
                
                // Set priority based on days until due
                if (upcomingBill.getDaysUntilDue() <= 1) {
                    upcomingBill.setPriority("HIGH");
                } else if (upcomingBill.getDaysUntilDue() <= 3) {
                    upcomingBill.setPriority("MEDIUM");
                } else {
                    upcomingBill.setPriority("LOW");
                }
                
                upcoming.add(upcomingBill);
            }
        }
    }
    
    // Sort by due date
    upcoming.sort(Comparator.comparing(BillCalendarDTO.UpcomingBill::getDueDate));
    
    return upcoming;
}

/**
 * Calculate monthly summary statistics
 */
private BillCalendarDTO.MonthlySummary calculateMonthlySummary(List<RecurringTransaction> bills,
                                                                List<Transaction> paidTransactions,
                                                                LocalDate startDate,
                                                                LocalDate endDate) {
    BillCalendarDTO.MonthlySummary summary = new BillCalendarDTO.MonthlySummary();
    
    Set<LocalDate> paidDates = paidTransactions.stream()
            .map(Transaction::getTransactionDate)
            .collect(Collectors.toSet());
    
    BigDecimal totalDue = BigDecimal.ZERO;
    BigDecimal totalPaid = BigDecimal.ZERO;
    int paidCount = 0;
    int totalBills = 0;
    int overdueCount = 0;
    LocalDate today = LocalDate.now();
    
    for (RecurringTransaction bill : bills) {
        LocalDate dueDate = bill.getNextDueDate();
        
        if (dueDate != null && !dueDate.isBefore(startDate) && !dueDate.isAfter(endDate)) {
            totalDue = totalDue.add(bill.getAmount());
            totalBills++;
            
            boolean isPaid = paidDates.contains(dueDate);
            if (isPaid) {
                totalPaid = totalPaid.add(bill.getAmount());
                paidCount++;
            } else if (dueDate.isBefore(today)) {
                overdueCount++;
            }
        }
    }
    
    summary.setTotalDue(totalDue);
    summary.setTotalPaid(totalPaid);
    summary.setTotalUnpaid(totalDue.subtract(totalPaid));
    summary.setTotalBills(totalBills);
    summary.setPaidCount(paidCount);
    summary.setUnpaidCount(totalBills - paidCount);
    summary.setOverdueCount(overdueCount);
    
    return summary;
}

/**
 * Get category breakdown for the month
 */
private Map<String, BigDecimal> getCategoryBreakdownForMonth(List<RecurringTransaction> bills,
                                                              List<Transaction> paidTransactions,
                                                              LocalDate startDate,
                                                              LocalDate endDate) {
    Map<String, BigDecimal> breakdown = new HashMap<>();
    Set<LocalDate> paidDates = paidTransactions.stream()
            .map(Transaction::getTransactionDate)
            .collect(Collectors.toSet());
    
    for (RecurringTransaction bill : bills) {
        LocalDate dueDate = bill.getNextDueDate();
        
        if (dueDate != null && !dueDate.isBefore(startDate) && !dueDate.isAfter(endDate)) {
            boolean isPaid = paidDates.contains(dueDate);
            if (isPaid) {
                String category = bill.getCategory() != null ? bill.getCategory().getName() : "Other";
                breakdown.put(category, breakdown.getOrDefault(category, BigDecimal.ZERO).add(bill.getAmount()));
            }
        }
    }
    
    return breakdown;
}

/**
 * Mark a bill as paid
 */
@Transactional
public void markBillAsPaidFromCalendar(Long userId, Long billId, LocalDate paymentDate, BigDecimal amount, String paymentMethod) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
    
    RecurringTransaction bill = recurringTransactionRepository.findById(billId)
            .orElseThrow(() -> new RuntimeException("Bill not found"));
    
    if (!bill.getUser().getUserId().equals(userId)) {
        throw new RuntimeException("Unauthorized");
    }
    
    // Create transaction for this bill payment
    Transaction transaction = new Transaction();
    transaction.setUser(user);
    transaction.setAmount(amount != null ? amount : bill.getAmount());
    transaction.setType(TransactionType.EXPENSE);
    transaction.setDescription(bill.getName() + " Payment");
    transaction.setTransactionDate(paymentDate);
    transaction.setCreatedAt(LocalDateTime.now());
    transaction.setStatus("COMPLETED");
    transaction.setCategory(bill.getCategory());
    
    // If user has a bank account, associate it
    List<BankAccount> accounts = bankAccountRepository.findByUserAndIsActive(user, true);
    if (!accounts.isEmpty()) {
        transaction.setBankAccount(accounts.get(0));
    }
    
    transactionRepository.save(transaction);
    
    // Update next due date
    LocalDate nextDue = calculateNextDueDate(bill.getNextDueDate(), bill.getFrequency());
    bill.setNextDueDate(nextDue);
    bill.setUpdatedAt(LocalDateTime.now());
    recurringTransactionRepository.save(bill);
    
    System.out.println("Bill marked as paid: " + bill.getName() + " on " + paymentDate);
}


/**
 * Get monthly bill summary for a specific month
 * @param userId User ID
 * @param year Year (e.g., 2026)
 * @param month Month (1-12)
 * @return MonthlyBillSummaryDTO with detailed bill summary
 */
public MonthlyBillSummaryDTO getMonthlyBillSummary(Long userId, int year, int month) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
    
    MonthlyBillSummaryDTO summary = new MonthlyBillSummaryDTO();
    summary.setYear(year);
    summary.setMonth(month);
    
    LocalDate startDate = LocalDate.of(year, month, 1);
    LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
    summary.setStartDate(startDate);
    summary.setEndDate(endDate);
    
    // Get all recurring bills for the user
    List<RecurringTransaction> allBills = recurringTransactionRepository
            .findByUserAndIsActiveTrue(user);
    
    // Get paid transactions for this month
    List<Transaction> paidTransactions = transactionRepository
            .findByUserAndTransactionDateBetween(user, startDate, endDate);
    
    // Create a set of paid bill identifiers (using name + due date as proxy)
    Set<String> paidBillKeys = paidTransactions.stream()
            .filter(t -> t.getDescription() != null)
            .map(t -> t.getDescription().toLowerCase().trim())
            .collect(Collectors.toSet());
    
    // Process bills for this month
    List<MonthlyBillSummaryDTO.BillDetail> bills = new ArrayList<>();
    List<MonthlyBillSummaryDTO.BillDetail> paidBills = new ArrayList<>();
    List<MonthlyBillSummaryDTO.BillDetail> unpaidBills = new ArrayList<>();
    List<MonthlyBillSummaryDTO.BillDetail> overdueBills = new ArrayList<>();
    Map<String, List<MonthlyBillSummaryDTO.BillDetail>> categoryMap = new HashMap<>();
    
    LocalDate today = LocalDate.now();
    BigDecimal totalBills = BigDecimal.ZERO;
    BigDecimal totalPaid = BigDecimal.ZERO;
    BigDecimal totalUnpaid = BigDecimal.ZERO;
    BigDecimal totalOverdue = BigDecimal.ZERO;
    int paidCount = 0;
    int unpaidCount = 0;
    int overdueCount = 0;
    
    for (RecurringTransaction bill : allBills) {
        LocalDate dueDate = getBillDueDateForMonth(bill, year, month);
        
        if (dueDate != null && !dueDate.isBefore(startDate) && !dueDate.isAfter(endDate)) {
            MonthlyBillSummaryDTO.BillDetail billDetail = new MonthlyBillSummaryDTO.BillDetail();
            billDetail.setBillId(bill.getRecurringId());
            billDetail.setName(bill.getName());
            billDetail.setAmount(bill.getAmount());
            billDetail.setDueDate(dueDate);
            billDetail.setCategory(bill.getCategory() != null ? bill.getCategory().getName() : "Other");
            billDetail.setCategoryIcon(bill.getCategory() != null ? bill.getCategory().getIcon() : "📄");
            billDetail.setFrequency(bill.getFrequency().toString());
            
            // Check if bill is paid
            boolean isPaid = isBillPaid(bill, dueDate, paidTransactions);
            billDetail.setStatus(isPaid ? "PAID" : (dueDate.isBefore(today) ? "OVERDUE" : "UNPAID"));
            
            if (isPaid) {
                billDetail.setPaidDate(dueDate);
                paidBills.add(billDetail);
                totalPaid = totalPaid.add(bill.getAmount());
                paidCount++;
            } else {
                if (dueDate.isBefore(today)) {
                    billDetail.setDaysOverdue((int) ChronoUnit.DAYS.between(dueDate, today));
                    overdueBills.add(billDetail);
                    totalOverdue = totalOverdue.add(bill.getAmount());
                    overdueCount++;
                } else {
                    unpaidBills.add(billDetail);
                    totalUnpaid = totalUnpaid.add(bill.getAmount());
                    unpaidCount++;
                }
            }
            
            bills.add(billDetail);
            totalBills = totalBills.add(bill.getAmount());
            
            // Add to category map
            String category = billDetail.getCategory();
            categoryMap.computeIfAbsent(category, k -> new ArrayList<>()).add(billDetail);
        }
    }
    
    // Set summary totals
    MonthlyBillSummaryDTO.SummaryTotals totals = new MonthlyBillSummaryDTO.SummaryTotals();
    totals.setTotalBills(totalBills);
    totals.setTotalPaid(totalPaid);
    totals.setTotalUnpaid(totalUnpaid);
    totals.setTotalOverdue(totalOverdue);
    totals.setTotalCount(bills.size());
    totals.setPaidCount(paidCount);
    totals.setUnpaidCount(unpaidCount);
    totals.setOverdueCount(overdueCount);
    
    if (totalBills.compareTo(BigDecimal.ZERO) > 0) {
        totals.setPaidPercentage((paidCount * 100.0) / bills.size());
        totals.setUnpaidPercentage((unpaidCount * 100.0) / bills.size());
    }
    
    summary.setTotals(totals);
    summary.setBills(bills);
    summary.setPaidBills(paidBills);
    summary.setUnpaidBills(unpaidBills);
    summary.setOverdueBills(overdueBills);
    
    // Category breakdown
    Map<String, MonthlyBillSummaryDTO.CategoryTotal> categoryBreakdown = new HashMap<>();
    for (Map.Entry<String, List<MonthlyBillSummaryDTO.BillDetail>> entry : categoryMap.entrySet()) {
        BigDecimal categoryTotal = entry.getValue().stream()
                .map(MonthlyBillSummaryDTO.BillDetail::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        int categoryPaidCount = (int) entry.getValue().stream()
                .filter(b -> "PAID".equals(b.getStatus()))
                .count();
        
        int categoryUnpaidCount = (int) entry.getValue().stream()
                .filter(b -> "UNPAID".equals(b.getStatus()))
                .count();
        
        String icon = entry.getValue().get(0).getCategoryIcon();
        
        MonthlyBillSummaryDTO.CategoryTotal categoryTotalObj = new MonthlyBillSummaryDTO.CategoryTotal(
            categoryTotal, entry.getValue().size(), categoryPaidCount, categoryUnpaidCount, icon
        );
        categoryBreakdown.put(entry.getKey(), categoryTotalObj);
    }
    summary.setCategoryBreakdown(categoryBreakdown);
    
    // Compare with previous month
    summary.setPreviousMonthComparison(calculatePreviousMonthComparison(user, year, month));
    
    // Generate insights and recommendations
    generateBillSummaryInsights(summary);
    
    return summary;
}

/**
 * Get bill due date for a specific month
 */
private LocalDate getBillDueDateForMonth(RecurringTransaction bill, int year, int month) {
    LocalDate currentDate = LocalDate.of(year, month, 1);
    LocalDate nextDue = bill.getNextDueDate();
    
    if (nextDue == null) return null;
    
    // Check if due in this month
    if (nextDue.getYear() == year && nextDue.getMonthValue() == month) {
        return nextDue;
    }
    
    // For monthly bills, calculate due date in this month
    if (bill.getFrequency() == Frequency.MONTHLY) {
        int dueDay = nextDue.getDayOfMonth();
        if (dueDay <= currentDate.lengthOfMonth()) {
            return LocalDate.of(year, month, dueDay);
        }
    }
    
    return null;
}

/**
 * Check if a bill has been paid
 */
private boolean isBillPaid(RecurringTransaction bill, LocalDate dueDate, List<Transaction> paidTransactions) {
    return paidTransactions.stream()
            .anyMatch(t -> t.getTransactionDate().equals(dueDate) &&
                          t.getDescription() != null &&
                          t.getDescription().toLowerCase().contains(bill.getName().toLowerCase()));
}

/**
 * Calculate comparison with previous month
 */
private MonthlyBillSummaryDTO.PreviousMonthComparison calculatePreviousMonthComparison(User user, int year, int month) {
    MonthlyBillSummaryDTO.PreviousMonthComparison comparison = new MonthlyBillSummaryDTO.PreviousMonthComparison();
    
    LocalDate currentMonthStart = LocalDate.of(year, month, 1);
    LocalDate previousMonthStart = currentMonthStart.minusMonths(1);
    LocalDate previousMonthEnd = previousMonthStart.withDayOfMonth(previousMonthStart.lengthOfMonth());
    
    // Get previous month's bills
    List<RecurringTransaction> allBills = recurringTransactionRepository.findByUserAndIsActiveTrue(user);
    List<Transaction> previousPaidTransactions = transactionRepository
            .findByUserAndTransactionDateBetween(user, previousMonthStart, previousMonthEnd);
    
    BigDecimal previousTotal = BigDecimal.ZERO;
    int previousBillCount = 0;
    
    for (RecurringTransaction bill : allBills) {
        LocalDate dueDate = getBillDueDateForMonth(bill, previousMonthStart.getYear(), previousMonthStart.getMonthValue());
        if (dueDate != null) {
            previousTotal = previousTotal.add(bill.getAmount());
            previousBillCount++;
        }
    }
    
    // Get current month's total
    LocalDate currentMonthEnd = currentMonthStart.withDayOfMonth(currentMonthStart.lengthOfMonth());
    List<Transaction> currentPaidTransactions = transactionRepository
            .findByUserAndTransactionDateBetween(user, currentMonthStart, currentMonthEnd);
    
    BigDecimal currentTotal = BigDecimal.ZERO;
    int currentBillCount = 0;
    
    for (RecurringTransaction bill : allBills) {
        LocalDate dueDate = getBillDueDateForMonth(bill, year, month);
        if (dueDate != null) {
            currentTotal = currentTotal.add(bill.getAmount());
            currentBillCount++;
        }
    }
    
    comparison.setPreviousTotal(previousTotal);
    comparison.setPreviousBillCount(previousBillCount);
    
    BigDecimal changeAmount = currentTotal.subtract(previousTotal);
    comparison.setChangeAmount(changeAmount);
    
    if (previousTotal.compareTo(BigDecimal.ZERO) > 0) {
        double changePercentage = changeAmount.doubleValue() / previousTotal.doubleValue() * 100;
        comparison.setChangePercentage(Math.round(changePercentage * 10.0) / 10.0);
    }
    
    if (changeAmount.compareTo(BigDecimal.ZERO) > 0) {
        comparison.setTrend("INCREASED");
    } else if (changeAmount.compareTo(BigDecimal.ZERO) < 0) {
        comparison.setTrend("DECREASED");
    } else {
        comparison.setTrend("SAME");
    }
    
    comparison.setBillCountChange(currentBillCount - previousBillCount);
    
    return comparison;
}

/**
 * Generate insights and recommendations for bill summary
 */
private void generateBillSummaryInsights(MonthlyBillSummaryDTO summary) {
    StringBuilder insight = new StringBuilder();
    List<String> recommendations = new ArrayList<>();
    
    MonthlyBillSummaryDTO.SummaryTotals totals = summary.getTotals();
    
    // Payment status insight
    if (totals.getPaidCount() == totals.getTotalCount()) {
        insight.append("✅ Excellent! You've paid all your bills for this month. ");
    } else if (totals.getOverdueCount() > 0) {
        insight.append(String.format("⚠️ You have %d overdue bill(s) totaling ₹%s. ",
            totals.getOverdueCount(), totals.getTotalOverdue().toPlainString()));
        recommendations.add("Pay overdue bills immediately to avoid late fees");
    } else if (totals.getUnpaidCount() > 0) {
        insight.append(String.format("📅 You have %d upcoming bill(s) totaling ₹%s due this month. ",
            totals.getUnpaidCount(), totals.getTotalUnpaid().toPlainString()));
        recommendations.add("Set up reminders for upcoming bills");
    }
    
    // Category insights
    if (summary.getCategoryBreakdown() != null) {
        String topCategory = summary.getCategoryBreakdown().entrySet().stream()
                .max(Map.Entry.comparingByValue(
                    Comparator.comparing(MonthlyBillSummaryDTO.CategoryTotal::getTotalAmount)))
                .map(Map.Entry::getKey)
                .orElse(null);
        
        if (topCategory != null) {
            insight.append(String.format("Your highest bill category is %s. ", topCategory));
        }
    }
    
    // Month-over-month comparison
    if (summary.getPreviousMonthComparison() != null) {
        MonthlyBillSummaryDTO.PreviousMonthComparison comparison = summary.getPreviousMonthComparison();
        
        if ("INCREASED".equals(comparison.getTrend())) {
            insight.append(String.format("Bill total increased by %.1f%% compared to last month. ",
                comparison.getChangePercentage()));
            recommendations.add("Review your bills to identify any unexpected increases");
        } else if ("DECREASED".equals(comparison.getTrend())) {
            insight.append(String.format("Great! Bill total decreased by %.1f%% compared to last month. ",
                Math.abs(comparison.getChangePercentage())));
        }
    }
    
    // Add general recommendations
    if (totals.getUnpaidCount() > 0) {
        recommendations.add("Schedule payments for pending bills");
    }
    
    if (totals.getPaidPercentage() < 50) {
        recommendations.add("Set up auto-pay for recurring bills to avoid missing payments");
    }
    
    if (recommendations.isEmpty()) {
        recommendations.add("Keep up the good work with your bill payments!");
        recommendations.add("Review your bills periodically to identify potential savings");
    }
    
    summary.setInsight(insight.toString());
    summary.setRecommendations(recommendations);
}

/**
 * Get bill history for the user
 * @param userId User ID
 * @param months Number of months to look back (default 12)
 * @return BillHistoryDTO with historical bill data
 */
public BillHistoryDTO getBillHistory(Long userId, int months) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
    
    BillHistoryDTO history = new BillHistoryDTO();
    List<BillHistoryDTO.HistoricalBill> historicalBills = new ArrayList<>();
    Map<String, BillHistoryDTO.YearlySummary> yearlySummaries = new LinkedHashMap<>();
    Map<LocalDate, BillHistoryDTO.PaymentTimeline> paymentTimelineMap = new LinkedHashMap<>();
    
    LocalDate endDate = LocalDate.now();
    LocalDate startDate = endDate.minusMonths(months);
    
    // Get all recurring bills
    List<RecurringTransaction> allBills = recurringTransactionRepository
            .findByUserAndIsActiveTrue(user);
    
    // Get all paid transactions in the period
    List<Transaction> paidTransactions = transactionRepository
            .findByUserAndTransactionDateBetween(user, startDate, endDate);
    
    // Create a map of paid transactions by date and description
    Map<String, List<Transaction>> paidTransactionsMap = paidTransactions.stream()
            .collect(Collectors.groupingBy(t -> 
                t.getTransactionDate().toString() + "|" + 
                (t.getDescription() != null ? t.getDescription().toLowerCase().trim() : "")));
    
    BigDecimal totalSpentAllTime = BigDecimal.ZERO;
    BigDecimal highestBill = BigDecimal.ZERO;
    String highestBillName = "";
    LocalDate highestBillDate = null;
    Map<String, Integer> categoryPaidCount = new HashMap<>();
    Map<String, Integer> categoryMissedCount = new HashMap<>();
    int consecutiveOnTime = 0;
    int currentStreak = 0;
    LocalDate lastPaidDate = null;
    
    // Track monthly totals for best/worst month
    Map<String, BigDecimal> monthlyTotals = new HashMap<>();
    
    // Process each month in the period
    for (int i = 0; i < months; i++) {
        LocalDate monthStart = startDate.plusMonths(i);
        LocalDate monthEnd = monthStart.withDayOfMonth(monthStart.lengthOfMonth());
        String monthKey = monthStart.getYear() + "-" + String.format("%02d", monthStart.getMonthValue());
        
        BigDecimal monthTotal = BigDecimal.ZERO;
        int monthPaidCount = 0;
        int monthMissedCount = 0;
        
        for (RecurringTransaction bill : allBills) {
            LocalDate dueDate = getBillDueDateForMonth(bill, monthStart.getYear(), monthStart.getMonthValue());
            
            if (dueDate != null && !dueDate.isBefore(monthStart) && !dueDate.isAfter(monthEnd)) {
                BillHistoryDTO.HistoricalBill historicalBill = new BillHistoryDTO.HistoricalBill();
                historicalBill.setBillId(bill.getRecurringId());
                historicalBill.setName(bill.getName());
                historicalBill.setAmount(bill.getAmount());
                historicalBill.setDueDate(dueDate);
                historicalBill.setCategory(bill.getCategory() != null ? bill.getCategory().getName() : "Other");
                historicalBill.setCategoryIcon(bill.getCategory() != null ? bill.getCategory().getIcon() : "📄");
                historicalBill.setFrequency(bill.getFrequency().toString());
                
                // Check if paid
                boolean isPaid = isBillPaidInPeriod(bill, dueDate, paidTransactions);
                
                if (isPaid) {
                    historicalBill.setStatus("PAID");
                    historicalBill.setPaidDate(dueDate);
                    totalSpentAllTime = totalSpentAllTime.add(bill.getAmount());
                    monthPaidCount++;
                    monthTotal = monthTotal.add(bill.getAmount());
                    
                    // Track highest bill
                    if (bill.getAmount().compareTo(highestBill) > 0) {
                        highestBill = bill.getAmount();
                        highestBillName = bill.getName();
                        highestBillDate = dueDate;
                    }
                    
                    // Update category paid count
                    String category = historicalBill.getCategory();
                    categoryPaidCount.put(category, categoryPaidCount.getOrDefault(category, 0) + 1);
                    
                    // Check consecutive on-time payments
                    LocalDate today = LocalDate.now();
                    if (!dueDate.isAfter(today)) {
                        if (lastPaidDate == null || dueDate.equals(lastPaidDate.plusMonths(1))) {
                            currentStreak++;
                        } else {
                            currentStreak = 1;
                        }
                        lastPaidDate = dueDate;
                        consecutiveOnTime = Math.max(consecutiveOnTime, currentStreak);
                    }
                } else {
                    historicalBill.setStatus("MISSED");
                    monthMissedCount++;
                    
                    // Calculate days late if due date is in the past
                    if (dueDate.isBefore(LocalDate.now())) {
                        historicalBill.setDaysLate((int) ChronoUnit.DAYS.between(dueDate, LocalDate.now()));
                        categoryMissedCount.put(historicalBill.getCategory(), 
                            categoryMissedCount.getOrDefault(historicalBill.getCategory(), 0) + 1);
                    }
                }
                
                historicalBills.add(historicalBill);
            }
        }
        
        // Track monthly totals for best/worst month
        monthlyTotals.put(monthKey, monthTotal);
        
        // Update yearly summary
        int year = monthStart.getYear();
   // Replace the computeIfAbsent block:
yearlySummaries.computeIfAbsent(String.valueOf(year), k -> {
    BillHistoryDTO.YearlySummary ys = new BillHistoryDTO.YearlySummary();
    ys.setYear(year);
    ys.setCategoryBreakdown(new HashMap<>());
    return ys;
});
        
        BillHistoryDTO.YearlySummary yearSummary = yearlySummaries.get(String.valueOf(year));
        yearSummary.setTotalBills(yearSummary.getTotalBills() != null ? 
            yearSummary.getTotalBills().add(monthTotal) : monthTotal);
        yearSummary.setTotalCount(yearSummary.getTotalCount() + monthPaidCount + monthMissedCount);
        yearSummary.setPaidCount(yearSummary.getPaidCount() + monthPaidCount);
        yearSummary.setMissedCount(yearSummary.getMissedCount() + monthMissedCount);
    }
    
    // Set statistics
    BillHistoryDTO.HistoryStatistics statistics = new BillHistoryDTO.HistoryStatistics();
    statistics.setTotalSpentAllTime(totalSpentAllTime);
    statistics.setAverageMonthlyBill(months > 0 ? totalSpentAllTime.divide(BigDecimal.valueOf(months), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO);
    statistics.setHighestBill(highestBill);
    statistics.setHighestBillName(highestBillName);
    statistics.setHighestBillDate(highestBillDate);
    statistics.setConsecutiveOnTimePayments(consecutiveOnTime);
statistics.setTotalBillsPaid((int) historicalBills.stream().filter(b -> "PAID".equals(b.getStatus())).count());
statistics.setTotalBillsMissed((int) historicalBills.stream().filter(b -> "MISSED".equals(b.getStatus())).count());
    
    long totalBills = statistics.getTotalBillsPaid() + statistics.getTotalBillsMissed();
    if (totalBills > 0) {
        statistics.setOnTimePaymentRate((statistics.getTotalBillsPaid() * 100.0) / totalBills);
    }
    
    // Find most paid and most missed categories
    statistics.setMostPaidCategory(categoryPaidCount.entrySet().stream()
        .max(Map.Entry.comparingByValue())
        .map(Map.Entry::getKey)
        .orElse("N/A"));
    
    statistics.setMostMissedCategory(categoryMissedCount.entrySet().stream()
        .max(Map.Entry.comparingByValue())
        .map(Map.Entry::getKey)
        .orElse("N/A"));
    
    // Find best and worst months
    statistics.setBestMonth(monthlyTotals.entrySet().stream()
        .min(Map.Entry.comparingByValue())
        .map(Map.Entry::getKey)
        .orElse("N/A"));
    
    statistics.setWorstMonth(monthlyTotals.entrySet().stream()
        .max(Map.Entry.comparingByValue())
        .map(Map.Entry::getKey)
        .orElse("N/A"));
    
    history.setStatistics(statistics);
    history.setBills(historicalBills);
    
    // Set yearly summaries
    Map<String, BillHistoryDTO.YearlySummary> finalYearlySummaries = new LinkedHashMap<>();
    yearlySummaries.entrySet().stream()
        .sorted(Map.Entry.<String, BillHistoryDTO.YearlySummary>comparingByKey().reversed())
        .forEach(entry -> {
            BillHistoryDTO.YearlySummary ys = entry.getValue();
            if (ys.getTotalCount() > 0) {
                ys.setOnTimePercentage((ys.getPaidCount() * 100.0) / ys.getTotalCount());
            }
            finalYearlySummaries.put(entry.getKey(), ys);
        });
    history.setYearlySummaries(finalYearlySummaries);
    
    // Generate payment timeline
    List<BillHistoryDTO.PaymentTimeline> paymentTimeline = generatePaymentTimeline(paidTransactions, startDate, endDate);
    history.setPaymentTimeline(paymentTimeline);
    
    // Generate insights
    history.setInsights(generateBillHistoryInsights(statistics));
    
    return history;
}

/**
 * Check if a bill was paid in the given period
 */
private boolean isBillPaidInPeriod(RecurringTransaction bill, LocalDate dueDate, List<Transaction> paidTransactions) {
    return paidTransactions.stream()
            .anyMatch(t -> t.getTransactionDate().equals(dueDate) &&
                          t.getDescription() != null &&
                          t.getDescription().toLowerCase().contains(bill.getName().toLowerCase()));
}

/**
 * Generate payment timeline from transactions
 */
private List<BillHistoryDTO.PaymentTimeline> generatePaymentTimeline(List<Transaction> transactions, 
                                                                       LocalDate startDate, 
                                                                       LocalDate endDate) {
    Map<LocalDate, List<Transaction>> transactionsByDate = transactions.stream()
            .collect(Collectors.groupingBy(Transaction::getTransactionDate));
    
    List<BillHistoryDTO.PaymentTimeline> timeline = new ArrayList<>();
    
    LocalDate currentDate = startDate;
    while (!currentDate.isAfter(endDate)) {
        if (transactionsByDate.containsKey(currentDate)) {
            List<Transaction> dayTransactions = transactionsByDate.get(currentDate);
            BigDecimal dayTotal = dayTransactions.stream()
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            BillHistoryDTO.PaymentTimeline point = new BillHistoryDTO.PaymentTimeline();
            point.setDate(currentDate);
            point.setAmount(dayTotal);
            point.setBillsPaid(dayTransactions.size());
            point.setBillNames(dayTransactions.stream()
                    .map(Transaction::getDescription)
                    .limit(3)
                    .collect(Collectors.toList()));
            
            timeline.add(point);
        }
        currentDate = currentDate.plusDays(1);
    }
    
    return timeline;
}

/**
 * Generate insights from bill history statistics
 */
private List<String> generateBillHistoryInsights(BillHistoryDTO.HistoryStatistics statistics) {
    List<String> insights = new ArrayList<>();
    
    // Payment consistency insight
    if (statistics.getOnTimePaymentRate() >= 90) {
        insights.add("🎯 Excellent payment history! You've paid " + 
            String.format("%.1f", statistics.getOnTimePaymentRate()) + 
            "% of your bills on time.");
    } else if (statistics.getOnTimePaymentRate() >= 70) {
        insights.add("📊 Good payment consistency. You've paid " + 
            String.format("%.1f", statistics.getOnTimePaymentRate()) + 
            "% of your bills on time. Try to improve further.");
    } else {
        insights.add("⚠️ Your on-time payment rate is " + 
            String.format("%.1f", statistics.getOnTimePaymentRate()) + 
            "%. Consider setting up auto-pay for recurring bills.");
    }
    
    // Consecutive payments insight
    if (statistics.getConsecutiveOnTimePayments() >= 6) {
        insights.add("🔥 Impressive! You've made " + 
            statistics.getConsecutiveOnTimePayments() + 
            " consecutive on-time payments.");
    }
    
    // Highest bill insight
    if (statistics.getHighestBill().compareTo(BigDecimal.ZERO) > 0) {
        insights.add("💰 Your highest bill was " + statistics.getHighestBillName() + 
            " on " + statistics.getHighestBillDate() + 
            " for ₹" + statistics.getHighestBill().toPlainString());
    }
    
    // Category insights
    if (!"N/A".equals(statistics.getMostPaidCategory())) {
        insights.add("📂 You've paid the most bills in the " + 
            statistics.getMostPaidCategory() + " category.");
    }
    
    if (!"N/A".equals(statistics.getMostMissedCategory())) {
        insights.add("⚠️ You've missed the most payments in the " + 
            statistics.getMostMissedCategory() + " category. Consider setting up reminders.");
    }
    
    // Monthly insights
    if (!"N/A".equals(statistics.getBestMonth())) {
        insights.add("📅 Your best month (lowest bills) was " + statistics.getBestMonth());
    }
    
    if (!"N/A".equals(statistics.getWorstMonth())) {
        insights.add("📈 Your highest spending month was " + statistics.getWorstMonth());
    }
    
    // Average monthly insight
    if (statistics.getAverageMonthlyBill().compareTo(BigDecimal.ZERO) > 0) {
        insights.add("📊 Your average monthly bill amount is ₹" + 
            statistics.getAverageMonthlyBill().toPlainString());
    }
    
    return insights;
}

}
