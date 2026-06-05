import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const UpdateValueModal = ({ isOpen, onClose, onSuccess, investment }) => {
  const [newValue, setNewValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (investment && isOpen) {
      setNewValue(investment.currentValue || '');
    }
  }, [investment, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newValue || parseFloat(newValue) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/investments/${investment.investmentId}/update-value`,
        null,
        {
          params: { newValue: parseFloat(newValue) },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update value');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !investment) return null;

  const isProfit = parseFloat(newValue) > investment.amountInvested;
  const profitLoss = newValue ? parseFloat(newValue) - investment.amountInvested : 0;
  const returnsPercentage = investment.amountInvested > 0 ? (profitLoss / investment.amountInvested) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Update Investment Value</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Investment</p>
            <p className="font-medium text-gray-900">{investment.name}</p>
            <p className="text-xs text-gray-400 mt-1">Invested: ₹{investment.amountInvested?.toLocaleString()}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Value <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="number"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>
            </div>

            {/* Preview */}
            {newValue && (
              <div className={`p-4 rounded-lg ${isProfit ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Profit/Loss:</span>
                  <div className="flex items-center gap-2">
                    {isProfit ? <TrendingUp size={14} className="text-green-600" /> : <TrendingDown size={14} className="text-red-600" />}
                    <span className={`font-semibold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                      {isProfit ? '+' : ''}₹{Math.abs(profitLoss).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-gray-600">Returns:</span>
                  <span className={`font-semibold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                    {returnsPercentage > 0 ? '+' : ''}{returnsPercentage.toFixed(2)}%
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 rounded-lg flex items-center gap-2 text-red-600">
                <AlertCircle size={16} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Update Value'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateValueModal;
