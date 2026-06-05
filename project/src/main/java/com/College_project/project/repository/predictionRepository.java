package com.College_project.project.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.College_project.project.models.Prediction;
import com.College_project.project.models.User;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface predictionRepository extends JpaRepository<Prediction, Long> {
    List<Prediction> findByUser(User user);
    Optional<Prediction> findByUserAndForecastForDate(User user, LocalDate forecastForDate);
}