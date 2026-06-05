// import React, { useState, useEffect, useRef } from 'react';
// import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
// import { 
//   ArrowRight, 
//   PieChart, 
//   TrendingUp, 
//   ShieldCheck, 
//   Zap, 
//   Lock, 
//   EyeOff, 
//   Sun, 
//   Moon, 
//   CheckCircle2, 
//   Mic, 
//   Sparkles, 
//   Cpu, 
//   Fingerprint, 
//   Link as LinkIcon, 
//   BrainCircuit, 
//   LineChart,
//   Shield,
//   Key,
//   DatabaseZap
// } from 'lucide-react';

// const App = () => {
//   const [isDarkMode, setIsDarkMode] = useState(() => {
//     const saved = localStorage.getItem('theme');
//     if (saved) return saved === 'dark';
//     return window.matchMedia('(prefers-color-scheme: dark)').matches;
//   });

//   // Scroll logic for the connecting line
//   const coreValuesRef = useRef(null);
//   const { scrollYProgress } = useScroll({
//     target: coreValuesRef,
//     offset: ["start center", "end center"]
//   });

//   const scaleY = useSpring(scrollYProgress, {
//     stiffness: 100,
//     damping: 30,
//     restDelta: 0.001
//   });

//   useEffect(() => {
//     if (isDarkMode) {
//       document.documentElement.classList.add('dark');
//       localStorage.setItem('theme', 'dark');
//     } else {
//       document.documentElement.classList.remove('dark');
//       localStorage.setItem('theme', 'light');
//     }
//   }, [isDarkMode]);

//   const toggleTheme = () => setIsDarkMode(!isDarkMode);

//   const features = [
//     {
//       icon: <PieChart className="w-6 h-6 text-blue-500" />,
//       title: "Auto-Categorize Spending",
//       desc: "Smart algorithms sort every transaction so you don't have to."
//     },
//     {
//       icon: <TrendingUp className="w-6 h-6 text-green-500" />,
//       title: "Predict Future Money",
//       desc: "See where your balance will be in 6 months based on current trends."
//     },
//     {
//       icon: <Zap className="w-6 h-6 text-yellow-500" />,
//       title: "Detect Unusual Activity",
//       desc: "Instant alerts for subscriptions spikes or suspicious charges."
//     },
//     {
//       icon: <CheckCircle2 className="w-6 h-6 text-purple-500" />,
//       title: "Smart Saving Tips",
//       desc: "AI-driven suggestions to optimize your recurring expenses."
//     },
//     {
//       icon: <Mic className="w-6 h-6 text-red-500" />,
//       title: "Voice + Chat Assistant",
//       desc: "Ask 'How much did I spend on coffee?' and get instant answers."
//     }
//   ];

//   const coreValues = [
//     { 
//       icon: <TrendingUp className="w-7 h-7" />, 
//       title: "Predictive Intelligence", 
//       text: "We don't just show you where your money went, we predict where it's going. Our models forecast your balance up to 12 months out.",
//       color: "text-blue-600",
//       accent: "bg-blue-600"
//     },
//     { 
//       icon: <Cpu className="w-7 h-7" />, 
//       title: "Full Automation", 
//       text: "Stop manually entering receipts; let automation handle the heavy lifting. We sync with 10,000+ financial institutions worldwide.",
//       color: "text-purple-600",
//       accent: "bg-purple-600"
//     },
//     { 
//       icon: <Fingerprint className="w-7 h-7" />, 
//       title: "Personalized Engine", 
//       text: "Get proactive insights that help you make smarter decisions in real-time. No more generic advice, just tailored growth strategies.",
//       color: "text-green-600",
//       accent: "bg-green-600"
//     }
//   ];

//   return (
//     <div className="min-h-screen font-sans transition-colors duration-300 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
//       {/* Navigation */}
//       <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
//         <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
//           <div className="flex items-center gap-2 font-semibold text-xl tracking-tight">
//             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
//               <Zap size={20} />
//             </div>
//             <span>FinBrain</span>
//           </div>
          
//           <div className="flex items-center gap-6">
//             <button 
//               onClick={toggleTheme}
//               className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
//               aria-label="Toggle Theme"
//             >
//               {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-600" />}
//             </button>
//             <button className="hidden md:block text-sm font-medium hover:text-blue-600 transition-colors">Sign In</button>
//             <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-all shadow-sm">
//               Get Started
//             </button>
//           </div>
//         </div>
//       </nav>

//       {/* Hero Section */}
//       <header className="pt-32 pb-20 px-6">
//         <div className="max-w-4xl mx-auto text-center">
//           <motion.h1 
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-600 dark:from-white dark:to-slate-400"
//           >
//             Your AI-Powered <br className="hidden md:block" /> Financial Brain
//           </motion.h1>
//           <motion.p 
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1 }}
//             className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto"
//           >
//             Track, predict, and grow your money with intelligent automation.
//           </motion.p>
//           <motion.div 
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="flex flex-col sm:flex-row items-center justify-center gap-4"
//           >
//             <button className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 group">
//               Get Started <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
//             </button>
//             <button className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full font-semibold transition-all shadow-sm">
//               Try Demo
//             </button>
//           </motion.div>
//         </div>
//       </header>

//       {/* Core Value Section - Typographic/Google Style Format with Scrolling Line */}
//       <section className="py-32 px-6 overflow-hidden" ref={coreValuesRef}>
//         <div className="max-w-4xl mx-auto">
//           <motion.div 
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.6 }}
//             className="mb-20"
//           >
//             <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">What makes us different?</h2>
//             <p className="text-xl text-slate-500 dark:text-slate-400 max-w-xl">
//               We've redesigned financial planning from the ground up, focusing on clarity, speed, and proactive intelligence.
//             </p>
//           </motion.div>

//           <div className="relative space-y-24">
//             {/* The Connecting Scroll Line */}
//             <div className="absolute left-[13px] md:left-[13px] top-4 bottom-4 w-[2px] bg-slate-100 dark:bg-slate-800">
//               <motion.div 
//                 className="absolute top-0 left-0 w-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)] origin-top"
//                 style={{ scaleY }}
//               />
//             </div>

//             {coreValues.map((point, i) => (
//               <motion.div 
//                 key={i}
//                 initial={{ opacity: 0, x: 20 }}
//                 whileInView={{ opacity: 1, x: 0 }}
//                 viewport={{ once: true, margin: "-100px" }}
//                 transition={{ duration: 0.8, ease: "easeOut" }}
//                 className="relative flex items-start gap-10 md:gap-14 pl-1"
//               >
//                 {/* Dot/Icon Container */}
//                 <div className="relative z-10 flex-shrink-0">
//                   <motion.div 
//                     initial={{ scale: 0.8 }}
//                     whileInView={{ scale: 1 }}
//                     viewport={{ once: true }}
//                     className={`w-7 h-7 rounded-full bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-visible`}
//                   >
//                     <motion.div 
//                       className={`absolute inset-0 rounded-full ${point.accent} opacity-0`}
//                       whileInView={{ opacity: [0, 0.4, 0], scale: [1, 1.8, 1] }}
//                       transition={{ duration: 2, repeat: Infinity }}
//                     />
//                     <div className={`relative z-10 ${point.color}`}>
//                       {/* Smaller version of icon for the bullet point */}
//                       {React.cloneElement(point.icon, { className: "w-4 h-4" })}
//                     </div>
//                   </motion.div>
//                 </div>

//                 <div className="flex-1">
//                   <h3 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-3">
//                     {point.title}
//                     {i === 0 && <Sparkles size={18} className="text-yellow-500" />}
//                   </h3>
//                   <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
//                     {point.text}
//                   </p>
                  
//                   {/* Subtle decorative element for each point */}
//                   <motion.div 
//                     initial={{ width: 0 }}
//                     whileInView={{ width: "100px" }}
//                     viewport={{ once: true }}
//                     className={`h-0.5 mt-6 ${point.accent} opacity-20 rounded-full`}
//                   />
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Features List - Enhanced Google-Style Format */}
//       <section className="py-24 px-6 border-b border-slate-100 dark:border-slate-800/50">
//         <div className="max-w-5xl mx-auto">
//           <motion.div 
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             className="mb-16"
//           >
//             <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Powerful Features</h2>
//             <div className="h-1 w-12 bg-blue-600 rounded-full"></div>
//           </motion.div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
//             {features.map((f, i) => (
//               <motion.div 
//                 key={i}
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: i * 0.1, duration: 0.5 }}
//                 className="flex items-start gap-5 group"
//               >
//                 <div className="mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-900 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors duration-300">
//                   {f.icon}
//                 </div>
//                 <div className="flex-1">
//                   <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
//                     {f.title}
//                   </h3>
//                   <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[15px]">
//                     {f.desc}
//                   </p>
//                 </div>
//               </motion.div>
//             ))}
            
//             {/* CTA Link to more features */}
//             <motion.div 
//               initial={{ opacity: 0 }}
//               whileInView={{ opacity: 1 }}
//               viewport={{ once: true }}
//               transition={{ delay: 0.6 }}
//               className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold cursor-pointer group"
//             >
//               See all capabilities <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
//             </motion.div>
//           </div>
//         </div>
//       </section>

//       {/* How It Works - Enhanced Realistic Flow */}
//       <section className="py-24 px-6 bg-slate-50 dark:bg-slate-900/50 transition-colors duration-300 overflow-hidden relative border-y border-slate-100 dark:border-slate-800/50">
//         {/* Background Accents - Optimized for Light/Dark Mode */}
//         <div className="absolute top-0 left-0 w-full h-full opacity-10 dark:opacity-20 pointer-events-none">
//           <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full blur-[120px]"></div>
//           <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500 rounded-full blur-[120px]"></div>
//         </div>

//         <div className="max-w-6xl mx-auto relative z-10">
//           <motion.div 
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             className="text-center mb-20"
//           >
//             <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">How it works</h2>
//             <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">Experience the power of effortless financial management in three simple steps.</p>
//           </motion.div>

//           <div className="relative">
//             {/* Connection Line (Desktop) */}
//             <div className="hidden md:block absolute top-1/4 left-[15%] right-[15%] h-0.5 bg-slate-200 dark:bg-slate-800">
//               <motion.div 
//                 initial={{ scaleX: 0 }}
//                 whileInView={{ scaleX: 1 }}
//                 viewport={{ once: true }}
//                 transition={{ duration: 1.5, ease: "easeInOut" }}
//                 className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] origin-left"
//               />
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
//               {[
//                 { 
//                   icon: <LinkIcon size={32} />, 
//                   title: "Secure Connection", 
//                   desc: "Connect your bank accounts with bank-grade 256-bit encryption.",
//                   color: "bg-blue-500",
//                   iconColor: "text-blue-500"
//                 },
//                 { 
//                   icon: <BrainCircuit size={32} />, 
//                   title: "AI Analysis", 
//                   desc: "Our neural engine scans and categorizes your data instantly.",
//                   color: "bg-purple-500",
//                   iconColor: "text-purple-500"
//                 },
//                 { 
//                   icon: <LineChart size={32} />, 
//                   title: "Smart Growth", 
//                   desc: "Receive customized strategies to save more and grow faster.",
//                   color: "bg-green-500",
//                   iconColor: "text-green-500"
//                 }
//               ].map((s, idx) => (
//                 <motion.div 
//                   key={idx}
//                   initial={{ opacity: 0, y: 30 }}
//                   whileInView={{ opacity: 1, y: 0 }}
//                   viewport={{ once: true }}
//                   transition={{ delay: idx * 0.3, duration: 0.8 }}
//                   className="flex flex-col items-center text-center group"
//                 >
//                   <div className="relative mb-8">
//                     {/* Animated Glow Ring */}
//                     <motion.div 
//                       animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.3, 0.1] }}
//                       transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: idx * 0.5 }}
//                       className={`absolute inset-0 rounded-full blur-xl ${s.color}`}
//                     />
                    
//                     {/* Icon Container */}
//                     <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center relative z-10 border border-slate-200 dark:border-slate-700 shadow-xl transition-transform duration-500 group-hover:-translate-y-2 group-hover:rotate-3">
//                       <div className={`${s.iconColor} drop-shadow-sm`}>
//                         {s.icon}
//                       </div>
//                     </div>

//                     {/* Step Number Badge */}
//                     <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm z-20 shadow-lg border-2 border-white dark:border-slate-900">
//                       {idx + 1}
//                     </div>
//                   </div>

//                   <h3 className="text-2xl font-bold mb-4 tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
//                     {s.title}
//                   </h3>
//                   <p className="text-slate-600 dark:text-slate-400 leading-relaxed px-4">
//                     {s.desc}
//                   </p>
//                 </motion.div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Trust Section - Typographic/Google Style */}
//       <section className="py-32 px-6 overflow-hidden bg-white dark:bg-slate-950">
//         <div className="max-w-6xl mx-auto">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
//             {/* Left: Headline & Visual */}
//             <motion.div
//               initial={{ opacity: 0, x: -30 }}
//               whileInView={{ opacity: 1, x: 0 }}
//               viewport={{ once: true }}
//               transition={{ duration: 0.8 }}
//             >
//               <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 font-bold tracking-widest uppercase text-sm mb-6">
//                 <Shield size={18} />
//                 Safety as a Priority
//               </div>
//               <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8 leading-[1.1]">
//                 Your security is at the core <br className="hidden md:block" /> 
//                 of everything we build.
//               </h2>
              
//               {/* Animated Trust Badge */}
//               <div className="relative inline-flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
//                 <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 relative overflow-hidden">
//                   <motion.div 
//                     animate={{ y: [-20, 40] }}
//                     transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
//                     className="absolute inset-0 bg-gradient-to-b from-transparent via-green-400/20 to-transparent w-full h-[50%]"
//                   />
//                   <ShieldCheck size={24} />
//                 </div>
//                 <div>
//                   <div className="text-sm font-bold">Secure Scan Active</div>
//                   <div className="text-xs text-slate-500 uppercase tracking-tighter font-medium">Verified AES-256 Infrastructure</div>
//                 </div>
//               </div>
//             </motion.div>

//             {/* Right: Detailed Trust Pillars */}
//             <div className="space-y-12">
//               {[
//                 { 
//                   icon: <Lock className="text-blue-500" />, 
//                   title: "End-to-End Encryption", 
//                   desc: "We use the same encryption standards as major banks. Your data is encrypted before it even leaves your device." 
//                 },
//                 { 
//                   icon: <EyeOff className="text-purple-500" />, 
//                   title: "Privacy First", 
//                   desc: "FinBrain does not sell your data. We make money through subscriptions, not by trading your personal financial history." 
//                 },
//                 { 
//                   icon: <DatabaseZap className="text-orange-500" />, 
//                   title: "Real-time Monitoring", 
//                   desc: "Our systems monitor for unusual activity 24/7, keeping your assets safe with automated anomaly detection." 
//                 }
//               ].map((item, idx) => (
//                 <motion.div 
//                   key={idx}
//                   initial={{ opacity: 0, y: 20 }}
//                   whileInView={{ opacity: 1, y: 0 }}
//                   viewport={{ once: true }}
//                   transition={{ delay: idx * 0.2, duration: 0.5 }}
//                   className="flex gap-6 group"
//                 >
//                   <div className="flex-shrink-0 mt-1">
//                     <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-900 group-hover:bg-white dark:group-hover:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-800 transition-all duration-300">
//                       {item.icon}
//                     </div>
//                   </div>
//                   <div>
//                     <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
//                       {item.title}
//                     </h3>
//                     <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
//                       {item.desc}
//                     </p>
//                   </div>
//                 </motion.div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Final CTA */}
//       <section className="py-32 px-6 text-center">
//         <motion.div 
//           initial={{ opacity: 0, scale: 0.9 }}
//           whileInView={{ opacity: 1, scale: 1 }}
//           viewport={{ once: true }}
//           className="max-w-4xl mx-auto bg-slate-900 dark:bg-blue-600 rounded-[3rem] p-12 md:p-20 text-white shadow-2xl overflow-hidden relative"
//         >
//           <div className="absolute inset-0 opacity-10 pointer-events-none">
//             <div className="grid grid-cols-6 h-full gap-2">
//               {[...Array(24)].map((_, i) => (
//                 <div key={i} className="border border-white/20"></div>
//               ))}
//             </div>
//           </div>
//           <h2 className="text-3xl md:text-5xl font-bold mb-8 relative z-10">Start managing your money smarter today</h2>
//           <motion.button 
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             className="relative z-10 bg-white text-slate-900 hover:bg-slate-100 px-10 py-4 rounded-full font-bold text-lg transition-all shadow-xl"
//           >
//             Get Started Now
//           </motion.button>
//         </motion.div>
//       </section>

//       {/* Footer */}
//       <footer className="py-12 px-6 text-center text-slate-500 text-sm border-t border-slate-100 dark:border-slate-800">
//         <p>&copy; {new Date().getFullYear()} FinBrain AI. All rights reserved.</p>
//         <div className="flex justify-center gap-6 mt-4">
//           <a href="#" className="hover:text-blue-600">Privacy</a>
//           <a href="#" className="hover:text-blue-600">Terms</a>
//           <a href="#" className="hover:text-blue-600">Security</a>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default App;