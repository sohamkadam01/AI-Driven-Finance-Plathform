import React, { useState } from 'react';
import { 
  TrendingUp, TrendingDown, Award, Calendar, ChevronRight, 
  CheckCircle, XCircle, DollarSign, Clock, Sparkles, 
  Zap, BarChart3, Target, Heart, Shield
} from 'lucide-react';

const BillHistory = ({ history, loading }) => {
  const [selectedYear, setSelectedYear] = useState('all');
  const [expandedMonth, setExpandedMonth] = useState(null);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-48 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-4 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-24 bg-gray-100 rounded-xl"></div>
              ))}
            </div>
            <div className="h-32 bg-gray-100 rounded-xl"></div>
            <div className="h-64 bg-gray-100 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!history) {
    return (
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-12 text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center">
              <Calendar size={32} className="text-blue-500" />
            </div>
          </div>
          <h3 className="text-base font-normal text-gray-700 mb-2">No bill history yet</h3>
          <p className="text-sm text-gray-500">Add bill reminders to start tracking your payment history</p>
        </div>
      </div>
    );
  }

  const { statistics, yearlySummaries, bills, insights } = history;
  const years = Object.keys(yearlySummaries || {});

  const filteredBills = selectedYear === 'all' 
    ? bills 
    : bills?.filter(bill => bill.dueDate?.startsWith(selectedYear)) || [];

  const getStatusBadge = (status) => {
    if (status === 'PAID') {
      return { 
        text: 'Paid on time', 
        color: 'text-green-700', 
        bg: 'bg-gradient-to-r from-green-50 to-emerald-50', 
        border: 'border-green-200',
        icon: CheckCircle,
        gradient: 'from-green-500 to-emerald-500'
      };
    }
    return { 
      text: 'Missed', 
      color: 'text-red-700', 
      bg: 'bg-gradient-to-r from-red-50 to-rose-50', 
      border: 'border-red-200',
      icon: XCircle,
      gradient: 'from-red-500 to-rose-500'
    };
  };

  const getPaymentTrend = (rate) => {
    if (rate >= 90) return { text: 'Excellent', icon: Award, color: 'text-emerald-600' };
    if (rate >= 70) return { text: 'Good', icon: Heart, color: 'text-blue-600' };
    if (rate >= 50) return { text: 'Average', icon: Target, color: 'text-amber-600' };
    return { text: 'Needs Improvement', icon: Zap, color: 'text-red-600' };
  };

  const paymentTrend = statistics?.onTimePaymentRate ? getPaymentTrend(statistics.onTimePaymentRate) : null;
  const TrendIcon = paymentTrend?.icon;

  const toggleMonthExpand = (index) => {
    setExpandedMonth(expandedMonth === index ? null : index);
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards - Google Material Style with Gradients */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Spent Card */}
          <div className="group relative bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-xl"></div>
            <div className="p-5 relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-md">
                  <DollarSign size={16} className="text-white" />
                </div>
                <TrendingUp size={14} className="text-gray-300 group-hover:text-purple-500 transition-colors" />
              </div>
              <p className="text-xs text-gray-500 font-medium mb-1">Total Spent</p>
              <p className="text-2xl font-bold text-gray-800">₹{statistics.totalSpentAllTime?.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <Clock size={10} />
                All time
              </p>
            </div>
          </div>

          {/* On-Time Rate Card */}
          <div className="group relative bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-xl"></div>
            <div className="p-5 relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-md">
                  <Target size={16} className="text-white" />
                </div>
                {TrendIcon && <TrendIcon size={14} className={`${paymentTrend?.color} opacity-0 group-hover:opacity-100 transition-opacity`} />}
              </div>
              <p className="text-xs text-gray-500 font-medium mb-1">On-Time Rate</p>
              <p className="text-2xl font-bold text-green-600">{statistics.onTimePaymentRate?.toFixed(1)}%</p>
              <p className="text-xs text-gray-400 mt-2">
                {statistics.totalBillsPaid} of {statistics.totalBillsPaid + statistics.totalBillsMissed} bills
              </p>
            </div>
          </div>

          {/* Best Streak Card */}
          <div className="group relative bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-xl"></div>
            <div className="p-5 relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-md">
                  <Award size={16} className="text-white" />
                </div>
                <Sparkles size={14} className="text-gray-300 group-hover:text-amber-500 transition-colors" />
              </div>
              <p className="text-xs text-gray-500 font-medium mb-1">Best Streak</p>
              <p className="text-2xl font-bold text-gray-800">{statistics.consecutiveOnTimePayments} <span className="text-base font-normal">months</span></p>
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <CheckCircle size={10} className="text-green-500" />
                Consecutive on-time payments
              </p>
            </div>
          </div>

          {/* Monthly Avg Card */}
          <div className="group relative bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-xl"></div>
            <div className="p-5 relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-md">
                  <BarChart3 size={16} className="text-white" />
                </div>
                <Calendar size={14} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
              </div>
              <p className="text-xs text-gray-500 font-medium mb-1">Monthly Average</p>
              <p className="text-2xl font-bold text-gray-800">₹{statistics.averageMonthlyBill?.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <Clock size={10} />
                Per month
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Year Selector - Google Chip Style */}
      {years.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <button
            onClick={() => setSelectedYear('all')}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
              selectedYear === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-blue-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Years
          </button>
          {years.map(year => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedYear === year
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      )}

      {/* Insights - Google Style Card */}
      {insights && insights.length > 0 && (
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-blue-200/50">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-md">
                <Award size={16} className="text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Smart Insights</h4>
                <p className="text-xs text-gray-500">AI-powered payment analysis</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {insights.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-2 p-3 bg-white/60 backdrop-blur-sm rounded-xl hover:shadow-sm transition-all group">
                  <div className="p-1 bg-blue-100 rounded-lg group-hover:scale-110 transition-transform">
                    <Zap size={12} className="text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-700 flex-1">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bills List - Google Material Design Cards */}
      {filteredBills.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                <Calendar size={16} className="text-white" />
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-800">Bill History</h3>
                <p className="text-sm text-gray-500 mt-0.5">Track your payment records and due dates</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2 ml-2">
              {filteredBills.length} bills found • {filteredBills.filter(b => b.status === 'PAID').length} paid, {filteredBills.filter(b => b.status !== 'PAID').length} missed
            </p>
          </div>
          
          <div className="divide-y divide-gray-100">
            {filteredBills.map((bill, idx) => {
              const status = getStatusBadge(bill.status);
              const StatusIcon = status.icon;
              const dueDate = new Date(bill.dueDate);
              const paidDate = bill.paidDate ? new Date(bill.paidDate) : null;
              const isRecent = dueDate > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
              
              return (
                <div 
                  key={idx} 
                  className="group p-5 hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Status Icon with Animation */}
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-xl ${status.bg} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                          <StatusIcon size={20} className={status.color} />
                        </div>
                        {isRecent && bill.status === 'PAID' && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse ring-2 ring-white"></div>
                        )}
                        {bill.daysLate > 0 && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse ring-2 ring-white"></div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h4 className="font-semibold text-gray-800 text-lg">{bill.name}</h4>
                          <div className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full ${status.bg} ${status.color} border ${status.border} font-medium`}>
                            <StatusIcon size={10} />
                            <span>{status.text}</span>
                          </div>
                          {bill.daysLate > 0 && (
                            <div className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                              <Clock size={10} />
                              {bill.daysLate} days late
                            </div>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar size={12} className="text-gray-400" />
                            <span>Due: {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          {paidDate && (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                              <CheckCircle size={12} />
                              <span>Paid: {paidDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 mt-2">
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                            {bill.category}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                            <Calendar size={10} />
                            {bill.frequency}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-left sm:text-right">
                      <p className="text-2xl font-bold text-gray-800">₹{bill.amount?.toLocaleString()}</p>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1 sm:justify-end">
                        <DollarSign size={10} />
                        {bill.frequency} bill
                      </p>
                    </div>
                  </div>
                  
                  {/* Payment Timeline Indicator */}
                  {bill.paidDate && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                              style={{ width: `${Math.min((new Date(bill.paidDate).getTime() - new Date(bill.dueDate).getTime()) / (1000 * 60 * 60 * 24) * 10, 100)}%` }}
                            />
                          </div>
                          <span className="text-gray-400">
                            {bill.daysLate > 0 ? `${bill.daysLate} days late` : 'Paid on time'}
                          </span>
                        </div>
                        <ChevronRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Footer Summary */}
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs text-gray-600">Paid on time</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-xs text-gray-600">Missed/Late</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Shield size={10} />
                <span>Payment history tracked • {filteredBills.length} records</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillHistory;