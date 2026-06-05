import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Eye, MessageSquare, ChevronDown, ChevronUp, Shield, Clock } from 'lucide-react';

const AnomalyList = ({ anomalies, loading, onViewDetails, onMarkAsFraud, onMarkAsFalseAlarm, onAddResolution }) => {
  const [filter, setFilter] = useState('all'); // all, pending, resolved, fraud
  const [expandedId, setExpandedId] = useState(null);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-40 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!anomalies || anomalies.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield size={24} className="text-green-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No anomalies detected</h3>
        <p className="text-gray-500">Your transactions look normal. Keep up the good work!</p>
      </div>
    );
  }

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'HIGH':
        return { text: 'High', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: AlertTriangle };
      case 'MEDIUM':
        return { text: 'Medium', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', icon: AlertTriangle };
      default:
        return { text: 'Low', color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: AlertTriangle };
    }
  };

  const getStatusBadge = (anomaly) => {
    if (anomaly.isFraud) {
      return { text: 'Confirmed Fraud', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: XCircle };
    }
    if (anomaly.resolutionNote) {
      return { text: 'Resolved', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle };
    }
    return { text: 'Pending Review', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: Clock };
  };

  const filteredAnomalies = anomalies.filter(anomaly => {
    if (filter === 'pending') return !anomaly.isFraud && !anomaly.resolutionNote;
    if (filter === 'resolved') return anomaly.resolutionNote && !anomaly.isFraud;
    if (filter === 'fraud') return anomaly.isFraud;
    return true;
  });

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Filter Bar */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-orange-500" />
          <h3 className="text-base font-medium text-gray-900">Flagged Transactions</h3>
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
            {filteredAnomalies.length} items
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filter === 'resolved' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Resolved
          </button>
          <button
            onClick={() => setFilter('fraud')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filter === 'fraud' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Fraud
          </button>
        </div>
      </div>

      {/* Anomaly List */}
      <div className="divide-y divide-gray-100">
        {filteredAnomalies.map((anomaly) => {
          const severity = getSeverityBadge(anomaly.severity);
          const status = getStatusBadge(anomaly);
          const SeverityIcon = severity.icon;
          const StatusIcon = status.icon;
          const isExpanded = expandedId === anomaly.anomalyId;
          
          return (
            <div key={anomaly.anomalyId} className="hover:bg-gray-50/50 transition-colors">
              {/* Main Row */}
              <div className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-1.5 rounded-full ${severity.bg}`}>
                        <SeverityIcon size={12} className={severity.color} />
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${severity.bg} ${severity.color} border ${severity.border}`}>
                        {severity.text} Severity
                      </span>
                      <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.color} border ${status.border}`}>
                        <StatusIcon size={10} />
                        <span>{status.text}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-1">{anomaly.reason}</p>
                    <p className="text-xs text-gray-400">
                      Reported: {new Date(anomaly.reportedAt).toLocaleString()}
                    </p>
                    
                    {anomaly.resolutionNote && (
                      <p className="text-xs text-gray-500 mt-2">
                        Resolution: {anomaly.resolutionNote}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewDetails(anomaly)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    {!anomaly.isFraud && !anomaly.resolutionNote && (
                      <>
                        <button
                          onClick={() => onMarkAsFraud(anomaly.anomalyId)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Mark as Fraud"
                        >
                          <XCircle size={16} />
                        </button>
                        <button
                          onClick={() => onAddResolution(anomaly)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Add Resolution"
                        >
                          <MessageSquare size={16} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => toggleExpand(anomaly.anomalyId)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && anomaly.transaction && (
                <div className="px-6 pb-4 pt-2 border-t border-gray-100 bg-gray-50/30">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Transaction Details</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-400">Amount</p>
                      <p className="font-medium text-gray-900">
                        ₹{anomaly.transaction.amount?.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(anomaly.transaction.transactionDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Category</p>
                      <p className="font-medium text-gray-900">
                        {anomaly.transaction.category?.name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Location</p>
                      <p className="font-medium text-gray-900">
                        {anomaly.transaction.location || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs text-gray-400">Description</p>
                    <p className="text-sm text-gray-700">{anomaly.transaction.description}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredAnomalies.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-gray-500">No anomalies match your filter</p>
        </div>
      )}
    </div>
  );
};

export default AnomalyList;