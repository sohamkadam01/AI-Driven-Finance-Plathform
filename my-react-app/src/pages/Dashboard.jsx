import React, { useState, useEffect, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet, Percent, TrendingUp, ShieldCheck,
  Sparkles, ChevronRight, CircleDollarSign,
  Activity, ArrowUpRight, ArrowDownRight,
  RefreshCw, Calendar, Landmark, ChevronLeft,
  Bot, ShieldAlert, X, CheckCircle2, AlertTriangle,
  TrendingDown, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Components
import Layout from '../components/Layout/Layout';
import NetWorthChart from '../components/Dashboard/NetWorthChart';
import CashFlowChart from '../components/Dashboard/CashFlowChart';
import QuickActions from '../components/Dashboard/QuickActions';
import RecentTransactions from '../components/Dashboard/RecentTransactions';
import UpcomingBillsWidget from '../components/Dashboard/UpcomingBillsWidget';
import AddAccountModal from '../components/Dashboard/AddAccountModal';
import totalBalanceImg from '../assets/total_balance.png';
import savingRateImg from '../assets/saving_rate.png';
import financialHealthImg from '../assets/financial_health.png';
import aiInsightImg from '../assets/ai_insight.png';
import overallProgressImg from '../assets/overall_progress.png';
import chatbotOcrShowcase from '../assets/chatbot_ocr_showcase.png';
import securityAnomalyShowcase from '../assets/security_anomaly_showcase.png';
import investmentsPredictionsShowcase from '../assets/investments_predictions_showcase.png';

// Hooks
import { useDashboardData } from '../hooks/useDashboardData';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../services/api';

const queryClient = new QueryClient();

const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

// Simplified CountUp Animation Component
const CountUp = ({ end, duration = 2000, start = 0, suffix = '', prefix = '', trigger = false }) => {
  const [count, setCount] = useState(start);

  useEffect(() => {
    if (!trigger && end === 0) return;

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
  }, [end, start, duration, trigger]);

  return (
    <span>
      {prefix}
      {Math.floor(count).toLocaleString()}
      {suffix}
    </span>
  );
};

const formatMoney = (value) =>
  `Rs. ${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const clampPercent = (value) => Math.max(0, Math.min(100, Number(value || 0)));

const withTimeout = (promise, ms) => {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('AI_TIMEOUT')), ms);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
};

const HighlightedAdvice = ({ text }) => {
  const highlightText = (line) => {
    const parts = line.split(/(\*\*[^*]+\*\*|(?:Rs\.|₹)\s?[\d,]+(?:\.\d+)?|-?\d+(?:\.\d+)?%)/g);

    return parts.map((part, idx) => {
      if (!part) return null;
      const clean = part.replace(/^\*\*|\*\*$/g, '');
      const isHighlighted = part.startsWith('**')
        || /^(?:Rs\.|₹)\s?[\d,]+/.test(part)
        || /^-?\d+(?:\.\d+)?%$/.test(part);

      return isHighlighted ? (
        <mark key={idx} className="rounded-md bg-yellow-100 px-1.5 py-0.5 font-extrabold text-slate-950">
          {clean}
        </mark>
      ) : (
        <React.Fragment key={idx}>{part}</React.Fragment>
      );
    });
  };

  return (
    <div className="space-y-2 text-sm leading-relaxed text-slate-800">
      {String(text || '').split('\n').map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-2" />;

        if (/^[A-Z][A-Z\s]+$/.test(trimmed) || trimmed.endsWith(':')) {
          return (
            <h4 key={idx} className="mt-3 text-xs font-black uppercase tracking-wide text-indigo-700">
              {trimmed}
            </h4>
          );
        }

        if (trimmed.startsWith('-')) {
          return (
            <div key={idx} className="flex gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2 shadow-sm">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-500" />
              <p>{highlightText(trimmed.replace(/^-+\s*/, ''))}</p>
            </div>
          );
        }

        return <p key={idx}>{highlightText(trimmed)}</p>;
      })}
    </div>
  );
};

const EnhancedAdvice = ({ text }) => {
  const highlightText = (line) => {
    const parts = String(line).split(/(\*\*[^*]+\*\*|(?:Rs\.|\u20b9)\s?[\d,]+(?:\.\d+)?|-?\d+(?:\.\d+)?%|\d+(?:\.\d+)?\/100)/g);

    return parts.map((part, idx) => {
      if (!part) return null;
      const clean = part.replace(/^\*\*|\*\*$/g, '');
      const isHighlighted = part.startsWith('**')
        || /^(?:Rs\.|\u20b9)\s?[\d,]+/.test(part)
        || /^-?\d+(?:\.\d+)?%$/.test(part)
        || /^\d+(?:\.\d+)?\/100$/.test(part);

      return isHighlighted ? (
        <mark key={idx} className="rounded-md bg-yellow-100 px-1.5 py-0.5 font-extrabold text-slate-950 dark:bg-yellow-300/20 dark:text-yellow-100">
          {clean}
        </mark>
      ) : (
        <React.Fragment key={idx}>{part}</React.Fragment>
      );
    });
  };

  return (
    <div className="space-y-2 text-sm leading-relaxed text-slate-800 dark:text-slate-200">
      {String(text || '').split('\n').map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-2" />;

        if (/^[A-Z][A-Z\s]+$/.test(trimmed) || trimmed.endsWith(':')) {
          return (
            <h4 key={idx} className="mt-3 text-xs font-black uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
              {trimmed}
            </h4>
          );
        }

        if (trimmed.startsWith('-')) {
          return (
            <div key={idx} className="flex gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-500" />
              <p>{highlightText(trimmed.replace(/^-+\s*/, ''))}</p>
            </div>
          );
        }

        return <p key={idx}>{highlightText(trimmed)}</p>;
      })}
    </div>
  );
};

const DataBar = ({ label, value, max, color, detail }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="font-bold text-slate-600">{label}</span>
      <span className="font-black text-slate-900">{detail}</span>
    </div>
    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${clampPercent((Number(value || 0) / Math.max(Number(max || 1), 1)) * 100)}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  </div>
);

const buildFinancialHealthFallback = ({ healthScore, savingsRateValue, budgetProgress, financialHealth }) => {
  const recommendations = financialHealth?.recommendations || [];
  const weaknesses = financialHealth?.weaknesses || [];
  const strengths = financialHealth?.strengths || [];

  return [
    'RULE BASED FINANCIAL HEALTH IMPROVEMENT PLAN',
    '',
    'Snapshot:',
    `- Current financial health score is **${healthScore}/100**.`,
    `- Current savings rate is **${savingsRateValue}%**.`,
    `- Budget usage is **${Math.round(budgetProgress)}%**.`,
    '',
    'Priority Areas:',
    ...(weaknesses.length > 0
      ? weaknesses.slice(0, 3).map(item => `- Improve **${item}** first because it is reducing the overall score.`)
      : ['- Keep transactions, budgets, bills, and accounts updated so the score stays accurate.']),
    '',
    'Action Plan:',
    ...(recommendations.length > 0
      ? recommendations.slice(0, 5).map(item => `- ${item}`)
      : [
          '- Keep monthly expenses below income and protect a fixed saving amount first.',
          '- Create budgets for high-spend categories and review them weekly.',
          '- Maintain an emergency fund before taking aggressive investment decisions.',
          '- Pay recurring bills on time to protect bill consistency.',
        ]),
    '',
    'Strengths:',
    ...(strengths.length > 0
      ? strengths.slice(0, 3).map(item => `- Keep maintaining **${item}**.`)
      : ['- No strong category is available yet; add more financial data for a clearer score.']),
    '',
    'Note:',
    '- This is a rule based fallback because AI took longer than expected.'
  ].join('\n');
};

const buildSavingsRateFallback = ({ adviceRate, adviceIncome, adviceExpenses, adviceSavings, adviceTargetRate, adviceTargetExpenseLimit, adviceTopCategories }) => {
  const categories = adviceTopCategories.length > 0
    ? adviceTopCategories.slice(0, 3).map(category => `- Reduce or review **${category.name || 'Uncategorized'}** spending (${formatMoney(category.amount)}).`)
    : ['- Categorize expenses so the app can show exact saving opportunities.'];

  return [
    'RULE BASED SAVINGS RATE IMPROVEMENT PLAN',
    '',
    'Current Snapshot:',
    `- Current savings rate is **${adviceRate}%**.`,
    `- Monthly income is **${formatMoney(adviceIncome)}**, expenses are **${formatMoney(adviceExpenses)}**, and savings are **${formatMoney(adviceSavings)}**.`,
    '',
    'Biggest Opportunities:',
    ...categories,
    adviceRate < 0
      ? '- Your expenses are higher than income, so first target is to bring savings back to **0%**.'
      : `- Next realistic target is **${adviceTargetRate}%** savings rate.`,
    '',
    'Action Plan:',
    '- Set limits for the top 2 expense categories this month.',
    '- Move savings immediately after income is received.',
    '- Pause unused subscriptions or recurring non-essential expenses.',
    '- Delay non-urgent purchases by 48 hours before spending.',
    '',
    'Target:',
    `- To reach **${adviceTargetRate}%**, keep expenses near **${formatMoney(adviceTargetExpenseLimit)}**.`,
    '',
    'Note:',
    '- This is a rule based fallback because AI took longer than expected.'
  ].join('\n');
};

// Metric Card Component
const MetricCard = ({ title, value, icon: Icon, color, trend, trendValue, delay, trigger, image }) => {
  const isPositive = trend === 'up';

  // Extract color base (e.g., "emerald" from "from-emerald-500")
  const colorMatch = color.match(/from-([a-z]+)-/);
  const colorBase = colorMatch ? colorMatch[1] : 'blue';
  const accentStyles = {
    sky: { soft: 'bg-sky-100/50', dot: 'bg-sky-500', bar: 'bg-sky-500', sparkle: 'text-sky-500' },
    emerald: { soft: 'bg-emerald-100/50', dot: 'bg-emerald-500', bar: 'bg-emerald-500', sparkle: 'text-emerald-500' },
    blue: { soft: 'bg-blue-100/50', dot: 'bg-blue-500', bar: 'bg-blue-500', sparkle: 'text-blue-500' },
    purple: { soft: 'bg-purple-100/50', dot: 'bg-purple-500', bar: 'bg-purple-500', sparkle: 'text-purple-500' },
    indigo: { soft: 'bg-indigo-100/50', dot: 'bg-indigo-500', bar: 'bg-indigo-500', sparkle: 'text-indigo-500' },
    rose: { soft: 'bg-rose-100/50', dot: 'bg-rose-500', bar: 'bg-rose-500', sparkle: 'text-rose-500' },
    amber: { soft: 'bg-amber-100/50', dot: 'bg-amber-500', bar: 'bg-amber-500', sparkle: 'text-amber-500' },
  };
  const accent = accentStyles[colorBase] || accentStyles.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="group relative min-h-[138px] overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.055)] transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_14px_32px_rgba(15,23,42,0.09)]"
    >
      <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${color}`} />
      {/* Background Illustration if available */}
      {image && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <img
            src={image}
            alt=""
            className="absolute -right-8 -bottom-8 h-28 w-28 object-contain opacity-[0.07] saturate-125 transition-all duration-500 group-hover:scale-105 group-hover:opacity-[0.11]"
          />
        </div>
      )}
      <div className={`absolute -right-12 -top-12 h-28 w-28 rounded-full ${accent.soft} blur-2xl`} />
      <div className="relative z-10 flex h-full min-h-[138px] flex-col justify-between p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${accent.dot} shadow-[0_0_0_3px_rgba(148,163,184,0.12)]`} />
              <p className="truncate text-[10px] font-black uppercase tracking-wide text-slate-500">{title}</p>
            </div>
            <p className="text-[1.45rem] font-black leading-none tracking-normal text-slate-950">
              <CountUp
                end={value}
                duration={2000}
                prefix=""
                suffix={title === 'Savings Rate' ? '%' : ''}
                trigger={trigger}
              />
              {title === 'Financial Health' && <span className="ml-1 text-xs font-extrabold text-slate-400">/100</span>}
            </p>
          </div>

          <div className="relative shrink-0">
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${color} opacity-25 blur transition-opacity group-hover:opacity-40`} />
            <div className={`relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white shadow-md shadow-slate-900/10 ring-1 ring-white/50`}>
              <Icon size={17} strokeWidth={2.4} />
            </div>
          </div>
        </div>

        <div className="mt-3 min-h-[24px]">
          {trend && (
            <div className="flex items-center gap-1.5">
              <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-extrabold ${isPositive ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' : 'bg-rose-50 text-rose-700 ring-1 ring-rose-100'}`}>
                {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {Math.abs(trendValue)}%
              </div>
              <span className="text-[10px] font-semibold text-slate-400">vs last month</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
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
        <p className="ml-5 text-sm font-semibold leading-relaxed text-slate-600">
          {description}
        </p>
      )}
    </div>
  </div>
);

// Feature Showcase Carousel Component
const FeatureShowcaseCarousel = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides = [
    {
      title: "Smart Chatbot & OCR Receipt Scanner",
      subtitle: "INTELLIGENT PERSONAL ASSISTANT",
      description: "Ask your personal AI buddy anything about your finances! Plus, skip the manual entries—just upload or scan paper receipts and let our smart OCR system instantly parse and categorize them.",
      image: chatbotOcrShowcase,
      color: "from-blue-600 to-cyan-500",
      bgGradient: "from-slate-900 via-slate-850 to-blue-950",
      features: ["24/7 Voice & Chatbot Assistant", "Real-Time OCR Receipt Scanning", "Automatic Spending Categorization"],
      ctaText: "Start Chatting",
      action: () => {
        const chatWidgetBtn = document.querySelector('.chat-widget-toggle') || document.querySelector('[aria-label="Toggle Chat"]');
        if (chatWidgetBtn) {
          chatWidgetBtn.click();
        } else {
          const event = new CustomEvent('open-chat');
          window.dispatchEvent(event);
        }
      },
      icon: Bot
    },
    {
      title: "ML Anomaly Detection & Safe Syncing",
      subtitle: "REAL-TIME FRAUD PROTECTION",
      description: "Keep your money safe with our advanced anomaly detection engine. It automatically flags unusual subscription increases, duplicate charges, or suspicious spending spikes.",
      image: securityAnomalyShowcase,
      color: "from-emerald-500 to-teal-400",
      bgGradient: "from-slate-900 via-slate-850 to-emerald-950",
      features: ["24/7 Autonomous Fraud Monitoring", "Unusual Activity Spike Alerts", "Secure 256-Bit Bank Encryption"],
      ctaText: "Check Anomalies",
      action: () => navigate('/anomaly-detection'),
      icon: ShieldAlert
    },
    {
      title: "Future Predictions & Smart Reminders",
      subtitle: "12-MONTH FORECAST & BILL ALERTS",
      description: "Visualize where your balance will be up to a year from now. Track all recurring bills with automated reminders so you never pay a late fee again, and get tailored investment advice.",
      image: investmentsPredictionsShowcase,
      color: "from-purple-600 to-pink-500",
      bgGradient: "from-slate-900 via-slate-850 to-purple-950",
      features: ["12-Month Financial Predictions", "Proactive Bill Payment Alerts", "Tailored Smart Portfolio Advice"],
      ctaText: "See Future Forecast",
      action: () => navigate('/predictions'),
      icon: TrendingUp
    }
  ];

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 20000); // Rotate every 20 seconds

    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const current = slides[currentSlide];
  const CurrentIcon = current.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`relative w-full rounded-3xl overflow-hidden bg-gradient-to-br ${current.bgGradient} p-6 md:p-10 text-white shadow-xl border border-white/5 transition-all duration-700 mb-8 group/carousel`}
    >
      {/* Decorative Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Backlight Ambient Glow */}
      <div className={`absolute -right-20 -top-20 w-80 h-80 rounded-full bg-gradient-to-br ${current.color} opacity-20 blur-3xl transition-all duration-700 pointer-events-none`} />
      <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-slate-800 opacity-20 blur-3xl transition-all duration-700 pointer-events-none" />

      {/* Main Slide Content */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12">
        {/* Left Content Column */}
        <div className="flex-1 text-left space-y-4 md:space-y-6">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-transparent bg-clip-text bg-gradient-to-r ${current.color} border border-white/10 flex items-center gap-1.5`}>
              <CurrentIcon size={12} className="text-white/80" />
              {current.subtitle}
            </span>
            {isPaused && (
              <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Paused
              </span>
            )}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-3"
            >
              <h2 className="text-2xl md:text-3.5xl font-extrabold tracking-tight leading-tight">
                {current.title}
              </h2>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed font-normal">
                {current.description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Bullet Sub-Features list with checkmark pill shape */}
          <div className="flex flex-wrap gap-2.5 pt-1">
            {current.features.map((feat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-xs text-gray-200 transition-colors"
              >
                <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${current.color}`} />
                {feat}
              </motion.div>
            ))}
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)" }}
              whileTap={{ scale: 0.98 }}
              onClick={current.action}
              className={`px-6 py-3 rounded-2xl bg-gradient-to-r ${current.color} font-bold text-sm shadow-md flex items-center gap-2 hover:brightness-110 transition-all text-white`}
            >
              {current.ctaText}
              <ChevronRight size={16} />
            </motion.button>

            {/* Slide Manual Controls */}
            <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/5">
              <button
                onClick={handlePrev}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                aria-label="Previous Slide"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNext}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                aria-label="Next Slide"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Illustration Column */}
        <div className="w-full lg:w-2/5 flex items-center justify-center relative">
          {/* Backing glow behind image */}
          <div className={`absolute w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-br ${current.color} opacity-30 blur-2xl transition-all duration-700`} />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotate: 2 }}
              transition={{ duration: 0.4 }}
              className="relative w-56 h-56 md:w-72 md:h-72 flex items-center justify-center pointer-events-none"
            >
              {/* Floating Effect on image */}
              <motion.img
                src={current.image}
                alt={current.title}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.4)]"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Auto-Rotation Linear Progress Bar & Indicators */}
      <div className="mt-6 md:mt-8 pt-4 border-t border-white/10 flex items-center justify-between gap-4">
        {/* Navigation Dot Indicators */}
        <div className="flex items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === currentSlide
                  ? `w-8 bg-gradient-to-r ${current.color}`
                  : "w-2.5 bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Visual progress bar matching transition duration (20s) */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-gray-400 font-mono hidden sm:inline uppercase tracking-wider">
            Next Slide in
          </span>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden w-24 sm:w-32">
            <motion.div
              key={currentSlide + (isPaused ? "-paused" : "-active")}
              initial={{ width: '0%' }}
              animate={{ width: isPaused ? '0%' : '100%' }}
              transition={{ duration: isPaused ? 0 : 20, ease: 'linear' }}
              className={`h-full bg-gradient-to-r ${current.color}`}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main Dashboard Content Component
const DashboardContent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [animationsStarted, setAnimationsStarted] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [aiReport, setAiReport] = useState('');
  const [aiReportGeneratedAt, setAiReportGeneratedAt] = useState(null);
  const [isAiReportLoading, setIsAiReportLoading] = useState(false);
  const [aiReportElapsed, setAiReportElapsed] = useState(0);
  const [aiReportError, setAiReportError] = useState('');
  const [isSavingsAdviceOpen, setIsSavingsAdviceOpen] = useState(false);
  const [savingsAdvice, setSavingsAdvice] = useState('');
  const [savingsAdviceGeneratedAt, setSavingsAdviceGeneratedAt] = useState(null);
  const [savingsAdviceSource, setSavingsAdviceSource] = useState('');
  const [savingsAdviceEngine, setSavingsAdviceEngine] = useState('');
  const [savingsAdviceMetrics, setSavingsAdviceMetrics] = useState({});
  const [isSavingsAdviceLoading, setIsSavingsAdviceLoading] = useState(false);
  const [savingsAdviceElapsed, setSavingsAdviceElapsed] = useState(0);
  const [savingsAdviceError, setSavingsAdviceError] = useState('');

  // ✅ ALL HOOKS CALLED FIRST - before any conditional returns
  const {
    netWorth,
    netWorthTrend,
    savingsRate,
    financialHealth,
    recentTransactions,
    myAccounts,
    currentBudgets,
    upcomingBills,
    isLoading,
    isError,
    refetchAll
  } = useDashboardData();

  const userName = user?.name || 'User';

  const loadAiFinancialReport = useCallback(async (force = false) => {
    if (isAiReportLoading || (!force && aiReport)) return;

    setIsAiReportLoading(true);
    setAiReportElapsed(0);
    setAiReportError('');

    try {
      const response = await withTimeout(dashboardAPI.getFinancialHealthAiReport(), 120000);
      setAiReport(response.data?.report || '');
      setAiReportGeneratedAt(response.data?.generatedAt || new Date().toISOString());
    } catch (error) {
      console.error('Failed to fetch AI financial report:', error);
      const fallbackHealthScore = financialHealth?.overallScore || 0;
      const fallbackSavingsRate = savingsRate?.currentSavingsRate || 0;
      const fallbackBudgets = currentBudgets?.budgets || [];
      const fallbackTotalBudget = fallbackBudgets.reduce((sum, b) => sum + (b.amountLimit || 0), 0);
      const fallbackTotalSpent = fallbackBudgets.reduce((sum, b) => sum + (b.spentAmount || 0), 0);
      const fallbackBudgetProgress = fallbackTotalBudget > 0 ? (fallbackTotalSpent / fallbackTotalBudget) * 100 : 0;

      setAiReport(buildFinancialHealthFallback({
        healthScore: fallbackHealthScore,
        savingsRateValue: fallbackSavingsRate,
        budgetProgress: fallbackBudgetProgress,
        financialHealth
      }));
      setAiReportGeneratedAt(new Date().toISOString());
      setAiReportError(error?.message === 'AI_TIMEOUT'
        ? 'AI took longer than 120 seconds, so a rule based fallback is shown.'
        : 'AI report is temporarily unavailable. Showing rule based fallback.');
    } finally {
      setIsAiReportLoading(false);
    }
  }, [aiReport, isAiReportLoading, financialHealth, savingsRate, currentBudgets]);

  const loadAiSavingsAdvice = useCallback(async (force = false) => {
    if (isSavingsAdviceLoading || (!force && savingsAdvice)) return;

    setIsSavingsAdviceLoading(true);
    setSavingsAdviceElapsed(0);
    setSavingsAdviceError('');

    try {
      const response = await withTimeout(dashboardAPI.getSavingsRateAiImprovement(), 120000);
      setSavingsAdvice(response.data?.advice || '');
      setSavingsAdviceGeneratedAt(response.data?.generatedAt || new Date().toISOString());
      setSavingsAdviceSource(response.data?.source || 'ai');
      setSavingsAdviceEngine(response.data?.engine || '');
      setSavingsAdviceMetrics({
        currentSavingsRate: response.data?.currentSavingsRate,
        monthlyIncome: response.data?.monthlyIncome,
        monthlyExpenses: response.data?.monthlyExpenses,
        monthlySavings: response.data?.monthlySavings,
        targetSavingsRate: response.data?.targetSavingsRate,
        targetMonthlySavings: response.data?.targetMonthlySavings,
        targetExpenseLimit: response.data?.targetExpenseLimit,
        topExpenseCategories: response.data?.topExpenseCategories || [],
      });
    } catch (error) {
      console.error('Failed to fetch AI savings advice:', error);
      const fallbackRate = Number(savingsRate?.currentSavingsRate || 0);
      const fallbackIncome = Number(savingsRate?.currentMonthlyIncome || financialHealth?.details?.monthlyIncome || 0);
      const fallbackExpenses = Number(savingsRate?.currentMonthlyExpenses || 0);
      const fallbackSavings = Number(savingsRate?.currentMonthlySavings || 0);
      const fallbackTargetRate = fallbackRate < 0 ? 0 : Math.min(fallbackRate + 5, 20);
      const fallbackTargetSavings = fallbackIncome * fallbackTargetRate / 100;
      const fallbackTargetExpenseLimit = fallbackIncome - fallbackTargetSavings;

      setSavingsAdvice(buildSavingsRateFallback({
        adviceRate: fallbackRate,
        adviceIncome: fallbackIncome,
        adviceExpenses: fallbackExpenses,
        adviceSavings: fallbackSavings,
        adviceTargetRate: fallbackTargetRate,
        adviceTargetExpenseLimit: fallbackTargetExpenseLimit,
        adviceTopCategories: []
      }));
      setSavingsAdviceGeneratedAt(new Date().toISOString());
      setSavingsAdviceSource('fallback');
      setSavingsAdviceEngine('Rule based timeout fallback');
      setSavingsAdviceError(error?.message === 'AI_TIMEOUT'
        ? 'AI took longer than 120 seconds, so a rule based fallback is shown.'
        : 'AI savings-rate advice is temporarily unavailable. Showing rule based fallback.');
    } finally {
      setIsSavingsAdviceLoading(false);
    }
  }, [savingsAdvice, isSavingsAdviceLoading, savingsRate, financialHealth]);

  const handleRefresh = async () => {
    setAnimationsStarted(false);
    setAiReport('');
    setAiReportGeneratedAt(null);
    setSavingsAdvice('');
    setSavingsAdviceGeneratedAt(null);
    setSavingsAdviceSource('');
    setSavingsAdviceEngine('');
    setSavingsAdviceMetrics({});
    await refetchAll();
    setRefreshKey(prev => prev + 1);
    setLastRefreshed(new Date());
    setTimeout(() => {
      setAnimationsStarted(true);
    }, 100);
  };

  const budgetsArray = currentBudgets?.budgets || [];
  const totalBudget = budgetsArray.reduce((sum, b) => sum + (b.amountLimit || 0), 0);
  const totalSpent = budgetsArray.reduce((sum, b) => sum + (b.spentAmount || 0), 0);
  const budgetProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Start animations when data is loaded
  useEffect(() => {
    if (!isLoading && netWorth && savingsRate !== undefined && financialHealth !== undefined) {
      setAnimationsStarted(true);
    }
  }, [isLoading, netWorth, savingsRate, financialHealth]);

  useEffect(() => {
    if (isInsightsOpen) {
      loadAiFinancialReport();
    }
  }, [isInsightsOpen, loadAiFinancialReport]);

  useEffect(() => {
    if (!isAiReportLoading) return undefined;

    const startedAt = Date.now();
    const timer = setInterval(() => {
      setAiReportElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [isAiReportLoading]);

  useEffect(() => {
    if (isSavingsAdviceOpen) {
      loadAiSavingsAdvice();
    }
  }, [isSavingsAdviceOpen, loadAiSavingsAdvice]);

  useEffect(() => {
    if (!isSavingsAdviceLoading) return undefined;

    const startedAt = Date.now();
    const timer = setInterval(() => {
      setSavingsAdviceElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [isSavingsAdviceLoading]);

  // ✅ Conditional returns AFTER all hooks
  if (isError) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={32} className="text-rose-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to load dashboard</h3>
            <p className="text-gray-500 mb-6">There was an error loading your financial data. Please try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, staggerChildren: 0.05 }
    }
  };

  const balanceValue = netWorth?.currentNetWorth || 0;
  const savingsRateValue = savingsRate?.currentSavingsRate || 0;
  const healthScore = financialHealth?.overallScore || 0;

  // Bank account summary
  const bankAccountCount = Array.isArray(myAccounts) ? myAccounts.length : 0;
  const totalBankBalance = Array.isArray(myAccounts)
    ? myAccounts.reduce((sum, acc) => sum + (acc.currentBalance || 0), 0)
    : 0;

  const monthlyIncome = savingsRate?.currentMonthlyIncome || financialHealth?.details?.monthlyIncome || 0;
  const adviceRate = Number(savingsAdviceMetrics.currentSavingsRate ?? savingsRateValue ?? 0);
  const adviceIncome = Number(savingsAdviceMetrics.monthlyIncome ?? monthlyIncome ?? 0);
  const adviceExpenses = Number(savingsAdviceMetrics.monthlyExpenses ?? savingsRate?.currentMonthlyExpenses ?? 0);
  const adviceSavings = Number(savingsAdviceMetrics.monthlySavings ?? savingsRate?.currentMonthlySavings ?? 0);
  const adviceTargetRate = Number(savingsAdviceMetrics.targetSavingsRate ?? Math.max(adviceRate + 5, 0));
  const adviceTargetSavings = Number(savingsAdviceMetrics.targetMonthlySavings ?? (adviceIncome * adviceTargetRate / 100));
  const adviceTargetExpenseLimit = Number(savingsAdviceMetrics.targetExpenseLimit ?? (adviceIncome - adviceTargetSavings));
  const adviceTopCategories = Array.isArray(savingsAdviceMetrics.topExpenseCategories)
    ? savingsAdviceMetrics.topExpenseCategories
    : [];
  const cashFlowMax = Math.max(adviceIncome, adviceExpenses, Math.abs(adviceSavings), adviceTargetSavings, 1);
  const savingsGaugeWidth = clampPercent(((adviceRate + 20) / 60) * 100);
  const targetGaugeWidth = clampPercent(((adviceTargetRate + 20) / 60) * 100);
  const topCategoryMax = Math.max(...adviceTopCategories.map(cat => Number(cat.amount || 0)), 1);
  const riskLevel = healthScore >= 75 ? 'Low risk' : healthScore >= 50 ? 'Watchlist' : 'Needs action';
  const dashboardSignals = [
    {
      label: 'Monthly inflow',
      value: `₹${monthlyIncome.toLocaleString()}`,
      icon: TrendingUp,
      tone: 'from-emerald-500 to-teal-500'
    },
    {
      label: 'Risk status',
      value: riskLevel,
      icon: ShieldCheck,
      tone: healthScore >= 75 ? 'from-emerald-500 to-lime-500' : healthScore >= 50 ? 'from-amber-500 to-orange-500' : 'from-rose-500 to-red-500'
    },
    {
      label: 'Upcoming bills',
      value: `${Array.isArray(upcomingBills) ? upcomingBills.length : 0} tracked`,
      icon: Calendar,
      tone: 'from-violet-500 to-fuchsia-500'
    }
  ];

  // Get health score message
  const getHealthMessage = () => {
    if (healthScore >= 80) return 'Excellent financial health! 🎉';
    if (healthScore >= 60) return 'Good progress, keep going! 📈';
    if (healthScore >= 40) return 'On track, room for improvement 💪';
    return 'Needs attention, let\'s work on it 🎯';
  };

  // Loading skeleton
  if (isLoading && !netWorth) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
            <div className="animate-pulse space-y-6">
              {/* Header skeleton */}
              <div className="space-y-3">
                <div className="h-8 bg-gray-200 rounded-lg w-1/3" />
                <div className="h-4 bg-gray-200 rounded-lg w-1/4" />
              </div>
              {/* Cards skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-40 bg-gray-100 rounded-2xl" />
                ))}
              </div>
              {/* Charts skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-80 bg-gray-100 rounded-2xl" />
                <div className="h-80 bg-gray-100 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div
        key={refreshKey}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">

          {/* Welcome Section - Google Material Style */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">Dashboard Overview</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                Good {getTimeOfDay()}, <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{userName.split(' ')[0]}</span>
              </h1>
              <p className="text-gray-500 text-sm md:text-base mt-1">
                Here's your financial overview at a glance
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Date display */}
              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-100">
                <Calendar size={14} className="text-gray-400" />
                <span className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
              </div>

              {/* Refresh button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-all"
              >
                <RefreshCw size={16} className={`text-gray-500 ${animationsStarted ? '' : 'animate-spin'}`} />
                <span className="text-sm text-gray-600 hidden sm:inline">Refresh</span>
              </motion.button>
            </div>
          </div>

          {/* No Bank Account Warning */}
          {animationsStarted && (!myAccounts || myAccounts.length === 0) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-4 shadow-sm"
            >
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Wallet className="text-amber-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-amber-900">Action Required: No Bank Account Found</h3>
                <p className="text-xs text-amber-700 mt-0.5">Please add your bank account to monitor your finances and see your health score.</p>
              </div>
              <button
                onClick={() => setIsAddAccountOpen(true)}
                className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition-colors shadow-sm"
              >
                Add Account
              </button>
            </motion.div>
          )}

          {/* Feature Showcase Carousel */}
          <FeatureShowcaseCarousel />

          {/* Quick Actions */}
          <div className="mb-8">
            <QuickActions
              onRefresh={handleRefresh}
              onFinancialHealthAdvice={() => setIsInsightsOpen(true)}
              variant="google"
            />
          </div>

          {/* Core Metrics */}
          <div className="mb-4 flex items-center justify-between gap-4 px-1">
            <div className="flex-1">
              <div className="mb-1.5 flex items-center gap-3">
                <motion.div
                  className="h-7 w-1.5 rounded-full bg-gradient-to-b from-emerald-500 via-blue-500 to-purple-600 shadow-lg shadow-blue-200/60"
                  animate={{ scaleY: [1, 1.18, 1] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                />
                <h3 className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-xl font-bold tracking-tight text-transparent">
                  Financial Overview
                </h3>
              </div>
              <p className="ml-5 text-sm font-semibold leading-relaxed text-slate-600">
                Track accounts, net worth, savings, health, and budget progress
              </p>
            </div>
            <button
              onClick={() => setIsSavingsAdviceOpen(true)}
              className="hidden sm:flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-700 transition-all hover:border-blue-300 hover:bg-blue-100"
            >
              <Bot size={14} />
              Improve Savings Rate
            </button>
          </div>
          <button
            onClick={() => setIsSavingsAdviceOpen(true)}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2.5 text-xs font-bold text-blue-700 transition-all hover:border-blue-300 hover:bg-blue-100 sm:hidden"
          >
            <Bot size={14} />
            Improve Savings Rate
          </button>

          {/* Core Metrics Grid - Google Material Cards */}
          <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {/* Bank Accounts Card */}
            <MetricCard
              title="Bank Accounts"
              value={totalBankBalance}
              icon={Landmark}
              color="from-sky-500 to-sky-600"
              delay={0.05}
              trigger={animationsStarted}
              image={totalBalanceImg}
            />

            {/* Total Net Worth Card */}
            <MetricCard
              title="Net Worth"
              value={balanceValue}
              icon={Wallet}
              color="from-emerald-500 to-emerald-600"
              trend={netWorth?.percentageChange >= 0 ? 'up' : 'down'}
              trendValue={Math.abs(netWorth?.percentageChange || 0)}
              delay={0.1}
              trigger={animationsStarted}
              image={totalBalanceImg}
            />

            {/* Savings Rate Card */}
            <MetricCard
              title="Savings Rate"
              value={savingsRateValue}
              icon={Percent}
              color="from-blue-500 to-blue-600"
              delay={0.2}
              trigger={animationsStarted}
              image={savingRateImg}
            />

            {/* Financial Health Card */}
            <MetricCard
              title="Financial Health"
              value={healthScore}
              icon={ShieldCheck}
              color="from-purple-500 to-purple-600"
              delay={0.3}
              trigger={animationsStarted}
              image={financialHealthImg}
            />

            {/* Budget Progress Card */}
            <MetricCard
              title="Budget Progress"
              value={totalSpent}
              icon={CircleDollarSign}
              color={budgetProgress >= 90 ? "from-rose-500 to-rose-600" : budgetProgress >= 70 ? "from-amber-500 to-amber-600" : "from-indigo-500 to-indigo-600"}
              delay={0.4}
              trigger={animationsStarted}
              image={overallProgressImg}
            />
          </div>

          <SectionHeader
            title="AI Financial Insight"
            description="Personalized guidance from your live dashboard data"
            accentClass="bg-gradient-to-b from-blue-500 via-indigo-500 to-violet-600 shadow-indigo-200/60"
            titleClass="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600"
          />

          {/* AI Insight Banner - Google Gemini Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl p-6 mb-8 text-white relative overflow-hidden group shadow-lg shadow-blue-500/20"
          >
            {/* Background Illustration */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <img
                src={aiInsightImg}
                alt=""
                className="w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-all duration-700 group-hover:scale-105 mix-blend-overlay"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/40 via-transparent to-violet-600/40" />
            </div>

            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/10 transition-all duration-500"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full -ml-32 -mb-32 blur-3xl group-hover:bg-indigo-500/20 transition-all duration-500"></div>

            <div className="relative z-10 flex items-start gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Sparkles size={22} className="text-yellow-300" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-100 mb-1">AI Financial Insight</p>
                <p className="text-white text-base leading-relaxed">
                  {financialHealth?.summary || (savingsRateValue >= 20
                    ? `Excellent job! You're saving ${savingsRateValue}% of your income. Consider investing the surplus for long-term growth.`
                    : savingsRateValue >= 10
                    ? `You're saving ${savingsRateValue}% of your income. Try to increase by 5% next month to reach the 20% goal.`
                    : `Your savings rate is ${savingsRateValue}%. Start by tracking expenses and setting a monthly savings target.`)
                  }
                </p>
                {financialHealth?.recommendations?.length > 0 && (
                  <div className="mt-3 text-sm text-blue-100/90 bg-white/10 p-2.5 rounded-lg backdrop-blur-md border border-white/10">
                    <span className="font-semibold text-white">Tip:</span> {financialHealth.recommendations[0]}
                  </div>
                )}
                <button
                  onClick={() => setIsInsightsOpen(true)}
                  className="mt-3 flex items-center gap-1 text-sm text-blue-200 hover:text-white transition-colors font-semibold bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-xl border border-white/10 w-fit"
                >
                  View insights <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 mb-8">
            <div className="lg:col-span-7">
              <SectionHeader
                title="Net Worth"
                description="Track total assets, liabilities, and long-term movement"
                accentClass="bg-gradient-to-b from-emerald-500 via-teal-500 to-blue-500 shadow-emerald-200/60"
                titleClass="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600"
              />
              <NetWorthChart
                data={netWorthTrend}
                loading={isLoading}
              />
            </div>
            <div className="lg:col-span-5">
              <SectionHeader
                title="Cash Flow"
                description="Compare monthly income, spending, and savings rate"
                accentClass="bg-gradient-to-b from-amber-500 via-orange-500 to-rose-500 shadow-amber-200/60"
                titleClass="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600"
              />
              <CashFlowChart
                data={savingsRate}
                loading={isLoading}
              />
            </div>
          </div>

          {/* Bottom Section: Transactions and Bills */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 mb-8">
            <div className="lg:col-span-8">
              <SectionHeader
                title="Recent Transactions"
                description="Review the latest money movement across your accounts"
                accentClass="bg-gradient-to-b from-sky-500 via-blue-500 to-indigo-500 shadow-blue-200/60"
                titleClass="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600"
              />
              <RecentTransactions
                transactions={recentTransactions}
                loading={isLoading}
              />
            </div>
            <div className="lg:col-span-4">
              <SectionHeader
                title="Upcoming Bills"
                description="Keep an eye on due dates and recurring payments"
                accentClass="bg-gradient-to-b from-rose-500 via-pink-500 to-purple-500 shadow-rose-200/60"
                titleClass="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600"
              />
              <UpcomingBillsWidget
                bills={upcomingBills}
                loading={isLoading}
              />
            </div>
          </div>

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center"
          >
            <p className="text-xs text-gray-400">
              Data updates in real-time • Last refreshed: {lastRefreshed.toLocaleTimeString()}
            </p>
          </motion.div>
        </div>

        {/* Add Account Modal */}
        <AddAccountModal
          isOpen={isAddAccountOpen}
          onClose={() => setIsAddAccountOpen(false)}
          onSuccess={handleRefresh}
        />

        {/* AI Savings Rate Improvement Modal */}
        <AnimatePresence>
          {isSavingsAdviceOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSavingsAdviceOpen(false)}
                className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 24 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="relative z-10 my-8 w-full max-w-3xl overflow-hidden rounded-[28px] border border-gray-150 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="relative border-b border-blue-100 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-6 text-white">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                        <Bot size={20} />
                      </div>
                      <div>
                        <h2 className="text-xl font-extrabold tracking-tight">AI Savings Rate Coach</h2>
                        <p className="mt-1 text-xs text-blue-100">
                          Personalized steps to improve the savings rate shown in Financial Overview.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsSavingsAdviceOpen(false)}
                      className="rounded-xl border border-white/10 bg-white/10 p-2 text-white/80 transition-all hover:bg-white/20 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                <div className="max-h-[68vh] space-y-5 overflow-y-auto p-6">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                      <p className="text-[10px] font-black uppercase tracking-wide text-blue-500">Savings Rate</p>
                      <p className="mt-1 text-lg font-black text-blue-900">{adviceRate}%</p>
                    </div>
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                      <p className="text-[10px] font-black uppercase tracking-wide text-emerald-500">Monthly Income</p>
                      <p className="mt-1 text-lg font-black text-emerald-900">
                        {formatMoney(adviceIncome)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
                      <p className="text-[10px] font-black uppercase tracking-wide text-rose-500">Monthly Expenses</p>
                      <p className="mt-1 text-lg font-black text-rose-900">
                        {formatMoney(adviceExpenses)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
                      <p className="text-[10px] font-black uppercase tracking-wide text-violet-500">Next Target</p>
                      <p className="mt-1 text-lg font-black text-violet-900">{adviceTargetRate}%</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-black text-slate-900">Savings Rate Movement</h3>
                          <p className="text-[11px] font-semibold text-slate-500">Current vs realistic next target</p>
                        </div>
                        <Percent size={18} className="text-blue-500" />
                      </div>
                      <div className="relative h-4 rounded-full bg-gradient-to-r from-rose-100 via-amber-100 to-emerald-100">
                        <div className="absolute -bottom-6 left-0 text-[10px] font-bold text-rose-500">-20%</div>
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-500">10%</div>
                        <div className="absolute -bottom-6 right-0 text-[10px] font-bold text-emerald-600">40%</div>
                        <div
                          className="absolute top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-blue-600 shadow-lg shadow-blue-300"
                          style={{ left: `${savingsGaugeWidth}%` }}
                        />
                        <div
                          className="absolute top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-violet-600 shadow-lg shadow-violet-300"
                          style={{ left: `${targetGaugeWidth}%` }}
                        />
                      </div>
                      <div className="mt-9 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-blue-50 p-3">
                          <p className="text-[10px] font-black uppercase text-blue-500">Current</p>
                          <p className="text-base font-black text-blue-900">{adviceRate}%</p>
                        </div>
                        <div className="rounded-2xl bg-violet-50 p-3">
                          <p className="text-[10px] font-black uppercase text-violet-500">Target</p>
                          <p className="text-base font-black text-violet-900">{adviceTargetRate}%</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-black text-slate-900">Cashflow View</h3>
                          <p className="text-[11px] font-semibold text-slate-500">Based on this month's app data</p>
                        </div>
                        <TrendingUp size={18} className="text-emerald-500" />
                      </div>
                      <div className="space-y-3">
                        <DataBar label="Income" value={adviceIncome} max={cashFlowMax} color="bg-emerald-500" detail={formatMoney(adviceIncome)} />
                        <DataBar label="Expenses" value={adviceExpenses} max={cashFlowMax} color="bg-rose-500" detail={formatMoney(adviceExpenses)} />
                        <DataBar
                          label="Current Savings"
                          value={Math.abs(adviceSavings)}
                          max={cashFlowMax}
                          color={adviceSavings >= 0 ? 'bg-blue-500' : 'bg-amber-500'}
                          detail={formatMoney(adviceSavings)}
                        />
                        <DataBar label="Target Savings" value={adviceTargetSavings} max={cashFlowMax} color="bg-violet-500" detail={formatMoney(adviceTargetSavings)} />
                      </div>
                      <div className="mt-4 rounded-2xl border border-violet-100 bg-violet-50 p-3 text-xs font-semibold text-violet-900">
                        To reach {adviceTargetRate}%, keep expenses near {formatMoney(adviceTargetExpenseLimit)}.
                      </div>
                    </div>
                  </div>

                  {adviceTopCategories.length > 0 && (
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-black text-slate-900">Top Expense Categories</h3>
                          <p className="text-[11px] font-semibold text-slate-500">Biggest places to look for savings</p>
                        </div>
                        <CircleDollarSign size={18} className="text-amber-500" />
                      </div>
                      <div className="space-y-3">
                        {adviceTopCategories.map((category, idx) => (
                          <DataBar
                            key={`${category.name}-${idx}`}
                            label={category.name || 'Uncategorized'}
                            value={category.amount}
                            max={topCategoryMax}
                            color={idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-blue-500' : 'bg-slate-400'}
                            detail={formatMoney(category.amount)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="rounded-3xl border border-indigo-100 bg-indigo-50/50 p-5">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                          <Sparkles size={16} className="text-indigo-500" />
                          Improvement Plan
                        </h3>
                        <p className="mt-1 text-[11px] text-slate-500">
                          {savingsAdviceSource === 'fallback'
                            ? `Calculated fallback${savingsAdviceEngine ? `: ${savingsAdviceEngine}` : ''}`
                            : `AI generated${savingsAdviceEngine ? ` by ${savingsAdviceEngine}` : ''}`}
                        </p>
                      </div>
                      <button
                        onClick={() => loadAiSavingsAdvice(true)}
                        disabled={isSavingsAdviceLoading}
                        className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-3 py-2 text-xs font-bold text-indigo-700 transition-colors hover:bg-indigo-50 disabled:opacity-60"
                      >
                        <RefreshCw size={13} className={isSavingsAdviceLoading ? 'animate-spin' : ''} />
                        Regenerate
                      </button>
                    </div>

                    {isSavingsAdviceLoading ? (
                      <div className="space-y-4">
                        <div className="rounded-2xl border border-indigo-100 bg-white p-4">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <div>
                              <p className="text-xs font-black uppercase tracking-wide text-indigo-600">Generating AI plan</p>
                              <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
                                Usually takes 10-30 seconds. Maximum wait can be around 120 seconds.
                              </p>
                            </div>
                            <div className="rounded-xl bg-indigo-50 px-3 py-2 text-right">
                              <p className="text-[10px] font-black uppercase text-indigo-500">Elapsed</p>
                              <p className="text-sm font-black text-indigo-900">{savingsAdviceElapsed}s</p>
                            </div>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-indigo-100">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min((savingsAdviceElapsed / 120) * 100, 100)}%` }}
                              transition={{ duration: 0.3 }}
                              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-3 w-11/12 animate-pulse rounded-full bg-indigo-200/70" />
                          <div className="h-3 w-9/12 animate-pulse rounded-full bg-indigo-200/60" />
                          <div className="h-3 w-10/12 animate-pulse rounded-full bg-indigo-200/50" />
                          <div className="h-3 w-8/12 animate-pulse rounded-full bg-indigo-200/40" />
                        </div>
                      </div>
                    ) : savingsAdvice ? (
                      <div>
                        <EnhancedAdvice text={savingsAdvice} />
                        {savingsAdviceGeneratedAt && (
                          <p className="mt-4 text-[10px] text-slate-400">
                            Generated: {new Date(savingsAdviceGeneratedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">
                        {savingsAdviceError || 'Open this panel to generate AI savings-rate advice.'}
                      </p>
                    )}

                    {savingsAdviceError && (
                      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-600">
                        <Info size={12} />
                        {savingsAdviceError}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* AI Financial Insights Modal */}
        <AnimatePresence>
          {isInsightsOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
              {/* Dark backdrop blur */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsInsightsOpen(false)}
                className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
              />

              {/* Modal Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="relative bg-white dark:bg-slate-900 w-full max-w-5xl rounded-[32px] shadow-2xl border border-gray-150 dark:border-slate-800/80 overflow-hidden z-10 my-8"
              >
                {/* Header Banner - Sleek Dark Futuristic Style */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white relative border-b border-gray-200/10 dark:border-slate-800/30">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center backdrop-blur-md shadow-inner text-indigo-400">
                        <Sparkles size={20} className="animate-pulse" />
                      </div>
                      <div>
                        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">AI Financial Insights Report</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Autonomous audit of your budgets, cashflow efficiency, and long-term security.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsInsightsOpen(false)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all border border-white/5 shadow-sm"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="p-6 md:p-8 max-h-[68vh] overflow-y-auto space-y-6">

                  {/* REAL DATA: Financial Statistics Dashboard Bar */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                      { label: "Est. Monthly Income", val: financialHealth?.details?.monthlyIncome, color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-500/5 dark:bg-emerald-500/10", border: "border-emerald-500/15" },
                      { label: "Linked Bank Savings", val: financialHealth?.details?.totalSavings, color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-500/5 dark:bg-blue-500/10", border: "border-blue-500/15" },
                      { label: "Active Investments", val: financialHealth?.details?.totalInvestments, color: "text-violet-500 dark:text-violet-400", bg: "bg-violet-500/5 dark:bg-violet-500/10", border: "border-violet-500/15" },
                      { label: "Monthly Budgets Set", val: financialHealth?.details?.activeBudgets, color: "text-amber-500 dark:text-amber-400", bg: "bg-amber-500/5 dark:bg-amber-500/10", border: "border-amber-500/15", suffix: " Active" },
                      { label: "Tracked Recurring Bills", val: financialHealth?.details?.activeBills, color: "text-pink-500 dark:text-pink-400", bg: "bg-pink-500/5 dark:bg-pink-500/10", border: "border-pink-500/15", suffix: " Tracked" },
                    ].map((stat, idx) => (
                      <div key={idx} className={`p-4 rounded-2xl border ${stat.border} ${stat.bg} flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5`}>
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide leading-tight">{stat.label}</span>
                        <span className={`text-sm md:text-base font-extrabold mt-2 ${stat.color} flex items-center gap-0.5`}>
                          {stat.suffix ? (
                            `${stat.val || 0}${stat.suffix}`
                          ) : (
                            `₹${Number(stat.val || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                          )}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-indigo-500/5 dark:bg-indigo-950/20 border border-indigo-500/15 rounded-3xl p-5 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                      <div>
                        <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                          <Bot size={16} className="text-indigo-500" />
                          Live AI Report
                        </h3>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                          Generated from your dashboard data, budgets, bills, transactions, accounts, and investments.
                        </p>
                      </div>
                      <button
                        onClick={() => loadAiFinancialReport(true)}
                        disabled={isAiReportLoading}
                        className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-500/15 text-xs font-bold text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-60"
                      >
                        <RefreshCw size={13} className={isAiReportLoading ? 'animate-spin' : ''} />
                        Regenerate
                      </button>
                    </div>

                    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-indigo-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-950/40">
                        <p className="text-[10px] font-black uppercase tracking-wide text-indigo-500">Health Score</p>
                        <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">{healthScore}/100</p>
                      </div>
                      <div className="rounded-2xl border border-blue-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-950/40">
                        <p className="text-[10px] font-black uppercase tracking-wide text-blue-500">Savings Rate</p>
                        <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">{savingsRateValue}%</p>
                      </div>
                      <div className="rounded-2xl border border-amber-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-950/40">
                        <p className="text-[10px] font-black uppercase tracking-wide text-amber-500">Budget Used</p>
                        <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">{Math.round(budgetProgress)}%</p>
                      </div>
                    </div>

                    {isAiReportLoading ? (
                      <div className="space-y-4">
                        <div className="rounded-2xl border border-indigo-500/15 bg-white dark:bg-slate-900 p-4">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <div>
                              <p className="text-xs font-black uppercase tracking-wide text-indigo-600 dark:text-indigo-300">Generating AI report</p>
                              <p className="mt-0.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                                Usually takes 10-30 seconds. Maximum wait can be around 120 seconds.
                              </p>
                            </div>
                            <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/40 px-3 py-2 text-right">
                              <p className="text-[10px] font-black uppercase text-indigo-500 dark:text-indigo-300">Elapsed</p>
                              <p className="text-sm font-black text-indigo-900 dark:text-indigo-100">{aiReportElapsed}s</p>
                            </div>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-indigo-100 dark:bg-indigo-950/60">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min((aiReportElapsed / 120) * 100, 100)}%` }}
                              transition={{ duration: 0.3 }}
                              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-3 bg-indigo-200/60 dark:bg-indigo-900/50 rounded-full animate-pulse w-11/12" />
                          <div className="h-3 bg-indigo-200/50 dark:bg-indigo-900/40 rounded-full animate-pulse w-9/12" />
                          <div className="h-3 bg-indigo-200/40 dark:bg-indigo-900/30 rounded-full animate-pulse w-10/12" />
                        </div>
                      </div>
                    ) : aiReport ? (
                      <div>
                        <EnhancedAdvice text={aiReport} />
                        {aiReportGeneratedAt && (
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-4">
                            Generated: {new Date(aiReportGeneratedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {aiReportError || 'Open the report to generate AI insights.'}
                      </p>
                    )}

                    {aiReportError && (
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-3 flex items-center gap-1.5">
                        <Info size={12} />
                        {aiReportError}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Health Score Card & Metrics Breakdown */}
                    <div className="lg:col-span-6 space-y-6">

                      {/* Health Score Main Metric */}
                      <div className="bg-slate-50 dark:bg-slate-900/40 p-6 rounded-[24px] border border-gray-150 dark:border-slate-800 flex flex-col items-center justify-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors"></div>
                        <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Aggregate Score Summary</span>

                        <div className="relative w-36 h-36 flex items-center justify-center my-5">
                          {/* Premium Glow ring */}
                          <div className={`absolute inset-1.5 rounded-full blur-xl opacity-20 transition-all ${
                            healthScore >= 80 ? 'bg-emerald-500' :
                            healthScore >= 60 ? 'bg-blue-500' :
                            healthScore >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}></div>

                          <svg className="w-full h-full transform -rotate-90 relative z-10">
                            <circle
                              cx="72"
                              cy="72"
                              r="62"
                              className="stroke-gray-100 dark:stroke-slate-800 fill-none"
                              strokeWidth="8"
                            />
                            <circle
                              cx="72"
                              cy="72"
                              r="62"
                              className={`fill-none transition-all duration-1000 ${
                                healthScore >= 80 ? 'stroke-emerald-500' :
                                healthScore >= 60 ? 'stroke-blue-500' :
                                healthScore >= 40 ? 'stroke-amber-500' : 'stroke-rose-500'
                              }`}
                              strokeWidth="10"
                              strokeDasharray={389.5}
                              strokeDashoffset={389.5 - (389.5 * healthScore) / 100}
                              strokeLinecap="round"
                            />
                          </svg>

                          <div className="absolute text-center z-10">
                            <span className="text-4xl font-black text-gray-900 dark:text-white leading-none">{healthScore}</span>
                            <span className="text-gray-400 dark:text-gray-500 block text-[10px] font-extrabold mt-1">/ 100</span>
                          </div>
                        </div>

                        <div className="space-y-1 text-center relative z-10">
                          <span className={`text-xs font-black uppercase px-4 py-1.5 rounded-full border shadow-sm ${
                            healthScore >= 80 ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                            healthScore >= 60 ? 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/20' :
                            healthScore >= 40 ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/20' :
                            'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/20'
                          }`}>
                            Rating: {financialHealth?.status || (healthScore >= 80 ? 'EXCELLENT' : healthScore >= 60 ? 'GOOD' : healthScore >= 40 ? 'FAIR' : 'POOR')}
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3.5 max-w-sm leading-relaxed">
                            {financialHealth?.summary || "Add more accounts and maintain active savings budgets to let FinBrain calculate a highly accurate forecast of your long-term growth potential."}
                          </p>
                        </div>
                      </div>

                      {/* Component Metrics Breakdown */}
                      <div className="space-y-4">
                        <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                          <Activity size={16} className="text-indigo-500" />
                          6-Component Matrix Breakdown
                        </h3>

                        <div className="space-y-3.5 bg-slate-50/50 dark:bg-slate-900/10 p-5 rounded-[24px] border border-gray-150 dark:border-slate-800/60">
                          {[
                            { label: 'Savings Rate Score', data: financialHealth?.savingsRateScore },
                            { label: 'Emergency Fund Score', data: financialHealth?.emergencyFundScore },
                            { label: 'Debt to Income Score', data: financialHealth?.debtToIncomeScore },
                            { label: 'Budget Adherence Score', data: financialHealth?.budgetAdherenceScore },
                            { label: 'Investment Score', data: financialHealth?.investmentHealthScore },
                            { label: 'Bill Consistency Score', data: financialHealth?.billConsistencyScore },
                          ].map((comp, idx) => {
                            const val = comp.data?.score !== undefined ? comp.data.score : 0;
                            const status = comp.data?.status || 'PENDING';
                            const targetText = comp.data?.actualValue !== undefined ? `${comp.data.actualValue}${comp.label.includes('Savings') ? '%' : comp.label.includes('Emergency') ? ' mo' : comp.label.includes('Investment') ? '%' : ''}` : 'N/A';

                            return (
                              <div key={idx} className="space-y-1.5 bg-white dark:bg-slate-900/50 p-3 rounded-xl border border-gray-100 dark:border-slate-800/40">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="font-bold text-gray-700 dark:text-gray-300">{comp.data?.name || comp.label}</span>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                                      val >= 80 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                                      val >= 60 ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                                      val >= 40 ? 'bg-amber-500/10 text-amber-600' : 'bg-rose-500/10 text-rose-600'
                                    }`}>
                                      {status}
                                    </span>
                                    <span className={`font-black ${
                                      val >= 80 ? 'text-emerald-500' :
                                      val >= 60 ? 'text-blue-500' :
                                      val >= 40 ? 'text-amber-500' : 'text-rose-500'
                                    }`}>
                                      {val}/100
                                    </span>
                                  </div>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-1.5">
                                  <div
                                    className={`h-1.5 rounded-full transition-all duration-500 ${
                                      val >= 80 ? 'bg-emerald-500' :
                                      val >= 60 ? 'bg-blue-500' :
                                      val >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                                    }`}
                                    style={{ width: `${val}%` }}
                                  />
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-gray-400 dark:text-gray-500">
                                  <span>Actual: <span className="font-bold text-gray-700 dark:text-gray-300">{targetText}</span></span>
                                  <span>Target: <span className="font-semibold text-gray-500">{comp.data?.targetValue || 'N/A'}</span></span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Strengths, Weaknesses, AI Checklists */}
                    <div className="lg:col-span-6 space-y-6">

                      {/* Strengths & Weaknesses (Visual Grid) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Strengths */}
                        <div className="bg-emerald-500/5 dark:bg-emerald-950/10 p-5 rounded-2xl border border-emerald-500/10">
                          <h4 className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wide flex items-center gap-1.5 mb-3">
                            <CheckCircle2 size={14} className="text-emerald-500" />
                            Core Strengths
                          </h4>
                          {financialHealth?.strengths?.length > 0 ? (
                            <ul className="space-y-2">
                              {financialHealth.strengths.map((str, idx) => (
                                <li key={idx} className="text-xs text-emerald-800 dark:text-emerald-300 leading-normal flex items-start gap-2 font-medium">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
                                  {str}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-gray-400 dark:text-gray-500 italic">Audit pending. Keep building your wealth.</p>
                          )}
                        </div>

                        {/* Weaknesses */}
                        <div className="bg-rose-500/5 dark:bg-rose-950/10 p-5 rounded-2xl border border-rose-500/10">
                          <h4 className="text-xs font-black text-rose-700 dark:text-rose-400 uppercase tracking-wide flex items-center gap-1.5 mb-3">
                            <AlertTriangle size={14} className="text-rose-500" />
                            Risks Identified
                          </h4>
                          {financialHealth?.weaknesses?.length > 0 ? (
                            <ul className="space-y-2">
                              {financialHealth.weaknesses.map((weak, idx) => (
                                <li key={idx} className="text-xs text-rose-800 dark:text-rose-300 leading-normal flex items-start gap-2 font-medium">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0"></span>
                                  {weak}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 italic font-medium flex items-center gap-1">
                              <CheckCircle2 size={12} />
                              Zero financial risks detected!
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actionable Recommendations list */}
                      <div className="space-y-4">
                        <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                          <Bot size={16} className="text-indigo-500 animate-bounce" />
                          Calculated Recommendations Checklist
                        </h3>

                        {financialHealth?.recommendations?.length > 0 ? (
                          <div className="space-y-3">
                            {financialHealth.recommendations.map((rec, idx) => (
                              <div
                                key={idx}
                                className="flex gap-3.5 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800 p-4 rounded-2xl border border-gray-150 dark:border-slate-850 shadow-sm hover:border-indigo-500/20 hover:shadow-md transition-all duration-300"
                              >
                                <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center flex-shrink-0 text-xs font-black font-mono">
                                  {idx + 1}
                                </div>
                                <div className="space-y-1 flex-1">
                                  <p className="text-xs text-gray-800 dark:text-gray-250 leading-relaxed font-semibold">
                                    {rec}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-gray-150 dark:border-slate-800 text-center">
                            <p className="text-xs text-gray-400 dark:text-gray-500 italic">No recommendations needed. You are executing flawlessly!</p>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="bg-slate-50 dark:bg-slate-950/20 px-6 py-4.5 border-t border-gray-150 dark:border-slate-800/80 flex justify-end gap-3">
                  <button
                    onClick={() => setIsInsightsOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-gray-250 dark:border-slate-800 text-xs text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Close Report
                  </button>
                  <button
                    onClick={() => {
                      setIsInsightsOpen(false);
                      navigate('/predictions');
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-750 text-white rounded-xl text-xs font-bold hover:shadow-md transition-all flex items-center gap-1.5"
                  >
                    Forecast 12 Months
                    <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </Layout>
  );
};

// Main Dashboard Component with QueryClientProvider
const Dashboard = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardContent />
    </QueryClientProvider>
  );
};

export default Dashboard;
