import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, List, BarChart3, RefreshCw, AlertTriangle,
  TrendingUp, TrendingDown, Activity, Zap, Sparkles,
  ChevronRight, Clock, CheckCircle, AlertCircle, Brain
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

// Components
import AnomalyStatsCards from '../components/AnomalyDetection/AnomalyStatsCards';
import AnomalyList from '../components/AnomalyDetection/AnomalyList';
import AnomalyDetailsModal from '../components/AnomalyDetection/AnomalyDetailsModal';
import ResolutionModal from '../components/AnomalyDetection/ResolutionModal';
import DetectionRateChart from '../components/AnomalyDetection/DetectionRateChart';
import SeverityPieChart from '../components/AnomalyDetection/SeverityPieChart';
import CategoryBreakdown from '../components/AnomalyDetection/CategoryBreakdown';
import Layout from '../components/Layout/Layout';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

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

const AnomalyDetection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [anomalies, setAnomalies] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('list');

  // Fetch all anomaly data
  const fetchAnomalyData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const anomaliesResponse = await axios.get(`${API_BASE_URL}/anomalies/my-anomalies`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnomalies(anomaliesResponse.data || []);
      
      const statsResponse = await axios.get(`${API_BASE_URL}/anomalies/statistics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatistics(statsResponse.data.statistics);
      
    } catch (err) {
      console.error('Failed to fetch anomaly data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalyData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnomalyData();
    setRefreshing(false);
  };

  const handleMarkAsFraud = async (anomalyId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/anomalies/${anomalyId}/mark-fraud`,
        { notes: 'Marked as fraudulent' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAnomalyData();
    } catch (err) {
      console.error('Failed to mark as fraud:', err);
    }
  };

  const handleMarkAsFalseAlarm = async (anomalyId, notes) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/anomalies/${anomalyId}/false-alarm`,
        { notes: notes || 'False alarm' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAnomalyData();
    } catch (err) {
      console.error('Failed to mark as false alarm:', err);
    }
  };

  const handleViewDetails = (anomaly) => {
    setSelectedAnomaly(anomaly);
    setIsDetailsModalOpen(true);
  };

  const handleAddResolution = (anomaly) => {
    setSelectedAnomaly(anomaly);
    setIsResolutionModalOpen(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.5, staggerChildren: 0.05 }
    }
  };

  const tabs = [
    { id: 'list', label: 'Flagged Transactions', icon: List, color: 'blue', description: 'Review suspicious activities' },
    { id: 'stats', label: 'Statistics & Analytics', icon: BarChart3, color: 'purple', description: 'Detection metrics' },
  ];

  // Calculate alert count
  const openAlerts = anomalies.filter(a => !a.resolutionNote).length;
  const resolvedAlerts = anomalies.filter(a => !!a.resolutionNote).length;

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
                <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">Security Monitor</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Anomaly Detection</h1>
              <p className="text-gray-500 text-sm mt-1">Monitor and review suspicious activities</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Alert Summary */}
              <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-white rounded-xl border border-gray-100">
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 bg-amber-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle size={12} className="text-amber-600" />
                  </div>
                  <span className="text-xs font-medium text-amber-600">{openAlerts} Open</span>
                </div>
                <div className="w-px h-4 bg-gray-200" />
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <CheckCircle size={12} className="text-emerald-600" />
                  </div>
                  <span className="text-xs font-medium text-emerald-600">{resolvedAlerts} Resolved</span>
                </div>
              </div>
              
              {/* Refresh Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md shadow-blue-200 hover:shadow-lg transition-all disabled:opacity-50"
              >
                <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                <span className="font-medium">Refresh Data</span>
              </motion.button>
            </div>
          </div>

          {/* AI Insight Banner - Gemini Style */}
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
                <Brain size={22} className="text-yellow-300" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-indigo-200 mb-1">AI Guardian Alert</p>
                <p className="text-white text-base leading-relaxed">
                  {openAlerts === 0 
                    ? "✅ No suspicious activities detected. Your account is secure and all transactions appear normal."
                    : `⚠️ ${openAlerts} unusual ${openAlerts === 1 ? 'pattern has' : 'patterns have'} been detected. Review flagged transactions to protect your account.`
                  }
                </p>
              </div>
            </div>
          </motion.div>

          {/* Statistics Cards */}
          <SectionHeader
            title="Detection Overview"
            description="Review open alerts, resolved cases, fraud signals, and detection activity"
            accentClass="bg-gradient-to-b from-blue-500 to-indigo-500 shadow-blue-500/25"
            titleClass="bg-gradient-to-r from-slate-950 to-blue-700"
          />
          <AnomalyStatsCards statistics={statistics} loading={loading} />

          {/* Tabs - Google Material Style */}
          <div className="border-b border-gray-200 mt-8 mb-6">
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
                    {tab.id === 'list' && openAlerts > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-medium rounded-full">
                        {openAlerts}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'list' && (
                <div>
                  <SectionHeader
                    title="Flagged Transactions"
                    description="Review suspicious activity and resolve anomaly alerts"
                    accentClass="bg-gradient-to-b from-rose-500 to-pink-500 shadow-rose-500/25"
                    titleClass="bg-gradient-to-r from-slate-950 to-rose-700"
                  />
                  <AnomalyList
                    anomalies={anomalies}
                    loading={loading}
                    onViewDetails={handleViewDetails}
                    onMarkAsFraud={handleMarkAsFraud}
                    onMarkAsFalseAlarm={handleMarkAsFalseAlarm}
                    onAddResolution={handleAddResolution}
                  />
                </div>
              )}

              {activeTab === 'stats' && statistics && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <SectionHeader
                        title="Detection Rate"
                        description="Track anomaly detection accuracy and alert trends"
                        accentClass="bg-gradient-to-b from-emerald-500 to-teal-500 shadow-emerald-500/25"
                        titleClass="bg-gradient-to-r from-slate-950 to-emerald-700"
                      />
                      <DetectionRateChart statistics={statistics} loading={loading} />
                    </div>
                    <div>
                      <SectionHeader
                        title="Severity Breakdown"
                        description="Understand anomaly severity distribution"
                        accentClass="bg-gradient-to-b from-amber-500 to-orange-500 shadow-amber-500/25"
                        titleClass="bg-gradient-to-r from-slate-950 to-amber-700"
                      />
                      <SeverityPieChart statistics={statistics} loading={loading} />
                    </div>
                  </div>
                  <div>
                    <SectionHeader
                      title="Category Breakdown"
                      description="See which spending categories trigger unusual activity"
                      accentClass="bg-gradient-to-b from-cyan-500 to-blue-500 shadow-cyan-500/25"
                      titleClass="bg-gradient-to-r from-slate-950 to-cyan-700"
                    />
                    <CategoryBreakdown statistics={statistics} loading={loading} />
                  </div>
                  
                  {/* Insights Section - Google Material Style */}
                  {statistics.insights && statistics.insights.length > 0 && (
                    <div>
                      <SectionHeader
                        title="AI Insights"
                        description="Review AI-generated context for anomaly patterns"
                        accentClass="bg-gradient-to-b from-violet-500 to-fuchsia-500 shadow-violet-500/25"
                        titleClass="bg-gradient-to-r from-slate-950 to-violet-700"
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-blue-50 rounded-2xl p-6 border border-blue-100"
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Brain size={16} className="text-blue-600" />
                          </div>
                          <h3 className="text-base font-semibold text-gray-900">AI Insights</h3>
                        </div>
                        <div className="space-y-3">
                          {statistics.insights.map((insight, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                              <Sparkles size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-gray-700">{insight}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  )}
                  
                  {/* Recommendations Section */}
                  {statistics.recommendations && statistics.recommendations.length > 0 && (
                    <div>
                      <SectionHeader
                        title="Security Recommendations"
                        description="Follow recommended actions to reduce fraud and false-positive risk"
                        accentClass="bg-gradient-to-b from-lime-500 to-emerald-500 shadow-lime-500/25"
                        titleClass="bg-gradient-to-r from-slate-950 to-lime-700"
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100"
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <Shield size={16} className="text-emerald-600" />
                          </div>
                          <h3 className="text-base font-semibold text-gray-900">Security Recommendations</h3>
                        </div>
                        <div className="space-y-3">
                          {statistics.recommendations.map((rec, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                              <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-gray-700">{rec}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  )}
                </div>
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
              <Activity size={10} />
              AI continuously monitors your transactions for suspicious patterns
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Modals */}
      <AnomalyDetailsModal 
        anomaly={selectedAnomaly}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />
      
      <ResolutionModal 
        anomaly={selectedAnomaly}
        isOpen={isResolutionModalOpen}
        onClose={() => setIsResolutionModalOpen(false)}
        onResolve={handleMarkAsFalseAlarm}
      />
    </Layout>
  );
};

export default AnomalyDetection;
