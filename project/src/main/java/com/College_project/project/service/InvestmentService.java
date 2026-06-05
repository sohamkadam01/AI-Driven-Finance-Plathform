package com.College_project.project.service;

import com.College_project.project.DTOs.InvestmentRequest;
import com.College_project.project.DTOs.InvestmentResponse;
import com.College_project.project.enums.AlertType;
import com.College_project.project.enums.TransactionType;
import com.College_project.project.models.BankAccount;
import com.College_project.project.models.Investment;
import com.College_project.project.models.Transaction;
import com.College_project.project.models.User;
import com.College_project.project.repository.bankAccountRepository;
import com.College_project.project.repository.investmentRepository;
import com.College_project.project.repository.transactionRepository;
import com.College_project.project.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InvestmentService {
    
    @Autowired
    private investmentRepository investmentRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private bankAccountRepository bankAccountRepository;
    
    @Autowired
    private transactionRepository transactionRepository;

    @Autowired
    private AlertService alertService;
    
    @Transactional
    public InvestmentResponse addInvestment(Long userId, InvestmentRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // ✅ Get the bank account
        BankAccount bankAccount = bankAccountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new RuntimeException("Bank account not found with id: " + request.getAccountId()));
        
        // ✅ Verify account belongs to user
        if (!bankAccount.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized: Account does not belong to user");
        }
        
        // ✅ Check if user has sufficient balance
        if (bankAccount.getCurrentBalance().compareTo(request.getAmountInvested()) < 0) {
            throw new RuntimeException("Insufficient balance in account: " + bankAccount.getBankName() + 
                                       ". Available: ₹" + bankAccount.getCurrentBalance() + 
                                       ", Required: ₹" + request.getAmountInvested());
        }
        
        // ✅ Deduct amount from bank account
        bankAccount.setCurrentBalance(bankAccount.getCurrentBalance().subtract(request.getAmountInvested()));
        bankAccount.setLastSyncedAt(LocalDateTime.now());
        bankAccountRepository.save(bankAccount);
        
        // ✅ Create investment record
        Investment investment = new Investment();
        investment.setUser(user);
        investment.setName(request.getName());
        investment.setType(request.getType());
        investment.setAmountInvested(request.getAmountInvested());
        investment.setCurrentValue(request.getCurrentValue() != null ? 
                                  request.getCurrentValue() : request.getAmountInvested());
        investment.setPurchaseDate(request.getPurchaseDate());
        investment.setSymbol(request.getSymbol());
        investment.setQuantity(request.getQuantity());
        investment.setAccountId(request.getAccountId()); // Store which account was used
        investment.setCreatedAt(LocalDateTime.now());
        
        // Calculate returns percentage
        if (investment.getCurrentValue().compareTo(investment.getAmountInvested()) > 0) {
            BigDecimal profit = investment.getCurrentValue().subtract(investment.getAmountInvested());
            BigDecimal returns = profit.multiply(new BigDecimal("100"))
                    .divide(investment.getAmountInvested(), 2, java.math.RoundingMode.HALF_UP);
            investment.setReturns(returns);
        } else {
            investment.setReturns(BigDecimal.ZERO);
        }
        
        Investment saved = investmentRepository.save(investment);
        
        // ✅ Create a transaction record for this investment
        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setBankAccount(bankAccount);
        transaction.setAmount(request.getAmountInvested());
        transaction.setType(TransactionType.INVESTMENT);
        transaction.setDescription("Investment: " + request.getName() + " (" + request.getType() + ")");
        transaction.setTransactionDate(request.getPurchaseDate());
        transaction.setCreatedAt(LocalDateTime.now());
        transaction.setStatus("COMPLETED");
        transaction.setFlagged(false);
        transactionRepository.save(transaction);

        alertService.createAlert(
                user,
                AlertType.INVESTMENT_UPDATE,
                "Investment added: " + saved.getName() + " for Rs " + saved.getAmountInvested(),
                "/investments");
        
        System.out.println("✅ Investment added: " + saved.getName() + 
                           " | Amount: ₹" + saved.getAmountInvested() +
                           " | Account: " + bankAccount.getBankName() +
                           " | New Balance: ₹" + bankAccount.getCurrentBalance());
        
        return new InvestmentResponse(
            saved.getInvestmentId(),
            saved.getName(),
            saved.getType(),
            saved.getAmountInvested(),
            saved.getCurrentValue(),
            saved.getPurchaseDate(),
            saved.getSymbol(),
            saved.getQuantity(),
            saved.getCreatedAt()
        );
    }
    
    public List<InvestmentResponse> getUserInvestments(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return investmentRepository.findByUser(user).stream()
                .map(inv -> new InvestmentResponse(
                    inv.getInvestmentId(),
                    inv.getName(),
                    inv.getType(),
                    inv.getAmountInvested(),
                    inv.getCurrentValue(),
                    inv.getPurchaseDate(),
                    inv.getSymbol(),
                    inv.getQuantity(),
                    inv.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }
    
    public InvestmentResponse getInvestmentSummary(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Investment> investments = investmentRepository.findByUser(user);
        
        BigDecimal totalInvested = investments.stream()
                .map(Investment::getAmountInvested)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalCurrentValue = investments.stream()
                .map(Investment::getCurrentValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return new InvestmentResponse(
            null, "Portfolio Summary", null,
            totalInvested, totalCurrentValue,
            null, null, null, null
        );
    }
    
    @Transactional
    public InvestmentResponse updateInvestmentValue(Long investmentId, Long userId, BigDecimal newValue) {
        Investment investment = investmentRepository.findById(investmentId)
                .orElseThrow(() -> new RuntimeException("Investment not found"));
        
        if (!investment.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        investment.setCurrentValue(newValue);
        
        // Recalculate returns
        if (newValue.compareTo(investment.getAmountInvested()) > 0) {
            BigDecimal profit = newValue.subtract(investment.getAmountInvested());
            BigDecimal returns = profit.multiply(new BigDecimal("100"))
                    .divide(investment.getAmountInvested(), 2, java.math.RoundingMode.HALF_UP);
            investment.setReturns(returns);
        } else {
            investment.setReturns(BigDecimal.ZERO);
        }
        
        investment.setUpdatedAt(LocalDateTime.now());
        Investment updated = investmentRepository.save(investment);

        alertService.createAlert(
                investment.getUser(),
                AlertType.INVESTMENT_UPDATE,
                "Investment value updated: " + updated.getName() + " is now Rs " + updated.getCurrentValue(),
                "/investments");
        
        return new InvestmentResponse(
            updated.getInvestmentId(),
            updated.getName(),
            updated.getType(),
            updated.getAmountInvested(),
            updated.getCurrentValue(),
            updated.getPurchaseDate(),
            updated.getSymbol(),
            updated.getQuantity(),
            updated.getCreatedAt()
        );
    }
    
    @Transactional
    public void deleteInvestment(Long investmentId, Long userId) {
        Investment investment = investmentRepository.findById(investmentId)
                .orElseThrow(() -> new RuntimeException("Investment not found"));
        
        if (!investment.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        // Note: Deleting investment does NOT add money back to bank account
        // This prevents fraud (user can't delete to get money back)
        investmentRepository.delete(investment);
    }
}
