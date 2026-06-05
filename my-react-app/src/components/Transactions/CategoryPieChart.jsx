import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { 
  PieChart as PieChartIcon, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ShoppingBag, 
  Home, 
  Coffee,
  Zap,
  Info,
  ChevronRight
} from 'lucide-react';

const CategoryPieChart = ({ data, loading, title = "Spending by Category", showInsights = true }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const navigate = useNavigate();

  // Calculate total and percentages
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const total = data.reduce((sum, item) => sum + (item.amount || 0), 0);
    
    return data.map(item => ({
      ...item,
      percentage: total > 0 ? ((item.amount / total) * 100).toFixed(1) : 0,
      formattedAmount: new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(item.amount || 0)
    })).sort((a, b) => b.amount - a.amount);
  }, [data]);

  const totalSpent = useMemo(() => {
    return processedData.reduce((sum, item) => sum + (item.amount || 0), 0);
  }, [processedData]);

  const topCategory = processedData[0];
  const insights = useMemo(() => {
    if (!processedData.length) return [];
    
    const insights = [];
    const top3Categories = processedData.slice(0, 3);
    
    if (top3Categories[0] && parseFloat(top3Categories[0].percentage) > 40) {
      insights.push({
        type: 'warning',
        message: `${top3Categories[0].name} takes up ${top3Categories[0].percentage}% of your spending. Consider reviewing this category.`
      });
    }
    
    if (processedData.length > 5) {
      const otherTotal = processedData.slice(5).reduce((sum, item) => sum + item.amount, 0);
      const otherPercentage = (otherTotal / totalSpent) * 100;
      if (otherPercentage > 20) {
        insights.push({
          type: 'info',
          message: `"Other" categories account for ${otherPercentage.toFixed(1)}% of spending. Adding more specific categories could provide better insights.`
        });
      }
    }
    
    return insights;
  }, [processedData, totalSpent]);

  // Category icon mapping
  const getCategoryIcon = (categoryName) => {
    const icons = {
      'food': Coffee,
      'shopping': ShoppingBag,
      'housing': Home,
      'utilities': Zap,
      'entertainment': PieChartIcon,
      'transport': TrendingUp,
    };
    
    const Icon = icons[categoryName?.toLowerCase()] || Wallet;
    return <Icon size={14} />;
  };

  const COLORS = [
    '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', 
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
    '#14b8a6', '#d946ef', '#f43f5e', '#0ea5e9'
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-gray-100 min-w-[180px] animate-in fade-in zoom-in duration-200">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: payload[0].color }}
            />
            <p className="text-sm font-semibold text-gray-900">{data.name}</p>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Amount</span>
              <span className="text-base font-bold text-gray-900">{data.formattedAmount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Percentage</span>
              <span className="text-sm font-medium text-blue-600">{data.percentage}%</span>
            </div>
            <div className="mt-2 pt-1">
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div 
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${data.percentage}%`,
                    backgroundColor: payload[0].color
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.1;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    if (percent < 0.05) return null;
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="#6b7280"
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
        style={{ fontSize: '11px' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="h-5 w-40 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-56 bg-gray-200 rounded"></div>
              </div>
              <div className="h-10 w-24 bg-gray-200 rounded-xl"></div>
            </div>
            <div className="flex justify-center mb-6">
              <div className="w-48 h-48 rounded-full bg-gray-100"></div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <PieChartIcon size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No category data</h3>
          <p className="text-sm text-gray-500 mb-6">Add transactions with categories to see spending breakdown</p>
          <button 
            onClick={() => navigate('/transactions')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md"
          >
            <ShoppingBag size={16} />
            Add Transaction
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PieChartIcon size={18} className="text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
            <p className="text-sm text-gray-500">Breakdown of your expenses by category</p>
          </div>
          
          {topCategory && (
            <div className="flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="h-9 w-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><PieChartIcon size={18} /></div>
              <div>
                <p className="text-xs text-gray-500">Top Category</p>
                <p className="text-sm font-semibold text-gray-900">{topCategory.name}</p>
                <p className="text-xs text-blue-600">{topCategory.percentage}% of spending</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Chart and Summary Grid */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Pie Chart */}
          <div className="relative">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={processedData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="amount"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    animationBegin={0}
                    animationDuration={1000}
                    animationEasing="ease-out"
                  >
                    {processedData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        stroke="white"
                        strokeWidth={2}
                        className="cursor-pointer transition-all hover:opacity-80"
                        onClick={() => setExpandedCategory(expandedCategory === entry.name ? null : entry.name)}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Center Total */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <p className="text-xs text-gray-400">Total</p>
              <p className="text-xl font-bold text-gray-900">
                {new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(totalSpent)}
              </p>
            </div>
          </div>

          {/* Category List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Category Breakdown</p>
              <p className="text-xs text-gray-400">Click to expand</p>
            </div>
            
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
              {processedData.map((category, index) => (
                <div key={category.name} className="group">
                  <button
                    onClick={() => setExpandedCategory(expandedCategory === category.name ? null : category.name)}
                    className="w-full"
                  >
                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-all duration-200">
                      <div className="flex items-center gap-3 flex-1">
                        <div 
                          className="w-3 h-3 rounded-full transition-transform group-hover:scale-110"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">{category.name}</span>
                            {index === 0 && (
                              <span className="text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">Top</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1">
                              <div className="w-full bg-gray-100 rounded-full h-1.5">
                                <div 
                                  className="h-1.5 rounded-full transition-all duration-500"
                                  style={{ 
                                    width: `${category.percentage}%`,
                                    backgroundColor: COLORS[index % COLORS.length]
                                  }}
                                />
                              </div>
                            </div>
                            <span className="text-xs font-medium text-gray-500">{category.percentage}%</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">{category.formattedAmount}</p>
                        </div>
                        <ChevronRight 
                          size={16} 
                          className={`text-gray-400 transition-transform duration-200 ${
                            expandedCategory === category.name ? 'rotate-90' : ''
                          }`}
                        />
                      </div>
                    </div>
                  </button>
                  
                  {/* Expanded Details */}
                  {expandedCategory === category.name && (
                    <div className="ml-6 mt-1 mb-2 p-3 bg-gray-50 rounded-lg animate-in slide-in-from-top-2 duration-200">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-500">Monthly Average</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Intl.NumberFormat('en-IN', {
                              style: 'currency',
                              currency: 'INR'
                            }).format(category.amount / 4)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Impact Score</p>
                          <p className="text-sm font-medium text-gray-900">
                            {parseFloat(category.percentage) > 20 ? 'High' : parseFloat(category.percentage) > 10 ? 'Medium' : 'Low'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights Section */}
        {showInsights && insights.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Info size={14} className="text-blue-600" />
              <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">Spending Insights</p>
            </div>
            <div className="space-y-2">
              {insights.map((insight, idx) => (
                <div 
                  key={idx}
                  className={`p-3 rounded-xl ${
                    insight.type === 'warning' 
                      ? 'bg-amber-50 border border-amber-100' 
                      : 'bg-blue-50 border border-blue-100'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <Info size={14} className={insight.type === 'warning' ? 'text-amber-600 mt-0.5' : 'text-blue-600 mt-0.5'} />
                    <p className="text-sm text-gray-700 flex-1">{insight.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-6 pt-2">
          <button 
            onClick={() => navigate('/categories')}
            className="w-full py-2.5 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            <span>Manage Categories</span>
            <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryPieChart;
