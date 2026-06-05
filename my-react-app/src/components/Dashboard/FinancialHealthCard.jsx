import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, TrendingUp, AlertTriangle, Zap, Star, Sparkles } from 'lucide-react';

const FinancialHealthCard = ({ health, loading }) => {
  const [hoveredCard, setHoveredCard] = useState(false);

  if (loading) {
    return (
      <motion.div 
        className="bg-white p-7 rounded-3xl border border-gray-100 animate-pulse lg:col-span-2 h-80"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-28 h-28 rounded-full bg-gray-200 flex-shrink-0"></div>
          <div className="flex-1 space-y-3">
            <div className="h-6 w-48 bg-gray-200 rounded"></div>
            <div className="h-4 w-full bg-gray-100 rounded"></div>
            <div className="h-4 w-3/4 bg-gray-100 rounded"></div>
          </div>
        </div>
      </motion.div>
    );
  }

  const score = health?.overallScore || 0;
  const status = health?.status || 'FAIR';
  const summary = health?.summary || 'Loading...';
  const strengths = health?.strengths || [];
  const weaknesses = health?.weaknesses || [];

  const getStatusColor = () => {
    switch(status) {
      case 'EXCELLENT': return 'text-emerald-600';
      case 'GOOD': return 'text-blue-600';
      case 'FAIR': return 'text-yellow-600';
      case 'POOR': return 'text-orange-600';
      default: return 'text-red-600';
    }
  };

  const getStatusGradient = () => {
    switch(status) {
      case 'EXCELLENT': return 'from-emerald-500 to-green-600';
      case 'GOOD': return 'from-blue-500 to-indigo-600';
      case 'FAIR': return 'from-yellow-500 to-amber-600';
      case 'POOR': return 'from-orange-500 to-red-600';
      default: return 'from-red-500 to-rose-600';
    }
  };

  const getCircleColor = () => {
    switch(status) {
      case 'EXCELLENT': return '#10b981';
      case 'GOOD': return '#3b82f6';
      case 'FAIR': return '#f59e0b';
      case 'POOR': return '#f97316';
      default: return '#ef4444';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      onMouseEnter={() => setHoveredCard(true)}
      onMouseLeave={() => setHoveredCard(false)}
      className="group relative lg:col-span-2"
    >
      {/* Glowing background effect */}
      <motion.div 
        className={`absolute -inset-1 bg-gradient-to-r ${getStatusGradient()} rounded-3xl opacity-0 blur-xl transition-all duration-500 -z-10`}
        animate={hoveredCard ? { opacity: [0, 0.15, 0.1] } : { opacity: 0 }}
        transition={{ duration: 0.4 }}
      />

      <div className="relative bg-white rounded-3xl border-2 border-gray-100 p-7 flex flex-col md:flex-row items-start gap-8 transition-all duration-300 group-hover:shadow-2xl group-hover:border-gray-200 overflow-hidden">
        
        {/* Top accent line */}
        <motion.div 
          className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${getStatusGradient()} origin-left`}
          initial={{ scaleX: 0 }}
          animate={hoveredCard ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />

        {/* Animated gradient overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className={`absolute -top-1/2 -right-1/3 w-2/3 h-full bg-gradient-to-b from-green-50 rounded-full blur-3xl`} />
        </div>

        {/* Circular Score - Enhanced */}
        <motion.div 
          className="relative flex-shrink-0 z-10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
        >
          {/* Glow effect */}
          <motion.div 
            className={`absolute inset-0 bg-gradient-to-r ${getStatusGradient()} rounded-full blur-lg opacity-0 group-hover:opacity-30 transition-opacity`}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          <svg className="w-32 h-32 transform -rotate-90 filter drop-shadow-lg">
            {/* Background circle */}
            <circle
              cx="64" cy="64" r="56"
              stroke="#F1F5F9" strokeWidth="12" fill="transparent"
            />
            
            {/* Animated progress circle */}
            <motion.circle
              cx="64" cy="64" r="56"
              stroke={getCircleColor()} strokeWidth="12"
              strokeDasharray={351.86}
              initial={{ strokeDashoffset: 351.86 }}
              animate={{ strokeDashoffset: 351.86 - (351.86 * score) / 100 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span 
              className="text-3xl font-black text-slate-800 tracking-tighter"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              {score}
            </motion.span>
            <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Score</span>
          </div>
        </motion.div>

        {/* Content Section */}
        <div className="flex-1 relative z-10">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <motion.div 
              className={`p-2.5 bg-gradient-to-br ${getStatusGradient()} text-white rounded-2xl shadow-md group-hover:shadow-lg transition-all`}
              whileHover={{ scale: 1.1 }}
            >
              <ShieldCheck size={18} strokeWidth={1.5} />
            </motion.div>
            <div>
              <h3 className={`font-bold text-xl ${getStatusColor()} tracking-tight`}>
                Financial Health
              </h3>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest">{status}</p>
            </div>
          </div>

          {/* Summary Text */}
          <p className="text-sm text-gray-600 leading-relaxed font-medium mb-5">
            {summary}
          </p>

          {/* Strengths & Weaknesses */}
          <motion.div 
            className="flex flex-wrap gap-2.5 mb-5"
            initial={false}
          >
            {strengths.slice(0, 2).map((strength, idx) => (
              <motion.span 
                key={idx} 
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100/50 shadow-sm hover:shadow-md transition-shadow"
                whileHover={{ scale: 1.05 }}
              >
                <TrendingUp size={13} className="flex-shrink-0" />
                {strength}
              </motion.span>
            ))}
            {weaknesses.slice(0, 2).map((weakness, idx) => (
              <motion.span 
                key={idx} 
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-rose-50 to-red-50 text-rose-700 text-xs font-semibold rounded-full border border-rose-100/50 shadow-sm hover:shadow-md transition-shadow"
                whileHover={{ scale: 1.05 }}
              >
                <AlertTriangle size={13} className="flex-shrink-0" />
                {weakness}
              </motion.span>
            ))}
          </motion.div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-600">Overall Progress</span>
              <motion.span 
                className={`text-sm font-bold ${getStatusColor()}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {score}%
              </motion.span>
            </div>
            
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
                animate={{ width: `${score}%` }}
                transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
                className={`h-full rounded-full bg-gradient-to-r ${getStatusGradient()} relative`}
              >
                {/* Shimmer */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['0%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Floating indicator */}
        <motion.div 
          className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          whileHover={{ scale: 1.15, rotate: 8 }}
        >
          <div className={`w-11 h-11 bg-gradient-to-br ${getStatusGradient()} rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white`}>
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            >
              <Star size={18} className="text-white" strokeWidth={1.5} fill="white" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default FinancialHealthCard;
