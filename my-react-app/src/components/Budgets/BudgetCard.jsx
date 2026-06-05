import React, { useState } from 'react';
import { Edit2, Trash2, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, MoreVertical, Target, Calendar, Sparkles, Zap } from 'lucide-react';

const BudgetCard = ({ budget, onEdit, onDelete }) => {
  const [showActions, setShowActions] = useState(false);
  
  const { 
    categoryName, 
    categoryIcon, 
    amountLimit, 
    spentAmount, 
    remainingAmount, 
    spentPercentage, 
    alertThreshold,
    isAlertTriggered 
  } = budget;

  const getStatusColor = () => {
    if (spentPercentage >= 100) return 'text-red-600';
    if (spentPercentage >= 80) return 'text-amber-600';
    if (spentPercentage >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressGradient = () => {
    if (spentPercentage >= 100) return 'from-red-500 to-rose-500';
    if (spentPercentage >= 80) return 'from-amber-500 to-orange-500';
    if (spentPercentage >= 60) return 'from-yellow-500 to-amber-500';
    return 'from-green-500 to-emerald-500';
  };

  const getStatusBadge = () => {
    if (spentPercentage >= 100) return { text: 'Exceeded', color: 'text-red-700', bg: 'bg-red-100', icon: AlertTriangle };
    if (spentPercentage >= 80) return { text: 'At Risk', color: 'text-amber-700', bg: 'bg-amber-100', icon: AlertTriangle };
    if (spentPercentage >= 60) return { text: 'Moderate', color: 'text-yellow-700', bg: 'bg-yellow-100', icon: null };
    return { text: 'Healthy', color: 'text-green-700', bg: 'bg-green-100', icon: CheckCircle };
  };

  const getRemainingDays = () => {
    const today = new Date();
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const daysLeft = Math.ceil((endOfMonth - today) / (1000 * 60 * 60 * 24));
    return daysLeft;
  };

  const status = getStatusBadge();
  const StatusIcon = status.icon;
  const daysLeft = getRemainingDays();
  const projectedOvershoot = daysLeft > 0 ? (spentAmount / (new Date().getDate())) * daysLeft : 0;
  const dailyAllowance = remainingAmount > 0 && daysLeft > 0 ? remainingAmount / daysLeft : 0;

  return (
    <div className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Gradient Top Border */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${getProgressGradient()}`} />
      
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-50 to-transparent rounded-full blur-2xl opacity-50 pointer-events-none"></div>
      
      <div className="p-5 relative z-10">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Animated Icon Container */}
            <div className="relative">
              <div className={`absolute inset-0 bg-gradient-to-r ${getProgressGradient()} rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity`}></div>
              <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all group-hover:scale-110 group-hover:rotate-6 ${
                spentPercentage >= 100 ? 'bg-gradient-to-br from-red-100 to-rose-100' :
                spentPercentage >= 80 ? 'bg-gradient-to-br from-amber-100 to-orange-100' :
                spentPercentage >= 60 ? 'bg-gradient-to-br from-yellow-100 to-amber-100' : 'bg-gradient-to-br from-green-100 to-emerald-100'
              } shadow-sm`}>
                {categoryIcon || '📊'}
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-800 text-lg">{categoryName}</h3>
                <div className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full ${status.bg} ${status.color} font-medium shadow-sm`}>
                  {StatusIcon && <StatusIcon size={12} />}
                  <span>{status.text}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <Calendar size={10} />
                Monthly budget
              </p>
            </div>
          </div>
          
          {/* Actions Menu - Google Material Style */}
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-110"
            >
              <MoreVertical size={16} />
            </button>
            
            {showActions && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 min-w-[120px] animate-fadeIn">
                <button
                  onClick={() => { onEdit(); setShowActions(false); }}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <Edit2 size={14} className="text-blue-500" />
                  Edit Budget
                </button>
                <button
                  onClick={() => { onDelete(); setShowActions(false); }}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Amount Section */}
        <div className="mb-5">
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-3xl font-bold text-gray-800 tracking-tight">
                ₹{spentAmount.toLocaleString()}
              </span>
              <span className="text-sm text-gray-400 ml-2 font-medium">
                / ₹{amountLimit.toLocaleString()}
              </span>
            </div>
            <div className={`text-sm font-semibold ${getStatusColor()} bg-gray-50 px-2.5 py-1 rounded-full`}>
              {spentPercentage}%
            </div>
          </div>
          
          {/* Progress Bar with Gradient */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span className="font-medium">Budget Utilization</span>
              <span className="font-semibold">{spentPercentage}% used</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
              <div 
                className={`h-full rounded-full bg-gradient-to-r ${getProgressGradient()} transition-all duration-1000 ease-out`}
                style={{ width: `${Math.min(spentPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stats Row - Google Material Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-3 text-center hover:shadow-sm transition-shadow">
            <p className="text-xs text-gray-500 mb-1 font-medium">Remaining</p>
            <p className={`text-lg font-bold ${remainingAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{Math.abs(remainingAmount).toLocaleString()}
            </p>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-3 text-center hover:shadow-sm transition-shadow">
            <p className="text-xs text-gray-500 mb-1 font-medium">Days Left</p>
            <p className="text-lg font-bold text-gray-700 flex items-center justify-center gap-1">
              <Calendar size={14} className="text-gray-400" />
              {daysLeft}
            </p>
          </div>
        </div>

        {/* Daily Allowance Card */}
        {remainingAmount > 0 && daysLeft > 0 && (
          <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-blue-100 rounded-lg">
                  <TrendingDown size={14} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">Daily Allowance</p>
                  <p className="text-xs text-gray-500">To stay on track</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-700">
                  ₹{dailyAllowance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-blue-600">per day</p>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-blue-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">At current pace</span>
                <span className="font-medium text-amber-600">₹{projectedOvershoot.toLocaleString(undefined, { maximumFractionDigits: 0 })} projected</span>
              </div>
            </div>
          </div>
        )}

        {/* Alert Indicator - Enhanced */}
        {isAlertTriggered && spentPercentage < 100 && (
          <div className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 animate-pulse-subtle">
            <div className="flex items-start gap-2">
              <div className="p-1 bg-amber-100 rounded-lg">
                <AlertTriangle size={14} className="text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-amber-800 mb-0.5">Budget Alert</p>
                <p className="text-xs text-amber-700">
                  You've reached {spentPercentage}% of your budget
                  {alertThreshold && ` (Alert at ${alertThreshold}%)`}
                </p>
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <Zap size={10} />
                  Consider adjusting your spending habits
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Exceeded Alert - Critical */}
        {spentPercentage >= 100 && (
          <div className="mt-3 p-3 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border border-red-200">
            <div className="flex items-start gap-2">
              <div className="p-1 bg-red-100 rounded-lg animate-pulse">
                <AlertTriangle size={14} className="text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-red-800 mb-0.5">Budget Exceeded</p>
                <p className="text-xs text-red-700">
                  Exceeded by <span className="font-bold">₹{(spentAmount - amountLimit).toLocaleString()}</span>
                </p>
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <Target size={10} />
                  Review and adjust your budget for next month
                </p>
              </div>
            </div>
          </div>
        )}

        {/* On Track Success Message - Google Style */}
        {spentPercentage <= 50 && remainingAmount > 0 && !isAlertTriggered && (
          <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-green-100 rounded-full">
                <CheckCircle size={14} className="text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-green-800 mb-0.5">On Track!</p>
                <p className="text-xs text-green-700">
                  Great progress! You're well within your budget
                </p>
              </div>
              <Sparkles size={14} className="text-green-500" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Compact Google Material Card (Enhanced)
export const CompactBudgetCard = ({ budget, onEdit, onDelete }) => {
  const { 
    categoryName, 
    categoryIcon, 
    amountLimit, 
    spentAmount, 
    spentPercentage 
  } = budget;

  const getProgressGradient = () => {
    if (spentPercentage >= 100) return 'from-red-500 to-rose-500';
    if (spentPercentage >= 80) return 'from-amber-500 to-orange-500';
    if (spentPercentage >= 60) return 'from-yellow-500 to-amber-500';
    return 'from-green-500 to-emerald-500';
  };

  const getStatusEmoji = () => {
    if (spentPercentage >= 100) return '🔴';
    if (spentPercentage >= 80) return '⚠️';
    if (spentPercentage >= 60) return '🟡';
    return '✅';
  };

  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-4 border border-gray-100 hover:border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className={`w-10 h-10 bg-gradient-to-br ${getProgressGradient()} rounded-lg flex items-center justify-center text-base shadow-sm group-hover:scale-110 transition-transform`}>
              {categoryIcon || getStatusEmoji()}
            </div>
          </div>
          <div>
            <span className="font-semibold text-gray-800 text-sm">{categoryName}</span>
            <p className="text-xs text-gray-400 mt-0.5">
              ₹{spentAmount.toLocaleString()} / ₹{amountLimit.toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <button 
            onClick={onEdit} 
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit2 size={12} />
          </button>
          <button 
            onClick={onDelete} 
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-500">
          <span className="font-medium">Utilization</span>
          <span className={`font-semibold ${
            spentPercentage >= 100 ? 'text-red-600' :
            spentPercentage >= 80 ? 'text-amber-600' :
            spentPercentage >= 60 ? 'text-yellow-600' : 'text-green-600'
          }`}>
            {spentPercentage}%
          </span>
        </div>
        
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full bg-gradient-to-r ${getProgressGradient()} transition-all duration-700`}
            style={{ width: `${Math.min(spentPercentage, 100)}%` }}
          />
        </div>
      </div>
      
      {/* Mini insight for compact view */}
      {spentPercentage >= 80 && (
        <div className="mt-3 pt-2 border-t border-gray-100">
          <p className="text-xs text-amber-600 flex items-center gap-1">
            <AlertTriangle size={10} />
            Close to limit
          </p>
        </div>
      )}
    </div>
  );
};

// Add these animations to your global CSS
const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes pulseSubtle {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out;
  }
  
  .animate-pulse-subtle {
    animation: pulseSubtle 2s ease-in-out infinite;
  }
`;

export default BudgetCard;