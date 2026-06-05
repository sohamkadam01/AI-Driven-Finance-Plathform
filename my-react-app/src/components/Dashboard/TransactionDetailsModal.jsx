import React, { useState, useEffect } from 'react';
import { 
  X, Edit2, Trash2, Save, Loader2, AlertCircle, 
  Calendar, MapPin, Tag, Wallet, TrendingUp, TrendingDown,
  FileText, Receipt
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const TransactionDetailsModal = ({ isOpen, onClose, transaction, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    categoryId: '',
    transactionDate: '',
    location: ''
  });
  const [categories, setCategories] = useState([]);
  const [showReceipt, setShowReceipt] = useState(false);

  // Fetch categories when modal opens
  useEffect(() => {
    if (isOpen && transaction) {
      fetchCategories();
      initializeForm();
    }
  }, [isOpen, transaction]);

  const initializeForm = () => {
    if (transaction) {
      setFormData({
        amount: transaction.amount || '',
        description: transaction.description || '',
        categoryId: transaction.category?.categoryId || '',
        transactionDate: transaction.transactionDate || new Date().toISOString().split('T')[0],
        location: transaction.location || ''
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = transaction?.type === 'INCOME' 
        ? '/categories/income-categories' 
        : '/categories/expense-categories';
      const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleUpdate = async () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const payload = {
        amount: parseFloat(formData.amount),
        description: formData.description,
        categoryId: parseInt(formData.categoryId),
        transactionDate: formData.transactionDate,
        location: formData.location || null
      };

      const response = await axios.put(
        `${API_BASE_URL}/transactions/${transaction.transactionId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        setIsEditing(false);
        if (onUpdate) onUpdate(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/transactions/${transaction.transactionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (onDelete) onDelete(transaction.transactionId);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete transaction');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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
      'Freelance': '💼'
    };
    return icons[categoryName] || '📦';
  };

  if (!isOpen || !transaction) return null;

  const isIncome = transaction.type === 'INCOME';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${isIncome ? 'bg-green-50' : 'bg-rose-50'}`}>
              {isIncome ? (
                <TrendingUp size={20} className="text-green-600" />
              ) : (
                <TrendingDown size={20} className="text-rose-600" />
              )}
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Transaction' : 'Transaction Details'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Edit2 size={18} className="text-gray-500" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="p-2 hover:bg-red-50 rounded-full transition-colors"
                >
                  <Trash2 size={18} className="text-red-500" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {deleteConfirm ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={28} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Transaction?</h3>
              <p className="text-gray-500 text-sm mb-6">
                Are you sure you want to delete this transaction? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : 'Delete'}
                </button>
              </div>
            </div>
          ) : isEditing ? (
            // Edit Form
            <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }} className="space-y-4">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {getCategoryIcon(cat.name)} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="transactionDate"
                  value={formData.transactionDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Optional"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 rounded-lg flex items-center gap-2 text-red-600">
                  <AlertCircle size={16} />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    initializeForm();
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            // View Details
            <div className="space-y-5">
              {/* Amount */}
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Amount</p>
                <p className={`text-3xl font-bold ${isIncome ? 'text-green-600' : 'text-rose-600'}`}>
                  {isIncome ? '+' : '-'} ₹{transaction.amount?.toLocaleString()}
                </p>
              </div>

              {/* Description */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-start gap-3">
                  <Tag size={18} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Description</p>
                    <p className="text-gray-800 font-medium">{transaction.description || 'No description'}</p>
                  </div>
                </div>
              </div>

              {/* Category */}
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-gray-100 rounded-lg">
                  <span className="text-lg">
                    {getCategoryIcon(transaction.category?.name)}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Category</p>
                  <p className="text-gray-800">{transaction.category?.name || 'Uncategorized'}</p>
                </div>
              </div>

              {/* Account */}
              <div className="flex items-start gap-3">
                <Wallet size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400 mb-1">Account</p>
                  <p className="text-gray-800">
                    {transaction.bankAccount?.bankName || 'Unknown'} - {transaction.bankAccount?.accountNumber || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-start gap-3">
                <Calendar size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400 mb-1">Date</p>
                  <p className="text-gray-800">{formatDate(transaction.transactionDate)}</p>
                </div>
              </div>

              {/* Location */}
              {transaction.location && (
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Location</p>
                    <p className="text-gray-800">{transaction.location}</p>
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="flex items-start gap-3">
                <div className={`px-2 py-0.5 rounded-full text-xs ${
                  transaction.status === 'COMPLETED' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {transaction.status || 'COMPLETED'}
                </div>
              </div>

              {/* Receipt Button (if OCR document exists) */}
              {transaction.ocrDocumentId && (
                <button
                  onClick={() => setShowReceipt(true)}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Receipt size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-600">View Original Receipt</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailsModal;