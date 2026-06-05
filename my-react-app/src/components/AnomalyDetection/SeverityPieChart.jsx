import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AlertTriangle, Shield, Zap, Target, TrendingUp, Activity } from 'lucide-react';

const SeverityPieChart = ({ statistics, loading }) => {
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

  if (!statistics || !statistics.severityBreakdown) {
    return (
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-12 text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-400/20 to-gray-500/20 rounded-full blur-xl"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center">
              <AlertTriangle size={28} className="text-gray-400" />
            </div>
          </div>
          <p className="text-sm text-gray-500">No severity data available</p>
          <p className="text-xs text-gray-400 mt-1">Anomalies will be categorized by severity</p>
        </div>
      </div>
    );
  }

  const severity = statistics.severityBreakdown;
  const total = severity.highSeverity + severity.mediumSeverity + severity.lowSeverity;

  const data = [
    { 
      name: 'High Severity', 
      value: severity.highSeverity, 
      percentage: severity.highPercentage, 
      color: '#ef4444',
      icon: '🔴',
      description: 'Critical anomalies requiring immediate attention',
      gradient: 'from-red-500 to-rose-500'
    },
    { 
      name: 'Medium Severity', 
      value: severity.mediumSeverity, 
      percentage: severity.mediumPercentage, 
      color: '#f59e0b',
      icon: '🟠',
      description: 'Moderate risk anomalies to review',
      gradient: 'from-orange-500 to-amber-500'
    },
    { 
      name: 'Low Severity', 
      value: severity.lowSeverity, 
      percentage: severity.lowPercentage, 
      color: '#eab308',
      icon: '🟡',
      description: 'Minor anomalies for monitoring',
      gradient: 'from-yellow-500 to-amber-500'
    }
  ].filter(d => d.value > 0);

  const COLORS = ['#ef4444', '#f59e0b', '#eab308'];
  const GRADIENTS = ['from-red-500 to-rose-500', 'from-orange-500 to-amber-500', 'from-yellow-500 to-amber-500'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const index = data.name === 'High Severity' ? 0 : data.name === 'Medium Severity' ? 1 : 2;
      
      return (
        <div className="bg-white px-5 py-3 rounded-xl shadow-lg border border-gray-200 animate-fadeIn">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${GRADIENTS[index]}`}></div>
            <p className="text-sm font-semibold text-gray-800">{data.name}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-gray-500">Anomalies Detected</span>
              <span className="text-xl font-bold text-gray-800">{data.value}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-gray-500">Percentage of Total</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full bg-gradient-to-r ${GRADIENTS[index]}`}
                    style={{ width: `${data.percentage}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700">{data.percentage.toFixed(1)}%</span>
              </div>
            </div>
            <div className="mt-2 pt-1 border-t border-gray-100">
              <p className="text-xs text-gray-500">{data.description}</p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
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
        className="text-sm font-bold"
      >
        {(percent * 100).toFixed(0)}%
      </text>
    );
  };

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-12 text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-xl"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-green-50 to-emerald-50 rounded-full flex items-center justify-center">
              <Shield size={28} className="text-green-500" />
            </div>
          </div>
          <p className="text-sm text-gray-500">No anomalies detected</p>
          <p className="text-xs text-gray-400 mt-1">Your transaction patterns look healthy</p>
        </div>
      </div>
    );
  }

  const highRiskCount = data.find(d => d.name === 'High Severity')?.value || 0;
  const mediumRiskCount = data.find(d => d.name === 'Medium Severity')?.value || 0;
  const lowRiskCount = data.find(d => d.name === 'Low Severity')?.value || 0;
  const riskScore = total > 0 ? ((highRiskCount * 100 + mediumRiskCount * 50) / total).toFixed(0) : 0;

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-500/5 to-orange-500/5 rounded-full blur-2xl"></div>
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl shadow-md">
                <AlertTriangle size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-800">Severity Breakdown</h3>
                <p className="text-sm text-gray-500 mt-0.5">Anomaly classification by impact level</p>
              </div>
            </div>
            
            {/* Risk Score Badge */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-sm ${
              riskScore >= 70 ? 'bg-gradient-to-r from-red-50 to-rose-50' :
              riskScore >= 40 ? 'bg-gradient-to-r from-orange-50 to-amber-50' :
              'bg-gradient-to-r from-green-50 to-emerald-50'
            }`}>
              <Target size={16} className={
                riskScore >= 70 ? 'text-red-600' :
                riskScore >= 40 ? 'text-orange-600' : 'text-green-600'
              } />
              <div>
                <p className="text-xs text-gray-500">Risk Score</p>
                <p className={`text-lg font-bold ${
                  riskScore >= 70 ? 'text-red-600' :
                  riskScore >= 40 ? 'text-orange-600' : 'text-green-600'
                }`}>
                  {riskScore}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3 px-6 pt-4">
        {data.map((item, idx) => (
          <div key={idx} className={`bg-gradient-to-br rounded-xl p-2.5 text-center ${
            idx === 0 ? 'from-red-50 to-rose-50' :
            idx === 1 ? 'from-orange-50 to-amber-50' : 'from-yellow-50 to-amber-50'
          }`}>
            <p className="text-xl font-bold text-gray-800">{item.value}</p>
            <p className="text-xs text-gray-500">{item.name.split(' ')[0]}</p>
          </div>
        ))}
      </div>
      
      {/* Chart Section */}
      <div className="p-4">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {COLORS.map((color, idx) => (
                  <linearGradient key={`gradient-${idx}`} id={`pieGradient${idx}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.9}/>
                    <stop offset="100%" stopColor={color} stopOpacity={0.7}/>
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={95}
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
                    fill={`url(#pieGradient${index})`}
                    stroke="white"
                    strokeWidth={2}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              <Legend 
                verticalAlign="bottom" 
                height={40}
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span className="text-xs font-medium text-gray-600">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Details List - Google Material Style */}
      <div className="px-6 pb-6">
        <div className="flex items-center gap-2 mb-3">
          <Activity size={12} className="text-gray-400" />
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Severity Details</h4>
        </div>
        <div className="space-y-2">
          {data.map((item, idx) => {
            const percentage = item.percentage;
            const barWidth = percentage;
            
            return (
              <div key={idx} className="group">
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-gray-700 font-medium">{item.name}</span>
                    <span className="text-xs text-gray-400">{item.icon}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-900 font-semibold">{item.value}</span>
                    <span className="text-xs font-mono text-gray-400 w-12 text-right">{percentage.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r ${item.gradient}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Health Assessment Footer */}
      <div className="px-6 pb-6">
        <div className={`mt-2 p-4 rounded-xl border ${
          highRiskCount > 0 ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200' :
          mediumRiskCount > 0 ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200' :
          'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`p-1.5 rounded-lg ${
              highRiskCount > 0 ? 'bg-red-100' :
              mediumRiskCount > 0 ? 'bg-orange-100' : 'bg-green-100'
            }`}>
              {highRiskCount > 0 ? (
                <AlertTriangle size={14} className="text-red-600" />
              ) : mediumRiskCount > 0 ? (
                <AlertTriangle size={14} className="text-orange-600" />
              ) : (
                <Shield size={14} className="text-green-600" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-800 mb-1">Security Assessment</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                {highRiskCount > 0 
                  ? `⚠️ ${highRiskCount} high severity anomalies require immediate attention. Review these transactions promptly.`
                  : mediumRiskCount > 0
                  ? `📊 ${mediumRiskCount} medium severity anomalies detected. Monitor these patterns closely.`
                  : `✅ No high-risk anomalies detected. ${lowRiskCount > 0 ? `${lowRiskCount} low severity issues found for routine review.` : 'Your transaction patterns appear clean.'}`}
              </p>
            </div>
          </div>
        </div>
        
        {/* Legend Footer */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Zap size={10} />
            <span>Total {total} anomalies analyzed</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <TrendingUp size={10} />
            <span>Auto-classified by AI</span>
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

export default SeverityPieChart;