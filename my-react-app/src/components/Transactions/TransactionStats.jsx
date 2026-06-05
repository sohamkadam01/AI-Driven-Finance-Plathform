import React, { useState, useEffect, useRef } from 'react';
import { Wallet, TrendingUp, TrendingDown, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

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

const TransactionStats = ({ transactions, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
            <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
            <div className="h-6 w-24 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const totalIncome = transactions
    ?.filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

  const totalExpense = transactions
    ?.filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

  const totalTransactions = transactions?.length || 0;
  const avgTransaction = totalTransactions > 0 ? (totalIncome + totalExpense) / totalTransactions : 0;

  const stats = [
    {
      title: 'Total Income',
      value: totalIncome,
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
      prefix: '₹',
      suffix: '',
      delay: 0
    },
    {
      title: 'Total Expenses',
      value: totalExpense,
      icon: TrendingDown,
      color: 'text-red-600',
      bg: 'bg-red-50',
      prefix: '₹',
      suffix: '',
      delay: 100
    },
    {
      title: 'Total Transactions',
      value: totalTransactions,
      icon: Wallet,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      prefix: '',
      suffix: '',
      delay: 200
    },
    {
      title: 'Average Transaction',
      value: avgTransaction,
      icon: Calendar,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      prefix: '₹',
      suffix: '',
      delay: 300
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <div 
          key={idx} 
          className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-lg transition-shadow duration-300"
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-lg ${stat.bg}`}>
              <stat.icon size={16} className={stat.color} />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">
            <CountUp 
              end={stat.value} 
              duration={2000} 
              prefix={stat.prefix}
              suffix={stat.suffix}
              delay={stat.delay}
            />
          </p>
          <p className="text-xs text-gray-500 mt-1">{stat.title}</p>
        </div>
      ))}
    </div>
  );
};

export default TransactionStats;