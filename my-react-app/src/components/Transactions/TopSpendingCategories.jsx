import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  ChevronRight,
  Sparkles,
  Target,
  Award,
  Zap,
  Coffee,
  ShoppingBag,
  Home,
  Car,
  Gamepad2,
  Dumbbell,
  Book,
  Heart,
  Briefcase,
  MoreHorizontal
} from 'lucide-react';

const TopSpendingCategories = ({ data, loading, limit = 5, showAll = true }) => {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const navigate = useNavigate();

  // Process and sort data
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const total = data.reduce((sum, item) => sum + (item.amount || 0), 0);
    
    return data
      .map(item => ({
        ...item,
        percentage: total > 0 ? ((item.amount / total) * 100).toFixed(1) : 0,
        formattedAmount: new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(item.amount || 0),
        impact: (item.amount / total) * 100
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [data]);

  const totalSpent = useMemo(() => {
    return processedData.reduce((sum, item) => sum + (item.amount || 0), 0);
  }, [processedData]);

  const displayedData = showAllCategories ? processedData : processedData.slice(0, limit);
  const hasMoreCategories = processedData.length > limit;

  // Smart category icon mapping
  const getCategoryIcon = (categoryName, customIcon) => {
    if (customIcon) return customIcon;

    const normalizedName = categoryName?.toLowerCase() || '';
    
    const iconMap = {
      'food': Coffee,
      'dining': Coffee,
      'coffee': Coffee,
      'restaurant': Coffee,
      'groceries': ShoppingBag,
      'shopping': ShoppingBag,
      'housing': Home,
      'rent': Home,
      'transport': Car,
      'transportation': Car,
      'travel': Car,
      'entertainment': Gamepad2,
      'fitness': Dumbbell,
      'gym': Dumbbell,
      'health': Heart,
      'healthcare': Heart,
      'education': Book,
      'school': Book,
      'work': Briefcase,
      'freelance': Briefcase,
      'salary': Briefcase,
      'utilities': Zap,
      'bills': Zap,
    };
    
    const matchedKey = Object.keys(iconMap).find((key) => normalizedName.includes(key));
    const Icon = matchedKey ? iconMap[matchedKey] : MoreHorizontal;
    return <Icon size={16} />;
  };

  // Get impact color based on percentage
  const getImpactColor = (percentage) => {
    if (percentage > 30) return 'from-red-500 to-red-600';
    if (percentage > 20) return 'from-orange-500 to-orange-600';
    if (percentage > 10) return 'from-yellow-500 to-yellow-600';
    return 'from-blue-500 to-blue-600';
  };

  // Get impact label
  const getImpactLabel = (percentage) => {
    if (percentage > 30) return 'High Impact';
    if (percentage > 20) return 'Medium-High Impact';
    if (percentage > 10) return 'Medium Impact';
    return 'Low Impact';
  };

  // Calculate statistics
  const statistics = useMemo(() => {
    if (processedData.length === 0) return null;
    
    const top3Total = processedData.slice(0, 3).reduce((sum, item) => sum + item.amount, 0);
    const top3Percentage = (top3Total / totalSpent) * 100;
    const averagePerCategory = totalSpent / processedData.length;
    
    return {
      top3Percentage: top3Percentage.toFixed(1),
      averagePerCategory: new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0
      }).format(averagePerCategory),
      totalCategories: processedData.length
    };
  }, [processedData, totalSpent]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-gray-200 rounded"></div>
              <div className="h-5 w-40 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-gray-200 rounded"></div>
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div className="h-full w-3/4 bg-gray-200 rounded-full"></div>
                  </div>
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
          <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp size={24} className="text-gray-400" />
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-1">No spending data</h3>
          <p className="text-sm text-gray-500">Add transactions to see your top spending categories</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <TrendingUp size={14} className="text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Top Spending Categories</h3>
              <p className="text-xs text-gray-500 mt-0.5">Where your money goes</p>
            </div>
          </div>
          
          {statistics && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
              <Target size={12} className="text-blue-600" />
              <span className="text-xs font-medium text-blue-700">
                Top 3: {statistics.top3Percentage}%
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Summary Cards */}
        {statistics && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/30 rounded-xl p-3 border border-emerald-100">
              <p className="text-xs text-emerald-700 font-medium mb-1">Total Categories</p>
              <p className="text-2xl font-bold text-emerald-700">{statistics.totalCategories}</p>
              <p className="text-xs text-emerald-600 mt-1">Active spending areas</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100/30 rounded-xl p-3 border border-purple-100">
              <p className="text-xs text-purple-700 font-medium mb-1">Avg per Category</p>
              <p className="text-lg font-bold text-purple-700">{statistics.averagePerCategory}</p>
              <p className="text-xs text-purple-600 mt-1">For selected month</p>
            </div>
          </div>
        )}

        {/* Categories List */}
        <div className="space-y-4">
          {displayedData.map((category, idx) => {
            const percentage = parseFloat(category.percentage);
            const barColor = getImpactColor(percentage);
            const isHighImpact = percentage > 20;
            
            return (
              <div 
                key={idx}
                className="group"
                onMouseEnter={() => setHoveredCategory(idx)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        {getCategoryIcon(category.name, category.icon)}
                      </div>
                      {isHighImpact && (
                        <div className="absolute -top-1 -right-1">
                          <AlertCircle size={10} className="text-orange-500" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                          {category.name}
                        </span>
                        {idx === 0 && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-[10px] font-bold rounded-full">
                            <Award size={8} />
                            TOP
                          </span>
                        )}
                        {isHighImpact && idx !== 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded-full font-medium">
                            High Impact
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{getImpactLabel(percentage)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">
                        {category.formattedAmount}
                      </span>
                      {hoveredCategory === idx && (
                        <ChevronRight size={14} className="text-gray-400 animate-in slide-in-left duration-200" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{category.percentage}% of total</p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="relative">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-700 ease-out`}
                      style={{ width: `${percentage}%` }}
                    >
                      {hoveredCategory === idx && percentage > 15 && (
                        <div className="absolute right-1 top-1/2 transform -translate-y-1/2">
                          <Sparkles size={8} className="text-white animate-pulse" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Percentage marker */}
                  {percentage > 5 && (
                    <div 
                      className="absolute top-1/2 transform -translate-y-1/2 text-[9px] font-medium text-white drop-shadow-sm"
                      style={{ left: `${Math.min(percentage - 5, 90)}%` }}
                    >
                      {percentage > 15 && `${percentage}%`}
                    </div>
                  )}
                </div>
                
                {/* Monthly trend indicator */}
                {category.trend && (
                  <div className="flex items-center gap-1 mt-1">
                    {category.trend === 'up' ? (
                      <TrendingUp size={10} className="text-red-400" />
                    ) : (
                      <TrendingDown size={10} className="text-green-400" />
                    )}
                    <span className="text-[10px] text-gray-400">{category.trendText}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Show More/Less Button */}
        {showAll && hasMoreCategories && (
          <button
            onClick={() => setShowAllCategories(!showAllCategories)}
            className="mt-6 w-full py-2.5 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            <span>{showAllCategories ? 'Show Less' : `Show All ${processedData.length} Categories`}</span>
            <ChevronRight 
              size={16} 
              className={`group-hover:translate-x-0.5 transition-transform ${showAllCategories ? 'rotate-90' : ''}`} 
            />
          </button>
        )}

        {/* Smart Suggestion */}
        {processedData[0] && parseFloat(processedData[0].percentage) > 35 && (
          <div className="mt-6 p-3 bg-amber-50 rounded-xl border border-amber-100">
            <div className="flex items-start gap-2">
              <Sparkles size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-amber-800 mb-0.5">Spending Insight</p>
                <p className="text-xs text-amber-700">
                  Your top category "{processedData[0].name}" accounts for {processedData[0].percentage}% of spending.
                  Consider setting a budget limit for this category.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Footer */}
        <div className="mt-4 pt-2 border-t border-gray-100">
          <button 
            onClick={() => navigate('/budgets')}
            className="w-full py-2 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center gap-1 group"
          >
            <Target size={12} />
            <span>Set budget limits</span>
            <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopSpendingCategories;
