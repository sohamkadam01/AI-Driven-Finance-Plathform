package com.College_project.project.controller;

import com.College_project.project.models.Category;
import com.College_project.project.enums.TransactionType;
import com.College_project.project.service.CategorizationService;
import com.College_project.project.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategorizationService categorizationService; // Use one consistent name

    /**
     * Auto-categorize a transaction based on description
     */
    @PostMapping("/auto-categorize")
    public ResponseEntity<?> autoCategorize(@RequestBody Map<String, String> request) {
        String description = request.get("description");
        Category category = categorizationService.categorizeTransaction(description);
        
        Map<String, Object> response = new HashMap<>();
        response.put("description", description);
        response.put("categoryId", category.getCategoryId());
        response.put("categoryName", category.getName());
        response.put("categoryType", category.getType());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get all categories
     */
    @GetMapping("/all")
    public ResponseEntity<?> getAllCategories() {
        List<Category> categories = categorizationService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    /**
     * Get categories by type (INCOME or EXPENSE)
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<?> getCategoriesByType(@PathVariable TransactionType type) {
        List<Category> categories = categorizationService.getCategoriesByType(type);
        return ResponseEntity.ok(categories);
    }

    /**
     * Get expense categories (for budgeting)
     */
    @GetMapping("/expense-categories")
    public ResponseEntity<?> getExpenseCategories() {
        List<Category> categories = categorizationService.getCategoriesByType(TransactionType.EXPENSE);
        return ResponseEntity.ok(categories);
    }

    /**
     * Get income categories
     */
    @GetMapping("/income-categories")
    public ResponseEntity<?> getIncomeCategories() {
        List<Category> categories = categorizationService.getCategoriesByType(TransactionType.INCOME);
        return ResponseEntity.ok(categories);
    }

    /**
     * Get category by ID
     */
    @GetMapping("/{categoryId}")
    public ResponseEntity<?> getCategoryById(@PathVariable Long categoryId) {
        Category category = categorizationService.getCategoryById(categoryId);
        return ResponseEntity.ok(category);
    }

    /**
     * Create a new custom category (for authenticated users)
     */
    @PostMapping("/create")
    public ResponseEntity<?> createCategory(@Valid @RequestBody CategoryRequest request,
                                            Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Category category = categorizationService.createCustomCategory(
            userDetails.getId(),
            request.getName(),
            request.getType(),
            request.getParentCategoryId()
        );
        return ResponseEntity.ok(category);
    }

    /**
     * Update category
     */
    @PutMapping("/{categoryId}")
    public ResponseEntity<?> updateCategory(@PathVariable Long categoryId,
                                           @Valid @RequestBody CategoryUpdateRequest request,
                                           Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Category category = categorizationService.updateCategory(
            categoryId,
            userDetails.getId(),
            request.getName(),
            request.getIcon(),
            request.getColor()
        );
        return ResponseEntity.ok(category);
    }

    /**
     * Delete a custom category (only user-created, not default ones)
     */
    @DeleteMapping("/{categoryId}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long categoryId,
                                           Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        categorizationService.deleteCategory(categoryId, userDetails.getId());
        return ResponseEntity.ok("Category deleted successfully");
    }

    /**
     * Get all default categories
     */
 

    /**
     * Get user's custom categories
     */


    /**
     * Initialize default categories (Admin only - or run on startup)
     */
    @PostMapping("/initialize-default")
    public ResponseEntity<?> initializeDefaultCategories() {
        categorizationService.initializeDefaultCategories();
        return ResponseEntity.ok("Default categories initialized successfully");
    }

    

    /**
     * Test categorization with sample text
     */
    @PostMapping("/test-categorization")
    public ResponseEntity<?> testCategorization(@RequestBody Map<String, String> request) {
        String description = request.get("description");
        Category category = categorizationService.categorizeTransaction(description);
        
        Map<String, Object> response = new HashMap<>();
        response.put("inputDescription", description);
        response.put("categorizedAs", category.getName());
        response.put("categoryId", category.getCategoryId());
        response.put("categoryType", category.getType());
        
        return ResponseEntity.ok(response);
    }
}

// Inner DTO classes

class CategoryRequest {
    @jakarta.validation.constraints.NotBlank
    private String name;
    
    @jakarta.validation.constraints.NotNull
    private TransactionType type;
    
    private Long parentCategoryId;

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public TransactionType getType() { return type; }
    public void setType(TransactionType type) { this.type = type; }
    
    public Long getParentCategoryId() { return parentCategoryId; }
    public void setParentCategoryId(Long parentCategoryId) { this.parentCategoryId = parentCategoryId; }
}

class CategoryUpdateRequest {
    private String name;
    private String icon;
    private String color;

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
    
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
}