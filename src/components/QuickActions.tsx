import React from 'react';
import { MessageSquare, Coins, KeyRound, Gift, ChevronRight, Sparkles } from 'lucide-react';
import { ActivePage } from '../types';

interface QuickActionsProps {
  onSelectAction: (action: ActivePage) => void;
  onViewAll: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onSelectAction,
  onViewAll,
}) => {
  return (
    <section className="w-full max-w-xl mx-auto px-4 sm:px-6 pt-6 pb-2">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          Quick Actions
        </h3>
        <button
          type="button"
          id="quick-actions-view-all-btn"
          onClick={onViewAll}
          className="text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-0.5 cursor-pointer"
        >
          <span>View All</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 4 Action Cards Grid */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
        {/* 1. Message Service */}
        <button
          type="button"
          id="action-message-service-btn"
          onClick={() => onSelectAction('message')}
          className="group relative flex flex-col items-center justify-between py-4 px-1 rounded-2xl bg-[#edf9f2] dark:bg-[#062417] hover:bg-[#e2f5ea] dark:hover:bg-[#093522] border border-[#d2f0df] dark:border-emerald-800/40 transition shadow-xs hover:shadow-md cursor-pointer text-center"
        >
          <div className="relative mb-2.5">
            <div className="w-12 h-12 rounded-full bg-[#c8f0da] dark:bg-[#0d442c] flex items-center justify-center group-hover:scale-110 transition duration-150">
              <MessageSquare className="w-6 h-6 text-[#085b3b] dark:text-emerald-300 fill-[#085b3b]/10 dark:fill-emerald-300/10" />
            </div>
            {/* Red notification dot */}
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full ring-2 ring-white dark:ring-[#062417]" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-emerald-100 leading-tight">
            Message<br />Service
          </span>
        </button>

        {/* 2. Earn Button (Dark Gold & Radiant Bright Styling) */}
        <button
          type="button"
          id="action-earn-btn"
          onClick={() => onSelectAction('earn')}
          className="group relative flex flex-col items-center justify-between py-4 px-1 rounded-2xl bg-gradient-to-b from-[#7a4f07] via-[#94620d] to-[#543502] hover:from-[#8f5e0a] hover:to-[#633e03] border-2 border-[#ffd778] transition shadow-md shadow-amber-950/25 hover:shadow-lg hover:shadow-amber-900/40 ring-1 ring-[#ffe999]/60 cursor-pointer text-center overflow-hidden"
        >
          {/* Subtle bright shimmer glow in background */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#ffd778]/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* Bright pill badge on top */}
          <span className="absolute -top-0.5 right-1 px-1.5 py-0.5 bg-gradient-to-r from-[#ffe58a] via-[#fff4cc] to-[#ffc83b] text-slate-950 text-[8px] font-black rounded-full shadow-xs uppercase tracking-wider border border-[#ffd778]">
            FREE
          </span>

          <div className="relative mb-2.5">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#ffe28a] via-[#fff5d4] to-[#fcc947] flex items-center justify-center group-hover:scale-110 transition duration-150 shadow-sm border border-[#fff2b8]">
              <Coins className="w-6 h-6 text-[#704603]" />
            </div>
          </div>
          <span className="text-xs font-black text-[#fff5d4] drop-shadow-sm leading-tight tracking-wide">
            Earn
          </span>
        </button>

        {/* 3. Quick Code Button (Mandatory for Withdrawals) */}
        <button
          type="button"
          id="action-quick-code-btn"
          onClick={() => onSelectAction('quick-code')}
          className="group relative flex flex-col items-center justify-between py-4 px-1 rounded-2xl bg-[#edf9f2] dark:bg-[#062417] hover:bg-[#e2f5ea] dark:hover:bg-[#093522] border border-[#d2f0df] dark:border-emerald-800/40 transition shadow-xs hover:shadow-md cursor-pointer text-center"
        >
          <div className="relative mb-2.5">
            <div className="w-12 h-12 rounded-full bg-[#c8f0da] dark:bg-[#0d442c] flex items-center justify-center group-hover:scale-110 transition duration-150">
              <KeyRound className="w-6 h-6 text-[#085b3b] dark:text-emerald-300" />
            </div>
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-emerald-100 leading-tight">
            Quick<br />Code
          </span>
        </button>

        {/* 4. Promo (HOT) */}
        <button
          type="button"
          id="action-promo-btn"
          onClick={() => onSelectAction('promo')}
          className="group relative flex flex-col items-center justify-between py-4 px-1 rounded-2xl bg-[#fff9ea] dark:bg-[#1f1704] hover:bg-[#fff3d4] dark:hover:bg-[#2d2208] border border-[#fde8aa] dark:border-amber-700/40 transition shadow-xs hover:shadow-md cursor-pointer text-center"
        >
          <div className="relative mb-2.5">
            <div className="w-12 h-12 rounded-full bg-[#fde59b] dark:bg-[#3d2b07] flex items-center justify-center group-hover:scale-110 transition duration-150">
              <Gift className="w-6 h-6 text-[#b45309] dark:text-amber-300" />
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-bold text-slate-800 dark:text-amber-100 leading-tight">
              Promo
            </span>
            {/* Red HOT badge */}
            <span className="inline-block px-2 py-0.5 bg-red-600 text-[10px] font-black tracking-wider text-white rounded-full uppercase shadow-xs">
              HOT
            </span>
          </div>
        </button>
      </div>
    </section>
  );
};
