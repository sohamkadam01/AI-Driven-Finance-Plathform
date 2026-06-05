package com.College_project.project.service;

import com.College_project.project.models.Category;
import com.College_project.project.models.User;
import com.College_project.project.enums.TransactionType;
import com.College_project.project.repository.CategoryRepository;
import com.College_project.project.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CategorizationService {
    
    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;
    
    // Keyword mapping for auto-categorization
    private Map<String, String> keywordCategoryMap = new HashMap<>();
    
    public CategorizationService() {
        initializeKeywords();
    }
    
    public List<Category> getCategoriesByType(TransactionType type) {
        return categoryRepository.findByType(type);
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category getCategoryById(Long categoryId) { 
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + categoryId));
    }

    public Category createCustomCategory(Long userId, String name, TransactionType type, Long parentId) {
        Category category = new Category();
        category.setName(name);
        category.setType(type);

        // Optional: set user (if categories are user-specific)
        if (userId != null) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            category.setUser(user);
        }

        // Optional: set parent category (commented out for now)
        // if (parentId != null) {
        //     Category parent = categoryRepository.findById(parentId)
        //             .orElseThrow(() -> new RuntimeException("Parent category not found"));
        //     category.setParent(parent);
        // }

        return categoryRepository.save(category);
    }

    public Category updateCategory(Long categoryId, Long userId, String name, String icon, String color) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // Optional: check ownership
        if (category.getUser() != null && !category.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to update this category");
        }

        // Update fields
        if (name != null) {
            category.setName(name);
        }
        if (icon != null) {
            category.setIcon(icon);
        }
        if (color != null) {
            category.setColor(color);
        }

        return categoryRepository.save(category);
    }

    public void deleteCategory(Long categoryId, Long userId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // Optional: check ownership
        if (category.getUser() != null && !category.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this category");
        }

        categoryRepository.delete(category);
    }

    // Initialize default categories (run once)
    @PostConstruct
    public void initializeDefaultCategories() {
        createDefaultCategoryIfNotExists("Food & Dining", TransactionType.EXPENSE);
        createDefaultCategoryIfNotExists("Coffee Shops", TransactionType.EXPENSE);
        createDefaultCategoryIfNotExists("Restaurants", TransactionType.EXPENSE);
        createDefaultCategoryIfNotExists("Shopping", TransactionType.EXPENSE);
        createDefaultCategoryIfNotExists("Transportation", TransactionType.EXPENSE);
        createDefaultCategoryIfNotExists("Entertainment", TransactionType.EXPENSE);
        createDefaultCategoryIfNotExists("Bills & Utilities", TransactionType.EXPENSE);
        createDefaultCategoryIfNotExists("Healthcare", TransactionType.EXPENSE);
        createDefaultCategoryIfNotExists("Education", TransactionType.EXPENSE);
        createDefaultCategoryIfNotExists("Salary", TransactionType.INCOME);
        createDefaultCategoryIfNotExists("Freelance", TransactionType.INCOME);
        createDefaultCategoryIfNotExists("Investment", TransactionType.INCOME);
        createDefaultCategoryIfNotExists("Other", TransactionType.EXPENSE);
    }
    
    private void createDefaultCategoryIfNotExists(String name, TransactionType type) {
        if (categoryRepository.findByNameIgnoreCase(name).isEmpty()) {
            Category cat = new Category();
            cat.setName(name);
            cat.setType(type);
            cat.setDefault(true);
            categoryRepository.save(cat);
        }
    }
    
    private void initializeKeywords() {
        // Food & Dining
        keywordCategoryMap.put("STARBUCKS", "Coffee Shops");
        keywordCategoryMap.put("COFFEE", "Coffee Shops");
        keywordCategoryMap.put("RESTAURANT", "Dining Out");
        keywordCategoryMap.put("ZOMATO", "Food Delivery");
        keywordCategoryMap.put("SWIGGY", "Food Delivery");
        keywordCategoryMap.put("DOMINOS", "Fast Food");
        keywordCategoryMap.put("MCDONALDS", "Fast Food");
        
        // Shopping
        keywordCategoryMap.put("AMAZON", "Online Shopping");
        keywordCategoryMap.put("FLIPKART", "Online Shopping");
        keywordCategoryMap.put("MYNTRA", "Clothing");
        keywordCategoryMap.put("AJIO", "Clothing");
        
        // Transportation
        keywordCategoryMap.put("UBER", "Transportation");
        keywordCategoryMap.put("OLA", "Transportation");
        keywordCategoryMap.put("PETROL", "Fuel");
        keywordCategoryMap.put("FUEL", "Fuel");
        
        // Entertainment
        keywordCategoryMap.put("NETFLIX", "Entertainment");
        keywordCategoryMap.put("HOTSTAR", "Entertainment");
        keywordCategoryMap.put("PRIME VIDEO", "Entertainment");
        keywordCategoryMap.put("BOOKMYSHOW", "Movies");
        
        // Bills & Utilities
        keywordCategoryMap.put("ELECTRICITY", "Utilities");
        keywordCategoryMap.put("WIFI", "Internet");
        keywordCategoryMap.put("RENT", "Rent");
        keywordCategoryMap.put("MAINTENANCE", "Maintenance");
        
        // Healthcare
        keywordCategoryMap.put("PHARMACY", "Healthcare");
        keywordCategoryMap.put("MEDICINE", "Healthcare");
        keywordCategoryMap.put("DOCTOR", "Healthcare");
        
        // Income
        keywordCategoryMap.put("SALARY", "Salary");
        keywordCategoryMap.put("FREELANCE", "Freelance Income");
        keywordCategoryMap.put("REFUND", "Refund");
        keywordCategoryMap.put("BONUS", "Bonus");
    }
    
    public Category categorizeTransaction(String description) {
        if (description == null || description.isEmpty()) {
            return getDefaultCategory(TransactionType.EXPENSE);
        }
        
        String upperDesc = description.toUpperCase();
        
        // Check for keyword matches
        for (Map.Entry<String, String> entry : keywordCategoryMap.entrySet()) {
            if (upperDesc.contains(entry.getKey())) {
                // Determine type based on common income keywords
                TransactionType type = (entry.getKey().equals("SALARY") || entry.getKey().equals("REFUND") || 
                                        entry.getKey().equals("BONUS") || entry.getKey().equals("FREELANCE")) 
                                        ? TransactionType.INCOME : TransactionType.EXPENSE;
                return findOrCreateCategory(entry.getValue(), type);
            }
        }
        
        // Default categories based on keywords or type
        if (upperDesc.contains("PAYMENT") || upperDesc.contains("BILL")) {
            return findOrCreateCategory("Bills", TransactionType.EXPENSE);
        } else if (upperDesc.contains("TRANSFER")) {
            return findOrCreateCategory("Transfer", TransactionType.EXPENSE);
        } else if (upperDesc.contains("CASH")) {
            return findOrCreateCategory("Cash Withdrawal", TransactionType.EXPENSE);
        } else {
            return getDefaultCategory(TransactionType.EXPENSE);
        }
    }
    
    private Category findOrCreateCategory(String categoryName, TransactionType type) {
        return categoryRepository.findByNameIgnoreCase(categoryName)
                .stream().findFirst()
                .orElseGet(() -> {
                    Category newCat = new Category();
                    newCat.setName(categoryName);
                    newCat.setType(type);
                    newCat.setDefault(true);
                    return categoryRepository.save(newCat);
                });
    }
    
    private Category getDefaultCategory(TransactionType type) {
        return findOrCreateCategory("Other", type);
    }
}  // ← Only ONE closing brace here!