import React, { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown } from 'lucide-react';

const DailyBreakdownTable = ({ predictions, loading }) => {
  const [showAll, setShowAll] = useState(false);
  const [sortBy, setSortBy] = useState('date'); // date, balance, net

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-40 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!predictions || predictions.length === 0) {
    return null;
  }

  const getSortedData = () => {
    const data = [...predictions];
    switch (sortBy) {
      case 'balance':
        return data.sort((a, b) => b.predictedBalance - a.predictedBalance);
      case 'net':
        return data.sort((a, b) => (b.predictedIncome - b.predictedExpense) - (a.predictedIncome - a.predictedExpense));
      default:
        return data.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
  };

  const displayData = showAll ? getSortedData() : getSortedData().slice(0, 10);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getNetChangeColor = (income, expense) => {
    const net = income - expense;
    if (net > 0) return 'text-green-600';
    if (net < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  const getNetChangeIcon = (income, expense) => {
    const net = income - expense;
    if (net > 0) return <TrendingUp size={12} className="text-green-600" />;
    if (net < 0) return <TrendingDown size={12} className="text-red-600" />;
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-base font-medium text-gray-900">Daily Breakdown</h3>
          <p className="text-sm text-gray-500 mt-0.5">Day-by-day income, expense, and balance projections</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Date</option>
            <option value="balance">Balance</option>
            <option value="net">Net Change</option>
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Income</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Expenses</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Net Change</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayData.map((day, idx) => {
              const netChange = day.predictedIncome - day.predictedExpense;
              return (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-3 text-sm text-gray-900">{formatDate(day.date)}</td>
                  <td className="px-6 py-3 text-sm text-right text-green-600">
                    +₹{day.predictedIncome?.toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-sm text-right text-red-500">
                    -₹{day.predictedExpense?.toLocaleString()}
                  </td>
                  <td className={`px-6 py-3 text-sm text-right font-medium ${getNetChangeColor(day.predictedIncome, day.predictedExpense)}`}>
                    <div className="flex items-center justify-end gap-1">
                      {getNetChangeIcon(day.predictedIncome, day.predictedExpense)}
                      {netChange > 0 ? '+' : ''}₹{Math.abs(netChange).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-right font-semibold text-gray-900">
                    ₹{day.predictedBalance?.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {predictions.length > 10 && (
        <div className="px-6 py-3 border-t border-gray-100 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mx-auto"
          >
            {showAll ? (
              <>Show Less <ChevronUp size={14} /></>
            ) : (
              <>Show All ({predictions.length} days) <ChevronDown size={14} /></>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default DailyBreakdownTable;