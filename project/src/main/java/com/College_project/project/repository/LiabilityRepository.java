package com.College_project.project.repository;

import com.College_project.project.models.Liability;
import com.College_project.project.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LiabilityRepository extends JpaRepository<Liability, Long> {
    List<Liability> findByUser(User user);
    List<Liability> findByUserAndIsActiveTrue(User user);
}
