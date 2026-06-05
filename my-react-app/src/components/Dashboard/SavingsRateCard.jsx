import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Percent, TrendingUp, TrendingDown, Sparkles, Target, Zap, Lightbulb } from 'lucide-react';

const SavingsRateCard = ({ savingsRate, loading }) => {
  const [hoveredCard, setHoveredCard] = useState(false);

  if (loading) {
    return (
      <motion.div 
        className="bg-white p-7 rounded-3xl border border-gray-100 animate-pulse h-80"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="h-14 w-14 bg-gradient-to-br from-gray-200 to-gray-100 rounded-2xl mb-4"></div>
        <div className="h-4 w-24 bg-gray-100 rounded mb-3"></div>
        <div className="h-10 w-32 bg-gray-200 rounded mb-6"></div>
        <div className="space-y-3">
          <div className="h-2 w-full bg-gray-100 rounded-full"></div>
          <div className="h-4 w-48 bg-gray-50 rounded"></div>
        </div>
      </motion.div>
    );
  }

  const rawRate = Number(savingsRate?.currentSavingsRate ?? 0);
  const rate = Number.isFinite(rawRate) ? rawRate : 0;
  const formattedRate = rate.toLocaleString(undefined, { maximumFractionDigits: 2 });
  const progressWidth = `${(Math.max(0, Math.min(rate, 45)) / 45) * 100}%`;
  const status = savingsRate?.savingsStatus || 'FAIR';
  const insight = savingsRate?.insight || '';
  const recommendations = savingsRate?.recommendations || [];

  const getStatusColor = () => {
    if (rate >= 30) return 'text-emerald-600';
    if (rate >= 20) return 'text-blue-600';
    if (rate >= 10) return 'text-yellow-600';
    if (rate >= 0) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStatusGradient = () => {
    if (rate >= 30) return 'from-emerald-500 to-green-600';
    if (rate >= 20) return 'from-blue-500 to-indigo-600';
    if (rate >= 10) return 'from-yellow-500 to-amber-600';
    if (rate >= 0) return 'from-orange-500 to-red-600';
    return 'from-red-500 to-rose-600';
  };

  const getStatusBadge = () => {
    if (rate >= 30) return { text: 'Excellent', color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: '🚀' };
    if (rate >= 20) return { text: 'Good', color: 'bg-blue-50 text-blue-700 border-blue-100', icon: '✨' };
    if (rate >= 10) return { text: 'Fair', color: 'bg-yellow-50 text-yellow-700 border-yellow-100', icon: '📈' };
    if (rate >= 0) return { text: 'Needs Improvement', color: 'bg-orange-50 text-orange-700 border-orange-100', icon: '⚡' };
    return { text: 'Critical', color: 'bg-red-50 text-red-700 border-red-100', icon: '⚠️' };
  };

  const badge = getStatusBadge();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      onMouseEnter={() => setHoveredCard(true)}
      onMouseLeave={() => setHoveredCard(false)}
      className="group relative h-full"
    >
      {/* Glowing background effect */}
      <motion.div 
        className={`absolute -inset-1 bg-gradient-to-r ${getStatusGradient()} rounded-3xl opacity-0 blur-xl transition-all duration-500 -z-10`}
        animate={hoveredCard ? { opacity: [0, 0.15, 0.1] } : { opacity: 0 }}
        transition={{ duration: 0.4 }}
      />

      <div className="relative bg-white rounded-3xl border-2 border-gray-100 p-7 h-full flex flex-col transition-all duration-300 group-hover:shadow-2xl group-hover:border-gray-200 overflow-hidden">
        
        {/* Top accent line */}
        <motion.div 
          className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${getStatusGradient()} origin-left`}
          initial={{ scaleX: 0 }}
          animate={hoveredCard ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />

        {/* Animated gradient overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className={`absolute -top-1/2 -right-1/3 w-2/3 h-full bg-gradient-to-b from-purple-50 rounded-full blur-3xl`} />
        </div>

        {/* Header */}
        <div className="flex justify-between items-start mb-5 relative z-10">
          {/* Icon */}
          <motion.div 
            className={`p-3.5 bg-gradient-to-br ${getStatusGradient()} text-white rounded-3xl shadow-lg group-hover:shadow-2xl transition-all`}
            whileHover={{ rotate: 12, scale: 1.12 }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 100 }}
          >
            <Percent size={24} strokeWidth={1.5} />
          </motion.div>

          {/* Status Badge */}
          <motion.div 
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border ${badge.color}`}
            whileHover={{ scale: 1.08 }}
          >
            <span>{badge.icon}</span>
            <span>{badge.text}</span>
          </motion.div>
        </div>

        {/* Title and Rate Section */}
        <div className="mb-5 relative z-10">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Savings Rate</p>
          <motion.h3 
            className={`text-4xl font-black tracking-tight ${getStatusColor()}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {formattedRate}%
          </motion.h3>
        </div>

        {/* Progress Bar with markers */}
        <div className="mb-6 relative z-10">
          <div className="flex justify-between text-xs text-gray-400 font-semibold mb-2.5">
            <span>0%</span>
            <span>15%</span>
            <span>30%</span>
            <span>45%</span>
          </div>
          
          {/* Progress Container */}
          <div className="relative h-3 w-full bg-gradient-to-r from-gray-100 to-gray-50 rounded-full overflow-hidden shadow-inner">
            {/* Glow effect */}
            <motion.div 
              className={`absolute inset-0 bg-gradient-to-r ${getStatusGradient()} opacity-0 blur-sm`}
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            {/* Main progress */}
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: progressWidth }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full rounded-full bg-gradient-to-r ${getStatusGradient()} relative`}
            >
              {/* Shimmer */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['0%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>

            {/* Markers */}
            <div className="absolute inset-0 flex justify-between pointer-events-none px-2">
              <div className="w-0.5 h-full bg-gray-200/50"></div>
              <div className="w-0.5 h-full bg-gray-200/30"></div>
              <div className="w-0.5 h-full bg-gray-200/20"></div>
            </div>
          </div>
        </div>

        {/* Insights Section */}
        <div className="mt-auto pt-4 relative z-10">
          {insight && (
            <motion.div 
              className="p-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 rounded-2xl border border-purple-100/50 mb-3 hover:shadow-md transition-shadow"
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-sm text-gray-700 font-medium leading-relaxed">{insight}</p>
            </motion.div>
          )}

          {recommendations.length > 0 && (
            <motion.div 
              className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100 flex items-start gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="p-1.5 bg-white rounded-lg flex-shrink-0 mt-0.5">
                <Lightbulb size={14} className="text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-amber-900 mb-0.5">Tip</p>
                <p className="text-xs text-amber-800 line-clamp-2">{recommendations[0]}</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Floating indicator */}
        <motion.div 
          className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          whileHover={{ scale: 1.15, rotate: 8 }}
        >
          <div className={`w-10 h-10 bg-gradient-to-br ${getStatusGradient()} rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white`}>
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            >
              <TrendingUp size={16} className="text-white" strokeWidth={2} />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SavingsRateCard;
