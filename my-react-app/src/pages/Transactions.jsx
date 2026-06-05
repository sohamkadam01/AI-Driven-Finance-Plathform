import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Filter, Download, Calendar, Search, TrendingUp, TrendingDown, Wallet, ArrowUpDown } from 'lucide-react';

// Components
import IncomeExpenseChart from '../components/Transactions/IncomeExpenseChart';
import TransactionList from '../components/Transactions/TransactionList';
import CategoryPieChart from '../components/Transactions/CategoryPieChart';
import TopSpendingCategories from '../components/Transactions/TopSpendingCategories';
import MonthlySummary from '../components/Transactions/MonthlySummary';
import TransactionDetailsModal from '../components/Transactions/TransactionDetailsModal';
import EditTransactionModal from '../components/Transactions/EditTransactionModal';
import AddTransactionModal from '../components/Dashboard/AddTransactionModal';
import Layout from '../components/Layout/Layout';
import { categoryAPI, transactionAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import totalIncomeImg from '../assets/total_income.png';
import totalExpensesImg from '../assets/total_expenses.png';
import netSavingImg from '../assets/net_saving.png';

const normalizeTransaction = (tx) => {
  const transactionId = tx.transactionId || tx.id || null;
  const categoryId = tx.category?.categoryId || tx.categoryId || null;
  const categoryName = tx.category?.name || tx.categoryName || 'Other';
  const accountId = tx.bankAccount?.accountId || tx.accountId || null;
  const bankName = tx.bankAccount?.bankName || tx.bankName || '';
  const createdAt = tx.createdAt || tx.created_at || null;

  return {
    ...tx,
    transactionId,
    createdAt,
    categoryId,
    categoryName,
    category: {
      categoryId,
      name: categoryName,
    },
    bankAccount: accountId || bankName
      ? {
          accountId,
          bankName,
        }
      : null,
  };
};

const SectionHeader = ({ title, description, accentClass, titleClass }) => (
  <div className="mb-4 flex items-center justify-between gap-4 px-1">
    <div className="flex-1">
      <div className="mb-1.5 flex items-center gap-3">
        <motion.div
          className={`h-7 w-1.5 rounded-full shadow-lg ${accentClass}`}
          animate={{ scaleY: [1, 1.18, 1] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <h3 className={`bg-clip-text text-xl font-bold tracking-tight text-transparent ${titleClass}`}>
          {title}
        </h3>
      </div>
      {description && (
        <p className="ml-5 text-sm font-semibold leading-relaxed text-slate-600">
          {description}
        </p>
      )}
    </div>
  </div>
);

const Transactions = () => {
  // State
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { showToast } = useToast();
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    categoryId: 'all',
    startDate: '',
    endDate: ''
  });

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAllCategories();
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategories([]);
    }
  };

  // Fetch transactions
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      let page = 0;
      let hasNext = true;
      const allTransactions = [];

      while (hasNext) {
        const response = await transactionAPI.getFilteredTransactions({
          page,
          size: 100,
          sortBy: 'createdAt',
          sortDirection: 'DESC',
        });

        const payload = response.data || {};
        const pageItems = Array.isArray(payload.transactions) ? payload.transactions : [];
        allTransactions.push(...pageItems.map(normalizeTransaction));
        hasNext = Boolean(payload.hasNext);
        page += 1;
      }

      setTransactions(allTransactions);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setTransactions([]);
      showToast('Failed to load transactions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchTransactions();
  }, []);

  // Filter transactions
  const filteredTransactions = useMemo(() => (Array.isArray(transactions) ? transactions.filter(tx => {
    if (filters.type !== 'all' && tx.type !== filters.type) return false;
    if (filters.search && !tx.description?.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.categoryId !== 'all' && String(tx.categoryId) !== String(filters.categoryId)) return false;
    if (filters.startDate && new Date(tx.transactionDate) < new Date(filters.startDate)) return false;
    if (filters.endDate && new Date(tx.transactionDate) > new Date(filters.endDate)) return false;
    return true;
  }) : []), [transactions, filters]);

  // Calculate category breakdown for current month
  const currentMonthTransactions = filteredTransactions.filter(tx => {
    const txMonth = tx.transactionDate?.slice(0, 7);
    return txMonth === selectedMonth && tx.type === 'EXPENSE';
  });

  // Group by category for pie chart
  const categoryData = [];
  const categoryMap = new Map();
  currentMonthTransactions.forEach(tx => {
    const categoryName = tx.category?.name || tx.categoryName || 'Other';
    const amount = tx.amount || 0;
    categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + amount);
  });
  
  const totalExpense = Array.from(categoryMap.values()).reduce((a, b) => a + b, 0);
  categoryMap.forEach((amount, name) => {
    categoryData.push({
      name: name,
      amount: amount,
      percentage: totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(1) : 0
    });
  });
  categoryData.sort((a, b) => b.amount - a.amount);

  // Chart data (income vs expense timeline)
  const chartData = () => {
    const monthlyData = {};
    const transactionsArray = Array.isArray(transactions) ? transactions : [];
    
    transactionsArray.forEach(tx => {
      if (tx.transactionDate) {
        const month = tx.transactionDate.slice(0, 7);
        if (!monthlyData[month]) {
          monthlyData[month] = { income: 0, expenses: 0 };
        }
        if (tx.type === 'INCOME') {
          monthlyData[month].income += tx.amount || 0;
        } else {
          monthlyData[month].expenses += tx.amount || 0;
        }
      }
    });
    
    return Object.entries(monthlyData).map(([month, data]) => ({
      month: month + '-01',
      income: data.income,
      expenses: data.expenses
    })).sort((a, b) => new Date(a.month) - new Date(b.month));
  };

  // Handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleExport = () => {
    const headers = ['Date', 'Type', 'Description', 'Amount', 'Category'];
    const rows = filteredTransactions.map(tx => [
      tx.transactionDate,
      tx.type,
      tx.description,
      tx.amount,
      tx.category?.name || tx.categoryName || ''
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailsModalOpen(true);
  };

  const handleEdit = (transaction) => {
    setSelectedTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (transactionId) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
      await transactionAPI.deleteTransaction(transactionId);
      setTransactions((prev) => prev.filter((tx) => tx.transactionId !== transactionId));
      showToast('Transaction deleted successfully', 'success');
      await fetchTransactions();
    } catch (err) {
      console.error('Failed to delete transaction:', err.response?.data || err);
      const errorMessage = err.response?.data?.error || 'Failed to delete transaction. Please try again.';
      showToast(errorMessage, 'error');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  // Calculate totals for stats
  const totalIncome = filteredTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalExpenses = filteredTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + (t.amount || 0), 0);
  const netSavings = totalIncome - totalExpenses;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          
          {/* Header Section - Google Material Design */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                  <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">Transaction Management</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Transactions</h1>
                <p className="text-gray-500 text-sm mt-1">Manage and track all your financial activities</p>
              </div>
              
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    showFilters ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Filter size={18} />
                  <span className="text-sm font-medium">Filters</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-gray-600 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all"
                >
                  <Download size={18} />
                  <span className="text-sm font-medium hidden sm:inline">Export</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md shadow-blue-200 hover:shadow-lg transition-all"
                >
                  <Plus size={18} />
                  <span className="text-sm font-medium">Add Transaction</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          <SectionHeader
            title="Financial Summary"
            description="Review total income, expenses, and net savings at a glance"
            accentClass="bg-gradient-to-b from-blue-500 to-indigo-500 shadow-blue-500/25"
            titleClass="bg-gradient-to-r from-slate-950 to-blue-700"
          />

          {/* Stats Cards - Google Material Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
          >
            {/* Income Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              {/* Background Illustration */}
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <img 
                  src={totalIncomeImg} 
                  alt="" 
                  className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-all duration-500 group-hover:scale-110 grayscale-[0.2]" 
                />
                <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-emerald-50/20" />
              </div>

              <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <TrendingUp size={20} className="text-emerald-600" />
                </div>
                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">Total</span>
              </div>
              <p className="text-sm text-gray-500 mb-1">Total Income</p>
              <p className="text-2xl font-bold text-emerald-600">₹{totalIncome.toLocaleString()}</p>
              <div className="mt-3 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-emerald-500 rounded-full"></div>
              </div>
            </div>
          </div>

            {/* Expense Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              {/* Background Illustration */}
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <img 
                  src={totalExpensesImg} 
                  alt="" 
                  className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-all duration-500 group-hover:scale-110 grayscale-[0.2]" 
                />
                <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-rose-50/20" />
              </div>

              <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                  <TrendingDown size={20} className="text-rose-600" />
                </div>
                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">Total</span>
              </div>
              <p className="text-sm text-gray-500 mb-1">Total Expenses</p>
              <p className="text-2xl font-bold text-rose-600">₹{totalExpenses.toLocaleString()}</p>
              <div className="mt-3 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full w-1/2 bg-rose-500 rounded-full"></div>
              </div>
            </div>
          </div>

            {/* Net Savings Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-5 shadow-sm relative overflow-hidden group">
              {/* Background Illustration */}
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <img 
                  src={netSavingImg} 
                  alt="" 
                  className="w-full h-full object-cover opacity-15 group-hover:opacity-25 transition-all duration-500 group-hover:scale-110 grayscale-[0.2]" 
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-blue-50/40 to-indigo-50/20" />
              </div>

              <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Wallet size={20} className="text-blue-600" />
                </div>
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Net</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Net Savings</p>
              <p className={`text-2xl font-bold ${netSavings >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                ₹{netSavings.toLocaleString()}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${netSavings >= 0 ? 'bg-blue-500' : 'bg-rose-500'} rounded-full`}
                    style={{ width: `${Math.min(Math.abs((netSavings / totalIncome) * 100), 100)}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-400">
                  {totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(0) : 0}% saved
                </span>
              </div>
            </div>
          </div>
          </motion.div>

          {/* Filters Panel - Expandable */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-8 overflow-hidden"
              >
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <ArrowUpDown size={16} className="text-gray-400" />
                    <h3 className="text-sm font-medium text-gray-700">Filter Transactions</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Search */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Search</label>
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={filters.search}
                          onChange={(e) => handleFilterChange('search', e.target.value)}
                          placeholder="Search transactions..."
                          className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Type Filter */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Transaction Type</label>
                      <select
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      >
                        <option value="all">All Types</option>
                        <option value="INCOME">Income</option>
                        <option value="EXPENSE">Expense</option>
                        <option value="INVESTMENT">Investment</option>
                      </select>
                    </div>

                    {/* Category Filter */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Category</label>
                      <select
                        value={filters.categoryId}
                        onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      >
                        <option value="all">All Categories</option>
                        {categories.map((category) => (
                          <option key={category.categoryId} value={category.categoryId}>
                            {category.name} ({category.type})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Start Date */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                      <div className="relative">
                        <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="date"
                          value={filters.startDate}
                          onChange={(e) => handleFilterChange('startDate', e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>
                    </div>

                    {/* End Date */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">End Date</label>
                      <div className="relative">
                        <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="date"
                          value={filters.endDate}
                          onChange={(e) => handleFilterChange('endDate', e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Active Filters Display */}
                  {(filters.search || filters.type !== 'all' || filters.categoryId !== 'all' || filters.startDate || filters.endDate) && (
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-500">Active filters:</span>
                      {filters.search && (
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">Search: {filters.search}</span>
                      )}
                      {filters.type !== 'all' && (
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">Type: {filters.type}</span>
                      )}
                      {filters.categoryId !== 'all' && (
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                          Category: {categories.find((category) => String(category.categoryId) === String(filters.categoryId))?.name || filters.categoryId}
                        </span>
                      )}
                      {filters.startDate && (
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">From: {filters.startDate}</span>
                      )}
                      {filters.endDate && (
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">To: {filters.endDate}</span>
                      )}
                      <button
                        onClick={() => setFilters({ search: '', type: 'all', categoryId: 'all', startDate: '', endDate: '' })}
                        className="text-xs text-red-500 hover:text-red-600 ml-2"
                      >
                        Clear all
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Two Column Layout for Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div>
              <SectionHeader
                title="Income vs Expenses"
                description="Track your cash flow and savings performance"
                accentClass="bg-gradient-to-b from-emerald-500 to-teal-500 shadow-emerald-500/25"
                titleClass="bg-gradient-to-r from-slate-950 to-emerald-700"
              />
              <IncomeExpenseChart data={chartData()} loading={loading} />
            </div>
            <div>
              <SectionHeader
                title="Spending by Category"
                description="Break down this month's expenses by category"
                accentClass="bg-gradient-to-b from-cyan-500 to-blue-500 shadow-cyan-500/25"
                titleClass="bg-gradient-to-r from-slate-950 to-cyan-700"
              />
              <CategoryPieChart data={categoryData} loading={loading} />
            </div>
          </div>

          {/* Top Spending Categories and Monthly Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div>
              <SectionHeader
                title="Spending Data"
                description="Review top spending categories and category impact"
                accentClass="bg-gradient-to-b from-rose-500 to-pink-500 shadow-rose-500/25"
                titleClass="bg-gradient-to-r from-slate-950 to-rose-700"
              />
              <TopSpendingCategories data={categoryData} loading={loading} />
            </div>
            <div>
              <SectionHeader
                title="Monthly Summary"
                description="See month-level totals and spending movement"
                accentClass="bg-gradient-to-b from-violet-500 to-fuchsia-500 shadow-violet-500/25"
                titleClass="bg-gradient-to-r from-slate-950 to-violet-700"
              />
              <MonthlySummary
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
                transactions={filteredTransactions}
                loading={loading}
              />
            </div>
          </div>

          {/* Transaction List */}
          <div>
            <SectionHeader
              title="Transaction History"
              description="Browse, filter, and manage every recorded transaction"
              accentClass="bg-gradient-to-b from-amber-500 to-orange-500 shadow-amber-500/25"
              titleClass="bg-gradient-to-r from-slate-950 to-amber-700"
            />
            <TransactionList
              transactions={filteredTransactions}
              loading={loading}
              onViewDetails={handleViewDetails}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onExport={handleExport}
              onAdd={() => setIsAddModalOpen(true)}
            />
          </div>

          {/* Results Summary */}
          {!loading && filteredTransactions.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-center"
            >
              <p className="text-sm text-gray-400">
                Showing {filteredTransactions.length} of {transactions.length} transactions
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Modals */}
      <TransactionDetailsModal 
        transaction={selectedTransaction}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />
      
      <EditTransactionModal 
        transaction={selectedTransaction}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchTransactions}
      />
      
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchTransactions}
      />
    </Layout>
  );
};

export default Transactions;
