import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Calendar, ChevronDown, 
  BarChart3, LineChart as LineChartIcon, DollarSign, 
  CreditCard, PiggyBank, Info 
} from 'lucide-react';

const IncomeExpenseChart = ({ data, loading }) => {
  // ALL HOOKS MUST BE CALLED FIRST
  const [viewType, setViewType] = useState('monthly');
  const [chartType, setChartType] = useState('bar');
  const [showInsight, setShowInsight] = useState(true);

  // Process data based on view type
  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }

    if (viewType === 'monthly') {
      return data.map(item => ({
        name: new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        income: item.income || 0,
        expense: item.expenses || 0,
        savings: (item.income || 0) - (item.expenses || 0)
      }));
    } else if (viewType === 'quarterly') {
      const quarterly = {};
      data.forEach(item => {
        const date = new Date(item.month);
        const quarter = `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`;
        if (!quarterly[quarter]) {
          quarterly[quarter] = { income: 0, expense: 0 };
        }
        quarterly[quarter].income += item.income || 0;
        quarterly[quarter].expense += item.expenses || 0;
      });
      return Object.entries(quarterly).map(([name, values]) => ({
        name,
        income: values.income,
        expense: values.expense,
        savings: values.income - values.expense
      }));
    } else {
      return data.slice(-8).map(item => ({
        name: new Date(item.month).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        income: item.income || 0,
        expense: item.expenses || 0,
        savings: (item.income || 0) - (item.expenses || 0)
      }));
    }
  }, [data, viewType]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalIncome = chartData.reduce((sum, d) => sum + d.income, 0);
    const totalExpense = chartData.reduce((sum, d) => sum + d.expense, 0);
    const totalSavings = totalIncome - totalExpense;
    const avgSavingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;
    return { totalIncome, totalExpense, totalSavings, avgSavingsRate };
  }, [chartData]);

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Conditional returns AFTER all hooks
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-5 w-40 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-56 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="h-20 bg-gray-100 rounded-xl"></div>
              <div className="h-20 bg-gray-100 rounded-xl"></div>
              <div className="h-20 bg-gray-100 rounded-xl"></div>
            </div>
            <div className="h-64 bg-gray-100 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state when no data
  if (!data || !Array.isArray(data) || data.length === 0 || chartData.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No data available</h3>
          <p className="text-sm text-gray-500 mb-6">Add transactions to see your income vs expense analysis</p>
          <button 
            onClick={() => window.location.href = '/transactions'}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md"
          >
            <DollarSign size={16} />
            Add Transaction
          </button>
        </div>
      </div>
    );
  }

  const formatYAxis = (value) => {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
    return `₹${value}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const income = payload[0]?.value || 0;
      const expense = payload[1]?.value || 0;
      const savings = income - expense;
      const savingsRate = income > 0 ? (savings / income) * 100 : 0;
      
      return (
        <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-gray-100 min-w-[200px]">
          <p className="text-xs font-medium text-gray-500 mb-2 pb-2 border-b border-gray-100">{label}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-xs text-gray-600">Income</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{formatCurrency(income)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-xs text-gray-600">Expenses</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{formatCurrency(expense)}</span>
            </div>
            <div className="border-t border-gray-100 my-1"></div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <PiggyBank size={12} className="text-gray-400" />
                <span className="text-xs text-gray-600">Savings</span>
              </div>
              <span className={`text-sm font-semibold ${savings >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(savings))}
              </span>
            </div>
            <div className="text-xs text-gray-400 pt-1">
              Savings rate: {savingsRate >= 0 ? '+' : ''}{savingsRate.toFixed(1)}%
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Income vs Expenses</h3>
            <p className="text-sm text-gray-500 mt-0.5">Track your cash flow and savings performance</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* View type selector */}
            <div className="flex items-center gap-1 bg-gray-100/50 rounded-xl p-1">
              {[
                { value: 'monthly', label: 'Monthly', Icon: Calendar },
                { value: 'quarterly', label: 'Quarterly', Icon: BarChart3 },
                { value: 'weekly', label: 'Weekly', Icon: Calendar }
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setViewType(type.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all capitalize ${
                    viewType === type.value 
                      ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                  }`}
                >
                  <type.Icon size={14} />
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
            
            {/* Chart type selector */}
            <div className="flex items-center gap-1 bg-gray-100/50 rounded-xl p-1">
              <button
                onClick={() => setChartType('bar')}
                className={`p-1.5 rounded-lg transition-all ${
                  chartType === 'bar' 
                    ? 'bg-white shadow-sm ring-1 ring-gray-200 text-gray-900' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Bar Chart"
              >
                <BarChart3 size={18} />
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`p-1.5 rounded-lg transition-all ${
                  chartType === 'line' 
                    ? 'bg-white shadow-sm ring-1 ring-gray-200 text-gray-900' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Line Chart"
              >
                <LineChartIcon size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="px-6 pt-5 pb-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/30 rounded-xl p-4 border border-emerald-100">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide">Total Income</p>
              <DollarSign size={14} className="text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-700">{formatCurrency(totals.totalIncome)}</p>
            <p className="text-xs text-emerald-600 mt-1">+{((totals.totalIncome / (totals.totalIncome - totals.totalExpense || 1)) * 100).toFixed(0)}% vs expenses</p>
          </div>
          
          <div className="bg-gradient-to-br from-red-50 to-red-100/30 rounded-xl p-4 border border-red-100">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-red-700 uppercase tracking-wide">Total Expenses</p>
              <CreditCard size={14} className="text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-700">{formatCurrency(totals.totalExpense)}</p>
            <p className="text-xs text-red-600 mt-1">{((totals.totalExpense / (totals.totalIncome || 1)) * 100).toFixed(0)}% of income</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Savings Rate</p>
              <PiggyBank size={14} className="text-blue-600" />
            </div>
            <p className={`text-2xl font-bold ${totals.avgSavingsRate >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {totals.avgSavingsRate >= 0 ? '+' : ''}{totals.avgSavingsRate.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">of total income</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="px-4 pb-2">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8eaed" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#5f6368', fontSize: 11, fontWeight: 500}}
                  dy={8}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#5f6368', fontSize: 11}}
                  tickFormatter={formatYAxis}
                  width={50}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8f9fa' }} />
                <Legend 
                  verticalAlign="top" 
                  height={40}
                  iconType="circle"
                  formatter={(value) => <span className="text-xs font-medium text-gray-700">{value}</span>}
                />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} barSize={32} />
                <Bar dataKey="expense" name="Expenses" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8eaed" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#5f6368', fontSize: 11, fontWeight: 500}}
                  dy={8}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#5f6368', fontSize: 11}}
                  tickFormatter={formatYAxis}
                  width={50}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={40}
                  iconType="circle"
                  formatter={(value) => <span className="text-xs font-medium text-gray-700">{value}</span>}
                />
                <Line 
                  type="monotone" 
                  dataKey="income" 
                  name="Income" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 5, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7, strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="expense" 
                  name="Expenses" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  dot={{ fill: '#ef4444', r: 5, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7, strokeWidth: 2 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insight */}
      {showInsight && (
        <div className="mx-6 mb-5 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <div className="flex items-start gap-3">
            <div className={`p-1.5 rounded-full flex-shrink-0 ${totals.totalSavings >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
              {totals.totalSavings >= 0 ? (
                <TrendingUp size={16} className="text-emerald-600" />
              ) : (
                <TrendingDown size={16} className="text-red-600" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 mb-1">Financial Insight</p>
              <p className="text-sm text-gray-700">
                {totals.totalSavings >= 0 
                  ? `Excellent! You've saved ${formatCurrency(totals.totalSavings)} during this period with a ${totals.avgSavingsRate.toFixed(1)}% savings rate. Keep up the great financial habit!`
                  : `Your expenses exceeded income by ${formatCurrency(Math.abs(totals.totalSavings))}. Consider reviewing your spending categories to optimize your budget.`}
              </p>
            </div>
            <button 
              onClick={() => setShowInsight(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Info size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomeExpenseChart;
