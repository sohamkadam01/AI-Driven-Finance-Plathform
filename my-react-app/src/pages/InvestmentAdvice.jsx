import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Zap, TrendingUp, PieChart, Target, AlertCircle, Loader2,
  ChevronRight, Info, Sparkles, Download, Share2, Shield, Clock, 
  DollarSign, BarChart3, ArrowRight, CheckCircle2, Lightbulb,
  Layers, LineChart, Activity, Award, Calendar, Wallet, Briefcase,
  Globe, Star, RefreshCw, Gauge, TrendingDown, CircleDot, Percent,
  AlertTriangle, Eye, ArrowUpRight
} from 'lucide-react';
import Layout from '../components/Layout/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PieChart as RePieChart, Pie, Cell, ResponsiveContainer, 
  Tooltip, LineChart as ReLineChart, Line, 
  CartesianGrid, XAxis, YAxis, Legend
} from 'recharts';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const ADVICE_TIMEOUT_MS = 120000;

const withTimeout = (promise, ms) => {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('AI_TIMEOUT')), ms);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
};

const SectionHeader = ({ title, description, accentClass, titleClass }) => (
  <div className="mb-4 flex items-center justify-between gap-4 px-1">
    <div className="flex-1">
      <div className="mb-1.5 flex items-center gap-3">
        <motion.div
          className={`h-7 w-1.5 rounded-full shadow-lg ${accentClass}`}
          animate={{ scaleY: [1, 1.18, 1] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <h3 className={`bg-clip-text text-xl font-bold tracking-tight text-transparent ${titleClass}`}>
          {title}
        </h3>
      </div>
      {description && (
        <p className="ml-5 text-sm font-semibold leading-relaxed text-slate-600 dark:text-slate-400">
          {description}
        </p>
      )}
    </div>
  </div>
);

const InvestmentAdvice = () => {
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('projection'); // 'projection' or 'performance'
  const [selectedMethod, setSelectedMethod] = useState('');
  const [analysisSeconds, setAnalysisSeconds] = useState(0);
  
  const [formData, setFormData] = useState({
    riskTolerance: 5,
    investmentHorizon: 10,
    monthlyInvestmentCapacity: 5000,
    goal: 'WEALTH_GROWTH'
  });

  const requestAdvice = async (method) => {
    const token = localStorage.getItem('token');
    return axios.post(`${API_BASE_URL}/investments/advice/${method}`,
      formData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  const fetchAdvice = async (method = selectedMethod) => {
    if (!method) {
      setError('Please select an advice engine first.');
      return;
    }

    setLoading(true);
    setError(null);
    setAdvice(null);
    try {
      const response = method === 'RULE'
        ? await requestAdvice(method)
        : await withTimeout(requestAdvice(method), ADVICE_TIMEOUT_MS);
      setAdvice(response.data);
    } catch (err) {
      if (method !== 'RULE') {
        try {
          const fallbackResponse = await requestAdvice('RULE');
          setAdvice(fallbackResponse.data);
          setError(err?.message === 'AI_TIMEOUT'
            ? 'AI took longer than 120 seconds, so rule based advice is shown.'
            : 'AI advice is unavailable, so rule based advice is shown.');
          return;
        } catch (fallbackErr) {
          setError(fallbackErr.response?.data?.error || 'AI failed and rule based fallback also failed.');
          return;
        }
      }

      setError(err.response?.data?.error || 'Failed to fetch investment advice');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      setAnalysisSeconds(0);
      return undefined;
    }

    const timer = setInterval(() => {
      setAnalysisSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [loading]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'goal' ? value : parseFloat(value)
    }));
  };

  // Resolve risk details dynamically from actual response risk profile
  const getRiskProfileDetails = (profileStr) => {
    const p = String(profileStr || '').toUpperCase();
    if (p.includes('AGGRESSIVE')) {
      return { text: profileStr || 'Aggressive', color: 'rose', icon: Zap, bg: 'bg-rose-500/10', textStyle: 'text-rose-500', border: 'border-rose-500/20' };
    }
    if (p.includes('CONSERVATIVE')) {
      return { text: profileStr || 'Conservative', color: 'emerald', icon: Shield, bg: 'bg-emerald-500/10', textStyle: 'text-emerald-500', border: 'border-emerald-500/20' };
    }
    return { text: profileStr || 'Moderate', color: 'blue', icon: BarChart3, bg: 'bg-blue-500/10', textStyle: 'text-blue-500', border: 'border-blue-500/20' };
  };

  const adviceRisk = getRiskProfileDetails(advice?.riskProfile);
  const RiskIcon = adviceRisk.icon;

  const getAdviceMethodDetails = (method) => {
    const normalized = String(method || '').toUpperCase();
    if (normalized === 'AI') {
      return {
        label: 'AI Generated',
        description: 'Generated by the AI advisor engine',
        icon: Sparkles,
        className: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:text-indigo-300',
      };
    }

    return {
      label: 'Rule Based',
      description: 'Generated by the built-in fallback rules',
      icon: Shield,
      className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-300',
    };
  };

  const adviceMethod = getAdviceMethodDetails(advice?.methodUsed);
  const MethodIcon = adviceMethod.icon;

  const goals = [
    { value: 'WEALTH_GROWTH', label: 'Wealth Growth', icon: TrendingUp, description: 'Maximize long-term returns' },
    { value: 'RETIREMENT', label: 'Retirement Planning', icon: Clock, description: 'Secure your golden years' },
    { value: 'TAX_SAVING', label: 'Tax Saving', icon: Shield, description: 'Optimize tax efficiency' },
    { value: 'CAPITAL_PRESERVATION', label: 'Capital Preservation', icon: Shield, description: 'Protect your principal' },
    { value: 'EDUCATION', label: 'Education Fund', icon: Target, description: 'Save for education' }
  ];

  const adviceMethods = [
    { value: 'auto', label: 'Auto', description: 'Try AI first, then fallback' },
    { value: 'AI', label: 'AI', description: 'Force AI attempt' },
    { value: 'RULE', label: 'Rule', description: 'Use rule engine only' },
  ];

  const getAnalysisTimeLimit = () => {
    if (selectedMethod === 'RULE') return 10;
    return 120;
  };

  const analysisTimeLimit = getAnalysisTimeLimit();
  const analysisProgress = Math.min(100, (analysisSeconds / analysisTimeLimit) * 100);
  const remainingAnalysisSeconds = Math.max(0, analysisTimeLimit - analysisSeconds);

  // Dynamic portfolio allocation from backend real-time advice
  const portfolioData = advice?.portfolioAllocation?.map((alloc, idx) => ({
    name: alloc.assetClass,
    value: parseFloat(alloc.percentage || 0),
    examples: alloc.examples
  })) || [];

  // Year-by-year projections parsed directly from advice.projectedGrowth real data!
  const getProjectionChartData = () => {
    if (!advice?.projectedGrowth) return [];
    const data = [];
    const horizon = formData.investmentHorizon;
    for (let i = 1; i <= horizon; i++) {
      const key = `year${i}`;
      if (advice.projectedGrowth[key] !== undefined) {
        data.push({
          year: `Yr ${i}`,
          'Future Wealth': Math.round(parseFloat(advice.projectedGrowth[key])),
          'Invested Capital': Math.round(parseFloat(formData.monthlyInvestmentCapacity) * 12 * i)
        });
      }
    }
    return data;
  };

  const projectionData = getProjectionChartData();

  // Dynamic recommendations from backend
  const recommendationsList = advice?.recommendations || [];

  // Parse written summary to strip out repetitive bullet lists and render as clean introductory paragraphs
  const getIntroductionText = () => {
    if (!advice?.summary) return 'Setting up your customized investment matrix...';
    // Take first paragraph before the "Current Financial Health:" text
    const idx = advice.summary.indexOf('Current Financial Health:');
    if (idx !== -1) {
      return advice.summary.substring(0, idx).trim();
    }
    return advice.summary;
  };

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3, staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-5 bg-blue-600 rounded-full"></div>
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Investment Strategy Center</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Smart Portfolio Architect</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Real-time wealth compounding simulations powered by autonomous AI engines.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Input Panel - 4 cols */}
              <motion.div variants={itemVariants} className="lg:col-span-4">
                <SectionHeader
                  title="Strategy Inputs"
                  description="Tune risk, horizon, monthly capital, and financial goals"
                  accentClass="bg-gradient-to-b from-blue-500 to-indigo-500 shadow-blue-500/25"
                  titleClass="bg-gradient-to-r from-slate-950 to-blue-700 dark:from-white dark:to-blue-300"
                />
                <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-gray-150 dark:border-slate-800 shadow-sm overflow-hidden sticky top-24">
                  <div className="p-5 border-b border-gray-150 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-600 text-white rounded-xl shadow-md">
                        <Target size={18} />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-gray-950 dark:text-white text-sm">Strategic Parameters</h3>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500">Fine-tune your wealth criteria</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 space-y-6">
                    {/* Risk Tolerance */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Stated Risk Tolerance</label>
                        <div className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${adviceRisk.bg} ${adviceRisk.textStyle} border ${adviceRisk.border}`}>
                          {adviceRisk.text}
                        </div>
                      </div>
                      <input 
                        type="range" 
                        name="riskTolerance"
                        min="1" max="10" step="1"
                        value={formData.riskTolerance}
                        onChange={handleInputChange}
                        className="w-full h-1.5 bg-gray-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <div className="flex justify-between mt-2 text-[10px] text-gray-400 dark:text-gray-500 font-semibold uppercase">
                        <span>Conservative</span>
                        <span>Moderate</span>
                        <span>Aggressive</span>
                      </div>
                    </div>

                    {/* Investment Horizon */}
                    <div>
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2 block">Investment Horizon</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="range" 
                          name="investmentHorizon"
                          min="1" max="40" step="1"
                          value={formData.investmentHorizon}
                          onChange={handleInputChange}
                          className="flex-1 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="bg-slate-50 dark:bg-slate-900 border border-gray-150 dark:border-slate-850 px-3 py-1.5 rounded-xl min-w-[70px] text-center shadow-inner">
                          <span className="font-extrabold text-gray-900 dark:text-white text-sm">{formData.investmentHorizon}</span>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold ml-0.5">Yrs</span>
                        </div>
                      </div>
                    </div>

                    {/* Monthly Investment */}
                    <div>
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2 block">Monthly Capital Allocation</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm font-bold">₹</span>
                        <input 
                          type="number" 
                          name="monthlyInvestmentCapacity"
                          value={formData.monthlyInvestmentCapacity}
                          onChange={handleInputChange}
                          className="w-full pl-7 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Goal Selection */}
                    <div>
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2 block">Primary Financial Target</label>
                      <div className="space-y-2">
                        {goals.map(goal => (
                          <button
                            key={goal.value}
                            onClick={() => setFormData(prev => ({ ...prev, goal: goal.value }))}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                              formData.goal === goal.value
                                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10'
                                : 'border-gray-150 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700 hover:bg-slate-50/30 dark:hover:bg-slate-900/30'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              formData.goal === goal.value ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400'
                            }`}>
                              <goal.icon size={15} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-950 dark:text-white leading-normal">{goal.label}</p>
                              <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-normal truncate">{goal.description}</p>
                            </div>
                            {formData.goal === goal.value && <CheckCircle2 size={14} className="text-blue-600" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Advice Method */}
                    <div>
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2 block">Advice Engine</label>
                      <div className="grid grid-cols-3 gap-2">
                        {adviceMethods.map(method => (
                          <button
                            key={method.value}
                            type="button"
                            onClick={() => setSelectedMethod(method.value)}
                            title={method.description}
                            className={`rounded-xl border px-2 py-2 text-xs font-black transition-all ${
                              selectedMethod === method.value
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300'
                                : 'border-gray-150 text-gray-500 hover:border-gray-300 dark:border-slate-800 dark:text-gray-400 dark:hover:border-slate-700'
                            }`}
                          >
                            {method.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Generate Button */}
                    <button 
                      onClick={() => fetchAdvice(selectedMethod)}
                      disabled={loading || !selectedMethod}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-755 hover:to-indigo-755 text-white rounded-xl font-bold text-xs hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4 cursor-pointer"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : !selectedMethod ? (
                        <>
                          <Sparkles size={14} />
                          Select Advice Engine
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} />
                          Simulate Strategy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Results Panel - 8 cols */}
              <motion.div variants={itemVariants} className="lg:col-span-8">
                {error && (
                  <div className="bg-red-50 dark:bg-red-950/20 rounded-2xl p-4 flex items-center gap-2 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30 mb-6">
                    <AlertCircle size={16} />
                    <p className="text-xs font-semibold">{error}</p>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-gray-150 dark:border-slate-800 shadow-sm p-12 flex flex-col items-center justify-center h-80">
                        <div className="relative mb-4">
                          <div className="w-14 h-14 border-4 border-blue-100 dark:border-slate-800 border-t-blue-600 rounded-full animate-spin"></div>
                          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400" size={20} />
                        </div>
                        <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">Analyzing Cashflow Data...</h3>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Compounding future returns based on risk scores.</p>
                        <div className="mt-6 w-full max-w-sm">
                          <div className="mb-2 flex items-center justify-between text-[11px] font-bold text-gray-500 dark:text-gray-400">
                            <span>{selectedMethod === 'RULE' ? 'Rule engine' : 'AI engine'} running</span>
                            <span>{analysisSeconds}s elapsed</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-slate-800">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                selectedMethod === 'RULE'
                                  ? 'bg-emerald-500'
                                  : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                              }`}
                              style={{ width: `${analysisProgress}%` }}
                            />
                          </div>
                          <p className="mt-2 text-center text-[11px] font-semibold text-gray-400 dark:text-gray-500">
                            Expected within {analysisTimeLimit}s. {remainingAnalysisSeconds > 0
                              ? `${remainingAnalysisSeconds}s remaining before timeout.`
                              : 'Timeout limit reached, waiting for server response.'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ) : advice ? (
                    <motion.div key="advice" variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                      
                      {/* REAL DATA: Strategy Snapshot Dashboard */}
                      <motion.div variants={itemVariants}>
                        <SectionHeader
                          title="Strategy Snapshot"
                          description="Review AI-recommended returns, projected wealth, invested capital, and SIP"
                          accentClass="bg-gradient-to-b from-indigo-500 to-violet-500 shadow-indigo-500/25"
                          titleClass="bg-gradient-to-r from-slate-950 to-indigo-700 dark:from-white dark:to-indigo-300"
                        />
                        <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-gray-150 dark:border-slate-800 shadow-sm overflow-hidden">
                          <div className="p-5 border-b border-gray-150 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center flex-wrap gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
                              <Award size={16} />
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">{adviceMethod.label} Strategy Recommendation</span>
                              <span className="text-sm font-bold text-gray-900 dark:text-white">Compound Capital Allocation Plan</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <div
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black uppercase border ${adviceMethod.className}`}
                              title={adviceMethod.description}
                            >
                              <MethodIcon size={13} />
                              {adviceMethod.label}
                            </div>
                            <div className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase ${adviceRisk.bg} ${adviceRisk.textStyle} border ${adviceRisk.border}`}>
                              {advice?.riskProfile} Matrix
                            </div>
                          </div>
                        </div>

                        {advice?.methodDetails && (
                          <div className="border-b border-gray-150 bg-white px-5 py-3 text-[11px] font-semibold text-gray-500 dark:border-slate-800 dark:bg-slate-900 dark:text-gray-400">
                            <span className="font-black text-gray-700 dark:text-gray-250">Engine detail:</span> {advice.methodDetails}
                          </div>
                        )}

                        <div className="p-5 md:p-6">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl border border-emerald-500/10 text-center">
                              <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Expected Returns</p>
                              <p className="text-xl md:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5">{advice.expectedAnnualReturns}% <span className="text-xs font-medium">p.a.</span></p>
                            </div>
                            <div className="p-4 bg-blue-500/5 dark:bg-blue-500/10 rounded-2xl border border-blue-500/10 text-center">
                              <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Compounded Wealth</p>
                              <p className="text-xl md:text-2xl font-black text-blue-600 dark:text-blue-400 mt-1.5">₹{Math.round(advice.projectedGrowth?.futureValue)?.toLocaleString()}</p>
                            </div>
                            <div className="p-4 bg-purple-500/5 dark:bg-purple-500/10 rounded-2xl border border-purple-500/10 text-center">
                              <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Invested Capital</p>
                              <p className="text-xl md:text-2xl font-black text-purple-600 dark:text-purple-400 mt-1.5">₹{Math.round(advice.projectedGrowth?.totalInvestment)?.toLocaleString()}</p>
                            </div>
                            <div className="p-4 bg-orange-500/5 dark:bg-orange-500/10 rounded-2xl border border-orange-500/10 text-center">
                              <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Monthly SIP</p>
                              <p className="text-xl md:text-2xl font-black text-orange-600 dark:text-orange-400 mt-1.5">₹{formData.monthlyInvestmentCapacity.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                        </div>
                      </motion.div>

                      {/* Strategic Introduction Paragraph */}
                      <motion.div variants={itemVariants}>
                        <SectionHeader
                          title="Strategy Summary"
                          description="Read the AI-generated investment plan introduction"
                          accentClass="bg-gradient-to-b from-cyan-500 to-blue-500 shadow-cyan-500/25"
                          titleClass="bg-gradient-to-r from-slate-950 to-cyan-700 dark:from-white dark:to-cyan-300"
                        />
                        <div className="bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/15 p-5 rounded-2xl">
                          <div className="flex gap-3">
                            <Lightbulb className="text-indigo-500 flex-shrink-0" size={20} />
                            <div>
                              <h4 className="font-extrabold text-xs text-indigo-750 dark:text-indigo-400 uppercase tracking-wide mb-1">Architect Strategy Summary</h4>
                              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-semibold">
                                {getIntroductionText()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Portfolio & Performance - Side by Side */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Real-time Portfolio Allocation */}
                        <motion.div variants={itemVariants}>
                          <SectionHeader
                            title="Target Allocation"
                            description="Break down the suggested asset mix and target weights"
                            accentClass="bg-gradient-to-b from-violet-500 to-fuchsia-500 shadow-violet-500/25"
                            titleClass="bg-gradient-to-r from-slate-950 to-violet-700 dark:from-white dark:to-violet-300"
                          />
                          <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-gray-150 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-150 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-purple-600 text-white rounded-lg">
                                <PieChart size={14} />
                              </div>
                              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">Target Asset Allocation</h3>
                            </div>
                          </div>
                          <div className="p-5">
                            <div className="h-[220px] relative">
                              <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
                                  <Pie 
                                    data={portfolioData} 
                                    cx="50%" 
                                    cy="50%" 
                                    innerRadius={55} 
                                    outerRadius={80} 
                                    dataKey="value" 
                                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                  >
                                    {portfolioData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                  </Pie>
                                  <Tooltip formatter={(value) => `₹${Number(value).toFixed(0)}%`} />
                                </RePieChart>
                              </ResponsiveContainer>
                            </div>
                            
                            {/* Allocation breakdown cards with actual sub-assets suggestions */}
                            <div className="space-y-2 mt-4">
                              {portfolioData.map((item, idx) => (
                                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-850 rounded-xl flex items-start gap-2.5">
                                  <div className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center text-xs">
                                      <span className="font-bold text-gray-800 dark:text-gray-250">{item.name}</span>
                                      <span className="font-black text-blue-600">{item.value}%</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold leading-normal mt-0.5 truncate">
                                      Targets: {item.examples || 'Mutual funds, index stocks'}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          </div>
                        </motion.div>

                        {/* Real-time Compounded Future Wealth Projection Line Chart */}
                        <motion.div variants={itemVariants}>
                          <SectionHeader
                            title="Compounding Projection"
                            description="Compare invested capital against projected future wealth"
                            accentClass="bg-gradient-to-b from-emerald-500 to-teal-500 shadow-emerald-500/25"
                            titleClass="bg-gradient-to-r from-slate-950 to-emerald-700 dark:from-white dark:to-emerald-300"
                          />
                          <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-gray-150 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-150 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-emerald-600 text-white rounded-lg">
                                <LineChart size={14} />
                              </div>
                              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">Compounding Curve Projection</h3>
                            </div>
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-blue-600 text-white rounded-md">Compound</span>
                          </div>
                          
                          <div className="p-5">
                            <div className="h-[220px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <ReLineChart data={projectionData}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:opacity-10" />
                                  <XAxis dataKey="year" tick={{ fontSize: 9 }} stroke="#888888" />
                                  <YAxis tick={{ fontSize: 9 }} stroke="#888888" formatter={(val) => `₹${Math.round(val / 1000)}k`} />
                                  <Tooltip formatter={(val) => `₹${Number(val).toLocaleString()}`} />
                                  <Legend wrapperStyle={{ fontSize: 10, pt: 5 }} />
                                  <Line type="monotone" name="Future Wealth" dataKey="Future Wealth" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 6 }} dot={false} />
                                  <Line type="monotone" name="Invested Capital" dataKey="Invested Capital" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                                </ReLineChart>
                              </ResponsiveContainer>
                            </div>

                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold leading-relaxed mt-4 flex items-center gap-1">
                              <Info size={11} className="text-blue-500 flex-shrink-0" />
                              This shows how compounding interests build your wealth beyond your invested capital over {formData.investmentHorizon} years.
                            </p>
                          </div>
                          </div>
                        </motion.div>
                      </div>

                      {/* Recommendations & Schedule - Side by Side */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Recommendations */}
                        <motion.div variants={itemVariants}>
                          <SectionHeader
                            title="Strategy Checklist"
                            description="Follow AI-generated recommendations for this profile"
                            accentClass="bg-gradient-to-b from-amber-500 to-orange-500 shadow-amber-500/25"
                            titleClass="bg-gradient-to-r from-slate-950 to-amber-700 dark:from-white dark:to-amber-300"
                          />
                          <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-gray-150 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-150 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-amber-600 text-white rounded-lg">
                                <Lightbulb size={14} />
                              </div>
                              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">AI Strategy Checklist</h3>
                            </div>
                          </div>
                          <div className="p-5">
                            <div className="space-y-3">
                              {recommendationsList.map((rec, idx) => (
                                <div key={idx} className="flex gap-3 bg-slate-50 dark:bg-slate-900/40 p-3.5 rounded-2xl border border-gray-100 dark:border-slate-850 hover:border-indigo-500/10 transition-colors">
                                  <div className="w-5 h-5 bg-amber-500/10 text-amber-500 rounded-md flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-black font-mono">{idx + 1}</span>
                                  </div>
                                  <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold leading-relaxed">{rec}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                          </div>
                        </motion.div>

                        {/* Rebalancing Schedule */}
                        <motion.div variants={itemVariants}>
                          <SectionHeader
                            title="Rebalancing Schedule"
                            description="Plan periodic portfolio reviews and allocation checks"
                            accentClass="bg-gradient-to-b from-teal-500 to-cyan-500 shadow-teal-500/25"
                            titleClass="bg-gradient-to-r from-slate-950 to-teal-700 dark:from-white dark:to-teal-300"
                          />
                          <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-gray-150 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-150 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-teal-600 text-white rounded-lg">
                                <Calendar size={14} />
                              </div>
                              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">Rebalancing Schedule</h3>
                            </div>
                          </div>
                          <div className="p-5">
                            <div className="space-y-3">
                              {[
                                { month: 'January', action: 'Annual Portfolio Review', status: 'completed' },
                                { month: 'April', action: 'Asset Allocation Rebalancing', status: 'upcoming' },
                                { month: 'July', action: 'Tax-Loss Harvesting Review', status: 'upcoming' },
                                { month: 'October', action: 'Sector Performance Audit', status: 'upcoming' }
                              ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-850 rounded-2xl">
                                  <div className="flex items-center gap-3">
                                    <Calendar size={13} className="text-gray-400" />
                                    <span className="text-xs font-bold text-gray-900 dark:text-white">{item.month}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">{item.action}</span>
                                    {item.status === 'completed' ? (
                                      <CheckCircle2 size={13} className="text-emerald-500" />
                                    ) : (
                                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          </div>
                        </motion.div>
                      </div>

                      {/* Tax Advantage & Goal Milestones */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div variants={itemVariants}>
                          <SectionHeader
                            title="Tax Benefits"
                            description="Review tax-aware opportunities and long-term gains notes"
                            accentClass="bg-gradient-to-b from-lime-500 to-emerald-500 shadow-lime-500/25"
                            titleClass="bg-gradient-to-r from-slate-950 to-lime-700 dark:from-white dark:to-lime-300"
                          />
                          <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-gray-150 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-150 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-emerald-600 text-white rounded-lg">
                                <Shield size={14} />
                              </div>
                              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">Tax Shield Benefits</h3>
                            </div>
                          </div>
                          <div className="p-5 space-y-3.5">
                            <div className="p-3 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl border border-emerald-500/10">
                              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1"><Shield size={12}/> ELSS Exemption Opportunities</p>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 font-semibold leading-relaxed">Save up to ₹46,800 annually under Section 80C by locking in premium equity funds.</p>
                            </div>
                            <div className="p-3 bg-blue-500/5 dark:bg-blue-500/10 rounded-2xl border border-blue-500/10">
                              <p className="text-xs font-bold text-blue-800 dark:text-blue-400 flex items-center gap-1"><ArrowUpRight size={12}/> LTCG Advantage Thresholds</p>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 font-semibold leading-relaxed">Long-term capital gains are only taxed at 10% on gains exceeding ₹1L per fiscal year.</p>
                            </div>
                          </div>
                          </div>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                          <SectionHeader
                            title="Goal Milestones"
                            description="Track simulated target value and investment horizon"
                            accentClass="bg-gradient-to-b from-rose-500 to-pink-500 shadow-rose-500/25"
                            titleClass="bg-gradient-to-r from-slate-950 to-rose-700 dark:from-white dark:to-rose-300"
                          />
                          <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-gray-150 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-150 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-rose-600 text-white rounded-lg">
                                <Target size={14} />
                              </div>
                              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">Simulated Goal Accomplishment</h3>
                            </div>
                          </div>
                          <div className="p-5">
                            <div className="mb-4">
                              <div className="flex justify-between text-xs font-bold mb-1">
                                <span className="text-gray-500">Target Value Reached</span>
                                <span className="text-blue-600">100%</span>
                              </div>
                              <div className="h-2 bg-gray-150 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full" style={{ width: '100%' }}></div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3.5">
                              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-850 rounded-2xl text-center">
                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Target Milestones</p>
                                <p className="text-sm font-black text-gray-900 dark:text-white mt-1">₹{Math.round(advice.projectedGrowth?.futureValue)?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                              </div>
                              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-850 rounded-2xl text-center">
                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Horizon Target</p>
                                <p className="text-sm font-black text-gray-900 dark:text-white mt-1">{formData.investmentHorizon} Years</p>
                              </div>
                            </div>
                          </div>
                          </div>
                        </motion.div>
                      </div>

                      {/* AI Pro Tip */}
                      <motion.div variants={itemVariants}>
                        <SectionHeader
                          title="Advisor Note"
                          description="Read the final AI professional recommendation"
                          accentClass="bg-gradient-to-b from-purple-500 to-indigo-500 shadow-purple-500/25"
                          titleClass="bg-gradient-to-r from-slate-950 to-purple-700 dark:from-white dark:to-purple-300"
                        />
                        <div className="bg-gradient-to-r from-blue-600 via-indigo-650 to-purple-600 rounded-[24px] p-5 text-white shadow-lg relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform"></div>
                          <div className="flex items-start gap-3 relative z-10">
                            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                              <Sparkles size={16} />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-xs uppercase tracking-widest mb-1.5">{adviceMethod.label} Advisor Note</h4>
                              <p className="text-blue-100 text-xs leading-relaxed font-semibold">
                                Based on your {advice?.riskProfile?.toLowerCase()} profile and monthly compounding capability, your capital multiplier stands at {(advice.projectedGrowth?.futureValue / advice.projectedGrowth?.totalInvestment).toFixed(1)}x. Consider establishing fixed monthly auto-debits on your paydays to automate this architecture flawlessly.
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                    </motion.div>
                  ) : (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-slate-900 rounded-[28px] border border-gray-150 dark:border-slate-800 shadow-sm p-12 text-center h-80 flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Zap size={24} className="text-gray-400 dark:text-gray-500" />
                      </div>
                      <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">Simulate Strategy Matrix</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mt-1">Select an advice engine first, tune your risk, horizon, capital, and goal, then generate a dynamic roadmap.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default InvestmentAdvice;
