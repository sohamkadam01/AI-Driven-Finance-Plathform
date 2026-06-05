import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Target, Zap, Shield, Activity, Sparkles } from 'lucide-react';

const DetectionRateChart = ({ statistics, loading }) => {
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

  if (!statistics || !statistics.detectionRateTrend) {
    return (
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-12 text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center">
              <Target size={28} className="text-blue-500" />
            </div>
          </div>
          <p className="text-sm text-gray-500">No detection rate data available</p>
          <p className="text-xs text-gray-400 mt-1">Add transactions to see anomaly detection trends</p>
        </div>
      </div>
    );
  }

  const trend = statistics.detectionRateTrend;
  const weeklyData = trend.weeklyTrend || [];

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const chartData = weeklyData.map(point => ({
    week: formatDate(point.date),
    rate: point.detectionRate,
    anomalies: point.anomaliesCount,
    fullDate: point.date
  }));

  // Calculate averages and statistics
  const averageRate = chartData.reduce((sum, d) => sum + d.rate, 0) / chartData.length;
  const maxRate = Math.max(...chartData.map(d => d.rate));
  const minRate = Math.min(...chartData.map(d => d.rate));
  const totalAnomalies = chartData.reduce((sum, d) => sum + d.anomalies, 0);
  const latestRate = chartData[chartData.length - 1]?.rate || 0;
  const previousRate = chartData[chartData.length - 2]?.rate || 0;
  const weeklyChange = latestRate - previousRate;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isHighRate = data.rate >= 80;
      const isLowRate = data.rate <= 50;
      
      return (
        <div className="bg-white px-5 py-3 rounded-xl shadow-lg border border-gray-200 animate-fadeIn">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
            <Activity size={12} className="text-gray-400" />
            <p className="text-xs font-semibold text-gray-600">{label}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-gray-500">Detection Rate</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                    style={{ width: `${data.rate}%` }}
                  />
                </div>
                <span className={`text-sm font-bold ${data.rate >= 70 ? 'text-green-600' : data.rate >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {data.rate}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-gray-500">Anomalies Found</span>
              <span className="text-sm font-semibold text-gray-700">{data.anomalies}</span>
            </div>
            
            {isHighRate && (
              <div className="mt-1 pt-1 border-t border-gray-100">
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Shield size={10} />
                  <span>High detection rate</span>
                </div>
              </div>
            )}
            {isLowRate && (
              <div className="mt-1 pt-1 border-t border-gray-100">
                <div className="flex items-center gap-1 text-xs text-yellow-600">
                  <Zap size={10} />
                  <span>Consider reviewing patterns</span>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const isIncreasing = trend.overallChange > 0;
  const getTrendColor = () => {
    if (trend.overallChange > 5) return 'text-green-600 bg-green-50';
    if (trend.overallChange > 0) return 'text-green-500 bg-green-50';
    if (trend.overallChange < -5) return 'text-red-600 bg-red-50';
    if (trend.overallChange < 0) return 'text-red-500 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-2xl"></div>
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-md">
                <Target size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-800">Detection Rate Trend</h3>
                <p className="text-sm text-gray-500 mt-0.5">Weekly anomaly detection performance</p>
              </div>
            </div>
            
            {/* Trend Badge */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${getTrendColor()} shadow-sm`}>
              {isIncreasing ? (
                <TrendingUp size={16} className={trend.overallChange > 0 ? 'text-green-600' : 'text-red-600'} />
              ) : (
                <TrendingDown size={16} className={trend.overallChange < 0 ? 'text-green-600' : 'text-red-600'} />
              )}
              <div>
                <p className="text-xs text-gray-500">Overall Change</p>
                <p className={`text-sm font-bold ${trend.overallChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {isIncreasing ? '+' : ''}{trend.overallChange}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 pt-4">
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Current Rate</p>
          <p className="text-xl font-bold text-blue-600">{latestRate}%</p>
          <div className="flex items-center gap-1 mt-1">
            {weeklyChange >= 0 ? (
              <TrendingUp size={10} className="text-green-500" />
            ) : (
              <TrendingDown size={10} className="text-red-500" />
            )}
            <span className={`text-xs ${weeklyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {weeklyChange >= 0 ? '+' : ''}{weeklyChange.toFixed(1)}% from last week
            </span>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Average Rate</p>
          <p className="text-xl font-bold text-gray-800">{averageRate.toFixed(1)}%</p>
          <p className="text-xs text-gray-400 mt-1">Over {chartData.length} weeks</p>
        </div>
        
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Peak Rate</p>
          <p className="text-xl font-bold text-green-600">{maxRate}%</p>
          <p className="text-xs text-gray-400 mt-1">Best performance</p>
        </div>
        
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Total Anomalies</p>
          <p className="text-xl font-bold text-gray-800">{totalAnomalies}</p>
          <p className="text-xs text-gray-400 mt-1">Detected</p>
        </div>
      </div>
      
      {/* Chart Section */}
      <div className="p-4">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 10 }}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={1}/>
                </linearGradient>
                <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#3b82f6" floodOpacity="0.15"/>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e5e7eb" strokeOpacity={0.6} />
              <XAxis 
                dataKey="week" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 500 }}
                dy={8}
              />
              <YAxis 
                tickFormatter={(value) => `${value}%`}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 11 }}
                domain={[0, 100]}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Line 
                type="monotone" 
                dataKey="rate" 
                stroke="url(#lineGradient)"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 5, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff', fill: '#3b82f6' }}
                animationDuration={1000}
                animationEasing="ease-out"
                filter="url(#shadow)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights Footer */}
      <div className="px-6 pb-6">
        <div className="mt-2 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Sparkles size={14} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-blue-800 mb-1">Performance Insight</p>
              <p className="text-xs text-blue-700 leading-relaxed">
                {trend.overallChange > 0 
                  ? `🎯 Detection rate has improved by ${trend.overallChange}% over the period. Current rate is ${latestRate}%, ${weeklyChange >= 0 ? 'continuing' : 'slightly'} ${weeklyChange >= 0 ? 'upward' : 'downward'} trend.`
                  : `📊 Detection rate has decreased by ${Math.abs(trend.overallChange)}% over the period. Consider reviewing anomaly detection parameters for better accuracy.`}
              </p>
              {maxRate >= 80 && (
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <Shield size={10} />
                  Peak detection rate of {maxRate}% achieved
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Trend Legend */}
        <div className="flex items-center justify-between mt-4 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <span className="text-xs text-gray-500">Detection Rate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full border-2 border-blue-400 bg-white"></div>
              <span className="text-xs text-gray-500">Weekly Data Points</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Activity size={10} />
            <span>{chartData.length} weeks tracked</span>
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

export default DetectionRateChart;