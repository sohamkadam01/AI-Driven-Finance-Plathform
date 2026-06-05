package com.College_project.project.repository;

import com.College_project.project.models.Category;
import com.College_project.project.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    // Find categories by type (INCOME or EXPENSE)
    List<Category> findByType(TransactionType type);
    
    // Find categories that are default
    List<Category> findByIsDefaultTrue();
    
    // Find categories that are NOT default (custom)
    List<Category> findByIsDefaultFalse();
    
    // Find categories by parent category ID - FIXED VERSION
    // Option 1: Using parentCategory's categoryId
    List<Category> findByParentCategory_CategoryId(Long parentCategoryId);
    
    // Option 2: If you want to find by parent category object
    List<Category> findByParentCategory(Category parentCategory);
    
    // Find categories by name (for checking duplicates)
    List<Category> findByName(String name);
    
    // Find categories by name ignoring case
    List<Category> findByNameIgnoreCase(String name);

    // Find category by name and type
    List<Category> findByNameIgnoreCaseAndType(String name, TransactionType type);
    
    // Count categories by parent category
    long countByParentCategory_CategoryId(Long parentCategoryId);
}