import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const CreateBudgetModal = ({ isOpen, onClose, onSuccess, editingBudget, selectedMonth }) => {
  const [formData, setFormData] = useState({
    categoryId: '',
    month: selectedMonth,
    amountLimit: '',
    alertThreshold: 80
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      if (editingBudget) {
        setFormData({
          categoryId: editingBudget.categoryId,
          month: selectedMonth,
          amountLimit: editingBudget.amountLimit,
          alertThreshold: editingBudget.alertThreshold || 80
        });
      } else {
        setFormData({
          categoryId: '',
          month: selectedMonth,
          amountLimit: '',
          alertThreshold: 80
        });
      }
    }
  }, [isOpen, editingBudget, selectedMonth]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/categories/expense-categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.categoryId) {
      setError('Please select a category');
      return;
    }
    if (!formData.amountLimit || parseFloat(formData.amountLimit) <= 0) {
      setError('Please enter a valid budget amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Your session has expired. Please log in again.');
        setLoading(false);
        return;
      }

      const payload = {
        categoryId: parseInt(formData.categoryId),
        month: formData.month + "-01", // Convert YYYY-MM to YYYY-MM-DD
        amountLimit: parseFloat(formData.amountLimit),
        alertThreshold: parseFloat(formData.alertThreshold)
      };

      const config = {
        headers: { 
          'Authorization': `Bearer ${token.trim()}`,
          'Content-Type': 'application/json'
        }
      };

      let response;
      if (editingBudget) {
        response = await axios.put(
          `${API_BASE_URL}/budgets/${editingBudget.budgetId}`,
          { amountLimit: payload.amountLimit, alertThreshold: payload.alertThreshold },
          config
        );
      } else {
        response = await axios.post(
          `${API_BASE_URL}/budgets/create`,
          payload,
          config
        );
      }

      if (response.data.success) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Budget operation failed:', err);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError(err.response?.data?.message || 'Failed to save budget. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingBudget ? 'Edit Budget' : 'Create Budget'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget Month
              </label>
              <input
                type="month"
                name="month"
                value={formData.month}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Setting budget for {getMonthName(formData.month)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              {fetchLoading ? (
                <div className="flex items-center gap-2 py-2">
                  <Loader2 size={16} className="animate-spin text-gray-400" />
                  <span className="text-sm text-gray-400">Loading categories...</span>
                </div>
              ) : (
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  disabled={!!editingBudget}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="number"
                  name="amountLimit"
                  value={formData.amountLimit}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alert Threshold (%)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  name="alertThreshold"
                  value={formData.alertThreshold}
                  onChange={handleChange}
                  min="50"
                  max="100"
                  step="5"
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <span className="text-sm font-medium text-gray-700 w-12">
                  {formData.alertThreshold}%
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                You'll be notified when spending reaches {formData.alertThreshold}% of budget
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 rounded-lg flex items-center gap-2 text-red-600">
                <AlertCircle size={16} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || fetchLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : (editingBudget ? 'Update Budget' : 'Create Budget')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateBudgetModal;