import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';

const CashFlowChart = ({ data, loading }) => {
  const [viewType, setViewType] = useState('monthly'); // monthly, quarterly

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-6 w-32 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-48 bg-gray-200 rounded mb-6"></div>
            <div className="h-64 bg-gray-100 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  const chartData = data?.monthlyTrend || [];

  // Transform data for bar chart
  const barData = chartData.map(item => ({
    month: new Date(item.month).toLocaleDateString('en-US', { month: 'short' }),
    income: item.income || 0,
    expense: item.expenses || 0,
    savings: (item.income || 0) - (item.expenses || 0)
  })).reverse();

  // Calculate totals
  const totalIncome = barData.reduce((sum, d) => sum + d.income, 0);
  const totalExpense = barData.reduce((sum, d) => sum + d.expense, 0);
  const totalSavings = totalIncome - totalExpense;
  const avgSavingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const income = payload[0]?.value || 0;
      const expense = payload[1]?.value || 0;
      const savings = income - expense;
      
      return (
        <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-100">
          <p className="text-xs text-gray-500 mb-2">{label}</p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-gray-500">Income</span>
              <span className="text-sm font-medium text-gray-900">₹{income.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-gray-500">Expenses</span>
              <span className="text-sm font-medium text-gray-900">₹{expense.toLocaleString()}</span>
            </div>
            <div className="border-t border-gray-100 my-1"></div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-gray-500">Savings</span>
              <span className={`text-sm font-medium ${savings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{Math.abs(savings).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100">
      {/* Header */}
      <div className="px-6 pt-6 pb-3 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-base font-medium text-gray-900">Cash Flow</h3>
            <p className="text-sm text-gray-500 mt-0.5">Income vs expenses over time</p>
          </div>
          
          {/* View selector - Google style */}
          <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
            <button
              onClick={() => setViewType('monthly')}
              className={`px-3 py-1.5 text-sm font-normal rounded-md transition-all ${
                viewType === 'monthly' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setViewType('quarterly')}
              className={`px-3 py-1.5 text-sm font-normal rounded-md transition-all ${
                viewType === 'quarterly' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Quarterly
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="px-6 pt-4 pb-2">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500">Total Income</p>
            <p className="text-lg font-medium text-gray-900">₹{totalIncome.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Expenses</p>
            <p className="text-lg font-medium text-gray-900">₹{totalExpense.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Avg Savings Rate</p>
            <p className={`text-lg font-medium ${avgSavingsRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {avgSavingsRate >= 0 ? '+' : ''}{avgSavingsRate.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="px-2 pb-2">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} barGap={4} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#5f6368', fontSize: 11}}
                dy={8}
              />
              <YAxis 
                hide={true}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8f9fa' }} />
              <Bar 
                dataKey="income" 
                name="Income" 
                fill="#1a73e8" 
                radius={[4, 4, 0, 0]} 
                barSize={24}
              />
              <Bar 
                dataKey="expense" 
                name="Expenses" 
                fill="#ea4335" 
                radius={[4, 4, 0, 0]} 
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insight footer */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 rounded-b-xl">
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-full ${totalSavings >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            {totalSavings >= 0 ? (
              <TrendingUp size={14} className="text-green-600" />
            ) : (
              <TrendingDown size={14} className="text-red-600" />
            )}
          </div>
          <p className="text-sm text-gray-600">
            {totalSavings >= 0 
              ? `You've saved ₹${totalSavings.toLocaleString()} across ${barData.length} months` 
              : `You've spent ₹${Math.abs(totalSavings).toLocaleString()} more than you earned`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CashFlowChart;