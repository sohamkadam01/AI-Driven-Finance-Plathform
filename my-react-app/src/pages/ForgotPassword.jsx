import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';
import { motion } from 'framer-motion';
import { Zap, Mail, ArrowLeft, Info } from 'lucide-react';
import { authAPI } from '../services/api';

const ForgotPassword = () => {
  const { isDarkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.forgotPassword(email);
      setStatus(response.data?.message || 'If that email exists, a reset link has been sent.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors duration-500 font-sans selection:bg-blue-100 dark:selection:bg-blue-900">
      <div className="fixed top-0 w-full p-6 flex justify-end z-50">
        <ThemeToggle variant="detailed" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-md border border-slate-200 dark:border-slate-800 rounded-xl px-8 py-10 bg-white dark:bg-slate-950 shadow-sm"
      >
        <div className="flex flex-col items-center text-center mb-8 gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
            <Zap size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Reset your password</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Enter the email address for your FinBrain account and we’ll send you a link to reset your password.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-4 text-slate-900 dark:text-white focus:border-blue-600 focus:ring-blue-600 outline-none transition"
              autoComplete="email"
            />
            <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          {error && (
            <div className="text-sm text-red-500 flex items-center gap-2">
              <Info size={16} /> {error}
            </div>
          )}

          {status && (
            <div className="text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3">
              {status}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-4 py-3 transition"
          >
            {isLoading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        <div className="mt-6 text-sm text-slate-600 dark:text-slate-300 space-y-3">
          <Link to="/login" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <ArrowLeft size={16} /> Back to sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
