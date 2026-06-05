package com.College_project.project.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.College_project.project.models.BankAccount;
import com.College_project.project.models.User;

@Repository
public interface bankAccountRepository extends JpaRepository<BankAccount, Long> {
    
    List<BankAccount> findByUser(User user);
    
    List<BankAccount> findByUserAndIsActive(User user, boolean isActive);
    
    // ✅ ADD THIS METHOD - Find by user ID
    List<BankAccount> findByUser_UserId(Long userId);
}