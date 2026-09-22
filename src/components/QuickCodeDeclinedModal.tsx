import React from 'react';
import { AlertTriangle, ArrowRight, X, KeyRound, ShieldAlert, CreditCard } from 'lucide-react';
import { QuickCodeRequest } from '../types';
import { formatNaira, QUICK_CODE_PRICE } from '../data/storage';

interface QuickCodeDeclinedModalProps {
  request: QuickCodeRequest;
  onPayNow: () => void;
  onDismiss: () => void;
}

export const QuickCodeDeclinedModal: React.FC<QuickCodeDeclinedModalProps> = ({
  request,
  onPayNow,
  onDismiss,
}) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-code-declined-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-[#062417] text-slate-900 dark:text-white rounded-3xl shadow-2xl overflow-hidden border border-red-200 dark:border-red-900/60 animate-in zoom-in-95">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 dark:from-red-800 dark:via-rose-900 dark:to-red-900 px-6 py-5 text-white relative">
          <button
            type="button"
            id="quick-code-declined-close-btn"
            onClick={onDismiss}
            aria-label="Close message"
            className="absolute top-4 right-4 p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 border border-white/30">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-red-100 bg-red-800/40 dark:bg-black/30 px-2 py-0.5 rounded-md">
                Verification Failed
              </span>
              <h3 id="quick-code-declined-title" className="text-lg font-black text-white mt-0.5 leading-tight">
                Payment for Quick Code Failed
              </h3>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="p-4 bg-red-50/90 dark:bg-red-950/40 rounded-2xl border border-red-200 dark:border-red-800 text-red-950 dark:text-red-200 text-sm leading-relaxed">
            <p className="font-bold text-red-900 dark:text-red-300">
              Your payment for quick code failed and was not verified on the corporate account.
            </p>
            <p className="mt-2 text-xs text-red-800 dark:text-red-200/90">
              Please make the requested payment of{' '}
              <strong className="text-red-950 dark:text-red-100 font-black">{formatNaira(QUICK_CODE_PRICE)}</strong> for your
              Quick Code into the official company account so you can make a withdrawal.
            </p>
          </div>

          {/* Admin Note if available */}
          {request.declineReason && (
            <div className="p-3.5 bg-slate-50 dark:bg-[#021810] rounded-2xl border border-slate-200 dark:border-emerald-800/40 text-xs text-slate-700 dark:text-emerald-200">
              <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Admin Review Remark:</span>
              <span className="text-slate-600 dark:text-emerald-300/80 italic">"{request.declineReason}"</span>
            </div>
          )}

          {/* Withdrawal Reminder */}
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs">
            <KeyRound className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Note:</strong> A valid Quick Code is required to authorize bank withdrawals. Each code is
              valid for one withdrawal and expires immediately after use.
            </span>
          </div>

          {/* Actions */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              id="quick-code-declined-pay-now-btn"
              onClick={onPayNow}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#064e32] to-[#043d26] dark:from-emerald-600 dark:to-emerald-700 hover:from-[#05432b] hover:to-[#032f1e] text-[#ffd778] text-sm font-black transition cursor-pointer shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>Make Requested Payment ({formatNaira(QUICK_CODE_PRICE)})</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              type="button"
              id="quick-code-declined-dismiss-btn"
              onClick={onDismiss}
              className="w-full py-2.5 px-4 rounded-2xl text-slate-600 dark:text-emerald-200/70 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
