import React, { useState } from 'react';
import { Bell, AlertTriangle, CheckCircle, XCircle, Check, Shield, Clock, Sparkles, Zap } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const BudgetAlerts = ({ alerts, onRefresh }) => {
  const [markingRead, setMarkingRead] = useState(null);

  const getAlertIcon = (type) => {
    switch (type) {
      case 'BUDGET_WARNING':
        return <AlertTriangle size={18} className="text-amber-500" />;
      case 'BILL_REMINDER':
        return <Bell size={18} className="text-blue-500" />;
      case 'UNUSUAL_SPENDING':
        return <AlertTriangle size={18} className="text-red-500" />;
      default:
        return <Shield size={18} className="text-purple-500" />;
    }
  };

  const getAlertGradient = (type) => {
    switch (type) {
      case 'BUDGET_WARNING':
        return 'from-amber-50 to-orange-50 border-amber-200';
      case 'BILL_REMINDER':
        return 'from-blue-50 to-cyan-50 border-blue-200';
      case 'UNUSUAL_SPENDING':
        return 'from-red-50 to-rose-50 border-red-200';
      default:
        return 'from-gray-50 to-slate-50 border-gray-200';
    }
  };

  const getAlertStatusColor = (type) => {
    switch (type) {
      case 'BUDGET_WARNING':
        return 'text-amber-700 bg-amber-100';
      case 'BILL_REMINDER':
        return 'text-blue-700 bg-blue-100';
      case 'UNUSUAL_SPENDING':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-purple-700 bg-purple-100';
    }
  };

  const handleMarkAsRead = async (alertId) => {
    setMarkingRead(alertId);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/alerts/${alertId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to mark alert as read:', err);
    } finally {
      setMarkingRead(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/alerts/mark-all-read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to mark all alerts as read:', err);
    }
  };

  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-12 text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-xl"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-green-50 to-emerald-50 rounded-full flex items-center justify-center">
              <CheckCircle size={32} className="text-green-500" />
            </div>
          </div>
          <h3 className="text-base font-normal text-gray-700 mb-2">All caught up!</h3>
          <p className="text-sm text-gray-500">No new alerts at the moment.</p>
          <div className="mt-4 flex items-center justify-center gap-1 text-xs text-gray-400">
            <Sparkles size={12} />
            <span>Everything looks great</span>
          </div>
        </div>
      </div>
    );
  }

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <div className="space-y-5">
      {/* Header - Google Material Style */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur opacity-40"></div>
            <div className="relative p-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full shadow-md">
              <Bell size={18} className="text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-base font-medium text-gray-800">Budget Alerts</h3>
            <p className="text-xs text-gray-500 mt-0.5">Important notifications about your spending</p>
          </div>
          {unreadCount > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-red-500 to-rose-500 rounded-full shadow-sm">
              <span className="text-xs font-semibold text-white">{unreadCount} new</span>
            </div>
          )}
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all hover:shadow-sm"
          >
            <Check size={14} />
            Mark all as read
          </button>
        )}
      </div>

      {/* Alerts List - Google Material Cards */}
      <div className="space-y-3">
        {alerts.map((alert, idx) => {
          const isUnread = !alert.read;
          const alertGradient = getAlertGradient(alert.type);
          const statusColor = getAlertStatusColor(alert.type);
          
          return (
            <div
              key={alert.alertId}
              className={`group relative bg-gradient-to-r ${alertGradient} rounded-xl border shadow-sm transition-all duration-300 ${
                isUnread 
                  ? 'hover:shadow-md cursor-pointer' 
                  : 'opacity-80 hover:opacity-100'
              }`}
              style={{
                animation: `fadeInUp ${0.3 + idx * 0.05}s ease-out`
              }}
            >
              <div className="absolute top-0 left-0 w-1 h-full rounded-l-xl bg-gradient-to-b from-transparent via-current to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: alert.type === 'BUDGET_WARNING' ? '#f59e0b' : 
                                 alert.type === 'BILL_REMINDER' ? '#3b82f6' : 
                                 alert.type === 'UNUSUAL_SPENDING' ? '#ef4444' : '#8b5cf6' }}
              ></div>
              
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Icon with pulse animation for unread */}
                    <div className="relative flex-shrink-0">
                      <div className={`p-2 rounded-xl ${
                        alert.type === 'BUDGET_WARNING' ? 'bg-amber-100' :
                        alert.type === 'BILL_REMINDER' ? 'bg-blue-100' :
                        alert.type === 'UNUSUAL_SPENDING' ? 'bg-red-100' : 'bg-purple-100'
                      } group-hover:scale-110 transition-transform`}>
                        {getAlertIcon(alert.type)}
                      </div>
                      {isUnread && (
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse ring-2 ring-white"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${statusColor}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {alert.type === 'BUDGET_WARNING' ? 'Budget Warning' :
                           alert.type === 'BILL_REMINDER' ? 'Bill Reminder' :
                           alert.type === 'UNUSUAL_SPENDING' ? 'Unusual Spending' : 'General Alert'}
                        </span>
                        {isUnread && (
                          <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                        {alert.message}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1">
                          <Clock size={12} className="text-gray-400" />
                          <p className="text-xs text-gray-400">
                            {new Date(alert.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {!alert.read && (
                    <button
                      onClick={() => handleMarkAsRead(alert.alertId)}
                      disabled={markingRead === alert.alertId}
                      className="relative flex-shrink-0 p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all hover:scale-110 disabled:opacity-50"
                    >
                      {markingRead === alert.alertId ? (
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin" />
                      ) : (
                        <Check size={16} />
                      )}
                    </button>
                  )}
                </div>
                
                {/* Action suggestion for unread alerts - Google Style */}
                {isUnread && alert.type === 'BUDGET_WARNING' && (
                  <div className="mt-3 pt-2 border-t border-amber-200">
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <Zap size={12} />
                      Tip: Review your budget limits to avoid overspending
                    </p>
                  </div>
                )}
                {isUnread && alert.type === 'UNUSUAL_SPENDING' && (
                  <div className="mt-3 pt-2 border-t border-red-200">
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertTriangle size={12} />
                      Check recent transactions for unusual patterns
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Footer Stats - Google Style */}
      <div className="flex justify-between items-center pt-2">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {alerts.slice(0, 3).map((alert, idx) => (
              <div key={idx} className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 ring-2 ring-white flex items-center justify-center text-xs">
                {alert.type === 'BUDGET_WARNING' ? '⚠️' : alert.type === 'BILL_REMINDER' ? '🔔' : '⚠️'}
              </div>
            ))}
          </div>
          <span className="text-xs text-gray-400">
            {alerts.length} total alerts • {unreadCount} unread
          </span>
        </div>
        <div className="text-xs text-gray-400 flex items-center gap-1">
          <Shield size={10} />
          <span>Priority notifications</span>
        </div>
      </div>
    </div>
  );
};

export default BudgetAlerts;

// Add this CSS to your global styles or component
const styles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fadeInUp {
    animation: fadeInUp 0.3s ease-out;
  }
`;