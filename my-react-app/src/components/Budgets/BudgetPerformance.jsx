import React from 'react';
import { TrendingUp, TrendingDown, Award, AlertTriangle, CheckCircle, Info, ChevronRight, Target, PieChart, Star, Zap } from 'lucide-react';

const BudgetPerformance = ({ performance, loading }) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="p-8 animate-pulse">
            <div className="flex items-center gap-6">
              <div className="w-28 h-28 rounded-full bg-gray-200"></div>
              <div className="flex-1 space-y-3">
                <div className="h-6 w-48 bg-gray-200 rounded"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="mt-6 h-12 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-md overflow-hidden p-8">
          <div className="h-6 w-40 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-16 bg-gray-200 rounded"></div>
                <div className="h-8 w-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!performance) {
    return (
      <div className="bg-white rounded-2xl shadow-md overflow-hidden p-12 text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target size={32} className="text-gray-400" />
        </div>
        <h3 className="text-base font-normal text-gray-700 mb-2">No performance data yet</h3>
        <p className="text-gray-500 text-sm">Create budgets to start tracking your performance</p>
        <button className="mt-6 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg">
          Create Budget
        </button>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreRingColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getStatusGradient = (status) => {
    if (status === 'EXCELLENT') return 'from-green-500 to-emerald-500';
    if (status === 'GOOD') return 'from-blue-500 to-cyan-500';
    if (status === 'AVERAGE') return 'from-amber-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (performance.overallPerformanceScore / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Hero Score Card - Google Material Style with Gradient */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full blur-3xl -z-10"></div>
          <div className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              {/* Score Circle */}
              <div className="flex items-center gap-8">
                <div className="relative flex-shrink-0">
                  <svg width="140" height="140" viewBox="0 0 140 140" className="transform -rotate-90">
                    {/* Background circle */}
                    <circle
                      cx="70"
                      cy="70"
                      r={radius}
                      fill="none"
                      stroke="#f3f4f6"
                      strokeWidth="10"
                    />
                    {/* Animated progress circle */}
                    <circle
                      cx="70"
                      cy="70"
                      r={radius}
                      fill="none"
                      stroke={getScoreRingColor(performance.overallPerformanceScore)}
                      strokeWidth="10"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-4xl font-bold ${getScoreColor(performance.overallPerformanceScore)}`}>
                      {performance.overallPerformanceScore}
                    </span>
                    <span className="text-xs text-gray-400 mt-0.5">/100</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-medium text-gray-800">Budget Performance</h3>
                    <div className={`px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getStatusGradient(performance.performanceStatus)} text-white shadow-sm`}>
                      {performance.performanceStatus}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">Grade: <span className="font-semibold text-gray-700">{performance.performanceGrade}</span></p>
                  
                  {performance.trend && (
                    <div className="flex items-center gap-2 mt-3">
                      <div className={`p-1 rounded-full ${performance.trend.direction === 'IMPROVING' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {performance.trend.direction === 'IMPROVING' ? (
                          <TrendingUp size={14} className="text-green-600" />
                        ) : (
                          <TrendingDown size={14} className="text-red-600" />
                        )}
                      </div>
                      <span className="text-sm text-gray-600">
                        {performance.trend.direction} • {Math.abs(performance.trend.changePercentage)}% from last month
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats - Google Material Cards */}
              {performance.summary && (
                <div className="flex gap-4">
                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-3 text-center min-w-[80px] shadow-sm">
                    <p className="text-2xl font-bold text-gray-800">{performance.summary.totalCategoriesWithBudget}</p>
                    <p className="text-xs text-gray-500 mt-1">Categories</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 text-center min-w-[80px] shadow-sm">
                    <p className="text-2xl font-bold text-green-600">{performance.summary.categoriesOnTrack}</p>
                    <p className="text-xs text-green-600 mt-1">On Track</p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-3 text-center min-w-[80px] shadow-sm">
                    <p className="text-2xl font-bold text-amber-600">{performance.summary.categoriesAtRisk}</p>
                    <p className="text-xs text-amber-600 mt-1">At Risk</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-3 text-center min-w-[80px] shadow-sm">
                    <p className="text-2xl font-bold text-red-600">{performance.summary.categoriesExceeded}</p>
                    <p className="text-xs text-red-600 mt-1">Exceeded</p>
                  </div>
                </div>
              )}
            </div>

            {/* Insight Banner - Google Style */}
            {performance.overallInsight && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Info size={16} className="text-blue-600" />
                  </div>
                  <p className="text-sm text-blue-800 flex-1">{performance.overallInsight}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Best & Worst Performers - Google Cards with Hover Effects */}
      {performance.summary && (performance.summary.bestPerformingCategory || performance.summary.worstPerformingCategory) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Best Performer */}
          <div className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-2xl"></div>
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
                    <Star size={18} className="text-white" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-700">Best Performing</h4>
                </div>
                <p className="text-lg font-bold text-gray-800">{performance.summary.bestPerformingCategory || '—'}</p>
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <CheckCircle size={12} className="text-green-500" />
                  Lowest budget utilization
                </p>
              </div>
            </div>
          </div>

          {/* Worst Performer */}
          <div className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/10 to-rose-500/10 rounded-full blur-2xl"></div>
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center shadow-md">
                    <AlertTriangle size={18} className="text-white" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-700">Needs Improvement</h4>
                </div>
                <p className="text-lg font-bold text-gray-800">{performance.summary.worstPerformingCategory || '—'}</p>
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <TrendingDown size={12} className="text-red-500" />
                  Highest budget utilization
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievements - Google Chip Style */}
      {performance.achievements && performance.achievements.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-lg">
                <Award size={16} className="text-white" />
              </div>
              <h3 className="text-base font-medium text-gray-800">Achievements</h3>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">Congratulations on your budget milestones!</p>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-3">
              {performance.achievements.map((achievement, idx) => (
                <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full border border-green-100 group hover:scale-105 transition-transform">
                  <CheckCircle size={14} className="text-green-600" />
                  <span className="text-sm font-medium text-green-700">{achievement}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Category Performance Table - Google Material Design */}
      {performance.categoryPerformance && performance.categoryPerformance.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <PieChart size={16} className="text-white" />
              </div>
              <h3 className="text-base font-medium text-gray-800">Category Breakdown</h3>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">Budget vs actual spending by category</p>
          </div>
          
          <div className="divide-y divide-gray-100">
            {performance.categoryPerformance.map((category, idx) => {
              const performanceLevelColors = {
                EXCELLENT: 'from-green-500 to-emerald-500',
                GOOD: 'from-blue-500 to-cyan-500',
                FAIR: 'from-amber-500 to-orange-500',
                POOR: 'from-red-500 to-rose-500'
              };
              const gradient = performanceLevelColors[category.performanceLevel] || 'from-gray-500 to-gray-600';
              
              return (
                <div key={idx} className="px-6 py-5 hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform`}>
                          {category.categoryIcon || '📊'}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ring-2 ring-white ${
                          category.performanceLevel === 'EXCELLENT' ? 'bg-green-500' :
                          category.performanceLevel === 'GOOD' ? 'bg-blue-500' :
                          category.performanceLevel === 'FAIR' ? 'bg-amber-500' : 'bg-red-500'
                        }`}></div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{category.categoryName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">
                            Budget: <span className="font-medium text-gray-700">₹{category.budgeted?.toLocaleString()}</span>
                          </span>
                          <span className="text-xs text-gray-300">•</span>
                          <span className="text-xs text-gray-500">
                            Spent: <span className="font-medium text-gray-700">₹{category.spent?.toLocaleString()}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${gradient} text-white shadow-sm`}>
                        {category.performanceLevel}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Score: {category.performanceScore}</p>
                    </div>
                  </div>
                  
                  {/* Progress Bar with Gradient */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                      <span className="font-medium">Utilization Rate</span>
                      <span className="font-semibold">{category.utilizationPercentage}%</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                          category.utilizationPercentage <= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                          category.utilizationPercentage <= 100 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-red-500 to-rose-500'
                        }`}
                        style={{ width: `${Math.min(category.utilizationPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Insight and Trend */}
                  <div className="flex items-center justify-between mt-2">
                    {category.insight && (
                      <div className="flex items-center gap-2">
                        <div className="p-0.5 bg-blue-100 rounded">
                          <Info size={10} className="text-blue-500" />
                        </div>
                        <p className="text-xs text-gray-500">{category.insight}</p>
                      </div>
                    )}
                    {category.trend && (
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${
                        category.trend === 'IMPROVING' ? 'bg-green-50' : 'bg-red-50'
                      }`}>
                        {category.trend === 'IMPROVING' ? (
                          <TrendingUp size={12} className="text-green-500" />
                        ) : (
                          <TrendingDown size={12} className="text-red-500" />
                        )}
                        <span className={`text-xs font-medium capitalize ${
                          category.trend === 'IMPROVING' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {category.trend}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommendations - Google Style with Icons */}
      {performance.recommendations && performance.recommendations.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                <Zap size={16} className="text-white" />
              </div>
              <h3 className="text-base font-medium text-gray-800">Smart Recommendations</h3>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">Personalized insights to optimize your budget</p>
          </div>
          <div className="divide-y divide-gray-100">
            {performance.recommendations.map((rec, idx) => (
              <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-transparent transition-all group">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-blue-100 rounded-lg group-hover:scale-110 transition-transform">
                    <AlertTriangle size={14} className="text-blue-500" />
                  </div>
                  <span className="text-sm text-gray-700 leading-relaxed">{rec}</span>
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetPerformance;