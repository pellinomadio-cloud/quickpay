import React, { useState, useEffect } from 'react';
import { User, QuickCode } from '../types';
import { getQuickCodes, getUserQuickCodeRequests } from '../data/storage';
import { KeyRound, Copy, Check, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

interface DashboardQuickCodeCardProps {
  user: User;
  onUseCode: (code: string) => void;
}

export const DashboardQuickCodeCard: React.FC<DashboardQuickCodeCardProps> = ({
  user,
  onUseCode,
}) => {
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const refreshActiveCode = () => {
    // Check unused quick codes
    const codes = getQuickCodes(user.id);
    const unused = codes.find((c) => c.status === 'unused');
    if (unused) {
      setActiveCode(unused.code);
      return;
    }

    // Fallback: check approved requests with generated code
    const requests = getUserQuickCodeRequests(user.id);
    const approved = requests.find((r) => r.status === 'approved' && r.generatedCode);
    if (approved && approved.generatedCode) {
      // Check if it's already marked used
      const existingInCodes = codes.find((c) => c.code === approved.generatedCode);
      if (!existingInCodes || existingInCodes.status === 'unused') {
        setActiveCode(approved.generatedCode);
        return;
      }
    }

    setActiveCode(null);
  };

  useEffect(() => {
    refreshActiveCode();

    const handleSync = () => {
      refreshActiveCode();
    };

    window.addEventListener('quickpay_quickcode_updated', handleSync);
    return () => {
      window.removeEventListener('quickpay_quickcode_updated', handleSync);
    };
  }, [user.id]);

  if (!activeCode) {
    return null;
  }

  const handleCopy = () => {
    if (!activeCode) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(activeCode);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = activeCode;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Failed to copy quick code:', e);
    }
  };

  return (
    <div
      id="dashboard-approved-quick-code-card"
      className="w-full max-w-xl mx-auto px-4 sm:px-6 pt-3"
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#063a23] via-[#094c2f] to-[#042817] dark:from-[#021f14] dark:via-[#053621] dark:to-[#01140c] text-white p-4 sm:p-5 border-2 border-[#e5b74b]/50 shadow-xl shadow-emerald-950/20 dark:shadow-black/60 animate-in fade-in slide-in-from-top-2 duration-300">
        
        {/* Glow / shimmer background accents */}
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-[#e5b74b]/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Badges */}
        <div className="relative z-10 flex items-center justify-between gap-2 mb-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e5b74b] text-slate-950 text-[10px] font-black tracking-wide uppercase shadow-sm">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Active Quick Code Ready</span>
          </div>

          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Approved by Admin</span>
          </div>
        </div>

        {/* Info header */}
        <div className="relative z-10 mb-3">
          <h3 className="text-base font-extrabold text-white flex items-center gap-1.5">
            <span>Your Withdrawal Passcode</span>
            <Sparkles className="w-4 h-4 text-[#ffd56b]" />
          </h3>
          <p className="text-[11px] text-emerald-100/80 mt-0.5">
            Copy this authorized code and use it to complete your withdrawal transaction instantly.
          </p>
        </div>

        {/* Code Showcase & Copy Section */}
        <div className="relative z-10 bg-slate-950/60 dark:bg-black/70 border border-[#e5b74b]/40 rounded-2xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e5b74b]/20 border border-[#e5b74b]/40 text-[#ffd56b] flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-300/80 block">
                One-Time Quick Code
              </span>
              <span className="font-mono text-lg sm:text-xl font-black text-[#ffd56b] tracking-wider select-all">
                {activeCode}
              </span>
            </div>
          </div>

          {/* Copy Button */}
          <button
            type="button"
            id="dashboard-copy-quick-code-btn"
            onClick={handleCopy}
            className={`px-4 py-2.5 rounded-xl font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-md ${
              copied
                ? 'bg-emerald-500 text-slate-950 scale-95'
                : 'bg-[#e5b74b] hover:bg-[#f0c359] text-slate-950 active:scale-95'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Action to Withdraw */}
        <div className="relative z-10 mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2">
          <span className="text-[10px] text-emerald-200/70 font-medium">
            Valid for 1 single withdrawal request
          </span>
          <button
            type="button"
            id="dashboard-use-quick-code-withdraw-btn"
            onClick={() => onUseCode(activeCode)}
            className="inline-flex items-center gap-1 text-xs font-black text-[#ffd56b] hover:text-white transition cursor-pointer"
          >
            <span>Proceed to Withdraw</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
