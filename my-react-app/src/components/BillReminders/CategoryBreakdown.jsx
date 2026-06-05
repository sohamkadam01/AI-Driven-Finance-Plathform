import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChart as PieChartIcon, TrendingUp, Award, Target, Zap, Sparkles } from 'lucide-react';

const CategoryBreakdown = ({ breakdown, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-48 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-100 rounded-xl"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-8 bg-gray-100 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!breakdown || Object.keys(breakdown).length === 0) {
    return null;
  }

  const data = Object.entries(breakdown).map(([category, value]) => ({
    name: category,
    value: value.total,
    count: value.count,
    icon: value.icon
  })).sort((a, b) => b.value - a.value);

  // Enhanced color palette - Google Material colors
  const COLORS = [
    '#4285f4', // Google Blue
    '#34a853', // Google Green
    '#fbbc04', // Google Yellow
    '#ea4335', // Google Red
    '#a142f4', // Purple
    '#fa7b17', // Orange
    '#00acc1', // Cyan
    '#ec407a', // Pink
    '#8d6e63', // Brown
    '#5c6bc0', // Indigo
  ];

  const totalSpent = data.reduce((sum, item) => sum + item.value, 0);
  const topCategory = data[0];
  const averagePerCategory = totalSpent / data.length;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / totalSpent) * 100).toFixed(1);
      return (
        <div className="bg-white px-5 py-3 rounded-xl shadow-lg border border-gray-200 animate-fadeIn">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
            <span className="text-xl">{data.icon || '📊'}</span>
            <p className="text-sm font-semibold text-gray-800">{data.name}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-gray-500">Total spent</span>
              <span className="text-lg font-bold text-gray-800">₹{data.value.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-gray-500">Share</span>
              <span className="text-sm font-medium text-blue-600">{percentage}%</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-gray-500">Transactions</span>
              <span className="text-sm font-medium text-gray-700">{data.count} bills</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    if (percent < 0.05) return null;
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="middle"
        className="text-xs font-bold"
      >
        {(percent * 100).toFixed(0)}%
      </text>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl"></div>
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 relative">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-md">
                <PieChartIcon size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-800">Category Breakdown</h3>
                <p className="text-sm text-gray-500 mt-0.5">Bill distribution by category</p>
              </div>
            </div>
            
            {/* Summary Stat */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-500">Total spent</p>
                <p className="text-lg font-bold text-gray-800">₹{totalSpent.toLocaleString()}</p>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Categories</p>
                <p className="text-lg font-bold text-gray-800">{data.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pie Chart Section */}
      <div className="p-4">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                labelLine={false}
                label={renderCustomizedLabel}
                animationBegin={0}
                animationDuration={1000}
                animationEasing="ease-out"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    stroke="white"
                    strokeWidth={2}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={40}
                iconType="circle"
                iconSize={8}
                formatter={(value, entry, index) => (
                  <span className="text-xs text-gray-600 font-medium">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Category Highlight */}
      {topCategory && (
        <div className="mx-6 mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <Award size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-blue-700">Top Category</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-lg font-semibold text-gray-800">{topCategory.name}</span>
                  <span className="text-xl">{topCategory.icon || '📊'}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Highest spend</p>
              <p className="text-lg font-bold text-gray-800">₹{topCategory.value.toLocaleString()}</p>
              <p className="text-xs text-blue-600">{((topCategory.value / totalSpent) * 100).toFixed(1)}% of total</p>
            </div>
          </div>
        </div>
      )}

      {/* Category List - Google Material Style */}
      <div className="px-6 pb-6">
        <div className="flex items-center gap-2 mb-3">
          <Target size={14} className="text-gray-400" />
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Detailed Breakdown</h4>
        </div>
        <div className="space-y-2">
          {data.map((category, idx) => {
            const percentage = ((category.value / totalSpent) * 100).toFixed(1);
            const barWidth = percentage;
            
            return (
              <div key={idx} className="group">
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="text-base">{category.icon || '📊'}</span>
                    <span className="text-gray-700 font-medium">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-900 font-semibold">₹{category.value.toLocaleString()}</span>
                    <span className="text-xs text-gray-400 w-12 text-right">{category.count} bills</span>
                    <span className="text-xs font-mono text-gray-400 w-12 text-right">{percentage}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ 
                      width: `${barWidth}%`,
                      backgroundColor: COLORS[idx % COLORS.length]
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Footer Stats */}
        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <TrendingUp size={10} className="text-gray-400" />
              <span className="text-gray-500">Average: ₹{averagePerCategory.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <Sparkles size={10} />
            <span>{data.length} categories tracked</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Compact version for smaller spaces
export const CompactCategoryBreakdown = ({ breakdown, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
          <div className="h-40 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!breakdown || Object.keys(breakdown).length === 0) {
    return null;
  }

  const data = Object.entries(breakdown).map(([category, value]) => ({
    name: category,
    value: value.total,
    count: value.count,
    icon: value.icon
  })).sort((a, b) => b.value - a.value).slice(0, 5);

  const COLORS = ['#4285f4', '#34a853', '#fbbc04', '#ea4335', '#a142f4'];

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <div className="flex items-center gap-2 mb-3">
        <PieChartIcon size={14} className="text-gray-500" />
        <h4 className="text-sm font-medium text-gray-700">Top Categories</h4>
      </div>
      <div className="space-y-2">
        {data.map((category, idx) => (
          <div key={idx}>
            <div className="flex items-center justify-between text-xs mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm">{category.icon || '📊'}</span>
                <span className="text-gray-700">{category.name}</span>
              </div>
              <span className="font-medium text-gray-800">₹{category.value.toLocaleString()}</span>
            </div>
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full"
                style={{ 
                  width: `${(category.value / data[0].value) * 100}%`,
                  backgroundColor: COLORS[idx % COLORS.length]
                }}
              />
            </div>
          </div>
        ))}
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

export default CategoryBreakdown;