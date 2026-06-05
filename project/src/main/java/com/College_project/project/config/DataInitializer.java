package com.College_project.project.config;

import com.College_project.project.models.*;
import com.College_project.project.repository.*;
import com.College_project.project.service.TransactionService;
import com.College_project.project.DTOs.TransactionRequest;
import com.College_project.project.enums.TransactionType;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository, 
                                 bankAccountRepository bankAccountRepository,
                                 transactionRepository transactionRepository,
                                 CategoryRepository categoryRepository,
                                 TransactionService transactionService) {
        return args -> {
            try {
                List<User> users = userRepository.findAll();
                if (users.isEmpty()) {
                    System.out.println("No users found to seed transactions.");
                    return;
                }

                User user = users.get(0);
                List<BankAccount> accounts = bankAccountRepository.findByUser(user);
                if (accounts.isEmpty()) {
                    System.out.println("No bank accounts found for user: " + user.getName());
                    return;
                }

                BankAccount account = accounts.get(0);
                
                long count = transactionRepository.countByUser(user.getUserId());
                if (count < 10) {
                    System.out.println("========== SEEDING TEST DATA ==========");
                    System.out.println("User: " + user.getName() + " currently has " + count + " transactions.");
                    System.out.println("Adding sample transactions to enable AI predictions...");
                    
                    // Fetch or identify some categories
                    Category food = getCategory(categoryRepository, "Food");
                    Category salary = getCategory(categoryRepository, "Salary");
                    Category rent = getCategory(categoryRepository, "Rent");
                    Category shopping = getCategory(categoryRepository, "Shopping");

                    // Add transactions via service to keep balance in sync
                    seedTransaction(transactionService, user.getUserId(), account.getAccountId(), "Monthly Salary", new BigDecimal("60000"), TransactionType.INCOME, LocalDate.now().minusMonths(1), salary);
                    seedTransaction(transactionService, user.getUserId(), account.getAccountId(), "Freelance Project", new BigDecimal("8500"), TransactionType.INCOME, LocalDate.now().minusDays(15), salary);
                    
                    seedTransaction(transactionService, user.getUserId(), account.getAccountId(), "Home Rent", new BigDecimal("12000"), TransactionType.EXPENSE, LocalDate.now().minusDays(28), rent);
                    seedTransaction(transactionService, user.getUserId(), account.getAccountId(), "Electric Bill", new BigDecimal("2400"), TransactionType.EXPENSE, LocalDate.now().minusDays(20), rent);
                    
                    // Add several varied food/shopping expenses to create a pattern
                    for (int i = 1; i <= 10; i++) {
                        BigDecimal amount = new BigDecimal(300 + (i * 50));
                        seedTransaction(transactionService, user.getUserId(), account.getAccountId(), "Grocery Store #" + i, amount, TransactionType.EXPENSE, LocalDate.now().minusDays(i * 2), food);
                    }
                    
                    seedTransaction(transactionService, user.getUserId(), account.getAccountId(), "Weekend Shopping", new BigDecimal("4500"), TransactionType.EXPENSE, LocalDate.now().minusDays(3), shopping);
                    seedTransaction(transactionService, user.getUserId(), account.getAccountId(), "Coffee House", new BigDecimal("150"), TransactionType.EXPENSE, LocalDate.now().minusDays(1), food);
                    
                    System.out.println("Seeding complete. User now has enough data for AI predictions.");
                    System.out.println("========================================");
                }
            } catch (Exception e) {
                System.err.println("Error during data seeding: " + e.getMessage());
            }
        };
    }

    private Category getCategory(CategoryRepository repo, String name) {
        List<Category> cats = repo.findByNameIgnoreCase(name);
        if (cats.isEmpty()) {
            // Fallback: just get the first one if name doesn't match
            List<Category> all = repo.findAll();
            return all.isEmpty() ? null : all.get(0);
        }
        return cats.get(0);
    }

    private void seedTransaction(TransactionService service, Long userId, Long accountId, String desc, BigDecimal amount, TransactionType type, LocalDate date, Category cat) {
        TransactionRequest req = new TransactionRequest();
        req.setAmount(amount);
        req.setDescription(desc);
        req.setType(type);
        req.setTransactionDate(date);
        if (cat != null) req.setCategoryId(cat.getCategoryId());
        
        try {
            service.addTransaction(userId, accountId, req);
        } catch (Exception e) {
            // Silently fail or log
        }
    }
}
