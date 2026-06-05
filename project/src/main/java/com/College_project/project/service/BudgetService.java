package com.College_project.project.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.College_project.project.DTOs.BudgetHistoryDTO;
import com.College_project.project.DTOs.BudgetPerformanceDTO;
import com.College_project.project.DTOs.BudgetRequest;
import com.College_project.project.DTOs.BudgetResponse;
import com.College_project.project.enums.TransactionType;
import com.College_project.project.models.Budget;
import com.College_project.project.models.Category;
import com.College_project.project.models.Transaction;
import com.College_project.project.models.User;
import com.College_project.project.repository.AlertRepository;
import com.College_project.project.repository.CategoryRepository;
import com.College_project.project.repository.UserRepository;
import com.College_project.project.repository.budgetRepository;
import com.College_project.project.repository.transactionRepository;
@Service
public class BudgetService {
    
    @Autowired
    private budgetRepository budgetRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private transactionRepository transactionRepository;
    
    @Autowired
    private AlertService alertService;
    
    @Autowired
    private AlertRepository alertRepository;

    @Transactional
    public BudgetResponse createBudget(Long userId, BudgetRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        
        // Check if budget already exists for this category and month
        Budget existingBudget = budgetRepository
                .findByUserAndCategory_CategoryIdAndMonth(user, request.getCategoryId(), request.getMonth())
                .orElse(null);
        
        if (existingBudget != null) {
            throw new RuntimeException("Budget already exists for category '" + category.getName() + 
                "' in " + request.getMonth().getMonth() + ". Please update budget ID: " + existingBudget.getBudgetId());
        }
        
        Budget budget = new Budget();
        budget.setUser(user);
        budget.setCategory(category);
        budget.setMonth(request.getMonth());
        budget.setAmountLimit(request.getAmountLimit());
        budget.setAlertThreshold(request.getAlertThreshold());
        budget.setCreatedAt(LocalDateTime.now());
        
        // Calculate current spent amount for this category in the month
        BigDecimal spentAmount = calculateSpentAmount(userId, category.getCategoryId(), request.getMonth());
        budget.setSpentAmount(spentAmount);
        
        Budget savedBudget = budgetRepository.save(budget);

        // Check and trigger alert immediately if the initial spending is already high
        checkAndTriggerAlert(savedBudget);
        
        return new BudgetResponse(
            savedBudget.getBudgetId(),
            category.getCategoryId(),
            category.getName(),
            category.getIcon(),
            category.getColor(),
            savedBudget.getMonth(),
            savedBudget.getAmountLimit(),
            savedBudget.getSpentAmount(),
            savedBudget.getAlertThreshold()
        );
    }
    
    private BigDecimal calculateSpentAmount(Long userId, Long categoryId, LocalDate month) {
        LocalDate startOfMonth = month.withDayOfMonth(1);
        LocalDate endOfMonth = month.withDayOfMonth(month.lengthOfMonth());
        
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return BigDecimal.ZERO;
        
        Category category = categoryRepository.findById(categoryId).orElse(null);
        if (category == null) return BigDecimal.ZERO;
        
        BigDecimal spent = transactionRepository.sumAmountByUserAndCategoryAndDateRange(
            user, category, TransactionType.EXPENSE, startOfMonth, endOfMonth);
        
        return spent != null ? spent : BigDecimal.ZERO;
    }
    
    @Transactional(readOnly = true)
    public List<BudgetResponse> getUserBudgets(Long userId, LocalDate month) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Budget> budgets = budgetRepository.findByUserAndMonth(user, month);
        
        return budgets.stream()
            .map(budget -> {
                // Update spent amount
                BigDecimal spentAmount = calculateSpentAmount(userId, 
                    budget.getCategory().getCategoryId(), month);
                budget.setSpentAmount(spentAmount);
                
                return new BudgetResponse(
                    budget.getBudgetId(),
                    budget.getCategory().getCategoryId(),
                    budget.getCategory().getName(),
                    budget.getCategory().getIcon(),
                    budget.getCategory().getColor(),
                    budget.getMonth(),
                    budget.getAmountLimit(),
                    budget.getSpentAmount(),
                    budget.getAlertThreshold()
                );
            })
            .collect(Collectors.toList());
    }
    
    @Transactional
    public void updateBudgetSpending(Long userId, Long categoryId, LocalDate month) {
        Budget budget = budgetRepository
                .findByUser_UserIdAndCategory_CategoryIdAndMonth(userId, categoryId, month)
                .orElse(null);
        
        if (budget != null) {
            BigDecimal spentAmount = calculateSpentAmount(userId, categoryId, month);
            budget.setSpentAmount(spentAmount);
            budget.setUpdatedAt(LocalDateTime.now());
            budgetRepository.save(budget);
            
            // Check and trigger alert if needed
            checkAndTriggerAlert(budget);
        }
    }
    
    private void checkAndTriggerAlert(Budget budget) {
        // Prevent division by zero if budget limit is not set or zero
        if (budget.getAmountLimit().compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        BigDecimal spentPercentage = budget.getSpentPercentage();
        
        if (spentPercentage.compareTo(budget.getAlertThreshold()) >= 0) {
            // Check if an alert for this budget has already been sent recently to avoid spam
            String categoryName = budget.getCategory().getName();
            boolean alreadyAlerted = alertRepository.existsByUserAndMessageContainingAndCreatedAtAfter(
                budget.getUser(), 
                categoryName, 
                LocalDateTime.now().minusHours(24)
            );

            if (alreadyAlerted) {
                return; // Skip creating a duplicate alert if one was sent in the last 24h
            }

            String message = String.format(
                "⚠️ Budget Alert: You've spent %.1f%% of your %s budget (₹%s out of ₹%s)",
                spentPercentage,
                budget.getCategory().getName(),
                budget.getSpentAmount(),
                budget.getAmountLimit()
            );
            
            alertService.createBudgetAlert(budget.getUser(), message, budget);
        }
    }
    
    @Transactional
    public void deleteBudget(Long budgetId, Long userId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new RuntimeException("Budget not found"));
        
        if (!budget.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this budget");
        }
        
        budgetRepository.delete(budget);
    }
    
    public BudgetResponse getBudgetSummary(Long userId, LocalDate month) {
        List<BudgetResponse> budgets = getUserBudgets(userId, month);
        
        BigDecimal totalBudget = budgets.stream()
            .map(BudgetResponse::getAmountLimit)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalSpent = budgets.stream()
            .map(BudgetResponse::getSpentAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Create a summary response
        BudgetResponse summary = new BudgetResponse(
            null, null, "Total Budget", null, null,
            month, totalBudget, totalSpent, new BigDecimal("80")
        );
        
        return summary;
    }

    // Add this method to BudgetService.java
public BudgetResponse updateBudget(Long budgetId, Long userId, BigDecimal newLimit, BigDecimal newThreshold) {
    Budget budget = budgetRepository.findById(budgetId)
            .orElseThrow(() -> new RuntimeException("Budget not found"));
    
    if (!budget.getUser().getUserId().equals(userId)) {
        throw new RuntimeException("Unauthorized to update this budget");
    }
    
    if (newLimit != null) {
        budget.setAmountLimit(newLimit);
    }
    if (newThreshold != null) {
        budget.setAlertThreshold(newThreshold);
    }
    
    budget.setUpdatedAt(LocalDateTime.now());
    Budget savedBudget = budgetRepository.save(budget);
    
    return new BudgetResponse(
        savedBudget.getBudgetId(),
        savedBudget.getCategory().getCategoryId(),
        savedBudget.getCategory().getName(),
        savedBudget.getCategory().getIcon(),
        savedBudget.getCategory().getColor(),
        savedBudget.getMonth(),
        savedBudget.getAmountLimit(),
        savedBudget.getSpentAmount(),
        savedBudget.getAlertThreshold()
    );
}

public BudgetResponse getBudgetById(Long budgetId, Long userId) {
    Budget budget = budgetRepository.findById(budgetId)
            .orElseThrow(() -> new RuntimeException("Budget not found"));
    
    if (!budget.getUser().getUserId().equals(userId)) {
        throw new RuntimeException("Unauthorized to view this budget");
    }
    
    return new BudgetResponse(
        budget.getBudgetId(),
        budget.getCategory().getCategoryId(),
        budget.getCategory().getName(),
        budget.getCategory().getIcon(),
        budget.getCategory().getColor(),
        budget.getMonth(),
        budget.getAmountLimit(),
        budget.getSpentAmount(),
        budget.getAlertThreshold()
    );
}


/**
 * Get budget history for a user
 * @param userId User ID
 * @param months Number of months to look back (default 12)
 * @return BudgetHistoryDTO containing historical budget data
 */
public BudgetHistoryDTO getBudgetHistory(Long userId, int months) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
    
    BudgetHistoryDTO history = new BudgetHistoryDTO();
    List<BudgetHistoryDTO.MonthlyBudgetSummary> monthlyHistory = new ArrayList<>();
    Map<String, List<BigDecimal>> categorySpendingHistory = new HashMap<>();
    
    LocalDate endDate = LocalDate.now().withDayOfMonth(1);
    LocalDate startDate = endDate.minusMonths(months - 1);
    
    BigDecimal totalBudgetedAllMonths = BigDecimal.ZERO;
    BigDecimal totalSpentAllMonths = BigDecimal.ZERO;
    int monthsOnTrack = 0;
    int monthsOverBudget = 0;
    String bestMonth = null;
    String worstMonth = null;
    double bestUtilization = 100;
    double worstUtilization = 0;
    
    // Iterate through each month
    for (int i = 0; i < months; i++) {
        LocalDate currentMonth = startDate.plusMonths(i);
        
        // Get budgets for this month
        List<Budget> budgets = budgetRepository.findByUserAndMonth(user, currentMonth);
        List<BudgetHistoryDTO.CategoryBudgetDetail> categoryDetails = new ArrayList<>();
        
        BigDecimal monthTotalBudget = BigDecimal.ZERO;
        BigDecimal monthTotalSpent = BigDecimal.ZERO;
        int exceededCount = 0;
        int atRiskCount = 0;
        
        for (Budget budget : budgets) {
            // Calculate spent amount for this category in this month
            BigDecimal spent = calculateSpentAmountForMonth(user, budget.getCategory().getCategoryId(), currentMonth);
            budget.setSpentAmount(spent);
            
            BigDecimal remaining = budget.getAmountLimit().subtract(spent);
            double percentageUsed = 0;
            if (budget.getAmountLimit().compareTo(BigDecimal.ZERO) > 0) {
                percentageUsed = spent.doubleValue() / budget.getAmountLimit().doubleValue() * 100;
            }
            
            String status;
            if (percentageUsed >= 100) {
                status = "EXCEEDED";
                exceededCount++;
            } else if (percentageUsed >= 80) {
                status = "WARNING";
                atRiskCount++;
            } else {
                status = "GOOD";
            }
            
            BudgetHistoryDTO.CategoryBudgetDetail detail = new BudgetHistoryDTO.CategoryBudgetDetail();
            detail.setCategoryName(budget.getCategory().getName());
            detail.setCategoryIcon(budget.getCategory().getIcon());
            detail.setBudgeted(budget.getAmountLimit());
            detail.setSpent(spent);
            detail.setRemaining(remaining);
            detail.setPercentageUsed(Math.round(percentageUsed * 10.0) / 10.0);
            detail.setStatus(status);
            categoryDetails.add(detail);
            
            monthTotalBudget = monthTotalBudget.add(budget.getAmountLimit());
            monthTotalSpent = monthTotalSpent.add(spent);
            
            // Track category spending history
            categorySpendingHistory.computeIfAbsent(budget.getCategory().getName(), k -> new ArrayList<>())
                .add(spent);
        }
        
        double overallUtilization = 0;
        if (monthTotalBudget.compareTo(BigDecimal.ZERO) > 0) {
            overallUtilization = monthTotalSpent.doubleValue() / monthTotalBudget.doubleValue() * 100;
        }
        
        // Track best/worst month
        if (overallUtilization < bestUtilization && monthTotalBudget.compareTo(BigDecimal.ZERO) > 0) {
            bestUtilization = overallUtilization;
            bestMonth = currentMonth.getMonth().toString() + " " + currentMonth.getYear();
        }
        if (overallUtilization > worstUtilization && monthTotalBudget.compareTo(BigDecimal.ZERO) > 0) {
            worstUtilization = overallUtilization;
            worstMonth = currentMonth.getMonth().toString() + " " + currentMonth.getYear();
        }
        
        if (overallUtilization <= 100) {
            monthsOnTrack++;
        } else {
            monthsOverBudget++;
        }
        
        totalBudgetedAllMonths = totalBudgetedAllMonths.add(monthTotalBudget);
        totalSpentAllMonths = totalSpentAllMonths.add(monthTotalSpent);
        
        BudgetHistoryDTO.MonthlyBudgetSummary summary = new BudgetHistoryDTO.MonthlyBudgetSummary();
        summary.setMonth(currentMonth);
        summary.setTotalBudget(monthTotalBudget);
        summary.setTotalSpent(monthTotalSpent);
        summary.setRemaining(monthTotalBudget.subtract(monthTotalSpent));
        summary.setOverallUtilization(Math.round(overallUtilization * 10.0) / 10.0);
        summary.setBudgetCount(budgets.size());
        summary.setExceededCount(exceededCount);
        summary.setAtRiskCount(atRiskCount);
        summary.setCategoryDetails(categoryDetails);
        
        monthlyHistory.add(summary);
    }
    
    // Calculate category averages
    Map<String, BigDecimal> categoryAverages = new HashMap<>();
    for (Map.Entry<String, List<BigDecimal>> entry : categorySpendingHistory.entrySet()) {
        BigDecimal average = entry.getValue().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(entry.getValue().size()), 2, RoundingMode.HALF_UP);
        categoryAverages.put(entry.getKey(), average);
    }
    
    // Create performance summary
    BudgetHistoryDTO.BudgetPerformanceSummary performanceSummary = new BudgetHistoryDTO.BudgetPerformanceSummary();
    performanceSummary.setTotalMonthsTracked(months);
    performanceSummary.setMonthsOnTrack(monthsOnTrack);
    performanceSummary.setMonthsOverBudget(monthsOverBudget);
    performanceSummary.setAverageUtilization(totalBudgetedAllMonths.compareTo(BigDecimal.ZERO) > 0 ? 
        totalSpentAllMonths.doubleValue() / totalBudgetedAllMonths.doubleValue() * 100 : 0);
    performanceSummary.setTotalBudgetedOverPeriod(totalBudgetedAllMonths);
    performanceSummary.setTotalSpentOverPeriod(totalSpentAllMonths);
    performanceSummary.setTotalSavedOverPeriod(totalBudgetedAllMonths.subtract(totalSpentAllMonths));
    performanceSummary.setBestMonth(bestMonth);
    performanceSummary.setWorstMonth(worstMonth);
    
    // Generate trends
    List<BudgetHistoryDTO.BudgetTrend> trends = generateBudgetTrends(categorySpendingHistory);
    
    history.setMonthlyHistory(monthlyHistory);
    history.setCategoryAverages(categoryAverages);
    history.setPerformanceSummary(performanceSummary);
    history.setTrends(trends);
    
    return history;
}

/**
 * Calculate spent amount for a specific category in a specific month
 */
private BigDecimal calculateSpentAmountForMonth(User user, Long categoryId, LocalDate month) {
    LocalDate startOfMonth = month.withDayOfMonth(1);
    LocalDate endOfMonth = month.withDayOfMonth(month.lengthOfMonth());
    
    List<Transaction> transactions = transactionRepository
            .findByUserAndTransactionDateBetween(user, startOfMonth, endOfMonth);
    
    return transactions.stream()
            .filter(t -> t.getType() == TransactionType.EXPENSE)
            .filter(t -> t.getCategory() != null && t.getCategory().getCategoryId().equals(categoryId))
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
}


/**
 * Get budget for a specific category and month
 */
public Optional<Budget> getBudgetForCategoryAndMonth(Long userId, Long categoryId, LocalDate month) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
    
    return budgetRepository.findByUserAndCategory_CategoryIdAndMonth(user, categoryId, month);
}

/**
 * Calculate spent amount for a specific category in a specific month
 */
public BigDecimal calculateSpentAmountForMonth(Long userId, Long categoryId, LocalDate month) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
    
    LocalDate startOfMonth = month.withDayOfMonth(1);
    LocalDate endOfMonth = month.withDayOfMonth(month.lengthOfMonth());
    
    List<Transaction> transactions = transactionRepository
            .findByUserAndTransactionDateBetween(user, startOfMonth, endOfMonth);
    
    return transactions.stream()
            .filter(t -> t.getType() == TransactionType.EXPENSE)
            .filter(t -> t.getCategory() != null && t.getCategory().getCategoryId().equals(categoryId))
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
}

/**
 * Generate budget trends for top categories
 */
private List<BudgetHistoryDTO.BudgetTrend> generateBudgetTrends(Map<String, List<BigDecimal>> categorySpendingHistory) {
    List<BudgetHistoryDTO.BudgetTrend> trends = new ArrayList<>();
    
    // Get top 5 categories with most spending variance
    categorySpendingHistory.entrySet().stream()
        .limit(5)
        .forEach(entry -> {
            BudgetHistoryDTO.BudgetTrend trend = new BudgetHistoryDTO.BudgetTrend();
            trend.setCategoryName(entry.getKey());
            
            List<BudgetHistoryDTO.TrendPoint> points = new ArrayList<>();
            List<BigDecimal> values = entry.getValue();
            
            // Calculate trend direction (simple linear regression)
            double trendDirection = calculateTrendDirection(values);
            trend.setTrendDirection(Math.round(trendDirection * 100.0) / 100.0);
            
            // Generate insight
            if (trendDirection > 0) {
                trend.setInsight(String.format("Your spending on %s has been increasing. Consider reviewing this category.", entry.getKey()));
            } else if (trendDirection < 0) {
                trend.setInsight(String.format("Great! Your spending on %s has been decreasing.", entry.getKey()));
            } else {
                trend.setInsight(String.format("Your spending on %s has been stable.", entry.getKey()));
            }
            
            trends.add(trend);
        });
    
    return trends;
}

/**
 * Calculate trend direction using simple linear regression
 */
private double calculateTrendDirection(List<BigDecimal> values) {
    if (values.size() < 2) return 0;
    
    int n = values.size();
    double sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    for (int i = 0; i < n; i++) {
        double x = i + 1;
        double y = values.get(i).doubleValue();
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumX2 += x * x;
    }
    
    double slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
}

/**
 * Get budget performance for current month
 */
public BudgetPerformanceDTO getBudgetPerformance(Long userId) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
    
    LocalDate currentMonth = LocalDate.now().withDayOfMonth(1);
    List<Budget> budgets = budgetRepository.findByUserAndMonth(user, currentMonth);
    
    BudgetPerformanceDTO performance = new BudgetPerformanceDTO();
    List<BudgetPerformanceDTO.CategoryPerformance> categoryPerformances = new ArrayList<>();
    
    // Calculate category-wise performance
    for (Budget budget : budgets) {
        BigDecimal spent = calculateSpentAmountForMonth(userId, budget.getCategory().getCategoryId(), currentMonth);
        budget.setSpentAmount(spent);
        
        BudgetPerformanceDTO.CategoryPerformance catPerf = calculateCategoryPerformance(budget, user, currentMonth);
        categoryPerformances.add(catPerf);
    }
    
    // Sort by performance score (best first)
    categoryPerformances.sort((a, b) -> Integer.compare(b.getPerformanceScore(), a.getPerformanceScore()));
    
    // Calculate summary
    BudgetPerformanceDTO.PerformanceSummary summary = calculatePerformanceSummary(categoryPerformances);
    
    // Get top and bottom performers
    List<BudgetPerformanceDTO.CategoryPerformance> topPerformers = categoryPerformances.stream()
            .filter(c -> c.getPerformanceScore() >= 80)
            .limit(3)
            .collect(Collectors.toList());
    
    List<BudgetPerformanceDTO.CategoryPerformance> bottomPerformers = categoryPerformances.stream()
            .filter(c -> c.getPerformanceScore() < 50)
            .limit(3)
            .collect(Collectors.toList());
    
    // Calculate overall performance score
    int overallScore = calculateOverallPerformanceScore(categoryPerformances);
    
    // Get performance trend
    BudgetPerformanceDTO.PerformanceTrend trend = calculatePerformanceTrend(user, currentMonth);
    
    // Generate insights and recommendations
    String overallInsight = generateOverallInsight(overallScore, summary);
    List<String> recommendations = generatePerformanceRecommendations(categoryPerformances, summary);
    List<String> achievements = generateAchievements(categoryPerformances);
    
    // Set all values
    performance.setOverallPerformanceScore(overallScore);
    performance.setPerformanceGrade(getPerformanceGrade(overallScore));
    performance.setPerformanceStatus(getPerformanceStatus(overallScore));
    performance.setSummary(summary);
    performance.setCategoryPerformance(categoryPerformances);
    performance.setTopPerformingCategories(topPerformers);
    performance.setBottomPerformingCategories(bottomPerformers);
    performance.setTrend(trend);
    performance.setMonthlyPerformanceHistory(getMonthlyPerformanceHistory(user, 6));
    performance.setOverallInsight(overallInsight);
    performance.setRecommendations(recommendations);
    performance.setAchievements(achievements);
    
    return performance;
}

/**
 * Calculate performance for a single category
 */
private BudgetPerformanceDTO.CategoryPerformance calculateCategoryPerformance(Budget budget, User user, LocalDate month) {
    BudgetPerformanceDTO.CategoryPerformance catPerf = new BudgetPerformanceDTO.CategoryPerformance();
    
    catPerf.setCategoryId(budget.getCategory().getCategoryId());
    catPerf.setCategoryName(budget.getCategory().getName());
    catPerf.setCategoryIcon(budget.getCategory().getIcon());
    catPerf.setBudgeted(budget.getAmountLimit());
    catPerf.setSpent(budget.getSpentAmount());
    catPerf.setRemaining(budget.getAmountLimit().subtract(budget.getSpentAmount()));
    
    double utilization = 0;
    if (budget.getAmountLimit().compareTo(BigDecimal.ZERO) > 0) {
        utilization = budget.getSpentAmount().doubleValue() / budget.getAmountLimit().doubleValue() * 100;
    }
    catPerf.setUtilizationPercentage(Math.round(utilization * 10.0) / 10.0);
    
    // Calculate performance score (0-100)
    int performanceScore = calculateCategoryPerformanceScore(utilization);
    catPerf.setPerformanceScore(performanceScore);
    catPerf.setPerformanceLevel(getPerformanceLevel(performanceScore));
    
    // Calculate trend (last 3 months average vs current)
    BigDecimal threeMonthAvg = getThreeMonthAverageSpending(user, budget.getCategory().getCategoryId(), month);
    catPerf.setThreeMonthAverage(threeMonthAvg);
    
    String trend = calculateSpendingTrend(budget.getSpentAmount(), threeMonthAvg);
    catPerf.setTrend(trend);
    
    // Generate insight
    catPerf.setInsight(generateCategoryInsight(budget.getCategory().getName(), utilization, trend, budget.getSpentAmount(), threeMonthAvg));
    
    return catPerf;
}

/**
 * Calculate performance score for a category based on utilization
 */
private int calculateCategoryPerformanceScore(double utilization) {
    if (utilization <= 50) return 100;
    if (utilization <= 70) return 85;
    if (utilization <= 80) return 75;
    if (utilization <= 90) return 60;
    if (utilization <= 100) return 50;
    return 30;
}

/**
 * Get performance level based on score
 */
private String getPerformanceLevel(int score) {
    if (score >= 85) return "EXCELLENT";
    if (score >= 70) return "GOOD";
    if (score >= 50) return "FAIR";
    if (score >= 30) return "POOR";
    return "CRITICAL";
}

/**
 * Get performance grade
 */
private String getPerformanceGrade(int score) {
    if (score >= 90) return "A+";
    if (score >= 85) return "A";
    if (score >= 80) return "B+";
    if (score >= 75) return "B";
    if (score >= 70) return "C+";
    if (score >= 60) return "C";
    if (score >= 50) return "D";
    return "F";
}

/**
 * Get performance status
 */
private String getPerformanceStatus(int score) {
    if (score >= 80) return "EXCELLENT";
    if (score >= 65) return "GOOD";
    if (score >= 50) return "AVERAGE";
    if (score >= 35) return "POOR";
    return "CRITICAL";
}

/**
 * Calculate overall performance summary
 */
private BudgetPerformanceDTO.PerformanceSummary calculatePerformanceSummary(List<BudgetPerformanceDTO.CategoryPerformance> performances) {
    BudgetPerformanceDTO.PerformanceSummary summary = new BudgetPerformanceDTO.PerformanceSummary();
    
    summary.setTotalCategoriesWithBudget(performances.size());
    
    int onTrack = 0, atRisk = 0, exceeded = 0;
    BigDecimal totalBudgeted = BigDecimal.ZERO;
    BigDecimal totalSpent = BigDecimal.ZERO;
    
    String bestCategory = null;
    String worstCategory = null;
    int bestScore = 0;
    int worstScore = 100;
    
    for (BudgetPerformanceDTO.CategoryPerformance perf : performances) {
        totalBudgeted = totalBudgeted.add(perf.getBudgeted());
        totalSpent = totalSpent.add(perf.getSpent());
        
        if (perf.getUtilizationPercentage() <= 80) {
            onTrack++;
        } else if (perf.getUtilizationPercentage() <= 100) {
            atRisk++;
        } else {
            exceeded++;
        }
        
        if (perf.getPerformanceScore() > bestScore) {
            bestScore = perf.getPerformanceScore();
            bestCategory = perf.getCategoryName();
        }
        if (perf.getPerformanceScore() < worstScore) {
            worstScore = perf.getPerformanceScore();
            worstCategory = perf.getCategoryName();
        }
    }
    
    summary.setCategoriesOnTrack(onTrack);
    summary.setCategoriesAtRisk(atRisk);
    summary.setCategoriesExceeded(exceeded);
    summary.setOnTrackPercentage(performances.size() > 0 ? (double) onTrack / performances.size() * 100 : 0);
    summary.setTotalBudgeted(totalBudgeted);
    summary.setTotalSpent(totalSpent);
    summary.setTotalSaved(totalBudgeted.subtract(totalSpent));
    
    if (totalBudgeted.compareTo(BigDecimal.ZERO) > 0) {
        summary.setAverageUtilization(totalSpent.doubleValue() / totalBudgeted.doubleValue() * 100);
    }
    
    summary.setBestPerformingCategory(bestCategory);
    summary.setWorstPerformingCategory(worstCategory);
    
    return summary;
}

/**
 * Calculate overall performance score
 */
private int calculateOverallPerformanceScore(List<BudgetPerformanceDTO.CategoryPerformance> performances) {
    if (performances.isEmpty()) return 0;
    
    int totalScore = performances.stream()
            .mapToInt(BudgetPerformanceDTO.CategoryPerformance::getPerformanceScore)
            .sum();
    
    return totalScore / performances.size();
}

/**
 * Get 3-month average spending for a category
 */
private BigDecimal getThreeMonthAverageSpending(User user, Long categoryId, LocalDate currentMonth) {
    BigDecimal total = BigDecimal.ZERO;
    int monthsWithData = 0;
    
    for (int i = 1; i <= 3; i++) {
        LocalDate month = currentMonth.minusMonths(i);
        BigDecimal spent = calculateSpentAmountForMonth(user.getUserId(), categoryId, month);
        if (spent.compareTo(BigDecimal.ZERO) > 0) {
            total = total.add(spent);
            monthsWithData++;
        }
    }
    
    if (monthsWithData == 0) return BigDecimal.ZERO;
    return total.divide(BigDecimal.valueOf(monthsWithData), 2, RoundingMode.HALF_UP);
}

/**
 * Calculate spending trend
 */
private String calculateSpendingTrend(BigDecimal current, BigDecimal average) {
    if (average.compareTo(BigDecimal.ZERO) == 0) return "STABLE";
    
    double change = current.doubleValue() - average.doubleValue();
    double percentChange = (change / average.doubleValue()) * 100;
    
    if (percentChange < -10) return "IMPROVING";
    if (percentChange > 10) return "DECLINING";
    return "STABLE";
}

/**
 * Calculate performance trend over months
 */
private BudgetPerformanceDTO.PerformanceTrend calculatePerformanceTrend(User user, LocalDate currentMonth) {
    BudgetPerformanceDTO.PerformanceTrend trend = new BudgetPerformanceDTO.PerformanceTrend();
    List<BudgetPerformanceDTO.MonthlyScore> monthlyScores = new ArrayList<>();
    
    for (int i = 5; i >= 0; i--) {
        LocalDate month = currentMonth.minusMonths(i);
        List<Budget> budgets = budgetRepository.findByUserAndMonth(user, month);
        
        if (!budgets.isEmpty()) {
            int totalScore = 0;
            for (Budget budget : budgets) {
                BigDecimal spent = calculateSpentAmountForMonth(user.getUserId(), budget.getCategory().getCategoryId(), month);
                double utilization = budget.getAmountLimit().compareTo(BigDecimal.ZERO) > 0 ?
                    spent.doubleValue() / budget.getAmountLimit().doubleValue() * 100 : 0;
                int score = calculateCategoryPerformanceScore(utilization);
                totalScore += score;
            }
            int avgScore = totalScore / budgets.size();
            monthlyScores.add(new BudgetPerformanceDTO.MonthlyScore(month, avgScore, getPerformanceGrade(avgScore)));
        }
    }
    
    // Calculate trend direction
    if (monthlyScores.size() >= 2) {
        int firstScore = monthlyScores.get(0).getScore();
        int lastScore = monthlyScores.get(monthlyScores.size() - 1).getScore();
        double change = lastScore - firstScore;
        double percentChange = firstScore > 0 ? (change / firstScore) * 100 : 0;
        
        trend.setChangePercentage(Math.round(percentChange * 10.0) / 10.0);
        
        if (percentChange > 5) {
            trend.setDirection("IMPROVING");
            trend.setInsight("Your budget performance is improving! Keep up the good habits.");
        } else if (percentChange < -5) {
            trend.setDirection("DECLINING");
            trend.setInsight("Your budget performance is declining. Review your spending habits.");
        } else {
            trend.setDirection("STABLE");
            trend.setInsight("Your budget performance is stable. Consider ways to improve further.");
        }
    }
    
    trend.setMonthlyScores(monthlyScores);
    return trend;
}

/**
 * Get monthly performance history
 */
private Map<String, BigDecimal> getMonthlyPerformanceHistory(User user, int months) {
    Map<String, BigDecimal> history = new LinkedHashMap<>();
    LocalDate currentMonth = LocalDate.now().withDayOfMonth(1);
    
    for (int i = months - 1; i >= 0; i--) {
        LocalDate month = currentMonth.minusMonths(i);
        List<Budget> budgets = budgetRepository.findByUserAndMonth(user, month);
        
        if (!budgets.isEmpty()) {
            int totalScore = 0;
            for (Budget budget : budgets) {
                BigDecimal spent = calculateSpentAmountForMonth(user.getUserId(), budget.getCategory().getCategoryId(), month);
                double utilization = budget.getAmountLimit().compareTo(BigDecimal.ZERO) > 0 ?
                    spent.doubleValue() / budget.getAmountLimit().doubleValue() * 100 : 0;
                totalScore += calculateCategoryPerformanceScore(utilization);
            }
            int avgScore = budgets.size() > 0 ? totalScore / budgets.size() : 0;
            history.put(month.getMonth().toString() + " " + month.getYear(), BigDecimal.valueOf(avgScore));
        }
    }
    
    return history;
}

/**
 * Generate overall insight
 */
private String generateOverallInsight(int overallScore, BudgetPerformanceDTO.PerformanceSummary summary) {
    if (overallScore >= 80) {
        return String.format("Excellent! You're on track with %.0f%% of your budgets. You saved ₹%s this month.",
            summary.getOnTrackPercentage(), summary.getTotalSaved().toPlainString());
    } else if (overallScore >= 60) {
        return String.format("Good progress! You're on track with %.0f%% of your budgets. Focus on improving %d categories that need attention.",
            summary.getOnTrackPercentage(), summary.getCategoriesAtRisk());
    } else if (overallScore >= 40) {
        return String.format("Room for improvement. You're on track with only %.0f%% of your budgets. Review your spending in %d categories.",
            summary.getOnTrackPercentage(), summary.getCategoriesExceeded());
    } else {
        return String.format("Your budget performance needs attention. You've exceeded budget in %d categories. Review your spending habits.",
            summary.getCategoriesExceeded());
    }
}

/**
 * Generate category insight
 */
private String generateCategoryInsight(String categoryName, double utilization, String trend, 
                                        BigDecimal spent, BigDecimal average) {
    if (utilization <= 50) {
        return String.format("Great job! You've spent only %.0f%% of your %s budget. Consider reallocating surplus to savings.",
            utilization, categoryName);
    } else if (utilization <= 80) {
        if ("IMPROVING".equals(trend)) {
            return String.format("Good progress! Your %s spending is improving. You're at %.0f%% of budget.",
                categoryName, utilization);
        }
        return String.format("You're on track with %s at %.0f%% of budget. Keep monitoring to stay within limit.",
            categoryName, utilization);
    } else if (utilization <= 100) {
        return String.format("Warning: You've used %.0f%% of your %s budget. Try to reduce spending in the remaining days.",
            utilization, categoryName);
    } else {
        return String.format("Alert: You've exceeded your %s budget by ₹%s. Review your spending in this category.",
            categoryName, spent.subtract(average));
    }
}

/**
 * Generate performance recommendations
 */
private List<String> generatePerformanceRecommendations(List<BudgetPerformanceDTO.CategoryPerformance> performances,
                                                          BudgetPerformanceDTO.PerformanceSummary summary) {
    List<String> recommendations = new ArrayList<>();
    
    // Recommendations based on summary
    if (summary.getCategoriesExceeded() > 0) {
        recommendations.add(String.format("🎯 Focus on reducing spending in %d categories where you exceeded budget",
            summary.getCategoriesExceeded()));
    }
    
    if (summary.getCategoriesAtRisk() > 0) {
        recommendations.add(String.format("⚠️ Monitor %d categories that are close to exceeding their limits",
            summary.getCategoriesAtRisk()));
    }
    
    // Find worst performing category
    performances.stream()
        .filter(p -> p.getPerformanceScore() < 50)
        .findFirst()
        .ifPresent(p -> recommendations.add(String.format("📉 Review your %s spending - it's consistently over budget",
            p.getCategoryName())));
    
    // Find best performing category
    performances.stream()
        .filter(p -> p.getPerformanceScore() >= 85)
        .findFirst()
        .ifPresent(p -> recommendations.add(String.format("✅ Great job with %s! You saved ₹%s in this category",
            p.getCategoryName(), p.getRemaining())));
    
    // General recommendations
    if (recommendations.isEmpty()) {
        recommendations.add("🎉 All budgets are on track! Consider increasing savings or investment contributions.");
        recommendations.add("📊 Review your budgets monthly to optimize for changing needs.");
    }
    
    recommendations.add("🔄 Review and adjust your budgets every 3 months based on spending patterns.");
    
    return recommendations;
}

/**
 * Generate achievements list
 */
private List<String> generateAchievements(List<BudgetPerformanceDTO.CategoryPerformance> performances) {
    List<String> achievements = new ArrayList<>();
    
    long perfectCategories = performances.stream()
            .filter(p -> p.getUtilizationPercentage() <= 50)
            .count();
    
    if (perfectCategories > 0) {
        achievements.add(String.format("🏆 Perfect budgeting in %d categories (spent ≤ 50%% of budget)", perfectCategories));
    }
    
    long onTrackCategories = performances.stream()
            .filter(p -> p.getUtilizationPercentage() <= 80)
            .count();
    
    if (onTrackCategories == performances.size() && performances.size() > 0) {
        achievements.add("🎯 All budgets are on track this month!");
    }
    
    performances.stream()
        .filter(p -> "IMPROVING".equals(p.getTrend()))
        .findFirst()
        .ifPresent(p -> achievements.add(String.format("📈 Improving trend in %s spending", p.getCategoryName())));
    
    return achievements;
}

/**
 * Get performance for a specific category
 */
public BudgetPerformanceDTO.CategoryPerformance getCategoryPerformance(Long userId, Long categoryId, LocalDate month) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
    
    Budget budget = budgetRepository.findByUserAndCategory_CategoryIdAndMonth(user, categoryId, month)
            .orElseThrow(() -> new RuntimeException("Budget not found for this category"));
    
    BigDecimal spent = calculateSpentAmountForMonth(userId, categoryId, month);
    budget.setSpentAmount(spent);
    
    return calculateCategoryPerformance(budget, user, month);
}

    /**
     * Analyze the impact of a proposed transaction on the user's budget
     */
    public Map<String, Object> analyzeTransactionImpact(Long userId, Long categoryId, BigDecimal amount, LocalDate date) {
        LocalDate monthStart = date.withDayOfMonth(1);
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        
        Optional<Budget> budgetOpt = budgetRepository.findByUserAndCategory_CategoryIdAndMonth(user, categoryId, monthStart);
        
        Map<String, Object> impact = new HashMap<>();
        impact.put("isOverBudget", false);
        impact.put("hasBudget", false);
        impact.put("budgetMonth", monthStart);
        impact.put("budgetMonthLabel", monthStart.getMonth().toString() + " " + monthStart.getYear());
        impact.put("budgetType", "Monthly category budget");
        impact.put("remainingBefore", BigDecimal.ZERO);
        impact.put("remainingAfter", BigDecimal.ZERO);
        impact.put("budgetLimit", BigDecimal.ZERO);
        impact.put("spentBefore", BigDecimal.ZERO);
        impact.put("totalAfter", amount);
        impact.put("overBy", BigDecimal.ZERO);
        impact.put("utilizationBefore", 0.0);
        impact.put("utilizationAfter", 0.0);
        impact.put("aiMessage", "This transaction fits comfortably within your budget.");
        impact.put("severity", "LOW"); // LOW, MEDIUM, HIGH

        if (budgetOpt.isPresent()) {
            Budget budget = budgetOpt.get();
            BigDecimal currentSpent = calculateSpentAmount(userId, categoryId, monthStart);
            BigDecimal limit = budget.getAmountLimit();
            BigDecimal remainingBefore = limit.subtract(currentSpent);
            BigDecimal totalAfter = currentSpent.add(amount);
            BigDecimal remainingAfter = limit.subtract(totalAfter);
            BigDecimal overBy = totalAfter.compareTo(limit) > 0 ? totalAfter.subtract(limit) : BigDecimal.ZERO;
            
            double utilBefore = limit.compareTo(BigDecimal.ZERO) > 0 ? 
                currentSpent.doubleValue() / limit.doubleValue() * 100 : 0;
            double utilAfter = limit.compareTo(BigDecimal.ZERO) > 0 ? 
                totalAfter.doubleValue() / limit.doubleValue() * 100 : 0;

            impact.put("hasBudget", true);
            impact.put("budgetId", budget.getBudgetId());
            impact.put("categoryId", budget.getCategory().getCategoryId());
            impact.put("categoryName", budget.getCategory().getName());
            impact.put("budgetLimit", limit);
            impact.put("spentBefore", currentSpent);
            impact.put("totalAfter", totalAfter);
            impact.put("overBy", overBy);
            impact.put("remainingBefore", remainingBefore);
            impact.put("remainingAfter", remainingAfter);
            impact.put("utilizationBefore", Math.round(utilBefore * 10.0) / 10.0);
            impact.put("utilizationAfter", Math.round(utilAfter * 10.0) / 10.0);

            if (totalAfter.compareTo(limit) > 0) {
                impact.put("isOverBudget", true);
                impact.put("severity", "HIGH");
                impact.put("aiMessage", String.format(
                    "Guardian Insight: This purchase will exceed your '%s' budget by ₹%s. You have ₹%s left, but this costs ₹%s. This will push your monthly utilization to %.1f%%. Proceed with caution!",
                    budget.getCategory().getName(), overBy, remainingBefore, amount, utilAfter
                ));
            } else if (utilAfter >= 80) {
                impact.put("severity", "MEDIUM");
                impact.put("aiMessage", String.format(
                    "Guardian Insight: This will put you at %.1f%% of your '%s' budget. You'll only have ₹%s left for the rest of the month. Keep an eye on your spending!",
                    utilAfter, budget.getCategory().getName(), remainingAfter
                ));
            }
        } else {
            impact.put("aiMessage", "No budget set for this category. Would you like to create one to track this spending?");
            impact.put("severity", "INFO");
        }

        return impact;
    }

    /**
     * Checks if a proposed expense amount will cause the user to exceed their budget limit 
     * for a specific category and month.
     */
    public boolean willExceedBudget(Long userId, Long categoryId, LocalDate month, BigDecimal amount) {
        LocalDate monthStart = month.withDayOfMonth(1);
        Optional<Budget> budgetOpt = getBudgetForCategoryAndMonth(userId, categoryId, monthStart);
        
        if (budgetOpt.isPresent()) {
            Budget budget = budgetOpt.get();
            // Recalculate spent amount to ensure we are checking against real-time data
            BigDecimal currentSpent = calculateSpentAmount(userId, categoryId, monthStart);
            return currentSpent.add(amount).compareTo(budget.getAmountLimit()) > 0;
        }
        return false;
    }
}
