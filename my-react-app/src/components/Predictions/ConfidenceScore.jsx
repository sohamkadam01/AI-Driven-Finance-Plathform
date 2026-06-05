import React from 'react';
import { TrendingUp, Brain, BarChart3 } from 'lucide-react';

const ConfidenceScore = ({ score, method, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="animate-pulse h-24 bg-gray-100 rounded-lg"></div>
      </div>
    );
  }

  if (!score) return null;

  const getScoreColor = () => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = () => {
    if (score >= 80) return 'bg-green-50';
    if (score >= 60) return 'bg-blue-50';
    if (score >= 40) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  const getMethodIcon = () => {
    if (method === 'AI-POWERED') return <Brain size={16} />;
    return <BarChart3 size={16} />;
  };

  const getConfidenceMessage = () => {
    if (score >= 80) return 'High confidence - Your spending patterns are very consistent';
    if (score >= 60) return 'Good confidence - Reliable prediction based on your data';
    if (score >= 40) return 'Moderate confidence - Some variability in your spending';
    return 'Low confidence - Consider adding more transaction data';
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full ${getScoreBg()} flex items-center justify-center`}>
            <span className={`text-xl font-bold ${getScoreColor()}`}>{Math.round(score)}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-medium text-gray-900">Confidence Score</h3>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                {getMethodIcon()}
                <span>{method || 'STATISTICAL'}</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{getConfidenceMessage()}</p>
          </div>
        </div>
        
        <div className="flex-1 max-w-md">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Low</span>
            <span>Moderate</span>
            <span>High</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-700 ${
                score >= 80 ? 'bg-green-500' :
                score >= 60 ? 'bg-blue-500' :
                score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfidenceScore;