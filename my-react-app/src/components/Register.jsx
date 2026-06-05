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
  ShieldCheck,
  Globe,
  ArrowLeft,
  User,
  Mail,
  Phone,
  ArrowRight,
  CheckCircle2,
  Shield,
  Cpu,
  TrendingUp,
  Lock
} from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  // Multi-step form state
  const [step, setStep] = useState(1); // 1: Name, 2: Email & Phone, 3: Password
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form Fields (preserving original structure)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  // Validation states
  const isNameValid = formData.name && formData.name.trim().length >= 2;
  const isEmailValid = formData.email && formData.email.includes('@') && formData.email.length > 5;
  const hasPasswordLetters = /[a-zA-Z]/.test(formData.password);
  const hasPasswordNumbers = /[0-9]/.test(formData.password);
  const isPasswordStrong = formData.password && formData.password.length >= 6 && hasPasswordLetters && hasPasswordNumbers;
  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleNext = async (e) => {
    e.preventDefault();
    setError('');

    // Registration Flow Steps
    if (step === 1) {
      if (!formData.name || formData.name.trim().length < 2) {
        setError('Please enter your full name');
        return;
      }
      setStep(2);
    } 
    else if (step === 2) {
      if (!formData.email || !formData.email.includes('@')) {
        setError('Enter a valid email address');
        return;
      }
      setStep(3);
    } 
    else {
      // Final step - Registration
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      
      // Check password contains both letters and numbers
      const hasLetters = /[a-zA-Z]/.test(formData.password);
      const hasNumbers = /[0-9]/.test(formData.password);
      if (!hasLetters || !hasNumbers) {
        setError('Password must contain at least one letter and one number');
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords don't match");
        return;
      }
      
      setIsLoading(true);
      
      // Prepare data for registration (excluding confirmPassword)
      const { confirmPassword, ...registerData } = formData;
      
      // Format phone number - remove non-digits if present
      if (registerData.phone && registerData.phone.trim()) {
        const phoneDigitsOnly = registerData.phone.replace(/\D/g, '');
        if (phoneDigitsOnly.length === 10) {
          registerData.phone = phoneDigitsOnly;
        } else if (phoneDigitsOnly.length > 0) {
          setIsLoading(false);
          setError('Phone number must be 10 digits');
          return;
        } else {
          // Empty after removing non-digits, set to empty string
          registerData.phone = '';
        }
      } else {
        // Make sure phone is empty string if not provided
        registerData.phone = '';
      }
      
      const result = await register(registerData);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Registration failed. Please try again.');
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setError('');
  };

  return (
    <div className="min-h-screen flex transition-colors duration-500 font-sans bg-gradient-to-br from-white via-indigo-50/30 to-white dark:from-slate-950 dark:via-slate-900 to-slate-950 relative overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400 to-purple-300 rounded-full blur-3xl dark:from-indigo-600 dark:to-purple-700"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
          className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full blur-3xl dark:from-blue-600 dark:to-cyan-700"
        />
      </div>

      {/* Left Column - Visuals (hidden on mobile) */}
      <div className="hidden lg:flex lg:flex-1 relative items-center justify-center p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-3xl" />
        
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
                className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-400 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/40"
              >
                <Zap size={32} className="text-white" strokeWidth={1.5} />
              </motion.div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">FinBrain</h1>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">AI-Powered Finance Platform</p>
              </div>
            </div>

            {/* Main Message */}
            <div className="space-y-3">
              <h2 className="text-5xl font-black text-slate-900 dark:text-white leading-tight">
                Start Your
                <span className="block text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-600 bg-clip-text">Financial Journey</span>
              </h2>
              <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-medium max-w-md">
                Join thousands of users transforming their wealth with AI-driven insights, real-time analytics, and smart investment strategies.
              </p>
            </div>

            {/* Benefits List */}
            <div className="space-y-3 pt-4">
              {[
                { icon: '1', label: 'Set up in 2 minutes' },
                { icon: '2', label: 'Personalized AI advisor' },
                { icon: '3', label: 'Real-time insights' },
                { icon: '4', label: '100% encrypted & secure' }
              ].map((benefit, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 + 0.3 }}
                  className="flex items-center gap-3 p-3 bg-white/40 dark:bg-slate-800/30 backdrop-blur-md rounded-lg border border-white/50 dark:border-slate-700/50 hover:bg-white/60 dark:hover:bg-slate-800/50 transition-all group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">{benefit.icon}</span>
                  <span className="font-semibold text-sm text-slate-900 dark:text-white">{benefit.label}</span>
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
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
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
            {/* Progress Bar */}
            <div className="mb-8 space-y-2">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white">
                  {step === 1 ? 'Create Account' : step === 2 ? 'Contact Info' : 'Secure Password'}
                </h1>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: '33%' }}
                  animate={{ width: `${(step / 3) * 100}%` }}
                  transition={{ duration: 0.4 }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                />
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleNext} className="flex flex-col w-full">
              <div className="relative min-h-[140px]">
                <AnimatePresence mode="wait">
                  {/* STEP 1: NAME */}
                  {step === 1 && (
                    <motion.div 
                      key="step-name" 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: -20 }} 
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <label className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-wide">Full Name</label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          {isNameValid && (
                            <motion.span 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-1.5 uppercase tracking-wider"
                            >
                              <CheckCircle2 size={14} /> Perfect
                            </motion.span>
                          )}
                        </div>
                        <div className="relative group">
                          <input
                            type="text"
                            name="name"
                            required
                            autoFocus
                            value={formData.name}
                            onChange={handleInputChange}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            className={`w-full px-5 py-3.5 rounded-2xl border-2 transition-all duration-300 font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none backdrop-blur-sm text-base ${
                              error 
                                ? 'border-red-400 bg-red-50/50 dark:bg-red-950/20 text-red-900 dark:text-red-100' 
                                : isNameValid && formData.name
                                ? 'border-green-400 bg-green-50/50 dark:bg-green-950/20 text-slate-900 dark:text-white'
                                : 'border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white hover:border-indigo-300 dark:hover:border-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-950 focus:shadow-lg focus:shadow-indigo-500/20'
                            }`}
                            id="name"
                            placeholder="John Doe"
                          />
                          <motion.div 
                            animate={{ scale: isFocused ? 1.1 : 1 }}
                            className={`absolute right-4 top-1/2 -translate-y-1/2 ${
                              isNameValid && formData.name ? 'text-green-500' : 'text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            <User size={20} />
                          </motion.div>
                        </div>
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

                  {/* STEP 2: EMAIL & PHONE */}
                  {step === 2 && (
                    <motion.div 
                      key="step-contact" 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: -20 }} 
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <label className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-wide block">Contact Information</label>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          {isEmailValid && (
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
                            name="email"
                            required
                            autoFocus
                            value={formData.email}
                            onChange={handleInputChange}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            className={`w-full px-5 py-3.5 rounded-2xl border-2 transition-all duration-300 font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none backdrop-blur-sm text-base ${
                              isEmailValid && formData.email
                              ? 'border-green-400 bg-green-50/50 dark:bg-green-950/20 text-slate-900 dark:text-white'
                              : 'border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white hover:border-indigo-300 dark:hover:border-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-950 focus:ring-0 focus:shadow-lg focus:shadow-indigo-500/20'
                            }`}
                            id="email"
                            placeholder="name@university.edu"
                          />
                          <motion.div 
                            animate={{ scale: isFocused ? 1.1 : 1 }}
                            className={`absolute right-4 top-1/2 -translate-y-1/2 ${
                              isEmailValid && formData.email ? 'text-green-500' : 'text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            <Mail size={20} />
                          </motion.div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="relative group">
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white hover:border-indigo-300 dark:hover:border-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-950 focus:ring-0 focus:shadow-lg focus:shadow-indigo-500/20 transition-all duration-300 font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none text-base"
                            id="phone"
                            placeholder="+1 (555) 000-0000"
                          />
                          <motion.div 
                            animate={{ scale: isFocused ? 1.1 : 1 }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                          >
                            <Phone size={20} />
                          </motion.div>
                          <span className="text-xs text-slate-500 dark:text-slate-400 mt-2 block font-semibold">Optional</span>
                        </div>
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

                  {/* STEP 3: PASSWORD */}
                  {step === 3 && (
                    <motion.div 
                      key="step-password" 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: -20 }} 
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <label className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-wide block">Create Password</label>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          {isPasswordStrong && (
                            <motion.span 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-1.5 uppercase tracking-wider"
                            >
                              <CheckCircle2 size={14} /> Strong
                            </motion.span>
                          )}
                        </div>
                        <div className="relative group">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            required
                            autoFocus
                            value={formData.password}
                            onChange={handleInputChange}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            className={`w-full px-5 py-3.5 rounded-2xl border-2 transition-all duration-300 font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none backdrop-blur-sm text-base ${
                              isPasswordStrong && formData.password
                              ? 'border-green-400 bg-green-50/50 dark:bg-green-950/20 text-slate-900 dark:text-white'
                              : 'border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white hover:border-indigo-300 dark:hover:border-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-950 focus:ring-0 focus:shadow-lg focus:shadow-indigo-500/20'
                            }`}
                            id="password"
                            placeholder="At least 6 characters (letters + numbers)"
                          />
                          <motion.button 
                            type="button"
                            whileHover={{ scale: 1.1 }}
                            onClick={() => setShowPassword(!showPassword)}
                            className={`absolute right-4 top-1/2 -translate-y-1/2 ${
                              isPasswordStrong && formData.password ? 'text-green-500' : 'text-slate-400 dark:text-slate-500'
                            } hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none transition-colors`}
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </motion.button>
                        </div>
                        
                        {formData.password && (
                          <motion.div 
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-1.5"
                          >
                            {formData.password.length < 6 && (
                              <motion.p 
                                className="text-xs text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5"
                              >
                                <Info size={14} /> Minimum 6 characters required
                              </motion.p>
                            )}
                            {formData.password.length >= 6 && !hasPasswordLetters && (
                              <motion.p 
                                className="text-xs text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5"
                              >
                                <Info size={14} /> Must contain at least one letter
                              </motion.p>
                            )}
                            {formData.password.length >= 6 && !hasPasswordNumbers && (
                              <motion.p 
                                className="text-xs text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5"
                              >
                                <Info size={14} /> Must contain at least one number
                              </motion.p>
                            )}
                          </motion.div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          {passwordsMatch && formData.confirmPassword && (
                            <motion.span 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-1.5 uppercase tracking-wider"
                            >
                              <CheckCircle2 size={14} /> Matches
                            </motion.span>
                          )}
                        </div>
                        <div className="relative group">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            required
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            className={`w-full px-5 py-3.5 rounded-2xl border-2 transition-all duration-300 font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none backdrop-blur-sm text-base ${
                              passwordsMatch && formData.confirmPassword
                              ? 'border-green-400 bg-green-50/50 dark:bg-green-950/20 text-slate-900 dark:text-white'
                              : formData.confirmPassword && !passwordsMatch
                              ? 'border-red-400 bg-red-50/50 dark:bg-red-950/20 text-slate-900 dark:text-white'
                              : 'border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white hover:border-indigo-300 dark:hover:border-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-950 focus:ring-0 focus:shadow-lg focus:shadow-indigo-500/20'
                            }`}
                            id="confirmPassword"
                            placeholder="Confirm password"
                          />
                          <motion.button 
                            type="button"
                            whileHover={{ scale: 1.1 }}
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className={`absolute right-4 top-1/2 -translate-y-1/2 ${
                              passwordsMatch && formData.confirmPassword ? 'text-green-500' : formData.confirmPassword && !passwordsMatch ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'
                            } hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none transition-colors`}
                          >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </motion.button>
                        </div>
                        
                        {formData.confirmPassword && !passwordsMatch && (
                          <motion.p 
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs text-red-600 dark:text-red-400 font-bold uppercase tracking-wider flex items-center gap-1.5"
                          >
                            <Info size={14} /> Passwords don't match
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
                      
                      <div className="flex items-start gap-3 p-3 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/50 rounded-lg">
                        <Shield size={16} className="text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-bold">
                          Use 8+ characters with letters, numbers, and symbols for maximum security
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-col gap-4">
                <motion.button 
                  type="submit" 
                  disabled={isLoading} 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-bold py-3.5 px-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 disabled:shadow-none flex items-center justify-center gap-2 group text-base"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {step === 3 ? 'Create My Account' : 'Continue to Next'}
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>

                {step > 1 && (
                  <motion.button 
                    type="button" 
                    onClick={handleBack} 
                    whileHover={{ scale: 1.02 }}
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-bold py-2 transition-colors flex items-center justify-center gap-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900"
                  >
                    <ArrowLeft size={16} /> Go Back
                  </motion.button>
                )}
              </div>

              {step === 1 && (
                <div className="mt-8 text-center flex flex-col items-center gap-4">
                  <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent" />
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold">
                    Already have an account?{' '}
                    <Link 
                      to="/login" 
                      className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                    >
                      Sign In Here
                    </Link>
                  </p>
                </div>
              )}

              {/* Security Trust Indicators */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4"
              >
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">What You Unlock</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: Shield, label: 'Secure' },
                    { icon: Cpu, label: 'Smart AI' },
                    { icon: TrendingUp, label: 'Growth' }
                  ].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={idx}
                        whileHover={{ y: -2 }}
                        className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                      >
                        <Icon size={16} className="text-indigo-600 dark:text-indigo-400" />
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

export default Register;
