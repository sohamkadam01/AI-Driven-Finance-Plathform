package com.College_project.project.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.College_project.project.JWT.JwtUtils;
import com.College_project.project.DTOs.loginRequest;
import com.College_project.project.DTOs.registerRequest;
import com.College_project.project.DTOs.authResponse;
import com.College_project.project.DTOs.userDTO;
import com.College_project.project.models.PasswordResetToken;
import com.College_project.project.models.User;
import com.College_project.project.repository.PasswordResetTokenRepository;
import com.College_project.project.repository.UserRepository;
import com.College_project.project.security.UserDetailsImpl;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private EmailService emailService;

    @Value("${app.password-reset.expiry-minutes:15}")
    private int resetExpiryMinutes;
    
    public authResponse registerUser(registerRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return new authResponse(false, "Email is already taken!");
        }
        
        User user = new User();
        user.setName(registerRequest.getName());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setPhone(registerRequest.getPhone());
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());
        
        User savedUser = userRepository.save(user);
        
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(registerRequest.getEmail(), registerRequest.getPassword()));
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        return new authResponse(jwt, userDetails.getId(), userDetails.getName(), userDetails.getEmail());
    }
    
    public authResponse authenticateUser(loginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            return new authResponse(jwt, userDetails.getId(), userDetails.getName(), userDetails.getEmail());
        } catch (Exception e) {
            return new authResponse(false, "Invalid email or password!");
        }
    }
    
    public userDTO getCurrentUser(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return new userDTO(
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getCreatedAt(),
                user.isActive()
        );
    }

    @Transactional
    public authResponse forgotPassword(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);

        // Always return success to avoid user enumeration
        if (userOpt.isEmpty()) {
            return new authResponse(true, "If that email exists, a reset link has been sent.");
        }

        User user = userOpt.get();

        // Delete any existing tokens for this user
        passwordResetTokenRepository.deleteByUser(user);

        // Generate a new token
        String token = UUID.randomUUID().toString();
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(resetExpiryMinutes);
        PasswordResetToken resetToken = new PasswordResetToken(token, user, expiry);
        passwordResetTokenRepository.save(resetToken);

        // Send email
        try {
            emailService.sendPasswordResetEmail(user.getEmail(), token);
        } catch (Exception e) {
            return new authResponse(false, "Failed to send reset email. Please try again.");
        }

        return new authResponse(true, "If that email exists, a reset link has been sent.");
    }

    @Transactional
    public authResponse resetPassword(String token, String newPassword) {
        Optional<PasswordResetToken> tokenOpt = passwordResetTokenRepository.findByToken(token);

        if (tokenOpt.isEmpty()) {
            return new authResponse(false, "Invalid or expired reset link.");
        }

        PasswordResetToken resetToken = tokenOpt.get();

        if (resetToken.isUsed()) {
            return new authResponse(false, "This reset link has already been used.");
        }

        if (resetToken.isExpired()) {
            passwordResetTokenRepository.delete(resetToken);
            return new authResponse(false, "Reset link has expired. Please request a new one.");
        }

        // Update password
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        // Mark token as used
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        return new authResponse(true, "Password reset successfully. You can now log in.");
    }
}