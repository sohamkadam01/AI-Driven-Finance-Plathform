package com.College_project.project.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.College_project.project.models.Insight;
import com.College_project.project.models.User;

import java.util.List;

@Repository
public interface insightRepository extends JpaRepository<Insight, Long> {
    List<Insight> findByUser(User user);
    List<Insight> findByUserAndIsRead(User user, boolean isRead);
    List<Insight> findByUserAndIsApplied(User user, boolean isApplied);
}