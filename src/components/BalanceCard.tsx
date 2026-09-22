import React, { useState } from 'react';
import { Eye, EyeOff, ArrowUpRight, ArrowDownLeft, Wallet } from 'lucide-react';
import { formatNaira } from '../data/storage';

interface BalanceCardProps {
  balance: number;
  onFundWallet: () => void;
  onWithdraw: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  onFundWallet,
  onWithdraw,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div className="w-full max-w-xl mx-auto px-4 sm:px-6 -mt-2 relative z-20">
      {/* Main Emerald Card Container */}
      <div className="relative rounded-[26px] bg-gradient-to-br from-[#04442b] via-[#054b30] to-[#022e1d] dark:from-[#032f1e] dark:via-[#043823] dark:to-[#021f14] p-5 sm:p-6 text-white shadow-xl shadow-emerald-950/40 dark:shadow-black/70 border border-emerald-500/20 dark:border-emerald-500/30 overflow-hidden">
        
        {/* Golden Waves / Ribbon Artwork on right side - exact to the screenshot */}
        <svg
          className="absolute right-0 top-0 bottom-0 h-full w-2/3 pointer-events-none opacity-85"
          viewBox="0 0 400 300"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M120,300 C200,240 280,180 400,20 L400,300 Z"
            fill="url(#goldCurveGrad1)"
            opacity="0.35"
          />
          <path
            d="M180,300 C240,230 300,140 400,0 L400,120 C340,200 250,270 180,300 Z"
            fill="url(#goldCurveGrad2)"
          />
          <path
            d="M240,300 C300,240 350,160 400,50 L400,75 C360,170 310,250 240,300 Z"
            fill="url(#goldCurveGrad3)"
            opacity="0.9"
          />
          <defs>
            <linearGradient id="goldCurveGrad1" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="60%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#fef3c7" />
            </linearGradient>
            <linearGradient id="goldCurveGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#b45309" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#fde047" />
            </linearGradient>
            <linearGradient id="goldCurveGrad3" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#fffbeb" />
            </linearGradient>
          </defs>
        </svg>

        {/* Content of the Card */}
        <div className="relative z-10">
          {/* Top Label Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {/* Rounded Amber Wallet Icon */}
              <div className="w-8 h-8 rounded-xl bg-[#e6b338] text-slate-900 flex items-center justify-center shadow-md shadow-black/20">
                <Wallet className="w-4 h-4 fill-slate-900 text-slate-900" />
              </div>
              <span className="text-sm sm:text-base font-semibold text-emerald-50">
                Total Balance
              </span>
            </div>

            {/* Eye toggle button */}
            <button
              type="button"
              id="toggle-balance-visibility-btn"
              onClick={() => setIsVisible(!isVisible)}
              className="p-1.5 rounded-full text-emerald-200/90 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title={isVisible ? 'Hide balance' : 'Show balance'}
              aria-label={isVisible ? 'Hide balance' : 'Show balance'}
            >
              {isVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>

          {/* Large Naira Balance */}
          <div className="mb-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-baseline">
              {isVisible ? formatNaira(balance) : '₦••••••'}
            </h1>
          </div>

          {/* Subtext */}
          <p className="text-xs text-emerald-200/80 font-medium mb-6">
            Wallet Balance
          </p>

          {/* White Pill Action Bar docked inside the card */}
          <div className="bg-white dark:bg-[#02180f] rounded-full p-2 sm:p-2.5 flex items-center justify-between shadow-lg shadow-black/25 dark:shadow-black/60 border border-transparent dark:border-emerald-800/40">
            {/* Fund Wallet Button */}
            <button
              type="button"
              id="fund-wallet-btn"
              onClick={onFundWallet}
              className="flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-full hover:bg-slate-50 dark:hover:bg-[#042417] transition cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-[#064e32] dark:bg-[#086341] text-white flex items-center justify-center group-hover:scale-105 transition shadow-sm">
                <ArrowUpRight className="w-4 h-4 text-emerald-100" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-emerald-100">
                Fund Wallet
              </span>
            </button>

            {/* Vertical Divider */}
            <div className="h-6 w-px bg-slate-200 dark:bg-emerald-900/60" />

            {/* Withdraw Button */}
            <button
              type="button"
              id="withdraw-btn"
              onClick={onWithdraw}
              className="flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-full hover:bg-slate-50 dark:hover:bg-[#042417] transition cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-[#e6b338] text-slate-900 flex items-center justify-center group-hover:scale-105 transition shadow-sm">
                <ArrowDownLeft className="w-4 h-4 text-slate-900" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-emerald-100 truncate">
                Withdraw
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
