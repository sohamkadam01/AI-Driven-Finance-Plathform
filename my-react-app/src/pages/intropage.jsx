import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Bell,
  Bot,
  BrainCircuit,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  EyeOff,
  Fingerprint,
  LineChart,
  Lock,
  Menu,
  MessageSquareText,
  PieChart,
  ReceiptText,
  Shield,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
  X,
  Zap
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';

import dashboardImg from '../assets/intro/001.png';
import transactionImg from '../assets/intro/002.png';
import budgetImg from '../assets/intro/003.png';
import chatImg from '../assets/intro/004.png';
import investmentImg from '../assets/intro/005.png';
import predictionImg from '../assets/intro/009.png';

const productFrames = [
  {
    src: dashboardImg,
    title: 'Unified command center',
    label: 'Dashboard',
    metric: 'Rs 84,250',
    tone: 'from-blue-600 to-cyan-500'
  },
  {
    src: transactionImg,
    title: 'Auto sorted spending',
    label: 'Transactions',
    metric: '99% matched',
    tone: 'from-emerald-600 to-teal-500'
  },
  {
    src: budgetImg,
    title: 'Budgets that warn early',
    label: 'Budgeting',
    metric: '3 alerts',
    tone: 'from-amber-500 to-orange-500'
  },
  {
    src: chatImg,
    title: 'Ask your money anything',
    label: 'AI Chat',
    metric: 'Instant answer',
    tone: 'from-violet-600 to-fuchsia-500'
  },
  {
    src: investmentImg,
    title: 'Portfolio guidance',
    label: 'Investments',
    metric: '+12.4%',
    tone: 'from-teal-600 to-lime-500'
  },
  {
    src: predictionImg,
    title: 'Forecast the next move',
    label: 'Predictions',
    metric: '6 mo view',
    tone: 'from-rose-600 to-red-500'
  }
];

const signalCards = [
  { icon: Bell, label: 'Live alert', value: 'Netflix bill in 2 days', tone: 'text-sky-700 bg-sky-50 border-sky-200' },
  { icon: Shield, label: 'Anomaly', value: 'Unusual dining spend', tone: 'text-red-700 bg-red-50 border-red-200' },
  { icon: TrendingUp, label: 'Investment', value: 'Portfolio up 4.8%', tone: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { icon: Bot, label: 'AI insight', value: 'Save Rs 2,400 this month', tone: 'text-violet-700 bg-violet-50 border-violet-200' }
];

const features = [
  {
    icon: ReceiptText,
    title: 'Receipts to records',
    text: 'Upload a receipt and let OCR plus AI extract vendor, amount, category, and transaction data.',
    color: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  {
    icon: ShieldCheck,
    title: 'Anomaly detection',
    text: 'Spot suspicious charges, spikes, and out-of-pattern transactions before they become expensive.',
    color: 'bg-red-50 text-red-700 border-red-200'
  },
  {
    icon: CalendarClock,
    title: 'Bill reminders',
    text: 'Upcoming bills surface at the right time, with no stale past reminders cluttering the feed.',
    color: 'bg-sky-50 text-sky-700 border-sky-200'
  },
  {
    icon: LineChart,
    title: 'Future balance forecast',
    text: 'Turn income and spending behavior into a practical prediction of future cash flow.',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  {
    icon: Target,
    title: 'Smart budgets',
    text: 'Track limits by category and receive proactive warnings while there is still time to adjust.',
    color: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  {
    icon: BrainCircuit,
    title: 'Investment advice',
    text: 'Get recommendation-style guidance based on goals, risk appetite, savings, and portfolio data.',
    color: 'bg-violet-50 text-violet-700 border-violet-200'
  }
];

const flow = [
  { title: 'Capture', text: 'Transactions, receipts, bills, budgets, and investments enter one clean workspace.', icon: CreditCard },
  { title: 'Understand', text: 'Categorization, anomaly checks, forecasts, and AI summaries turn data into signals.', icon: BrainCircuit },
  { title: 'Act', text: 'Popups, alerts, reminders, and advice help you move at the right moment.', icon: Zap }
];

const securityItems = [
  { icon: Lock, title: 'Encrypted by default', text: 'Sensitive data stays protected with secure API and database practices.' },
  { icon: EyeOff, title: 'Privacy minded', text: 'The interface surfaces what matters without exposing unnecessary user details.' },
  { icon: Fingerprint, title: 'Account scoped', text: 'Alerts and finance records stay tied to the authenticated user.' }
];

const stats = [
  ['50k+', 'transactions analyzed'],
  ['15 sec', 'notification refresh'],
  ['6 mo', 'cash-flow forecast'],
  ['24/7', 'risk monitoring']
];

const navLinks = [
  ['Experience', '#experience'],
  ['Features', '#features'],
  ['Security', '#security']
];

const MotionLink = motion(Link);

const FloatingSignal = ({ item, index }) => {
  const Icon = item.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: [0, -8, 0] }}
      transition={{
        opacity: { delay: 0.4 + index * 0.12 },
        y: { duration: 4 + index * 0.4, repeat: Infinity, ease: 'easeInOut' }
      }}
      className={`rounded-lg border px-3 py-2 shadow-sm ${item.tone}`}
    >
      <div className="flex items-center gap-2">
        <Icon size={15} />
        <span className="text-[11px] font-semibold uppercase tracking-wide">{item.label}</span>
      </div>
      <p className="mt-1 text-xs font-semibold text-slate-900">{item.value}</p>
    </motion.div>
  );
};

const ProductShowcase = () => {
  const [index, setIndex] = useState(0);
  const active = productFrames[index];
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-160, 160], [6, -6]), { stiffness: 120, damping: 18 });
  const rotateY = useSpring(useTransform(mouseX, [-220, 220], [-7, 7]), { stiffness: 120, damping: 18 });

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % productFrames.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div
      className="relative"
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        mouseX.set(event.clientX - rect.left - rect.width / 2);
        mouseY.set(event.clientY - rect.top - rect.height / 2);
      }}
      onMouseLeave={() => {
        mouseX.set(0);
        mouseY.set(0);
      }}
    >
      <motion.div
        style={{ rotateX, rotateY, transformPerspective: 1100 }}
        className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.18)] dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900">
            FinBrain live
          </div>
        </div>

        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-950">
          <AnimatePresence mode="wait">
            <motion.img
              key={active.src}
              src={active.src}
              alt={active.title}
              initial={{ opacity: 0, scale: 1.04, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -12 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="h-full w-full object-contain p-3"
            />
          </AnimatePresence>
        </div>

        <div className="grid gap-3 border-t border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{active.label}</p>
            <h3 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">{active.title}</h3>
          </div>
          <div className={`rounded-lg bg-gradient-to-r ${active.tone} px-4 py-3 text-white shadow-sm`}>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">Signal</p>
            <p className="text-sm font-bold">{active.metric}</p>
          </div>
        </div>
      </motion.div>

      <div className="absolute -left-4 top-10 hidden w-52 space-y-3 lg:block">
        {signalCards.slice(0, 2).map((item, itemIndex) => (
          <FloatingSignal key={item.label} item={item} index={itemIndex} />
        ))}
      </div>
      <div className="absolute -right-4 bottom-16 hidden w-56 space-y-3 lg:block">
        {signalCards.slice(2).map((item, itemIndex) => (
          <FloatingSignal key={item.label} item={item} index={itemIndex + 2} />
        ))}
      </div>

      <div className="mt-5 flex justify-center gap-2">
        {productFrames.map((frame, frameIndex) => (
          <button
            key={frame.label}
            onClick={() => setIndex(frameIndex)}
            className={`h-2 rounded-full transition-all ${
              index === frameIndex ? 'w-9 bg-slate-950 dark:bg-white' : 'w-2 bg-slate-300 hover:bg-slate-400 dark:bg-slate-700'
            }`}
            aria-label={`Show ${frame.label}`}
          />
        ))}
      </div>
    </div>
  );
};

const Intropage = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const tickerItems = useMemo(
    () => ['AI categorization', 'Real-time popups', 'Anomaly detection', 'Investment advice', 'Bill reminders', 'Cash-flow forecast'],
    []
  );

  return (
    <div className="min-h-screen overflow-hidden bg-[#f7fafc] text-slate-950 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-80 dark:opacity-50">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.06)_1px,transparent_1px)] bg-[size:56px_56px] dark:bg-[linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.16),transparent_34%),radial-gradient(circle_at_85%_30%,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_12%_45%,rgba(244,63,94,0.10),transparent_26%)]" />
      </div>

      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/60 bg-white/78 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/72">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white shadow-lg shadow-slate-950/15 dark:bg-white dark:text-slate-950">
              <Sparkles size={19} />
            </span>
            <span className="text-lg font-black tracking-tight">FinBrain AI</span>
          </button>

          <div className="hidden items-center gap-7 md:flex">
            {navLinks.map(([label, href]) => (
              <a key={href} href={href} className="text-sm font-semibold text-slate-600 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
                {label}
              </a>
            ))}
            <ThemeToggle variant="detailed" />
            <button onClick={() => navigate('/login')} className="text-sm font-semibold text-slate-600 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
              Sign in
            </button>
            <button
              onClick={() => navigate('/register')}
              className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              Get started
            </button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button onClick={() => setMobileOpen((value) => !value)} className="rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950 md:hidden"
            >
              <div className="space-y-2 px-4 py-4">
                {navLinks.map(([label, href]) => (
                  <a key={href} href={href} onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                    {label}
                  </a>
                ))}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button onClick={() => navigate('/login')} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold dark:border-slate-800">Sign in</button>
                  <button onClick={() => navigate('/register')} className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-bold text-white dark:bg-white dark:text-slate-950">Get started</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="relative z-10">
        <section className="px-4 pb-16 pt-28 sm:px-6 lg:px-8 lg:pb-24 lg:pt-32">
          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.92fr_1.08fr]">
            <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                AI finance operating system
              </div>

              <h1 className="max-w-4xl text-5xl font-black leading-[0.98] tracking-tight text-slate-950 dark:text-white sm:text-6xl lg:text-7xl">
                Your money, translated into decisions.
              </h1>
              <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-slate-600 dark:text-slate-300">
                FinBrain AI turns transactions, bills, receipts, investments, and anomalies into live guidance. See what happened, what is changing, and what to do next.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => navigate('/register')}
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                >
                  Launch your dashboard
                  <ArrowRight size={17} className="transition group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                >
                  I already have an account
                </button>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {stats.map(([value, label]) => (
                  <div key={label} className="rounded-lg border border-slate-200 bg-white/86 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/86">
                    <p className="text-lg font-black text-slate-950 dark:text-white">{value}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.12 }}>
              <ProductShowcase />
            </motion.div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white/70 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/35">
          <div className="flex overflow-hidden">
            <motion.div
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
              className="flex min-w-max gap-4 pr-4"
            >
              {[...tickerItems, ...tickerItems, ...tickerItems].map((item, index) => (
                <span key={`${item}-${index}`} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                  <BadgeCheck size={15} className="text-emerald-500" />
                  {item}
                </span>
              ))}
            </motion.div>
          </div>
        </section>

        <section id="experience" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-600">The concept</p>
                <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                  A financial cockpit, not a spreadsheet.
                </h2>
              </div>
              <p className="text-lg font-medium leading-8 text-slate-600 dark:text-slate-300">
                Every part of the app is built around signals: what needs attention, what changed, what is due, and where your money is going next.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {flow.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                    className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="mb-8 flex items-center justify-between">
                      <span className="text-sm font-black text-slate-300">0{index + 1}</span>
                      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                        <Icon size={20} />
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-950 dark:text-white">{item.title}</h3>
                    <p className="mt-3 text-sm font-medium leading-6 text-slate-600 dark:text-slate-400">{item.text}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="features" className="bg-slate-950 px-4 py-20 text-white sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-cyan-300">Core features</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Everything that should notify you, finally does.</h2>
              <p className="mt-5 text-lg font-medium leading-8 text-slate-300">
                The intro is not just decoration. It mirrors the app: notifications, anomaly detection, investments, advice, bills, and transactions working together.
              </p>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="group rounded-xl border border-white/10 bg-white/[0.045] p-5 transition hover:-translate-y-1 hover:bg-white/[0.075]"
                  >
                    <div className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-lg border ${feature.color}`}>
                      <Icon size={20} />
                    </div>
                    <h3 className="text-lg font-black">{feature.title}</h3>
                    <p className="mt-3 text-sm font-medium leading-6 text-slate-300">{feature.text}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="security" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-600">Trust layer</p>
              <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                Designed for money data that deserves restraint.
              </h2>
              <p className="mt-5 max-w-2xl text-lg font-medium leading-8 text-slate-600 dark:text-slate-300">
                Clear security cues, scoped responses, and user-owned financial context keep the product serious where it needs to be.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {securityItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                      <Icon size={22} className="text-emerald-600" />
                      <h3 className="mt-4 text-sm font-black text-slate-950 dark:text-white">{item.title}</h3>
                      <p className="mt-2 text-xs font-medium leading-5 text-slate-500 dark:text-slate-400">{item.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/10 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="rounded-xl bg-slate-950 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-emerald-300">Security scan</p>
                    <h3 className="mt-2 text-2xl font-black">Protected session</h3>
                  </div>
                  <ShieldCheck size={36} className="text-emerald-300" />
                </div>
                <div className="mt-8 space-y-4">
                  {['JWT authentication active', 'User scoped alerts only', 'Past reminders filtered', 'Sensitive relations hidden'].map((item) => (
                    <div key={item} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                      <span className="text-sm font-semibold text-slate-200">{item}</span>
                      <CheckCircle2 size={18} className="text-emerald-300" />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl bg-slate-950 text-white shadow-2xl shadow-slate-950/20">
            <div className="grid gap-8 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-12">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-cyan-300">Ready</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Build a calmer relationship with your money.</h2>
                <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-slate-300">
                  Start with the dashboard, then let notifications and AI insights keep you in motion.
                </p>
              </div>
              <button
                onClick={() => navigate('/register')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-4 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-100"
              >
                Create account
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-slate-200 bg-white/70 px-4 py-8 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm font-semibold text-slate-500 dark:text-slate-400 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-slate-950 dark:text-white">
            <Wallet size={18} />
            <span>FinBrain AI</span>
          </div>
          <div className="flex flex-wrap gap-4">
            <a href="#experience" className="hover:text-slate-950 dark:hover:text-white">Experience</a>
            <a href="#features" className="hover:text-slate-950 dark:hover:text-white">Features</a>
            <a href="#security" className="hover:text-slate-950 dark:hover:text-white">Security</a>
            <Link to="/login" className="hover:text-slate-950 dark:hover:text-white">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Intropage;
