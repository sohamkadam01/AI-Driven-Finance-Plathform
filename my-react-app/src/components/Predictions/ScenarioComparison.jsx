import React, { useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Info, ChevronRight, BarChart3, Shield, Target, Zap, Sparkles, Award, Star } from 'lucide-react';

const ScenarioComparison = ({ scenarios, loading, startDate, endDate }) => {
  const [selectedScenario, setSelectedScenario] = useState('mostLikely');
  const [expandedRisk, setExpandedRisk] = useState(false);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-48 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-36 bg-gray-100 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!scenarios) {
    return (
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-12 text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center">
              <TrendingUp size={32} className="text-blue-500" />
            </div>
          </div>
          <h3 className="text-base font-normal text-gray-700 mb-2">No scenario data available</h3>
          <p className="text-sm text-gray-500">Add more transactions to generate scenario predictions</p>
        </div>
      </div>
    );
  }

  const { optimistic, pessimistic, mostLikely, riskAssessment, recommendations } = scenarios;

  const scenariosList = [
    { key: 'optimistic', data: optimistic, icon: TrendingUp, color: 'text-green-600', bg: 'from-green-50 to-emerald-50', border: 'border-green-200', gradient: 'from-green-500 to-emerald-500', label: 'Best Case' },
    { key: 'mostLikely', data: mostLikely, icon: BarChart3, color: 'text-blue-600', bg: 'from-blue-50 to-indigo-50', border: 'border-blue-200', gradient: 'from-blue-500 to-indigo-500', label: 'Most Likely' },
    { key: 'pessimistic', data: pessimistic, icon: TrendingDown, color: 'text-red-600', bg: 'from-red-50 to-rose-50', border: 'border-red-200', gradient: 'from-red-500 to-rose-500', label: 'Worst Case' }
  ];

  const getRiskColor = (level) => {
    switch (level) {
      case 'LOW': return { bg: 'from-green-50 to-emerald-50', text: 'text-green-700', border: 'border-green-200', icon: Shield, label: 'Low Risk' };
      case 'MEDIUM': return { bg: 'from-yellow-50 to-amber-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: AlertTriangle, label: 'Medium Risk' };
      case 'HIGH': return { bg: 'from-orange-50 to-red-50', text: 'text-orange-700', border: 'border-orange-200', icon: AlertTriangle, label: 'High Risk' };
      default: return { bg: 'from-red-50 to-rose-50', text: 'text-red-700', border: 'border-red-200', icon: AlertTriangle, label: 'Critical Risk' };
    }
  };

  const riskColors = getRiskColor(riskAssessment?.riskLevel);
  const RiskIcon = riskColors.icon;

  const selectedScenarioData = {
    optimistic, pessimistic, mostLikely
  }[selectedScenario];

  const getScenarioIcon = (key) => {
    switch(key) {
      case 'optimistic': return <Sparkles size={14} />;
      case 'mostLikely': return <Target size={14} />;
      case 'pessimistic': return <Zap size={14} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-2xl"></div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-md">
            <TrendingUp size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-base font-medium text-gray-800">Scenario Analysis</h2>
            <p className="text-sm text-gray-500">Multiple outcome projections</p>
          </div>
        </div>
        {startDate && endDate && (
          <div className="flex items-center gap-2 text-xs text-gray-400 ml-2">
            <Calendar size={10} />
            <span>Forecast period: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Scenario Cards - Google Material Design */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {scenariosList.map((scenario) => {
          const data = scenario.data;
          if (!data) return null;
          
          const isSelected = selectedScenario === scenario.key;
          const isBest = scenario.key === 'optimistic';
          const isWorst = scenario.key === 'pessimistic';
          
          return (
            <button
              key={scenario.key}
              onClick={() => setSelectedScenario(scenario.key)}
              className={`group relative bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl ${
                isSelected ? `ring-2 ring-blue-500 shadow-lg` : ''
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 w-16 h-16">
                  <div className="absolute top-0 right-0 w-0 h-0 border-t-[64px] border-r-[64px] border-t-transparent border-r-blue-500"></div>
                  <Star size={14} className="absolute top-1 right-1 text-white" />
                </div>
              )}
              
              <div className={`h-1.5 w-full bg-gradient-to-r ${scenario.gradient}`} />
              
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${scenario.bg}`}>
                    <scenario.icon size={18} className={scenario.color} />
                  </div>
                  <div className="flex items-center gap-1">
                    {getScenarioIcon(scenario.key)}
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r ${scenario.bg} ${scenario.color}`}>
                      {data.confidenceLevel}% confidence
                    </span>
                  </div>
                </div>
                
                <p className="text-2xl font-bold text-gray-800">₹{data.predictedBalance?.toLocaleString()}</p>
                <p className="text-sm font-medium text-gray-600 mt-1 capitalize">{scenario.label}</p>
                
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-gray-400">Net savings</p>
                  <p className={`text-sm font-semibold ${isBest ? 'text-green-600' : isWorst ? 'text-red-600' : 'text-blue-600'}`}>
                    ₹{data.netSavings?.toLocaleString()}
                  </p>
                </div>
                
                <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full bg-gradient-to-r ${scenario.gradient} transition-all duration-700`}
                    style={{ width: `${data.confidenceLevel}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Scenario Details - Enhanced */}
      {selectedScenarioData && (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl"></div>
            <div className="px-6 pt-5 pb-4 border-b border-gray-200 relative">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <Info size={14} className="text-white" />
                </div>
                <h3 className="font-semibold text-gray-800">Scenario Details</h3>
              </div>
              <p className="text-sm text-gray-500 mt-1.5 ml-8">{selectedScenarioData.description || 'Detailed breakdown of the selected scenario'}</p>
            </div>
          </div>
          
          <div className="p-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">Total Income</p>
                <p className="text-xl font-bold text-green-600">₹{selectedScenarioData.totalIncome?.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">Projected</p>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">Total Expenses</p>
                <p className="text-xl font-bold text-red-600">₹{selectedScenarioData.totalExpense?.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">Projected</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">Net Savings</p>
                <p className="text-xl font-bold text-blue-600">₹{selectedScenarioData.netSavings?.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">Total</p>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">Monthly Change</p>
                <p className="text-xl font-bold text-gray-800">₹{selectedScenarioData.monthlyChange?.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">vs current</p>
              </div>
            </div>

            {/* Monthly Breakdown */}
            {selectedScenarioData.monthlyBreakdown && selectedScenarioData.monthlyBreakdown.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={14} className="text-gray-400" />
                  <h4 className="text-sm font-semibold text-gray-700">Monthly Projection</h4>
                </div>
                <div className="space-y-2">
                  {selectedScenarioData.monthlyBreakdown.map((month, idx) => (
                    <div 
                      key={idx} 
                      className="group flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-sm transition-all"
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {new Date(month.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1">
                            <TrendingUp size={10} className="text-green-500" />
                            <span className="text-xs text-green-600">₹{month.income?.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingDown size={10} className="text-red-500" />
                            <span className="text-xs text-red-500">₹{month.expense?.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold text-blue-600">₹{month.balance?.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">balance</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Risk Assessment - Enhanced Google Card */}
      {riskAssessment && (
        <div className={`relative overflow-hidden bg-gradient-to-r ${riskColors.bg} rounded-2xl border ${riskColors.border} shadow-md`}>
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-2xl"></div>
          
          <button
            onClick={() => setExpandedRisk(!expandedRisk)}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/30 transition-colors relative z-10"
          >
            <div className="flex items-center gap-4">
              <div className={`p-2.5 rounded-xl bg-white shadow-md`}>
                <RiskIcon size={18} className={riskColors.text} />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-800">Risk Assessment</h3>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${riskColors.bg} ${riskColors.text}`}>
                    {riskColors.label}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Financial risk analysis</p>
              </div>
            </div>
            <ChevronRight 
              size={18} 
              className={`text-gray-400 transition-all duration-300 ${expandedRisk ? 'rotate-90 text-blue-500' : ''}`} 
            />
          </button>
          
          {expandedRisk && (
            <div className="px-6 pb-6 pt-2 border-t border-gray-200/50 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield size={14} className="text-blue-500" />
                    <p className="text-xs font-medium text-gray-600">Emergency Buffer</p>
                  </div>
                  <p className="text-xl font-bold text-gray-800">₹{riskAssessment.emergencyBuffer?.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Recommended 6 months of expenses</p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={14} className="text-blue-500" />
                    <p className="text-xs font-medium text-gray-600">Safety Runway</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <p className="text-xl font-bold text-gray-800">{riskAssessment.monthsOfSafety}</p>
                    <p className="text-sm text-gray-500">months</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">How long savings would last</p>
                </div>
              </div>
              
              {riskAssessment.riskFactors && riskAssessment.riskFactors.length > 0 && (
                <div className="mt-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={14} className="text-yellow-500" />
                    <p className="text-sm font-semibold text-gray-700">Risk Factors</p>
                  </div>
                  <div className="space-y-2">
                    {riskAssessment.riskFactors.map((factor, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1.5"></div>
                        <span>{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Risk Meter */}
              <div className="mt-4 pt-3 border-t border-gray-200/50">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Risk Level</span>
                  <span className={riskColors.text}>{riskAssessment.riskLevel}</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ${
                      riskAssessment.riskLevel === 'LOW' ? 'bg-gradient-to-r from-green-500 to-emerald-500 w-1/4' :
                      riskAssessment.riskLevel === 'MEDIUM' ? 'bg-gradient-to-r from-yellow-500 to-amber-500 w-1/2' :
                      riskAssessment.riskLevel === 'HIGH' ? 'bg-gradient-to-r from-orange-500 to-red-500 w-3/4' : 'bg-gradient-to-r from-red-500 to-rose-500 w-full'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recommendations - Enhanced */}
      {recommendations && recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl shadow-md overflow-hidden">
          <div className="px-6 pt-5 pb-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-sm">
                <CheckCircle size={14} className="text-white" />
              </div>
              <h3 className="font-semibold text-gray-800">Strategic Recommendations</h3>
            </div>
            <p className="text-xs text-gray-500 mt-1 ml-8">Personalized advice based on scenario analysis</p>
          </div>
          <div className="p-5">
            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <div 
                  key={idx} 
                  className="flex items-start gap-3 p-3 bg-gradient-to-r from-white to-gray-50 rounded-xl hover:shadow-sm transition-all group"
                >
                  <div className="p-1.5 bg-blue-100 rounded-lg group-hover:scale-110 transition-transform">
                    <Zap size={12} className="text-blue-500" />
                  </div>
                  <span className="text-sm text-gray-700 flex-1 leading-relaxed">{rec}</span>
                  <ChevronRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add Calendar import at top
import { Calendar } from 'lucide-react';

export default ScenarioComparison;