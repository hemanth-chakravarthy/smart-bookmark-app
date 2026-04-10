'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { 
  ShieldCheck, 
  ChevronRight,
  Bookmark,
  Library
} from 'lucide-react';

export default function LoginPage() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error logging in with Google:', error);
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#EDEDED] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows - Amber & Orange */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-amber-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-800/5 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Container */}
      <div className="w-full max-w-[400px] relative z-10 transition-all duration-700 animate-in fade-in slide-in-from-bottom-8">
        {/* Brand/Logo - Refined Gold Style */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="relative group transition-transform duration-500 hover:scale-110">
            <div className="absolute inset-0 rounded-[28px] bg-white/20 blur-xl opacity-0 group-hover:opacity-40 transition-opacity" />
          </div>
          
          <h1 className="text-4xl font-black tracking-tighter text-white mb-2 leading-tight">
            Smart Bookmark
          </h1>
          <div className="flex items-center gap-2 mb-4">
             <div className="h-px w-8 bg-amber-600/30" />
             <p className="text-amber-500/80 text-[10px] font-black uppercase tracking-[0.3em]">
               Professional Digital Archive
             </p>
             <div className="h-px w-8 bg-amber-600/30" />
          </div>
        </div>

        {/* Login Card - Obsidian Glass */}
        <div className="bg-[#0D0D0D]/80 backdrop-blur-3xl border border-white/5 rounded-[40px] p-8 md:p-10 shadow-3xl shadow-black/80 relative overflow-hidden group ring-1 ring-white/[0.05]">
          {/* Accent Line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
          
          <div className="mb-10 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-white mb-1.5">Welcome</h2>
            <p className="text-neutral-500 text-sm font-medium leading-relaxed tracking-tight">Access your library with professional-grade security.</p>
          </div>

          <div className="space-y-4">
            {/* Google Login - High Fidelity Monochrome */}
            <button 
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="w-full relative flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-neutral-100 text-black font-black text-sm rounded-2xl transition-all duration-300 shadow-xl shadow-amber-900/5 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
            >
              <img 
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                alt="" 
                className="w-5 h-5"
              />
              <span>{isLoggingIn ? 'Authenticating...' : 'Sign in with Google'}</span>
              <div className="absolute inset-0 rounded-2xl ring-2 ring-transparent group-hover/btn:ring-amber-500/30 transition-all" />
            </button>
            
            <div className="flex items-center gap-4 py-4">
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-700">Security Core</span>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#141414] border border-white/5 rounded-2xl p-4 flex flex-col gap-2 transition-colors hover:bg-[#1A1A1A]">
                <ShieldCheck className="w-5 h-5 text-amber-500 opacity-80" />
                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest leading-none">Safe Auth</span>
              </div>
              <div className="bg-[#141414] border border-white/5 rounded-2xl p-4 flex flex-col gap-2 transition-colors hover:bg-[#1A1A1A]">
                <Library className="w-5 h-5 text-amber-500 opacity-80" />
                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest leading-none">Smart Vault</span>
              </div>
            </div>
          </div>
          
          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] text-neutral-600 font-medium leading-relaxed">
              Protected by enterprise-level encryption. <br />
              <span className="text-neutral-400 hover:text-amber-500 cursor-pointer transition-colors">Privacy Policy</span> • <span className="text-neutral-400 hover:text-amber-500 cursor-pointer transition-colors">Security Manual</span>
            </p>
          </div>
        </div>

        {/* Footer Link */}
        <div className="mt-8 text-center animate-pulse">
          <button className="text-xs font-bold text-neutral-700 hover:text-amber-600 transition-all flex items-center justify-center gap-2 mx-auto tracking-widest uppercase">
            Protocol 2.5.Active
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
