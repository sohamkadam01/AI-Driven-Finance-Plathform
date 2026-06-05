import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Sidebar from './Sidebar';
import Header from './Header';
import ChatWidget from '../Chat/ChatWidget';
import axios from 'axios';
import { useRef } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const POLL_INTERVAL_MS = 15000;
const RECENT_POPUP_WINDOW_MS = 5 * 60 * 1000;

const getAlertPopupConfig = (alert) => {
  const configs = {
    BUDGET_WARNING: {
      title: 'Budget needs attention',
      subtitle: 'Budget alert',
      type: 'warning'
    },
    BILL_REMINDER: {
      title: 'Bill reminder',
      subtitle: 'Upcoming payment',
      type: 'info'
    },
    UNUSUAL_SPENDING: {
      title: 'Unusual spending detected',
      subtitle: 'Anomaly detection',
      type: 'error'
    },
    FINANCIAL_INSIGHT: {
      title: 'New financial insight',
      subtitle: 'AI insight',
      type: 'insight'
    },
    INVESTMENT_ADVICE: {
      title: 'Investment advice is ready',
      subtitle: 'Recommendation',
      type: 'insight'
    },
    INVESTMENT_UPDATE: {
      title: 'Portfolio update',
      subtitle: 'Investment',
      type: 'success'
    },
    TRANSACTION_UPDATE: {
      title: 'Transaction recorded',
      subtitle: 'Account activity',
      type: 'info'
    },
    RECEIPT_PROCESSED: {
      title: 'Receipt processed',
      subtitle: 'OCR complete',
      type: 'success'
    }
  };

  return configs[alert.type] || {
    title: 'New notification',
    subtitle: 'Finance update',
    type: 'info'
  };
};

const cleanAlertMessage = (message = '') =>
  message
    .replace(/[🔴📅🔔✅⚠️]/g, '')
    .replace(/₹/g, 'Rs ')
    .replace(/\s+/g, ' ')
    .trim();

const isRecentAlert = (alert) => {
  const createdAt = alert.createdAt ? new Date(alert.createdAt).getTime() : Date.now();
  return Date.now() - createdAt <= RECENT_POPUP_WINDOW_MS;
};

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const lastAlertIdRef = useRef(null);
  const hasSyncedAlertsRef = useRef(false);
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Poll for new notifications
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkNewAlerts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get(`${API_BASE_URL}/alerts/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const alerts = response.data || [];
        const newestAlert = alerts[0];

        const showAlertPopup = (alert) => {
          const popup = getAlertPopupConfig(alert);

          showToast(
            cleanAlertMessage(alert.message),
            popup.type,
            7000,
            {
              title: popup.title,
              subtitle: popup.subtitle,
              actionLabel: alert.actionUrl ? 'Open' : undefined,
              onAction: alert.actionUrl ? () => navigate(alert.actionUrl) : undefined
            }
          );
        };

        if (!hasSyncedAlertsRef.current) {
          hasSyncedAlertsRef.current = true;

          if (newestAlert) {
            lastAlertIdRef.current = newestAlert.alertId;

            if (!newestAlert.read && isRecentAlert(newestAlert)) {
              showAlertPopup(newestAlert);
            }
          }

          return;
        }

        if (newestAlert) {
          if (!newestAlert.read && newestAlert.alertId !== lastAlertIdRef.current) {
            lastAlertIdRef.current = newestAlert.alertId;
            showAlertPopup(newestAlert);
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    // Initial check
    checkNewAlerts();

    const interval = setInterval(checkNewAlerts, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isAuthenticated, navigate, showToast]);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed);
  }, [sidebarCollapsed]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)] transition-colors duration-300">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar 
          isCollapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
          onLogout={handleLogout}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Mobile Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full z-50 transition-transform duration-300 lg:hidden
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar 
          isCollapsed={false}
          onToggle={toggleMobileMenu}
          onLogout={handleLogout}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <Header 
          user={user}
          onMenuClick={toggleMobileMenu}
          onLogout={handleLogout}
        />
        <main className="flex-1">
          {children}
        </main>
      </div>
      <ChatWidget />
    </div>
  );
};

export default Layout;
