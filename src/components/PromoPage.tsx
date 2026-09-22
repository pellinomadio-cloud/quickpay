import React, { useState } from 'react';
import { User, Transaction } from '../types';
import { addTransaction, updateUserBalance, formatNaira, redeemUserPromoCode } from '../data/storage';
import {
  ArrowLeft,
  Gift,
  Sparkles,
  Tag,
  CheckCircle2,
  AlertCircle,
  Zap,
} from 'lucide-react';
import promoGiftImg from '../assets/images/quickpay_promo_gift_1789754802129.jpg';
import logoImg from '../assets/images/quickpay_gold_logo_1789754815185.jpg';

interface PromoPageProps {
  user: User;
  onBack: () => void;
  onBalanceUpdated: (updatedUser: User) => void;
}

export const PromoPage: React.FC<PromoPageProps> = ({ user, onBack, onBalanceUpdated }) => {
  const [promoCode, setPromoCode] = useState('');
  const [claimedDaily, setClaimedDaily] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleClaimDailyBonus = () => {
    if (claimedDaily) return;
    setProcessing(true);

    setTimeout(() => {
      const bonus = 150.0;
      const newBal = user.balance + bonus;
      const updated = updateUserBalance(user.id, newBal);

      const tx: Transaction = {
        id: `tx_${Date.now()}`,
        userId: user.id,
        type: 'promo',
        title: 'Daily Check-in Reward',
        subtitle: 'QuickPay Loyalty Program',
        amount: bonus,
        isCredit: true,
        date: 'Just now',
        status: 'successful',
        reference: `QP-REW-${Math.floor(100000 + Math.random() * 900000)}`,
      };
      addTransaction(tx);

      if (updated) {
        onBalanceUpdated(updated);
      }
      setClaimedDaily(true);
      setProcessing(false);
      setMessage({ type: 'success', text: `You claimed ${formatNaira(bonus)} Daily Reward!` });
    }, 500);
  };

  const handleRedeemCode = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim();
    if (!code) return;

    setProcessing(true);
    setTimeout(() => {
      const result = redeemUserPromoCode(code, user);
      if (result.success && result.reward) {
        const updatedBal = user.balance + result.reward;
        onBalanceUpdated({ ...user, balance: updatedBal });
        setPromoCode('');
        setMessage({
          type: 'success',
          text: `Success! ${formatNaira(result.reward)} credited to your wallet balance.`,
        });
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Invalid promo code. Please enter a valid promo code.',
        });
      }
      setProcessing(false);
    }, 500);
  };

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] dark:bg-[#03140d] text-slate-900 dark:text-white flex flex-col pb-24 transition-colors duration-200">
      {/* Top Application Header Bar */}
      <header className="bg-gradient-to-r from-[#022818] via-[#044329] to-[#022818] dark:from-[#011a10] dark:via-[#022a1a] dark:to-[#01180e] text-white sticky top-0 z-30 shadow-md">
        <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            id="promo-page-back-btn"
            onClick={onBack}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="text-center">
            <h1 className="text-base font-extrabold tracking-tight text-white">Promotions & Rewards</h1>
            <p className="text-[10px] text-emerald-200/90 font-medium">QuickPay Loyalty</p>
          </div>

          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#e5b74b] p-0.5">
            <img src={logoImg} alt="QuickPay" className="w-full h-full object-cover rounded-full" />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 sm:px-6 pt-5 space-y-5">
        {/* Banner with art */}
        <div className="bg-gradient-to-r from-[#043e26] via-[#075937] to-[#033420] dark:from-[#021f14] dark:via-[#043d26] dark:to-[#01150d] text-white p-5 rounded-3xl relative overflow-hidden shadow-lg border border-emerald-500/20">
          <div className="relative z-10 max-w-[65%]">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#e5b74b] text-slate-900 rounded-full text-[10px] font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3 h-3" /> Special Bonus
            </span>
            <h2 className="text-xl sm:text-2xl font-black leading-tight text-white">
              Instant Cashback & Cash Vouchers
            </h2>
            <p className="text-xs text-emerald-200/90 mt-1.5">
              Redeem codes or claim daily attendance credits directly to your QuickPay balance.
            </p>
          </div>

          <div className="absolute -right-2 -bottom-2 w-32 h-32 opacity-90 pointer-events-none">
            <img
              src={promoGiftImg}
              alt="Promo Box"
              className="w-full h-full object-contain drop-shadow-xl"
            />
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div
            className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in ${
              message.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Daily Bonus Section */}
        <div className="bg-white dark:bg-[#062417] text-slate-900 dark:text-white rounded-3xl p-5 border border-slate-200 dark:border-emerald-800/40 shadow-sm dark:shadow-black/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 flex items-center justify-center border border-transparent dark:border-amber-700/40">
                <Gift className="w-4 h-4 text-[#e5b74b]" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Daily Login Reward</h3>
                <p className="text-[11px] text-slate-500 dark:text-emerald-200/60">Free ₦150.00 wallet credit today</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-transparent dark:border-emerald-700/40">
              Free
            </span>
          </div>

          <button
            type="button"
            id="promo-claim-daily-btn"
            onClick={handleClaimDailyBonus}
            disabled={claimedDaily || processing}
            className={`w-full py-3.5 rounded-2xl text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm ${
              claimedDaily
                ? 'bg-slate-100 dark:bg-[#021810] text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-emerald-900/40'
                : 'bg-[#064e32] dark:bg-emerald-600 hover:bg-emerald-900 dark:hover:bg-emerald-500 text-white'
            }`}
          >
            {claimedDaily ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Claimed for Today (₦150 Added)</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-[#e5b74b]" />
                <span>Claim ₦150 Free Cash Credit</span>
              </>
            )}
          </button>
        </div>

        {/* Voucher Code Redemption */}
        <div className="bg-white dark:bg-[#062417] text-slate-900 dark:text-white rounded-3xl p-5 border border-slate-200 dark:border-emerald-800/40 shadow-sm dark:shadow-black/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center border border-transparent dark:border-emerald-700/40">
              <Tag className="w-4 h-4 text-[#064e32] dark:text-[#ffd56b]" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Redeem Promo Code</h3>
              <p className="text-[11px] text-slate-500 dark:text-emerald-200/60">Enter a code to credit your wallet</p>
            </div>
          </div>

          <form onSubmit={handleRedeemCode} className="space-y-3">
            <div className="relative">
              <input
                type="text"
                id="promo-voucher-input"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter promo code"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-[#021810] border border-slate-200 dark:border-emerald-800/60 rounded-2xl text-xs font-black uppercase text-slate-900 dark:text-white placeholder:normal-case placeholder:font-medium placeholder:text-slate-400 dark:placeholder:text-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-[#064e32] dark:focus:ring-emerald-400"
              />
            </div>

            <button
              type="submit"
              id="promo-redeem-btn"
              disabled={processing || !promoCode.trim()}
              className="w-full py-3.5 bg-[#064e32] dark:bg-emerald-600 hover:bg-emerald-900 dark:hover:bg-emerald-500 text-white text-xs font-extrabold rounded-2xl transition cursor-pointer shadow-md disabled:opacity-50"
            >
              {processing ? 'Validating Promo Code...' : 'Redeem to Wallet'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
