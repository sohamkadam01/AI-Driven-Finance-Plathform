// src/components/Dashboard/QuickActions.jsx
// Enhanced design version - all logic unchanged.

import React, { useState } from 'react';
import { 
  Plus, Upload, Wallet, Target, 
  Sparkles, TrendingUp, CreditCard, 
  Receipt, PiggyBank, ArrowRight,
  Zap, CircleDollarSign, FileText, Briefcase,
  Menu, X, ChevronRight, Clock,
  BarChart3, Shield, Gem, Star, Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReceiptUploadModal from './ReceiptUploadModal';
import AddAccountModal from './AddAccountModal';
import CreateBudgetModal from './CreateBudgetModal';
import AddTransactionModal from './AddTransactionModal';
import uploadReceiptImg from '../../assets/upload_receipt.png';
import addTransactionImg from '../../assets/add_transaction.png';
import addAccountImg from '../../assets/add_account.png';
import addBudgetImg from '../../assets/add_budget.png';
import financialHealthImg from '../../assets/financial_health.png';

const QuickActions = ({ onRefresh, onFinancialHealthAdvice, variant = 'google' }) => {
  const [activeModal, setActiveModal] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  const actions = [
    { 
      id: 'transaction',
      icon: Plus, 
      label: 'Add Transaction', 
      description: 'Record income or expense',
      shortDesc: 'Add entry',
      color: 'blue',
      gradient: 'from-blue-600 to-blue-500',
      cardGradient: 'from-blue-50 via-white to-indigo-50',
      lightBg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      text: 'text-blue-600',
      border: 'border-blue-100',
      hoverBorder: 'group-hover:border-blue-200',
      metric: 'Most used',
      metricIcon: Star,
      image: addTransactionImg,
      onClick: () => setActiveModal('transaction') 
    },
    { 
      id: 'upload',
      icon: Upload, 
      label: 'Upload Receipt', 
      description: 'Scan & auto-fill',
      shortDesc: 'Scan receipt',
      color: 'purple',
      gradient: 'from-purple-600 to-purple-500',
      cardGradient: 'from-purple-50 via-white to-fuchsia-50',
      lightBg: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      text: 'text-purple-600',
      border: 'border-purple-100',
      hoverBorder: 'group-hover:border-purple-200',
      metric: 'Smart OCR',
      metricIcon: Sparkles,
      image: uploadReceiptImg,
      onClick: () => setActiveModal('upload') 
    },
    { 
      id: 'account',
      icon: Wallet, 
      label: 'Add Account', 
      description: 'Connect bank account',
      shortDesc: 'Link bank',
      color: 'emerald',
      gradient: 'from-emerald-600 to-emerald-500',
      cardGradient: 'from-emerald-50 via-white to-teal-50',
      lightBg: 'bg-emerald-50',
      iconBg: 'bg-emerald-100',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
      hoverBorder: 'group-hover:border-emerald-200',
      metric: 'Secure',
      metricIcon: Shield,
      image: addAccountImg,
      onClick: () => setActiveModal('account') 
    },
    { 
      id: 'budget',
      icon: Target, 
      label: 'Create Budget', 
      description: 'Set spending limits',
      shortDesc: 'Set limits',
      color: 'orange',
      gradient: 'from-orange-600 to-orange-500',
      cardGradient: 'from-orange-50 via-white to-amber-50',
      lightBg: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      text: 'text-orange-600',
      border: 'border-orange-100',
      hoverBorder: 'group-hover:border-orange-200',
      metric: 'Stay on track',
      metricIcon: Target,
      image: addBudgetImg,
      onClick: () => setActiveModal('budget') 
    },
    ...(onFinancialHealthAdvice ? [{
      id: 'financial-health-ai',
      icon: Bot,
      label: 'Improve Health',
      description: 'AI financial health advice',
      shortDesc: 'AI advice',
      color: 'indigo',
      gradient: 'from-indigo-600 to-violet-600',
      cardGradient: 'from-indigo-50 via-white to-violet-50',
      lightBg: 'bg-indigo-50',
      iconBg: 'bg-indigo-100',
      text: 'text-indigo-600',
      border: 'border-indigo-100',
      hoverBorder: 'group-hover:border-indigo-200',
      metric: 'AI powered',
      metricIcon: Sparkles,
      image: financialHealthImg,
      onClick: onFinancialHealthAdvice
    }] : []),
  ];

  const handleSuccess = () => {
    if (onRefresh) onRefresh();
    setActiveModal(null);
  };

  // ========== MODERN ENHANCED DESIGN - PREMIUM VERSION ==========
  if (variant === 'google') {
    return (
      <>
        <div className="space-y-8">
          {/* PREMIUM HEADER with Modern Typography & Gradient */}
          <div className="flex items-center justify-between gap-4 px-1">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <motion.div
                  className="w-1.5 h-9 bg-gradient-to-b from-blue-600 via-indigo-600 to-purple-600 rounded-full shadow-lg shadow-indigo-300/50"
                  animate={{ scaleY: [1, 1.18, 1] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                />
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">Quick Actions</h3>
              </div>
              <p className="text-base text-slate-600 ml-5 font-semibold leading-relaxed">Get things done faster with smart shortcuts</p>
            </div>
            
          </div>

          {/* ENHANCED CARDS GRID with Premium Design */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {actions.map((action, idx) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, y: 28, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  delay: idx * 0.1, 
                  duration: 0.6,
                  type: 'spring',
                  stiffness: 100,
                  damping: 14,
                  ease: [0.34, 1.56, 0.64, 1]
                }}
                whileHover={{ y: -6, scale: 1.01, transition: { type: 'spring', stiffness: 120, damping: 14 } }}
                whileTap={{ scale: 0.985 }}
                onMouseEnter={() => setHoveredCard(action.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={action.onClick}
                className="group relative text-left h-full"
              >
                {/* Glowing Background Effect on Hover */}
                <motion.div 
                  className={`absolute -inset-1 bg-gradient-to-r ${action.gradient} rounded-3xl opacity-0 blur-xl transition-all duration-500 -z-10`}
                  animate={hoveredCard === action.id ? { opacity: [0, 0.15, 0.1] } : { opacity: 0 }}
                  transition={{ duration: 0.4 }}
                />
                
                {/* MAIN CARD with Sophisticated Styling */}
                <div className={`relative h-full min-h-[190px] bg-gradient-to-br ${action.cardGradient} rounded-2xl border ${action.border} p-5 transition-all duration-300 ${action.hoverBorder} shadow-sm shadow-slate-200/60 ring-1 ring-white/80 group-hover:shadow-xl group-hover:shadow-slate-300/60 group-hover:ring-white overflow-hidden`}>
                  
                  {/* Animated Gradient Overlay on Hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className={`absolute -top-1/2 -right-1/3 w-2/3 h-full ${action.lightBg} rounded-full blur-3xl`} />
                    <div className={`absolute -bottom-1/2 -left-1/3 w-1/2 h-1/2 ${action.lightBg} rounded-full blur-3xl`} />
                  </div>

                  {/* Top Accent Line */}
                  <motion.div 
                    className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${action.gradient} origin-left`}
                    initial={{ scaleX: 0 }}
                    animate={hoveredCard === action.id ? { scaleX: 1 } : { scaleX: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />

                  {/* Icon Container with Enhanced Styling */}
                  <motion.div 
                    className={`relative z-20 w-12 h-12 ${action.iconBg} rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:shadow-lg shadow-md ring-1 ring-white`}
                    whileHover={{ rotate: 10, scale: 1.08 }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={hoveredCard === action.id ? { scale: 1, opacity: 1, y: [0, -3, 0] } : { scale: 1, opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 + 0.15, type: 'spring', stiffness: 100 }}
                  >
                    <action.icon size={21} className={`${action.text}`} strokeWidth={1.7} />
                  </motion.div>

                  {/* Content Section with Better Typography */}
                  <div className="relative z-20 mb-4 space-y-2">
                    <h4 className="text-base font-extrabold leading-tight text-slate-950">{action.label}</h4>
                    <p className="text-sm font-medium leading-relaxed text-slate-600">{action.description}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <action.metricIcon size={12} className={action.text} />
                      <span className="text-[11px] font-bold text-slate-500">{action.metric}</span>
                    </div>
                  </div>

                  {/* Interactive Hint with Smooth Animation */}
                  <motion.div 
                    className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1"
                    initial={false}
                  >
                    <span className="text-[11px] font-semibold text-gray-700">Tap to start</span>
                    <motion.div
                      animate={hoveredCard === action.id ? { x: [0, 6, 2] } : { x: 0 }}
                      transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.5 }}
                    >
                      <ArrowRight size={14} className={`${action.text}`} strokeWidth={2} />
                    </motion.div>
                  </motion.div>

                  {/* Floating Action Indicator - Bottom Right */}
                  <motion.div 
                    className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    whileHover={{ scale: 1.15, rotate: 8 }}
                  >
                    <div className={`w-9 h-9 ${action.iconBg} rounded-xl flex items-center justify-center shadow-md ring-2 ring-white`}>
                      <motion.div
                        animate={{ scale: [1, 1.25, 1], opacity: [1, 0.7, 1] }}
                        transition={{ duration: 1.8, repeat: Infinity }}
                      >
                        <Zap size={15} className={action.text} strokeWidth={2} />
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Background Illustration with Smart Overlay */}
                  {action.image && (
                    <div className="absolute inset-0 opacity-6 group-hover:opacity-12 transition-all duration-700 group-hover:scale-110 pointer-events-none overflow-hidden rounded-3xl">
                      <img 
                        src={action.image} 
                        alt="" 
                        className="w-full h-full object-cover object-center blur-sm" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent opacity-50" />
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>

        </div>

        {/* MODALS */}
        <AddTransactionModal isOpen={activeModal === 'transaction'} onClose={() => setActiveModal(null)} onSuccess={handleSuccess} />
        <ReceiptUploadModal isOpen={activeModal === 'upload'} onClose={() => setActiveModal(null)} onSuccess={handleSuccess} />
        <AddAccountModal isOpen={activeModal === 'account'} onClose={() => setActiveModal(null)} onSuccess={handleSuccess} />
        <CreateBudgetModal isOpen={activeModal === 'budget'} onClose={() => setActiveModal(null)} onSuccess={handleSuccess} />
      </>
    );
  }

  // ========== GEMINI INSPIRED VARIANT (With Metrics) ==========
  if (variant === 'gemini') {
    return (
      <>
        <div className="space-y-5">
          {/* Header with Gemini style */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-blue-500" />
              <h3 className="text-sm font-medium text-gray-700">Suggested actions</h3>
            </div>
            <button className="text-xs text-blue-600 hover:text-blue-700 transition-colors">
              View all →
            </button>
          </div>

          {/* Gemini Style Action Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {actions.map((action, idx) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={action.onClick}
                className="group bg-white rounded-xl border border-gray-100 p-4 text-center hover:shadow-md transition-all duration-200 overflow-hidden relative"
              >
                {/* Illustration/Image if available - Full Card Background */}
                {action.image && (
                  <div className="absolute inset-0 w-full h-full opacity-5 group-hover:opacity-10 transition-all duration-700 group-hover:scale-105 pointer-events-none">
                    <img src={action.image} alt="" className="w-full h-full object-cover object-center" />
                  </div>
                )}
                
                <div className={`w-10 h-10 ${action.iconBg} rounded-xl flex items-center justify-center mx-auto mb-3 transition-all duration-300 group-hover:scale-110 relative z-10`}>
                  <action.icon size={18} className={action.text} />
                </div>
                <p className="text-sm font-medium text-gray-800 mb-1">{action.label}</p>
                <p className="text-[10px] text-gray-400">{action.shortDesc}</p>
                
                {/* Metric Badge */}
                <div className="flex items-center justify-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <action.metricIcon size={10} className={action.text} />
                  <span className="text-[9px] text-gray-400">{action.metric}</span>
                </div>
              </motion.button>
            ))}
          </div>

          {/* AI Suggestion Bar */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Lightbulb size={18} className="text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">AI Suggestion</p>
                <p className="text-xs text-gray-500">Based on your spending pattern, create a budget for this month</p>
              </div>
            </div>
            <button 
              onClick={() => setActiveModal('budget')}
              className="px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-blue-600 hover:bg-gray-50 transition-colors"
            >
              Create →
            </button>
          </div>
        </div>

        {/* Modals */}
        <AddTransactionModal isOpen={activeModal === 'transaction'} onClose={() => setActiveModal(null)} onSuccess={handleSuccess} />
        <ReceiptUploadModal isOpen={activeModal === 'upload'} onClose={() => setActiveModal(null)} onSuccess={handleSuccess} />
        <AddAccountModal isOpen={activeModal === 'account'} onClose={() => setActiveModal(null)} onSuccess={handleSuccess} />
        <CreateBudgetModal isOpen={activeModal === 'budget'} onClose={() => setActiveModal(null)} onSuccess={handleSuccess} />
      </>
    );
  }

  // ========== GOOGLE KEEP STYLE (Sticky Notes) ==========
  if (variant === 'keep') {
    const colors = [
      { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600' },
      { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-600' },
      { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-600' },
      { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-600' },
    ];

    return (
      <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions.map((action, idx) => (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, rotate: -2 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ rotate: 1, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={action.onClick}
              className={`${colors[idx % colors.length].bg} rounded-2xl p-5 text-left border ${colors[idx % colors.length].border} shadow-sm transition-all duration-200`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 bg-white rounded-xl shadow-sm`}>
                  <action.icon size={18} className={colors[idx % colors.length].icon} />
                </div>
                <div className="w-6 h-6 rounded-full bg-white/50"></div>
              </div>
              <p className="font-medium text-gray-800 text-sm mb-1">{action.label}</p>
              <p className="text-xs text-gray-500">{action.description}</p>
              <div className="mt-3 flex items-center gap-1 text-[10px] text-gray-400">
                <Clock size={10} />
                <span>Quick action</span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Modals */}
        <AddTransactionModal isOpen={activeModal === 'transaction'} onClose={() => setActiveModal(null)} onSuccess={handleSuccess} />
        <ReceiptUploadModal isOpen={activeModal === 'upload'} onClose={() => setActiveModal(null)} onSuccess={handleSuccess} />
        <AddAccountModal isOpen={activeModal === 'account'} onClose={() => setActiveModal(null)} onSuccess={handleSuccess} />
        <CreateBudgetModal isOpen={activeModal === 'budget'} onClose={() => setActiveModal(null)} onSuccess={handleSuccess} />
      </>
    );
  }

  // ========== DEFAULT VARIANT (Enhanced Original) ==========
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, idx) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            onClick={action.onClick}
            className="group bg-white rounded-2xl border border-gray-100 p-5 text-center hover:shadow-lg transition-all duration-300 overflow-hidden relative"
          >
            {/* Illustration/Image if available - Full Card Background */}
            {action.image && (
              <div className="absolute inset-0 w-full h-full opacity-5 group-hover:opacity-15 transition-all duration-700 group-hover:scale-105 pointer-events-none">
                <img src={action.image} alt="" className="w-full h-full object-cover object-center" />
              </div>
            )}

            <div className={`relative w-12 h-12 ${action.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-3 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md z-10`}>
              <action.icon size={22} className={action.text} />
              
              {/* Notification dot */}
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            
            <p className="text-sm font-semibold text-gray-800 mb-1">{action.label}</p>
            <p className="text-xs text-gray-400">{action.description}</p>
            
            <div className="mt-3 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Sparkles size={10} className={action.text} />
              <span className="text-[10px] text-gray-400">Click to start</span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Modals */}
      <AddTransactionModal isOpen={activeModal === 'transaction'} onClose={() => setActiveModal(null)} onSuccess={handleSuccess} />
      <ReceiptUploadModal isOpen={activeModal === 'upload'} onClose={() => setActiveModal(null)} onSuccess={handleSuccess} />
      <AddAccountModal isOpen={activeModal === 'account'} onClose={() => setActiveModal(null)} onSuccess={handleSuccess} />
      <CreateBudgetModal isOpen={activeModal === 'budget'} onClose={() => setActiveModal(null)} onSuccess={handleSuccess} />
    </>
  );
};

// ========== COMPACT ACTION BAR (Google Style) ==========
export const CompactActionBar = ({ onRefresh }) => {
  const [activeModal, setActiveModal] = useState(null);
  
  const actions = [
    { id: 'transaction', icon: Plus, label: 'Transaction', color: 'blue', bg: 'bg-blue-50', text: 'text-blue-600' },
    { id: 'upload', icon: Upload, label: 'Receipt', color: 'purple', bg: 'bg-purple-50', text: 'text-purple-600' },
    { id: 'account', icon: Wallet, label: 'Account', color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-600' },
    { id: 'budget', icon: Target, label: 'Budget', color: 'orange', bg: 'bg-orange-50', text: 'text-orange-600' },
  ];

  const handleSuccess = () => {
    if (onRefresh) onRefresh();
    setActiveModal(null);
  };

  return (
    <>
      <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-full w-fit">
        {actions.map((action) => (
          <motion.button
            key={action.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveModal(action.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all bg-white shadow-sm hover:shadow-md ${action.text}`}
          >
            <action.icon size={16} />
            <span className="hidden sm:inline">{action.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Modals */}
      <AddTransactionModal isOpen={activeModal === 'transaction'} onClose={() => setActiveModal(null)} onSuccess={handleSuccess} />
      <ReceiptUploadModal isOpen={activeModal === 'upload'} onClose={() => setActiveModal(null)} onSuccess={handleSuccess} />
      <AddAccountModal isOpen={activeModal === 'account'} onClose={() => setActiveModal(null)} onSuccess={handleSuccess} />
      <CreateBudgetModal isOpen={activeModal === 'budget'} onClose={() => setActiveModal(null)} onSuccess={handleSuccess} />
    </>
  );
};

// ========== FLOATING ACTION BUTTON (FAB) ==========
export const FloatingActionButton = ({ onRefresh }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  const actions = [
    { id: 'transaction', icon: Plus, label: 'Add Transaction', color: 'bg-blue-500', text: 'text-blue-600' },
    { id: 'upload', icon: Upload, label: 'Upload Receipt', color: 'bg-purple-500', text: 'text-purple-600' },
    { id: 'account', icon: Wallet, label: 'Add Account', color: 'bg-emerald-500', text: 'text-emerald-600' },
    { id: 'budget', icon: Target, label: 'Create Budget', color: 'bg-orange-500', text: 'text-orange-600' },
  ];

  const handleSuccess = () => {
    if (onRefresh) onRefresh();
    setActiveModal(null);
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative">
        <motion.button
          animate={{ rotate: isOpen ? 45 : 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white"
        >
          <Plus size={24} />
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <div className="absolute bottom-16 right-0 space-y-2">
              {actions.map((action, idx) => (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setActiveModal(action.id)}
                  className="flex items-center gap-3 bg-white rounded-xl px-4 py-2 shadow-md hover:shadow-lg transition-shadow whitespace-nowrap"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${action.color} bg-opacity-10`}>
                    <action.icon size={14} className={action.text} />
                  </div>
                  <span className="text-sm text-gray-700">{action.label}</span>
                </motion.button>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AddTransactionModal isOpen={activeModal === 'transaction'} onClose={() => setActiveModal(null)} onSuccess={handleSuccess} />
      <ReceiptUploadModal isOpen={activeModal === 'upload'} onClose={() => setActiveModal(null)} onSuccess={handleSuccess} />
      <AddAccountModal isOpen={activeModal === 'account'} onClose={() => setActiveModal(null)} onSuccess={handleSuccess} />
      <CreateBudgetModal isOpen={activeModal === 'budget'} onClose={() => setActiveModal(null)} onSuccess={handleSuccess} />
    </>
  );
};

export default QuickActions;
