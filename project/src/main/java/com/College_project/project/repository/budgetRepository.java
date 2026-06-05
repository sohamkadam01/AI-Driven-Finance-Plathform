package com.College_project.project.repository;



import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.College_project.project.models.Budget;
import com.College_project.project.models.User;

@Repository
public interface budgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUser(User user);
    List<Budget> findByUserAndMonth(User user, LocalDate month);
Optional<Budget> findByUserAndCategory_CategoryIdAndMonth(
    User user,
    Long categoryId,
    LocalDate month
);

    Optional<Budget> findByUser_UserIdAndCategory_CategoryIdAndMonth(
        Long userId, 
        Long categoryId, 
        LocalDate month
    );
}