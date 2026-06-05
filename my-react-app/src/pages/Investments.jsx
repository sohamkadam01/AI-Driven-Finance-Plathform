import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, BarChart3, RefreshCw, AlertCircle, TrendingUp, 
  Wallet, PieChart, Sparkles, ChevronRight, Shield,
  ArrowUpRight, ArrowDownRight, Clock, DollarSign, Award, 
  TrendingDown, Filter, Download, Share2, Eye, Settings,
  Bell, Star, Target, Briefcase, LineChart, Activity,
  Gauge, Zap, Heart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// Components
import PortfolioSummary from '../components/Investments/PortfolioSummary';
import PortfolioPerformanceChart from '../components/Investments/PortfolioPerformanceChart';
import AssetAllocationChart from '../components/Investments/AssetAllocationChart';
import InvestmentsTable from '../components/Investments/InvestmentsTable';
import AddInvestmentModal from '../components/Investments/AddInvestmentModal';
import UpdateValueModal from '../components/Investments/UpdateValueModal';
import InvestmentInsights from '../components/Investments/InvestmentInsights';
import Layout from '../components/Layout/Layout';

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
        <p className="ml-5 text-sm font-semibold leading-relaxed text-slate-600">
          {description}
        </p>
      )}
    </div>
  </div>
);

const Investments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [investments, setInvestments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [assetAllocation, setAssetAllocation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [performancePeriod, setPerformancePeriod] = useState('6M');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  // Fetch all investment data
  const fetchInvestmentData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      const investmentsResponse = await api.get('/investments/my-investments');
      const investmentsData = investmentsResponse.data?.investments || 
                             investmentsResponse.data?.data || 
                             investmentsResponse.data || [];
      setInvestments(investmentsData);
      
      const summaryResponse = await api.get('/investments/summary');
      const rawSummaryData = summaryResponse.data.summary || 
                          summaryResponse.data.data || 
                          summaryResponse.data;
      const summaryData = {
        ...rawSummaryData,
        totalInvested: rawSummaryData.totalInvested ?? rawSummaryData.amountInvested ?? 0,
        totalCurrentValue: rawSummaryData.totalCurrentValue ?? rawSummaryData.currentValue ?? 0,
        totalProfitLoss: rawSummaryData.totalProfitLoss ?? rawSummaryData.profitLoss ?? 0,
        totalReturnsPercentage: rawSummaryData.totalReturnsPercentage ?? rawSummaryData.returnsPercentage ?? 0,
        numberOfInvestments: rawSummaryData.numberOfInvestments ?? investmentsData.length,
        numberOfProfitableInvestments: rawSummaryData.numberOfProfitableInvestments ?? investmentsData.filter(inv => (inv.profitLoss || 0) > 0).length,
      };
      setSummary(summaryData);

      if (summaryData.assetAllocation) {
        setAssetAllocation(summaryData.assetAllocation);
      }
      
      const performanceResponse = await api.get('/investments/performance', {
        params: { period: performancePeriod }
      });
      
      const performanceData = performanceResponse.data.performance || 
                             performanceResponse.data.data || 
                             performanceResponse.data;
      setPerformance(performanceData);

      if (!summaryData.assetAllocation && performanceData?.assetAllocation) {
        setAssetAllocation(performanceData.assetAllocation);
      }

      if (!summaryData.assetAllocation && !performanceData?.assetAllocation && investmentsData.length > 0) {
        const totals = investmentsData.reduce((acc, inv) => {
          const type = inv.type || 'Other';
          const value = inv.currentValue || inv.amountInvested || 0;
          acc[type] = (acc[type] || 0) + value;
          return acc;
        }, {});
        
        const totalValue = Object.values(totals).reduce((a, b) => a + b, 0);
        
        const manualAllocation = Object.entries(totals).map(([type, amount]) => ({
          assetType: type,
          amount: amount,
          percentage: totalValue > 0 ? Math.round((amount / totalValue) * 100) : 0
        }));
        setAssetAllocation(manualAllocation);
      }
      
    } catch (err) {
      console.error('Failed to fetch investment data:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      }
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to load investment data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestmentData();
  }, [performancePeriod]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchInvestmentData();
    setRefreshing(false);
  };

  const handleUpdateValue = (investment) => {
    setSelectedInvestment(investment);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteInvestment = async (investmentId) => {
    if (!confirm('Are you sure you want to delete this investment?')) return;
    
    try {
      await api.delete(`/investments/${investmentId}`);
      fetchInvestmentData();
    } catch (err) {
      console.error('Failed to delete investment:', err);
      alert('Failed to delete investment');
    }
  };

  // Calculate portfolio stats
  const totalInvested = summary?.totalInvested || 0;
  const totalCurrentValue = summary?.totalCurrentValue || summary?.currentValue || 0;
  const totalProfitLoss = totalCurrentValue - totalInvested;
  const totalReturnsPercentage = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

  const periodOptions = [
    { value: '1M', label: '1M', color: 'blue', fullLabel: '1 Month' },
    { value: '3M', label: '3M', color: 'purple', fullLabel: '3 Months' },
    { value: '6M', label: '6M', color: 'emerald', fullLabel: '6 Months' },
    { value: '1Y', label: '1Y', color: 'orange', fullLabel: '1 Year' },
    { value: 'ALL', label: 'ALL', color: 'rose', fullLabel: 'All Time' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3, staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-6"
          >
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-blue-600 rounded-lg">
                    <TrendingUp size={14} className="text-white" />
                  </div>
                  <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">Portfolio Management</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Investment Portfolio</h1>
                <p className="text-gray-500 text-sm mt-1">Track and manage your investments</p>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Quick Stats */}
                <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-white rounded-lg border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-1">
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center ${totalProfitLoss >= 0 ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                      {totalProfitLoss >= 0 ? <TrendingUp size={10} className="text-emerald-600" /> : <TrendingDown size={10} className="text-rose-600" />}
                    </div>
                    <span className={`text-xs font-medium ${totalProfitLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {totalProfitLoss >= 0 ? '+' : ''}{totalReturnsPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-px h-3 bg-gray-200" />
                  <div className="flex items-center gap-1">
                    <DollarSign size={10} className="text-gray-400" />
                    <span className="text-xs font-medium text-gray-700">₹{totalCurrentValue.toLocaleString()}</span>
                  </div>
                </div>
                
                {/* Refresh Button */}
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <RefreshCw size={18} className={refreshing ? 'animate-spin text-blue-600' : ''} />
                </button>
                
                {/* Add Investment Button */}
                <button
                  onClick={() => {
                    setSelectedInvestment(null);
                    setIsAddModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium"
                >
                  <Plus size={15} />
                  Add Investment
                </button>
              </div>
            </div>

            {/* AI Insight Banner */}
            <motion.div variants={itemVariants} className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 text-white">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-white/10 rounded-lg">
                  <Sparkles size={16} className="text-yellow-300" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-blue-100 mb-0.5">AI Portfolio Insight</p>
                  <p className="text-sm leading-relaxed">
                    {investments.length === 0 
                      ? "Start building your wealth by adding your first investment. Our AI will help you track performance and optimize returns."
                      : totalProfitLoss >= 0 
                        ? `🎉 Your portfolio has grown by ${totalReturnsPercentage.toFixed(1)}%! Consider diversifying into other asset classes.`
                        : `📊 Your portfolio is down ${Math.abs(totalReturnsPercentage).toFixed(1)}%. Review your asset allocation strategy.`
                    }
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-50 rounded-lg p-3 flex items-center gap-2 border border-red-100"
                >
                  <AlertCircle size={16} className="text-red-500" />
                  <p className="text-sm text-red-700 flex-1">{error}</p>
                  <button
                    onClick={fetchInvestmentData}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Try Again
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Portfolio Summary Cards */}
            <div>
              <SectionHeader
                title="Portfolio Summary"
                description="Review invested value, current value, returns, and portfolio count"
                accentClass="bg-gradient-to-b from-blue-500 to-indigo-500 shadow-blue-500/25"
                titleClass="bg-gradient-to-r from-slate-950 to-blue-700"
              />
              <PortfolioSummary summary={summary} loading={loading} />
            </div>

            {/* Performance Section */}
            <div className="space-y-4">
              <SectionHeader
                title="Portfolio Performance"
                description="Track portfolio movement across selected time periods"
                accentClass="bg-gradient-to-b from-emerald-500 to-teal-500 shadow-emerald-500/25"
                titleClass="bg-gradient-to-r from-slate-950 to-emerald-700"
              />
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Performance Range</div>
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  {periodOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setPerformancePeriod(option.value)}
                      className={`px-3 py-1 text-xs rounded-md transition-all ${
                        performancePeriod === option.value
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      title={option.fullLabel}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <PortfolioPerformanceChart 
                performance={performance} 
                loading={loading}
                period={performancePeriod}
              />
            </div>

            {/* Asset Allocation & Insights Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <SectionHeader
                  title="Asset Allocation"
                  description="See how your portfolio is distributed by asset type"
                  accentClass="bg-gradient-to-b from-cyan-500 to-blue-500 shadow-cyan-500/25"
                  titleClass="bg-gradient-to-r from-slate-950 to-cyan-700"
                />
                <AssetAllocationChart allocation={assetAllocation} loading={loading} />
              </div>
              <div>
                <SectionHeader
                  title="Investment Insights"
                  description="Review portfolio signals, risks, and optimization suggestions"
                  accentClass="bg-gradient-to-b from-violet-500 to-fuchsia-500 shadow-violet-500/25"
                  titleClass="bg-gradient-to-r from-slate-950 to-violet-700"
                />
                <InvestmentInsights
                  performance={performance}
                  summary={summary}
                  loading={loading}
                />
              </div>
            </div>

            {/* Investments Table Section */}
            <div>
              <SectionHeader
                title="Your Investments"
                description={`${investments.length} investment${investments.length === 1 ? '' : 's'} currently tracked`}
                accentClass="bg-gradient-to-b from-amber-500 to-orange-500 shadow-amber-500/25"
                titleClass="bg-gradient-to-r from-slate-950 to-amber-700"
              />
              <InvestmentsTable 
                investments={investments}
                loading={loading}
                onUpdateValue={handleUpdateValue}
                onDelete={handleDeleteInvestment}
              />
            </div>

            {/* Footer */}
            <div className="text-center pt-4">
              <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                <Shield size={10} />
                Data updates in real-time • Powered by AI insights
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      <AddInvestmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchInvestmentData}
        editingInvestment={selectedInvestment}
      />

      <UpdateValueModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onSuccess={fetchInvestmentData}
        investment={selectedInvestment}
      />
    </Layout>
  );
};

export default Investments;
