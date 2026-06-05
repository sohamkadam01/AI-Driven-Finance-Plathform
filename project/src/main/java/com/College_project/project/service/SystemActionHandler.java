package com.College_project.project.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.College_project.project.DTOs.TransactionFilterRequest;
import com.College_project.project.DTOs.TransactionFilterResponse;
import com.College_project.project.DTOs.TransactionRequest;
import com.College_project.project.DTOs.TransactionResponse;
import com.College_project.project.enums.TransactionType;
import com.College_project.project.models.BankAccount;
import com.College_project.project.models.RecurringTransaction;
import com.College_project.project.models.User;
import com.College_project.project.repository.RecurringTransactionRepository;
import com.College_project.project.repository.UserRepository;
import com.College_project.project.repository.bankAccountRepository;
@Service
public class SystemActionHandler {
    
    private static final Logger log = LoggerFactory.getLogger(SystemActionHandler.class);
    
    @Autowired
private RecurringTransactionRepository recurringTransactionRepository;
    @Autowired
    private TransactionService transactionService;
    
    @Autowired
    private NetWorthService netWorthService;
    
    @Autowired
    private BudgetService budgetService;
    
    @Autowired
    private BillReminderService billReminderService;
    
    @Autowired
    private bankAccountRepository bankAccountRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AIInvestmentAdviceService investmentService;
    
    // ========== EXISTING METHODS ==========
    
    /**
     * Handle get balance action
     */
    public String handleGetBalance(Long userId) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) return "User not found";
            
            List<BankAccount> accounts = bankAccountRepository.findByUserAndIsActive(user, true);
            if (accounts.isEmpty()) {
                return "You don't any bank accounts linked. Please add an account first.";
            }
            
            BigDecimal totalBalance = accounts.stream()
                    .map(BankAccount::getCurrentBalance)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            StringBuilder response = new StringBuilder();
            response.append("💰 **Account Balances:**\n\n");
            
            for (BankAccount acc : accounts) {
                response.append(String.format("• %s: ₹%s\n", 
                    acc.getBankName(), acc.getCurrentBalance().toPlainString()));
            }
            
            response.append(String.format("\n**Total Balance: ₹%s**", totalBalance.toPlainString()));
            
            return response.toString();
            
        } catch (Exception e) {
            return "I couldn't fetch your balance. Please try again later.";
        }
    }
    
    /**
     * Handle get net worth action
     */
    public String handleGetNetWorth(Long userId) {
        try {
            var netWorth = netWorthService.getCurrentNetWorth(userId);
            
            return String.format("📊 **Your Net Worth Snapshot**\n\n" +
                "• **Total Assets:** ₹%s\n" +
                "• **Total Liabilities:** ₹%s\n" +
                "• **Net Worth:** ₹%s\n\n" +
                "%s",
                netWorth.getTotalAssets().toPlainString(),
                netWorth.getTotalLiabilities().toPlainString(),
                netWorth.getCurrentNetWorth().toPlainString(),
                netWorth.getCurrentNetWorth().compareTo(BigDecimal.ZERO) >= 0 ? 
                    "🎉 Your net worth is positive! Keep growing your wealth." :
                    "⚠️ Your net worth is negative. Focus on reducing debt.");
                
        } catch (Exception e) {
            return "I couldn't calculate your net worth. Please make sure you have bank accounts and investments added.";
        }
    }
    
    /**
     * Handle get savings rate action
     */
    public String handleGetSavingsRate(Long userId) {
        try {
            var savings = netWorthService.getCurrentSavingsRate(userId);
            
            String statusMessage;
            if (savings.getSavingsStatus().equals("EXCELLENT")) {
                statusMessage = "🎯 Excellent! You're saving over 30% of your income.";
            } else if (savings.getSavingsStatus().equals("GOOD")) {
                statusMessage = "👍 Good job! You're saving 20% of your income.";
            } else if (savings.getSavingsStatus().equals("AVERAGE")) {
                statusMessage = "📊 You're saving 10% of your income. Room for improvement.";
            } else {
                statusMessage = "⚠️ Your savings rate is low. Try to reduce expenses.";
            }
            
            return String.format("💰 **Savings Rate Report**\n\n" +
                "• **Monthly Income:** ₹%s\n" +
                "• **Monthly Expenses:** ₹%s\n" +
                "• **Monthly Savings:** ₹%s\n" +
                "• **Savings Rate:** %.1f%%\n\n" +
                "%s",
                savings.getCurrentMonthlyIncome().toPlainString(),
                savings.getCurrentMonthlyExpenses().toPlainString(),
                savings.getCurrentMonthlySavings().toPlainString(),
                savings.getCurrentSavingsRate(),
                statusMessage);
                
        } catch (Exception e) {
            return "I couldn't calculate your savings rate. Please add some transactions first.";
        }
    }
    
    /**
     * Handle get spending action
     */
    public String handleGetSpending(Long userId) {
        try {
            LocalDate startDate = LocalDate.now().withDayOfMonth(1);
            LocalDate endDate = LocalDate.now();
            
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) return "User not found";
            
            BigDecimal spending = transactionService.getTotalSpending(userId, startDate, endDate);
            
            return String.format("💸 **This Month's Spending**\n\n" +
                "• **Total Spending:** ₹%s\n" +
                "• **Period:** %s to %s\n\n" +
                "Track your expenses to stay within budget!",
                spending.toPlainString(), startDate.toString(), endDate.toString());
                
        } catch (Exception e) {
            return "I couldn't fetch your spending data.";
        }
    }
    
    // ========== NEW METHOD: Handle Get Income ==========
    public String handleGetIncome(Long userId) {
        try {
            LocalDate startDate = LocalDate.now().withDayOfMonth(1);
            LocalDate endDate = LocalDate.now();
            
            BigDecimal income = transactionService.getTotalIncome(userId, startDate, endDate);
            
            return String.format("💵 **This Month's Income**\n\n" +
                "• **Total Income:** ₹%s\n" +
                "• **Period:** %s to %s\n\n" +
                "Great job tracking your earnings! 🎯",
                income.toPlainString(), startDate.toString(), endDate.toString());
                
        } catch (Exception e) {
            return "I couldn't fetch your income data.";
        }
    }
    
    // ========== NEW METHOD: Handle Get Budget Status (alias for existing) ==========
    public String handleGetBudgetStatus(Long userId) {
        try {
            List<com.College_project.project.DTOs.BudgetResponse> budgets = 
                budgetService.getUserBudgets(userId, LocalDate.now().withDayOfMonth(1));
            
            if (budgets.isEmpty()) {
                return "You don't have any budgets set up. Create a budget to track your spending!";
            }
            
            StringBuilder response = new StringBuilder();
            response.append("📋 **Budget Status**\n\n");
            
            for (var budget : budgets) {
                double percentage = budget.getSpentAmount().doubleValue() / budget.getAmountLimit().doubleValue() * 100;
                String emoji = percentage >= 90 ? "🔴" : (percentage >= 70 ? "🟡" : "🟢");
                
                response.append(String.format("%s **%s**: ₹%s / ₹%s (%.0f%%)\n",
                    emoji, budget.getCategoryName(), 
                    budget.getSpentAmount().toPlainString(),
                    budget.getAmountLimit().toPlainString(), percentage));
            }
            
            return response.toString();
            
        } catch (Exception e) {
            return "I couldn't fetch your budget data.";
        }
    }
    
    // ========== NEW METHOD: Handle Mark Bill Paid ==========
// In SystemActionHandler.java, replace the handleMarkBillPaid method with:
public String handleMarkBillPaid(Long userId, String message) {
    try {
        // Extract bill ID or name from message
        String billIdentifier = extractBillIdentifier(message);
        if (billIdentifier == null) {
            return "Please specify which bill you want to mark as paid. For example: 'Mark electricity bill as paid'";
        }
        
        // Get all recurring transactions for the user
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return "User not found";
        
        List<RecurringTransaction> bills = recurringTransactionRepository.findByUserAndIsActiveTrue(user);
        
        RecurringTransaction foundBill = null;
        for (RecurringTransaction bill : bills) {
            if (bill.getName().toLowerCase().contains(billIdentifier.toLowerCase())) {
                foundBill = bill;
                break;
            }
        }
        
        if (foundBill == null) {
            return String.format("❌ I couldn't find a bill matching '%s'. Please check the bill name and try again.", 
                billIdentifier);
        }
        
        // Mark as paid using the correct method signature
        billReminderService.markBillAsPaid(foundBill.getRecurringId(), userId, null, null);
        
        return String.format("✅ **Bill marked as paid!**\n\n• Bill: %s\n• Amount: ₹%s\n• Date: %s\n\nGreat job staying on top of your bills! 🎉",
            foundBill.getName(), foundBill.getAmount().toPlainString(), LocalDate.now());
        
    } catch (Exception e) {
        log.error("Error marking bill as paid", e);
        return "I couldn't mark the bill as paid. Please try again.";
    }
}
    
    // ========== NEW METHOD: Handle Add Expense with extracted data ==========
    public String handleAddExpenseWithData(Long userId, BigDecimal amount, String description) {
        try {
            if (amount == null) {
                return "I couldn't understand the amount. Please specify like: 'Spent ₹500 on lunch'";
            }
            
            if (description == null || description.isEmpty()) {
                description = "Expense";
            }
            
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) return "User not found";
            
            List<BankAccount> accounts = bankAccountRepository.findByUserAndIsActive(user, true);
            if (accounts.isEmpty()) {
                return "You need to add a bank account first to record expenses.";
            }
            
            TransactionRequest request = new TransactionRequest();
            request.setAmount(amount);
            request.setType(TransactionType.EXPENSE);
            request.setDescription(description);
            request.setTransactionDate(LocalDate.now());
            
            transactionService.addTransaction(userId, accounts.get(0).getAccountId(), request);
            
            return String.format("✅ **Expense Added!**\n\n• Amount: ₹%s\n• Description: %s\n• Date: %s\n\nYour balance has been updated.",
                amount.toPlainString(), description, LocalDate.now());
                
        } catch (Exception e) {
            return "I couldn't add your expense. Please try again.";
        }
    }
    
    // ========== NEW METHOD: Handle Add Expense with amount only ==========
    public String handleAddExpense(Long userId, BigDecimal amount, String message) {
        try {
            String description = extractDescriptionFromMessage(message);
            return handleAddExpenseWithData(userId, amount, description);
        } catch (Exception e) {
            return "I couldn't add your expense. Please try again.";
        }
    }
    
    // ========== NEW METHOD: Handle Add Income with extracted data ==========
    public String handleAddIncomeWithData(Long userId, BigDecimal amount, String description) {
        try {
            if (amount == null) {
                return "I couldn't understand the amount. Please specify like: 'Earned ₹50000 from salary'";
            }
            
            if (description == null || description.isEmpty()) {
                description = "Income";
            }
            
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) return "User not found";
            
            List<BankAccount> accounts = bankAccountRepository.findByUserAndIsActive(user, true);
            if (accounts.isEmpty()) {
                return "You need to add a bank account first to record income.";
            }
            
            TransactionRequest request = new TransactionRequest();
            request.setAmount(amount);
            request.setType(TransactionType.INCOME);
            request.setDescription(description);
            request.setTransactionDate(LocalDate.now());
            
            transactionService.addTransaction(userId, accounts.get(0).getAccountId(), request);
            
            return String.format("✅ **Income Added!**\n\n• Amount: ₹%s\n• Source: %s\n• Date: %s\n\nYour balance has been updated. Great job! 🎉",
                amount.toPlainString(), description, LocalDate.now());
                
        } catch (Exception e) {
            return "I couldn't add your income. Please try again.";
        }
    }
    
    // ========== NEW METHOD: Handle Add Income with amount only ==========
    public String handleAddIncome(Long userId, BigDecimal amount, String message) {
        try {
            String description = extractDescriptionFromMessage(message);
            return handleAddIncomeWithData(userId, amount, description);
        } catch (Exception e) {
            return "I couldn't add your income. Please try again.";
        }
    }
    
    // ========== NEW METHOD: Handle Add Income with IntentDetectionService ==========
    public String handleAddIncome(Long userId, String message, IntentDetectionService intentService) {
        try {
            BigDecimal amount = intentService.extractAmount(message);
            String description = intentService.extractDescription(message);
            return handleAddIncomeWithData(userId, amount, description);
        } catch (Exception e) {
            return "I couldn't add your income. Please try again.";
        }
    }
    
    // ========== NEW METHOD: Handle Get Investment Summary ==========
    public String handleGetInvestmentSummary(Long userId) {
        try {
            String advice = investmentService.getInvestmentAdvice(userId);
            
            return String.format("📈 **Investment Portfolio Summary**\n\n" +
                "%s\n\n" +
                "💡 **Tip:** Regular investments and diversification are key to building long-term wealth!",
                advice);
                
        } catch (Exception e) {
            return "📈 I'm having trouble fetching your investment summary. Please ensure you have investments added to your portfolio.";
        }
    }
    
    public String handleFinanceEducation(String message) {
        String msg = message == null ? "" : message.toLowerCase();

        if (msg.contains("sip")) {
            return "**SIP - Systematic Investment Plan**\n\n"
                + "A SIP lets you invest a fixed amount regularly, usually monthly, into a mutual fund.\n\n"
                + "• Good for disciplined long-term investing\n"
                + "• Reduces timing risk through rupee-cost averaging\n"
                + "• Works best when continued for several years\n\n"
                + "**Simple rule:** Start with an amount you can invest every month without disturbing your emergency fund.";
        }

        if (msg.contains("mutual fund") || msg.contains("index fund")) {
            return "**Mutual Funds / Index Funds**\n\n"
                + "A mutual fund pools money from many investors and invests it in stocks, bonds, or other assets. "
                + "An index fund is a low-cost mutual fund that tracks an index like NIFTY 50.\n\n"
                + "• Beginners can start with diversified index funds\n"
                + "• Check expense ratio, risk, and investment horizon\n"
                + "• Avoid putting emergency money into volatile funds";
        }

        if (msg.contains("emergency fund")) {
            return "**Emergency Fund**\n\n"
                + "Keep 3 to 6 months of essential expenses in a safe and liquid place before aggressive investing.\n\n"
                + "• Use savings account, FD, or liquid fund\n"
                + "• Do not use this money for stocks or risky assets\n"
                + "• Build it first if your income is irregular";
        }

        if (msg.contains("compound interest") || msg.contains("interest")) {
            return "**Compound Interest**\n\n"
                + "Compound interest means you earn returns on your original money plus previously earned returns.\n\n"
                + "**Key idea:** Time matters more than timing. Starting early helps compounding work harder.";
        }

        if (msg.contains("credit card") || msg.contains("debt") || msg.contains("loan")) {
            return "**Debt Management**\n\n"
                + "Pay high-interest debt first, especially credit card debt. It usually costs more than most investments can reliably earn.\n\n"
                + "• Pay minimum dues on all debts\n"
                + "• Use extra money for highest-interest debt first\n"
                + "• Avoid new debt while clearing expensive debt";
        }

        if (msg.contains("budget") || msg.contains("saving") || msg.contains("savings")) {
            return "**Budgeting and Saving**\n\n"
                + "A simple finance routine:\n\n"
                + "• Track income and expenses\n"
                + "• Keep needs, wants, and savings separate\n"
                + "• Save before spending when possible\n"
                + "• Review your budget every month\n\n"
                + "A good starter target is saving 20% of income, but any consistent saving is progress.";
        }

        if (msg.contains("portfolio") || msg.contains("asset allocation") || msg.contains("diversification")) {
            return "**Portfolio Diversification**\n\n"
                + "Diversification means spreading money across different assets so one bad investment does not hurt everything.\n\n"
                + "• Stocks: growth, higher risk\n"
                + "• Bonds/FD: stability, lower risk\n"
                + "• Cash/emergency fund: liquidity\n\n"
                + "Your ideal mix depends on risk tolerance, time horizon, and goals.";
        }

        if (msg.contains("tax")) {
            return "**Tax-Saving Basics**\n\n"
                + "Tax-saving choices depend on your country and tax regime. Common Indian options include ELSS, PPF, EPF, NPS, and eligible insurance products.\n\n"
                + "Choose tax products only if they also fit your risk, lock-in period, and financial goals.";
        }

        return "I can help with finance basics, budgeting, investments, bills, spending, income, balance, net worth, and portfolio questions.\n\n"
            + "Try asking:\n"
            + "• What is SIP?\n"
            + "• How much did I spend this month?\n"
            + "• Show my investment summary\n"
            + "• Add expense 500 on food";
    }

    // ========== HELPER METHODS ==========
    
    private String extractBillIdentifier(String message) {
        // Simple extraction - look for bill names
        String lowerMsg = message.toLowerCase();
        if (lowerMsg.contains("electricity")) return "Electricity Bill";
        if (lowerMsg.contains("water")) return "Water Bill";
        if (lowerMsg.contains("internet")) return "Internet Bill";
        if (lowerMsg.contains("credit card")) return "Credit Card Bill";
        if (lowerMsg.contains("phone") || lowerMsg.contains("mobile")) return "Phone Bill";
        if (lowerMsg.contains("rent")) return "Rent";
        if (lowerMsg.contains("netflix")) return "Netflix";
        if (lowerMsg.contains("spotify")) return "Spotify";
        
        // Try to get the first few words after "bill"
        String[] words = message.split(" ");
        for (int i = 0; i < words.length - 1; i++) {
            if (words[i].toLowerCase().contains("bill") && i + 1 < words.length) {
                return words[i + 1];
            }
        }
        
        return null;
    }
    
    private String extractDescriptionFromMessage(String message) {
        // Try to extract description after "on", "for", "from"
        String lowerMsg = message.toLowerCase();
        String[] prepositions = {" on ", " for ", " from "};
        
        for (String prep : prepositions) {
            int index = lowerMsg.indexOf(prep);
            if (index != -1) {
                String desc = message.substring(index + prep.length()).trim();
                // Remove trailing words like yesterday, today, etc.
                desc = desc.replaceAll("\\s+(yesterday|today|tomorrow|please|thanks?)$", "");
                if (!desc.isEmpty()) {
                    return desc;
                }
            }
        }
        
        return "Transaction";
    }
    
    // ========== EXISTING METHODS (from original) ==========
    
    /**
     * Handle add expense action (extract from natural language)
     */
    public String handleAddExpense(Long userId, String message, IntentDetectionService intentService) {
        try {
            BigDecimal amount = intentService.extractAmount(message);
            String description = intentService.extractDescription(message);
            return handleAddExpenseWithData(userId, amount, description);
        } catch (Exception e) {
            return "I couldn't add your expense. Please try again.";
        }
    }

    /**
     * Handle recent transactions action
     */
    public String handleGetRecentTransactions(Long userId) {
        try {
            TransactionFilterRequest request = new TransactionFilterRequest();
            request.setPage(0);
            request.setSize(5);
            request.setSortBy("transactionDate");
            request.setSortDirection("DESC");

            TransactionFilterResponse response = transactionService.getFilteredTransactions(userId, request);
            List<TransactionResponse> transactions = response.getTransactions();

            if (transactions == null || transactions.isEmpty()) {
                return "No recent transactions found.";
            }

            StringBuilder message = new StringBuilder();
            message.append("**Recent Transactions**\n\n");

            for (TransactionResponse transaction : transactions) {
                String type = transaction.getType() != null ? transaction.getType().name() : "TRANSACTION";
                String description = transaction.getDescription() != null && !transaction.getDescription().isBlank()
                    ? transaction.getDescription()
                    : "Transaction";
                String category = transaction.getCategoryName() != null && !transaction.getCategoryName().isBlank()
                    ? transaction.getCategoryName()
                    : "Uncategorized";
                String date = transaction.getTransactionDate() != null
                    ? transaction.getTransactionDate().toString()
                    : "No date";
                String amount = transaction.getAmount() != null
                    ? transaction.getAmount().toPlainString()
                    : "0";

                message.append(String.format("- %s: %s Rs.%s on %s (%s)\n",
                    type, description, amount, date, category));
            }

            return message.toString();
        } catch (Exception e) {
            log.error("Error fetching recent transactions", e);
            return "I couldn't fetch your recent transactions.";
        }
    }
    
    /**
     * Handle upcoming bills action
     */
    public String handleGetUpcomingBills(Long userId) {
        try {
            var bills = billReminderService.getUserBillReminders(userId).stream()
                .filter(bill -> bill.isActive())
                .sorted((a, b) -> {
                    if (a.getNextDueDate() == null && b.getNextDueDate() == null) return 0;
                    if (a.getNextDueDate() == null) return 1;
                    if (b.getNextDueDate() == null) return -1;
                    return a.getNextDueDate().compareTo(b.getNextDueDate());
                })
                .limit(10)
                .toList();
            
            if (bills.isEmpty()) {
                return "✅ No upcoming bills in the next 30 days!";
            }
            
            StringBuilder response = new StringBuilder();
            response.append("📅 **Upcoming Bills**\n\n");
            
            for (var bill : bills) {
                String urgency = bill.getDaysUntilDue() <= 3 ? "⚠️ URGENT" : "📌";
                response.append(String.format("%s **%s**: ₹%s due in %d days\n",
                    urgency, bill.getName(), bill.getAmount().toPlainString(), bill.getDaysUntilDue()));
            }
            
            return response.toString();
            
        } catch (Exception e) {
            return "I couldn't fetch your upcoming bills.";
        }
    }
    
    public String handleApplicationHelp(String message) {
        String msg = message == null ? "" : message.toLowerCase();

        if (msg.contains("dashboard") || msg.contains("home") || msg.contains("overview")) {
            return "**Dashboard**\n\n"
                + "The Dashboard is the main financial overview page. It shows total balance, income, expenses, budgets, recent transactions, net worth, cash flow, savings rate, upcoming bills, alerts, and financial health.\n\n"
                + "Use it when the user wants a quick snapshot of their money without opening every module.";
        }

        if (msg.contains("account") || msg.contains("balance") || msg.contains("bank")) {
            return "**Accounts**\n\n"
                + "Users manage bank accounts from the Dashboard account controls. An account stores bank name, masked account number, account type, currency, and current balance.\n\n"
                + "Important behavior:\n"
                + "- Income transactions increase the selected account balance.\n"
                + "- Expense transactions decrease the selected account balance.\n"
                + "- Bill payments also deduct from the selected account.";
        }

        if (msg.contains("transaction") || msg.contains("expense") || msg.contains("income") || msg.contains("spending")) {
            return "**Transactions**\n\n"
                + "The Transactions page is used to add, view, filter, edit, and delete income or expense records.\n\n"
                + "Typical workflow:\n"
                + "1. Open Transactions.\n"
                + "2. Add a transaction with amount, type, category, date, description, and account.\n"
                + "3. The app updates account balance automatically.\n"
                + "4. Expense changes can update budget progress and anomaly detection.";
        }

        if (msg.contains("category") || msg.contains("categories")) {
            return "**Categories**\n\n"
                + "Categories organize income and expenses, such as Food, Shopping, Bills, Salary, or custom categories.\n\n"
                + "Users can create, update, and delete categories. Transactions and budgets use categories for reports and charts.";
        }

        if (msg.contains("budget") || msg.contains("limit")) {
            return "**Budgets**\n\n"
                + "The Budgets page lets users set monthly category limits and track spending against those limits.\n\n"
                + "It can show budget cards, alerts, category breakdown, performance, and history. If spending crosses safe limits, the app can warn the user.";
        }

        if (msg.contains("bill") || msg.contains("reminder") || msg.contains("pending payment") || msg.contains("mark paid")) {
            return "**Bill Reminders**\n\n"
                + "Bill Reminders track recurring payments such as rent, electricity, internet, subscriptions, insurance, or credit card bills.\n\n"
                + "Users can add bills, view upcoming payments, use the calendar, review history, and mark bills as paid.\n\n"
                + "When a bill is marked paid, the app records an expense and deducts the amount from the chosen account. If the user has multiple accounts, the UI asks which account to use.";
        }

        if (msg.contains("prediction") || msg.contains("forecast") || msg.contains("future")) {
            return "**Predictions**\n\n"
                + "Predictions estimate future balance, income, expenses, and cash flow using existing financial data.\n\n"
                + "Users can compare scenarios, view confidence, daily breakdowns, and insights. Accuracy depends on how complete the transaction and account data is.";
        }

        if (msg.contains("investment advice") || msg.contains("advice")) {
            return "**Investment Advice**\n\n"
                + "Investment Advice gives guidance based on user-entered financial data, savings, risk context, and portfolio information.\n\n"
                + "It is educational guidance, not certified financial advice. Users should verify before making real investment decisions.";
        }

        if (msg.contains("investment") || msg.contains("portfolio") || msg.contains("stock") || msg.contains("mutual")) {
            return "**Investments**\n\n"
                + "The Investments page tracks portfolio assets, investment values, allocation, summaries, and performance.\n\n"
                + "Users can add investments, update current values, review allocation charts, and view portfolio performance.";
        }

        if (msg.contains("anomaly") || msg.contains("suspicious") || msg.contains("fraud") || msg.contains("unusual")) {
            return "**Anomaly Detection**\n\n"
                + "Anomaly Detection highlights unusual or suspicious transactions. It can show severity, details, category breakdown, detection rate, and resolution options.\n\n"
                + "Users should review flagged transactions and mark them resolved only after confirming they are safe.";
        }

        if (msg.contains("receipt") || msg.contains("ocr") || msg.contains("upload")) {
            return "**Receipt Upload / OCR**\n\n"
                + "Receipt upload lets users extract transaction details from receipts. OCR reads the document, then the app can save the extracted amount, vendor, date, and transaction details.\n\n"
                + "Users should review extracted data before saving because OCR can make mistakes.";
        }

        if (msg.contains("alert") || msg.contains("notification")) {
            return "**Notifications and Alerts**\n\n"
                + "Notifications show reminders and important updates such as bills due soon, budget warnings, transaction updates, and anomaly alerts.\n\n"
                + "Users can review unread alerts and mark them as read.";
        }

        if (msg.contains("login") || msg.contains("register") || msg.contains("password") || msg.contains("forgot") || msg.contains("reset")) {
            return "**Account Access**\n\n"
                + "Users can register, log in, use protected pages after authentication, and reset forgotten passwords through the forgot-password and reset-password flow.";
        }

        return """
            **SmartBot can help with this application**

            **Application pages:**
            - Dashboard: balance, net worth, cash flow, savings rate, financial health
            - Transactions: add, edit, delete, filter, and review income/expenses
            - Categories: manage income and expense categories
            - Budgets: create monthly limits and track progress
            - Bill Reminders: add bills, view pending payments, mark paid
            - Predictions: forecast balance and cash flow
            - Investments: track portfolio and performance
            - Investment Advice: get educational investing guidance
            - Anomaly Detection: review suspicious transactions
            - Notifications: check alerts and reminders

            **Try asking:**
            - "How do I add a transaction?"
            - "What does Bill Reminders do?"
            - "How do budgets work?"
            - "Show my recent transactions"
            - "What bills are due?"
            - "How is my net worth?"
            - "What is anomaly detection?"
            - "How do I upload a receipt?"

            Ask naturally. If the question is about this app, I will explain the relevant page, workflow, and expected result.
            """;
    }

    /**
     * Get help message
     */
    public String getHelpMessage() {
        return """
            🤖 **SmartBot AI Commands**
            
            **Financial Queries:**
            • "What's my balance?"
            • "Show my net worth"
            • "What's my savings rate?"
            • "How much did I spend this month?"
            • "What's my total income?"
            
            **Adding Transactions:**
            • "Add expense ₹500 on lunch"
            • "Add income ₹50000 from salary"
            
            **Budget & Bills:**
            • "Show my budget status"
            • "What bills are due?"
            • "Mark electricity bill as paid"
            
            **Investments:**
            • "Show my portfolio summary"
            • "How are my investments performing?"
            
            Just type naturally - I'll understand! 🎯
            """;
    }
}
