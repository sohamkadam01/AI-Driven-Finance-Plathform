import React, { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, AlertCircle, CheckCircle, PieChart, BarChart3, DollarSign, Target } from 'lucide-react';

const CategoryBreakdown = ({ budgets, loading }) => {
  const [expandedCategories, setExpandedCategories] = useState({});
  const [sortBy, setSortBy] = useState('percentage');

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-40 bg-gray-200 rounded"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!budgets || budgets.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-12 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <PieChart size={32} className="text-gray-400" />
          </div>
          <h4 className="text-base font-normal text-gray-700 mb-2">No budget data</h4>
          <p className="text-sm text-gray-500">Create budgets to see category breakdown</p>
        </div>
      </div>
    );
  }

  const toggleCategoryExpand = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const getSortedBudgets = () => {
    const budgetsCopy = [...budgets];
    switch (sortBy) {
      case 'percentage':
        return budgetsCopy.sort((a, b) => b.spentPercentage - a.spentPercentage);
      case 'name':
        return budgetsCopy.sort((a, b) => a.categoryName.localeCompare(b.categoryName));
      case 'spent':
        return budgetsCopy.sort((a, b) => b.spentAmount - a.spentAmount);
      default:
        return budgetsCopy;
    }
  };

  const getStatusBadge = (percentage) => {
    if (percentage >= 100) return { text: 'Exceeded', color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle };
    if (percentage >= 80) return { text: 'Warning', color: 'text-amber-600', bg: 'bg-amber-50', icon: AlertCircle };
    if (percentage >= 60) return { text: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: null };
    return { text: 'Good', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle };
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'bg-gradient-to-r from-red-500 to-red-600';
    if (percentage >= 80) return 'bg-gradient-to-r from-amber-500 to-amber-600';
    if (percentage >= 60) return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
    return 'bg-gradient-to-r from-green-500 to-emerald-600';
  };

  const sortedBudgets = getSortedBudgets();

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* Header with Sort Options */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1 bg-blue-50 rounded-lg">
                <Target size={16} className="text-blue-600" />
              </div>
              <h3 className="text-base font-normal text-gray-800">Category Breakdown</h3>
            </div>
            <p className="text-sm text-gray-500">Track your spending across different categories</p>
          </div>
          
          {/* Sort Dropdown - Google Style */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="percentage">Utilization</option>
              <option value="spent">Amount Spent</option>
              <option value="name">Category Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category List */}
      <div className="divide-y divide-gray-100">
        {sortedBudgets.map((budget, idx) => {
          const status = getStatusBadge(budget.spentPercentage);
          const percentage = Math.min(budget.spentPercentage, 100);
          const isExpanded = expandedCategories[budget.categoryId];
          const remaining = budget.amountLimit - budget.spentAmount;
          const StatusIcon = status.icon;
          
          return (
            <div key={budget.categoryId} className="hover:bg-gray-50/50 transition-colors">
              {/* Category Row */}
              <button
                onClick={() => toggleCategoryExpand(budget.categoryId)}
                className="w-full px-6 py-4 flex items-center justify-between group"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm transition-transform group-hover:scale-105 ${
                      budget.spentPercentage >= 100 ? 'bg-red-50' :
                      budget.spentPercentage >= 80 ? 'bg-amber-50' :
                      budget.spentPercentage >= 60 ? 'bg-yellow-50' : 'bg-green-50'
                    }`}>
                      {budget.categoryIcon || (budget.spentPercentage >= 100 ? '⚠️' : '📊')}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${
                      budget.spentPercentage >= 100 ? 'bg-red-500' :
                      budget.spentPercentage >= 80 ? 'bg-amber-500' :
                      budget.spentPercentage >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                    } ring-2 ring-white`}></div>
                  </div>
                  
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-gray-800">{budget.categoryName}</h4>
                      <div className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                        {StatusIcon && <StatusIcon size={12} />}
                        <span>{status.text}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1">
                        <DollarSign size={12} className="text-gray-400" />
                        <p className="text-xs text-gray-500">
                          ₹{budget.spentAmount.toLocaleString()} of ₹{budget.amountLimit.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-800">
                      {budget.spentPercentage}%
                    </p>
                    <p className="text-xs text-gray-400">utilized</p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={18} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                  )}
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-6 pb-5 pt-3 bg-gray-50/50">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Progress Section */}
                    <div className="lg:col-span-2 space-y-3">
                      <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                          <span>Budget Utilization</span>
                          <span className="font-medium">{budget.spentPercentage}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-700 ease-out ${getProgressColor(budget.spentPercentage)}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 pt-2">
                        <div className="bg-white rounded-lg p-2.5 border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Budget Limit</p>
                          <p className="text-base font-semibold text-gray-800">₹{budget.amountLimit.toLocaleString()}</p>
                        </div>
                        <div className="bg-white rounded-lg p-2.5 border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Total Spent</p>
                          <p className="text-base font-semibold text-gray-800">₹{budget.spentAmount.toLocaleString()}</p>
                        </div>
                        <div className="bg-white rounded-lg p-2.5 border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Remaining</p>
                          <p className={`text-base font-semibold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {remaining >= 0 ? '₹' : '-₹'}{Math.abs(remaining).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Insight Section */}
                    <div className={`rounded-xl p-3.5 border ${
                      budget.spentPercentage >= 100 ? 'bg-red-50 border-red-100' :
                      budget.spentPercentage >= 80 ? 'bg-amber-50 border-amber-100' :
                      budget.spentPercentage >= 60 ? 'bg-yellow-50 border-yellow-100' : 'bg-green-50 border-green-100'
                    }`}>
                      <div className="flex items-start gap-2.5">
                        {StatusIcon ? (
                          <StatusIcon size={16} className={`${status.color} mt-0.5`} />
                        ) : (
                          <TrendingUp size={16} className="text-gray-500 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-700 mb-1">Insight</p>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {budget.spentPercentage >= 100 
                              ? `⚠️ You've exceeded your ${budget.categoryName} budget by ₹${Math.abs(remaining).toLocaleString()}`
                              : budget.spentPercentage >= 80
                              ? `📊 You're close to your ${budget.categoryName} budget limit (${budget.spentPercentage}% used)`
                              : budget.spentPercentage >= 60
                              ? `📈 You've used ${budget.spentPercentage}% of your ${budget.categoryName} budget`
                              : `✅ Great job! You're well within your ${budget.categoryName} budget`
                            }
                          </p>
                          {remaining > 0 && remaining < budget.amountLimit * 0.2 && (
                            <p className="text-xs text-amber-600 mt-1.5 pt-1 border-t border-amber-200">
                              💡 Tip: Consider reviewing your spending in this category
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600"></div>
              <span className="text-xs text-gray-600">Good (≤60%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600"></div>
              <span className="text-xs text-gray-600">Moderate (61-80%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600"></div>
              <span className="text-xs text-gray-600">Warning (81-99%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-red-500 to-red-600"></div>
              <span className="text-xs text-gray-600">Exceeded (≥100%)</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <BarChart3 size={12} />
            <span>{budgets.length} categories • Click to expand</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Alternative: Compact Version (No expandable sections)
export const CompactCategoryBreakdown = ({ budgets, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!budgets || budgets.length === 0) return null;

  const sortedBudgets = [...budgets].sort((a, b) => b.spentPercentage - a.spentPercentage);

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <PieChart size={16} className="text-blue-600" />
          <h3 className="text-sm font-medium text-gray-800">Category Breakdown</h3>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {sortedBudgets.map((budget) => {
          const getProgressColor = (percentage) => {
            if (percentage >= 100) return 'bg-red-500';
            if (percentage >= 80) return 'bg-amber-500';
            if (percentage >= 60) return 'bg-yellow-500';
            return 'bg-green-500';
          };
          
          return (
            <div key={budget.categoryId} className="px-6 py-3.5 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{budget.categoryIcon || '📊'}</span>
                  <span className="text-sm font-medium text-gray-700">{budget.categoryName}</span>
                </div>
                <span className="text-sm text-gray-600">
                  ₹{budget.spentAmount.toLocaleString()} <span className="text-gray-400">/</span> ₹{budget.amountLimit.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${getProgressColor(budget.spentPercentage)}`}
                    style={{ width: `${Math.min(budget.spentPercentage, 100)}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-500 w-12 text-right">
                  {budget.spentPercentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryBreakdown;