"use client";

import Link from 'next/link';

export default function CTA() {
  return (
    <section className="py-40">
      <div className="max-w-5xl mx-auto px-8 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 blur-[120px] -z-10"></div>
        
        <h2 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none mb-8">
          Stop Guessing. <br/>Start Fixing Your <span className="text-gradient">SEO Today.</span>
        </h2>
        
        <p className="text-on-surface-variant text-xl max-w-2xl mx-auto mb-12 font-light">
          Join thousands of high-performance teams scaling their organic traffic with Odito.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link 
            href="/signup"
            className="bg-on-surface text-surface px-10 py-5 rounded-2xl font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-2xl"
          >
            Start 14-Day Trial
          </Link>
          <Link 
            href="/contact"
            className="glass-panel px-10 py-5 rounded-2xl font-black text-lg hover:bg-surface-container-highest transition-all"
          >
            Request Demo
          </Link>
        </div>
        
        <p className="mt-8 text-xs text-on-surface-variant uppercase tracking-widest opacity-60">
          No credit card required • Cancel anytime
        </p>
      </div>
    </section>
  );
}
