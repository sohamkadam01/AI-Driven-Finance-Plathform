import React, { useState, useMemo } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Eye, 
  Trash2, 
  Edit,
  Wallet,
  Search,
  Filter,
  Calendar,
  Download,
  MoreVertical,
  CreditCard,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  X,
  FileText
} from 'lucide-react';

const TransactionList = ({ 
  transactions, 
  loading, 
  onViewDetails, 
  onDelete,
  onEdit,
  onExport,
  onAdd,
  itemsPerPage = 10 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const getTypeLabel = (type) => {
    if (type === 'INCOME') return 'Income';
    if (type === 'INVESTMENT') return 'Investment';
    return 'Expense';
  };

  const getAmountStyle = (type) => {
    if (type === 'INCOME') return 'text-green-600';
    if (type === 'INVESTMENT') return 'text-indigo-600';
    return 'text-red-600';
  };

  const processedTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    let filtered = [...transactions];

    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      const typeMap = {
        income: 'INCOME',
        expense: 'EXPENSE',
        investment: 'INVESTMENT',
      };
      filtered = filtered.filter(tx => tx.type === typeMap[filterType]);
    }

    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'amount':
          aVal = a.amount;
          bVal = b.amount;
          break;
        case 'description':
          aVal = a.description?.toLowerCase() || '';
          bVal = b.description?.toLowerCase() || '';
          break;
        default:
          aVal = new Date(a.createdAt || a.transactionDate);
          bVal = new Date(b.createdAt || b.transactionDate);
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [transactions, searchTerm, filterType, sortBy, sortOrder]);

  const totalPages = Math.ceil(processedTransactions.length / itemsPerPage);
  const paginatedTransactions = processedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const statistics = useMemo(() => {
    const totalIncome = processedTransactions
      .filter(tx => tx.type === 'INCOME')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const totalExpense = processedTransactions
      .filter(tx => tx.type === 'EXPENSE')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    return {
      totalIncome,
      totalExpense,
      netSavings: totalIncome - totalExpense,
      transactionCount: processedTransactions.length,
      incomeCount: processedTransactions.filter(tx => tx.type === 'INCOME').length,
      expenseCount: processedTransactions.filter(tx => tx.type === 'EXPENSE').length,
      investmentCount: processedTransactions.filter(tx => tx.type === 'INVESTMENT').length
    };
  }, [processedTransactions]);

  const getCategoryIcon = (category) => {
    const icons = {
      'Food & Dining': '🍔',
      'Coffee Shops': '☕',
      'Shopping': '🛍️',
      'Transportation': '🚗',
      'Entertainment': '🎬',
      'Bills & Utilities': '💡',
      'Healthcare': '🏥',
      'Salary': '💰',
      'Freelance': '💼',
      'Investment': '📈',
      'Other': '📦'
    };
    return icons[category?.name] || '💳';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    
    if (date.toDateString() === now.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleDeleteClick = (transactionId) => {
    setShowDeleteConfirm(transactionId);
  };

  const confirmDelete = (transactionId) => {
    onDelete(transactionId);
    setShowDeleteConfirm(null);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setSortBy('createdAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="h-5 w-40 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-56 bg-gray-200 rounded"></div>
              </div>
              <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-12 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet size={32} className="text-gray-400" />
          </div>
          <h3 className="text-base font-normal text-gray-700 mb-2">No transactions yet</h3>
          <p className="text-sm text-gray-500 mb-6">Add your first transaction to start tracking</p>
          <button 
            onClick={() => onAdd?.()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-normal hover:bg-blue-700 transition-colors"
          >
            <CreditCard size={16} />
            Add Transaction
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-base font-normal text-gray-800">Transaction History</h3>
            <p className="text-sm text-gray-500 mt-0.5">Track and manage all your financial activities</p>
          </div>
          
          {onExport && (
            <button
              onClick={onExport}
              className="flex items-center gap-2 px-4 py-2 text-sm font-normal text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download size={16} />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Statistics Cards - Google Style */}
      <div className="px-6 pt-4 pb-2">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-500 font-normal tracking-wide">Total Income</p>
            <p className="text-2xl font-normal text-green-600 mt-1">{formatCurrency(statistics.totalIncome)}</p>
            <p className="text-xs text-gray-400 mt-2">{statistics.incomeCount} transactions</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-500 font-normal tracking-wide">Total Expenses</p>
            <p className="text-2xl font-normal text-red-600 mt-1">{formatCurrency(statistics.totalExpense)}</p>
            <p className="text-xs text-gray-400 mt-2">{statistics.expenseCount} transactions</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-500 font-normal tracking-wide">Net Savings</p>
            <p className={`text-2xl font-normal mt-1 ${statistics.netSavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(statistics.netSavings))}
            </p>
            <p className="text-xs text-gray-400 mt-2">Income - Expenses</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-500 font-normal tracking-wide">Total Transactions</p>
            <p className="text-2xl font-normal text-gray-700 mt-1">{statistics.transactionCount}</p>
            <p className="text-xs text-gray-400 mt-2">All time</p>
          </div>
        </div>
      </div>

      {/* Search and Filters - Google Style */}
      <div className="px-6 pt-4 pb-2">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Type Filter - Google Chip Style */}
          <div className="flex gap-2">
            {['all', 'income', 'expense', 'investment'].map((type) => (
              <button
                key={type}
                onClick={() => {
                  setFilterType(type);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 text-sm font-normal rounded-full transition-colors ${
                  filterType === type
                    ? 'bg-gray-800 text-white'
                    : 'bg-transparent text-gray-600 hover:bg-gray-100'
                }`}
              >
                {type === 'all' ? 'All' : type === 'income' ? 'Income' : type === 'expense' ? 'Expense' : 'Investment'}
              </button>
            ))}
          </div>
          
          {/* Clear Filters */}
          {(searchTerm || filterType !== 'all' || sortBy !== 'createdAt') && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1"
            >
              <X size={14} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table - Google Style */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-normal text-gray-500 tracking-wider cursor-pointer hover:text-gray-700" onClick={() => handleSort('description')}>
                <div className="flex items-center gap-2">
                  Description
                  {sortBy === 'description' && (
                    <span className="text-gray-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-normal text-gray-500 tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-normal text-gray-500 tracking-wider cursor-pointer hover:text-gray-700" onClick={() => handleSort('date')}>
                <div className="flex items-center gap-2">
                  Date
                  {sortBy === 'date' && (
                    <span className="text-gray-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-normal text-gray-500 tracking-wider cursor-pointer hover:text-gray-700" onClick={() => handleSort('amount')}>
                <div className="flex items-center justify-end gap-2">
                  Amount
                  {sortBy === 'amount' && (
                    <span className="text-gray-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-normal text-gray-500 tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedTransactions.map((tx) => (
              <tr 
                key={tx.transactionId || tx.id} 
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getCategoryIcon(tx.category)}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm text-gray-800">{tx.description}</p>
                        {tx.ocrDocument && (
                          <span title="Imported from Receipt" className="text-gray-400">
                            <FileText size={12} />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{getTypeLabel(tx.type)}</p>
                    </div>
                  </div>

                </td>
                <td className="px-6 py-3">
                  <span className="text-sm text-gray-600">
                    {tx.category?.name || 'Uncategorized'}
                  </span>
                </td>

                <td className="px-6 py-3">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} className="text-gray-400" />
                    <span className="text-sm text-gray-600">{formatDate(tx.transactionDate)}</span>
                  </div>
                </td>
                
                <td className="px-6 py-3 text-right">
                  <div className={`flex items-center justify-end gap-1 text-sm font-normal ${getAmountStyle(tx.type)}`}>
                    {tx.type === 'INCOME' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {formatCurrency(tx.amount)}
                  </div>
                </td>
                <td className="px-6 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onViewDetails(tx)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    {onEdit && (
                      <button
                        onClick={() => onEdit(tx)}
                        className="p-1.5 text-gray-400 hover:text-amber-600 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteClick(tx.transactionId || tx.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal - Google Style */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-xl">
            <h3 className="text-base font-normal text-gray-800 mb-2">Delete transaction?</h3>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-normal text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(showDeleteConfirm)}
                className="px-4 py-2 text-sm font-normal text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination - Google Style */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {((currentPage - 1) * itemsPerPage) + 1}–{Math.min(currentPage * itemsPerPage, processedTransactions.length)} of {processedTransactions.length}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 text-sm font-normal rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
