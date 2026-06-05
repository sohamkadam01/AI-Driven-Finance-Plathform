import React from 'react';
import { X, AlertTriangle, Calendar, DollarSign, MapPin, Tag, FileText, CheckCircle, XCircle } from 'lucide-react';

const AnomalyDetailsModal = ({ anomaly, isOpen, onClose }) => {
  if (!isOpen || !anomaly) return null;

  const getSeverityInfo = (severity) => {
    switch (severity) {
      case 'HIGH':
        return { text: 'High', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' };
      case 'MEDIUM':
        return { text: 'Medium', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' };
      default:
        return { text: 'Low', color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    }
  };

  const severityInfo = getSeverityInfo(anomaly.severity);
  const transaction = anomaly.transaction;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-900">Anomaly Details</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Badges */}
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${severityInfo.bg} ${severityInfo.color} border ${severityInfo.border}`}>
              {severityInfo.text} Severity
            </div>
            {anomaly.isFraud ? (
              <div className="px-3 py-1 rounded-full text-sm font-medium bg-red-50 text-red-700 border border-red-200">
                Confirmed Fraud
              </div>
            ) : anomaly.resolutionNote ? (
              <div className="px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200">
                Resolved - False Alarm
              </div>
            ) : (
              <div className="px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                Pending Review
              </div>
            )}
          </div>

          {/* Reason */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-orange-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Detection Reason</h3>
                <p className="text-gray-900">{anomaly.reason}</p>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          {transaction && (
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-3">Transaction Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <DollarSign size={16} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400">Amount</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ₹{transaction.amount?.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar size={16} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400">Date & Time</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(transaction.transactionDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Tag size={16} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400">Category</p>
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.category?.name || 'Uncategorized'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400">Location</p>
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.location || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-start gap-3">
                <FileText size={16} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400">Description</p>
                  <p className="text-sm text-gray-700">{transaction.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Resolution Notes */}
          {anomaly.resolutionNote && (
            <div className="bg-green-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <CheckCircle size={18} className="text-green-500 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Resolution Notes</h3>
                  <p className="text-gray-900">{anomaly.resolutionNote}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Resolved on: {new Date(anomaly.resolvedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Report Information */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400">
              Reported: {new Date(anomaly.reportedAt).toLocaleString()}
            </p>
            {anomaly.resolvedAt && (
              <p className="text-xs text-gray-400 mt-1">
                Resolved: {new Date(anomaly.resolvedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnomalyDetailsModal;