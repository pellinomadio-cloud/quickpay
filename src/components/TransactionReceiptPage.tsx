import React, { useState } from 'react';
import { Transaction } from '../types';
import { formatNaira } from '../data/storage';
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Check,
  Share2,
  Receipt,
  Download,
} from 'lucide-react';
import logoImg from '../assets/images/quickpay_gold_logo_1789754815185.jpg';

interface TransactionReceiptPageProps {
  transaction: Transaction;
  onBack: () => void;
}

export const TransactionReceiptPage: React.FC<TransactionReceiptPageProps> = ({
  transaction,
  onBack,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText?.(transaction.reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isQuickCode =
    transaction.type === 'quick_code' ||
    transaction.title?.toLowerCase().includes('quick code') ||
    transaction.id?.includes('_qc_') ||
    transaction.hideMinus;

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] dark:bg-[#03140d] text-slate-900 dark:text-white flex flex-col pb-24 transition-colors duration-200">
      {/* Top Header */}
      <header className="bg-gradient-to-r from-[#022818] via-[#044329] to-[#022818] dark:from-[#011a10] dark:via-[#022a1a] dark:to-[#01180e] text-white sticky top-0 z-30 shadow-md">
        <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            id="receipt-page-back-btn"
            onClick={onBack}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="text-center">
            <h1 className="text-base font-extrabold tracking-tight text-white">Transaction Receipt</h1>
            <p className="text-[10px] text-emerald-200/90 font-medium">Official Digital Record</p>
          </div>

          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#e5b74b] p-0.5">
            <img src={logoImg} alt="QuickPay" className="w-full h-full object-cover rounded-full" />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 sm:px-6 pt-5">
        <div className="bg-white dark:bg-[#062417] rounded-3xl p-6 border border-slate-200 dark:border-emerald-800/40 shadow-sm dark:shadow-black/50 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mx-auto mb-3 shadow-inner border border-transparent dark:border-emerald-700/40">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-700/40">
            Payment Successful
          </span>

          <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-2">
            {isQuickCode ? '' : transaction.isCredit ? '+' : '-'}
            {formatNaira(transaction.amount)}
          </h2>
          <p className="text-xs font-bold text-slate-700 dark:text-emerald-100 mt-1">{transaction.title}</p>
          <p className="text-xs text-slate-500 dark:text-emerald-200/60">{transaction.subtitle}</p>

          <div className="my-6 p-4 bg-slate-50 dark:bg-[#021810] rounded-2xl border border-slate-100 dark:border-emerald-900/40 text-left space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-emerald-900/30">
              <span className="text-slate-500 dark:text-emerald-200/60">Transaction Status</span>
              <span className="font-extrabold text-emerald-700 dark:text-emerald-400 capitalize flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {transaction.status}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-emerald-900/30">
              <span className="text-slate-500 dark:text-emerald-200/60">Transaction Type</span>
              <span className="font-bold text-slate-800 dark:text-white uppercase text-[11px]">{transaction.type}</span>
            </div>

            {transaction.network && (
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-emerald-900/30">
                <span className="text-slate-500 dark:text-emerald-200/60">Network Operator</span>
                <span className="font-bold text-slate-800 dark:text-white">{transaction.network}</span>
              </div>
            )}

            {transaction.recipient && (
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-emerald-900/30">
                <span className="text-slate-500 dark:text-emerald-200/60">Recipient</span>
                <span className="font-mono font-bold text-slate-800 dark:text-white">{transaction.recipient}</span>
              </div>
            )}

            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-emerald-900/30">
              <span className="text-slate-500 dark:text-emerald-200/60">Date & Timestamp</span>
              <span className="font-medium text-slate-800 dark:text-white">{transaction.date}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 dark:text-emerald-200/60">Transaction Reference</span>
              <div className="flex items-center gap-1 font-mono font-bold text-slate-900 dark:text-[#ffd56b]">
                <span>{transaction.reference}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-emerald-900/50 rounded text-slate-500 dark:text-emerald-300 cursor-pointer"
                  title="Copy reference"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              id="receipt-return-home-btn"
              onClick={onBack}
              className="w-full py-3.5 bg-[#064e32] dark:bg-emerald-500 text-white dark:text-slate-950 hover:bg-emerald-900 dark:hover:bg-emerald-400 text-sm font-extrabold rounded-2xl transition cursor-pointer shadow-md"
            >
              Return to Previous Page
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
