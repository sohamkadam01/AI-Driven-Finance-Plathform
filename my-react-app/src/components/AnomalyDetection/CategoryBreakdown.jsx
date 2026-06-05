import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,Cell  } from 'recharts';
import { Tag, TrendingUp, TrendingDown, AlertTriangle, Shield, Target, Zap, Sparkles } from 'lucide-react';

const CategoryBreakdown = ({ statistics, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-48 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-100 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  
  if (!statistics || !statistics.categoryBreakdown || statistics.categoryBreakdown.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-12 text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-full blur-xl"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-orange-50 to-amber-50 rounded-full flex items-center justify-center">
              <Tag size={28} className="text-orange-500" />
            </div>
          </div>
          <p className="text-sm text-gray-500">No category data available</p>
          <p className="text-xs text-gray-400 mt-1">Add transactions to see anomaly patterns by category</p>
        </div>
      </div>
    );
  }

  const categoryData = statistics.categoryBreakdown.map(cat => ({
    name: cat.categoryName,
    anomalies: cat.anomalyCount,
    fraud: cat.confirmedFraud,
    amount: cat.totalAmount,
    riskScore: cat.anomalyCount > 0 ? Math.min(100, Math.round((cat.anomalyCount / Math.max(...statistics.categoryBreakdown.map(c => c.anomalyCount))) * 100)) : 0
  })).sort((a, b) => b.anomalies - a.anomalies);

  // Calculate totals
  const totalAnomalies = categoryData.reduce((sum, cat) => sum + cat.anomalies, 0);
  const totalFraud = categoryData.reduce((sum, cat) => sum + cat.fraud, 0);
  const highestRiskCategory = categoryData[0];
  const categoriesWithIssues = categoryData.filter(cat => cat.anomalies > 0).length;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const anomalyPercentage = totalAnomalies > 0 ? (data.anomalies / totalAnomalies * 100).toFixed(1) : 0;
      
      return (
        <div className="bg-white px-5 py-3 rounded-xl shadow-lg border border-gray-200 animate-fadeIn">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
            <Tag size={12} className="text-orange-500" />
            <p className="text-sm font-semibold text-gray-800">{label}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-gray-500">Anomalies Detected</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500"
                    style={{ width: `${anomalyPercentage}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-orange-600">{data.anomalies}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-gray-500">Confirmed Fraud</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-red-500 to-rose-500"
                    style={{ width: `${totalFraud > 0 ? (data.fraud / totalFraud * 100) : 0}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-red-600">{data.fraud}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-gray-500">Total Amount</span>
              <span className="text-sm font-semibold text-gray-800">₹{data.amount?.toLocaleString()}</span>
            </div>
            
            {data.riskScore > 70 && (
              <div className="mt-1 pt-1 border-t border-gray-100">
                <div className="flex items-center gap-1 text-xs text-red-600">
                  <AlertTriangle size={10} />
                  <span>High risk category</span>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const getRiskColor = (anomalies, maxAnomalies) => {
    const ratio = anomalies / maxAnomalies;
    if (ratio > 0.7) return 'from-red-500 to-rose-500';
    if (ratio > 0.4) return 'from-orange-500 to-amber-500';
    return 'from-yellow-500 to-amber-500';
  };

  const maxAnomalies = Math.max(...categoryData.map(c => c.anomalies), 1);

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-500/5 to-amber-500/5 rounded-full blur-2xl"></div>
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl shadow-md">
                <Tag size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-800">Anomalies by Category</h3>
                <p className="text-sm text-gray-500 mt-0.5">Transaction risk distribution across categories</p>
              </div>
            </div>
            
            {/* Summary Stats */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-xl">
                <AlertTriangle size={14} className="text-orange-600" />
                <div>
                  <p className="text-xs text-gray-500">Total Anomalies</p>
                  <p className="text-sm font-bold text-orange-600">{totalAnomalies}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-xl">
                <Shield size={14} className="text-red-600" />
                <div>
                  <p className="text-xs text-gray-500">Confirmed Fraud</p>
                  <p className="text-sm font-bold text-red-600">{totalFraud}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 pt-4">
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Categories Analyzed</p>
          <p className="text-xl font-bold text-gray-800">{categoryData.length}</p>
          <p className="text-xs text-gray-400 mt-1">Total categories</p>
        </div>
        
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Affected Categories</p>
          <p className="text-xl font-bold text-orange-600">{categoriesWithIssues}</p>
          <p className="text-xs text-gray-400 mt-1">Have anomalies</p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Highest Risk</p>
          <p className="text-sm font-bold text-gray-800 truncate">{highestRiskCategory?.name || 'N/A'}</p>
          <p className="text-xs text-orange-600 mt-1">{highestRiskCategory?.anomalies || 0} anomalies</p>
        </div>
        
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Fraud Rate</p>
          <p className="text-xl font-bold text-red-600">
            {totalAnomalies > 0 ? ((totalFraud / totalAnomalies) * 100).toFixed(1) : 0}%
          </p>
          <p className="text-xs text-gray-400 mt-1">Of total anomalies</p>
        </div>
      </div>
      
      {/* Chart Section */}
      <div className="p-4">
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={categoryData} 
              layout="vertical" 
              margin={{ top: 20, right: 20, left: 100, bottom: 20 }}
              barCategoryGap={8}
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.9}/>
                </linearGradient>
                <linearGradient id="barHoverGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ea580c" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.9}/>
                </linearGradient>
                <filter id="barShadow" x="-5%" y="-5%" width="110%" height="110%">
                  <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#f59e0b" floodOpacity="0.2"/>
                </filter>
              </defs>
              <CartesianGrid 
                strokeDasharray="4 4" 
                horizontal={true} 
                vertical={false} 
                stroke="#e5e7eb" 
                strokeOpacity={0.6}
              />
              <XAxis 
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 500 }}
                domain={[0, 'dataMax + 1']}
              />
              <YAxis 
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
                width={90}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#fef3c7', fillOpacity: 0.5 }} />
              <Bar 
                dataKey="anomalies" 
                name="Anomalies" 
                fill="url(#barGradient)"
                radius={[0, 8, 8, 0]}
                barSize={28}
                animationDuration={1000}
                animationEasing="ease-out"
                onMouseEnter={(data, index) => {
                  // Hover effect handled by CSS
                }}
              >
                {categoryData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={`url(#barGradient)`}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category List with Progress Bars */}
      <div className="px-6 pb-6">
        <div className="flex items-center gap-2 mb-3">
          <Target size={12} className="text-gray-400" />
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Risk Analysis by Category</h4>
        </div>
        <div className="space-y-3">
          {categoryData.slice(0, 5).map((category, idx) => {
            const riskPercentage = (category.anomalies / maxAnomalies) * 100;
            const riskColor = getRiskColor(category.anomalies, maxAnomalies);
            
            return (
              <div key={idx} className="group">
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${riskColor}`} />
                    <span className="text-gray-700 font-medium">{category.name}</span>
                    {category.fraud > 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">
                        {category.fraud} fraud
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-900 font-semibold">{category.anomalies}</span>
                    <span className="text-xs font-mono text-gray-400 w-12 text-right">
                      {((category.anomalies / totalAnomalies) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r ${riskColor}`}
                    style={{ width: `${riskPercentage}%` }}
                  />
                </div>
                {category.riskScore > 70 && (
                  <div className="mt-1 flex items-center gap-1">
                    <AlertTriangle size={8} className="text-red-500" />
                    <span className="text-xs text-red-500">High risk</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {categoryData.length > 5 && (
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-400">+{categoryData.length - 5} more categories</p>
          </div>
        )}
      </div>
      
      {/* Insights Footer */}
      <div className="px-6 pb-6">
        <div className={`mt-2 p-4 rounded-xl border ${
          totalFraud > 0 ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200' :
          totalAnomalies > 0 ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200' :
          'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`p-1.5 rounded-lg ${
              totalFraud > 0 ? 'bg-red-100' :
              totalAnomalies > 0 ? 'bg-orange-100' : 'bg-green-100'
            }`}>
              {totalFraud > 0 ? (
                <AlertTriangle size={14} className="text-red-600" />
              ) : totalAnomalies > 0 ? (
                <Zap size={14} className="text-orange-600" />
              ) : (
                <Shield size={14} className="text-green-600" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-800 mb-1">AI Risk Analysis</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                {totalFraud > 0 
                  ? `⚠️ ${totalFraud} confirmed fraudulent transactions detected across ${categoriesWithIssues} categories. Review ${highestRiskCategory?.name} immediately.`
                  : totalAnomalies > 0
                  ? `📊 ${totalAnomalies} anomalies detected across ${categoriesWithIssues} categories. ${highestRiskCategory?.name} shows the highest risk pattern.`
                  : `✅ No anomalies detected in any category. Your transaction patterns are clean.`}
              </p>
            </div>
          </div>
        </div>
        
        {/* Footer Stats */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Sparkles size={10} />
            <span>AI-powered pattern detection</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <TrendingUp size={10} />
            <span>Auto-categorized anomalies</span>
          </div>
        </div>
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