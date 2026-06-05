package com.College_project.project.repository;


import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.College_project.project.enums.InvestmentType;
import com.College_project.project.models.Investment;
import com.College_project.project.models.User;

@Repository
public interface investmentRepository extends JpaRepository<Investment, Long> {
    List<Investment> findByUser(User user);
    // Find all investments for a user
    
    // Find investments by user and type
    List<Investment> findByUserAndType(User user, InvestmentType type);
    
    // Find investments by user ordered by purchase date
    List<Investment> findByUserOrderByPurchaseDateDesc(User user);
    
    // Calculate total invested amount for a user
    @Query("SELECT SUM(i.amountInvested) FROM Investment i WHERE i.user = :user")
    BigDecimal sumAmountInvestedByUser(@Param("user") User user);
    
    // Calculate total current value for a user
    @Query("SELECT SUM(i.currentValue) FROM Investment i WHERE i.user = :user")
    BigDecimal sumCurrentValueByUser(@Param("user") User user);
    
    // Find top performing investments (highest returns)
    @Query("SELECT i FROM Investment i WHERE i.user = :user ORDER BY i.returns DESC")
    List<Investment> findTopPerformingInvestments(@Param("user") User user);
    
    // Find investments with negative returns
    @Query("SELECT i FROM Investment i WHERE i.user = :user AND i.currentValue < i.amountInvested")
    List<Investment> findUnderperformingInvestments(@Param("user") User user);
    
    // Count investments by type for a user
    @Query("SELECT i.type, COUNT(i) FROM Investment i WHERE i.user = :user GROUP BY i.type")
    List<Object[]> countByTypeForUser(@Param("user") User user);
}