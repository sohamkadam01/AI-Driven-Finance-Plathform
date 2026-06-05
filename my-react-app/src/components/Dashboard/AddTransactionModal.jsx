import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Plus, Loader2, AlertCircle, CheckCircle, Wallet, Calendar, 
  MapPin, Tag, Brain, TrendingUp, TrendingDown, CreditCard,
  Building2, Sparkles, Shield, ArrowRight, CircleDollarSign
} from 'lucide-react';
import axios from 'axios';
import { accountAPI, categoryAPI } from '../../services/api';
import addTransactionImg from '../../assets/add_transaction.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const getTodayDate = () => {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - timezoneOffset).toISOString().split('T')[0];
};

const getInitialFormData = () => ({
  amount: '',
  type: 'EXPENSE',
  description: '',
  categoryId: '',
  accountId: '',
  transactionDate: getTodayDate(),
  location: ''
});

const formatCurrency = (amount) => {
  const numericAmount = Number(amount || 0);
  return `Rs ${numericAmount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

const formatBudgetMonth = (impactData) => {
  if (impactData?.budgetMonthLabel) return impactData.budgetMonthLabel;
  if (!impactData?.budgetMonth) return 'Selected month';

  return new Date(impactData.budgetMonth).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });
};

const AddTransactionModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(getInitialFormData);
  
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      resetForm();
      setFetchLoading(true);
      setCategoryLoading(true);
      setCategoryError('');
      fetchCategories();
      fetchAccounts();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    setCategoryLoading(true);
    setCategoryError('');
    try {
      const response = await categoryAPI.getExpenseCategories();
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategories([]);
      setCategoryError('Failed to load categories. Please reopen the modal or check your login.');
    } finally {
      setCategoryLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await accountAPI.getMyAccounts();
      setAccounts(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
      setAccounts([]);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleTypeChange = (type) => {
    setFormData(prev => ({ ...prev, type, categoryId: '' }));
    fetchCategoriesByType(type);
  };

  const fetchCategoriesByType = async (type) => {
    setCategoryLoading(true);
    setCategoryError('');
    try {
      const response = type === 'INCOME'
        ? await categoryAPI.getIncomeCategories()
        : await categoryAPI.getExpenseCategories();
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategories([]);
      setCategoryError('Failed to load categories for this transaction type.');
    } finally {
      setCategoryLoading(false);
    }
  };

  const [impactData, setImpactData] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [checkingImpact, setCheckingImpact] = useState(false);

  useEffect(() => {
    if (formData.amount && formData.categoryId && formData.type === 'EXPENSE') {
      setImpactData(null);
      setShowWarning(false);
      const delayDebounceFn = setTimeout(() => {
        checkFinancialImpact();
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setImpactData(null);
      setShowWarning(false);
    }
  }, [formData.amount, formData.categoryId, formData.type, formData.transactionDate]);

  const checkFinancialImpact = async () => {
    setCheckingImpact(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/budgets/check-impact`, {
        categoryId: parseInt(formData.categoryId),
        amount: parseFloat(formData.amount),
        date: formData.transactionDate
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setImpactData(response.data);
    } catch (err) {
      console.error('Impact check failed:', err);
    } finally {
      setCheckingImpact(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (!formData.categoryId) {
      setError('Please select a category');
      return;
    }
    if (!formData.accountId) {
      setError('Please select an account');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please enter a description');
      return;
    }

    if (impactData?.isOverBudget && !showWarning) {
      setShowWarning(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const payload = {
        amount: parseFloat(formData.amount),
        type: formData.type,
        description: formData.description,
        categoryId: parseInt(formData.categoryId),
        transactionDate: formData.transactionDate,
        location: formData.location || null
      };

      const response = await axios.post(
        `${API_BASE_URL}/transactions/add/${formData.accountId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200 || response.status === 201) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
          resetForm();
        }, 1500);
      }
    } catch (err) {
      console.error('Add transaction error:', err);
      setError(err.response?.data?.message || 'Failed to add transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(getInitialFormData());
    setError('');
    setImpactData(null);
    setShowWarning(false);
    setSuccess(false);
  };

  const getCategoryIcon = (categoryName) => {
    const icons = {
      'Food & Dining': '🍔',
      'Coffee Shops': '☕',
      'Restaurants': '🍽️',
      'Shopping': '🛍️',
      'Transportation': '🚗',
      'Entertainment': '🎬',
      'Bills & Utilities': '💡',
      'Healthcare': '🏥',
      'Education': '📚',
      'Salary': '💰',
      'Freelance': '💼',
      'Investment': '📈'
    };
    return icons[categoryName] || '📦';
  };

  const renderBudgetDetails = () => {
    if (!impactData?.hasBudget) return null;

    const details = [
      ['Budget Type', impactData.budgetType || 'Monthly category budget'],
      ['Budget Month', formatBudgetMonth(impactData)],
      ['Category', impactData.categoryName || 'Selected category'],
      ['Budget Limit', formatCurrency(impactData.budgetLimit)],
      ['Spent Before', formatCurrency(impactData.spentBefore)],
      ['After Transaction', formatCurrency(impactData.totalAfter)]
    ];

    if (impactData.isOverBudget) {
      details.push(['Over By', formatCurrency(impactData.overBy)]);
    } else {
      details.push(['Remaining After', formatCurrency(impactData.remainingAfter)]);
    }

    return (
      <div className="mt-4 grid grid-cols-2 gap-2">
        {details.map(([label, value]) => (
          <div key={label} className="rounded-lg bg-white/75 border border-white/70 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
            <p className="mt-0.5 text-sm font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            {/* Header - Google Material Style */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
                  <CircleDollarSign size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Add Transaction</h2>
                  <p className="text-xs text-gray-500">Record income or expense</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {success ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Transaction Added!</h3>
                  <p className="text-gray-500">Your transaction has been recorded successfully.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Transaction Type Toggle - Google Material */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction Type
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleTypeChange('EXPENSE')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all ${
                          formData.type === 'EXPENSE'
                            ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <TrendingDown size={16} />
                        Expense
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTypeChange('INCOME')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all ${
                          formData.type === 'INCOME'
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <TrendingUp size={16} />
                        Income
                      </button>
                    </div>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                        required
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Tag size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="e.g., Starbucks Coffee, Monthly Salary"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                        required
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    {categoryLoading ? (
                      <div className="flex items-center gap-2 py-2">
                        <Loader2 size={16} className="animate-spin text-gray-400" />
                        <span className="text-sm text-gray-400">Loading categories...</span>
                      </div>
                    ) : (
                      <>
                        <select
                          name="categoryId"
                          value={formData.categoryId}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white appearance-none cursor-pointer disabled:opacity-60"
                          required
                          disabled={categories.length === 0}
                        >
                          <option value="">
                            {categories.length === 0 ? 'No categories available' : 'Select a category'}
                          </option>
                          {categories.map(cat => (
                            <option key={cat.categoryId} value={cat.categoryId}>
                              {getCategoryIcon(cat.name)} {cat.name}
                            </option>
                          ))}
                        </select>
                        {categoryError && (
                          <p className="text-xs text-red-500 mt-1">{categoryError}</p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Account */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account <span className="text-red-500">*</span>
                    </label>
                    {fetchLoading ? (
                      <div className="flex items-center gap-2 py-2">
                        <Loader2 size={16} className="animate-spin text-gray-400" />
                        <span className="text-sm text-gray-400">Loading accounts...</span>
                      </div>
                    ) : (
                      <div className="relative">
                        <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select
                          name="accountId"
                          value={formData.accountId}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                          required
                        >
                          <option value="">Select an account</option>
                          {accounts.map(acc => (
                            <option key={acc.accountId} value={acc.accountId}>
                              {acc.bankName} - {acc.accountNumber} (₹{acc.currentBalance?.toLocaleString()})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transaction Date
                    </label>
                    <div className="relative">
                      <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        name="transactionDate"
                        value={formData.transactionDate}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <div className="relative">
                      <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g., Bangalore, Online"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* AI Impact Analysis */}
                  {formData.amount && formData.categoryId && formData.type === 'EXPENSE' && impactData && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl border ${
                        impactData.severity === 'HIGH' ? 'bg-rose-50 border-rose-200' : 
                        impactData.severity === 'MEDIUM' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          impactData.severity === 'HIGH' ? 'bg-rose-100 text-rose-600' : 
                          impactData.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          <Brain size={18} />
                        </div>
                        <div>
                          <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                            impactData.severity === 'HIGH' ? 'text-rose-700' : 
                            impactData.severity === 'MEDIUM' ? 'text-amber-700' : 'text-blue-700'
                          }`}>
                            AI Budget Guardian
                          </p>
                          <p className="text-sm text-gray-800 leading-relaxed">
                            {impactData.aiMessage}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex justify-between text-[10px] font-medium text-gray-500 mb-1">
                          <span>Budget Usage</span>
                          <span>{impactData.utilizationAfter}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              impactData.utilizationAfter > 100 ? 'bg-rose-500' : 
                              impactData.utilizationAfter > 80 ? 'bg-amber-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${Math.min(impactData.utilizationAfter, 100)}%` }}
                          />
                        </div>
                      </div>

                      {renderBudgetDetails()}
                    </motion.div>
                  )}

                  {/* Warning Screen */}
                  {showWarning && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-5 bg-rose-50 border-2 border-rose-200 rounded-2xl shadow-sm"
                    >
                      <div className="flex items-center gap-3 mb-3 text-rose-700">
                        <AlertCircle size={24} className="animate-pulse" />
                        <h4 className="font-bold text-lg">Budget Limit Exceeded!</h4>
                      </div>
                      <p className="text-sm text-gray-700 mb-5 leading-relaxed">
                        Our AI Guardian has flagged this transaction as <strong>High Risk</strong>. 
                        Proceeding will negatively impact your monthly budget balance.
                      </p>
                      {renderBudgetDetails()}
                      <div className="mt-5 flex flex-col sm:flex-row gap-3">
                        <button 
                          type="button"
                          onClick={() => {
                            setShowWarning(false);
                            setImpactData(null);
                            setFormData(prev => ({ ...prev, amount: '' }));
                          }}
                          className="flex-1 py-3 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all"
                        >
                          Cancel Spending
                        </button>
                        <button 
                          type="submit"
                          disabled={loading}
                          className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-all shadow-md flex justify-center items-center gap-2"
                        >
                          {loading ? <Loader2 size={18} className="animate-spin" /> : 'Continue Anyway'}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Error Message */}
                  {error && !showWarning && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-50 rounded-xl flex items-center gap-2 text-red-600"
                    >
                      <AlertCircle size={16} />
                      <span className="text-sm">{error}</span>
                    </motion.div>
                  )}

                  {/* Buttons */}
                  {!showWarning && (
                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading || fetchLoading || checkingImpact}
                        className={`px-5 py-2.5 rounded-xl text-white font-medium transition-all flex items-center gap-2 shadow-md ${
                          impactData?.severity === 'HIGH' 
                            ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800' 
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                        } disabled:opacity-50`}
                      >
                        {loading ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Plus size={18} />
                            Add Transaction
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </form>
              )}
            </div>

            {/* Footer Note */}
            {!success && !showWarning && (
              <div className="px-6 pb-4">
                <p className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1">
                  <Shield size={10} />
                  Your transaction is secure and encrypted
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddTransactionModal;
