package com.College_project.project.controller;

import com.College_project.project.DTOs.BankAccountRequest;
import com.College_project.project.DTOs.BankAccountResponse;
import com.College_project.project.service.BankAccountService;
import com.College_project.project.security.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/accounts")
public class BankAccountController {
    
    @Autowired
    private BankAccountService bankAccountService;
    
    @PostMapping("/add")
    public ResponseEntity<?> addBankAccount(@Valid @RequestBody BankAccountRequest request,
                                            Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        BankAccountResponse response = bankAccountService.addBankAccount(userDetails.getId(), request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/my-accounts")
    public ResponseEntity<?> getMyAccounts(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<BankAccountResponse> accounts = bankAccountService.getUserBankAccounts(userDetails.getId());
        return ResponseEntity.ok(accounts);
    }
    
    @DeleteMapping("/{accountId}")
    public ResponseEntity<?> deleteAccount(@PathVariable Long accountId,
                                          Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        bankAccountService.deleteBankAccount(accountId, userDetails.getId());
        return ResponseEntity.ok("Account deleted successfully");
    }
}