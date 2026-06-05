import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar, CheckCircle, AlertCircle, Award, Target, Zap, Shield, Sparkles } from 'lucide-react';

const MonthlyBillSummary = ({ summary, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-48 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-28 bg-gray-100 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-12 text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center">
              <DollarSign size={32} className="text-blue-500" />
            </div>
          </div>
          <h3 className="text-base font-normal text-gray-700 mb-2">No bill data for this month</h3>
          <p className="text-sm text-gray-500">Add bills to see your monthly summary and insights</p>
        </div>
      </div>
    );
  }

  const { totals, previousMonthComparison, insight, recommendations } = summary;

  const getComparisonColor = (trend) => {
    if (trend === 'DECREASED') return 'text-green-600';
    if (trend === 'INCREASED') return 'text-red-600';
    return 'text-gray-600';
  };

  const getComparisonBg = (trend) => {
    if (trend === 'DECREASED') return 'from-green-50 to-emerald-50 border-green-200';
    if (trend === 'INCREASED') return 'from-red-50 to-rose-50 border-red-200';
    return 'from-gray-50 to-slate-50 border-gray-200';
  };

  const getComparisonIcon = (trend) => {
    if (trend === 'DECREASED') return <TrendingDown size={16} />;
    if (trend === 'INCREASED') return <TrendingUp size={16} />;
    return null;
  };

  const getPaymentRateColor = (rate) => {
    if (rate >= 80) return 'from-green-500 to-emerald-500';
    if (rate >= 60) return 'from-blue-500 to-cyan-500';
    if (rate >= 40) return 'from-amber-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  const getPaymentRateIcon = (rate) => {
    if (rate >= 80) return <Award size={14} className="text-white" />;
    if (rate >= 60) return <Target size={14} className="text-white" />;
    if (rate >= 40) return <AlertCircle size={14} className="text-white" />;
    return <Zap size={14} className="text-white" />;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards - Google Material Style with Gradients */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Bills Card */}
        <div className="group relative bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-xl"></div>
          <div className="p-5 relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-md">
                <DollarSign size={16} className="text-white" />
              </div>
              <span className="text-xs text-gray-400 group-hover:text-purple-500 transition-colors">Total</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">₹{totals?.totalBills?.toLocaleString()}</p>
            <div className="flex items-center gap-1 mt-2">
              <Calendar size={10} className="text-gray-400" />
              <p className="text-xs text-gray-500">{totals?.totalCount} bills this month</p>
            </div>
          </div>
        </div>

        {/* Paid Bills Card */}
        <div className="group relative bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-xl"></div>
          <div className="p-5 relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-md">
                <CheckCircle size={16} className="text-white" />
              </div>
              <span className="text-xs text-gray-400 group-hover:text-green-500 transition-colors">Paid</span>
            </div>
            <p className="text-2xl font-bold text-green-600">₹{totals?.totalPaid?.toLocaleString()}</p>
            <div className="flex items-center gap-1 mt-2">
              <CheckCircle size={10} className="text-green-500" />
              <p className="text-xs text-gray-500">{totals?.paidCount} bills paid</p>
            </div>
          </div>
        </div>

        {/* Unpaid Bills Card */}
        <div className="group relative bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-xl"></div>
          <div className="p-5 relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-md">
                <AlertCircle size={16} className="text-white" />
              </div>
              <span className="text-xs text-gray-400 group-hover:text-amber-500 transition-colors">Pending</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">₹{totals?.totalUnpaid?.toLocaleString()}</p>
            <div className="flex items-center gap-1 mt-2">
              <Calendar size={10} className="text-amber-500" />
              <p className="text-xs text-gray-500">{totals?.unpaidCount} bills pending</p>
            </div>
          </div>
        </div>

        {/* Payment Rate Card with Circular Progress */}
        <div className="group relative bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-xl"></div>
          <div className="p-5 relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 bg-gradient-to-r ${getPaymentRateColor(totals?.paidPercentage || 0)} rounded-xl shadow-md`}>
                {getPaymentRateIcon(totals?.paidPercentage || 0)}
              </div>
              <span className="text-xs text-gray-400 group-hover:text-blue-500 transition-colors">Rate</span>
            </div>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-bold text-gray-800">{totals?.paidPercentage?.toFixed(1)}%</p>
              <p className="text-xs text-gray-400">of bills</p>
            </div>
            <div className="mt-2">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-700"
                  style={{ 
                    width: `${Math.min(totals?.paidPercentage || 0, 100)}%`,
                    background: `linear-gradient(90deg, ${totals?.paidPercentage >= 80 ? '#34a853' : totals?.paidPercentage >= 60 ? '#4285f4' : totals?.paidPercentage >= 40 ? '#fbbc04' : '#ea4335'}, ${totals?.paidPercentage >= 80 ? '#0d652d' : totals?.paidPercentage >= 60 ? '#1a73e8' : totals?.paidPercentage >= 40 ? '#f29900' : '#c5221f'})`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Card - Google Material Design */}
      {previousMonthComparison && (
        <div className={`group relative bg-gradient-to-r ${getComparisonBg(previousMonthComparison.trend)} rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300`}>
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-2xl"></div>
          <div className="p-5 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <TrendingUp size={20} className={
                    previousMonthComparison.trend === 'DECREASED' ? 'text-green-600' : 
                    previousMonthComparison.trend === 'INCREASED' ? 'text-red-600' : 'text-gray-600'
                  } />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">vs Last Month</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getComparisonIcon(previousMonthComparison.trend)}
                    <span className={`text-2xl font-bold ${getComparisonColor(previousMonthComparison.trend)}`}>
                      {Math.abs(previousMonthComparison.changePercentage)}%
                    </span>
                    <span className="text-sm text-gray-500">change</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {previousMonthComparison.changeAmount >= 0 ? '+' : '-'}₹{Math.abs(previousMonthComparison.changeAmount).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Current Month</p>
                  <p className="text-lg font-bold text-gray-800">₹{previousMonthComparison.currentTotal?.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">{previousMonthComparison.currentBillCount} bills</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Previous Month</p>
                  <p className="text-lg font-bold text-gray-800">₹{previousMonthComparison.previousTotal?.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">{previousMonthComparison.previousBillCount} bills</p>
                </div>
              </div>
            </div>
            
            {/* Trend Indicator Bar */}
            <div className="mt-4 pt-3 border-t border-gray-200/50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Spending trend</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${previousMonthComparison.trend === 'DECREASED' ? 'text-green-600' : 'text-red-600'}`}>
                    {previousMonthComparison.trend === 'DECREASED' ? '↓ Spending decreased' : previousMonthComparison.trend === 'INCREASED' ? '↑ Spending increased' : '→ Spending stable'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insight Card - Google Style with Icon */}
      {insight && (
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl p-5 border border-blue-200/50">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl"></div>
          <div className="relative flex items-start gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-md">
              <Sparkles size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 mb-1">AI Insight</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{insight}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations - Google Material Cards */}
      {recommendations && recommendations.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="px-6 pt-5 pb-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg shadow-sm">
                <Target size={14} className="text-white" />
              </div>
              <h4 className="font-semibold text-gray-800">Smart Recommendations</h4>
            </div>
            <p className="text-xs text-gray-500 mt-1">Personalized tips to optimize your bill payments</p>
          </div>
          <div className="p-5">
            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-sm transition-all group">
                  <div className="p-1.5 bg-green-100 rounded-lg group-hover:scale-110 transition-transform">
                    <CheckCircle size={14} className="text-green-600" />
                  </div>
                  <span className="text-sm text-gray-700 flex-1 leading-relaxed">{rec}</span>
                  <Zap size={12} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Overdue Alert - Enhanced Google Style */}
      {totals?.overdueCount > 0 && (
        <div className="relative overflow-hidden bg-gradient-to-r from-red-500/10 via-rose-500/10 to-pink-500/10 rounded-2xl border border-red-200/50 animate-pulse-subtle">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-red-400/20 to-rose-400/20 rounded-full blur-2xl"></div>
          <div className="relative p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gradient-to-r from-red-500 to-rose-500 rounded-xl shadow-md animate-pulse">
                <AlertCircle size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-800">Overdue Bills Alert</h4>
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                    {totals.overdueCount} overdue
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  You have {totals.overdueCount} overdue bill(s) totaling <span className="font-bold text-red-600">₹{totals.totalOverdue?.toLocaleString()}</span>.
                  Please pay them as soon as possible to avoid late fees and service interruptions.
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-red-600">
                  <Zap size={10} />
                  <span>Late fees may apply for delayed payments</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Progress Summary - Additional Insight */}
      {totals && totals.paidPercentage > 0 && totals.paidPercentage < 100 && (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-gray-500" />
              <h4 className="text-sm font-medium text-gray-700">Payment Progress</h4>
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Monthly completion</span>
              <span className="text-sm font-semibold text-gray-800">{totals.paidPercentage?.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-700"
                style={{ 
                  width: `${Math.min(totals.paidPercentage || 0, 100)}%`,
                  background: `linear-gradient(90deg, #4285f4, #34a853)`
                }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-3">
              {totals.unpaidCount} bill{ totals.unpaidCount !== 1 ? 's' : '' } remaining • 
              Total pending: ₹{totals.totalUnpaid?.toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Add this to your global CSS
const styles = `
  @keyframes pulseSubtle {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.85;
    }
  }
  
  .animate-pulse-subtle {
    animation: pulseSubtle 2s ease-in-out infinite;
  }
`;

export default MonthlyBillSummary;