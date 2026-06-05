import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, BarChart3, Brain, TrendingUp, ArrowRight, RefreshCw, AlertCircle,
  Sparkles, Shield, Clock, Zap, TrendingDown, DollarSign, PieChart,
  ChevronRight, Target, Activity, Award, Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

// Components
import BalanceForecastChart from '../components/Predictions/BalanceForecastChart';
import PredictionCards from '../components/Predictions/PredictionCards';
import ScenarioComparison from '../components/Predictions/ScenarioComparison';
import DailyBreakdownTable from '../components/Predictions/DailyBreakdownTable';
import ConfidenceScore from '../components/Predictions/ConfidenceScore';
import PredictionInsights from '../components/Predictions/PredictionInsights';
import MethodSelector from '../components/Predictions/MethodSelector';
import ComparisonView from '../components/Predictions/ComparisonView';
import Layout from '../components/Layout/Layout';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const METHOD_STYLES = {
  AI: {
    badge: 'bg-purple-50 border-purple-100',
    icon: 'text-purple-600',
    text: 'text-purple-600',
  },
  STATISTICAL: {
    badge: 'bg-blue-50 border-blue-100',
    icon: 'text-blue-600',
    text: 'text-blue-600',
  },
  AUTO: {
    badge: 'bg-orange-50 border-orange-100',
    icon: 'text-orange-600',
    text: 'text-orange-600',
  },
};

const normalizePredictionPayload = (payload) => {
  if (payload?.fallbackResponse) {
    return {
      ...payload.fallbackResponse,
      fallbackUsed: true,
      fallbackError: payload.error,
    };
  }
  return payload;
};

const Predictions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('forecast');
  const [predictionMethod, setPredictionMethod] = useState('AUTO');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 3);
    return date.toISOString().split('T')[0];
  });
  const [prediction, setPrediction] = useState(null);
  const [scenarios, setScenarios] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPrediction = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      
      if (activeTab === 'forecast') {
        const endpoint = predictionMethod === 'STATISTICAL' ? '/predictions/statistical' : 
                        predictionMethod === 'AI' ? '/predictions/ai' : '/predictions/auto';
        
        const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
          params: { startDate, endDate },
          headers: { Authorization: `Bearer ${token}` }
        });
        const normalizedPrediction = normalizePredictionPayload(response.data);
        setPrediction(normalizedPrediction);
        if (normalizedPrediction?.fallbackUsed) {
          setError(`AI prediction was unavailable, so statistical fallback is shown. ${normalizedPrediction.fallbackError || ''}`.trim());
        }
        
      } else if (activeTab === 'scenarios') {
        const months = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24 * 30));
        const response = await axios.get(`${API_BASE_URL}/predictions/scenarios`, {
          params: { months: Math.max(1, months) },
          headers: { Authorization: `Bearer ${token}` }
        });
        setScenarios(response.data.scenarios);
        
      } else if (activeTab === 'compare') {
        const response = await axios.post(`${API_BASE_URL}/predictions/compare`, {
          startDate, endDate
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setComparison(response.data);
      }
      
    } catch (err) {
      console.error('Failed to fetch prediction:', err);
      setError(err.response?.data?.error || 'Failed to load prediction data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction();
  }, [activeTab, predictionMethod, startDate, endDate]);

  const handleDateRangeChange = (days) => {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + days);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const tabs = [
    { id: 'forecast', label: 'Balance Forecast', icon: BarChart3, color: 'blue', description: 'Predict your future balance' },
    { id: 'scenarios', label: 'Best/Worst Cases', icon: TrendingUp, color: 'purple', description: 'Explore possible outcomes' },
    { id: 'compare', label: 'Compare Methods', icon: Brain, color: 'emerald', description: 'AI vs Statistical' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.5, staggerChildren: 0.05 }
    }
  };

  // Get method icon and color
  const getMethodInfo = () => {
    switch(predictionMethod) {
      case 'AI': return { icon: Brain, color: 'purple', label: 'AI Powered' };
      case 'STATISTICAL': return { icon: BarChart3, color: 'blue', label: 'Statistical' };
      default: return { icon: Zap, color: 'orange', label: 'Auto (Hybrid)' };
    }
  };

  const MethodIcon = getMethodInfo().icon;
  const methodStyles = METHOD_STYLES[predictionMethod] || METHOD_STYLES.AUTO;

  return (
    <Layout>
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          
          {/* Header Section - Google Material Style */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">AI Forecasting</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Financial Predictions</h1>
              <p className="text-gray-500 text-sm mt-1">AI-powered forecasts for your financial future</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Method Badge */}
              <div className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border ${methodStyles.badge}`}>
                <MethodIcon size={16} className={methodStyles.icon} />
                <span className={`text-xs font-medium ${methodStyles.text}`}>{getMethodInfo().label}</span>
              </div>
              
              {/* Refresh Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={fetchPrediction}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md shadow-blue-200 hover:shadow-lg transition-all disabled:opacity-50"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                <span className="font-medium">Refresh</span>
              </motion.button>
            </div>
          </div>

          {/* AI Insight Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-indigo-900 to-indigo-800 rounded-2xl p-5 mb-8 text-white relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full -ml-20 -mb-20"></div>
            
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Sparkles size={22} className="text-yellow-300" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-indigo-200 mb-1">AI-Powered Insight</p>
                <p className="text-white text-base leading-relaxed">
                  Our AI analyzes your spending patterns, income trends, and historical data to predict your future balance with <strong className="text-yellow-200">high accuracy</strong>. 
                  Switch between methods to find the best fit for your financial profile.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Date Range Selector - Google Material Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Calendar size={16} className="text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Prediction Period</span>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                {/* Quick select buttons */}
                <div className="flex gap-2">
                  {[
                    { days: 30, label: '1M' },
                    { days: 90, label: '3M' },
                    { days: 180, label: '6M' },
                    { days: 365, label: '1Y' }
                  ].map(option => (
                    <button
                      key={option.days}
                      onClick={() => handleDateRangeChange(option.days)}
                      className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                
                {/* Custom date range */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    />
                  </div>
                  <ArrowRight size={14} className="text-gray-400" />
                  <div className="relative">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs - Google Material Style */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex gap-2 overflow-x-auto pb-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-t-xl transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-white text-gray-900 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon size={18} className={isActive ? `text-${tab.color}-600` : ''} />
                    <span className="font-medium text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 rounded-2xl p-4 flex items-center gap-3 mb-6 border border-red-100"
              >
                <AlertCircle size={20} className="text-red-500" />
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={fetchPrediction}
                  className="ml-auto text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Try Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'forecast' && (
                <div className="space-y-6">
                  <MethodSelector 
                    method={predictionMethod}
                    onMethodChange={setPredictionMethod}
                  />
                  <PredictionCards prediction={prediction} loading={loading} />
                  <BalanceForecastChart 
                    data={prediction?.dailyPredictions} 
                    loading={loading}
                  />
                  <ConfidenceScore 
                    score={prediction?.confidenceScore} 
                    method={prediction?.method}
                    loading={loading}
                  />
                  <DailyBreakdownTable 
                    predictions={prediction?.dailyPredictions}
                    loading={loading}
                  />
                  <PredictionInsights 
                    insights={prediction?.insights}
                    predictedBalance={prediction?.predictedBalance}
                    currentBalance={prediction?.currentBalance}
                    recommendations={prediction?.recommendations}
                    riskFactors={prediction?.riskFactors}
                    loading={loading}
                  />
                </div>
              )}

              {activeTab === 'scenarios' && (
                <ScenarioComparison 
                  scenarios={scenarios} 
                  loading={loading}
                  startDate={startDate}
                  endDate={endDate}
                />
              )}

              {activeTab === 'compare' && (
                <ComparisonView 
                  comparison={comparison}
                  loading={loading}
                  startDate={startDate}
                  endDate={endDate}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
              <Shield size={10} />
              Predictions are based on historical data and may vary from actual outcomes
            </p>
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Predictions;
