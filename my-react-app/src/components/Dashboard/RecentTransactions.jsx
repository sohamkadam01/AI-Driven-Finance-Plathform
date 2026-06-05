import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Filter, 
  ChevronRight,
  X,
  Calendar,
  Tag,
  Wallet,
  TrendingUp,
  TrendingDown,
  Eye,
  MoreVertical,
  Download,
  RefreshCw
} from 'lucide-react';
import TransactionDetailsModal from './TransactionDetailsModal';

const RecentTransactions = ({ transactions, loading, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Safely get transactions array
  const transactionsArray = useMemo(() => {
    if (!transactions) return [];
    if (Array.isArray(transactions)) return transactions;
    if (transactions.transactions && Array.isArray(transactions.transactions)) return transactions.transactions;
    if (transactions.content && Array.isArray(transactions.content)) return transactions.content;
    if (transactions.data && Array.isArray(transactions.data)) return transactions.data;
    return [];
  }, [transactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactionsArray];
    
    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterType === 'income') {
      filtered = filtered.filter(tx => tx.type === 'INCOME');
    } else if (filterType === 'expense') {
      filtered = filtered.filter(tx => tx.type === 'EXPENSE');
    }
    
    return filtered.sort((a, b) => new Date(b.transactionDate || b.createdAt) - new Date(a.transactionDate || a.createdAt));
  }, [transactionsArray, searchTerm, filterType]);

  // Calculate summary stats
  const summary = useMemo(() => ({
    totalIncome: transactionsArray.filter(tx => tx.type === 'INCOME').reduce((sum, tx) => sum + (tx.amount || 0), 0),
    totalExpense: transactionsArray.filter(tx => tx.type === 'EXPENSE').reduce((sum, tx) => sum + (tx.amount || 0), 0),
    balance: transactionsArray.filter(tx => tx.type === 'INCOME').reduce((sum, tx) => sum + (tx.amount || 0), 0) -
             transactionsArray.filter(tx => tx.type === 'EXPENSE').reduce((sum, tx) => sum + (tx.amount || 0), 0)
  }), [transactionsArray]);

  const getCategoryIcon = (category) => {
    if (!category) return { emoji: '💳', label: 'Other' };
    const categoryName = typeof category === 'object' ? category.name : category;
    const icons = {
      'Food': { emoji: '🍔', label: 'Food & Dining' },
      'Food & Dining': { emoji: '🍔', label: 'Food & Dining' },
      'Shopping': { emoji: '🛍️', label: 'Shopping' },
      'Transport': { emoji: '🚗', label: 'Transportation' },
      'Transportation': { emoji: '🚗', label: 'Transportation' },
      'Entertainment': { emoji: '🎬', label: 'Entertainment' },
      'Bills': { emoji: '💡', label: 'Bills & Utilities' },
      'Bills & Utilities': { emoji: '💡', label: 'Bills & Utilities' },
      'Salary': { emoji: '💰', label: 'Income' },
      'Investment': { emoji: '📈', label: 'Investment' },
      'Healthcare': { emoji: '🏥', label: 'Healthcare' },
      'Education': { emoji: '📚', label: 'Education' },
      'Rent': { emoji: '🏠', label: 'Rent' },
      'Coffee Shops': { emoji: '☕', label: 'Coffee' },
      'Restaurants': { emoji: '🍽️', label: 'Dining' },
      'Groceries': { emoji: '🛒', label: 'Groceries' },
    };
    return icons[categoryName] || { emoji: '💳', label: categoryName || 'Other' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      
      if (date.toDateString() === now.toDateString()) return 'Today';
      if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailsModalOpen(true);
  };

  const handleTransactionUpdate = () => {
    if (onRefresh) onRefresh();
  };

  const handleTransactionDelete = () => {
    if (onRefresh) onRefresh();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3, staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5">
          <div className="animate-pulse space-y-4">
            <div className="h-5 w-32 bg-gray-200 rounded"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 w-24 bg-gray-100 rounded"></div>
                  </div>
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (transactionsArray.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Wallet size={24} className="text-gray-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">No transactions yet</h3>
          <p className="text-xs text-gray-500">Add your first transaction to get started</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Recent Transactions</h3>
              <p className="text-xs text-gray-500 mt-0.5">Your latest financial activity</p>
            </div>
            
            {/* Summary Stats */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-gray-500">Income</span>
                <span className="text-sm font-semibold text-green-600">₹{summary.totalIncome.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-xs text-gray-500">Expenses</span>
                <span className="text-sm font-semibold text-red-600">₹{summary.totalExpense.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
                <span className="text-xs text-gray-500">Balance</span>
                <span className={`text-sm font-semibold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{summary.balance.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            >
              <Filter size={16} />
            </button>
            <button
              onClick={onRefresh}
              className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          {/* Filter Chips */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 overflow-hidden"
              >
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="text-xs text-gray-500 mr-1">Filter by:</span>
                  <button
                    onClick={() => setFilterType('all')}
                    className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                      filterType === 'all' 
                        ? 'bg-gray-900 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterType('income')}
                    className={`px-3 py-1.5 text-xs rounded-md transition-all flex items-center gap-1 ${
                      filterType === 'income' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <TrendingUp size={12} />
                    Income
                  </button>
                  <button
                    onClick={() => setFilterType('expense')}
                    className={`px-3 py-1.5 text-xs rounded-md transition-all flex items-center gap-1 ${
                      filterType === 'expense' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <TrendingDown size={12} />
                    Expenses
                  </button>
                  
                  {(searchTerm || filterType !== 'all') && (
                    <button
                      onClick={clearFilters}
                      className="px-2 py-1.5 text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <X size={12} />
                      Clear
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Transactions List */}
        <div className="px-5 pb-4">
          <AnimatePresence mode="popLayout">
            {filteredTransactions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8"
              >
                <p className="text-sm text-gray-500">No matching transactions found</p>
                <button 
                  onClick={clearFilters}
                  className="text-xs text-blue-600 mt-2 hover:underline"
                >
                  Clear filters
                </button>
              </motion.div>
            ) : (
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="divide-y divide-gray-100">
                {filteredTransactions.slice(0, 5).map((tx, idx) => {
                  const amount = tx.amount || 0;
                  const type = tx.type || 'EXPENSE';
                  const description = tx.description || 'Unknown transaction';
                  const transactionDate = tx.transactionDate || tx.createdAt;
                  const category = tx.category;
                  const isIncome = type === 'INCOME';
                  const categoryIcon = getCategoryIcon(category);
                  
                  return (
                    <motion.div
                      key={tx.transactionId || idx}
                      variants={itemVariants}
                      layout
                      onClick={() => handleTransactionClick(tx)}
                      className="group flex items-center justify-between py-3 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`p-2 rounded-full flex-shrink-0 ${isIncome ? 'bg-green-50' : 'bg-red-50'}`}>
                          <span className="text-base">{categoryIcon.emoji}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{description}</p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Calendar size={10} />
                              {formatDate(transactionDate)}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Tag size={10} />
                              {categoryIcon.label}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className={`flex items-center gap-1 text-sm font-semibold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                          {isIncome ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                          ₹{typeof amount === 'number' ? amount.toLocaleString() : parseFloat(amount).toLocaleString()}
                        </div>
                        <ChevronRight size={16} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* View all link */}
          {filteredTransactions.length > 5 && (
            <div className="mt-4 pt-2 text-center">
              <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mx-auto">
                View all {filteredTransactions.length} transactions
                <ChevronRight size={12} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
        onUpdate={handleTransactionUpdate}
        onDelete={handleTransactionDelete}
      />
    </>
  );
};

export default RecentTransactions;