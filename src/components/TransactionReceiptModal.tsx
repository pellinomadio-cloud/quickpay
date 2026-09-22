import React, { useState } from 'react';
import { Transaction } from '../types';
import { formatNaira } from '../data/storage';
import { X, CheckCircle2, Copy, Check, Share2, ArrowDownLeft, ArrowUpRight, ShieldCheck } from 'lucide-react';
import logoImg from '../assets/images/quickpay_gold_logo_1789754815185.jpg';

interface TransactionReceiptModalProps {
  transaction: Transaction;
  onClose: () => void;
}

export const TransactionReceiptModal: React.FC<TransactionReceiptModalProps> = ({
  transaction,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyRef = () => {
    navigator.clipboard?.writeText?.(transaction.reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#033421] to-[#054b30] text-white p-5 text-center relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-12 h-12 rounded-full overflow-hidden mx-auto mb-2 border-2 border-[#e5b74b] p-0.5">
            <img src={logoImg} alt="QuickPay" className="w-full h-full object-cover rounded-full" />
          </div>
          <h4 className="text-base font-extrabold tracking-tight">Transaction Receipt</h4>
          <p className="text-[11px] text-emerald-200/80">QuickPay Digital Settlement</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="text-center py-2 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {transaction.isCredit ? 'Amount Credited' : 'Amount Paid'}
            </span>
            <h2 className={`text-3xl font-extrabold mt-1 ${transaction.isCredit ? 'text-emerald-600' : 'text-slate-900'}`}>
              {transaction.isCredit ? '+' : '-'}{formatNaira(transaction.amount)}
            </h2>
            <div className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="capitalize">{transaction.status}</span>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Service</span>
              <span className="font-bold text-slate-900">{transaction.title}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Details</span>
              <span className="font-medium text-slate-800">{transaction.subtitle}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Date & Time</span>
              <span className="font-medium text-slate-800">{transaction.date}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-500">Reference</span>
              <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                <span>{transaction.reference}</span>
                <button
                  type="button"
                  onClick={handleCopyRef}
                  className="p-1 hover:bg-slate-100 rounded text-slate-500"
                  title="Copy reference"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Close Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
