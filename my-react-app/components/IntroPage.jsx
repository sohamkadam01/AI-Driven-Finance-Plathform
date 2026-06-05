import React, { useState, useEffect } from 'react';

const IntroPage = ({ onGetStarted }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      title: "Welcome to FinAI",
      subtitle: "Your Intelligent Financial Companion",
      description: "Experience the future of personal finance management powered by cutting-edge AI technology.",
      icon: "fas fa-brain",
      color: "from-blue-500 to-purple-600"
    },
    {
      title: "Smart Budgeting",
      subtitle: "AI-Powered Insights",
      description: "Let our AI analyze your spending patterns and create personalized budget recommendations.",
      icon: "fas fa-chart-line",
      color: "from-purple-500 to-pink-600"
    },
    {
      title: "Real-time Analytics",
      subtitle: "Instant Financial Intelligence",
      description: "Get real-time insights into your financial health with beautiful visualizations.",
      icon: "fas fa-chart-pie",
      color: "from-pink-500 to-orange-600"
    },
    {
      title: "Secure & Private",
      subtitle: "Bank-Grade Security",
      description: "Your financial data is protected with AES-256 encryption and never shared.",
      icon: "fas fa-shield-alt",
      color: "from-green-500 to-blue-600"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-y-auto">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center justify-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div className="text-center lg:text-left">
            <div className="mb-8 animate-bounce">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10">
                <i className="fas fa-robot text-blue-400"></i>
                <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
                  AI-Powered Finance
                </span>
              </div>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black mb-6 leading-tight">
              Welcome to <br />
              <span className="gradient-text">FinAI</span>
            </h1>
            
            <p className="text-xl text-slate-400 mb-12 leading-relaxed">
              Transform the way you manage money with intelligent automation, 
              predictive analytics, and personalized financial guidance.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all transform hover:scale-105"
              >
                Get Started <i className="fas fa-arrow-right ml-2"></i>
              </button>
              <button className="px-8 py-4 glass-card font-bold text-lg hover:bg-white/10 transition-all">
                Watch Demo <i className="fas fa-play ml-2"></i>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-16 pt-8 border-t border-white/10">
              <div>
                <div className="text-3xl font-bold text-blue-400">99.2%</div>
                <div className="text-xs text-slate-500 mt-1">Accuracy Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-400">50K+</div>
                <div className="text-xs text-slate-500 mt-1">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-pink-400">24/7</div>
                <div className="text-xs text-slate-500 mt-1">AI Support</div>
              </div>
            </div>
          </div>

          {/* Right Side - Carousel */}
          <div className="relative">
            <div className="glass-card p-8 border-blue-500/30">
              <div className="text-center mb-8">
                <div className={`w-24 h-24 mx-auto rounded-2xl bg-gradient-to-r ${slides[currentSlide].color} flex items-center justify-center mb-6 shadow-xl`}>
                  <i className={`${slides[currentSlide].icon} text-white text-4xl`}></i>
                </div>
                <h3 className="text-2xl font-bold mb-2">{slides[currentSlide].title}</h3>
                <p className="text-blue-400 text-sm font-semibold mb-4">{slides[currentSlide].subtitle}</p>
                <p className="text-slate-400">{slides[currentSlide].description}</p>
              </div>

              {/* Carousel Indicators */}
              <div className="flex justify-center gap-2 mt-8">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all ${
                      currentSlide === idx 
                        ? 'w-8 bg-gradient-to-r from-blue-500 to-purple-500' 
                        : 'w-2 bg-slate-600 hover:bg-slate-500'
                    }`}
                  />
                ))}
              </div>

              {/* Feature Tags */}
              <div className="flex flex-wrap gap-2 justify-center mt-8 pt-6 border-t border-white/10">
                <span className="tech-pill text-xs">AI-Powered</span>
                <span className="tech-pill text-xs">Real-time Sync</span>
                <span className="tech-pill text-xs">Bank Security</span>
                <span className="tech-pill text-xs">Smart Alerts</span>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full filter blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/20 rounded-full filter blur-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroPage;