package com.College_project.project.service;

import com.College_project.project.models.Liability;
import com.College_project.project.models.User;
import com.College_project.project.repository.LiabilityRepository;
import com.College_project.project.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class LiabilityService {
    
    @Autowired
    private LiabilityRepository liabilityRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public List<Liability> getActiveLiabilities(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return liabilityRepository.findByUserAndIsActiveTrue(user);
    }
    
    public BigDecimal getTotalLiabilityAmount(Long userId) {
        return getActiveLiabilities(userId).stream()
                .map(Liability::getRemainingAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    public Liability addLiability(Long userId, Liability liability) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        liability.setUser(user);
        return liabilityRepository.save(liability);
    }
}
