"use client";

import { PlayCircle, ArrowRight, TrendingUp, Eye, Activity } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen pt-32 pb-20 px-8 flex flex-col lg:flex-row items-center max-w-7xl mx-auto gap-16">
      <div className="lg:w-1/2 space-y-8">
        <span className="inline-block px-4 py-1 rounded-full border border-outline-variant/30 text-[10px] uppercase tracking-[0.2em] font-bold text-secondary">
          Advanced SEO Infrastructure
        </span>
        
        <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none text-on-surface">
          Master Your SEO with <span className="text-gradient">Precision.</span>
        </h1>
        
        <p className="text-lg text-on-surface-variant/80 max-w-xl leading-relaxed font-light">
          Transform your digital footprint with real-time performance analytics, automated health audits, and predictive ranking intelligence.
        </p>
        
        <div className="flex items-center gap-6 pt-4">
          <button className="bg-primary-container text-white px-8 py-4 rounded-xl font-bold tracking-tight hover:brightness-110 transition-all shadow-xl">
            Deploy Velocity
          </button>
          <button className="text-on-surface flex items-center gap-2 group font-semibold">
            <PlayCircle className="w-5 h-5 text-secondary" />
            See Performance
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        
        <div className="flex gap-8 pt-8 items-center border-t border-outline-variant/10">
          <div className="text-center">
            <p className="text-2xl font-bold text-secondary">99.8%</p>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Accuracy</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">12M+</p>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Keywords</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-tertiary">24/7</p>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Monitoring</p>
          </div>
        </div>
      </div>

      {/* Hero Mockup Area */}
      <div className="lg:w-1/2 relative">
        <div className="glass-panel p-6 rounded-[32px] relative z-10 shadow-2xl overflow-hidden">
          {/* Dashboard Mock */}
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <p className="text-xs text-on-surface-variant uppercase tracking-widest">Global Health</p>
              <h3 className="text-xl font-bold">Performance Hub</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center border border-outline-variant/30">
              <Activity className="w-5 h-5 text-secondary" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/20">
              <div className="flex justify-between items-start">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-[10px] text-primary font-bold">+12.4%</span>
              </div>
              <p className="text-2xl font-bold mt-2">1,248</p>
              <p className="text-[10px] text-on-surface-variant uppercase">Daily Clicks</p>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/20">
              <div className="flex justify-between items-start">
                <Eye className="w-5 h-5 text-secondary" />
                <span className="text-[10px] text-secondary font-bold">+5.2%</span>
              </div>
              <p className="text-2xl font-bold mt-2">84.2K</p>
              <p className="text-[10px] text-on-surface-variant uppercase">Impressions</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-highest/50">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-secondary"></div>
                <span className="text-sm font-medium">Core Web Vitals</span>
              </div>
              <span className="text-sm font-bold text-secondary">Pass</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-highest/50">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span className="text-sm font-medium">Mobile Usability</span>
              </div>
              <span className="text-sm font-bold text-primary">98%</span>
            </div>
          </div>
        </div>

        {/* Floating Score Circle */}
        <div className="absolute -top-12 -right-12 z-20 glass-panel p-6 rounded-full w-48 h-48 flex flex-col items-center justify-center border-primary/40 shadow-[0_0_30px_rgba(160,120,255,0.2)]">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle className="text-surface-container-highest" cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" strokeWidth="8"></circle>
            <circle className="text-primary" cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" strokeDasharray="502" strokeDashoffset="50" strokeWidth="8"></circle>
          </svg>
          <span className="text-4xl font-black text-on-surface">92</span>
          <span className="text-[10px] uppercase tracking-widest font-bold text-primary">SEO Score</span>
        </div>

        {/* Glow Effects */}
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-primary/20 blur-[100px] rounded-full"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full"></div>
      </div>
    </section>
  );
}
