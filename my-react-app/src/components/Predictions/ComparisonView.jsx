import React from 'react';
import { Brain, BarChart3, TrendingUp, TrendingDown, CheckCircle, XCircle, Sparkles, Target, Zap, Shield, Award, Star } from 'lucide-react';

const ComparisonView = ({ comparison, loading, startDate, endDate }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-48 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-80 bg-gray-100 rounded-xl"></div>
              <div className="h-80 bg-gray-100 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!comparison) {
    return (
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-12 text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center">
              <Brain size={32} className="text-blue-500" />
            </div>
          </div>
          <h3 className="text-base font-normal text-gray-700 mb-2">No comparison data available</h3>
          <p className="text-sm text-gray-500">Select a date range to compare prediction methods</p>
        </div>
      </div>
    );
  }

  const { statistical, ai } = comparison;

  const getBetterMethod = () => {
    if (!statistical || !ai) return null;
    const statConfidence = statistical.confidenceScore || 0;
    const aiConfidence = ai.confidenceScore || 0;
    
    if (statConfidence > aiConfidence) return 'STATISTICAL';
    if (aiConfidence > statConfidence) return 'AI';
    return 'EQUAL';
  };

  const betterMethod = getBetterMethod();
  const statConfidence = statistical?.confidenceScore || 0;
  const aiConfidence = ai?.confidenceScore || 0;
  const confidenceDiff = Math.abs(statConfidence - aiConfidence).toFixed(1);

  const getMethodCardStyle = (method) => {
    const isBetter = (method === 'STATISTICAL' && betterMethod === 'STATISTICAL') || 
                     (method === 'AI' && betterMethod === 'AI');
    return isBetter ? 'ring-2 ring-blue-400 shadow-lg' : '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-2xl"></div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-md">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-base font-medium text-gray-800">Method Comparison</h2>
            <p className="text-sm text-gray-500">Statistical vs AI prediction analysis</p>
          </div>
        </div>
        {startDate && endDate && (
          <div className="flex items-center gap-2 text-xs text-gray-400 ml-2">
            <Target size={10} />
            <span>Comparing period: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Comparison Cards - Google Material Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Statistical Method Card */}
        <div className={`group relative bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl ${getMethodCardStyle('STATISTICAL')}`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-2xl"></div>
          <div className={`h-1.5 w-full bg-gradient-to-r from-blue-500 to-cyan-500`} />
          
          <div className="px-6 pt-5 pb-4 border-b border-gray-200 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-md">
                  <BarChart3 size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Statistical Method</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Historical pattern analysis</p>
                </div>
              </div>
              {betterMethod === 'STATISTICAL' && (
                <div className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full shadow-sm">
                  <Award size={12} className="text-white" />
                  <span className="text-xs font-semibold text-white">Recommended</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6 relative">
            {statistical ? (
              <>
                {/* Predicted Balance */}
                <div className="text-center mb-5">
                  <p className="text-xs text-gray-500 mb-1">Predicted Balance</p>
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur opacity-20"></div>
                    <p className="relative text-3xl font-bold text-gray-800">₹{statistical.predictedBalance?.toLocaleString()}</p>
                  </div>
                </div>
                
                {/* Confidence Score with Circular Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Confidence Score</span>
                    <span className="text-sm font-bold text-blue-600">{Math.round(statConfidence)}%</span>
                  </div>
                  <div className="relative">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-blue-500 to-cyan-500"
                        style={{ width: `${statConfidence}%` }}
                      />
                    </div>
                    <div 
                      className="absolute -top-1 w-3 h-3 bg-white border-2 border-blue-500 rounded-full transition-all duration-700"
                      style={{ left: `calc(${statConfidence}% - 6px)` }}
                    />
                  </div>
                </div>
                
                {/* Metrics Grid */}
                {statistical.metrics && (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {statistical.metrics.mae && (
                      <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-500">MAE</p>
                        <p className="text-sm font-semibold text-gray-700">₹{statistical.metrics.mae.toLocaleString()}</p>
                      </div>
                    )}
                    {statistical.metrics.rmse && (
                      <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-500">RMSE</p>
                        <p className="text-sm font-semibold text-gray-700">₹{statistical.metrics.rmse.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Insights */}
                {statistical.insights && (
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                    <div className="flex items-start gap-2">
                      <Zap size={12} className="text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-blue-800 leading-relaxed">{statistical.insights}</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <XCircle size={24} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">No statistical prediction available</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Method Card */}
        <div className={`group relative bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl ${getMethodCardStyle('AI')}`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>
          <div className={`h-1.5 w-full bg-gradient-to-r from-purple-500 to-pink-500`} />
          
          <div className="px-6 pt-5 pb-4 border-b border-gray-200 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-md">
                  <Brain size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">AI Method</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Advanced machine learning</p>
                </div>
              </div>
              {betterMethod === 'AI' && (
                <div className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full shadow-sm">
                  <Award size={12} className="text-white" />
                  <span className="text-xs font-semibold text-white">Recommended</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6 relative">
            {ai ? (
              <>
                {/* Predicted Balance */}
                <div className="text-center mb-5">
                  <p className="text-xs text-gray-500 mb-1">Predicted Balance</p>
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur opacity-20"></div>
                    <p className="relative text-3xl font-bold text-gray-800">₹{ai.predictedBalance?.toLocaleString()}</p>
                  </div>
                </div>
                
                {/* Confidence Score with Circular Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Confidence Score</span>
                    <span className="text-sm font-bold text-purple-600">{Math.round(aiConfidence)}%</span>
                  </div>
                  <div className="relative">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-purple-500 to-pink-500"
                        style={{ width: `${aiConfidence}%` }}
                      />
                    </div>
                    <div 
                      className="absolute -top-1 w-3 h-3 bg-white border-2 border-purple-500 rounded-full transition-all duration-700"
                      style={{ left: `calc(${aiConfidence}% - 6px)` }}
                    />
                  </div>
                </div>
                
                {/* Metrics Grid */}
                {ai.metrics && (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {ai.metrics.mae && (
                      <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-500">MAE</p>
                        <p className="text-sm font-semibold text-gray-700">₹{ai.metrics.mae.toLocaleString()}</p>
                      </div>
                    )}
                    {ai.metrics.rmse && (
                      <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-500">RMSE</p>
                        <p className="text-sm font-semibold text-gray-700">₹{ai.metrics.rmse.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Insights */}
                {ai.insights && (
                  <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                    <div className="flex items-start gap-2">
                      <Sparkles size={12} className="text-purple-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-purple-800 leading-relaxed">{ai.insights}</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <XCircle size={24} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">No AI prediction available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comparison Verdict - Enhanced Google Style */}
      {betterMethod && betterMethod !== 'EQUAL' && (
        <div className={`relative overflow-hidden rounded-2xl p-6 ${
          betterMethod === 'STATISTICAL' 
            ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-200' 
            : 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200'
        }`}>
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-2xl"></div>
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl shadow-md ${
                betterMethod === 'STATISTICAL' 
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500'
              }`}>
                {betterMethod === 'STATISTICAL' ? <BarChart3 size={20} className="text-white" /> : <Brain size={20} className="text-white" />}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-800">Better Method: {betterMethod}</h4>
                  <Star size={14} className="text-amber-500" />
                </div>
                <p className="text-sm text-gray-600">
                  {betterMethod === 'STATISTICAL' 
                    ? 'The statistical method provides higher confidence for your data pattern.'
                    : 'AI predictions are more accurate for your spending patterns.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-xl">
              <TrendingUp size={14} className={betterMethod === 'STATISTICAL' ? 'text-blue-500' : 'text-purple-500'} />
              <span className="text-sm font-semibold text-gray-700">
                +{confidenceDiff}% confidence
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Equal Method Case */}
      {betterMethod === 'EQUAL' && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-200 p-6">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-2xl"></div>
          <div className="relative flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-md">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Methods are equally effective</h4>
              <p className="text-sm text-gray-600">
                Both statistical and AI methods show similar confidence levels. Either method is reliable for your forecasts.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recommendation - Enhanced */}
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-200">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-md">
            <CheckCircle size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-800">AI-Powered Recommendation</h4>
              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Optimized</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {betterMethod === 'STATISTICAL' 
                ? '📊 Continue using statistical predictions for reliable forecasts. Your spending pattern shows consistent behavior that traditional methods capture well.'
                : betterMethod === 'AI'
                ? '🧠 AI predictions are delivering superior accuracy for your variable spending patterns. Continue leveraging machine learning for optimal forecast results.'
                : '⚖️ Both methods perform similarly. Consider using AI for complex patterns or statistical for simpler, consistent trends.'}
            </p>
            <div className="mt-3 pt-2 border-t border-gray-200 flex items-center gap-2 text-xs text-gray-400">
              <Zap size={10} />
              <span>Based on {startDate && endDate ? `${Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))} days` : 'selected period'} of data analysis</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonView;