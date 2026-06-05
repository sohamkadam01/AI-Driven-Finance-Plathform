import React, { useMemo } from 'react';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';

const formatCurrency = (value) => `Rs ${Number(value || 0).toLocaleString()}`;

const buildInsight = (totalIncome, totalExpense, netSavings, savingsRate, expenseChange) => {
  if (totalIncome === 0 && totalExpense === 0) {
    return 'No transactions found for this month.';
  }

  if (netSavings >= 0) {
    return `You saved ${savingsRate}% of your income this month. Expenses ${expenseChange > 0 ? 'increased' : 'decreased'} compared to last month.`;
  }

  return `Your expenses exceeded income by ${formatCurrency(Math.abs(netSavings))}. Review spending categories to improve this month.`;
};

const MonthlySummary = ({ selectedMonth, onMonthChange, transactions = [], loading = false }) => {
  const summary = useMemo(() => {
    if (!selectedMonth) return null;

    const currentMonthTransactions = transactions.filter(
      (tx) => tx.transactionDate?.slice(0, 7) === selectedMonth
    );

    const [year, month] = selectedMonth.split('-').map(Number);
    const previousMonthDate = new Date(year, month - 2, 1);
    const previousMonth = `${previousMonthDate.getFullYear()}-${String(previousMonthDate.getMonth() + 1).padStart(2, '0')}`;

    const previousMonthTransactions = transactions.filter(
      (tx) => tx.transactionDate?.slice(0, 7) === previousMonth
    );

    const totalIncome = currentMonthTransactions
      .filter((tx) => tx.type === 'INCOME')
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

    const totalExpense = currentMonthTransactions
      .filter((tx) => tx.type === 'EXPENSE')
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

    const previousMonthExpense = previousMonthTransactions
      .filter((tx) => tx.type === 'EXPENSE')
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Number(((netSavings / totalIncome) * 100).toFixed(2)) : 0;
    const expenseChange = totalExpense - previousMonthExpense;

    return {
      totalIncome,
      totalExpense,
      netSavings,
      savingsRate,
      previousMonthComparison: {
        previousMonthExpense,
        expenseChange,
      },
      insight: buildInsight(totalIncome, totalExpense, netSavings, savingsRate, expenseChange),
    };
  }, [selectedMonth, transactions]);

  const handleMonthSelect = (e) => {
    onMonthChange(e.target.value);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
        <p className="text-gray-500">Select a month to view summary</p>
      </div>
    );
  }

  const expenseChange = summary.previousMonthComparison?.expenseChange || 0;
  const isExpenseUp = expenseChange > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-gray-500" />
          <h3 className="text-base font-medium text-gray-900">Monthly Summary</h3>
        </div>
        <input
          type="month"
          value={selectedMonth}
          onChange={handleMonthSelect}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-xs text-gray-500">Income</p>
          <p className="text-lg font-semibold text-green-600">{formatCurrency(summary.totalIncome)}</p>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <p className="text-xs text-gray-500">Expenses</p>
          <p className="text-lg font-semibold text-red-600">{formatCurrency(summary.totalExpense)}</p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-gray-500">Savings</p>
          <p className={`text-lg font-semibold ${summary.netSavings >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatCurrency(summary.netSavings)}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Savings Rate</span>
          <span className="font-medium">{summary.savingsRate}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${Math.min(Math.max(summary.savingsRate, 0), 100)}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
        {isExpenseUp ? (
          <TrendingUp size={16} className="text-red-500" />
        ) : (
          <TrendingDown size={16} className="text-green-500" />
        )}
        <span className="text-sm text-gray-600">
          Expenses {isExpenseUp ? 'increased' : 'decreased'} by
          <span className={`font-medium ${isExpenseUp ? 'text-red-600' : 'text-green-600'}`}>
            {' '}{formatCurrency(Math.abs(expenseChange))}
          </span>
          {' '}compared to last month
        </span>
      </div>

      {summary.insight && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">{summary.insight}</p>
        </div>
      )}
    </div>
  );
};

export default MonthlySummary;
