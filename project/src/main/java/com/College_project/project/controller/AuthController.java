package com.College_project.project.controller;

import com.College_project.project.DTOs.forgotPasswordRequest;
import com.College_project.project.DTOs.loginRequest;
import com.College_project.project.DTOs.registerRequest;
import com.College_project.project.DTOs.resetPasswordRequest;
import com.College_project.project.DTOs.authResponse;
import com.College_project.project.DTOs.userDTO;
import com.College_project.project.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:5173", maxAge = 3600) 
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody registerRequest registerRequest) {
        authResponse response = authService.registerUser(registerRequest);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody loginRequest loginRequest) {
        authResponse response = authService.authenticateUser(loginRequest);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody forgotPasswordRequest request) {
        authResponse response = authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody resetPasswordRequest request) {
        authResponse response = authService.resetPassword(request.getToken(), request.getNewPassword());
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new authResponse(false, "Not authenticated"));
        }
        
    userDTO currentUser = authService.getCurrentUser(authentication);
        return ResponseEntity.ok(currentUser);
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        // In JWT, logout is handled client-side by removing the token
        return ResponseEntity.ok(new authResponse(true, "Logged out successfully"));
    }
}
