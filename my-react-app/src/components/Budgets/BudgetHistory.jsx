import React, { useState, useEffect, useRef } from 'react';
import { Calendar, TrendingUp, TrendingDown, Eye, ChevronRight, Award, Target, PieChart, BarChart3, Clock, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Scroll-Triggered CountUp Animation Component (Preserved)
const CountUp = ({ end, duration = 2000, start = 0, suffix = '', prefix = '', delay = 0, decimals = 0 }) => {
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

  const formattedValue = decimals > 0 
    ? count.toFixed(decimals) 
    : Math.floor(count);

  return (
    <span ref={elementRef}>
      {prefix}
      {formattedValue.toLocaleString()}
      {suffix}
    </span>
  );
};

// Scroll-Triggered Animated Progress Bar Component (Preserved)
const AnimatedProgressBar = ({ value, duration = 1500, height = 'h-2', delay = 0 }) => {
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
    if (value <= 80) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    if (value <= 100) return 'bg-gradient-to-r from-amber-500 to-orange-500';
    return 'bg-gradient-to-r from-red-500 to-rose-500';
  };

  return (
    <div ref={elementRef} className="w-full">
      <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${height}`}>
        <div
          className={`rounded-full transition-all duration-75 ${getColorClass()}`}
          style={{ width: `${Math.min(width, 100)}%`, height: '100%' }}
        />
      </div>
    </div>
  );
};

const BudgetHistory = ({ selectedMonth }) => {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedMonth, setExpandedMonth] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, [selectedMonth]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/budgets/history?months=12`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(response.data.history);
    } catch (err) {
      console.error('Failed to fetch budget history:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleMonthExpand = (index) => {
    setExpandedMonth(expandedMonth === index ? null : index);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden p-6 animate-pulse">
          <div className="h-6 w-40 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-16 bg-gray-200 rounded"></div>
                <div className="h-8 w-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
          <div className="h-64 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!history) {
    return (
      <div className="bg-white rounded-2xl shadow-md overflow-hidden p-12 text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar size={32} className="text-gray-400" />
        </div>
        <h3 className="text-base font-normal text-gray-700 mb-2">No budget history yet</h3>
        <p className="text-gray-500 text-sm">Create budgets to start tracking your history</p>
        <button className="mt-6 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg">
          Create Budget
        </button>
      </div>
    );
  }

  const monthlyHistory = history.monthlyHistory || [];
  const categoryAverages = history.categoryAverages || {};

  const getPerformanceIcon = (utilization) => {
    if (utilization <= 80) return <CheckCircle size={16} className="text-green-600" />;
    if (utilization <= 100) return <AlertTriangle size={16} className="text-amber-600" />;
    return <XCircle size={16} className="text-red-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Hero Stats - Google Material Style */}
      {history.performanceSummary && (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <BarChart3 size={16} className="text-white" />
              </div>
              <h3 className="text-base font-normal text-gray-800">Performance Overview</h3>
            </div>
            <p className="text-sm text-gray-500">12-month budget performance summary</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
                <p className="text-xs font-medium text-blue-700 mb-1">Months Tracked</p>
                <p className="text-2xl font-bold text-blue-700">
                  <CountUp end={history.performanceSummary.totalMonthsTracked || 0} duration={2000} delay={0} />
                </p>
                <p className="text-xs text-blue-600 mt-1">Total period</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
                <p className="text-xs font-medium text-green-700 mb-1">On Track</p>
                <p className="text-2xl font-bold text-green-700">
                  <CountUp end={history.performanceSummary.monthsOnTrack || 0} duration={2000} delay={100} />
                </p>
                <p className="text-xs text-green-600 mt-1">
                  <CountUp 
                    end={(history.performanceSummary.monthsOnTrack / history.performanceSummary.totalMonthsTracked) * 100 || 0} 
                    duration={2000} 
                    suffix="% of time"
                    delay={100}
                    decimals={0}
                  />
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4">
                <p className="text-xs font-medium text-red-700 mb-1">Over Budget</p>
                <p className="text-2xl font-bold text-red-700">
                  <CountUp end={history.performanceSummary.monthsOverBudget || 0} duration={2000} delay={200} />
                </p>
                <p className="text-xs text-red-600 mt-1">Needs improvement</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
                <p className="text-xs font-medium text-purple-700 mb-1">Avg Utilization</p>
                <p className="text-2xl font-bold text-purple-700">
                  <CountUp 
                    end={history.performanceSummary.averageUtilization || 0} 
                    duration={2000} 
                    suffix="%"
                    delay={300}
                    decimals={1}
                  />
                </p>
                <p className="text-xs text-purple-600 mt-1">Overall efficiency</p>
              </div>
            </div>
            
            {/* Best & Worst Months - Google Style */}
            <div className="mt-6 pt-5 border-t border-gray-200 flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex items-center gap-3 bg-green-50 rounded-xl p-3 flex-1">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Award size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-green-700 font-medium">Best Performing Month</p>
                  <p className="text-sm font-semibold text-green-800">{history.performanceSummary.bestMonth || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-red-50 rounded-xl p-3 flex-1">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <TrendingDown size={18} className="text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-red-700 font-medium">Needs Improvement</p>
                  <p className="text-sm font-semibold text-red-800">{history.performanceSummary.worstMonth || '—'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly History Timeline - Google Material Timeline with Cards */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg">
              <Clock size={16} className="text-white" />
            </div>
            <h3 className="text-base font-normal text-gray-800">Monthly History</h3>
          </div>
          <p className="text-sm text-gray-500">Your budget performance month by month</p>
        </div>
        
        <div className="divide-y divide-gray-100">
          {monthlyHistory.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">No monthly data available</p>
            </div>
          ) : (
            monthlyHistory.map((month, idx) => {
              const isExpanded = expandedMonth === idx;
              const utilization = month.overallUtilization;
              const status = utilization <= 80 ? 'On Track' : utilization <= 100 ? 'At Risk' : 'Exceeded';
              const statusColor = utilization <= 80 ? 'text-green-700 bg-green-100' : 
                                  utilization <= 100 ? 'text-amber-700 bg-amber-100' : 'text-red-700 bg-red-100';
              const statusIcon = utilization <= 80 ? <CheckCircle size={12} /> : 
                                 utilization <= 100 ? <AlertTriangle size={12} /> : <XCircle size={12} />;
              
              return (
                <div key={idx} className="hover:bg-gray-50 transition-colors">
                  {/* Month Header */}
                  <button
                    onClick={() => toggleMonthExpand(idx)}
                    className="w-full px-6 py-4 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-105 ${
                        utilization <= 80 ? 'bg-green-100' :
                        utilization <= 100 ? 'bg-amber-100' : 'bg-red-100'
                      }`}>
                        <Calendar size={20} className={
                          utilization <= 80 ? 'text-green-600' :
                          utilization <= 100 ? 'text-amber-600' : 'text-red-600'
                        } />
                      </div>
                      <div className="text-left">
                        <h4 className="font-medium text-gray-800">
                          {new Date(month.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${statusColor}`}>
                            {statusIcon}
                            <span>{status}</span>
                          </div>
                          <span className="text-xs text-gray-400">
                            <CountUp end={month.budgetCount || 0} duration={1500} suffix=" categories" delay={idx * 50} />
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-gray-700">
                          <CountUp end={utilization || 0} duration={1500} suffix="%" delay={idx * 50} decimals={1} />
                        </p>
                        <p className="text-xs text-gray-400">utilization</p>
                      </div>
                      <ChevronRight 
                        size={18} 
                        className={`text-gray-400 transition-all duration-300 ${isExpanded ? 'rotate-90 text-blue-500' : 'group-hover:text-gray-600'}`} 
                      />
                    </div>
                  </button>
                  
                  {/* Expanded Details - Google Material Cards */}
                  {isExpanded && (
                    <div className="px-6 pb-5 pt-3 border-t border-gray-100 bg-gradient-to-b from-gray-50 to-white">
                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-3 mb-5">
                        <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Budgeted</p>
                          <p className="text-base font-semibold text-gray-800">
                            <CountUp 
                              end={month.totalBudget || 0} 
                              duration={1500} 
                              prefix="₹"
                              delay={idx * 50 + 100}
                            />
                          </p>
                        </div>
                        <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Spent</p>
                          <p className="text-base font-semibold text-gray-800">
                            <CountUp 
                              end={month.totalSpent || 0} 
                              duration={1500} 
                              prefix="₹"
                              delay={idx * 50 + 200}
                            />
                          </p>
                        </div>
                        <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Remaining</p>
                          <p className={`text-base font-semibold ${month.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            <CountUp 
                              end={Math.abs(month.remaining || 0)} 
                              duration={1500} 
                              prefix={month.remaining >= 0 ? "₹" : "-₹"}
                              delay={idx * 50 + 300}
                            />
                          </p>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mb-5">
                        <div className="flex justify-between text-xs text-gray-500 mb-2">
                          <span className="font-medium">Budget Utilization</span>
                          <span className="font-semibold">
                            <CountUp 
                              end={utilization || 0} 
                              duration={1500} 
                              suffix="%"
                              delay={idx * 50 + 400}
                              decimals={1}
                            />
                          </span>
                        </div>
                        <AnimatedProgressBar 
                          value={utilization || 0}
                          duration={1500}
                          height="h-2.5"
                          delay={idx * 50 + 450}
                        />
                      </div>
                      
                      {/* Category Breakdown */}
                      {month.categoryDetails && month.categoryDetails.length > 0 && (
                        <div className="mb-5">
                          <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-2">
                            <PieChart size={12} />
                            Category Breakdown
                          </p>
                          <div className="space-y-2.5 bg-white rounded-xl p-3 border border-gray-100">
                            {month.categoryDetails.slice(0, 5).map((cat, catIdx) => (
                              <div key={catIdx} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <span className="text-base flex-shrink-0">{cat.categoryIcon || '📊'}</span>
                                  <span className="text-gray-700 truncate">{cat.categoryName}</span>
                                </div>
                                <div className="flex items-center gap-3 ml-4">
                                  <span className="text-gray-600 text-sm font-medium">
                                    <CountUp 
                                      end={cat.spent || 0} 
                                      duration={1200} 
                                      prefix="₹"
                                      delay={idx * 50 + 500 + (catIdx * 50)}
                                    />
                                  </span>
                                  <span className={`text-xs font-medium w-12 text-right ${
                                    cat.percentageUsed <= 80 ? 'text-green-600' :
                                    cat.percentageUsed <= 100 ? 'text-amber-600' : 'text-red-600'
                                  }`}>
                                    <CountUp 
                                      end={cat.percentageUsed || 0} 
                                      duration={1200} 
                                      suffix="%"
                                      delay={idx * 50 + 500 + (catIdx * 50)}
                                      decimals={0}
                                    />
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                          {month.categoryDetails.length > 5 && (
                            <p className="text-xs text-gray-400 mt-2 pl-2">
                              +{month.categoryDetails.length - 5} more categories
                            </p>
                          )}
                        </div>
                      )}
                      
                      {/* Summary Stats - Google Chip Style */}
                      <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-200">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 rounded-full">
                          <CheckCircle size={12} className="text-green-600" />
                          <span className="text-xs font-medium text-green-700">
                            <CountUp end={month.budgetCount - month.exceededCount - month.atRiskCount || 0} duration={1000} delay={idx * 50 + 600} /> on track
                          </span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 rounded-full">
                          <AlertTriangle size={12} className="text-amber-600" />
                          <span className="text-xs font-medium text-amber-700">
                            <CountUp end={month.atRiskCount || 0} duration={1000} delay={idx * 50 + 650} /> at risk
                          </span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 rounded-full">
                          <XCircle size={12} className="text-red-600" />
                          <span className="text-xs font-medium text-red-700">
                            <CountUp end={month.exceededCount || 0} duration={1000} delay={idx * 50 + 700} /> exceeded
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Category Averages - Google Material Cards */}
      {Object.keys(categoryAverages).length > 0 && (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                <PieChart size={16} className="text-white" />
              </div>
              <h3 className="text-base font-normal text-gray-800">Category Averages</h3>
            </div>
            <p className="text-sm text-gray-500">Average monthly spending by category (last 3 months)</p>
          </div>
          
          <div className="divide-y divide-gray-100">
            {Object.entries(categoryAverages)
              .sort(([, a], [, b]) => b - a)
              .map(([category, amount], idx) => {
                const colors = ['from-blue-500 to-cyan-500', 'from-purple-500 to-pink-500', 'from-green-500 to-emerald-500', 'from-orange-500 to-red-500', 'from-teal-500 to-green-500'];
                const colorIdx = idx % colors.length;
                return (
                  <div key={category} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${colors[colorIdx]} rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-110 transition-transform`}>
                        {category.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{category}</span>
                    </div>
                    <span className="text-base font-semibold text-gray-800">
                      <CountUp 
                        end={amount || 0} 
                        duration={1500} 
                        prefix="₹"
                        delay={idx * 100}
                      />
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Empty State for Category Averages */}
      {Object.keys(categoryAverages).length === 0 && monthlyHistory.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md p-10 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Target size={28} className="text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">Category averages will appear once you have 3 months of data</p>
        </div>
      )}
    </div>
  );
};

export default BudgetHistory;