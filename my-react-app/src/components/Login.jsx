import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Sun, 
  Moon, 
  Eye, 
  EyeOff, 
  ChevronDown,
  Info,
  UserCircle,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Shield,
  Cpu,
  TrendingUp
} from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  
  // Multi-step form state
  const [step, setStep] = useState(1); // 1: Identifier, 2: Challenge
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  // Validation states
  const isEmailValid = email.includes('@') && email.length > 5;
  const isPasswordStrong = password.length >= 6;

  // Handle next step / login
  const handleNext = async (e) => {
    e.preventDefault();
    setError('');
    
    if (step === 1) {
      if (!email.includes('@')) {
        setError('Enter a valid email address');
        return;
      }
      setIsLoading(true);
      // Simulate account lookup delay for better UX
      setTimeout(() => {
        setIsLoading(false);
        setStep(2);
      }, 800);
    } else {
      setIsLoading(true);
      
      try {
        // Call the actual login function
        const result = await login({ email, password });
        
        if (result.success) {
          console.log('Login successful, navigating to dashboard...');
          // Navigate to dashboard after successful login
          navigate('/dashboard', { replace: true });
        } else {
          setError(result.error || 'Login failed. Please check your credentials.');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Login error:', err);
        setError('An unexpected error occurred. Please try again.');
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    setStep(1);
    setPassword('');
    setError('');
  };

  return (
    <div className="min-h-screen flex transition-colors duration-500 font-sans bg-gradient-to-br from-white via-blue-50/30 to-white dark:from-slate-950 dark:via-slate-900 to-slate-950 relative overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-full blur-3xl dark:from-blue-600 dark:to-cyan-700"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
          className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full blur-3xl dark:from-indigo-600 dark:to-purple-700"
        />
      </div>

      {/* Left Column - Visuals (hidden on mobile) */}
      <div className="hidden lg:flex lg:flex-1 relative items-center justify-center p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl" />
        
        {/* Floating Cards Animation */}
        <div className="relative z-10 w-full max-w-md space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            {/* Branding */}
            <div className="flex items-center gap-4">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-16 h-16 bg-gradient-to-br from-blue-500 via-cyan-400 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/40"
              >
                <Zap size={32} className="text-white" strokeWidth={1.5} />
              </motion.div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">FinBrain</h1>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">AI-Powered Finance Platform</p>
              </div>
            </div>

            {/* Main Message */}
            <div className="space-y-3">
              <h2 className="text-5xl font-black text-slate-900 dark:text-white leading-tight">
                Intelligent
                <span className="block text-transparent bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-600 bg-clip-text">Financial Control</span>
              </h2>
              <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-medium max-w-md">
                Experience AI-driven financial management. Automate investments, predict market trends, and optimize your wealth in real-time.
              </p>
            </div>

            {/* Features List */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              {[
                { icon: '▲', label: 'Smart Analytics' },
                { icon: '■', label: 'AI Predictions' },
                { icon: '●', label: 'Portfolio Optimization' },
                { icon: '★', label: 'Bank-Level Security' }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 + 0.3 }}
                  className="flex items-center gap-3 p-3 bg-white/40 dark:bg-slate-800/30 backdrop-blur-md rounded-xl border border-white/50 dark:border-slate-700/50 hover:bg-white/60 dark:hover:bg-slate-800/50 transition-all"
                >
                  <span className="text-2xl">{feature.icon}</span>
                  <span className="font-semibold text-sm text-slate-900 dark:text-white">{feature.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex-1 flex flex-col relative z-20">
        <div className="absolute top-0 right-0 w-full p-6 flex justify-between items-center z-50 lg:justify-end">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex lg:hidden items-center gap-2"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Zap size={20} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">FinBrain</span>
          </motion.div>
          <ThemeToggle variant="detailed" />
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-sm"
          >
            {/* Header Section */}
            <div className="mb-10">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2"
              >
                <div className="flex items-baseline justify-between">
                  <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    {step === 1 ? 'Welcome Back' : 'Verify Your Identity'}
                  </h1>
                </div>
                <p className="text-base text-slate-600 dark:text-slate-400 font-semibold">
                  {step === 1 
                    ? 'Access your financial intelligence dashboard' 
                    : 'Enter your password to secure your account'
                  }
                </p>
              </motion.div>
              
              {/* Progress Indicator */}
              <div className="mt-6 flex items-center gap-3">
                <motion.div 
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-full border border-blue-200 dark:border-blue-800"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Step {step} of 2</span>
                </motion.div>
                <motion.div 
                  className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <motion.div 
                    initial={{ width: step === 1 ? '50%' : '100%' }}
                    animate={{ width: step === 1 ? '50%' : '100%' }}
                    transition={{ duration: 0.4 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                  />
                </motion.div>
              </div>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleNext} className="flex flex-col w-full">
              <div className="relative min-h-[120px]">
                <AnimatePresence mode="wait">
                  {step === 1 ? (
                    <motion.div
                      key="id-field"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      {/* Email Input Card */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-wide">Email Address</label>
                          {isEmailValid && !error && (
                            <motion.span 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-1.5 uppercase tracking-wider"
                            >
                              <CheckCircle2 size={14} /> Verified
                            </motion.span>
                          )}
                        </div>
                        
                        <div className="relative group">
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            className={`w-full px-5 py-3.5 rounded-2xl border-2 transition-all duration-300 font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none backdrop-blur-sm text-base ${
                              error 
                                ? 'border-red-400 bg-red-50/50 dark:bg-red-950/20 text-red-900 dark:text-red-100' 
                                : isEmailValid && email
                                ? 'border-green-400 bg-green-50/50 dark:bg-green-950/20 text-slate-900 dark:text-white'
                                : 'border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white hover:border-blue-300 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-950 focus:shadow-lg focus:shadow-blue-500/20'
                            }`}
                            id="identifier"
                            placeholder="name@university.edu"
                            autoComplete="email"
                          />
                          <motion.div 
                            animate={{ scale: isFocused ? 1.1 : 1 }}
                            className={`absolute right-4 top-1/2 -translate-y-1/2 ${
                              isEmailValid && email ? 'text-green-500' : 'text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            <Mail size={20} />
                          </motion.div>
                        </div>
                        
                        {email && !isEmailValid && !error && (
                          <motion.p 
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5"
                          >
                            <Info size={14} /> Please enter a valid email address
                          </motion.p>
                        )}
                      </div>
                      
                      {error && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2 text-sm font-bold text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200/50 dark:border-red-800/50 uppercase tracking-wider"
                        >
                          <Info size={16} /> {error}
                        </motion.div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="challenge-field"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <motion.button 
                        type="button"
                        onClick={() => setStep(1)}
                        whileHover={{ x: -4 }}
                        className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm hover:text-blue-700 dark:hover:text-blue-300 mb-4 transition-colors"
                      >
                        <ChevronDown size={18} className="rotate-90" /> Change Email
                      </motion.button>

                      {/* Password Input Card */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-wide">Password</label>
                          {isPasswordStrong && password && (
                            <motion.span 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-1.5 uppercase tracking-wider"
                            >
                              <CheckCircle2 size={14} /> Secure
                            </motion.span>
                          )}
                        </div>
                        
                        <div className="relative group">
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            autoFocus
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            className={`w-full px-5 py-3.5 rounded-2xl border-2 transition-all duration-300 font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none backdrop-blur-sm text-base ${
                              error 
                                ? 'border-red-400 bg-red-50/50 dark:bg-red-950/20 text-red-900 dark:text-red-100' 
                                : isPasswordStrong && password
                                ? 'border-green-400 bg-green-50/50 dark:bg-green-950/20 text-slate-900 dark:text-white'
                                : 'border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white hover:border-blue-300 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-950 focus:shadow-lg focus:shadow-blue-500/20'
                            }`}
                            id="challenge"
                            placeholder="Enter your password"
                            autoComplete="current-password"
                          />
                          <motion.button 
                            type="button"
                            whileHover={{ scale: 1.1 }}
                            onClick={() => setShowPassword(!showPassword)}
                            className={`absolute right-4 top-1/2 -translate-y-1/2 ${
                              isPasswordStrong && password ? 'text-green-500' : 'text-slate-400 dark:text-slate-500'
                            } hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none transition-colors`}
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </motion.button>
                        </div>
                        
                        {password && password.length < 6 && !error && (
                          <motion.p 
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5"
                          >
                            <Info size={14} /> Minimum 6 characters required
                          </motion.p>
                        )}
                      </div>
                      
                      {error && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2 text-sm font-bold text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200/50 dark:border-red-800/50 uppercase tracking-wider"
                        >
                          <Info size={16} /> {error}
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-bold py-3.5 px-4 rounded-2xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 disabled:shadow-none flex items-center justify-center gap-2 group text-base"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {step === 1 ? 'Continue to Password' : 'Access Dashboard'}
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
              
              {/* Footer Links */}
              <div className="mt-8 space-y-4">
                <Link 
                  to="/forgot-password" 
                  className="block text-center text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-wider"
                >
                  Forgot Password?
                </Link>
                
                <div className="h-[1px] bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent" />
                
                <p className="text-center text-sm text-slate-600 dark:text-slate-400 font-semibold">
                  New to FinBrain?{' '}
                  <Link 
                    to="/register" 
                    className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    Create Free Account
                  </Link>
                </p>
              </div>

              {/* Security Trust Indicators */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4"
              >
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bank-Level Security</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: Shield, label: 'Encrypted' },
                    { icon: Cpu, label: 'AI Protected' },
                    { icon: TrendingUp, label: 'Real-time' }
                  ].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={idx}
                        whileHover={{ y: -2 }}
                        className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        <Icon size={16} className="text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{item.label}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </form>
          </motion.div>
          
          {/* Footer */}
          <footer className="mt-auto pt-8 w-full max-w-sm flex flex-wrap justify-center gap-6 text-xs text-slate-500 dark:text-slate-500 font-semibold">
            <Link to="/help" className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors">Help</Link>
            <Link to="/privacy" className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors">Terms</Link>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Login;