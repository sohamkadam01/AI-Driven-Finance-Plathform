import React from 'react';
import { AlertTriangle, CheckCircle, Clock, DollarSign, TrendingUp, Shield } from 'lucide-react';

const AnomalyStatsCards = ({ statistics, loading }) => {
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

  if (!statistics || !statistics.overview) return null;

  const { overview } = statistics;
  const { severityBreakdown } = statistics;
  const resolvedCount = statistics.resolutionStats?.resolved
    ?? ((overview.confirmedFraud || 0) + (overview.falseAlarms || 0));

  const cards = [
    {
      title: 'Total Anomalies',
      value: overview.totalAnomalies || 0,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      subtitle: `${severityBreakdown?.highSeverity || 0} high severity`
    },
    {
      title: 'Detection Rate',
      value: `${overview.detectionRate || 0}%`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      subtitle: 'of total transactions'
    },
    {
      title: 'Resolution Rate',
      value: `${overview.resolutionRate || 0}%`,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
      subtitle: `${resolvedCount} of ${overview.totalAnomalies || 0} resolved`
    },
    {
      title: 'Financial Impact',
      value: `₹${(overview.totalFinancialImpact || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-red-600',
      bg: 'bg-red-50',
      subtitle: 'Confirmed fraud amount'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-xl ${card.bg}`}>
              <card.icon size={18} className={card.color} />
            </div>
            {card.subtitle && (
              <span className="text-xs text-gray-400">{card.subtitle}</span>
            )}
          </div>
          <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
          <p className="text-sm text-gray-500 mt-1">{card.title}</p>
        </div>
      ))}
    </div>
  );
};

export default AnomalyStatsCards;
