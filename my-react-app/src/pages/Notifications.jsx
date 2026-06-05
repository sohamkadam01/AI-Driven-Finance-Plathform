import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Archive,
  Bell,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  CreditCard,
  Eye,
  FileCheck,
  Lightbulb,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  TrendingUp,
  Wallet
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout/Layout';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const POLL_INTERVAL_MS = 15000;
const ACTIVE_WINDOW_DAYS = 30;

const notificationTypes = {
  BUDGET_WARNING: {
    label: 'Budget',
    icon: AlertTriangle,
    panel: 'bg-amber-50 border-amber-200',
    iconWrap: 'bg-amber-100 text-amber-700',
    chip: 'bg-amber-100 text-amber-800',
    accent: 'border-l-amber-500',
    description: 'Spending threshold'
  },
  BILL_REMINDER: {
    label: 'Bill reminder',
    icon: Calendar,
    panel: 'bg-sky-50 border-sky-200',
    iconWrap: 'bg-sky-100 text-sky-700',
    chip: 'bg-sky-100 text-sky-800',
    accent: 'border-l-sky-500',
    description: 'Due soon'
  },
  UNUSUAL_SPENDING: {
    label: 'Anomaly detection',
    icon: Shield,
    panel: 'bg-red-50 border-red-200',
    iconWrap: 'bg-red-100 text-red-700',
    chip: 'bg-red-100 text-red-800',
    accent: 'border-l-red-500',
    description: 'Needs review'
  },
  FINANCIAL_INSIGHT: {
    label: 'Financial insight',
    icon: Sparkles,
    panel: 'bg-violet-50 border-violet-200',
    iconWrap: 'bg-violet-100 text-violet-700',
    chip: 'bg-violet-100 text-violet-800',
    accent: 'border-l-violet-500',
    description: 'AI signal'
  },
  INVESTMENT_ADVICE: {
    label: 'Investment advice',
    icon: Lightbulb,
    panel: 'bg-emerald-50 border-emerald-200',
    iconWrap: 'bg-emerald-100 text-emerald-700',
    chip: 'bg-emerald-100 text-emerald-800',
    accent: 'border-l-emerald-500',
    description: 'Recommendation'
  },
  INVESTMENT_UPDATE: {
    label: 'Investment',
    icon: TrendingUp,
    panel: 'bg-teal-50 border-teal-200',
    iconWrap: 'bg-teal-100 text-teal-700',
    chip: 'bg-teal-100 text-teal-800',
    accent: 'border-l-teal-500',
    description: 'Portfolio update'
  },
  TRANSACTION_UPDATE: {
    label: 'Transaction',
    icon: CreditCard,
    panel: 'bg-indigo-50 border-indigo-200',
    iconWrap: 'bg-indigo-100 text-indigo-700',
    chip: 'bg-indigo-100 text-indigo-800',
    accent: 'border-l-indigo-500',
    description: 'Account activity'
  },
  RECEIPT_PROCESSED: {
    label: 'Receipt',
    icon: FileCheck,
    panel: 'bg-green-50 border-green-200',
    iconWrap: 'bg-green-100 text-green-700',
    chip: 'bg-green-100 text-green-800',
    accent: 'border-l-green-500',
    description: 'OCR complete'
  }
};

const fallbackType = {
  label: 'Notification',
  icon: Bell,
  panel: 'bg-slate-50 border-slate-200',
  iconWrap: 'bg-slate-100 text-slate-700',
  chip: 'bg-slate-100 text-slate-800',
  accent: 'border-l-slate-500',
  description: 'Update'
};

const formatType = (type) =>
  notificationTypes[type]?.label ||
  type?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()) ||
  'Notification';

const parseDueDate = (message = '') => {
  const isoMatch = message.match(/\b\d{4}-\d{2}-\d{2}\b/);
  if (isoMatch) return new Date(`${isoMatch[0]}T23:59:59`);

  const today = new Date();
  if (/due today/i.test(message)) return today;
  if (/due tomorrow/i.test(message)) {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return tomorrow;
  }
  return null;
};

const isCurrentNotification = (notification) => {
  const createdAt = notification.createdAt ? new Date(notification.createdAt) : null;
  const activeSince = new Date();
  activeSince.setDate(activeSince.getDate() - ACTIVE_WINDOW_DAYS);

  if (createdAt && createdAt < activeSince) return false;

  if (notification.type === 'BILL_REMINDER') {
    const dueDate = parseDueDate(notification.message);
    if (dueDate) {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      return dueDate >= startOfToday;
    }
  }

  return true;
};

const getRelativeTime = (value) => {
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (Number.isNaN(date.getTime())) return 'Just now';
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

const Notifications = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchNotifications = useCallback(async ({ silent = false } = {}) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    if (!silent) setLoading(true);
    setError('');

    try {
      const response = await axios.get(`${API_BASE_URL}/alerts/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const activeAlerts = (response.data || [])
        .filter(isCurrentNotification)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setNotifications(activeAlerts);
      setLastUpdated(new Date());
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }
      setError(err.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (isAuthenticated || localStorage.getItem('token')) {
      fetchNotifications();
    } else {
      navigate('/login');
    }
  }, [fetchNotifications, isAuthenticated, navigate]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchNotifications({ silent: true });
      }
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [fetchNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const summaryCards = useMemo(() => [
    { value: 'all', label: 'All', icon: Bell, count: notifications.length },
    { value: 'unread', label: 'Unread', icon: Eye, count: unreadCount },
    { value: 'UNUSUAL_SPENDING', label: 'Anomalies', icon: Shield, count: notifications.filter((n) => n.type === 'UNUSUAL_SPENDING').length },
    { value: 'INVESTMENT_ADVICE', label: 'Advice', icon: Lightbulb, count: notifications.filter((n) => n.type === 'INVESTMENT_ADVICE').length },
    { value: 'INVESTMENT_UPDATE', label: 'Investments', icon: TrendingUp, count: notifications.filter((n) => n.type === 'INVESTMENT_UPDATE').length },
    { value: 'BILL_REMINDER', label: 'Bills', icon: Calendar, count: notifications.filter((n) => n.type === 'BILL_REMINDER').length },
    { value: 'TRANSACTION_UPDATE', label: 'Transactions', icon: CreditCard, count: notifications.filter((n) => n.type === 'TRANSACTION_UPDATE').length }
  ], [notifications, unreadCount]);

  const filteredNotifications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return notifications.filter((notification) => {
      if (statusFilter === 'unread' && notification.read) return false;
      if (typeFilter !== 'all' && notification.type !== typeFilter) return false;
      if (!query) return true;

      return [
        notification.message,
        notification.title,
        notification.type,
        formatType(notification.type)
      ].some((value) => value?.toLowerCase().includes(query));
    });
  }, [notifications, searchQuery, statusFilter, typeFilter]);

  const handleCardSelect = (value) => {
    if (value === 'unread') {
      setStatusFilter('unread');
      setTypeFilter('all');
      return;
    }

    setStatusFilter('all');
    setTypeFilter(value);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications({ silent: true });
  };

  const handleMarkAsRead = async (alertId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await axios.put(`${API_BASE_URL}/alerts/${alertId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications((current) =>
        current.map((notification) =>
          notification.alertId === alertId ? { ...notification, read: true } : notification
        )
      );
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
    }
  };

  const handleMarkAllAsRead = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await axios.put(`${API_BASE_URL}/alerts/mark-all-read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setTypeFilter('all');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                  <Bell size={22} />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-slate-950">Real-time Notifications</h1>
                  <p className="text-sm text-slate-500">
                    Live alerts for anomalies, investments, advice, bills, and transactions.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Live polling
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:opacity-70"
              >
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
                >
                  <Check size={16} />
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
            {summaryCards.map((card) => {
              const Icon = card.icon;
              const active = (card.value === 'unread' && statusFilter === 'unread') || typeFilter === card.value;

              return (
                <button
                  key={card.value}
                  onClick={() => handleCardSelect(card.value)}
                  className={`rounded-lg border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                    active ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                      <Icon size={18} />
                    </span>
                    <span className="text-xl font-semibold text-slate-950">{card.count}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-700">{card.label}</p>
                </button>
              );
            })}
          </div>

          <div className="mb-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by message or notification type"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="all">All statuses</option>
                  <option value="unread">Unread only</option>
                </select>
                <button
                  onClick={clearFilters}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Clock size={13} />
                {lastUpdated ? `Updated ${getRelativeTime(lastUpdated)}` : 'Waiting for sync'}
              </span>
              <span>Past bill reminders and alerts older than {ACTIVE_WINDOW_DAYS} days are hidden.</span>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex gap-4">
                    <div className="h-11 w-11 animate-pulse rounded-lg bg-slate-200" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
                      <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                      <div className="h-3 w-1/4 animate-pulse rounded bg-slate-100" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                <Bell size={30} />
              </div>
              <h2 className="text-lg font-semibold text-slate-950">No current notifications</h2>
              <p className="mt-1 text-sm text-slate-500">
                You are caught up, or the selected filters do not have active alerts.
              </p>
              {(searchQuery || statusFilter !== 'all' || typeFilter !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredNotifications.map((notification, index) => {
                  const typeConfig = notificationTypes[notification.type] || fallbackType;
                  const Icon = typeConfig.icon;
                  const isUnread = !notification.read;

                  return (
                    <motion.article
                      key={notification.alertId}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -32 }}
                      transition={{ delay: index * 0.015 }}
                      className={`rounded-lg border bg-white shadow-sm transition hover:shadow-md ${
                        isUnread ? `border-l-4 ${typeConfig.accent}` : 'border-slate-200'
                      }`}
                    >
                      <div className="p-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start">
                          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${typeConfig.iconWrap}`}>
                            <Icon size={20} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-slate-950">
                                {notification.title || formatType(notification.type)}
                              </h3>
                              {isUnread && (
                                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                  New
                                </span>
                              )}
                              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeConfig.chip}`}>
                                {typeConfig.description}
                              </span>
                            </div>

                            <p className="whitespace-pre-line text-sm leading-6 text-slate-600">
                              {notification.message}
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                              <span className="inline-flex items-center gap-1">
                                <Clock size={13} />
                                {getRelativeTime(notification.createdAt)}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Wallet size={13} />
                                {formatType(notification.type)}
                              </span>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-1">
                            {isUnread && (
                              <button
                                onClick={() => handleMarkAsRead(notification.alertId)}
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-green-50 hover:text-green-700"
                                title="Mark as read"
                              >
                                <Check size={16} />
                              </button>
                            )}
                            <button
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                              title="Archive"
                              type="button"
                            >
                              <Archive size={16} />
                            </button>
                          </div>
                        </div>

                        {notification.actionUrl && (
                          <div className="mt-4 border-t border-slate-100 pt-3">
                            <button
                              onClick={() => navigate(notification.actionUrl)}
                              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-700"
                            >
                              View details
                              <ChevronRight size={15} />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;
