package com.College_project.project.service;

import java.math.BigDecimal;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;

@Service
public class IntentDetectionService {

    public enum Intent {
        // Financial Queries
        GET_BALANCE,
        GET_NET_WORTH,
        GET_SAVINGS_RATE,
        GET_SPENDING,
        GET_INCOME,

        // Transaction Actions
        ADD_EXPENSE,
        ADD_INCOME,
        ADD_TRANSACTION,
        GET_RECENT_TRANSACTIONS,

        // Budget Related
        GET_BUDGET_STATUS,
        GET_BUDGET_SUMMARY,
        CHECK_BUDGET,

        // Bill Related
        GET_UPCOMING_BILLS,
        GET_BILL_STATUS,
        MARK_BILL_PAID,

        // Investment Related
        GET_INVESTMENT_SUMMARY,
        GET_PORTFOLIO_PERFORMANCE,

        // Anomaly Detection
        GET_ANOMALIES,

        // Fast rule-based finance answers
        FINANCE_EDUCATION,
        APPLICATION_HELP,

        // General
        GREETING,
        HELP,
        GENERAL_CHAT,
        UNKNOWN
    }

    private static final Pattern BALANCE_PATTERN = Pattern.compile(
        ".*(?:balance|money|funds|how much (?:do i have|is in my account|is my balance|i have)).*",
        Pattern.CASE_INSENSITIVE);

    private static final Pattern NET_WORTH_PATTERN = Pattern.compile(
        ".*(?:net worth|networth|wealth|total wealth|assets? minus liabilities|how much am i worth).*",
        Pattern.CASE_INSENSITIVE);

    private static final Pattern SAVINGS_RATE_PATTERN = Pattern.compile(
        ".*(?:savings? rate|savings? percentage|how much (?:am i saving|of my income am i keeping)|saving progress|monthly savings).*",
        Pattern.CASE_INSENSITIVE);

    private static final Pattern SPENDING_PATTERN = Pattern.compile(
        ".*(?:how much (?:did|do) i (?:actually )?spend|spending|expenses|expenditure|costs|where did my money go).*",
        Pattern.CASE_INSENSITIVE);

    private static final Pattern INCOME_PATTERN = Pattern.compile(
        ".*(?:how much (?:did|do) i (?:actually )?earn|income|earnings|paycheck|profit|received money).*",
        Pattern.CASE_INSENSITIVE);

    private static final Pattern ADD_INCOME_PATTERN = Pattern.compile(
        ".*(?:add|record|log|i earned|earned|received|salary|income).*\\d+.*",
        Pattern.CASE_INSENSITIVE);

    private static final Pattern ADD_EXPENSE_PATTERN = Pattern.compile(
        ".*(?:record|log|i spent|spent|paid|expense|bill|purchase).*\\d+.*",
        Pattern.CASE_INSENSITIVE);

    private static final Pattern RECENT_TRANSACTIONS_PATTERN = Pattern.compile(
        ".*(?:(?:show|list|get|view) (?:my )?(?:recent|latest|last) transactions?|transaction history|recent transactions?).*",
        Pattern.CASE_INSENSITIVE);

    private static final Pattern BUDGET_STATUS_PATTERN = Pattern.compile(
        ".*(?:how(?:'s| is)? (?:my )?budgets?|budget (?:status|summary|report|overview|limit|remaining)).*",
        Pattern.CASE_INSENSITIVE);

    private static final Pattern CHECK_BUDGET_PATTERN = Pattern.compile(
        ".*(?:am i (?:over|under) budget|money left|budget left|remaining budget).*",
        Pattern.CASE_INSENSITIVE);

    private static final Pattern UPCOMING_BILLS_PATTERN = Pattern.compile(
        ".*(?:upcoming (?:bills?|payments)|due (?:bills?|payments)|pending (?:bills?|payments)).*",
        Pattern.CASE_INSENSITIVE);

    private static final Pattern MARK_BILL_PAID_PATTERN = Pattern.compile(
        ".*(?:mark (?:the )?bill (?:as )?paid|paid (?:the |my )?bill|payment done).*",
        Pattern.CASE_INSENSITIVE);

    private static final Pattern INVESTMENT_SUMMARY_PATTERN = Pattern.compile(
        ".*(?:investment|portfolio|how are my (?:investments|stocks|funds) doing).*",
        Pattern.CASE_INSENSITIVE);

    private static final Pattern ANOMALY_PATTERN = Pattern.compile(
        ".*(?:anomal|suspicious|fraud|unusual|weird transaction|red flag|suspicious activity|detect fraud|fraudulent).*",
        Pattern.CASE_INSENSITIVE);

    private static final Pattern FINANCE_EDUCATION_PATTERN = Pattern.compile(
        "(?:what is|what are|explain|meaning of|tell me about|how to|should i|can i|best way to).*(?:sip|mutual fund|stock|bond|fd|fixed deposit|etf|index fund|budget|saving|savings|emergency fund|debt|loan|credit card|interest|compound interest|investment|portfolio|tax|retirement|insurance|expense|income|net worth)|(?:sip|mutual fund|stock|bond|fd|fixed deposit|etf|index fund|emergency fund|compound interest|asset allocation|diversification)",
        Pattern.CASE_INSENSITIVE);

    private static final Pattern APPLICATION_HELP_PATTERN = Pattern.compile(
        ".*(?:how (?:do|can|to) i|where (?:do|can) i|what (?:is|are|does)|show me|guide me|help me|use|using|feature|page|section|screen|module).*(?:dashboard|account|transaction|category|budget|bill|reminder|prediction|forecast|investment|advice|anomaly|alert|notification|receipt|ocr|upload|login|register|password|profile|report|chart|summary|net worth|cash flow|financial health|savings rate)|.*(?:dashboard|transactions|categories|budgets|bill reminders|predictions|investments|investment advice|anomaly detection|notifications|receipt upload|ocr).*",
        Pattern.CASE_INSENSITIVE);

    private static final Pattern GREETING_PATTERN = Pattern.compile(
        "^(?:hi|hello|hey|greetings|good morning|good afternoon|good evening)\\b",
        Pattern.CASE_INSENSITIVE);

    private static final Pattern HELP_PATTERN = Pattern.compile(
        "^(?:help|what can you do|how to use|commands|features)\\b",
        Pattern.CASE_INSENSITIVE);

    public Intent detectIntent(String message) {
        if (message == null || message.trim().isEmpty()) {
            return Intent.UNKNOWN;
        }

        String msg = message.trim();

        if (ADD_INCOME_PATTERN.matcher(msg).find()) return Intent.ADD_INCOME;
        if (ADD_EXPENSE_PATTERN.matcher(msg).find()) return Intent.ADD_EXPENSE;
        if (RECENT_TRANSACTIONS_PATTERN.matcher(msg).find()) return Intent.GET_RECENT_TRANSACTIONS;

        if (BALANCE_PATTERN.matcher(msg).find()) return Intent.GET_BALANCE;
        if (NET_WORTH_PATTERN.matcher(msg).find()) return Intent.GET_NET_WORTH;
        if (SAVINGS_RATE_PATTERN.matcher(msg).find()) return Intent.GET_SAVINGS_RATE;
        if (SPENDING_PATTERN.matcher(msg).find()) return Intent.GET_SPENDING;
        if (INCOME_PATTERN.matcher(msg).find()) return Intent.GET_INCOME;

        if (BUDGET_STATUS_PATTERN.matcher(msg).find()) return Intent.GET_BUDGET_STATUS;
        if (CHECK_BUDGET_PATTERN.matcher(msg).find()) return Intent.CHECK_BUDGET;
        if (UPCOMING_BILLS_PATTERN.matcher(msg).find()) return Intent.GET_UPCOMING_BILLS;
        if (MARK_BILL_PAID_PATTERN.matcher(msg).find()) return Intent.MARK_BILL_PAID;
        if (INVESTMENT_SUMMARY_PATTERN.matcher(msg).find()) return Intent.GET_INVESTMENT_SUMMARY;
        if (ANOMALY_PATTERN.matcher(msg).find()) return Intent.GET_ANOMALIES;
        if (FINANCE_EDUCATION_PATTERN.matcher(msg).find()) return Intent.FINANCE_EDUCATION;
        if (APPLICATION_HELP_PATTERN.matcher(msg).find()) return Intent.APPLICATION_HELP;

        if (HELP_PATTERN.matcher(msg).find()) return Intent.HELP;
        if (GREETING_PATTERN.matcher(msg).find()) return Intent.GREETING;

        return Intent.GENERAL_CHAT;
    }

    public BigDecimal extractAmount(String message) {
        Pattern amountPattern = Pattern.compile("(?:rs\\.?|inr|₹|â‚¹)?\\s*(\\d+(?:\\.\\d+)?)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = amountPattern.matcher(message);
        if (matcher.find()) {
            return new BigDecimal(matcher.group(1));
        }
        return null;
    }

    public String extractDescription(String message) {
        Pattern descPattern = Pattern.compile("(?:on|for|from|at)\\s+(.+?)(?:\\.|$|\\s+(?:yesterday|today|tomorrow|please|thanks?))", Pattern.CASE_INSENSITIVE);
        Matcher matcher = descPattern.matcher(message);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        return null;
    }
}
