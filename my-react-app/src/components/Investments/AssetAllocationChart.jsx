import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChart as PieChartIcon, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Info } from 'lucide-react';

const AssetAllocationChart = ({ allocation, loading }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [hoveredSegment, setHoveredSegment] = useState(null);

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

  // Loading skeleton animation
  const shimmerVariants = {
    initial: { backgroundPosition: "-200% 0" },
    animate: { 
      backgroundPosition: "200% 0",
      transition: { repeat: Infinity, duration: 1.5, ease: "linear" }
    }
  };

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
              <PieChartIcon size={18} className="text-gray-400" />
            </motion.div>
            <motion.div
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
              className="h-5 w-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded bg-[length:200%_100%]"
            />
          </div>
          <div className="space-y-4">
            <motion.div
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
              className="h-64 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded-xl bg-[length:200%_100%]"
            />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  variants={shimmerVariants}
                  initial="initial"
                  animate="animate"
                  className="h-8 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded bg-[length:200%_100%]"
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!allocation || allocation.length === 0) {
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
            <PieChartIcon size={48} className="text-gray-300 mx-auto mb-4" />
          </motion.div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No allocation data</h3>
          <p className="text-gray-500 text-sm mb-6">Add investments to see your asset allocation</p>
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

  // Default colors and icons if backend data is sparse
  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6'];
  
  const getCategoryIcon = (type) => {
    const icons = { 
      'STOCK': '📈', 
      'MUTUAL_FUND': '📊', 
      'FIXED_DEPOSIT': '🏦', 
      'REAL_ESTATE': '🏠', 
      'GOLD': '🥇',
      'CRYPTO': '₿',
      'BONDS': '📜',
      'ETF': '💹'
    };
    return icons[type] || '💰';
  };

  const data = allocation.map((item, index) => ({
    name: item.assetType || item.type || 'Other',
    value: item.amount || item.currentValue || item.value || 0,
    percentage: item.percentage || 0,
    returns: item.returns || item.returnsPercentage || 0,
    icon: item.icon || getCategoryIcon(item.assetType || item.type),
    color: item.color || COLORS[index % COLORS.length]
  })).sort((a, b) => b.value - a.value);

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white px-4 py-3 rounded-xl shadow-lg border border-gray-100 min-w-[200px]"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{data.icon}</span>
            <p className="text-sm font-semibold text-gray-900">{data.name}</p>
          </div>
          <p className="text-xl font-bold text-gray-900">₹{data.value.toLocaleString()}</p>
          <div className="flex items-center justify-between mt-2 text-xs">
            <span className="text-gray-500">{data.percentage}% of portfolio</span>
            <span className={`flex items-center gap-1 ${data.returns >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.returns >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {data.returns > 0 ? '+' : ''}{data.returns}%
            </span>
          </div>
        </motion.div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {payload.map((entry, index) => (
          <motion.div
            key={`legend-${index}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            onMouseEnter={() => setHoveredSegment(entry.payload.name)}
            onMouseLeave={() => setHoveredSegment(null)}
          >
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-gray-600">{entry.value}</span>
          </motion.div>
        ))}
      </div>
    );
  };

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
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <PieChartIcon size={18} className="text-blue-600" />
            </motion.div>
            <h3 className="text-base font-semibold text-gray-900">Asset Allocation</h3>
          </div>
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-right"
            >
              <p className="text-xs text-gray-500">Total Value</p>
              <p className="text-sm font-bold text-gray-900">₹{totalValue.toLocaleString()}</p>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowDetails(!showDetails)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 px-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              labelLine={false}
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  stroke="white"
                  strokeWidth={2}
                  style={{
                    filter: hoveredSegment === entry.name ? 'brightness(0.95)' : 'none',
                    cursor: 'pointer',
                    transition: 'filter 0.2s'
                  }}
                  onMouseEnter={() => setHoveredSegment(entry.name)}
                  onMouseLeave={() => setHoveredSegment(null)}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} verticalAlign="bottom" height={50} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Expandable Details Section */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-gray-100"
          >
            <div className="p-6 pt-0">
              <div className="mt-4 space-y-2">
                {/* Header Row */}
                <div className="flex items-center justify-between text-xs text-gray-400 pb-2 border-b border-gray-100">
                  <span>Asset Class</span>
                  <div className="flex items-center gap-6">
                    <span>Allocation</span>
                    <span>Value</span>
                    <span>Returns</span>
                  </div>
                </div>
                
                {/* Allocation List */}
                {data.map((item, idx) => (
                  <motion.div
                    key={idx}
                    custom={idx}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ 
                      backgroundColor: "#f9fafb",
                      transition: { duration: 0.1 }
                    }}
                    className="flex items-center justify-between text-sm py-2 px-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{item.icon}</span>
                      <span className="text-gray-700 font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      {/* Progress Bar */}
                      <div className="w-24">
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.percentage}%` }}
                            transition={{ duration: 0.8, delay: idx * 0.05 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                        </div>
                      </div>
                      <span className="text-gray-900 font-medium w-24 text-right">
                        ₹{item.value.toLocaleString()}
                      </span>
                      <span className={`flex items-center gap-1 text-xs w-16 justify-end ${
                        item.returns >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.returns >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {item.returns > 0 ? '+' : ''}{item.returns}%
                      </span>
                    </div>
                  </motion.div>
                ))}

                {/* Info Note */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start gap-2"
                >
                  <Info size={14} className="text-blue-600 mt-0.5" />
                  <p className="text-xs text-blue-800">
                    Asset allocation based on current market values. Returns shown are average annual returns.
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AssetAllocationChart;