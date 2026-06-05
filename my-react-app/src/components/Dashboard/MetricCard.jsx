import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Sparkles, Zap, TrendingUp } from 'lucide-react';

const AnimatedProgressBar = ({ value, duration = 1500, height = "h-2", trigger = true, color = "bg-blue-500", colorGradient = "from-blue-500 to-blue-600" }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (trigger) {
      let start = 0;
      const end = parseFloat(value);
      if (start === end) {
        setDisplayValue(end);
        return;
      }

      const totalFrames = Math.round(duration / 16);
      const increment = (end - start) / totalFrames;
      let currentFrame = 0;

      const timer = setInterval(() => {
        currentFrame++;
        setDisplayValue(prev => {
          const next = start + increment * currentFrame;
          if (currentFrame >= totalFrames) {
            clearInterval(timer);
            return end;
          }
          return next;
        });
      }, 16);

      return () => clearInterval(timer);
    }
  }, [value, duration, trigger]);

  return (
    <div className={`w-full ${height} bg-gradient-to-r from-gray-100 to-gray-50 rounded-full overflow-hidden relative shadow-inner`}>
      {/* Glow effect */}
      <motion.div 
        className={`absolute inset-0 bg-gradient-to-r ${colorGradient} opacity-0 blur-sm`}
        animate={{ opacity: [0, 0.3, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      {/* Main progress bar */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: trigger ? `${Math.min(displayValue, 100)}%` : 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`h-full bg-gradient-to-r ${colorGradient} rounded-full relative`}
      >
        {/* Shimmer effect */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ['0%', '100%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>
    </div>
  );
};

const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = "from-blue-500 to-indigo-500",
  gradientEnd = "to-blue-600",
  trendColor = "from-blue-600 to-blue-500",
  lightBg = "bg-blue-50",
  lightBgHover = "from-blue-50 to-indigo-50",
  trend, 
  trendValue, 
  progress, 
  progressLabel, 
  delay = 0, 
  trigger = true,
  image,
  loading 
}) => {
  const [hoveredCard, setHoveredCard] = useState(false);

  if (loading) {
    return (
      <motion.div 
        className="bg-white p-7 rounded-3xl border border-gray-100 animate-pulse h-64 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="h-14 w-14 bg-gradient-to-br from-gray-200 to-gray-100 rounded-2xl"></div>
          <div className="h-7 w-20 bg-gray-100 rounded-full"></div>
        </div>
        <div className="h-4 w-32 bg-gray-100 rounded mb-3"></div>
        <div className="h-10 w-40 bg-gray-200 rounded mb-6"></div>
        <div className="space-y-2">
          <div className="h-2 w-full bg-gray-100 rounded-full"></div>
          <div className="h-3 w-48 bg-gray-50 rounded"></div>
        </div>
      </motion.div>
    );
  }

  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (title.toLowerCase().includes('rate') || title.toLowerCase().includes('progress')) {
        return `${Math.round(val)}%`;
      }
      return `₹${val.toLocaleString('en-IN')}`;
    }
    return val;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      onMouseEnter={() => setHoveredCard(true)}
      onMouseLeave={() => setHoveredCard(false)}
      className="group relative text-left h-full"
    >
      {/* Glowing background effect on hover */}
      <motion.div 
        className={`absolute -inset-1 bg-gradient-to-r ${color} rounded-3xl opacity-0 blur-xl transition-all duration-500 -z-10`}
        animate={hoveredCard ? { opacity: [0, 0.15, 0.1] } : { opacity: 0 }}
        transition={{ duration: 0.4 }}
      />

      <div className={`relative h-full bg-white rounded-3xl border-2 border-gray-100 p-7 transition-all duration-300 group-hover:shadow-2xl group-hover:border-gray-200 overflow-hidden`}>
        
        {/* Animated gradient overlay on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className={`absolute -top-1/2 -right-1/3 w-2/3 h-full bg-gradient-to-b ${lightBg} rounded-full blur-3xl`} />
        </div>

        {/* Top accent line */}
        <motion.div 
          className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${color} origin-left`}
          initial={{ scaleX: 0 }}
          animate={hoveredCard ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />

        {/* Background Illustration */}
        {image && (
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <img 
              src={image} 
              alt="" 
              className="w-full h-full object-cover opacity-[0.08] group-hover:scale-110 transition-transform duration-700 blur-sm" 
            />
            <div className={`absolute inset-0 bg-gradient-to-br from-white via-white/80 to-blue-50/30`} />
          </div>
        )}

        <div className="relative z-10 flex flex-col h-full">
          {/* Header with icon and trend */}
          <div className="flex justify-between items-start mb-5">
            {/* Icon Container */}
            <motion.div 
              className={`p-3.5 rounded-3xl bg-gradient-to-br ${color} text-white shadow-lg relative group-hover:shadow-2xl transition-all`}
              whileHover={{ rotate: 12, scale: 1.12 }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: delay + 0.15, type: 'spring', stiffness: 100 }}
            >
              <Icon size={24} strokeWidth={1.5} />
            </motion.div>
            
            {/* Trend Badge */}
            {trend && (
              <motion.div 
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                  trend === 'up' 
                    ? 'bg-emerald-50/90 text-emerald-600 border border-emerald-100' 
                    : 'bg-rose-50/90 text-rose-600 border border-rose-100'
                }`}
                whileHover={{ scale: 1.08 }}
              >
                {trend === 'up' ? (
                  <motion.div animate={{ y: [0, -2, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <ArrowUpRight size={13} />
                  </motion.div>
                ) : (
                  <ArrowDownRight size={13} />
                )}
                <span>{trendValue}%</span>
              </motion.div>
            )}
          </div>

          {/* Title and Value Section */}
          <div className="mb-auto">
            <motion.p 
              className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.1 }}
            >
              {title}
            </motion.p>
            <motion.h3 
              className="text-3xl font-bold text-gray-900 tracking-tight leading-tight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: delay + 0.15 }}
            >
              {formatValue(value)}
            </motion.h3>
          </div>

          {/* Progress Section */}
          <div className="mt-auto pt-6">
            {progress !== undefined && (
              <div className="space-y-3">
                <AnimatedProgressBar 
                  value={progress} 
                  trigger={trigger} 
                  color={`bg-blue-500`}
                  colorGradient={color}
                />
                {progressLabel && (
                  <motion.div 
                    className="text-xs text-gray-500 font-medium flex items-center gap-2 line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={false}
                  >
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <Sparkles size={12} className="text-amber-500 flex-shrink-0" />
                    </motion.div>
                    {progressLabel}
                  </motion.div>
                )}
              </div>
            )}

            {/* Floating indicator on hover */}
            <motion.div 
              className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              whileHover={{ scale: 1.15, rotate: 8 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                >
                  <Zap size={16} className="text-blue-600" strokeWidth={2} />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MetricCard;
