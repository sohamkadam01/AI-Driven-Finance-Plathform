import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, CreditCard, Calendar, Tag } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const AddBillModal = ({ isOpen, onClose, onSuccess, editingBill }) => {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    categoryId: '',
    frequency: 'MONTHLY',
    nextDueDate: new Date().toISOString().split('T')[0],
    reminderDaysBefore: 3,
    description: '',
    bankAccountId: ''
  });
  
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      fetchAccounts();
      if (editingBill) {
        setFormData({
          name: editingBill.name || '',
          amount: editingBill.amount || '',
          categoryId: editingBill.categoryId || '',
          frequency: editingBill.frequency || 'MONTHLY',
          nextDueDate: editingBill.nextDueDate || new Date().toISOString().split('T')[0],
          reminderDaysBefore: editingBill.reminderDaysBefore || 3,
          description: editingBill.description || '',
          bankAccountId: editingBill.bankAccountId || ''
        });
      } else {
        resetForm();
      }
    }
  }, [isOpen, editingBill]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/categories/expense-categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/accounts/my-accounts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAccounts(response.data);
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
    } finally {
      setFetchLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      categoryId: '',
      frequency: 'MONTHLY',
      nextDueDate: new Date().toISOString().split('T')[0],
      reminderDaysBefore: 3,
      description: '',
      bankAccountId: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Please enter bill name');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (!formData.categoryId) {
      setError('Please select a category');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const payload = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        categoryId: parseInt(formData.categoryId),
        frequency: formData.frequency,
        nextDueDate: formData.nextDueDate,
        reminderDaysBefore: parseInt(formData.reminderDaysBefore),
        description: formData.description,
        bankAccountId: formData.bankAccountId ? parseInt(formData.bankAccountId) : null
      };

      let response;
      if (editingBill) {
        response = await axios.put(
          `${API_BASE_URL}/bill-reminders/${editingBill.recurringId}/update`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        response = await axios.post(
          `${API_BASE_URL}/bill-reminders/create`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      if (response.status === 200 || response.status === 201) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save bill reminder');
    } finally {
      setLoading(false);
    }
  };

  const frequencies = [
    { value: 'MONTHLY', label: 'Monthly' },
    { value: 'WEEKLY', label: 'Weekly' },
    { value: 'YEARLY', label: 'Yearly' },
    { value: 'DAILY', label: 'Daily' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingBill ? 'Edit Bill Reminder' : 'Add Bill Reminder'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Bill Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bill Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Netflix, Electricity Bill"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>

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
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.categoryId} value={cat.categoryId}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequency
              </label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {frequencies.map(freq => (
                  <option key={freq.value} value={freq.value}>
                    {freq.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Next Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Next Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="nextDueDate"
                value={formData.nextDueDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>

            {/* Reminder Days Before */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reminder Days Before
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  name="reminderDaysBefore"
                  value={formData.reminderDaysBefore}
                  onChange={handleChange}
                  min="0"
                  max="7"
                  step="1"
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 w-12">
                  {formData.reminderDaysBefore} day{formData.reminderDaysBefore !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                You'll be reminded {formData.reminderDaysBefore} day(s) before the due date
              </p>
            </div>

            {/* Bank Account (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Account (Optional)
              </label>
              <select
                name="bankAccountId"
                value={formData.bankAccountId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">Select an account</option>
                {accounts.map(acc => (
                  <option key={acc.accountId} value={acc.accountId}>
                    {acc.bankName} - {acc.accountNumber}
                  </option>
                ))}
              </select>
            </div>

            {/* Description (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="2"
                placeholder="Additional notes about this bill"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              />
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
                {loading ? <Loader2 size={16} className="animate-spin" /> : (editingBill ? 'Update Bill' : 'Add Bill')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBillModal;