import React, { useState, useEffect, useRef } from 'react';
import { Wallet, TrendingUp, TrendingDown, Target, DollarSign, PieChart, CheckCircle, AlertCircle } from 'lucide-react';

// Scroll-Triggered CountUp Animation Component
const CountUp = ({ end, duration = 2000, start = 0, suffix = '', prefix = '', delay = 0 }) => {
  const [count, setCount] = useState(start);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          
          setTimeout(() => {
            let startTime = null;
            let animationFrame = null;
            
            const animate = (currentTime) => {
              if (!startTime) startTime = currentTime;
              const progress = Math.min((currentTime - startTime) / duration, 1);
              const easeOutCubic = 1 - Math.pow(1 - progress, 3);
              const currentCount = start + (end - start) * easeOutCubic;
              setCount(currentCount);
              
              if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
              } else {
                setCount(end);
              }
            };
            
            animationFrame = requestAnimationFrame(animate);
            
            return () => {
              if (animationFrame) {
                cancelAnimationFrame(animationFrame);
              }
            };
          }, delay);
        }
      },
      { threshold: 0.1, triggerOnce: true }
    );
    
    if (elementRef.current) {
      observer.observe(elementRef.current);
    }
    
    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [end, start, duration, hasAnimated, delay]);

  return (
    <span ref={elementRef}>
      {prefix}
      {Math.floor(count).toLocaleString()}
      {suffix}
    </span>
  );
};

// Scroll-Triggered Animated Progress Bar Component
const AnimatedProgressBar = ({ value, color, duration = 1500, height = 'h-1.5', delay = 0 }) => {
  const [width, setWidth] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          
          setTimeout(() => {
            let startTime = null;
            let animationFrame = null;
            
            const animate = (currentTime) => {
              if (!startTime) startTime = currentTime;
              const progress = Math.min((currentTime - startTime) / duration, 1);
              const easeOutCubic = 1 - Math.pow(1 - progress, 3);
              const currentWidth = value * easeOutCubic;
              setWidth(currentWidth);
              
              if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
              } else {
                setWidth(value);
              }
            };
            
            animationFrame = requestAnimationFrame(animate);
            
            return () => {
              if (animationFrame) {
                cancelAnimationFrame(animationFrame);
              }
            };
          }, delay);
        }
      },
      { threshold: 0.1, triggerOnce: true }
    );
    
    if (elementRef.current) {
      observer.observe(elementRef.current);
    }
    
    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [value, duration, hasAnimated, delay]);

  const getColorClass = () => {
    if (color) return color;
    if (value <= 70) return 'bg-green-500';
    if (value <= 90) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div ref={elementRef} className="w-full">
      <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${height}`}>
        <div
          className={`rounded-full transition-all duration-75 ${getColorClass()}`}
          style={{ width: `${width}%`, height: '100%' }}
        />
      </div>
    </div>
  );
};

const BudgetSummary = ({ summary, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl"></div>
              <div className="w-16 h-4 bg-gray-100 rounded"></div>
            </div>
            <div className="h-8 w-24 bg-gray-100 rounded mb-2"></div>
            <div className="h-3 w-20 bg-gray-100 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!summary) return null;

  const getUtilizationStatus = (percentage) => {
    if (percentage <= 70) return { text: 'Healthy', color: 'text-green-600', bg: 'bg-green-50' };
    if (percentage <= 90) return { text: 'Moderate', color: 'text-amber-600', bg: 'bg-amber-50' };
    return { text: 'High', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const utilizationStatus = getUtilizationStatus(summary.overallPercentage || 0);

  const summaryCards = [
    {
      title: 'Total Budget',
      value: summary.totalBudget || 0,
      subtitle: 'Monthly limit',
      icon: Wallet,
      trend: null,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      prefix: '₹',
      suffix: '',
      delay: 0
    },
    {
      title: 'Total Spent',
      value: summary.totalSpent || 0,
      subtitle: 'Out of budget',
      icon: TrendingDown,
      trend: summary.totalSpent > summary.totalBudget ? 'exceeded' : 'within',
      color: summary.totalSpent > summary.totalBudget ? 'text-red-600' : 'text-amber-600',
      bg: summary.totalSpent > summary.totalBudget ? 'bg-red-50' : 'bg-amber-50',
      iconBg: summary.totalSpent > summary.totalBudget ? 'bg-red-100' : 'bg-amber-100',
      prefix: '₹',
      suffix: '',
      delay: 100
    },
    {
      title: 'Remaining',
      value: summary.remaining || 0,
      subtitle: 'Left to spend',
      icon: Target,
      trend: summary.remaining > 0 ? 'positive' : 'negative',
      color: summary.remaining > 0 ? 'text-green-600' : 'text-red-600',
      bg: summary.remaining > 0 ? 'bg-green-50' : 'bg-red-50',
      iconBg: summary.remaining > 0 ? 'bg-green-100' : 'bg-red-100',
      prefix: '₹',
      suffix: '',
      delay: 200
    },
    {
      title: 'Utilization',
      value: summary.overallPercentage || 0,
      subtitle: utilizationStatus.text,
      icon: PieChart,
      trend: summary.overallPercentage,
      color: utilizationStatus.color,
      bg: utilizationStatus.bg,
      iconBg: utilizationStatus.bg.replace('bg-', 'bg-').replace('50', '100'),
      prefix: '',
      suffix: '%',
      delay: 300
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {summaryCards.map((card, idx) => (
        <div 
          key={idx} 
          className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
        >
          <div className="p-5">
            {/* Header with Icon */}
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center transition-transform group-hover:scale-105`}>
                <card.icon size={18} className={card.color} />
              </div>
              {card.trend && typeof card.trend === 'string' && (
                <div className={`text-xs px-2 py-0.5 rounded-full ${card.bg} ${card.color}`}>
                  {card.trend === 'exceeded' ? 'Exceeded' : card.trend === 'within' ? 'Within' : card.trend === 'positive' ? 'Surplus' : 'Deficit'}
                </div>
              )}
            </div>
            
            {/* Value with Counter Animation */}
            <div className="mb-1">
              <p className="text-2xl font-semibold text-gray-900 tracking-tight">
                <CountUp 
                  end={card.value} 
                  duration={2000} 
                  prefix={card.prefix}
                  suffix={card.suffix}
                  delay={card.delay}
                />
              </p>
            </div>
            
            {/* Title and Subtitle */}
            <div>
              <p className="text-sm font-medium text-gray-700">{card.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{card.subtitle}</p>
            </div>
          </div>
          
          {/* Progress Bar for Utilization Card */}
          {card.title === 'Utilization' && (
            <div className="px-5 pb-5">
              <AnimatedProgressBar 
                value={summary.overallPercentage || 0}
                duration={1500}
                height="h-1.5"
                delay={350}
              />
            </div>
          )}
          
          {/* Trend Indicator for Spent */}
          {card.title === 'Total Spent' && summary.totalBudget > 0 && (
            <div className="px-5 pb-5">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <AnimatedProgressBar 
                    value={(summary.totalSpent / summary.totalBudget) * 100}
                    duration={1500}
                    height="h-1.5"
                    delay={150}
                    color="bg-amber-500"
                  />
                </div>
                <span className="text-xs text-gray-400">
                  <CountUp 
                    end={(summary.totalSpent / summary.totalBudget) * 100}
                    duration={1500}
                    suffix="%"
                    delay={150}
                  />
                </span>
              </div>
            </div>
          )}
          
          {/* Remaining Percentage */}
          {card.title === 'Remaining' && summary.totalBudget > 0 && (
            <div className="px-5 pb-5">
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-green-500" />
                <span className="text-xs text-gray-500">
                  <CountUp 
                    end={(summary.remaining / summary.totalBudget) * 100}
                    duration={1500}
                    suffix="% of budget left"
                    delay={250}
                  />
                </span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Compact Google Material Style with Counter Animations
export const CompactBudgetSummary = ({ summary, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
            <div className="h-4 w-16 bg-gray-200 rounded mb-2"></div>
            <div className="h-7 w-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Total Budget */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow duration-200">
        <p className="text-xs text-gray-500 mb-1">Total Budget</p>
        <p className="text-xl font-semibold text-gray-900">
          <CountUp end={summary.totalBudget || 0} duration={2000} prefix="₹" delay={0} />
        </p>
      </div>
      
      {/* Total Spent */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow duration-200">
        <p className="text-xs text-gray-500 mb-1">Total Spent</p>
        <p className="text-xl font-semibold text-amber-600">
          <CountUp end={summary.totalSpent || 0} duration={2000} prefix="₹" delay={100} />
        </p>
      </div>
      
      {/* Remaining */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow duration-200">
        <p className="text-xs text-gray-500 mb-1">Remaining</p>
        <p className={`text-xl font-semibold ${summary.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          <CountUp end={summary.remaining || 0} duration={2000} prefix="₹" delay={200} />
        </p>
      </div>
      
      {/* Utilization */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow duration-200">
        <p className="text-xs text-gray-500 mb-1">Utilization</p>
        <div className="flex items-center gap-2">
          <p className={`text-xl font-semibold ${
            summary.overallPercentage <= 70 ? 'text-green-600' :
            summary.overallPercentage <= 90 ? 'text-amber-600' : 'text-red-600'
          }`}>
            <CountUp end={summary.overallPercentage || 0} duration={2000} suffix="%" delay={300} />
          </p>
          <div className="flex-1">
            <AnimatedProgressBar 
              value={summary.overallPercentage || 0}
              duration={1500}
              height="h-1.5"
              delay={350}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetSummary;