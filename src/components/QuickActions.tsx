import React from 'react';
import { MessageSquare, Coins, KeyRound, Gift, ChevronRight } from 'lucide-react';
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
    <section className="w-full max-w-xl mx-auto px-4 sm:px-6 pt-5 pb-2">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
          Quick Actions
        </h3>
        <button
          type="button"
          id="quick-actions-view-all-btn"
          onClick={onViewAll}
          className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 cursor-pointer"
        >
          <span>View all</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4 Action Cards Grid */}
      <div className="grid grid-cols-4 gap-2.5">
        {/* 1. Message Service */}
        <button
          type="button"
          id="action-message-service-btn"
          onClick={() => onSelectAction('message')}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition cursor-pointer text-center shadow-xs"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
            <MessageSquare className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-700 leading-tight">
            Support
          </span>
        </button>

        {/* 2. Earn */}
        <button
          type="button"
          id="action-earn-btn"
          onClick={() => onSelectAction('earn')}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition cursor-pointer text-center shadow-xs"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
            <Coins className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-700 leading-tight">
            Rewards
          </span>
        </button>

        {/* 3. Quick Code */}
        <button
          type="button"
          id="action-quick-code-btn"
          onClick={() => onSelectAction('quick-code')}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition cursor-pointer text-center shadow-xs"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
            <KeyRound className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-700 leading-tight">
            Quick Code
          </span>
        </button>

        {/* 4. Promo */}
        <button
          type="button"
          id="action-promo-btn"
          onClick={() => onSelectAction('promo')}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition cursor-pointer text-center shadow-xs"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
            <Gift className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-700 leading-tight">
            Promos
          </span>
        </button>
      </div>
    </section>
  );
};
