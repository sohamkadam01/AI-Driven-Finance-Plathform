import React, { useState, useEffect } from 'react';
import { X, Target, Loader2, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import axios from 'axios';
import addBudgetImg from '../../assets/add_budget.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const CreateBudgetModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    categoryId: '',
    month: new Date().toISOString().slice(0, 7) + '-01',
    amountLimit: '',
    alertThreshold: 80
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Fetch categories when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    setFetchLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/categories/expense-categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError('Could not load categories');
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
    
    // Validation
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
      const payload = {
        categoryId: parseInt(formData.categoryId),
        month: formData.month,
        amountLimit: parseFloat(formData.amountLimit),
        alertThreshold: parseFloat(formData.alertThreshold)
      };

      const response = await axios.post(
        `${API_BASE_URL}/budgets/create`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
          resetForm();
        }, 1500);
      }
    } catch (err) {
      console.error('Create budget error:', err);
      setError(err.response?.data?.message || 'Failed to create budget. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      categoryId: '',
      month: new Date().toISOString().slice(0, 7) + '-01',
      amountLimit: '',
      alertThreshold: 80
    });
    setError('');
    setSuccess(false);
  };

  // Get month name
  const getMonthName = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="relative p-2 bg-orange-50 rounded-lg overflow-hidden">
              <img src={addBudgetImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
              <Target size={20} className="text-orange-600 relative z-10" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Create Budget</h2>
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
            <div className="text-center py-8">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Budget Created!</h3>
              <p className="text-gray-500">Your budget has been set successfully.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Month Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget Month <span className="text-red-500">*</span>
                </label>
                <input
                  type="month"
                  name="month"
                  value={formData.month.slice(0, 7)}
                  onChange={(e) => setFormData(prev => ({ ...prev, month: e.target.value + '-01' }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Setting budget for {getMonthName(formData.month)}
                </p>
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
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

              {/* Budget Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget Amount <span className="text-red-500">*</span>
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
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                    required
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Set a monthly spending limit for this category</p>
              </div>

              {/* Alert Threshold */}
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

              {/* Budget Preview */}
              {formData.amountLimit && (
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={16} className="text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">Budget Preview</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Monthly Limit:</span>
                    <span className="font-semibold text-gray-900">₹{parseFloat(formData.amountLimit).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-600">Alert at:</span>
                    <span className="text-sm text-orange-600">₹{(parseFloat(formData.amountLimit) * formData.alertThreshold / 100).toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 rounded-lg flex items-center gap-2 text-red-600">
                  <AlertCircle size={16} />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || fetchLoading}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-orange-300 transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Budget'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateBudgetModal;