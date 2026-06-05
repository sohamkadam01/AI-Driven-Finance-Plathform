import React from 'react';
import { Lightbulb, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';

const PredictionInsights = ({ insights, predictedBalance, currentBalance, loading, recommendations, riskFactors }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
          <div className="h-4 w-full bg-gray-100 rounded"></div>
          <div className="h-4 w-3/4 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (!insights && !predictedBalance) return null;

  const balanceChange = predictedBalance && currentBalance ? predictedBalance - currentBalance : 0;
  const isPositive = balanceChange >= 0;

  const getBalanceInsight = () => {
    if (balanceChange > 0) {
      return {
        icon: TrendingUp,
        color: 'text-green-600',
        bg: 'bg-green-50',
        title: 'Positive Outlook',
        message: `Your balance is projected to increase by ₹${balanceChange.toLocaleString()} over this period.`
      };
    } else if (balanceChange < 0) {
      return {
        icon: TrendingDown,
        color: 'text-red-600',
        bg: 'bg-red-50',
        title: 'Declining Balance',
        message: `Your balance may decrease by ₹${Math.abs(balanceChange).toLocaleString()}. Consider reducing expenses.`
      };
    }
    return null;
  };

  const balanceInsight = getBalanceInsight();

  return (
    <div className="space-y-4">
      {balanceInsight && (
        <div className={`rounded-2xl p-5 ${balanceInsight.bg} border ${balanceInsight.color === 'text-green-600' ? 'border-green-100' : 'border-red-100'}`}>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl ${balanceInsight.bg} ${balanceInsight.color}`}>
              <balanceInsight.icon size={18} />
            </div>
            <div>
              <h4 className={`font-medium ${balanceInsight.color}`}>{balanceInsight.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{balanceInsight.message}</p>
            </div>
          </div>
        </div>
      )}

      {insights && (
        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
          <div className="flex items-start gap-3">
            <Lightbulb size={18} className="text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">AI Insight</h4>
              <p className="text-sm text-gray-700 mt-1">{insights}</p>
            </div>
          </div>
        </div>
      )}

      {riskFactors && riskFactors.length > 0 && (
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-900">Key Risk Factors</h4>
              <div className="space-y-2 mt-2">
                {riskFactors.map((risk, idx) => (
                  <p key={idx} className="text-sm text-amber-800">• {risk}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-50 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <CheckCircle size={18} className="text-green-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-gray-900">Recommendations</h4>
            <div className="space-y-2 mt-2">
              {recommendations && recommendations.length > 0 ? (
                recommendations.map((rec, idx) => (
                  <p key={idx} className="text-sm text-gray-600">• {rec}</p>
                ))
              ) : (
                isPositive ? (
                  <>
                    <p className="text-sm text-gray-600">• Consider investing your surplus savings for better returns</p>
                    <p className="text-sm text-gray-600">• Review your budget to maintain this positive trend</p>
                    <p className="text-sm text-gray-600">• Set up automatic transfers to your savings account</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-600">• Review your discretionary spending categories</p>
                    <p className="text-sm text-gray-600">• Create a budget to track and limit expenses</p>
                    <p className="text-sm text-gray-600">• Look for opportunities to increase your income</p>
                  </>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionInsights;