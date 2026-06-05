import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ variant = 'default' }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  if (variant === 'detailed') {
    return (
      <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-900/80 p-1 rounded-full border border-slate-200/60 dark:border-slate-800/80 backdrop-blur-md shadow-sm transition-all duration-300">
        <button
          onClick={() => isDarkMode && toggleTheme()}
          className={`relative flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-300 ${
            !isDarkMode
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          {!isDarkMode && (
            <motion.div
              layoutId="activeThemeTab"
              className="absolute inset-0 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-200/20"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            <Sun size={14} className={!isDarkMode ? 'text-amber-500 fill-amber-400/80' : 'text-slate-400'} />
            Daylight
          </span>
        </button>
        <button
          onClick={() => !isDarkMode && toggleTheme()}
          className={`relative flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-300 ${
            isDarkMode
              ? 'text-amber-400 font-semibold'
              : 'text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          {isDarkMode && (
            <motion.div
              layoutId="activeThemeTab"
              className="absolute inset-0 bg-slate-800 dark:bg-slate-800 rounded-full shadow-sm border border-slate-700/50"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            <Moon size={14} className={isDarkMode ? 'text-amber-400 fill-amber-400/10' : 'text-slate-500'} />
            Nightlight
          </span>
        </button>
      </div>
    );
  }

  // Default compact premium animated theme toggle button with a soft glow
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="relative p-2.5 rounded-full bg-slate-50 hover:bg-slate-100/80 dark:bg-slate-900 dark:hover:bg-slate-800/80 text-slate-500 dark:text-slate-400 transition-all border border-slate-200 dark:border-slate-800/80 shadow-sm flex items-center justify-center overflow-hidden group"
      title={isDarkMode ? 'Switch to Daylight' : 'Switch to Nightlight'}
      aria-label="Toggle theme"
    >
      {/* Background radial glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/0 to-amber-500/10 opacity-0 group-hover:opacity-100 dark:from-yellow-400/0 dark:to-yellow-400/10 transition-opacity duration-300" />
      
      <div className="relative w-[18px] h-[18px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {!isDarkMode ? (
            <motion.div
              key="sun"
              initial={{ y: -20, opacity: 0, rotate: -45 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: 20, opacity: 0, rotate: 45 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <Sun className="w-[18px] h-[18px] text-amber-500 fill-amber-400/60" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ y: -20, opacity: 0, rotate: 45 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: 20, opacity: 0, rotate: -45 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <Moon className="w-[18px] h-[18px] text-amber-400 fill-amber-400/10" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  );
};

export default ThemeToggle;

