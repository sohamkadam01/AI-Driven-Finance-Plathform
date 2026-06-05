import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Target, Sparkles, Zap, Shield } from 'lucide-react';

const BalanceForecastChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-48 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-100 rounded-xl"></div>
            <div className="flex gap-4">
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-12 text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center">
              <TrendingUp size={32} className="text-blue-500" />
            </div>
          </div>
          <h3 className="text-base font-normal text-gray-700 mb-2">No forecast data available</h3>
          <p className="text-sm text-gray-500">Add more transactions to generate predictions</p>
        </div>
      </div>
    );
  }

  const chartData = data.map(item => ({
    date: item.date,
    balance: item.predictedBalance,
    income: item.predictedIncome,
    expense: item.predictedExpense
  }));

  const formatYAxis = (value) => {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
    return `₹${value}`;
  };

  const formatXAxis = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const startBalance = chartData[0]?.balance || data.balance;
      const change = data.balance - startBalance;
      const changePercent = startBalance ? (change / startBalance) * 100 : 0;
      
      return (
        <div className="bg-white px-5 py-3 rounded-xl shadow-lg border border-gray-200 animate-fadeIn">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
            <Calendar size={12} className="text-gray-400" />
            <p className="text-xs font-medium text-gray-500">
              {new Date(label).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-gray-500">Projected Balance</span>
              <span className="text-xl font-bold text-blue-600">₹{data.balance.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center gap-2 pt-1">
              {change >= 0 ? (
                <TrendingUp size={12} className="text-green-500" />
              ) : (
                <TrendingDown size={12} className="text-red-500" />
              )}
              <span className={`text-xs font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? '+' : ''}{changePercent.toFixed(1)}% from start
              </span>
            </div>
          </div>
          
          <div className="mt-3 pt-2 border-t border-gray-100 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Income</p>
              <p className="text-sm font-semibold text-green-600">+₹{data.income?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Expenses</p>
              <p className="text-sm font-semibold text-red-500">-₹{data.expense?.toLocaleString()}</p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate min and max for Y-axis domain with padding
  const balances = chartData.map(d => d.balance);
  const incomes = chartData.map(d => d.income || 0);
  const expenses = chartData.map(d => d.expense || 0);
  const minBalance = Math.min(...balances, 0);
  const maxBalance = Math.max(...balances);
  
  const finalBalance = chartData[chartData.length - 1]?.balance;
  const startBalance = chartData[0]?.balance;
  const isPositiveTrend = finalBalance >= startBalance;
  const totalChange = finalBalance - startBalance;
  const totalChangePercent = startBalance ? (totalChange / startBalance) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl"></div>
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-md">
                <TrendingUp size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-800">Balance Forecast</h3>
                <p className="text-sm text-gray-500 mt-0.5">AI-powered balance predictions</p>
              </div>
            </div>
            
            {/* Trend Indicator */}
            <div className={`flex items-center gap-3 px-4 py-2 rounded-xl ${
              isPositiveTrend ? 'bg-green-50' : 'bg-red-50'
            }`}>
              {isPositiveTrend ? (
                <TrendingUp size={16} className="text-green-600" />
              ) : (
                <TrendingDown size={16} className="text-red-600" />
              )}
              <div>
                <p className="text-xs text-gray-500">Projected change</p>
                <p className={`text-sm font-semibold ${isPositiveTrend ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositiveTrend ? '+' : ''}₹{totalChange.toLocaleString()} ({totalChangePercent.toFixed(1)}%)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="p-4">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 10 }}>
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02}/>
                </linearGradient>
                <linearGradient id="balanceStroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6"/>
                  <stop offset="100%" stopColor="#8b5cf6"/>
                </linearGradient>
                <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#3b82f6" floodOpacity="0.2"/>
                </filter>
              </defs>
              <CartesianGrid 
                strokeDasharray="4 4" 
                vertical={false} 
                stroke="#e5e7eb" 
                strokeOpacity={0.6}
              />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatXAxis}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 500 }}
                dy={8}
              />
              <YAxis 
                tickFormatter={formatYAxis}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 11 }}
                domain={[minBalance * 0.9, maxBalance * 1.1]}
                width={65}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area 
                type="monotone" 
                dataKey="balance" 
                stroke="url(#balanceStroke)"
                strokeWidth={3}
                fill="url(#balanceGradient)"
                animationDuration={1000}
                animationEasing="ease-out"
                dot={false}
                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff', fill: '#3b82f6' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Insights Footer */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Target size={12} className="text-gray-400" />
              <span className="text-xs text-gray-500">Starting Balance</span>
            </div>
            <p className="text-lg font-bold text-gray-800">₹{startBalance?.toLocaleString()}</p>
          </div>
          
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Shield size={12} className="text-gray-400" />
              <span className="text-xs text-gray-500">Forecast End</span>
            </div>
            <p className={`text-lg font-bold ${isPositiveTrend ? 'text-green-600' : 'text-red-600'}`}>
              ₹{finalBalance?.toLocaleString()}
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={12} className="text-blue-500" />
              <span className="text-xs text-blue-600">Confidence Score</span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-blue-700">85%</p>
              <div className="flex-1 h-1.5 bg-blue-100 rounded-full overflow-hidden">
                <div className="h-full w-[85%] bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Prediction Note */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Zap size={10} className="text-gray-400" />
              <span className="text-gray-400">Based on historical spending patterns</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-gray-400">30-day forecast</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mini version for dashboard widgets
export const MiniBalanceForecast = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return null;
  }

  const chartData = data.slice(-14).map(item => ({
    date: item.date,
    balance: item.predictedBalance
  }));

  const formatYAxis = (value) => {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
    return `₹${value}`;
  };

  const finalBalance = chartData[chartData.length - 1]?.balance;
  const startBalance = chartData[0]?.balance;
  const isPositive = finalBalance >= startBalance;

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-blue-500" />
          <h4 className="text-sm font-medium text-gray-700">Balance Trend</h4>
        </div>
        <div className={`text-xs font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '↑' : '↓'} {Math.abs(((finalBalance - startBalance) / startBalance) * 100).toFixed(1)}%
        </div>
      </div>
      <div className="h-24 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="miniGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2}/>
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="balance" 
              stroke="#3b82f6" 
              strokeWidth={2}
              fill="url(#miniGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-2">
        <span>Now</span>
        <span>30 days</span>
      </div>
    </div>
  );
};

// Add this to your global CSS
const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out;
  }
`;

export default BalanceForecastChart;