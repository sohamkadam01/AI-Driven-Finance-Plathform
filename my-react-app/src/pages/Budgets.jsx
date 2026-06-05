import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Calendar, BarChart3, History, TrendingUp, Bell, Target,
  Sparkles, ChevronRight, Wallet, PieChart, AlertCircle,
  TrendingDown, Award, Clock, Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import totalBudgetImg from '../assets/total_budget.png';
import totalSpendImg from '../assets/total_spend.png';
import remainingImg from '../assets/remaining.png';
import overallProgressImg from '../assets/overall_progress.png';

// Components
import BudgetCard from '../components/Budgets/BudgetCard';
import CreateBudgetModal from '../components/Budgets/CreateBudgetModal';
import BudgetSummary from '../components/Budgets/BudgetSummary';
import BudgetHistory from '../components/Budgets/BudgetHistory';
import BudgetPerformance from '../components/Budgets/BudgetPerformance';
import BudgetAlerts from '../components/Budgets/BudgetAlerts';
import CategoryBreakdown from '../components/Budgets/CategoryBreakdown';
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

const Budgets = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  // Fetch all budget data
  const fetchBudgetData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [year, month] = selectedMonth.split('-');
      
      const budgetsResponse = await axios.get(
        `${API_BASE_URL}/budgets?year=${year}&month=${month}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBudgets(budgetsResponse.data.budgets || []);
      setSummary(budgetsResponse.data.summary);
      
      const performanceResponse = await axios.get(
        `${API_BASE_URL}/budgets/performance`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPerformance(performanceResponse.data.performance);
      
      const alertsResponse = await axios.get(
        `${API_BASE_URL}/alerts/unread`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAlerts(alertsResponse.data || []);
      
    } catch (err) {
      console.error('Failed to fetch budget data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetData();
  }, [selectedMonth]);

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setIsCreateModalOpen(true);
  };

  const handleDeleteBudget = async (budgetId) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/budgets/${budgetId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBudgetData();
    } catch (err) {
      console.error('Failed to delete budget:', err);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.5, staggerChildren: 0.05 }
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3, color: 'blue' },
    { id: 'history', label: 'History', icon: History, color: 'purple' },
    { id: 'performance', label: 'Performance', icon: TrendingUp, color: 'emerald' },
    { id: 'alerts', label: 'Alerts', icon: Bell, color: 'orange' },
  ];

  // Calculate total budget and spent
  const totalBudget = budgets.reduce((sum, b) => sum + (b.amountLimit || 0), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spentAmount || 0), 0);
  const overallProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Get month name
  const getMonthName = (dateStr) => {
    const [year, month] = dateStr.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  };

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
                <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">Budget Management</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Budget Planner</h1>
              <p className="text-gray-500 text-sm mt-1">Track and manage your monthly spending limits</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Month Selector - Google Material */}
              <div className="relative">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
                  <Calendar size={18} className="text-gray-400" />
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    className="text-sm border-none outline-none bg-transparent text-gray-700 font-medium"
                  />
                </div>
              </div>
              
              {/* Create Budget Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setEditingBudget(null);
                  setIsCreateModalOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md shadow-blue-200 hover:shadow-lg transition-all"
              >
                <Plus size={18} />
                <span className="font-medium">Create Budget</span>
              </motion.button>
            </div>
          </div>

          <SectionHeader
            title="Budget Overview"
            description="Review total budget, total spend, remaining balance, and monthly progress"
            accentClass="bg-gradient-to-b from-blue-500 to-indigo-500 shadow-blue-500/25"
            titleClass="bg-gradient-to-r from-slate-950 to-blue-700"
          />

          {/* Summary Cards - Google Material Style */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* Total Budget Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
            >
              {/* Background Illustration */}
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <img 
                  src={totalBudgetImg} 
                  alt="" 
                  className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-all duration-500 group-hover:scale-110 grayscale-[0.2]" 
                />
                <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-blue-50/20" />
              </div>

              <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Wallet size={20} className="text-blue-600" />
                </div>
                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">Monthly</span>
              </div>
              <p className="text-sm text-gray-500 mb-1">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalBudget.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-2">{getMonthName(selectedMonth)}</p>
            </div>
            </motion.div>

            {/* Total Spent Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
            >
              {/* Background Illustration */}
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <img 
                  src={totalSpendImg} 
                  alt="" 
                  className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-all duration-500 group-hover:scale-110 grayscale-[0.2]" 
                />
                <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-rose-50/20" />
              </div>

              <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                  <TrendingDown size={20} className="text-rose-600" />
                </div>
                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">Spent</span>
              </div>
              <p className="text-sm text-gray-500 mb-1">Total Spent</p>
              <p className="text-2xl font-bold text-rose-600">₹{totalSpent.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-2">{((totalSpent / totalBudget) * 100).toFixed(0)}% of budget</p>
            </div>
            </motion.div>

            {/* Remaining Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
            >
              {/* Background Illustration */}
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <img 
                  src={remainingImg} 
                  alt="" 
                  className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-all duration-500 group-hover:scale-110 grayscale-[0.2]" 
                />
                <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-emerald-50/20" />
              </div>

              <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Award size={20} className="text-emerald-600" />
                </div>
                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">Left</span>
              </div>
              <p className="text-sm text-gray-500 mb-1">Remaining</p>
              <p className="text-2xl font-bold text-emerald-600">₹{(totalBudget - totalSpent).toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-2">Available to spend</p>
            </div>
            </motion.div>

            {/* Overall Progress Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-5 shadow-sm relative overflow-hidden group"
            >
              {/* Background Illustration */}
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <img 
                  src={overallProgressImg} 
                  alt="" 
                  className="w-full h-full object-cover opacity-15 group-hover:opacity-25 transition-all duration-500 group-hover:scale-110 grayscale-[0.2]" 
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-blue-50/40 to-indigo-50/20" />
              </div>

              <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <PieChart size={20} className="text-blue-600" />
                </div>
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Progress</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Overall Progress</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(overallProgress)}%</p>
              <div className="mt-3 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    overallProgress >= 80 ? 'bg-rose-500' : overallProgress >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(overallProgress, 100)}%` }}
                />
              </div>
            </div>
            </motion.div>
          </div>

          {/* AI Insight Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-indigo-900 to-indigo-800 rounded-2xl p-5 mb-8 text-white relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full -ml-20 -mb-20"></div>
            
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Sparkles size={22} className="text-yellow-300" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-indigo-200 mb-1">Budget Insight</p>
                <p className="text-white text-base leading-relaxed">
                  {overallProgress >= 80 
                    ? `⚠️ You've used ${Math.round(overallProgress)}% of your budget. Consider reducing discretionary spending for the remaining days.`
                    : overallProgress >= 60
                    ? `📊 You're at ${Math.round(overallProgress)}% of your budget. You're on track for the month!`
                    : `🎯 Great job! You've only used ${Math.round(overallProgress)}% of your budget. Keep up the good work!`
                  }
                </p>
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
                    {tab.id === 'alerts' && alerts.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                        {alerts.length}
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
              className="space-y-6"
            >
              {activeTab === 'overview' && (
                <>
                  {/* Budgets Grid */}
                  {budgets.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                      <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Target size={32} className="text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No budgets yet</h3>
                      <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                        Create your first budget to start tracking your spending and reach your financial goals.
                      </p>
                      <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
                      >
                        + Create Budget
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {budgets.map((budget, idx) => (
                        <motion.div
                          key={budget.budgetId}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <BudgetCard
                            budget={budget}
                            onEdit={() => handleEditBudget(budget)}
                            onDelete={() => handleDeleteBudget(budget.budgetId)}
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Category Breakdown */}
                  {budgets.length > 0 && (
                    <CategoryBreakdown budgets={budgets} loading={loading} />
                  )}
                </>
              )}

              {activeTab === 'history' && (
                <BudgetHistory selectedMonth={selectedMonth} />
              )}

              {activeTab === 'performance' && (
                <div>
                  <SectionHeader
                    title="Budget Performance"
                    description="Compare planned budgets with actual spending by category"
                    accentClass="bg-gradient-to-b from-emerald-500 to-teal-500 shadow-emerald-500/25"
                    titleClass="bg-gradient-to-r from-slate-950 to-emerald-700"
                  />
                  <BudgetPerformance performance={performance} loading={loading} />
                </div>
              )}

              {activeTab === 'alerts' && (
                <BudgetAlerts alerts={alerts} onRefresh={fetchBudgetData} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Create/Edit Budget Modal */}
      <CreateBudgetModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingBudget(null);
        }}
        onSuccess={fetchBudgetData}
        editingBudget={editingBudget}
        selectedMonth={selectedMonth}
      />
    </Layout>
  );
};

export default Budgets;
