import React, { useState } from 'react';
import { Transaction } from '../types';
import { formatNaira } from '../data/storage';
import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Filter,
  Receipt,
  Building2,
  Smartphone,
  Globe,
  Gift,
  ChevronRight,
  KeyRound,
} from 'lucide-react';
import logoImg from '../assets/images/quickpay_gold_logo_1789754815185.jpg';

interface TransactionHistoryPageProps {
  transactions: Transaction[];
  onBack: () => void;
  onSelectTransaction: (tx: Transaction) => void;
}

export const TransactionHistoryPage: React.FC<TransactionHistoryPageProps> = ({
  transactions,
  onBack,
  onSelectTransaction,
}) => {
  const [filter, setFilter] = useState<'all' | 'credits' | 'debits'>('all');
  const [search, setSearch] = useState('');

  const filtered = transactions.filter((t) => {
    const isQc = t.type === 'quick_code' || t.title?.toLowerCase().includes('quick code') || t.id?.includes('_qc_') || t.hideMinus;
    if (filter === 'credits' && !t.isCredit && !isQc) return false;
    if (filter === 'debits' && (t.isCredit || isQc)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.subtitle.toLowerCase().includes(q) ||
        t.reference.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getIcon = (type: string, isCredit: boolean, isQc: boolean) => {
    if (type === 'quick_code' || isQc) return <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    if (type === 'deposit') return <ArrowDownLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    if (type === 'transfer') return <ArrowUpRight className="w-4 h-4 text-slate-700 dark:text-emerald-200" />;
    if (type === 'airtime') return <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    if (type === 'data') return <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
    if (type === 'promo') return <Gift className="w-4 h-4 text-[#e5b74b]" />;
    return isCredit ? (
      <ArrowDownLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
    ) : (
      <ArrowUpRight className="w-4 h-4 text-slate-700 dark:text-emerald-200" />
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] dark:bg-[#03140d] text-slate-900 dark:text-white flex flex-col pb-24 transition-colors duration-200">
      {/* Top Header */}
      <header className="bg-gradient-to-r from-[#022818] via-[#044329] to-[#022818] dark:from-[#011a10] dark:via-[#022a1a] dark:to-[#01180e] text-white sticky top-0 z-30 shadow-md">
        <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            id="history-page-back-btn"
            onClick={onBack}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="text-center">
            <h1 className="text-base font-extrabold tracking-tight text-white">Transaction History</h1>
            <p className="text-[10px] text-emerald-200/90 font-medium">All Account Records</p>
          </div>

          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#e5b74b] p-0.5">
            <img src={logoImg} alt="QuickPay" className="w-full h-full object-cover rounded-full" />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 sm:px-6 pt-5">
        {/* Search and Filters */}
        <div className="space-y-3 mb-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 dark:text-emerald-400 absolute left-3.5 top-3" />
            <input
              type="text"
              id="history-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, recipient or reference..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#062417] border border-slate-200 dark:border-emerald-800/60 rounded-2xl text-xs font-medium text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-[#064e32] dark:focus:ring-emerald-400"
            />
          </div>

          <div className="flex gap-2">
            {[
              { id: 'all' as const, label: 'All Transactions' },
              { id: 'credits' as const, label: 'Money In (+)' },
              { id: 'debits' as const, label: 'Money Out (-)' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                  filter === f.id
                    ? 'bg-[#064e32] dark:bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-[#062417] text-slate-600 dark:text-emerald-200/70 border border-slate-200 dark:border-emerald-800/50 hover:border-slate-300 dark:hover:border-emerald-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-[#062417] rounded-3xl p-8 text-center border border-slate-200 dark:border-emerald-800/40 text-slate-500 dark:text-emerald-200/60 text-xs">
            <Receipt className="w-10 h-10 text-slate-300 dark:text-emerald-700 mx-auto mb-2" />
            <p className="font-bold text-slate-700 dark:text-white">No transactions found</p>
            <p className="mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#062417] rounded-3xl p-4 border border-slate-200/80 dark:border-emerald-800/40 shadow-xs divide-y divide-slate-100 dark:divide-emerald-900/30">
            {filtered.map((tx) => {
              const isQc = tx.type === 'quick_code' || tx.title?.toLowerCase().includes('quick code') || tx.id?.includes('_qc_') || tx.hideMinus;
              return (
                <button
                  key={tx.id}
                  type="button"
                  onClick={() => onSelectTransaction(tx)}
                  className="w-full py-3.5 px-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#041d13] rounded-2xl transition cursor-pointer text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        tx.isCredit || isQc
                          ? 'bg-emerald-50 dark:bg-emerald-950/60'
                          : 'bg-slate-100 dark:bg-[#021810]'
                      }`}
                    >
                      {getIcon(tx.type, tx.isCredit, Boolean(isQc))}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-[#064e32] dark:group-hover:text-[#ffd56b] transition">
                        {tx.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-emerald-200/60 line-clamp-1">{tx.subtitle}</p>
                      <span className="text-[10px] text-slate-400 dark:text-emerald-300/50">{tx.date}</span>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-2">
                    <div>
                      <span
                        className={`text-xs sm:text-sm font-black ${
                          tx.isCredit || isQc
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {isQc ? '' : tx.isCredit ? '+' : '-'}
                        {formatNaira(tx.amount)}
                      </span>
                      <span className="block text-[10px] text-slate-400 dark:text-emerald-300/50 capitalize">
                        {tx.status}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-emerald-700 group-hover:text-slate-600 dark:group-hover:text-emerald-400" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
