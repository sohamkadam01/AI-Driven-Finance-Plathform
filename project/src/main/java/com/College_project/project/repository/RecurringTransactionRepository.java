package com.College_project.project.repository;

import com.College_project.project.models.RecurringTransaction;
import com.College_project.project.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface RecurringTransactionRepository extends JpaRepository<RecurringTransaction, Long> {
    List<RecurringTransaction> findByUserAndIsActiveTrue(User user);
    List<RecurringTransaction> findByIsActiveTrueAndNextDueDateBetween(LocalDate start, LocalDate end);
    List<RecurringTransaction> findByUserAndIsActiveTrueAndNextDueDateBetween(User user, LocalDate start, LocalDate end);
}