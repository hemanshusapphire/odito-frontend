"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { savePaymentIntent } from "@/utils/paymentUtils";
import { Check, X } from "lucide-react";

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleCtaClick = (planType) => {
    switch (planType) {
      case 'start':
        if (isAuthenticated) {
          router.push('/dashboard');
        } else {
          router.push('/signup');
        }
        break;
      
      case 'scale':
        const billingCycle = isYearly ? 'yearly' : 'monthly';
        const price = isYearly ? '$299/year' : '$299/month';
        
        savePaymentIntent({
          planType: 'premium_monthly',
          billingCycle,
          planName: 'Scale',
          price
        });
        
        if (!isAuthenticated) {
          router.push('/login');
        } else {
          window.dispatchEvent(new CustomEvent('showPaymentConfirm'));
        }
        break;
      
      case 'enterprise':
        router.push('/contact');
        break;
        
      default:
        console.warn('Unknown plan type:', planType);
    }
  };

  return (
    <section className="py-32 px-8 max-w-7xl mx-auto">
      <div className="text-center mb-24">
        <h2 className="text-4xl font-black tracking-tight mb-4">Scalable Precision.</h2>
        <p className="text-on-surface-variant">Pick a plan that matches your ambition.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Plan 1 - Start */}
        <div className="bg-[#131318] p-10 rounded-[32px] border border-outline-variant/10 flex flex-col hover:border-primary/30 transition-all">
          <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-4">Start</p>
          <div className="mb-8">
            <span className="text-4xl font-black text-white">$99</span>
            <span className="text-on-surface-variant">/mo</span>
          </div>
          <ul className="space-y-4 mb-10 flex-grow">
            <li className="flex items-center gap-3 text-sm text-on-surface-variant/70">
              <Check className="w-5 h-5 text-primary" />
              500 Keywords
            </li>
            <li className="flex items-center gap-3 text-sm text-on-surface-variant/70">
              <Check className="w-5 h-5 text-primary" />
              Daily Tracking
            </li>
            <li className="flex items-center gap-3 text-sm text-on-surface-variant/70">
              <Check className="w-5 h-5 text-primary" />
              3 Domains
            </li>
            <li className="flex items-center gap-3 text-sm text-on-surface-variant/40">
              <X className="w-5 h-5" />
              API Access
            </li>
          </ul>
          <button 
            onClick={() => handleCtaClick('start')}
            className="w-full py-4 rounded-xl font-bold border border-white/20 text-white hover:bg-white hover:text-black transition-all"
          >
            Start Free Trial
          </button>
        </div>

        {/* Plan 2 - Scale (Pro) */}
        <div className="bg-gradient-to-br from-[#1a1a20] to-[#131318] p-10 rounded-[32px] border-2 border-primary neon-border relative flex flex-col transform scale-105 z-10">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-4 py-1 rounded-full text-[10px] uppercase font-black tracking-widest">
            Most Popular
          </div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-primary mb-4">Scale</p>
          <div className="mb-8">
            <span className="text-4xl font-black text-white">$299</span>
            <span className="text-on-surface-variant">/mo</span>
          </div>
          <ul className="space-y-4 mb-10 flex-grow">
            <li className="flex items-center gap-3 text-sm text-on-surface-variant/70">
              <Check className="w-5 h-5 text-primary" />
              5,000 Keywords
            </li>
            <li className="flex items-center gap-3 text-sm text-on-surface-variant/70">
              <Check className="w-5 h-5 text-primary" />
              Hourly Tracking
            </li>
            <li className="flex items-center gap-3 text-sm text-on-surface-variant/70">
              <Check className="w-5 h-5 text-primary" />
              Unlimited Domains
            </li>
            <li className="flex items-center gap-3 text-sm text-on-surface-variant/70">
              <Check className="w-5 h-5 text-primary" />
              Full API Access
            </li>
            <li className="flex items-center gap-3 text-sm text-on-surface-variant/70">
              <Check className="w-5 h-5 text-primary" />
              AI Suggestions
            </li>
          </ul>
          <button 
            onClick={() => handleCtaClick('scale')}
            className="w-full py-4 rounded-xl font-bold bg-primary text-on-primary hover:brightness-110 transition-all shadow-xl"
          >
            Get Velocity Pro
          </button>
        </div>

        {/* Plan 3 - Enterprise */}
        <div className="bg-[#131318] p-10 rounded-[32px] border border-outline-variant/10 flex flex-col hover:border-secondary/30 transition-all">
          <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-4">Enterprise</p>
          <div className="mb-8">
            <span className="text-4xl font-black text-white">Custom</span>
          </div>
          <ul className="space-y-4 mb-10 flex-grow">
            <li className="flex items-center gap-3 text-sm text-on-surface-variant/70">
              <Check className="w-5 h-5 text-secondary" />
              Custom Keyword Limit
            </li>
            <li className="flex items-center gap-3 text-sm text-on-surface-variant/70">
              <Check className="w-5 h-5 text-secondary" />
              Real-time Sync
            </li>
            <li className="flex items-center gap-3 text-sm text-on-surface-variant/70">
              <Check className="w-5 h-5 text-secondary" />
              Dedicated Success Mgr
            </li>
            <li className="flex items-center gap-3 text-sm text-on-surface-variant/70">
              <Check className="w-5 h-5 text-secondary" />
              SSO & SAML
            </li>
          </ul>
          <button 
            onClick={() => handleCtaClick('enterprise')}
            className="w-full py-4 rounded-xl font-bold border border-white/20 text-white hover:bg-white hover:text-black transition-all"
          >
            Talk to Sales
          </button>
        </div>
      </div>
    </section>
  );
}
