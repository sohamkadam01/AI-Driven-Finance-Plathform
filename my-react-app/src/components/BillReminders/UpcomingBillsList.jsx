import React from 'react';
import { Edit2, Trash2, CheckCircle, AlertTriangle, Clock, Calendar, CreditCard, Bell, Zap, Shield, Sparkles, Target } from 'lucide-react';

const UpcomingBillsList = ({ bills, onMarkAsPaid, onEdit, onDelete, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-40 bg-gray-200 rounded"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gray-100 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getPriorityConfig = (priority) => {
    switch (priority) {
      case 'HIGH':
        return { 
          bg: 'from-red-50 to-rose-50', 
          text: 'text-red-700', 
          border: 'border-red-200',
          icon: AlertTriangle,
          gradient: 'from-red-500 to-rose-500',
          label: 'Urgent',
          tip: 'Pay immediately to avoid late fees'
        };
      case 'MEDIUM':
        return { 
          bg: 'from-amber-50 to-orange-50', 
          text: 'text-amber-700', 
          border: 'border-amber-200',
          icon: Clock,
          gradient: 'from-amber-500 to-orange-500',
          label: 'Due Soon',
          tip: 'Schedule payment soon'
        };
      default:
        return { 
          bg: 'from-green-50 to-emerald-50', 
          text: 'text-green-700', 
          border: 'border-green-200',
          icon: CheckCircle,
          gradient: 'from-green-500 to-emerald-500',
          label: 'Low Priority',
          tip: 'Manage when convenient'
        };
    }
  };

  const getDaysUntilStyle = (days) => {
    if (days <= 0) return { text: 'text-red-600', bg: 'bg-red-100', label: 'Overdue' };
    if (days === 1) return { text: 'text-orange-600', bg: 'bg-orange-100', label: 'Due Tomorrow' };
    if (days <= 3) return { text: 'text-amber-600', bg: 'bg-amber-100', label: 'Due Soon' };
    return { text: 'text-green-600', bg: 'bg-green-100', label: `${days} days left` };
  };

  const unpaidBills = bills.filter(b => !b.paid).sort((a, b) => a.daysUntilDue - b.daysUntilDue);
  const paidBills = bills.filter(b => b.paid).sort((a, b) => new Date(b.paidDate || b.dueDate) - new Date(a.paidDate || a.dueDate));

  const totalDueAmount = unpaidBills.reduce((sum, bill) => sum + bill.amount, 0);
  const urgentCount = unpaidBills.filter(b => b.priority === 'HIGH').length;
  const dueThisWeek = unpaidBills.filter(b => b.daysUntilDue <= 7).length;

  if (unpaidBills.length === 0 && paidBills.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-12 text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center">
              <Bell size={32} className="text-blue-500" />
            </div>
          </div>
          <h3 className="text-base font-normal text-gray-700 mb-2">No bill reminders</h3>
          <p className="text-sm text-gray-500">Add your first bill reminder to never miss a payment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards - Google Material Style */}
      {unpaidBills.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="relative bg-white rounded-xl shadow-md p-4 overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-500/10 to-rose-500/10 rounded-full blur-xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 bg-gradient-to-r from-red-500 to-rose-500 rounded-lg shadow-sm">
                  <AlertTriangle size={12} className="text-white" />
                </div>
                <span className="text-xs text-gray-400">Total pending</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{unpaidBills.length}</p>
              <p className="text-xs text-gray-500 mt-1">Unpaid bills</p>
            </div>
          </div>
          
          <div className="relative bg-white rounded-xl shadow-md p-4 overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg shadow-sm">
                  <Zap size={12} className="text-white" />
                </div>
                <span className="text-xs text-gray-400">Due amount</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">₹{totalDueAmount.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Total pending</p>
            </div>
          </div>
          
          <div className="relative bg-white rounded-xl shadow-md p-4 overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg shadow-sm">
                  <Target size={12} className="text-white" />
                </div>
                <span className="text-xs text-gray-400">This week</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{dueThisWeek}</p>
              <p className="text-xs text-gray-500 mt-1">Due in 7 days</p>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Bills Section - Google Material Cards */}
      {unpaidBills.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-full blur-2xl"></div>
            <div className="px-6 pt-6 pb-4 border-b border-gray-200 relative">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-md">
                    <Clock size={18} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-gray-800">Pending Payments</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Bills that need your attention</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full">
                    <span className="text-sm font-semibold text-amber-700">{unpaidBills.length} pending</span>
                  </div>
                  {urgentCount > 0 && (
                    <div className="px-3 py-1.5 bg-red-100 rounded-full">
                      <span className="text-sm font-semibold text-red-700">{urgentCount} urgent</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {unpaidBills.map((bill, idx) => {
              const priority = getPriorityConfig(bill.priority);
              const PriorityIcon = priority.icon;
              const daysUntilStyle = getDaysUntilStyle(bill.daysUntilDue);
              const isUrgent = bill.daysUntilDue <= 2;
              
              return (
                <div 
                  key={bill.recurringId || bill.billId} 
                  className="group relative overflow-hidden hover:bg-gray-50 transition-all duration-300"
                  style={{
                    animation: `slideIn ${0.3 + idx * 0.05}s ease-out`
                  }}
                >
                  <div className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${priority.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                  <div className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {/* Animated Icon Container */}
                        <div className="relative">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${priority.bg} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                            <PriorityIcon size={20} className={priority.text} />
                          </div>
                          {isUrgent && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse ring-2 ring-white"></div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-800 text-lg">{bill.name}</h4>
                            <div className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-gradient-to-r ${priority.bg} ${priority.text} border ${priority.border} font-medium`}>
                              <PriorityIcon size={10} />
                              <span>{priority.label}</span>
                            </div>
                            {bill.daysUntilDue <= 0 && (
                              <div className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                                <AlertTriangle size={10} />
                                Overdue
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                            <div className="flex items-center gap-1.5">
                              <div className="p-0.5 bg-gray-100 rounded">
                                <Calendar size={12} className="text-gray-400" />
                              </div>
                              <span>{new Date(bill.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="p-0.5 bg-gray-100 rounded">
                                <CreditCard size={12} className="text-gray-400" />
                              </div>
                              <span className="font-semibold text-gray-700">₹{bill.amount.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="p-0.5 bg-gray-100 rounded">
                                <Bell size={12} className="text-gray-400" />
                              </div>
                              <span>{bill.frequency || 'Monthly'}</span>
                            </div>
                          </div>
                          
                          {/* Days indicator with progress */}
                          {bill.daysUntilDue > 0 && bill.daysUntilDue <= 30 && (
                            <div className="max-w-[200px]">
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Time remaining</span>
                                <span className="font-medium">{bill.daysUntilDue} days</span>
                              </div>
                              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full rounded-full transition-all duration-700"
                                  style={{ 
                                    width: `${Math.max(0, (30 - bill.daysUntilDue) / 30 * 100)}%`,
                                    background: `linear-gradient(90deg, ${bill.daysUntilDue <= 2 ? '#ef4444' : bill.daysUntilDue <= 7 ? '#f59e0b' : '#10b981'}, ${bill.daysUntilDue <= 2 ? '#dc2626' : bill.daysUntilDue <= 7 ? '#d97706' : '#059669'})`
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Buttons - Google Material */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onMarkAsPaid(bill)}
                          className="group/btn relative px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-sm font-medium shadow-md shadow-green-200 hover:shadow-lg transition-all duration-300 flex items-center gap-2 overflow-hidden"
                        >
                          <CheckCircle size={14} className="relative z-10" />
                          <span className="relative z-10">Mark Paid</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                        </button>
                        
                        <div className="flex gap-1">
                          <button
                            onClick={() => onEdit(bill)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all hover:scale-110"
                            title="Edit bill"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => onDelete(bill.recurringId || bill.billId)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all hover:scale-110"
                            title="Delete bill"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Priority Tip */}
                    <div className="mt-3 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs">
                        <Sparkles size={10} className="text-gray-400" />
                        <span className="text-gray-500">{priority.tip}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Paid Bills Section - Google Material Design */}
      {paidBills.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-md">
                  <CheckCircle size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-base font-medium text-gray-800">Payment History</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Recently paid bills</p>
                </div>
              </div>
              <div className="px-3 py-1.5 bg-green-100 rounded-full">
                <span className="text-sm font-semibold text-green-700">{paidBills.length} paid</span>
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {paidBills.slice(0, 7).map((bill, idx) => (
              <div key={bill.recurringId || bill.billId} className="group p-4 hover:bg-gray-50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CheckCircle size={16} className="text-green-600" />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white"></div>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{bill.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex items-center gap-1">
                          <Calendar size={10} className="text-gray-400" />
                          <p className="text-xs text-gray-400">
                            Paid on {new Date(bill.paidDate || bill.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <span className="text-xs text-gray-300">•</span>
                        <p className="text-xs text-gray-400">{bill.frequency || 'Monthly'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-800">₹{bill.amount.toLocaleString()}</p>
                    <p className="text-xs text-green-600 flex items-center gap-1 justify-end">
                      <CheckCircle size={10} />
                      Completed
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {paidBills.length > 7 && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-500">+{paidBills.length - 7} more paid bills</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Add this CSS to your global styles
const styles = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-10px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  .animate-slideIn {
    animation: slideIn 0.3s ease-out;
  }
`;

export default UpcomingBillsList;
