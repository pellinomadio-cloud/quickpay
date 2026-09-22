import React, { useState } from 'react';
import { Transaction } from '../types';
import { formatNaira } from '../data/storage';
import { ChevronRight, ArrowDownLeft, ArrowUpRight, Smartphone, Globe, Gift, CheckCircle2, Clock, AlertCircle, KeyRound } from 'lucide-react';

interface RecentTransactionsProps {
  transactions: Transaction[];
  onViewAll: () => void;
  onSelectTransaction: (tx: Transaction) => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  onViewAll,
  onSelectTransaction,
}) => {
  const [filter, setFilter] = useState<'all' | 'inflow' | 'outflow'>('all');

  const filtered = transactions.filter((t) => {
    const isQc = t.type === 'quick_code' || t.title?.toLowerCase().includes('quick code') || t.id?.includes('_qc_') || t.hideMinus;
    if (filter === 'inflow') return t.isCredit || isQc;
    if (filter === 'outflow') return !t.isCredit && !isQc;
    return true;
  });

  const getIcon = (type: Transaction['type'], isCredit: boolean, isQc: boolean) => {
    if (type === 'quick_code' || isQc) {
      return (
        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 border border-transparent dark:border-amber-800/40">
          <KeyRound className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
      );
    }
    if (type === 'data') {
      return (
        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 border border-transparent dark:border-emerald-800/40">
          <Globe className="w-5 h-5" />
        </div>
      );
    }
    if (type === 'airtime') {
      return (
        <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 border border-transparent dark:border-teal-800/40">
          <Smartphone className="w-5 h-5" />
        </div>
      );
    }
    if (type === 'promo' || type === 'cashback') {
      return (
        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 border border-transparent dark:border-amber-800/40">
          <Gift className="w-5 h-5" />
        </div>
      );
    }
    if (isCredit) {
      return (
        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0 border border-transparent dark:border-emerald-800/40">
          <ArrowDownLeft className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 border border-transparent dark:border-slate-700/50">
        <ArrowUpRight className="w-5 h-5" />
      </div>
    );
  };

  return (
    <section className="w-full max-w-xl mx-auto px-4 sm:px-6 pt-2 pb-24">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          Recent Transactions
        </h3>
        <button
          type="button"
          id="transactions-view-all-btn"
          onClick={onViewAll}
          className="text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-0.5 cursor-pointer"
        >
          <span>View All</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-3">
        {(['all', 'inflow', 'outflow'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition ${
              filter === tab
                ? 'bg-[#064e32] dark:bg-emerald-500 text-white dark:text-slate-950 font-bold shadow-xs'
                : 'bg-white dark:bg-[#062417] text-slate-600 dark:text-emerald-200/80 border border-slate-200 dark:border-emerald-800/40 hover:bg-slate-50 dark:hover:bg-[#0a3522]'
            }`}
          >
            {tab === 'inflow' ? 'Inflow (+)' : tab === 'outflow' ? 'Outflow (-)' : 'All'}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-[#062417] rounded-2xl border border-slate-100 dark:border-emerald-800/30 shadow-xs">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No transactions found</p>
            <p className="text-xs text-slate-400 dark:text-emerald-300/50 mt-1">
              Top up your wallet or purchase data to get started.
            </p>
          </div>
        ) : (
          filtered.slice(0, 6).map((tx) => {
            const isQc = tx.type === 'quick_code' || tx.title?.toLowerCase().includes('quick code') || tx.id?.includes('_qc_') || tx.hideMinus;
            return (
              <button
                key={tx.id}
                type="button"
                onClick={() => onSelectTransaction(tx)}
                className="w-full text-left bg-white dark:bg-[#062417] p-3.5 rounded-2xl border border-slate-100/80 dark:border-emerald-800/30 hover:border-emerald-200 dark:hover:border-emerald-500/50 hover:shadow-sm transition flex items-center justify-between gap-3 group cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {getIcon(tx.type, tx.isCredit, Boolean(isQc))}
                  <div className="min-w-0">
                    <h5 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition">
                      {tx.title}
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-emerald-200/60 truncate">
                      {tx.subtitle} • {tx.date}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p
                    className={`text-sm font-extrabold ${
                      tx.isCredit || isQc ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {isQc ? '' : tx.isCredit ? '+' : '-'}
                    {formatNaira(tx.amount)}
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-transparent dark:border-emerald-700/40 px-1.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>Successful</span>
                    </span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
};
