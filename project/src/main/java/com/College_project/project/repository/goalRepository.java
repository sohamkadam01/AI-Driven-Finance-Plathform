package com.College_project.project.repository;



import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.College_project.project.enums.GoalStatus;
import com.College_project.project.models.Goal;
import com.College_project.project.models.User;

import java.util.List;

@Repository
public interface goalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByUser(User user);
    List<Goal> findByUserAndStatus(User user, GoalStatus status);
}