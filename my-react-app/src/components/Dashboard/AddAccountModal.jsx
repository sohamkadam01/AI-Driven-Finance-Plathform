import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, Loader2, AlertCircle, CheckCircle, Building2, CreditCard, Landmark, Shield } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const AddAccountModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    accountType: 'SAVINGS',
    currentBalance: '',
    currency: 'INR'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const accountTypes = [
    { value: 'SAVINGS', label: 'Savings Account', icon: Wallet, color: 'blue' },
    { value: 'CURRENT', label: 'Current Account', icon: Building2, color: 'purple' },
    { value: 'CREDIT', label: 'Credit Card', icon: CreditCard, color: 'orange' }
  ];

  const currencies = [
    { value: 'INR', label: 'Indian Rupee (₹)', symbol: '₹' },
    { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
    { value: 'EUR', label: 'Euro (€)', symbol: '€' },
    { value: 'GBP', label: 'British Pound (£)', symbol: '£' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.bankName.trim()) {
      setError('Please enter bank name');
      return;
    }
    if (!formData.accountNumber.trim()) {
      setError('Please enter account number');
      return;
    }
    if (formData.accountNumber.length < 9 || formData.accountNumber.length > 18) {
      setError('Account number must be 9-18 digits');
      return;
    }
    if (!formData.currentBalance || parseFloat(formData.currentBalance) < 0) {
      setError('Please enter a valid balance');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const payload = {
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        accountType: formData.accountType,
        currentBalance: parseFloat(formData.currentBalance),
        currency: formData.currency
      };

      const response = await axios.post(
        `${API_BASE_URL}/accounts/add`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200 || response.status === 201) {
        setSuccess(true);
        window.dispatchEvent(new CustomEvent('bankAccountsUpdated', { detail: response.data }));
        setTimeout(() => {
          onSuccess();
          onClose();
          resetForm();
        }, 1500);
      }
    } catch (err) {
      console.error('Add account error:', err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to add account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      bankName: '',
      accountNumber: '',
      accountType: 'SAVINGS',
      currentBalance: '',
      currency: 'INR'
    });
    setError('');
    setSuccess(false);
  };

  const getCurrencySymbol = () => {
    const currency = currencies.find(c => c.value === formData.currency);
    return currency?.symbol || '₹';
  };

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
                  <Landmark size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Add Bank Account</h2>
                  <p className="text-xs text-gray-500">Link your bank account to track finances</p>
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Account Added!</h3>
                  <p className="text-gray-500">Your bank account has been successfully linked.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Bank Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleChange}
                        placeholder="e.g., State Bank of India"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                        required
                      />
                    </div>
                  </div>

                  {/* Account Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <CreditCard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleChange}
                        placeholder="Enter account number"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">9-18 digits (only numbers)</p>
                  </div>

                  {/* Account Type - Google Material Chips */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Type
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {accountTypes.map(type => {
                        const Icon = type.icon;
                        const isSelected = formData.accountType === type.value;
                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => handleChange({ target: { name: 'accountType', value: type.value } })}
                            className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                              isSelected
                                ? `border-${type.color}-500 bg-${type.color}-50 text-${type.color}-600`
                                : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'
                            }`}
                          >
                            <Icon size={18} className={isSelected ? `text-${type.color}-500` : ''} />
                            <span className="text-xs font-medium">{type.label.split(' ')[0]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Current Balance */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Balance <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                        {getCurrencySymbol()}
                      </span>
                      <input
                        type="number"
                        name="currentBalance"
                        value={formData.currentBalance}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                        required
                      />
                    </div>
                  </div>

                  {/* Currency - Google Material Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                    >
                      {currencies.map(curr => (
                        <option key={curr.value} value={curr.value}>
                          {curr.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Security Note */}
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
                    <Shield size={14} className="text-blue-600" />
                    <p className="text-xs text-blue-700">
                      Your account information is encrypted and secure. We use bank-grade security.
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && (
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
                      disabled={loading}
                      className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2 font-medium shadow-md"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Wallet size={18} />
                          Add Account
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddAccountModal;
