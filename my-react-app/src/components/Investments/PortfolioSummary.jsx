import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';

const PortfolioSummary = ({ summary, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
            <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 w-32 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!summary) return null;

  const isPositive = summary.totalProfitLoss >= 0;
  const profitLossColor = isPositive ? 'text-green-600' : 'text-red-600';

  const cards = [
    {
      title: 'Total Invested',
      // Fallback to common key names like amountInvested if totalInvested is missing
      value: `₹${(summary.totalInvested ?? summary.amountInvested ?? summary.totalAmountInvested ?? 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Current Value',
      value: `₹${summary.currentValue?.toLocaleString() || 0}`,
      icon: BarChart3,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      title: 'Total Returns',
      value: `₹${Math.abs(summary.totalProfitLoss || 0).toLocaleString()}`,
      subValue: `${Math.abs(summary.totalReturnsPercentage || 0).toFixed(1)}%`,
      icon: isPositive ? TrendingUp : TrendingDown,
      color: profitLossColor,
      bg: isPositive ? 'bg-green-50' : 'bg-red-50',
      isPositive: isPositive
    },
    {
      title: 'Investments',
      value: summary.numberOfInvestments || 0,
      subValue: `${summary.numberOfProfitableInvestments || 0} profitable`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-xl ${card.bg}`}>
              {React.createElement(card.icon, { size: 18, className: card.color })}
            </div>
            {card.subValue && (
              <span className={`text-xs font-medium ${card.isPositive === false ? 'text-red-600' : 'text-green-600'}`}>
                {card.subValue}
              </span>
            )}
          </div>
          <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
          <p className="text-sm text-gray-500 mt-1">{card.title}</p>
          {card.subValue && card.isPositive !== undefined && (
            <p className="text-xs text-gray-400 mt-1">{card.subValue}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default PortfolioSummary;