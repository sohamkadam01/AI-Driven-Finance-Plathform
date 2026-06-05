import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';
import { motion } from 'framer-motion';
import { Zap, Lock, Eye, EyeOff, ArrowLeft, Info } from 'lucide-react';
import { authAPI } from '../services/api';

const ResetPassword = () => {
  const { isDarkMode } = useTheme();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const tokenParam = searchParams.get('token') || '';
    setToken(tokenParam);
    if (!tokenParam) {
      setError('The password reset link is invalid or missing.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('');

    if (!token) {
      setError('Missing reset token. Please request a new password reset link.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.resetPassword(token, password);
      setStatus(response.data?.message || 'Password reset successfully. You can now log in.');
      setTimeout(() => {
        navigate('/login');
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reset password. Please try again.');
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
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Set a new password</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Enter your new password below and submit to complete the reset process.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <label htmlFor="password" className="sr-only">New password</label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-4 text-slate-900 dark:text-white focus:border-blue-600 focus:ring-blue-600 outline-none transition"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="relative">
            <label htmlFor="confirmPassword" className="sr-only">Confirm password</label>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-4 text-slate-900 dark:text-white focus:border-blue-600 focus:ring-blue-600 outline-none transition"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
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
            disabled={isLoading || !!error}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-4 py-3 transition"
          >
            {isLoading ? 'Resetting...' : 'Reset password'}
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

export default ResetPassword;
