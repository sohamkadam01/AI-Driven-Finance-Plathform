import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const NetWorthChart = ({ data, loading }) => {
  const [range, setRange] = useState('6M');

  // Handle data structure - support both array and nested trendData
  // MOVED THIS BEFORE ANY CONDITIONAL RETURNS
  const allData = useMemo(() => {
    return Array.isArray(data) ? data : (data?.trendData || []);
  }, [data]);

  // Filter data based on selected range - MOVED BEFORE CONDITIONAL RETURNS
  const chartData = useMemo(() => {
    if (!allData.length) return [];
    
    const now = new Date();
    let monthsToShow = 6; // default 6M
    
    switch(range) {
      case '1M': monthsToShow = 1; break;
      case '3M': monthsToShow = 3; break;
      case '6M': monthsToShow = 6; break;
      case '1Y': monthsToShow = 12; break;
      case 'ALL': return allData;
      default: monthsToShow = 6;
    }
    
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsToShow);
    
    return allData.filter(item => new Date(item.date) >= cutoffDate);
  }, [allData, range]);

  // Calculate statistics - MOVED BEFORE CONDITIONAL RETURNS
  const stats = useMemo(() => {
    const current = chartData.length > 0 ? (chartData[chartData.length - 1]?.netWorth || 0) : 0;
    const initial = chartData.length > 0 ? (chartData[0]?.netWorth || 0) : 0;
    const highest = chartData.length > 0 ? Math.max(...chartData.map(d => d.netWorth || 0)) : 0;
    const lowest = chartData.length > 0 ? Math.min(...chartData.map(d => d.netWorth || 0)) : 0;
    const totalChange = current - initial;
    const percentChange = initial !== 0 ? (totalChange / initial) * 100 : 0;
    
    return { current, initial, highest, lowest, totalChange, percentChange };
  }, [chartData]);

  // NOW conditional returns can happen AFTER all hooks
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-6 w-32 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-48 bg-gray-200 rounded mb-6"></div>
            <div className="h-64 bg-gray-100 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="p-6 text-center">
          <p className="text-sm text-gray-500">No net worth data available</p>
          <p className="text-xs text-gray-400 mt-1">Add transactions to see your net worth trend</p>
        </div>
      </div>
    );
  }

  // Format Y-axis values with proper Indian currency format
  const formatYAxis = (value) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
    return `₹${value}`;
  };

  // Format X-axis dates
  const formatXAxis = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short' });
  };

  // Custom tooltip with detailed information
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const date = new Date(label);
      
      return (
        <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">
            {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <p className="text-lg font-medium text-gray-900">
            ₹{value.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-gray-400 mt-1">Net Worth</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100">
      {/* Header */}
      <div className="px-6 pt-6 pb-3 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-base font-medium text-gray-900">Net Worth</h3>
            <p className="text-sm text-gray-500 mt-0.5">Track your wealth over time</p>
          </div>
          
          {/* Range selector */}
          <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
            {['1M', '3M', '6M', '1Y', 'ALL'].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`
                  px-3 py-1.5 text-sm font-normal rounded-md transition-all
                  ${range === r 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="px-6 pt-4 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-medium text-gray-900">
              ₹{stats.current.toLocaleString('en-IN')}
            </span>
            <span className={`text-sm font-medium ${stats.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.percentChange >= 0 ? '↑' : '↓'} {Math.abs(stats.percentChange).toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>High: ₹{stats.highest.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span>Low: ₹{stats.lowest.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="px-2 pb-2">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 50, bottom: 10 }}>
              <defs>
                <linearGradient id="googleGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1a73e8" stopOpacity={0.12}/>
                  <stop offset="100%" stopColor="#1a73e8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid 
                strokeDasharray="4 4" 
                vertical={false} 
                stroke="#e8eaed" 
              />
              
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#5f6368', fontSize: 11, fontWeight: 400}}
                dy={10}
                tickFormatter={formatXAxis}
                minTickGap={30}
              />
              
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#5f6368', fontSize: 11, fontWeight: 400}}
                tickFormatter={formatYAxis}
                width={55}
                domain={['auto', 'auto']}
              />
              
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#dadce0', strokeWidth: 1 }} />
              
              <Area 
                type="monotone" 
                dataKey="netWorth" 
                stroke="#1a73e8" 
                strokeWidth={2} 
                fill="url(#googleGradient)" 
                animationDuration={1000}
                dot={false}
                activeDot={{ r: 4, fill: '#1a73e8', stroke: 'white', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer with key metrics */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 rounded-b-xl">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500">Period Start</p>
            <p className="text-sm font-medium text-gray-900">
              ₹{stats.initial.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-gray-400">
              {chartData[0]?.date ? new Date(chartData[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Period End</p>
            <p className="text-sm font-medium text-gray-900">
              ₹{stats.current.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-gray-400">
              {chartData[chartData.length - 1]?.date ? new Date(chartData[chartData.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Change</p>
            <p className={`text-sm font-medium ${stats.totalChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.totalChange >= 0 ? '+' : ''}₹{Math.abs(stats.totalChange).toLocaleString('en-IN')}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">% Change</p>
            <p className={`text-sm font-medium ${stats.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.percentChange >= 0 ? '+' : ''}{stats.percentChange.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetWorthChart;