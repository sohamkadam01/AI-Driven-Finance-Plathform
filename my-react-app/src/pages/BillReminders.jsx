import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, List, History, BarChart3, Plus,
  Bell, AlertCircle, Sparkles, Wallet, TrendingUp,
  ChevronLeft, ChevronRight, Clock, DollarSign, X, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

// Components
import BillCalendar from '../components/BillReminders/BillCalendar';
import UpcomingBillsList from '../components/BillReminders/UpcomingBillsList';
import AddBillModal from '../components/BillReminders/AddBillModal';
import BillHistory from '../components/BillReminders/BillHistory';
import MonthlyBillSummary from '../components/BillReminders/MonthlyBillSummary';
import CategoryBreakdown from '../components/BillReminders/CategoryBreakdown';
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

const BillReminders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [upcomingBills, setUpcomingBills] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [billHistory, setBillHistory] = useState(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [paymentBill, setPaymentBill] = useState(null);
  const [selectedPaymentAccountId, setSelectedPaymentAccountId] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // Fetch all bill data
  const fetchBillData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const upcomingResponse = await axios.get(`${API_BASE_URL}/bill-reminders/upcoming`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUpcomingBills(upcomingResponse.data || []);
      
      const summaryResponse = await axios.get(`${API_BASE_URL}/bill-reminders/monthly-summary/current`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMonthlySummary(summaryResponse.data.summary);
      
      const historyResponse = await axios.get(`${API_BASE_URL}/bill-reminders/history?months=12`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBillHistory(historyResponse.data.history);
      
      if (upcomingResponse.data) {
        const breakdown = calculateCategoryBreakdown(upcomingResponse.data);
        setCategoryBreakdown(breakdown);
      }

      const accountsResponse = await axios.get(`${API_BASE_URL}/accounts/my-accounts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAccounts(accountsResponse.data || []);
      
    } catch (err) {
      console.error('Failed to fetch bill data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateCategoryBreakdown = (bills) => {
    const breakdown = {};
    bills.forEach(bill => {
      const category = bill.category || 'Other';
      if (!breakdown[category]) {
        breakdown[category] = { total: 0, count: 0, icon: getCategoryIcon(category) };
      }
      breakdown[category].total += bill.amount;
      breakdown[category].count++;
    });
    return breakdown;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Entertainment': '🎬',
      'Utilities': '💡',
      'Shopping': '🛍️',
      'Transport': '🚗',
      'Food': '🍔',
      'Subscription': '📺',
      'Insurance': '🛡️',
      'Rent': '🏠',
      'Internet': '🌐',
      'Phone': '📱',
      'Other': '📄'
    };
    return icons[category] || '📄';
  };

  useEffect(() => {
    fetchBillData();
  }, []);

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 2, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth, 1));
  };

  const getBillId = (billOrId) => (
    typeof billOrId === 'object' ? (billOrId.recurringId || billOrId.billId) : billOrId
  );

  const activeAccounts = accounts.filter(account => account.active !== false);

  const payBillFromAccount = async (billOrId, accountId) => {
    const billId = getBillId(billOrId);
    if (!billId) {
      setPaymentError('Could not identify this bill. Please refresh and try again.');
      return;
    }

    setPaymentLoading(true);
    setPaymentError('');
    try {
      const token = localStorage.getItem('token');
      const params = accountId ? { accountId } : {};
      await axios.put(`${API_BASE_URL}/bill-reminders/${billId}/mark-paid`, {}, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      setPaymentBill(null);
      setSelectedPaymentAccountId('');
      await fetchBillData();
    } catch (err) {
      console.error('Failed to mark bill as paid:', err);
      setPaymentError(err.response?.data?.error || err.response?.data?.message || 'Failed to mark bill as paid');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleMarkAsPaid = async (billOrId) => {
    setPaymentError('');

    if (activeAccounts.length === 0) {
      setPaymentError('Add an account before marking a bill as paid.');
      return;
    }

    if (activeAccounts.length > 1) {
      setPaymentBill(billOrId);
      setSelectedPaymentAccountId('');
      return;
    }

    await payBillFromAccount(billOrId, activeAccounts[0].accountId);
  };

  const handleConfirmPaymentAccount = async () => {
    if (!selectedPaymentAccountId) {
      setPaymentError('Please choose an account for this payment.');
      return;
    }

    await payBillFromAccount(paymentBill, selectedPaymentAccountId);
  };

  const handleEditBill = (bill) => {
    setEditingBill(bill);
    setIsAddModalOpen(true);
  };

  const handleDeleteBill = async (billId) => {
    if (!confirm('Are you sure you want to delete this bill reminder?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/bill-reminders/${billId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBillData();
    } catch (err) {
      console.error('Failed to delete bill:', err);
    }
  };

  const tabs = [
    { id: 'calendar', label: 'Calendar', icon: Calendar, color: 'blue' },
    { id: 'upcoming', label: 'Upcoming', icon: List, color: 'purple', badge: upcomingBills.filter(b => !b.paid).length },
    { id: 'history', label: 'History', icon: History, color: 'emerald' },
    { id: 'summary', label: 'Summary', icon: BarChart3, color: 'orange' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.5, staggerChildren: 0.05 }
    }
  };

  // Calculate total upcoming amount
  const totalUpcomingAmount = upcomingBills
    .filter(b => !b.paid)
    .reduce((sum, b) => sum + (b.amount || 0), 0);

  const upcomingCount = upcomingBills.filter(b => !b.paid).length;

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
                <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">Payment Tracker</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Bill Reminders</h1>
              <p className="text-gray-500 text-sm mt-1">Never miss a payment again</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Stats Summary */}
              <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-white rounded-xl border border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <DollarSign size={14} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400">Due Amount</p>
                    <p className="text-sm font-semibold text-gray-900">₹{totalUpcomingAmount.toLocaleString()}</p>
                  </div>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock size={14} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400">Upcoming</p>
                    <p className="text-sm font-semibold text-gray-900">{upcomingCount} bills</p>
                  </div>
                </div>
              </div>
              
              {/* Add Bill Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setEditingBill(null);
                  setIsAddModalOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md shadow-blue-200 hover:shadow-lg transition-all"
              >
                <Plus size={18} />
                <span className="font-medium">Add Bill</span>
              </motion.button>
            </div>
          </div>

          {/* AI Insight Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 mb-8 text-white relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full -ml-20 -mb-20"></div>
            
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Bell size={22} className="text-yellow-300" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-100 mb-1">Upcoming Payments</p>
                <p className="text-white text-base leading-relaxed">
                  You have <strong className="text-yellow-200">{upcomingCount}</strong> upcoming bill{upcomingCount !== 1 ? 's' : ''} totaling <strong className="text-yellow-200">₹{totalUpcomingAmount.toLocaleString()}</strong>.
                  {upcomingCount > 0 && " Set up auto-pay to avoid late fees."}
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
                const badgeCount = tab.badge || 0;
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
                    {badgeCount > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-medium rounded-full">
                        {badgeCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {paymentError && !paymentBill && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              <AlertCircle size={16} />
              <span>{paymentError}</span>
            </div>
          )}

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'calendar' && (
                <BillCalendar
                  year={currentYear}
                  month={currentMonth}
                  bills={upcomingBills}
                  onMarkAsPaid={handleMarkAsPaid}
                  onPreviousMonth={handlePreviousMonth}
                  onNextMonth={handleNextMonth}
                  loading={loading}
                />
              )}

              {activeTab === 'upcoming' && (
                <div className="space-y-6">
                  <div>
                    <SectionHeader
                      title="Upcoming Bills"
                      description="Review unpaid bills, total pending amount, and due-soon payments"
                      accentClass="bg-gradient-to-b from-rose-500 to-pink-500 shadow-rose-500/25"
                      titleClass="bg-gradient-to-r from-slate-950 to-rose-700"
                    />
                    <UpcomingBillsList
                      bills={upcomingBills}
                      onMarkAsPaid={handleMarkAsPaid}
                      onEdit={handleEditBill}
                      onDelete={handleDeleteBill}
                      loading={loading}
                    />
                  </div>
                  {categoryBreakdown && Object.keys(categoryBreakdown).length > 0 && (
                    <CategoryBreakdown breakdown={categoryBreakdown} />
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div>
                  <SectionHeader
                    title="History Summary"
                    description="Review paid, missed, and historical bill activity"
                    accentClass="bg-gradient-to-b from-emerald-500 to-teal-500 shadow-emerald-500/25"
                    titleClass="bg-gradient-to-r from-slate-950 to-emerald-700"
                  />
                  <BillHistory history={billHistory} loading={loading} />
                </div>
              )}

              {activeTab === 'summary' && (
                <div>
                  <SectionHeader
                    title="Bill Summary"
                    description="Track total bills, paid bills, unpaid bills, and pending payments"
                    accentClass="bg-gradient-to-b from-amber-500 to-orange-500 shadow-amber-500/25"
                    titleClass="bg-gradient-to-r from-slate-950 to-amber-700"
                  />
                  <MonthlyBillSummary summary={monthlySummary} loading={loading} />
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
              <Sparkles size={10} />
              Set up reminders to never miss a payment
            </p>
          </motion.div>
        </div>
      </motion.div>

      {paymentBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Choose Payment Account</h2>
                <p className="mt-0.5 text-sm text-gray-500">
                  {paymentBill.name} - INR {Number(paymentBill.amount || 0).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => {
                  setPaymentBill(null);
                  setSelectedPaymentAccountId('');
                  setPaymentError('');
                }}
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 p-6">
              {activeAccounts.map(account => (
                <label
                  key={account.accountId}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all ${
                    String(selectedPaymentAccountId) === String(account.accountId)
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100'
                      : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentAccount"
                    value={account.accountId}
                    checked={String(selectedPaymentAccountId) === String(account.accountId)}
                    onChange={(event) => {
                      setSelectedPaymentAccountId(event.target.value);
                      setPaymentError('');
                    }}
                    className="h-4 w-4 accent-blue-600"
                  />
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                    <Wallet size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {account.bankName} {account.accountNumber ? `- ${account.accountNumber}` : ''}
                    </p>
                    <p className="text-xs text-gray-500">
                      {account.accountType || 'Account'} - Balance INR {Number(account.currentBalance || 0).toLocaleString()}
                    </p>
                  </div>
                </label>
              ))}

              {paymentError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  <AlertCircle size={16} />
                  <span>{paymentError}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setPaymentBill(null);
                  setSelectedPaymentAccountId('');
                  setPaymentError('');
                }}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPaymentAccount}
                disabled={paymentLoading}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:bg-green-300"
              >
                {paymentLoading && <Loader2 size={16} className="animate-spin" />}
                Mark Paid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Bill Modal */}
      <AddBillModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingBill(null);
        }}
        onSuccess={fetchBillData}
        editingBill={editingBill}
      />
    </Layout>
  );
};

export default BillReminders;
