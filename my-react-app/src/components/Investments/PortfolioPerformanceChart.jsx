import React from 'react';
import { TrendingUp, TrendingDown, BarChart3, Target, Shield, Zap, Sparkles, Award, Activity, PieChart } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const PortfolioPerformanceChart = ({ performance, loading, period }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-48 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-100 rounded-xl"></div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!performance || !performance.performanceHistory || performance.performanceHistory.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-12 text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center">
              <BarChart3 size={32} className="text-blue-500" />
            </div>
          </div>
          <h3 className="text-base font-normal text-gray-700 mb-2">No performance data available</h3>
          <p className="text-sm text-gray-500">Add investments to see your portfolio performance</p>
        </div>
      </div>
    );
  }

  const chartData = performance.performanceHistory.map(point => ({
    date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    value: Number(point.value ?? point.currentValue ?? 0),
    invested: Number(point.investedAmount ?? point.amountInvested ?? point.invested ?? 0),
    returns: Number(point.returns ?? point.profitLoss ?? 0),
    returnPercentage: Number(point.returnsPercentage ?? point.returnPercentage ?? 0)
  }));

  const formatYAxis = (value) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
    return `₹${value}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const returns = data.returns || 0;
      const isPositiveReturn = returns >= 0;
      
      return (
        <div className="bg-white px-5 py-3 rounded-xl shadow-lg border border-gray-200 animate-fadeIn">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
            <Activity size={12} className="text-gray-400" />
            <p className="text-xs font-medium text-gray-500">{label}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-gray-500">Portfolio Value</span>
              <span className="text-base font-bold text-blue-600">₹{data.value?.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-gray-500">Total Invested</span>
              <span className="text-sm font-medium text-gray-700">₹{data.invested?.toLocaleString()}</span>
            </div>
            <div className="pt-1 border-t border-gray-100">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1">
                  {isPositiveReturn ? (
                    <TrendingUp size={10} className="text-green-500" />
                  ) : (
                    <TrendingDown size={10} className="text-red-500" />
                  )}
                  <span className="text-xs text-gray-500">Returns</span>
                </div>
                <div>
                  <span className={`text-sm font-semibold ${isPositiveReturn ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositiveReturn ? '+' : ''}₹{returns.toLocaleString()}
                  </span>
                  <span className={`text-xs ml-1 ${isPositiveReturn ? 'text-green-500' : 'text-red-500'}`}>
                    ({isPositiveReturn ? '+' : ''}{(data.returnPercentage || 0).toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const { returnsAnalysis } = performance;
  const totalReturn = returnsAnalysis?.totalReturnsPercentage || 0;
  const isPositive = totalReturn >= 0;
  
  // Calculate latest values
  const latestValue = chartData[chartData.length - 1]?.value || 0;
  const latestInvested = chartData[chartData.length - 1]?.invested || 0;
  const absoluteReturn = latestValue - latestInvested;
  const absoluteReturnPercent = latestInvested ? (absoluteReturn / latestInvested) * 100 : 0;
  
  const getRiskColor = (volatility) => {
    if (volatility < 10) return { bg: 'from-green-50 to-emerald-50', text: 'text-green-700', label: 'Low' };
    if (volatility < 20) return { bg: 'from-yellow-50 to-amber-50', text: 'text-yellow-700', label: 'Moderate' };
    return { bg: 'from-red-50 to-rose-50', text: 'text-red-700', label: 'High' };
  };
  
  const riskColor = getRiskColor(returnsAnalysis?.volatility || 0);

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-2xl"></div>
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-md">
                <PieChart size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-800">Portfolio Performance</h3>
                <p className="text-sm text-gray-500 mt-0.5">Value growth over time</p>
              </div>
            </div>
            
            {/* Return Badge */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${
              isPositive ? 'from-green-50 to-emerald-50' : 'from-red-50 to-rose-50'
            } shadow-sm`}>
              {isPositive ? (
                <TrendingUp size={16} className="text-green-600" />
              ) : (
                <TrendingDown size={16} className="text-red-600" />
              )}
              <div>
                <p className="text-xs text-gray-500">Total Return</p>
                <p className={`text-lg font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? '+' : ''}{totalReturn.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
          
          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">Current Value</p>
              <p className="text-lg font-bold text-gray-800">₹{latestValue.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">Invested Amount</p>
              <p className="text-lg font-bold text-gray-800">₹{latestInvested.toLocaleString()}</p>
            </div>
            <div className={`bg-gradient-to-br rounded-xl p-3 ${
              absoluteReturn >= 0 ? 'from-green-50 to-emerald-50' : 'from-red-50 to-rose-50'
            }`}>
              <p className="text-xs text-gray-500 mb-1">Absolute Return</p>
              <p className={`text-lg font-bold ${absoluteReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {absoluteReturn >= 0 ? '+' : ''}₹{absoluteReturn.toLocaleString()}
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">Period</p>
              <p className="text-lg font-bold text-gray-800 capitalize">{period}</p>
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
                <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02}/>
                </linearGradient>
                <linearGradient id="investedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.15}/>
                  <stop offset="100%" stopColor="#94a3b8" stopOpacity={0.02}/>
                </linearGradient>
                <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#3b82f6" floodOpacity="0.1"/>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e5e7eb" strokeOpacity={0.6} />
              <XAxis 
                dataKey="date" 
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
                width={65}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Legend 
                verticalAlign="top" 
                height={40}
                iconType="circle"
                formatter={(value) => <span className="text-xs font-medium text-gray-600">{value}</span>}
              />
              <Area 
                name="Invested Amount"
                type="monotone" 
                dataKey="invested" 
                stroke="#94a3b8" 
                strokeWidth={2}
                strokeDasharray="6 4"
                fill="url(#investedGradient)"
                animationDuration={1000}
                animationEasing="ease-out"
              />
              <Area 
                name="Portfolio Value"
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fill="url(#portfolioGradient)"
                animationDuration={1000}
                animationEasing="ease-out"
                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff', fill: '#3b82f6' }}
                filter="url(#shadow)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Key Metrics - Enhanced Google Material Cards */}
        {returnsAnalysis && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Target size={14} className="text-gray-400" />
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Risk & Return Metrics</h4>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* CAGR Card */}
              <div className="group relative bg-gradient-to-br from-gray-50 to-white rounded-xl p-3 border border-gray-100 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-500">CAGR</p>
                  <Award size={12} className="text-gray-300 group-hover:text-amber-500 transition-colors" />
                </div>
                <p className={`text-lg font-bold ${returnsAnalysis.cagr >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {returnsAnalysis.cagr > 0 ? '+' : ''}{returnsAnalysis.cagr?.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-400 mt-1">Annualized return</p>
              </div>
              
              {/* Volatility Card */}
              <div className="group relative bg-gradient-to-br from-gray-50 to-white rounded-xl p-3 border border-gray-100 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-500">Volatility</p>
                  <Zap size={12} className="text-gray-300 group-hover:text-yellow-500 transition-colors" />
                </div>
                <p className="text-lg font-bold text-gray-800">{returnsAnalysis.volatility?.toFixed(1)}%</p>
                <div className="mt-1">
                  <div className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full bg-gradient-to-r ${riskColor.bg} ${riskColor.text}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {riskColor.label} Risk
                  </div>
                </div>
              </div>
              
              {/* Sharpe Ratio Card */}
              <div className="group relative bg-gradient-to-br from-gray-50 to-white rounded-xl p-3 border border-gray-100 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-500">Sharpe Ratio</p>
                  <Shield size={12} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                </div>
                <p className="text-lg font-bold text-gray-800">{returnsAnalysis.sharpeRatio?.toFixed(2)}</p>
                <p className="text-xs text-gray-400 mt-1">Risk-adjusted return</p>
              </div>
              
              {/* Max Drawdown Card */}
              <div className="group relative bg-gradient-to-br from-gray-50 to-white rounded-xl p-3 border border-gray-100 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-500">Max Drawdown</p>
                  <TrendingDown size={12} className="text-gray-300 group-hover:text-red-500 transition-colors" />
                </div>
                <p className="text-lg font-bold text-red-600">{Math.abs(returnsAnalysis.maxDrawdown || 0).toFixed(1)}%</p>
                <p className="text-xs text-gray-400 mt-1">Peak to trough</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Performance Insight */}
        {returnsAnalysis && (
          <div className="mt-5 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Sparkles size={14} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-blue-800 mb-1">Performance Insight</p>
                <p className="text-xs text-blue-700 leading-relaxed">
                  {isPositive 
                    ? `🎉 Your portfolio has generated a ${totalReturn.toFixed(1)}% return with ${returnsAnalysis.volatility?.toFixed(1)}% volatility. The Sharpe ratio of ${returnsAnalysis.sharpeRatio?.toFixed(2)} indicates ${returnsAnalysis.sharpeRatio > 1 ? 'good' : 'moderate'} risk-adjusted returns.`
                    : `⚠️ Your portfolio is down ${Math.abs(totalReturn).toFixed(1)}% over ${period}. Consider reviewing your asset allocation and risk management strategies.`}
                </p>
              </div>
            </div>
          </div>
        )}
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

export default PortfolioPerformanceChart;
