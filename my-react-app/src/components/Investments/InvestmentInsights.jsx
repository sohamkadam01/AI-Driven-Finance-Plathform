import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, TrendingUp, TrendingDown, Shield, AlertTriangle, 
  CheckCircle, ChevronDown, ChevronUp, Info, Award, 
  BarChart3, Target, Sparkles, ArrowUp, ArrowDown
} from 'lucide-react';

const InvestmentInsights = ({ performance, summary, loading }) => {
  const [expandedSections, setExpandedSections] = useState({
    metrics: true,
    performers: true,
    recommendations: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.3 }
    }
  };

  const cardVariants = {
    hover: { 
      scale: 1.02,
      transition: { duration: 0.2, ease: "easeInOut" }
    },
    tap: { 
      scale: 0.98 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({ 
      opacity: 1, 
      x: 0,
      transition: { delay: i * 0.05, duration: 0.3 }
    })
  };

  const shimmerVariants = {
    initial: { backgroundPosition: "-200% 0" },
    animate: { 
      backgroundPosition: "200% 0",
      transition: { repeat: Infinity, duration: 1.5, ease: "linear" }
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Lightbulb size={18} className="text-yellow-400" />
            </motion.div>
            <motion.div
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
              className="h-5 w-40 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded bg-[length:200%_100%]"
            />
          </div>
          <div className="space-y-4">
            <motion.div
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
              className="h-24 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded-xl bg-[length:200%_100%]"
            />
            <div className="grid grid-cols-2 gap-3">
              {[1, 2].map((i) => (
                <motion.div
                  key={i}
                  variants={shimmerVariants}
                  initial="initial"
                  animate="animate"
                  className="h-20 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded-xl bg-[length:200%_100%]"
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!performance && !summary) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <motion.div 
          className="p-12 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Lightbulb size={48} className="text-gray-300 mx-auto mb-4" />
          </motion.div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No insights available</h3>
          <p className="text-gray-500 text-sm mb-6">Add investments to get personalized insights</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            onClick={() => window.location.href = '/investments'}
          >
            Add Investment
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  const totalReturn = performance?.returnsAnalysis?.totalReturnsPercentage || 0;
  const isPositive = totalReturn >= 0;
  const volatility = performance?.returnsAnalysis?.volatility || 0;
  const sharpeRatio = performance?.returnsAnalysis?.sharpeRatio || 0;
  const totalInvested = summary?.totalInvested || 0;
  const currentValue = summary?.currentValue || 0;
  const totalGain = currentValue - totalInvested;

  const getRiskLevel = (vol) => {
    if (vol < 10) return { label: 'Low', color: 'green', icon: Shield };
    if (vol < 20) return { label: 'Medium', color: 'yellow', icon: AlertTriangle };
    return { label: 'High', color: 'red', icon: TrendingUp };
  };

  const riskInfo = getRiskLevel(volatility);
  const RiskIcon = riskInfo.icon;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
    >
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <Sparkles size={18} className="text-yellow-500" />
            </motion.div>
            <h3 className="text-base font-semibold text-gray-900">AI Insights & Recommendations</h3>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full"
          >
            Powered by AI
          </motion.div>
        </div>

        {/* Overall Insight with animation */}
        {performance?.overallInsight && (
          <motion.div 
            className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-start gap-2">
              <Award size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800 leading-relaxed">{performance.overallInsight}</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Key Metrics Section */}
      <div className="px-6">
        <button
          onClick={() => toggleSection('metrics')}
          className="w-full flex items-center justify-between py-3 text-left"
        >
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Key Metrics</span>
          </div>
          <motion.div
            animate={{ rotate: expandedSections.metrics ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown size={16} className="text-gray-400" />
          </motion.div>
        </button>

        <AnimatePresence>
          {expandedSections.metrics && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-3 mb-6">
                {/* Total Return */}
                <motion.div
                  variants={cardVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100"
                >
                  <div className="flex items-center gap-1 mb-2">
                    {isPositive ? (
                      <TrendingUp size={14} className="text-green-500" />
                    ) : (
                      <TrendingDown size={14} className="text-red-500" />
                    )}
                    <span className="text-xs text-gray-500">Total Return</span>
                  </div>
                  <motion.p 
                    className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {isPositive ? '+' : ''}{totalReturn.toFixed(1)}%
                  </motion.p>
                  <p className="text-xs text-gray-400 mt-1">vs initial investment</p>
                </motion.div>

                {/* Risk Level */}
                <motion.div
                  variants={cardVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100"
                >
                  <div className="flex items-center gap-1 mb-2">
                    <RiskIcon size={14} className={`text-${riskInfo.color}-500`} />
                    <span className="text-xs text-gray-500">Risk Level</span>
                  </div>
                  <p className={`text-2xl font-bold text-${riskInfo.color}-600`}>
                    {riskInfo.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Volatility: {volatility.toFixed(1)}%</p>
                </motion.div>

                {/* Total Value */}
                <motion.div
                  variants={cardVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100"
                >
                  <div className="flex items-center gap-1 mb-2">
                    <Target size={14} className="text-blue-500" />
                    <span className="text-xs text-gray-500">Portfolio Value</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{currentValue.toLocaleString()}
                  </p>
                  <p className={`text-xs mt-1 ${totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalGain >= 0 ? '+' : ''}₹{totalGain.toLocaleString()} gain
                  </p>
                </motion.div>

                {/* Sharpe Ratio */}
                <motion.div
                  variants={cardVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100"
                >
                  <div className="flex items-center gap-1 mb-2">
                    <Award size={14} className="text-purple-500" />
                    <span className="text-xs text-gray-500">Sharpe Ratio</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {sharpeRatio.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {sharpeRatio > 1 ? 'Good risk-adjusted return' : 'Moderate performance'}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Top & Bottom Performers Section */}
      {(performance?.topPerformers?.length > 0 || performance?.bottomPerformers?.length > 0) && (
        <div className="px-6">
          <button
            onClick={() => toggleSection('performers')}
            className="w-full flex items-center justify-between py-3 text-left border-t border-gray-100"
          >
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Portfolio Performance</span>
            </div>
            <motion.div
              animate={{ rotate: expandedSections.performers ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown size={16} className="text-gray-400" />
            </motion.div>
          </button>

          <AnimatePresence>
            {expandedSections.performers && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Top Performers */}
                  {performance?.topPerformers?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <h4 className="text-sm font-semibold text-gray-700">Top Performers</h4>
                      </div>
                      <div className="space-y-2">
                        {performance.topPerformers.slice(0, 3).map((performer, idx) => (
                          <motion.div
                            key={idx}
                            custom={idx}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover={{ scale: 1.02, x: 5 }}
                            className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100"
                          >
                            <div className="flex items-center gap-2">
                              <ArrowUp size={14} className="text-green-500" />
                              <span className="text-sm font-medium text-gray-900">{performer.name}</span>
                            </div>
                            <motion.span 
                              className="text-sm font-bold text-green-600"
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: idx * 0.1 }}
                            >
                              +{performer.returnsPercentage.toFixed(1)}%
                            </motion.span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bottom Performers */}
                  {performance?.bottomPerformers?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <h4 className="text-sm font-semibold text-gray-700">Needs Attention</h4>
                      </div>
                      <div className="space-y-2">
                        {performance.bottomPerformers.slice(0, 3).map((performer, idx) => (
                          <motion.div
                            key={idx}
                            custom={idx}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover={{ scale: 1.02, x: 5 }}
                            className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100"
                          >
                            <div className="flex items-center gap-2">
                              <ArrowDown size={14} className="text-red-500" />
                              <span className="text-sm font-medium text-gray-900">{performer.name}</span>
                            </div>
                            <motion.span 
                              className="text-sm font-bold text-red-600"
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: idx * 0.1 }}
                            >
                              {performer.returnsPercentage.toFixed(1)}%
                            </motion.span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Recommendations Section */}
      {performance?.recommendations?.length > 0 && (
        <div className="px-6 pb-6">
          <button
            onClick={() => toggleSection('recommendations')}
            className="w-full flex items-center justify-between py-3 text-left border-t border-gray-100"
          >
            <div className="flex items-center gap-2">
              <Lightbulb size={16} className="text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">AI Recommendations</span>
            </div>
            <motion.div
              animate={{ rotate: expandedSections.recommendations ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown size={16} className="text-gray-400" />
            </motion.div>
          </button>

          <AnimatePresence>
            {expandedSections.recommendations && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-4 space-y-2">
                  {performance.recommendations.slice(0, 4).map((rec, idx) => (
                    <motion.div
                      key={idx}
                      custom={idx}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ x: 5, backgroundColor: "#f9fafb" }}
                      className="flex items-start gap-3 p-3 rounded-xl transition-colors cursor-pointer"
                    >
                      <motion.div
                        whileHover={{ scale: 1.2 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                      </motion.div>
                      <span className="text-sm text-gray-700 leading-relaxed">{rec}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Info Note */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 p-3 bg-gray-50 rounded-lg flex items-start gap-2"
                >
                  <Info size={14} className="text-gray-400 mt-0.5" />
                  <p className="text-xs text-gray-500">
                    These recommendations are generated by AI based on your portfolio performance and market trends.
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default InvestmentInsights;