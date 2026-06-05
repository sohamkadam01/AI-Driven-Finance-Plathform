package com.College_project.project.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.College_project.project.enums.TransactionType;
import com.College_project.project.models.Category;
import com.College_project.project.models.Transaction;
import com.College_project.project.models.User;

@Repository
public interface transactionRepository extends JpaRepository<Transaction, Long> {
    
    // Basic find methods
    List<Transaction> findByUser(User user);
    
    // Ensures the latest transactions are fetched first by default
    Page<Transaction> findByUserOrderByTransactionDateDescCreatedAtDesc(User user, Pageable pageable);

    Page<Transaction> findByUser(User user, Pageable pageable);  // ← ADD THIS LINE
    List<Transaction> findByUserAndTransactionDateBetween(User user, LocalDate startDate, LocalDate endDate);
    List<Transaction> findByUserAndType(User user, TransactionType type);
    
    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user = :user AND t.type = :type AND t.transactionDate BETWEEN :startDate AND :endDate")
    BigDecimal sumAmountByUserAndTypeAndDateRange(@Param("user") User user, 
                                                   @Param("type") TransactionType type, 
                                                   @Param("startDate") LocalDate startDate, 
                                                   @Param("endDate") LocalDate endDate);
    
    @Query("SELECT t FROM Transaction t WHERE t.user = :user AND t.isFlagged = true")
    List<Transaction> findFlaggedTransactions(@Param("user") User user);
    
    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user = :user AND t.category = :category AND t.type = :type AND t.transactionDate BETWEEN :startDate AND :endDate")
    BigDecimal sumAmountByUserAndCategoryAndDateRange(@Param("user") User user,
                                                       @Param("category") Category category,
                                                       @Param("type") TransactionType type,
                                                       @Param("startDate") LocalDate startDate,
                                                       @Param("endDate") LocalDate endDate);
    
    // Anomaly detection methods
    List<Transaction> findByUserAndCreatedAtAfter(User user, LocalDateTime dateTime);
    List<Transaction> findByTransactionDateAfter(LocalDate date);
    List<Transaction> findByUserAndTransactionDateBetweenOrderByTransactionDateDesc(User user, LocalDate startDate, LocalDate endDate);
    List<Transaction> findTop10ByUserOrderByCreatedAtDesc(User user);
    List<Transaction> findByUserAndAmountGreaterThan(User user, BigDecimal amount);
    long countByUserAndCreatedAtAfter(User user, LocalDateTime dateTime);
    
    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.user.userId = :userId")
    long countByUser(@Param("userId") Long userId);
    
    // Advanced filtering with pagination
    @Query("SELECT t FROM Transaction t LEFT JOIN t.category c LEFT JOIN t.bankAccount b WHERE t.user = :user " +
           "AND (:search IS NULL OR :search = '' OR LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:type IS NULL OR t.type = :type) " +
           "AND (:categoryId IS NULL OR c.categoryId = :categoryId) " +
           "AND (:startDate IS NULL OR t.transactionDate >= :startDate) " +
           "AND (:endDate IS NULL OR t.transactionDate <= :endDate) " +
           "AND (:accountId IS NULL OR b.accountId = :accountId) " +
           "AND (:minAmount IS NULL OR t.amount >= :minAmount) " +
           "AND (:maxAmount IS NULL OR t.amount <= :maxAmount)")
    Page<Transaction> findTransactionsWithFilters(
            @Param("user") User user,
            @Param("search") String search,
            @Param("type") TransactionType type,
            @Param("categoryId") Long categoryId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("accountId") Long accountId,
            @Param("minAmount") BigDecimal minAmount,
            @Param("maxAmount") BigDecimal maxAmount,
            Pageable pageable);
    
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t LEFT JOIN t.category c WHERE t.user = :user " +
           "AND t.type = 'INCOME' " +
           "AND (:search IS NULL OR LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:categoryId IS NULL OR c.categoryId = :categoryId) " +
           "AND (:startDate IS NULL OR t.transactionDate >= :startDate) " +
           "AND (:endDate IS NULL OR t.transactionDate <= :endDate)")
    BigDecimal getTotalIncomeForFilters(
            @Param("user") User user,
            @Param("search") String search,
            @Param("categoryId") Long categoryId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
    
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t LEFT JOIN t.category c WHERE t.user = :user " +
           "AND t.type = 'EXPENSE' " +
           "AND (:search IS NULL OR LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:categoryId IS NULL OR c.categoryId = :categoryId) " +
           "AND (:startDate IS NULL OR t.transactionDate >= :startDate) " +
           "AND (:endDate IS NULL OR t.transactionDate <= :endDate)")
    BigDecimal getTotalExpenseForFilters(
            @Param("user") User user,
            @Param("search") String search,
            @Param("categoryId") Long categoryId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
    
    @Query("SELECT COALESCE(c.name, 'Uncategorized'), COUNT(t) FROM Transaction t LEFT JOIN t.category c WHERE t.user = :user " +
           "AND t.type = 'EXPENSE' " +
           "AND (:search IS NULL OR LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:startDate IS NULL OR t.transactionDate >= :startDate) " +
           "AND (:endDate IS NULL OR t.transactionDate <= :endDate) " +
           "GROUP BY COALESCE(c.name, 'Uncategorized') ORDER BY COUNT(t) DESC")
    List<Object[]> getMostCommonCategory(
            @Param("user") User user,
            @Param("search") String search,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
