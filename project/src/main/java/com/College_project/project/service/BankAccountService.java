package com.College_project.project.service;

import com.College_project.project.DTOs.BankAccountRequest;
import com.College_project.project.DTOs.BankAccountResponse;
import com.College_project.project.models.BankAccount;
import com.College_project.project.models.User;
import com.College_project.project.repository.bankAccountRepository;
import com.College_project.project.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BankAccountService {
    
    @Autowired
    private bankAccountRepository bankAccountRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Transactional
    public BankAccountResponse addBankAccount(Long userId, BankAccountRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        BankAccount account = new BankAccount();
        account.setUser(user);
        account.setBankName(request.getBankName());
        account.setAccountNumber(request.getAccountNumber());
        account.setAccountType(request.getAccountType());
        account.setCurrentBalance(request.getCurrentBalance());
        account.setCurrency(request.getCurrency());
        account.setActive(true);
        account.setLinkedDate(LocalDateTime.now());
        account.setLastSyncedAt(LocalDateTime.now());
        
        BankAccount savedAccount = bankAccountRepository.save(account);
        
        return new BankAccountResponse(
            savedAccount.getAccountId(),
            savedAccount.getBankName(),
            savedAccount.getAccountNumber(),
            savedAccount.getAccountType(),
            savedAccount.getCurrentBalance(),
            savedAccount.getCurrency(),
            savedAccount.getLinkedDate(),
            savedAccount.isActive()
        );
    }
    
    public List<BankAccountResponse> getUserBankAccounts(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return bankAccountRepository.findByUser(user).stream()
                .map(account -> new BankAccountResponse(
                    account.getAccountId(),
                    account.getBankName(),
                    account.getAccountNumber(),
                    account.getAccountType(),
                    account.getCurrentBalance(),
                    account.getCurrency(),
                    account.getLinkedDate(),
                    account.isActive()
                ))
                .collect(Collectors.toList());
    }
    
    public BankAccount getBankAccountById(Long accountId, Long userId) {
        return bankAccountRepository.findById(accountId)
                .filter(account -> account.getUser().getUserId().equals(userId))
                .orElseThrow(() -> new RuntimeException("Account not found"));
    }
    
    @Transactional
    public void updateBalance(Long accountId, Long userId, java.math.BigDecimal newBalance) {
        BankAccount account = getBankAccountById(accountId, userId);
        account.setCurrentBalance(newBalance);
        account.setLastSyncedAt(LocalDateTime.now());
        bankAccountRepository.save(account);
    }
    
    @Transactional
    public void deleteBankAccount(Long accountId, Long userId) {
        BankAccount account = getBankAccountById(accountId, userId);
        account.setActive(false); // Soft delete
        bankAccountRepository.save(account);
    }
}