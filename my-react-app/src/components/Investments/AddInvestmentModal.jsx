import React, { useState, useEffect, useCallback } from 'react';
import { X, Loader2, AlertCircle, RefreshCw } from 'lucide-react';  // Removed Wallet from here
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const BANK_ACCOUNT_LOAD_ERROR = 'Failed to load bank accounts. Please add a bank account first.';

const normalizeAccounts = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.accounts)) return data.accounts;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const AddInvestmentModal = ({ isOpen, onClose, onSuccess, editingInvestment }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'STOCK',
    amountInvested: '',
    currentValue: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    symbol: '',
    quantity: '',
    accountId: ''
  });
  
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchBankAccounts = useCallback(async () => {
    setLoadingAccounts(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/accounts/my-accounts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const nextAccounts = normalizeAccounts(response.data);
      setAccounts(nextAccounts);
      setError(prev => (prev === BANK_ACCOUNT_LOAD_ERROR ? '' : prev));

      if (nextAccounts.length > 0) {
        setFormData(prev => {
          const selectedAccountStillExists = nextAccounts.some(
            acc => String(acc.accountId) === String(prev.accountId)
          );

          return {
            ...prev,
            accountId: selectedAccountStillExists ? prev.accountId : nextAccounts[0].accountId
          };
        });
      }
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
      setAccounts([]);
      setError(BANK_ACCOUNT_LOAD_ERROR);
    } finally {
      setLoadingAccounts(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && !editingInvestment) {
      fetchBankAccounts();
    }
  }, [isOpen, editingInvestment, fetchBankAccounts]);

  useEffect(() => {
    if (!isOpen || editingInvestment) return;

    const refreshAccounts = () => fetchBankAccounts();
    window.addEventListener('bankAccountsUpdated', refreshAccounts);
    window.addEventListener('focus', refreshAccounts);

    return () => {
      window.removeEventListener('bankAccountsUpdated', refreshAccounts);
      window.removeEventListener('focus', refreshAccounts);
    };
  }, [isOpen, editingInvestment, fetchBankAccounts]);

  useEffect(() => {
    if (editingInvestment && isOpen) {
      setFormData({
        name: editingInvestment.name || '',
        type: editingInvestment.type || 'STOCK',
        amountInvested: editingInvestment.amountInvested || '',
        currentValue: editingInvestment.currentValue || '',
        purchaseDate: editingInvestment.purchaseDate || new Date().toISOString().split('T')[0],
        symbol: editingInvestment.symbol || '',
        quantity: editingInvestment.quantity || '',
        accountId: editingInvestment.accountId || ''
      });
    } else if (isOpen) {
      resetForm();
    }
  }, [editingInvestment, isOpen]);

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'STOCK',
      amountInvested: '',
      currentValue: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      symbol: '',
      quantity: '',
      accountId: accounts.length > 0 ? accounts[0].accountId : ''
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
      setError('Please enter investment name');
      return;
    }
    if (!formData.amountInvested || parseFloat(formData.amountInvested) <= 0) {
      setError('Please enter a valid invested amount');
      return;
    }
    if (!formData.accountId && !editingInvestment) {
      setError('Please select a bank account to deduct from');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const payload = {
        name: formData.name,
        type: formData.type,
        amountInvested: parseFloat(formData.amountInvested),
        currentValue: formData.currentValue ? parseFloat(formData.currentValue) : parseFloat(formData.amountInvested),
        purchaseDate: formData.purchaseDate,
        symbol: formData.symbol || null,
        quantity: formData.quantity ? parseInt(formData.quantity) : null,
        accountId: parseInt(formData.accountId)
      };

      console.log('📤 Sending investment payload:', payload);  // Debug log

      let response;
      if (editingInvestment) {
        response = await axios.put(
          `${API_BASE_URL}/investments/${editingInvestment.investmentId}/update-value`,
          null,
          {
            params: { newValue: payload.currentValue },
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      } else {
        response = await axios.post(
          `${API_BASE_URL}/investments/add`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      console.log('📥 Investment response:', response.data);  // Debug log

      if (response.status === 200 || response.status === 201) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Investment error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to save investment');
    } finally {
      setLoading(false);
    }
  };

  const investmentTypes = [
    { value: 'STOCK', label: 'Stock', icon: '📈' },
    { value: 'MUTUAL_FUND', label: 'Mutual Fund', icon: '📊' },
    { value: 'FIXED_DEPOSIT', label: 'Fixed Deposit', icon: '🏦' },
    { value: 'BONDS', label: 'Bond', icon: '📜' },
    { value: 'REAL_ESTATE', label: 'Real Estate', icon: '🏠' },
    { value: 'GOLD', label: 'Gold', icon: '🥇' },
    { value: 'CRYPTO', label: 'Cryptocurrency', icon: '₿' },
    { value: 'ETF', label: 'ETF', icon: '📉' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingInvestment ? 'Update Investment Value' : 'Add Investment'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Bank Account Selection - NO SVG INSIDE OPTION */}
            {!editingInvestment && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Account <span className="text-red-500">*</span>
                </label>
                {loadingAccounts ? (
                  <div className="flex items-center gap-2 py-2">
                    <Loader2 size={16} className="animate-spin text-gray-400" />
                    <span className="text-sm text-gray-400">Loading accounts...</span>
                  </div>
                ) : accounts.length === 0 ? (
                  <div className="p-3 bg-amber-50 rounded-lg text-amber-600 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span>No bank accounts found. Please add a bank account first.</span>
                      <button
                        type="button"
                        onClick={fetchBankAccounts}
                        className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-700"
                      >
                        <RefreshCw size={14} />
                        Refresh
                      </button>
                    </div>
                  </div>
                ) : (
                  <select
                    name="accountId"
                    value={formData.accountId}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  >
                    <option value="">Select a bank account</option>
                    {accounts.map(acc => (
                      <option key={acc.accountId} value={acc.accountId}>
                        {/* ✅ Plain text only - no SVG here */}
                        {acc.bankName} - {acc.accountNumber} (₹{acc.currentBalance?.toLocaleString()})
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Money will be deducted from this account for the investment
                </p>
              </div>
            )}

            {/* Investment Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Investment Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Reliance Industries, SBI Bluechip Fund"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>

            {/* Investment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Investment Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {investmentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Symbol */}
            {formData.type === 'STOCK' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Symbol (Optional)
                </label>
                <input
                  type="text"
                  name="symbol"
                  value={formData.symbol}
                  onChange={handleChange}
                  placeholder="e.g., RELIANCE, TCS"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity (Optional)
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Number of units/shares"
                step="1"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Amount Invested */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount Invested <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="number"
                  name="amountInvested"
                  value={formData.amountInvested}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>
            </div>

            {/* Current Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Value
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="number"
                  name="currentValue"
                  value={formData.currentValue}
                  onChange={handleChange}
                  placeholder="Current market value"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Leave blank to use invested amount</p>
            </div>

            {/* Purchase Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Date
              </label>
              <input
                type="date"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
                disabled={loading || loadingAccounts || (accounts.length === 0 && !editingInvestment)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : (editingInvestment ? 'Update Value' : 'Add Investment')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddInvestmentModal;
