"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PublicGuard } from "@/components/guards/AuthGuard";
import { Zap, ShieldCheck, Lock, RotateCcw, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";

// Left Panel Hero Component
function ResetPasswordHero() {
  return (
    <section className="hidden md:flex flex-1 flex-col justify-between p-10 overflow-hidden relative">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(175,198,255,0.1)_0%,transparent_50%),radial-gradient(circle_at_100%_100%,rgba(29,116,245,0.1)_0%,transparent_50%)]"></div>
      
      {/* Decorative Glow */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[120px]"></div>
      
      {/* Brand Logo */}
      <div className="z-10">
        <img 
          src="/oditologo.png" 
          alt="Odito AI" 
          className="h-12 w-auto object-contain hover:scale-105 hover:opacity-90 transition-all duration-300"
        />
      </div>
      
      {/* Main Content */}
      <div className="z-10 max-w-lg mt-10">
        <h1 className="text-4xl font-extrabold tracking-[-0.04em] leading-[1.1] mb-5 bg-gradient-to-br from-primary via-secondary to-onprimary bg-clip-text text-transparent">
          Secure Your Account with Intelligent Verification
        </h1>
        <p className="text-base text-on-surface-variant leading-relaxed mb-10">
          We use smart verification to ensure your account stays protected and trusted. Re-access your workspace with advanced protocols.
        </p>
        
        {/* Feature Cards */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-surface-container-high/40 backdrop-blur-sm border border-outline-variant/10 flex gap-4 items-start">
            <div className="bg-primary/10 p-2.5 rounded-lg">
              <Zap className="text-primary" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1 text-sm">Fast Verification</h3>
              <p className="text-xs text-on-surface-variant">Instant 6-digit code delivery to your registered device.</p>
            </div>
          </div>
          
          <div className="p-5 rounded-2xl bg-surface-container-high/40 backdrop-blur-sm border border-outline-variant/10 flex gap-4 items-start">
            <div className="bg-secondary/10 p-2.5 rounded-lg">
              <ShieldCheck className="text-secondary" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1 text-sm">Secure Access</h3>
              <p className="text-xs text-on-surface-variant">Advanced protection for your account with multi-layered encryption.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="z-10">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            <img 
              className="h-7 w-7 rounded-full border-2 border-background object-cover" 
              alt="portrait of a professional woman with a confident smile in corporate setting" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcVd65FkJlclqTfT6yNv8leG4blEvWcPH5aAgnWxXy7zvaxujgMHj0_-5pexqROobxmV7V4LZvkPTifVhl8sZsp_OE8HM1OhjV2hqhJp4PPEAmoNMfscLlQdUvh0_nRgjuZl9iYRItlbSmZKCTC2o-_Y6GL4BsXNxLmWXYQ13XiewNuagepWzcsKJ6K1OFdB4BhwGnwovu2AmzUbNXND5_Ank6HsBKm23HyohxCaRBdOoMgTvxaV_FBZl7ljf1ETiy0DSkV-tnSxs"
            />
            <img 
              className="h-7 w-7 rounded-full border-2 border-background object-cover" 
              alt="professional male headshot with natural lighting and soft blurred background" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqPTwqxtrgLKXYi_JgSMir6LPFWb97v7LfpqIgcGKfa9PMKIfO5qS4UjirskWjZ1_37PXR2o5CWJHtHKXfor_jXNeArjV6wMVkmzrA3Zr45k9cm2GvlG1Bp3KhFFfXl9IlR5jEwxSO5FccBQtelwJux-bUMFY5VQ7wiDXMrFaHL7pHAXH8scmrQavk4dqd8m7j6T95F-yjoNdeYlbYptQ_DiJxpqg2JYZlVdRGa9OY4dP14lOHPK9kqunl3l74Vt4Bc5MJH-HsypQ"
            />
            <img 
              className="h-7 w-7 rounded-full border-2 border-background object-cover" 
              alt="smiling software engineer in a modern office environment with soft focus" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGhb4w2cO0_ZnRNNoGs_-xUYIVfcRbXOm3LYOzFWrhjphlw0zUrYvoJ8gD_XK1scGnzpAomK-eYw08CXbefk4ZFfw_XkxFmDSlAqWmeiatOCTkubBHh0Yj_rgFemVipP7FTXDoSh5-xLzxOYoxMTWY-oYIy6WVfy9TmlQ6kSStXWcTeWRYyYG5uZfLoYIEnKy7B8JS8OuI65B7cgLFBSx6uLm13AjKwAO2V4Sr30j8DhcMZuaP_pzZ8NPiIE4-qf9cV3lSj5e-VYo"
            />
          </div>
          <span className="text-xs text-on-surface-variant/80 font-medium tracking-tight">Trusted by 10k+ security professionals</span>
        </div>
      </div>
    </section>
  );
}

// Right Panel Form Component
function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const validatePassword = (pwd) => {
    return pwd.length >= 8;
  };

  const hasSymbol = (pwd) => {
    const symbolRegex = /[!@#$%^&*(),.?":{}|<>]/;
    return symbolRegex.test(pwd);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    
    if (!password) {
      setError("Please enter a new password");
      return;
    }
    
    if (!validatePassword(password)) {
      setError("Password must be at least 8 characters");
      return;
    }
    
    if (!hasSymbol(password)) {
      setError("Password must contain at least one symbol");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords must match");
      return;
    }
    
    setIsLoading(true);
    console.log("Reset Password:", { password, token });
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      console.log("Password reset successful");
    }, 1000);
  };

  const isFormValid = password && confirmPassword && 
                     validatePassword(password) && 
                     hasSymbol(password) && 
                     password === confirmPassword;

  return (
    <section className="flex flex-1 items-center justify-center p-6 sm:p-8 lg:p-10 bg-black">
      {/* Mobile Logo (Visible only on mobile) */}
      <div className="absolute top-8 left-8 md:hidden">
        <img 
          src="/oditologo.png" 
          alt="Odito AI" 
          className="h-10 w-auto object-contain hover:scale-105 hover:opacity-90 transition-all duration-300"
        />
      </div>
      
      <div className="w-full max-w-[420px]">
        {/* Glass Card */}
        <div className="p-7 sm:p-9 rounded-[1.75rem] shadow-2xl relative overflow-hidden bg-[#30353f]/60 backdrop-blur-20 border border-[#45474b]/20">
          {/* Background Glow inside Card */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-secondary/10 rounded-full blur-[50px]"></div>
          
          <div className="relative z-10">
            <div className="mb-8 text-center md:text-left">
              <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Reset Password</h2>
              <p className="text-on-surface-variant text-sm">Enter your new password below</p>
            </div>
            
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-[0.6875rem] font-bold uppercase tracking-widest text-on-surface-variant px-1" htmlFor="password">
                  New Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="text-outline text-lg transition-colors group-focus-within:text-primary" size={20} />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="block w-full pl-11 pr-4 py-3.5 bg-surface-container-low border-none rounded-xl text-white placeholder-outline focus:ring-2 focus:ring-primary/20 focus:bg-surface-container transition-all duration-300 outline-none text-sm"
                    required
                  />
                </div>
              </div>
              
              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label className="block text-[0.6875rem] font-bold uppercase tracking-widest text-on-surface-variant px-1" htmlFor="confirm_password">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <RotateCcw className="text-outline text-lg transition-colors group-focus-within:text-primary" size={20} />
                  </div>
                  <input
                    id="confirm_password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="block w-full pl-11 pr-4 py-3.5 bg-surface-container-low border-none rounded-xl text-white placeholder-outline focus:ring-2 focus:ring-primary/20 focus:bg-surface-container transition-all duration-300 outline-none text-sm"
                    required
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-danger text-[0.6875rem] mt-1 px-1">Passwords must match</p>
                )}
              </div>
              
              {/* Password Requirements (Visual Feedback) */}
              <div className="flex flex-wrap gap-2 pt-2">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container text-[0.625rem] border border-outline-variant/10 ${validatePassword(password) ? 'text-emerald-400' : 'text-on-surface-variant'}`}>
                  <CheckCircle size={12} className={validatePassword(password) ? 'fill-current' : ''} />
                  Min 8 characters
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container text-[0.625rem] border border-outline-variant/10 ${hasSymbol(password) ? 'text-emerald-400' : 'text-on-surface-variant'}`}>
                  <CheckCircle size={12} className={hasSymbol(password) ? 'fill-current' : ''} />
                  One symbol
                </div>
              </div>
              
              {/* Reset Button */}
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="w-full relative group overflow-hidden bg-gradient-to-r from-primary to-secondary text-onprimary font-bold py-3.5 rounded-full transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(175,198,255,0.6)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none mt-4 text-sm"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? "Resetting..." : "Reset Password"}
                  {!isLoading && <ArrowRight size={20} />}
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
            </form>
            
            {/* Back to Login */}
            <div className="mt-8 text-center">
              <Link
                className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-2 group"
                href="/login"
              >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
        
        {/* System Status Footer */}
        <div className="mt-8 flex justify-center items-center gap-6 text-[0.6875rem] text-on-surface-variant/40">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
            System Status: Optimal
          </div>
          <div className="h-1 w-1 rounded-full bg-outline-variant"></div>
          <span>© 2024 Odito AI</span>
        </div>
      </div>
    </section>
  );
}

// Main Page Component
function ResetPasswordContent() {
  return (
    <main className="flex min-h-screen w-full bg-black text-on-surface antialiased">
      <ResetPasswordHero />
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <PublicGuard>
      <ResetPasswordContent />
    </PublicGuard>
  );
}
