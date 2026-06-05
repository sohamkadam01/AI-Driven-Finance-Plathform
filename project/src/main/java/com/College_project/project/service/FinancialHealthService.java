package com.College_project.project.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.College_project.project.DTOs.FinancialHealthDTO;
import com.College_project.project.DTOs.SavingsRateDTO;
import com.College_project.project.enums.TransactionType;
import com.College_project.project.models.BankAccount;
import com.College_project.project.models.Budget;
import com.College_project.project.models.Investment;
import com.College_project.project.models.RecurringTransaction;
import com.College_project.project.models.Transaction;
import com.College_project.project.models.User;
import com.College_project.project.repository.RecurringTransactionRepository;
import com.College_project.project.repository.UserRepository;
import com.College_project.project.repository.bankAccountRepository;
import com.College_project.project.repository.budgetRepository;
import com.College_project.project.repository.investmentRepository;
import com.College_project.project.repository.transactionRepository;

@Service
public class FinancialHealthService {
    
    @Autowired
    private transactionRepository transactionRepository;
    
    @Autowired
    private budgetRepository budgetRepository;
    
    @Autowired
    private bankAccountRepository bankAccountRepository;
    
    @Autowired
    private investmentRepository investmentRepository;
    
    @Autowired
    private RecurringTransactionRepository recurringTransactionRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NetWorthService netWorthService;
    
    /**
     * Calculate overall financial health score
     */
    public FinancialHealthDTO calculateFinancialHealth(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        FinancialHealthDTO health = new FinancialHealthDTO();
        health.setCalculatedDate(LocalDate.now());
        
        // Check if user has any active bank accounts
        List<BankAccount> activeAccounts = bankAccountRepository.findByUser(user).stream()
                .filter(BankAccount::isActive)
                .collect(Collectors.toList());

        if (activeAccounts.isEmpty()) {
            return getPendingSetupHealth(user);
        }

        // Calculate each component
        FinancialHealthDTO.ComponentScore savingsRateScore = calculateSavingsRateScore(user);
        FinancialHealthDTO.ComponentScore emergencyFundScore = calculateEmergencyFundScore(user);
        FinancialHealthDTO.ComponentScore debtToIncomeScore = calculateDebtToIncomeScore(user);
        FinancialHealthDTO.ComponentScore budgetAdherenceScore = calculateBudgetAdherenceScore(user);
        FinancialHealthDTO.ComponentScore investmentHealthScore = calculateInvestmentHealthScore(user);
        FinancialHealthDTO.ComponentScore billConsistencyScore = calculateBillConsistencyScore(user);
        
        // Set component scores
        health.setSavingsRateScore(savingsRateScore);
        health.setEmergencyFundScore(emergencyFundScore);
        health.setDebtToIncomeScore(debtToIncomeScore);
        health.setBudgetAdherenceScore(budgetAdherenceScore);
        health.setInvestmentHealthScore(investmentHealthScore);
        health.setBillConsistencyScore(billConsistencyScore);
        
        // Calculate overall score
        int overallScore = savingsRateScore.getWeightedScore() +
                          emergencyFundScore.getWeightedScore() +
                          debtToIncomeScore.getWeightedScore() +
                          budgetAdherenceScore.getWeightedScore() +
                          investmentHealthScore.getWeightedScore() +
                          billConsistencyScore.getWeightedScore();
        
        health.setOverallScore(overallScore);
        health.setGrade(getGrade(overallScore));
        health.setStatus(getStatus(overallScore));
        
        // Get historical scores
        health.setScoreHistory(getScoreHistory(user, 12));
        
        // Calculate score trend
        health.setScoreTrend(calculateScoreTrend(health.getScoreHistory()));
        
        // Generate strengths and weaknesses
        generateStrengthsAndWeaknesses(health);
        
        // Generate recommendations
        health.setRecommendations(generateRecommendations(health));
        
        // Generate summary
        health.setSummary(generateSummary(health));
        
        // Add detailed breakdown
        health.setDetails(getDetailedBreakdown(health, user));
        
        return health;
    }
    
    /**
     * Calculate Savings Rate Score (Weight: 25%)
     * Target: Save at least 20% of income
     * Requires at least 3+ months of transaction history
     */
    private FinancialHealthDTO.ComponentScore calculateSavingsRateScore(User user) {
        // Check if user has enough transaction history
        LocalDate threeMonthsAgo = LocalDate.now().minusMonths(3);
        List<Transaction> transactionHistory = transactionRepository
                .findByUserAndTransactionDateBetween(user, threeMonthsAgo, LocalDate.now());
        
        if (transactionHistory.isEmpty()) {
            FinancialHealthDTO.ComponentScore component = new FinancialHealthDTO.ComponentScore(
                "Savings Rate", 30, 25, "PENDING", "Need 3+ months of transaction data to calculate");
            component.setActualValue(BigDecimal.ZERO);
            component.setTargetValue("≥ 20%");
            return component;
        }
        
        SavingsRateDTO savingsRate = netWorthService.getCurrentSavingsRate(user.getUserId());
        BigDecimal rate = savingsRate.getCurrentSavingsRate();
        
        int score;
        String status;
        String message;
        
        if (rate.compareTo(new BigDecimal("30")) >= 0) {
            score = 100;
            status = "EXCELLENT";
            message = String.format("Excellent! You're saving %.1f%% of your income", rate);
        } else if (rate.compareTo(new BigDecimal("20")) >= 0) {
            score = 85;
            status = "GOOD";
            message = String.format("Good! You're saving %.1f%% of your income", rate);
        } else if (rate.compareTo(new BigDecimal("15")) >= 0) {
            score = 65;
            status = "FAIR";
            message = String.format("Fair. You're saving %.1f%% of your income. Aim for 20%%", rate);
        } else if (rate.compareTo(new BigDecimal("10")) >= 0) {
            score = 45;
            status = "POOR";
            message = String.format("Poor. Only saving %.1f%%. Try to save at least 20%%", rate);
        } else if (rate.compareTo(BigDecimal.ZERO) >= 0) {
            score = 25;
            status = "CRITICAL";
            message = String.format("Critical. You're saving only %.1f%% of your income", rate);
        } else {
            score = 0;
            status = "CRITICAL";
            message = "You're spending more than you earn! Immediate action needed";
        }
        
        FinancialHealthDTO.ComponentScore component = new FinancialHealthDTO.ComponentScore(
            "Savings Rate", score, 25, status, message);
        component.setActualValue(rate);
        component.setTargetValue("≥ 20%");
        
        return component;
    }
    
    /**
     * Calculate Emergency Fund Score (Weight: 20%)
     * Target: 6 months of expenses saved
     */
    private FinancialHealthDTO.ComponentScore calculateEmergencyFundScore(User user) {
        // Calculate monthly expenses
        LocalDate startDate = LocalDate.now().minusMonths(3);
        LocalDate endDate = LocalDate.now();
        
        List<Transaction> expenses = transactionRepository
                .findByUserAndTransactionDateBetween(user, startDate, endDate)
                .stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .collect(Collectors.toList());
        
        BigDecimal totalExpenses = expenses.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal monthlyExpense = totalExpenses.divide(BigDecimal.valueOf(3), 2, RoundingMode.HALF_UP);
        
        // Get total savings (bank balances)
        BigDecimal totalSavings = bankAccountRepository.findByUser(user).stream()
                .filter(BankAccount::isActive)
                .map(BankAccount::getCurrentBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Calculate months of expenses saved
        BigDecimal monthsSaved = BigDecimal.ZERO;
        if (monthlyExpense.compareTo(BigDecimal.ZERO) > 0) {
            monthsSaved = totalSavings.divide(monthlyExpense, 1, RoundingMode.HALF_UP);
        }
        
        int score;
        String status;
        String message;
        
        if (monthsSaved.compareTo(new BigDecimal("12")) >= 0) {
            score = 100;
            status = "EXCELLENT";
            message = String.format("Excellent! You have %.1f months of expenses saved", monthsSaved);
        } else if (monthsSaved.compareTo(new BigDecimal("6")) >= 0) {
            score = 85;
            status = "GOOD";
            message = String.format("Good! You have %.1f months of emergency fund", monthsSaved);
        } else if (monthsSaved.compareTo(new BigDecimal("3")) >= 0) {
            score = 60;
            status = "FAIR";
            message = String.format("Fair. You have %.1f months saved. Aim for 6 months", monthsSaved);
        } else if (monthsSaved.compareTo(new BigDecimal("1")) >= 0) {
            score = 35;
            status = "POOR";
            message = String.format("Poor. Only %.1f month of emergency fund", monthsSaved);
        } else {
            score = 15;
            status = "CRITICAL";
            message = "No emergency fund! Start building immediately";
        }
        
        FinancialHealthDTO.ComponentScore component = new FinancialHealthDTO.ComponentScore(
            "Emergency Fund", score, 20, status, message);
        component.setActualValue(monthsSaved);
        component.setTargetValue("≥ 6 months");
        
        return component;
    }
    
    /**
     * Calculate Debt-to-Income Ratio Score (Weight: 20%)
     * Target: DTI < 36%
     */
    private FinancialHealthDTO.ComponentScore calculateDebtToIncomeScore(User user) {
        BigDecimal monthlyIncome = getMonthlyIncome(user);
        BigDecimal netWorth = netWorthService.getCurrentNetWorth(user.getUserId()).getCurrentNetWorth();
        
        int score;
        String status;
        String message;
        
        // Need meaningful income data
        if (monthlyIncome.compareTo(BigDecimal.ZERO) <= 0) {
            score = 35;
            status = "POOR";
            message = "No income recorded. Add income transactions to calculate DTI properly.";
        } else if (netWorth.compareTo(BigDecimal.ZERO) < 0) {
            // Negative net worth indicates debt
            BigDecimal dtiRatio = netWorth.abs().divide(monthlyIncome, 2, RoundingMode.HALF_UP);
            
            if (dtiRatio.compareTo(new BigDecimal("1")) < 0) {  // Less than 1 month of debt
                score = 60;
                status = "FAIR";
                message = String.format("Fair. Your debt ratio is %.1f months of income", dtiRatio);
            } else if (dtiRatio.compareTo(new BigDecimal("3")) < 0) {  // Less than 3 months
                score = 40;
                status = "POOR";
                message = String.format("Poor. Your debt is %.1f months of income. Focus on debt reduction.", dtiRatio);
            } else {
                score = 20;
                status = "CRITICAL";
                message = String.format("Critical. Your debt is %.1f months of income! Seek help immediately.", dtiRatio);
            }
        } else if (netWorth.compareTo(BigDecimal.ZERO) == 0) {
            score = 50;
            status = "PENDING";
            message = "Neutral. No net worth recorded yet. Add accounts to begin tracking.";
        } else {
            // Positive net worth - good sign
            score = 75;
            status = "GOOD";
            message = "Good! Positive net worth indicates solid financial foundation.";
        }
        
        FinancialHealthDTO.ComponentScore component = new FinancialHealthDTO.ComponentScore(
            "Debt-to-Income", score, 20, status, message);
        component.setTargetValue("DTI < 36% of income");
        
        return component;
    }
    
    /**
     * Calculate Budget Adherence Score (Weight: 15%)
     * How well user sticks to their budgets
     */
    private FinancialHealthDTO.ComponentScore calculateBudgetAdherenceScore(User user) {
        LocalDate currentMonth = LocalDate.now().withDayOfMonth(1);
        List<Budget> budgets = budgetRepository.findByUserAndMonth(user, currentMonth);
        
        if (budgets.isEmpty()) {
            FinancialHealthDTO.ComponentScore component = new FinancialHealthDTO.ComponentScore(
                "Budget Adherence", 50, 15, "FAIR", "No budgets set. Create budgets to track spending");
            component.setTargetValue("Create monthly budgets");
            return component;
        }
        
        int totalScore = 0;
        int budgetsCount = 0;
        
        for (Budget budget : budgets) {
            BigDecimal spentPercentage = budget.getSpentPercentage();
            
            if (spentPercentage.compareTo(new BigDecimal("80")) <= 0) {
                totalScore += 100; // Under budget
            } else if (spentPercentage.compareTo(new BigDecimal("100")) <= 0) {
                totalScore += 70; // Within budget
            } else {
                totalScore += 30; // Over budget
            }
            budgetsCount++;
        }
        
        int averageScore = budgetsCount > 0 ? totalScore / budgetsCount : 50;
        
        String status;
        String message;
        
        if (averageScore >= 80) {
            status = "GOOD";
            message = "Good! You're staying within your budgets";
        } else if (averageScore >= 60) {
            status = "FAIR";
            message = "Fair. You sometimes exceed your budgets";
        } else {
            status = "POOR";
            message = "Poor. You frequently exceed your budgets";
        }
        
        FinancialHealthDTO.ComponentScore component = new FinancialHealthDTO.ComponentScore(
            "Budget Adherence", averageScore, 15, status, message);
        component.setTargetValue("Stay within 80% of budget");
        
        return component;
    }
    
    /**
     * Calculate Investment Health Score (Weight: 10%)
     */
    private FinancialHealthDTO.ComponentScore calculateInvestmentHealthScore(User user) {
        List<Investment> investments = investmentRepository.findByUser(user);
        
        if (investments.isEmpty()) {
            FinancialHealthDTO.ComponentScore component = new FinancialHealthDTO.ComponentScore(
                "Investment Health", 40, 10, "POOR", "No investments yet. Start investing for long-term growth");
            component.setTargetValue("Start investing 15% of income");
            return component;
        }
        
        BigDecimal totalInvested = investments.stream()
                .map(Investment::getAmountInvested)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalCurrentValue = investments.stream()
                .map(Investment::getCurrentValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalReturns = BigDecimal.ZERO;
        if (totalInvested.compareTo(BigDecimal.ZERO) > 0) {
            totalReturns = totalCurrentValue.subtract(totalInvested)
                    .multiply(new BigDecimal("100"))
                    .divide(totalInvested, 2, RoundingMode.HALF_UP);
        }
        
        int score;
        String status;
        String message;
        
        if (totalReturns.compareTo(new BigDecimal("12")) >= 0) {
            score = 100;
            status = "EXCELLENT";
            message = String.format("Excellent! Your portfolio returns %.1f%%", totalReturns);
        } else if (totalReturns.compareTo(new BigDecimal("8")) >= 0) {
            score = 80;
            status = "GOOD";
            message = String.format("Good! Your portfolio returns %.1f%%", totalReturns);
        } else if (totalReturns.compareTo(BigDecimal.ZERO) >= 0) {
            score = 60;
            status = "FAIR";
            message = String.format("Fair. Your portfolio returns %.1f%%", totalReturns);
        } else {
            score = 30;
            status = "POOR";
            message = "Poor. Your investments are underperforming";
        }
        
        FinancialHealthDTO.ComponentScore component = new FinancialHealthDTO.ComponentScore(
            "Investment Health", score, 10, status, message);
        component.setActualValue(totalReturns);
        component.setTargetValue("≥ 12% returns");
        
        return component;
    }
    
    /**
     * Calculate Bill Payment Consistency Score (Weight: 10%)
     * Requires actual payment history verification
     */
    private FinancialHealthDTO.ComponentScore calculateBillConsistencyScore(User user) {
        List<RecurringTransaction> bills = recurringTransactionRepository.findByUserAndIsActiveTrue(user);
        
        if (bills.isEmpty()) {
            FinancialHealthDTO.ComponentScore component = new FinancialHealthDTO.ComponentScore(
                "Bill Consistency", 40, 10, "POOR", "No recurring bills tracked. Set up automatic payments");
            component.setTargetValue("Track recurring bills");
            return component;
        }
        
        // Check if bills have been paid recently
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        List<Transaction> recentPayments = transactionRepository
                .findByUserAndTransactionDateBetween(user, thirtyDaysAgo, LocalDate.now())
                .stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .collect(Collectors.toList());
        
        // Score based on payment activity
        int score;
        String status;
        String message;
        
        if (recentPayments.size() >= bills.size()) {
            // Likely bills were paid
            score = 80;
            status = "GOOD";
            message = String.format("Good! Tracking %d recurring bills with recent payments", bills.size());
        } else if (recentPayments.size() >= bills.size() / 2) {
            // Some bills paid
            score = 60;
            status = "FAIR";
            message = String.format("Fair. Not all recurring bills have recent payments");
        } else {
            // No recent payment activity
            score = 35;
            status = "POOR";
            message = "Poor. No recent payment activity for tracked bills";
        }
        
        FinancialHealthDTO.ComponentScore component = new FinancialHealthDTO.ComponentScore(
            "Bill Consistency", score, 10, status, message);
        component.setTargetValue("Pay all bills on time every month");
        
        return component;
    }
    
    /**
     * Get grade based on score
     */
    private String getGrade(int score) {
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
     * Get status based on score
     */
    private String getStatus(int score) {
        if (score >= 80) return "EXCELLENT";
        if (score >= 65) return "GOOD";
        if (score >= 50) return "FAIR";
        if (score >= 35) return "POOR";
        return "CRITICAL";
    }
    
    /**
     * Get historical scores
     */
    private List<FinancialHealthDTO.HistoricalScore> getScoreHistory(User user, int months) {
        List<FinancialHealthDTO.HistoricalScore> history = new ArrayList<>();
        
        LocalDate currentDate = LocalDate.now();
        
        // Simplified: Calculate for last few months
        // In real implementation, store historical scores in database
        
        for (int i = months; i >= 0; i--) {
            LocalDate monthDate = currentDate.minusMonths(i).withDayOfMonth(1);
            // Placeholder - use stored values or calculate
            int simulatedScore = 65 + (i * 2); // Simulated improvement over time
            history.add(new FinancialHealthDTO.HistoricalScore(monthDate, simulatedScore, getGrade(simulatedScore)));
        }
        
        return history;
    }
    
    /**
     * Calculate score trend
     */
    private Map<String, BigDecimal> calculateScoreTrend(List<FinancialHealthDTO.HistoricalScore> history) {
        Map<String, BigDecimal> trend = new HashMap<>();
        
        if (history == null || history.size() < 2) {
            trend.put("trend", BigDecimal.ZERO);
            return trend;
        }
        
        int firstScore = history.get(0).getScore();
        int lastScore = history.get(history.size() - 1).getScore();
        BigDecimal change = BigDecimal.valueOf(lastScore - firstScore);
        
        trend.put("change", change);
        trend.put("percentageChange", change.multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(firstScore), 2, RoundingMode.HALF_UP));
        
        if (change.compareTo(BigDecimal.ZERO) > 0) {
            trend.put("direction", BigDecimal.ONE); // Improving
        } else if (change.compareTo(BigDecimal.ZERO) < 0) {
            trend.put("direction", BigDecimal.valueOf(-1)); // Declining
        } else {
            trend.put("direction", BigDecimal.ZERO); // Stable
        }
        
        return trend;
    }
    
    /**
     * Generate strengths and weaknesses
     */
    private void generateStrengthsAndWeaknesses(FinancialHealthDTO health) {
        List<String> strengths = new ArrayList<>();
        List<String> weaknesses = new ArrayList<>();
        
        // Check each component
        checkComponent(health.getSavingsRateScore(), strengths, weaknesses);
        checkComponent(health.getEmergencyFundScore(), strengths, weaknesses);
        checkComponent(health.getDebtToIncomeScore(), strengths, weaknesses);
        checkComponent(health.getBudgetAdherenceScore(), strengths, weaknesses);
        checkComponent(health.getInvestmentHealthScore(), strengths, weaknesses);
        checkComponent(health.getBillConsistencyScore(), strengths, weaknesses);
        
        health.setStrengths(strengths);
        health.setWeaknesses(weaknesses);
    }
    
    private void checkComponent(FinancialHealthDTO.ComponentScore component, 
                                 List<String> strengths, List<String> weaknesses) {
        if (component.getScore() >= 80) {
            strengths.add(component.getName());
        } else if (component.getScore() <= 40) {
            weaknesses.add(component.getName());
        }
    }
    
    /**
     * Generate recommendations
     */
    private List<String> generateRecommendations(FinancialHealthDTO health) {
        List<String> recommendations = new ArrayList<>();
        
        // Priority 1: Fix critical issues
        if (health.getSavingsRateScore().getScore() < 40) {
            recommendations.add("🚨 Increase your savings rate to at least 20% of income");
        }
        if (health.getEmergencyFundScore().getScore() < 40) {
            recommendations.add("🚨 Build an emergency fund of 6 months expenses");
        }
        if (health.getDebtToIncomeScore().getScore() < 40) {
            recommendations.add("🚨 Reduce debt to improve your debt-to-income ratio");
        }
        
        // Priority 2: Improve fair areas
        if (health.getBudgetAdherenceScore().getScore() >= 40 && health.getBudgetAdherenceScore().getScore() < 70) {
            recommendations.add("📊 Create and stick to a monthly budget");
        }
        if (health.getInvestmentHealthScore().getScore() >= 40 && health.getInvestmentHealthScore().getScore() < 70) {
            recommendations.add("📈 Diversify your investment portfolio");
        }
        
        // Priority 3: Optimize good areas
        if (health.getSavingsRateScore().getScore() >= 80) {
            recommendations.add("💰 Consider investing your surplus savings for higher returns");
        }
        
        // General recommendations
        if (recommendations.isEmpty()) {
            recommendations.add("✅ Keep up the good work! Maintain your financial discipline");
            recommendations.add("📊 Review your financial goals quarterly");
            recommendations.add("🔄 Rebalance your portfolio annually");
        }
        
        return recommendations;
    }
    
    /**
     * Generate summary
     */
    private String generateSummary(FinancialHealthDTO health) {
        StringBuilder summary = new StringBuilder();
        
        summary.append(String.format("Your Financial Health Score is %d/%d (%s). ",
                health.getOverallScore(), 100, health.getStatus()));
        
        if (health.getOverallScore() >= 80) {
            summary.append("Excellent financial health! You're on the right track.");
        } else if (health.getOverallScore() >= 65) {
            summary.append("Good financial health. There's room for improvement.");
        } else if (health.getOverallScore() >= 50) {
            summary.append("Fair financial health. Focus on improving your weaker areas.");
        } else {
            summary.append("Poor financial health. Take immediate action on the recommendations.");
        }
        
        return summary.toString();
    }
    
    /**
     * Get detailed breakdown
     */
    private Map<String, Object> getDetailedBreakdown(FinancialHealthDTO health, User user) {
        Map<String, Object> details = new HashMap<>();
        
        details.put("monthlyIncome", getMonthlyIncome(user));
        details.put("totalSavings", bankAccountRepository.findByUser(user).stream()
                .map(BankAccount::getCurrentBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        details.put("totalInvestments", investmentRepository.findByUser(user).stream()
                .map(Investment::getCurrentValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        details.put("activeBudgets", budgetRepository.findByUser(user).size());
        details.put("activeBills", recurringTransactionRepository.findByUserAndIsActiveTrue(user).size());
        
        return details;
    }
    
    /**
     * Helper: Get monthly income
     */
    private BigDecimal getMonthlyIncome(User user) {
        LocalDate startDate = LocalDate.now().minusMonths(3);
        LocalDate endDate = LocalDate.now();
        
        List<Transaction> transactions = transactionRepository
                .findByUserAndTransactionDateBetween(user, startDate, endDate);
        
        BigDecimal totalIncome = transactions.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return totalIncome.divide(BigDecimal.valueOf(3), 2, RoundingMode.HALF_UP);
    }

    /**
     * Generate a special DTO for new users with no data
     */
    private FinancialHealthDTO getPendingSetupHealth(User user) {
        FinancialHealthDTO health = new FinancialHealthDTO();
        health.setOverallScore(0);
        health.setGrade("N/A");
        health.setStatus("PENDING_SETUP");
        health.setCalculatedDate(LocalDate.now());
        health.setSummary("Welcome to your financial journey! Add a bank account to calculate your health score.");
        
        health.setRecommendations(Arrays.asList(
            "🏦 Connect your first bank account",
            "📊 Set up your monthly budgets",
            "📝 Categorize your recent transactions"
        ));
        
        health.setStrengths(new ArrayList<>());
        health.setWeaknesses(new ArrayList<>());
        
        // Set empty/pending components
        health.setSavingsRateScore(new FinancialHealthDTO.ComponentScore("Savings Rate", 0, 25, "PENDING", "Add data to calculate"));
        health.setEmergencyFundScore(new FinancialHealthDTO.ComponentScore("Emergency Fund", 0, 20, "PENDING", "Add data to calculate"));
        health.setDebtToIncomeScore(new FinancialHealthDTO.ComponentScore("Debt-to-Income", 0, 20, "PENDING", "Add data to calculate"));
        health.setBudgetAdherenceScore(new FinancialHealthDTO.ComponentScore("Budget Adherence", 0, 15, "PENDING", "Create budgets first"));
        health.setInvestmentHealthScore(new FinancialHealthDTO.ComponentScore("Investment Health", 0, 10, "PENDING", "Add investments first"));
        health.setBillConsistencyScore(new FinancialHealthDTO.ComponentScore("Bill Consistency", 0, 10, "PENDING", "Track bills first"));
        
        return health;
    }
}