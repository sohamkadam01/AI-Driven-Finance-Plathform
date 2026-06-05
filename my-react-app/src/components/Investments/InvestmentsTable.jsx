import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Edit2, Trash2, RefreshCw, ChevronDown, ChevronUp, Search, Filter, BarChart3, Target, Zap, Shield } from 'lucide-react';

const InvestmentsTable = ({ investments, loading, onUpdateValue, onDelete }) => {
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-100 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!investments || investments.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-12 text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center">
              <TrendingUp size={32} className="text-blue-500" />
            </div>
          </div>
          <h3 className="text-base font-normal text-gray-700 mb-2">No investments yet</h3>
          <p className="text-sm text-gray-500">Add your first investment to start tracking</p>
        </div>
      </div>
    );
  }

  const getSortIcon = (field) => {
    if (sortField !== field) return <ChevronDown size={14} className="opacity-30" />;
    return sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredInvestments = investments.filter(inv =>
    inv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inv.symbol && inv.symbol.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedInvestments = [...filteredInvestments].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    
    if (sortField === 'returnsPercentage') {
      aVal = a.returnsPercentage;
      bVal = b.returnsPercentage;
    } else if (sortField === 'currentValue') {
      aVal = a.currentValue;
      bVal = b.currentValue;
    } else if (sortField === 'profitLoss') {
      aVal = a.profitLoss;
      bVal = b.profitLoss;
    }
    
    if (typeof aVal === 'string') {
      return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const getReturnColor = (returns) => {
    if (returns > 0) return 'text-green-600';
    if (returns < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  const getReturnIcon = (returns) => {
    if (returns > 0) return <TrendingUp size={14} className="text-green-600" />;
    if (returns < 0) return <TrendingDown size={14} className="text-red-600" />;
    return null;
  };

  const getReturnBadge = (returns) => {
    if (returns > 0) return { text: 'Profit', color: 'text-green-700 bg-green-100', icon: TrendingUp };
    if (returns < 0) return { text: 'Loss', color: 'text-red-700 bg-red-100', icon: TrendingDown };
    return { text: 'Break Even', color: 'text-gray-700 bg-gray-100', icon: null };
  };

  // Calculate portfolio summary
  const totalInvested = filteredInvestments.reduce((sum, inv) => sum + (inv.amountInvested || 0), 0);
  const totalCurrentValue = filteredInvestments.reduce((sum, inv) => sum + (inv.currentValue || 0), 0);
  const totalProfitLoss = totalCurrentValue - totalInvested;
  const totalReturnPercent = totalInvested ? (totalProfitLoss / totalInvested) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-2xl"></div>
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-md">
                <BarChart3 size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-800">Investment Holdings</h3>
                <p className="text-sm text-gray-500 mt-0.5">{investments.length} investments tracked</p>
              </div>
            </div>
            
            {/* Search Bar - Google Style */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search investments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full lg:w-80 pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Total Invested</p>
            <p className="text-lg font-bold text-gray-800">₹{totalInvested.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Current Value</p>
            <p className="text-lg font-bold text-gray-800">₹{totalCurrentValue.toLocaleString()}</p>
          </div>
          <div className={`bg-white rounded-xl p-3 shadow-sm ${totalProfitLoss >= 0 ? 'bg-gradient-to-br from-green-50 to-emerald-50' : 'bg-gradient-to-br from-red-50 to-rose-50'}`}>
            <p className="text-xs text-gray-500 mb-1">Total P&L</p>
            <p className={`text-lg font-bold ${totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalProfitLoss >= 0 ? '+' : ''}₹{Math.abs(totalProfitLoss).toLocaleString()}
            </p>
          </div>
          <div className={`bg-white rounded-xl p-3 shadow-sm ${totalReturnPercent >= 0 ? 'bg-gradient-to-br from-green-50 to-emerald-50' : 'bg-gradient-to-br from-red-50 to-rose-50'}`}>
            <p className="text-xs text-gray-500 mb-1">Total Returns</p>
            <div className="flex items-center gap-1">
              {totalReturnPercent >= 0 ? <TrendingUp size={14} className="text-green-600" /> : <TrendingDown size={14} className="text-red-600" />}
              <p className={`text-lg font-bold ${totalReturnPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalReturnPercent >= 0 ? '+' : ''}{totalReturnPercent.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Investments Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1">
                  Investment
                  <span className="text-gray-400">{getSortIcon('name')}</span>
                </div>
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors" onClick={() => handleSort('type')}>
                <div className="flex items-center justify-end gap-1">
                  Type
                  <span className="text-gray-400">{getSortIcon('type')}</span>
                </div>
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors" onClick={() => handleSort('amountInvested')}>
                <div className="flex items-center justify-end gap-1">
                  Invested
                  <span className="text-gray-400">{getSortIcon('amountInvested')}</span>
                </div>
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors" onClick={() => handleSort('currentValue')}>
                <div className="flex items-center justify-end gap-1">
                  Current Value
                  <span className="text-gray-400">{getSortIcon('currentValue')}</span>
                </div>
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors" onClick={() => handleSort('profitLoss')}>
                <div className="flex items-center justify-end gap-1">
                  P&L
                  <span className="text-gray-400">{getSortIcon('profitLoss')}</span>
                </div>
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors" onClick={() => handleSort('returnsPercentage')}>
                <div className="flex items-center justify-end gap-1">
                  Returns
                  <span className="text-gray-400">{getSortIcon('returnsPercentage')}</span>
                </div>
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedInvestments.map((investment, idx) => {
              const isPositive = investment.profitLoss >= 0;
              const returnBadge = getReturnBadge(investment.returnsPercentage);
              const ReturnIcon = returnBadge.icon;
              
              return (
                <tr 
                  key={investment.investmentId} 
                  className="hover:bg-gray-50 transition-colors group"
                  style={{
                    animation: `fadeInUp ${0.3 + idx * 0.03}s ease-out`
                  }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base shadow-sm group-hover:scale-110 transition-transform ${
                        isPositive ? 'bg-gradient-to-br from-green-100 to-emerald-100' : 'bg-gradient-to-br from-gray-100 to-slate-100'
                      }`}>
                        {investment.symbol ? investment.symbol.charAt(0) : '📈'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{investment.name}</p>
                        {investment.symbol && (
                          <p className="text-xs text-gray-400 mt-0.5">{investment.symbol}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
                      {investment.type || 'Equity'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-sm font-medium text-gray-700">₹{investment.amountInvested?.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-sm font-bold text-gray-800">₹{investment.currentValue?.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-semibold ${isPositive ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
                      {isPositive ? '+' : ''}₹{Math.abs(investment.profitLoss || 0).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-semibold ${getReturnColor(investment.returnsPercentage)} bg-opacity-10 ${
                      investment.returnsPercentage > 0 ? 'bg-green-50' : investment.returnsPercentage < 0 ? 'bg-red-50' : 'bg-gray-50'
                    }`}>
                      {getReturnIcon(investment.returnsPercentage)}
                      {investment.returnsPercentage > 0 ? '+' : ''}{investment.returnsPercentage?.toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onUpdateValue(investment)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all hover:scale-110"
                        title="Update Value"
                      >
                        <RefreshCw size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(investment.investmentId)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all hover:scale-110"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Footer Stats */}
      {filteredInvestments.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-gray-600">Positive Returns</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-xs text-gray-600">Negative Returns</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Shield size={10} />
              <span>{filteredInvestments.length} of {investments.length} investments shown</span>
              {searchTerm && <span> • Filtered by "{searchTerm}"</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add this to your global CSS
const styles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export default InvestmentsTable;  // ✅ CORRECT - with 'n'