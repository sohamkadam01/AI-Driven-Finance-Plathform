package com.College_project.project.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.College_project.project.DTOs.NetWorthTrendDTO;
import com.College_project.project.DTOs.SavingsRateDTO;
import com.College_project.project.enums.TransactionType;
import com.College_project.project.models.BankAccount;
import com.College_project.project.models.Investment;
import com.College_project.project.models.Transaction;
import com.College_project.project.models.User;
import com.College_project.project.repository.UserRepository;
import com.College_project.project.repository.bankAccountRepository;
import com.College_project.project.repository.investmentRepository;
import com.College_project.project.repository.transactionRepository;

@Service
public class NetWorthService {
    
    @Autowired
    private bankAccountRepository bankAccountRepository;
    
    @Autowired
    private investmentRepository investmentRepository;
    
    @Autowired
    private transactionRepository transactionRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private LiabilityService liabilityService;
    
    /**
     * Get current net worth snapshot
     */
    public NetWorthTrendDTO getCurrentNetWorth(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        NetWorthTrendDTO result = new NetWorthTrendDTO();
        
        // Calculate total assets
        BigDecimal totalBankBalance = getTotalBankBalance(user);
        BigDecimal totalInvestmentValue = getTotalInvestmentValue(user);
        BigDecimal totalAssets = totalBankBalance.add(totalInvestmentValue);
        
        // Calculate total liabilities (simplified - from negative transactions or loans)
        BigDecimal totalLiabilities = calculateTotalLiabilities(user);
        
        // Calculate net worth
        BigDecimal netWorth = totalAssets.subtract(totalLiabilities);
        
        result.setCurrentNetWorth(netWorth);
        result.setTotalAssets(totalAssets);
        result.setTotalLiabilities(totalLiabilities);
        
        return result;
    }
    
    /**
     * Get net worth trend over time
     * @param userId User ID
     * @param period "daily", "weekly", "monthly", "yearly"
     * @param months Number of months to look back (default 12)
     */
    public NetWorthTrendDTO getNetWorthTrend(Long userId, String period, int months) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        NetWorthTrendDTO result = new NetWorthTrendDTO();
        
        // Calculate current net worth
        BigDecimal currentBankBalance = getTotalBankBalance(user);
        BigDecimal currentInvestmentValue = getTotalInvestmentValue(user);
        BigDecimal currentAssets = currentBankBalance.add(currentInvestmentValue);
        BigDecimal currentLiabilities = calculateTotalLiabilities(user);
        BigDecimal currentNetWorth = currentAssets.subtract(currentLiabilities);
        
        result.setCurrentNetWorth(currentNetWorth);
        result.setTotalAssets(currentAssets);
        result.setTotalLiabilities(currentLiabilities);
        
        // Generate historical trend data
        List<NetWorthTrendDTO.NetWorthPoint> trendData = generateHistoricalTrend(user, period, months);
        result.setTrendData(trendData);
        
        // Generate monthly summary
        List<NetWorthTrendDTO.NetWorthPoint> monthlyTrend = generateMonthlyTrend(user, months);
        result.setMonthlyTrend(monthlyTrend);
        
        // Generate yearly summary
        List<NetWorthTrendDTO.NetWorthPoint> yearlyTrend = generateYearlyTrend(user);
        result.setYearlyTrend(yearlyTrend);
        
        // Calculate statistics
        calculateStatistics(result, trendData);
        
        return result;
    }
    
    /**
     * Generate historical net worth trend
     */
    private List<NetWorthTrendDTO.NetWorthPoint> generateHistoricalTrend(User user, String period, int months) {
        List<NetWorthTrendDTO.NetWorthPoint> trendData = new ArrayList<>();
        
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(months);
        
        // Get all bank accounts
        List<BankAccount> bankAccounts = bankAccountRepository.findByUser(user);
        
        // Get all investments
        List<Investment> investments = investmentRepository.findByUser(user);
        
        // Get all transactions for balance calculation
        List<Transaction> allTransactions = transactionRepository.findByUser(user);
        
        // Generate points based on period
        switch (period.toLowerCase()) {
            case "daily":
                trendData = generateDailyPoints(startDate, endDate, bankAccounts, investments, allTransactions, user);
                break;
            case "weekly":
                trendData = generateWeeklyPoints(startDate, endDate, bankAccounts, investments, allTransactions, user);
                break;
            case "monthly":
                trendData = generateMonthlyPoints(startDate, endDate, bankAccounts, investments, allTransactions, user);
                break;
            case "yearly":
                trendData = generateYearlyPoints(user, bankAccounts, investments);
                break;
            default:
                trendData = generateMonthlyPoints(startDate, endDate, bankAccounts, investments, allTransactions, user);
        }
        
        return trendData;
    }
    
    /**
     * Generate daily net worth points
     */
    private List<NetWorthTrendDTO.NetWorthPoint> generateDailyPoints(LocalDate startDate, LocalDate endDate,
                                                                       List<BankAccount> bankAccounts,
                                                                       List<Investment> investments,
                                                                       List<Transaction> transactions,
                                                                       User user) {
        List<NetWorthTrendDTO.NetWorthPoint> points = new ArrayList<>();
        
        long days = ChronoUnit.DAYS.between(startDate, endDate);
        
        // Get initial bank balances (simplified - use earliest transaction balance)
        BigDecimal initialBankBalance = getInitialBankBalance(bankAccounts, transactions, startDate);
        BigDecimal initialInvestmentValue = getTotalInvestmentValueAtDate(investments, startDate);
        
        BigDecimal runningBankBalance = initialBankBalance;
        BigDecimal runningInvestmentValue = initialInvestmentValue;
        
        // Group transactions by date
        Map<LocalDate, List<Transaction>> transactionsByDate = transactions.stream()
                .filter(t -> t.getTransactionDate() != null)
                .collect(Collectors.groupingBy(Transaction::getTransactionDate));
        
        for (int i = 0; i <= days; i++) {
            LocalDate currentDate = startDate.plusDays(i);
            
            // Update balances with transactions on this date
            if (transactionsByDate.containsKey(currentDate)) {
                for (Transaction t : transactionsByDate.get(currentDate)) {
                    if (t.getType() == TransactionType.INCOME) {
                        runningBankBalance = runningBankBalance.add(t.getAmount());
                    } else {
                        runningBankBalance = runningBankBalance.subtract(t.getAmount());
                    }
                }
            }
            
            // Update investment values (simplified - assume no daily change)
            // In real app, you'd have price history
            
            BigDecimal assets = runningBankBalance.add(runningInvestmentValue);
            BigDecimal liabilities = liabilityService.getTotalLiabilityAmount(user.getUserId());
            BigDecimal netWorth = assets.subtract(liabilities);
            
            NetWorthTrendDTO.NetWorthPoint point = new NetWorthTrendDTO.NetWorthPoint();
            point.setDate(currentDate);
            point.setNetWorth(netWorth);
            point.setAssets(assets);
            point.setLiabilities(liabilities);
            
            points.add(point);
        }
        
        return points;
    }
    
    /**
     * Generate weekly net worth points
     */
    private List<NetWorthTrendDTO.NetWorthPoint> generateWeeklyPoints(LocalDate startDate, LocalDate endDate,
                                                                        List<BankAccount> bankAccounts,
                                                                        List<Investment> investments,
                                                                        List<Transaction> transactions,
                                                                        User user) {
        List<NetWorthTrendDTO.NetWorthPoint> points = new ArrayList<>();
        
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            BigDecimal bankBalance = getBankBalanceAtDate(bankAccounts, transactions, currentDate);
            BigDecimal investmentValue = getTotalInvestmentValueAtDate(investments, currentDate);
            BigDecimal liabilities = liabilityService.getTotalLiabilityAmount(user.getUserId());
            BigDecimal netWorth = bankBalance.add(investmentValue).subtract(liabilities);
            
            NetWorthTrendDTO.NetWorthPoint point = new NetWorthTrendDTO.NetWorthPoint();
            point.setDate(currentDate);
            point.setNetWorth(netWorth);
            point.setAssets(bankBalance.add(investmentValue));
            point.setLiabilities(liabilities);
            
            points.add(point);
            currentDate = currentDate.plusWeeks(1);
        }
        
        return points;
    }
    
    /**
     * Generate monthly net worth points
     */
    private List<NetWorthTrendDTO.NetWorthPoint> generateMonthlyPoints(LocalDate startDate, LocalDate endDate,
                                                                         List<BankAccount> bankAccounts,
                                                                         List<Investment> investments,
                                                                         List<Transaction> transactions,
                                                                         User user) {
        List<NetWorthTrendDTO.NetWorthPoint> points = new ArrayList<>();
        
        LocalDate currentDate = startDate.withDayOfMonth(1);
        LocalDate endOfRange = endDate.withDayOfMonth(1);
        
        while (!currentDate.isAfter(endOfRange)) {
            LocalDate monthEnd = currentDate.withDayOfMonth(currentDate.lengthOfMonth());
            
            BigDecimal bankBalance = getBankBalanceAtDate(bankAccounts, transactions, monthEnd);
            BigDecimal investmentValue = getTotalInvestmentValueAtDate(investments, monthEnd);
            BigDecimal liabilities = liabilityService.getTotalLiabilityAmount(user.getUserId());
            BigDecimal netWorth = bankBalance.add(investmentValue).subtract(liabilities);
            
            NetWorthTrendDTO.NetWorthPoint point = new NetWorthTrendDTO.NetWorthPoint();
            point.setDate(currentDate);
            point.setNetWorth(netWorth);
            point.setAssets(bankBalance.add(investmentValue));
            point.setLiabilities(liabilities);
            
            points.add(point);
            currentDate = currentDate.plusMonths(1);
        }
        
        return points;
    }
    
    /**
     * Generate yearly net worth points
     */
    private List<NetWorthTrendDTO.NetWorthPoint> generateYearlyPoints(User user,
                                                                        List<BankAccount> bankAccounts,
                                                                        List<Investment> investments) {
        List<NetWorthTrendDTO.NetWorthPoint> points = new ArrayList<>();
        
        // Get the year of first transaction or account creation
        int startYear = getStartYear(user);
        int currentYear = LocalDate.now().getYear();
        
        for (int year = startYear; year <= currentYear; year++) {
            LocalDate yearStart = LocalDate.of(year, 1, 1);
            
            BigDecimal bankBalance = bankAccounts.stream()
                    .map(BankAccount::getCurrentBalance)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            BigDecimal investmentValue = investments.stream()
                    .map(Investment::getCurrentValue)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            BigDecimal liabilities = liabilityService.getTotalLiabilityAmount(user.getUserId());
            BigDecimal netWorth = bankBalance.add(investmentValue).subtract(liabilities);
            
            NetWorthTrendDTO.NetWorthPoint point = new NetWorthTrendDTO.NetWorthPoint();
            point.setDate(yearStart);
            point.setNetWorth(netWorth);
            point.setAssets(bankBalance.add(investmentValue));
            point.setLiabilities(liabilities);
            
            points.add(point);
        }
        
        return points;
    }
    
    /**
     * Generate monthly summary trend
     */
    private List<NetWorthTrendDTO.NetWorthPoint> generateMonthlyTrend(User user, int months) {
        List<NetWorthTrendDTO.NetWorthPoint> monthlyPoints = new ArrayList<>();
        
        LocalDate currentDate = LocalDate.now().withDayOfMonth(1);
        
        for (int i = 0; i < months; i++) {
            LocalDate monthStart = currentDate.minusMonths(i);
            LocalDate monthEnd = monthStart.withDayOfMonth(monthStart.lengthOfMonth());
            
            BigDecimal bankBalance = getBankBalanceAtDate(
                    bankAccountRepository.findByUser(user),
                    transactionRepository.findByUser(user),
                    monthEnd);
            
            BigDecimal investmentValue = getTotalInvestmentValueAtDate(
                    investmentRepository.findByUser(user),
                    monthEnd);
            
            BigDecimal liabilities = liabilityService.getTotalLiabilityAmount(user.getUserId());
            BigDecimal netWorth = bankBalance.add(investmentValue).subtract(liabilities);
            
            NetWorthTrendDTO.NetWorthPoint point = new NetWorthTrendDTO.NetWorthPoint();
            point.setDate(monthStart);
            point.setNetWorth(netWorth);
            point.setAssets(bankBalance.add(investmentValue));
            point.setLiabilities(liabilities);
            
            monthlyPoints.add(point);
        }
        
        // Reverse to show chronological order
        Collections.reverse(monthlyPoints);
        
        return monthlyPoints;
    }
    
    /**
     * Generate yearly summary trend
     */
    private List<NetWorthTrendDTO.NetWorthPoint> generateYearlyTrend(User user) {
        List<NetWorthTrendDTO.NetWorthPoint> yearlyPoints = new ArrayList<>();
        
        int startYear = getStartYear(user);
        int currentYear = LocalDate.now().getYear();
        
        for (int year = startYear; year <= currentYear; year++) {
            LocalDate yearStart = LocalDate.of(year, 1, 1);
            
            BigDecimal bankBalance = getTotalBankBalance(user);
            BigDecimal investmentValue = getTotalInvestmentValue(user);
            BigDecimal liabilities = liabilityService.getTotalLiabilityAmount(user.getUserId());
            BigDecimal netWorth = bankBalance.add(investmentValue).subtract(liabilities);
            
            NetWorthTrendDTO.NetWorthPoint point = new NetWorthTrendDTO.NetWorthPoint();
            point.setDate(yearStart);
            point.setNetWorth(netWorth);
            point.setAssets(bankBalance.add(investmentValue));
            point.setLiabilities(liabilities);
            
            yearlyPoints.add(point);
        }
        
        return yearlyPoints;
    }
    
    /**
     * Calculate statistics from trend data
     */
    private void calculateStatistics(NetWorthTrendDTO result, List<NetWorthTrendDTO.NetWorthPoint> trendData) {
        if (trendData == null || trendData.isEmpty()) {
            return;
        }
        
        BigDecimal highest = trendData.get(0).getNetWorth();
        BigDecimal lowest = trendData.get(0).getNetWorth();
        LocalDate highestDate = trendData.get(0).getDate();
        LocalDate lowestDate = trendData.get(0).getDate();
        BigDecimal sum = BigDecimal.ZERO;
        
        for (NetWorthTrendDTO.NetWorthPoint point : trendData) {
            BigDecimal netWorth = point.getNetWorth();
            sum = sum.add(netWorth);
            
            if (netWorth.compareTo(highest) > 0) {
                highest = netWorth;
                highestDate = point.getDate();
            }
            if (netWorth.compareTo(lowest) < 0) {
                lowest = netWorth;
                lowestDate = point.getDate();
            }
        }
        
        BigDecimal average = sum.divide(BigDecimal.valueOf(trendData.size()), 2, RoundingMode.HALF_UP);
        
        // Calculate percentage change from first to last
        BigDecimal firstValue = trendData.get(0).getNetWorth();
        BigDecimal lastValue = trendData.get(trendData.size() - 1).getNetWorth();
        BigDecimal percentageChange = BigDecimal.ZERO;
        
        if (firstValue.compareTo(BigDecimal.ZERO) != 0) {
            percentageChange = lastValue.subtract(firstValue)
                    .multiply(new BigDecimal("100"))
                    .divide(firstValue, 2, RoundingMode.HALF_UP);
        }
        
        result.setHighestNetWorth(highest);
        result.setLowestNetWorth(lowest);
        result.setAverageNetWorth(average);
        result.setPercentageChange(percentageChange);
        result.setHighestDate(highestDate);
        result.setLowestDate(lowestDate);
    }
    
    // ========== HELPER METHODS ==========
    
    private BigDecimal getTotalBankBalance(User user) {
        return bankAccountRepository.findByUser(user).stream()
                .filter(BankAccount::isActive)
                .map(BankAccount::getCurrentBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    private BigDecimal getTotalInvestmentValue(User user) {
        return investmentRepository.findByUser(user).stream()
                .map(Investment::getCurrentValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    private BigDecimal calculateTotalLiabilities(User user) {
        return liabilityService.getTotalLiabilityAmount(user.getUserId());
    }
    
    private BigDecimal getInitialBankBalance(List<BankAccount> bankAccounts, 
                                              List<Transaction> transactions, 
                                              LocalDate startDate) {
        // Simplified: Use current balance minus transactions after start date
        BigDecimal currentBalance = bankAccounts.stream()
                .map(BankAccount::getCurrentBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal transactionsAfterStart = transactions.stream()
                .filter(t -> t.getTransactionDate() != null && t.getTransactionDate().isAfter(startDate))
                .map(t -> t.getType() == TransactionType.INCOME ? t.getAmount().negate() : t.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return currentBalance.subtract(transactionsAfterStart);
    }
    
    private BigDecimal getBankBalanceAtDate(List<BankAccount> bankAccounts,
                                             List<Transaction> transactions,
                                             LocalDate date) {
        // Start with initial balance and add/subtract transactions up to date
        BigDecimal initialBalance = getInitialBankBalance(bankAccounts, transactions, date);
        
        BigDecimal transactionsUpToDate = transactions.stream()
                .filter(t -> t.getTransactionDate() != null && !t.getTransactionDate().isAfter(date))
                .map(t -> t.getType() == TransactionType.INCOME ? t.getAmount() : t.getAmount().negate())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return initialBalance.add(transactionsUpToDate);
    }
    
    private BigDecimal getTotalInvestmentValueAtDate(List<Investment> investments, LocalDate date) {
        // Simplified: Use current value for all investments
        // For real implementation, you'd need investment price history
        return investments.stream()
                .map(Investment::getCurrentValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    private int getStartYear(User user) {
        // Get earliest transaction date or account creation
        List<Transaction> transactions = transactionRepository.findByUser(user);
        
        if (!transactions.isEmpty()) {
            LocalDate earliestDate = transactions.stream()
                    .map(Transaction::getTransactionDate)
                    .filter(Objects::nonNull)
                    .min(LocalDate::compareTo)
                    .orElse(LocalDate.now());
            return earliestDate.getYear();
        }
        
        return LocalDate.now().getYear() - 1;
    }

    public SavingsRateDTO getCurrentSavingsRate(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        SavingsRateDTO result = new SavingsRateDTO();
        
        // Get current month's income and expenses
        LocalDate currentMonth = LocalDate.now().withDayOfMonth(1);
        LocalDate monthEnd = currentMonth.withDayOfMonth(currentMonth.lengthOfMonth());
        
        BigDecimal monthlyIncome = getTotalIncomeForPeriod(user, currentMonth, monthEnd);
        BigDecimal monthlyExpenses = getTotalExpensesForPeriod(user, currentMonth, monthEnd);
        BigDecimal monthlySavings = monthlyIncome.subtract(monthlyExpenses);
        
        // Calculate savings rate
        BigDecimal savingsRate = BigDecimal.ZERO;
        if (monthlyIncome.compareTo(BigDecimal.ZERO) > 0) {
            savingsRate = monthlySavings
                    .multiply(new BigDecimal("100"))
                    .divide(monthlyIncome, 2, RoundingMode.HALF_UP);
        }
        
        result.setCurrentMonthlyIncome(monthlyIncome);
        result.setCurrentMonthlyExpenses(monthlyExpenses);
        result.setCurrentMonthlySavings(monthlySavings);
        result.setCurrentSavingsRate(savingsRate);
        result.setSavingsStatus(getSavingsStatus(savingsRate));
        
        // Get monthly trend for last 12 months
        result.setMonthlyTrend(getMonthlySavingsTrend(user, 12));
        
        // Get yearly trend
        result.setYearlyTrend(getYearlySavingsTrend(user));
        
        // Calculate statistics
        calculateSavingsStatistics(result);
        
        // Calculate YTD savings
        result.setTotalSavingsYTD(calculateYTDSavings(user));
        
        // Project year-end savings
        result.setProjectedYearEndSavings(projectYearEndSavings(user, monthlySavings));
        
        // Generate insights and recommendations
        generateSavingsInsights(result);
        
        return result;
    }

    /**
     * Get savings rate trend over time
     */
    public List<SavingsRateDTO.MonthlySavingsData> getSavingsRateTrend(Long userId, int months) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return getMonthlySavingsTrend(user, months);
    }

    /**
     * Get total income for a specific period
     */
    private BigDecimal getTotalIncomeForPeriod(User user, LocalDate startDate, LocalDate endDate) {
        List<Transaction> transactions = transactionRepository
                .findByUserAndTransactionDateBetween(user, startDate, endDate);
        
        return transactions.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Get total expenses for a specific period
     */
    private BigDecimal getTotalExpensesForPeriod(User user, LocalDate startDate, LocalDate endDate) {
        List<Transaction> transactions = transactionRepository
                .findByUserAndTransactionDateBetween(user, startDate, endDate);
        
        return transactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Get monthly savings trend for last N months
     */
    private List<SavingsRateDTO.MonthlySavingsData> getMonthlySavingsTrend(User user, int months) {
        List<SavingsRateDTO.MonthlySavingsData> trend = new ArrayList<>();
        
        LocalDate currentDate = LocalDate.now().withDayOfMonth(1);
        
        for (int i = months - 1; i >= 0; i--) {
            LocalDate monthStart = currentDate.minusMonths(i);
            LocalDate monthEnd = monthStart.withDayOfMonth(monthStart.lengthOfMonth());
            
            BigDecimal income = getTotalIncomeForPeriod(user, monthStart, monthEnd);
            BigDecimal expenses = getTotalExpensesForPeriod(user, monthStart, monthEnd);
            BigDecimal savings = income.subtract(expenses);
            
            BigDecimal savingsRate = BigDecimal.ZERO;
            if (income.compareTo(BigDecimal.ZERO) > 0) {
                savingsRate = savings
                        .multiply(new BigDecimal("100"))
                        .divide(income, 2, RoundingMode.HALF_UP);
            }
            
            SavingsRateDTO.MonthlySavingsData data = new SavingsRateDTO.MonthlySavingsData();
            data.setMonth(monthStart);
            data.setIncome(income);
            data.setExpenses(expenses);
            data.setSavings(savings);
            data.setSavingsRate(savingsRate);
            
            trend.add(data);
        }
        
        return trend;
    }

    /**
     * Get yearly savings trend
     */
    private List<SavingsRateDTO.YearlySavingsData> getYearlySavingsTrend(User user) {
        List<SavingsRateDTO.YearlySavingsData> trend = new ArrayList<>();
        
        int currentYear = LocalDate.now().getYear();
        int startYear = getStartYear(user);
        
        for (int year = startYear; year <= currentYear; year++) {
            LocalDate yearStart = LocalDate.of(year, 1, 1);
            LocalDate yearEnd = LocalDate.of(year, 12, 31);
            
            BigDecimal totalIncome = getTotalIncomeForPeriod(user, yearStart, yearEnd);
            BigDecimal totalExpenses = getTotalExpensesForPeriod(user, yearStart, yearEnd);
            BigDecimal totalSavings = totalIncome.subtract(totalExpenses);
            
            BigDecimal avgSavingsRate = BigDecimal.ZERO;
            if (totalIncome.compareTo(BigDecimal.ZERO) > 0) {
                avgSavingsRate = totalSavings
                        .multiply(new BigDecimal("100"))
                        .divide(totalIncome, 2, RoundingMode.HALF_UP);
            }
            
            SavingsRateDTO.YearlySavingsData data = new SavingsRateDTO.YearlySavingsData();
            data.setYear(year);
            data.setTotalIncome(totalIncome);
            data.setTotalExpenses(totalExpenses);
            data.setTotalSavings(totalSavings);
            data.setAverageSavingsRate(avgSavingsRate);
            
            trend.add(data);
        }
        
        return trend;
    }

    /**
     * Get savings status based on rate
     */
    private String getSavingsStatus(BigDecimal savingsRate) {
        if (savingsRate.compareTo(new BigDecimal("30")) >= 0) {
            return "EXCELLENT";
        } else if (savingsRate.compareTo(new BigDecimal("20")) >= 0) {
            return "GOOD";
        } else if (savingsRate.compareTo(new BigDecimal("10")) >= 0) {
            return "AVERAGE";
        } else if (savingsRate.compareTo(BigDecimal.ZERO) >= 0) {
            return "POOR";
        } else {
            return "CRITICAL";
        }
    }

    /**
     * Calculate savings statistics from trend data
     */
    private void calculateSavingsStatistics(SavingsRateDTO result) {
        List<SavingsRateDTO.MonthlySavingsData> trend = result.getMonthlyTrend();
        
        if (trend == null || trend.isEmpty()) {
            return;
        }
        
        BigDecimal sum = BigDecimal.ZERO;
        BigDecimal best = trend.get(0).getSavingsRate();
        BigDecimal worst = trend.get(0).getSavingsRate();
        LocalDate bestMonth = trend.get(0).getMonth();
        LocalDate worstMonth = trend.get(0).getMonth();
        
        for (SavingsRateDTO.MonthlySavingsData data : trend) {
            BigDecimal rate = data.getSavingsRate();
            sum = sum.add(rate);
            
            if (rate.compareTo(best) > 0) {
                best = rate;
                bestMonth = data.getMonth();
            }
            if (rate.compareTo(worst) < 0) {
                worst = rate;
                worstMonth = data.getMonth();
            }
        }
        
        BigDecimal average = sum.divide(BigDecimal.valueOf(trend.size()), 2, RoundingMode.HALF_UP);
        
        result.setAverageSavingsRate(average);
        result.setBestSavingsRate(best);
        result.setWorstSavingsRate(worst);
        result.setBestMonth(bestMonth);
        result.setWorstMonth(worstMonth);
    }

    /**
     * Calculate Year-to-Date savings
     */
    private BigDecimal calculateYTDSavings(User user) {
        LocalDate yearStart = LocalDate.now().withDayOfYear(1);
        LocalDate today = LocalDate.now();
        
        BigDecimal totalIncome = getTotalIncomeForPeriod(user, yearStart, today);
        BigDecimal totalExpenses = getTotalExpensesForPeriod(user, yearStart, today);
        
        return totalIncome.subtract(totalExpenses);
    }

    /**
     * Project year-end savings based on current rate
     */
    private BigDecimal projectYearEndSavings(User user, BigDecimal currentMonthlySavings) {
        int remainingMonths = 12 - LocalDate.now().getMonthValue();
        BigDecimal currentYTDSavings = calculateYTDSavings(user);
        BigDecimal projectedAdditional = currentMonthlySavings.multiply(BigDecimal.valueOf(remainingMonths));
        
        return currentYTDSavings.add(projectedAdditional);
    }

    /**
     * Generate insights and recommendations based on savings rate
     */
    private void generateSavingsInsights(SavingsRateDTO result) {
        BigDecimal rate = result.getCurrentSavingsRate();
        StringBuilder insight = new StringBuilder();
        List<String> recommendations = new ArrayList<>();
        
        if (rate.compareTo(new BigDecimal("30")) >= 0) {
            insight.append("Excellent! You're saving more than 30% of your income. ");
            insight.append("This puts you on track for early financial independence. ");
            recommendations.add("Consider investing your surplus in diversified portfolios");
            recommendations.add("Look into tax-saving investment options");
            recommendations.add("Plan for major life goals like buying a house or retirement");
            
        } else if (rate.compareTo(new BigDecimal("20")) >= 0) {
            insight.append("Good job! You're saving 20% of your income. ");
            insight.append("This is a healthy savings rate. ");
            recommendations.add("Increase savings by 5% to reach excellent category");
            recommendations.add("Automate your savings with SIPs");
            recommendations.add("Review and optimize your investment returns");
            
        } else if (rate.compareTo(new BigDecimal("10")) >= 0) {
            insight.append("You're saving 10% of your income. ");
            insight.append("This is average. There's room for improvement. ");
            recommendations.add("Track your expenses to identify areas to cut back");
            recommendations.add("Try the 50-30-20 rule: 50% needs, 30% wants, 20% savings");
            recommendations.add("Set up automatic transfers to a savings account");
            
        } else if (rate.compareTo(BigDecimal.ZERO) >= 0) {
            insight.append("Your savings rate is low. ");
            insight.append("You're saving less than 10% of your income. ");
            recommendations.add("Create a budget and stick to it");
            recommendations.add("Reduce discretionary spending (dining out, entertainment)");
            recommendations.add("Look for ways to increase your income");
            recommendations.add("Start with saving just 5% and gradually increase");
            
        } else {
            insight.append("Critical: You're spending more than you earn! ");
            insight.append("This is unsustainable and needs immediate attention. ");
            recommendations.add("URGENT: Review all expenses immediately");
            recommendations.add("Cut all non-essential spending");
            recommendations.add("Create a debt repayment plan");
            recommendations.add("Consider financial counseling");
        }
        
        // Add comparison to best/worst
        if (result.getBestSavingsRate() != null && result.getBestSavingsRate().compareTo(rate) > 0) {
            insight.append(String.format("Your best savings month was %.1f%% in %s. ",
                    result.getBestSavingsRate(),
                    result.getBestMonth()));
        }
        
        result.setInsight(insight.toString());
        result.setRecommendations(recommendations);
    }
}
