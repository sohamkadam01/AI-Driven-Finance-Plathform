import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Brain, BarChart3 } from 'lucide-react';

const PredictionCards = ({ prediction, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
            <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 w-32 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!prediction) return null;

  const cards = [
    {
      title: 'Predicted Balance',
      value: `₹${prediction.predictedBalance?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      change: prediction.predictedBalance > prediction.currentBalance ? 'positive' : 'negative'
    },
    {
      title: 'Prediction Method',
      value: prediction.method || 'N/A',
      icon: Brain,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      subtitle: prediction.method === 'AI-POWERED' ? 'AI Model' : 'Statistical Analysis'
    },
    {
      title: 'Forecast Period',
      value: `${prediction.dailyPredictions?.length || 0} days`,
      icon: Calendar,
      color: 'text-green-600',
      bg: 'bg-green-50',
      subtitle: 'Daily projections'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-xl ${card.bg}`}>
              <card.icon size={18} className={card.color} />
            </div>
            {card.change && (
              <div className={`flex items-center gap-1 text-xs ${
                card.change === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {card.change === 'positive' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span>vs current</span>
              </div>
            )}
          </div>
          <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
          <p className="text-sm text-gray-500 mt-1">{card.title}</p>
          {card.subtitle && (
            <p className="text-xs text-gray-400 mt-1">{card.subtitle}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default PredictionCards;