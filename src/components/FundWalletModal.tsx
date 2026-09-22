import React, { useState, useEffect } from 'react';
import { User, Transaction } from '../types';
import { addTransaction, updateUserBalance, formatNaira, getCompanyAccount } from '../data/storage';
import { X, Copy, Check, ArrowRight, Building2, CreditCard } from 'lucide-react';

interface FundWalletModalProps {
  user: User;
  onClose: () => void;
  onBalanceUpdated: (updatedUser: User) => void;
}

export const FundWalletModal: React.FC<FundWalletModalProps> = ({
  user,
  onClose,
  onBalanceUpdated,
}) => {
  const [companyAccount, setCompanyAccount] = useState(() => getCompanyAccount());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleUpdate = () => setCompanyAccount(getCompanyAccount());
    window.addEventListener('quickpay_company_account_updated', handleUpdate);
    return () => window.removeEventListener('quickpay_company_account_updated', handleUpdate);
  }, []);

  const [selectedAmount, setSelectedAmount] = useState<number>(5000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const presetAmounts = [1000, 2000, 5000, 10000, 20000, 50000];

  const handleCopyAccount = () => {
    navigator.clipboard?.writeText?.(companyAccount.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const effectiveAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const handleConfirmDeposit = () => {
    if (effectiveAmount <= 0) return;
    setProcessing(true);

    setTimeout(() => {
      const newBal = +(user.balance + effectiveAmount).toFixed(2);
      const updated = updateUserBalance(user.id, newBal);

      const tx: Transaction = {
        id: `tx_${Date.now()}`,
        userId: user.id,
        type: 'deposit',
        title: 'Company Account Deposit Credited',
        subtitle: `Paid into ${companyAccount.bankName} (${companyAccount.accountNumber})`,
        amount: effectiveAmount,
        isCredit: true,
        date: 'Just now',
        status: 'successful',
        reference: `QP-DEP-${Math.floor(100000 + Math.random() * 900000)}`,
      };
      addTransaction(tx);

      if (updated) {
        onBalanceUpdated(updated);
      }
      setProcessing(false);
      setSuccess(true);

      setTimeout(() => {
        onClose();
      }, 1200);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white dark:bg-[#062417] text-slate-900 dark:text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 dark:border-emerald-800/40 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Emerald Header */}
        <div className="bg-gradient-to-r from-[#033421] to-[#054b30] dark:from-[#012215] dark:to-[#023320] text-white p-5 relative border-b border-transparent dark:border-emerald-800/40">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-xl font-extrabold tracking-tight">Fund Wallet</h3>
          <p className="text-xs text-emerald-200/80 mt-1">
            Deposit directly into QuickPay's verified corporate account
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Company Account Box */}
          <div className="bg-[#f0f9f4] dark:bg-[#031e13] border border-[#cbeed9] dark:border-emerald-800/50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#064e32] dark:text-emerald-400" />
                <span className="text-xs font-semibold text-slate-700 dark:text-emerald-200">
                  QuickPay Company Bank Account
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-[#d9f2e3] dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-transparent dark:border-emerald-700/40">
                Zero Fees
              </span>
            </div>

            <div className="bg-white dark:bg-[#02140d] p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/60 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-emerald-200/60 font-medium">
                  {companyAccount.bankName} • {companyAccount.accountName}
                </p>
                <p className="text-xl font-black text-slate-900 dark:text-[#ffd56b] tracking-wider font-mono">
                  {companyAccount.accountNumber}
                </p>
              </div>
              <button
                type="button"
                id="modal-copy-company-account-btn"
                onClick={handleCopyAccount}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#064e32] dark:bg-emerald-600 hover:bg-[#085e3d] dark:hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition cursor-pointer shadow-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-emerald-300/60 mt-2">
              Users do not have personal account numbers. Transfer to this company account to fund your wallet.
            </p>
          </div>

          {/* Deposit Notification Amount */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 dark:text-emerald-200 uppercase tracking-wide">
                Deposit Amount
              </label>
              <span className="text-xs text-slate-500 dark:text-emerald-300/60">
                Balance: {formatNaira(user.balance)}
              </span>
            </div>

            {/* Quick preset chips */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {presetAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setSelectedAmount(amt);
                    setCustomAmount('');
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedAmount === amt && !customAmount
                      ? 'bg-[#064e32] dark:bg-emerald-500 text-white dark:text-slate-950 shadow-xs'
                      : 'bg-slate-100 dark:bg-[#0a3522] text-slate-700 dark:text-emerald-200 hover:bg-slate-200 dark:hover:bg-[#0f462e]'
                  }`}
                >
                  +{formatNaira(amt)}
                </button>
              ))}
            </div>

            {/* Custom amount */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 dark:text-emerald-400 font-bold text-sm">
                ₦
              </span>
              <input
                type="number"
                id="modal-custom-fund-amount-input"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Or enter custom amount"
                className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-[#021810] border border-slate-200 dark:border-emerald-800/60 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-emerald-500/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#064e32] dark:focus:ring-emerald-400"
              />
            </div>
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            id="modal-confirm-deposit-btn"
            disabled={processing || effectiveAmount <= 0}
            onClick={handleConfirmDeposit}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-[#064e32] to-[#0a6642] dark:from-emerald-600 dark:to-emerald-700 hover:brightness-105 active:scale-[0.99] text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-60"
          >
            {processing ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : success ? (
              <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                <Check className="w-5 h-5" />
                <span>Wallet Credited Successfully!</span>
              </div>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Confirm Deposit of {formatNaira(effectiveAmount)}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
