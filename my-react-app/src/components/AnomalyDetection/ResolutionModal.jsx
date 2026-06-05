import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';

const ResolutionModal = ({ anomaly, isOpen, onClose, onResolve }) => {
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !anomaly) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!notes.trim()) {
      setError('Please add resolution notes');
      return;
    }
    onResolve(anomaly.anomalyId, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CheckCircle size={20} className="text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Mark as False Alarm</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Transaction</p>
            <p className="font-medium text-gray-900">{anomaly.transaction?.description}</p>
            <p className="text-xs text-gray-400 mt-1">
              Amount: ₹{anomaly.transaction?.amount?.toLocaleString()}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resolution Notes <span className="text-red-500">*</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  setError('');
                }}
                rows="3"
                placeholder="Explain why this is not fraudulent..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
                required
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
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Mark as False Alarm
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResolutionModal;