import React, { useState } from 'react';
import { User, Transaction } from '../types';
import { addTransaction, updateUserBalance, formatNaira, redeemUserPromoCode } from '../data/storage';
import { X, Gift, Sparkles, Tag, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import promoGiftImg from '../assets/images/quickpay_promo_gift_1789754802129.jpg';

interface PromoModalProps {
  user: User;
  onClose: () => void;
  onBalanceUpdated: (updatedUser: User) => void;
}

export const PromoModal: React.FC<PromoModalProps> = ({ user, onClose, onBalanceUpdated }) => {
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
          text: `Success! ${formatNaira(result.reward)} added to your wallet balance.`,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#033421] via-[#04442a] to-[#032e1d] text-white p-5 relative overflow-hidden">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-extrabold shadow-md">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold tracking-tight">Promotions & Rewards</h3>
                <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-black rounded-full uppercase">
                  HOT
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                Exclusive cashback, gift prizes & instant bonuses
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {message && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Daily Reward Box */}
          <div className="bg-gradient-to-r from-[#fff9ea] to-[#fff3d4] border border-[#fde49a] rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={promoGiftImg}
                alt="Reward"
                className="w-12 h-12 object-contain filter drop-shadow-sm"
              />
              <div>
                <h5 className="text-sm font-extrabold text-slate-900">
                  Daily Check-in Bonus
                </h5>
                <p className="text-xs text-amber-900/80">Claim +₦150 free airtime/wallet credit</p>
              </div>
            </div>
            <button
              type="button"
              id="claim-daily-reward-btn"
              disabled={claimedDaily || processing}
              onClick={handleClaimDailyBonus}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                claimedDaily
                  ? 'bg-slate-200 text-slate-500 cursor-default'
                  : 'bg-[#064e32] hover:bg-emerald-900 text-white shadow-xs'
              }`}
            >
              {claimedDaily ? 'Claimed' : 'Claim ₦150'}
            </button>
          </div>

          {/* Promo Code Form */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#064e32]" />
              <span>Redeem Promo Code</span>
            </label>
            <form onSubmit={handleRedeemCode} className="flex gap-2">
              <input
                type="text"
                id="promo-code-input"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter promo code"
                className="flex-1 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm uppercase font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#064e32]"
              />
              <button
                type="submit"
                id="redeem-code-btn"
                disabled={!promoCode.trim() || processing}
                className="px-4 py-2.5 bg-[#064e32] hover:bg-emerald-900 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Apply
              </button>
            </form>
          </div>

          {/* Active Deals List */}
          <div className="space-y-2 pt-1">
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Featured Discounts
            </h5>
            <div className="p-3 bg-[#f0fbf5] border border-emerald-100 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Zap className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-xs font-bold text-slate-900">MTN 10GB Weekend Deal</p>
                  <p className="text-[11px] text-slate-500">Save 35% on all subscriptions</p>
                </div>
              </div>
              <span className="text-xs font-black text-emerald-800">₦2,000</span>
            </div>

            <div className="p-3 bg-[#f0fbf5] border border-emerald-100 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-xs font-bold text-slate-900">Unlimited Airtime Cashback</p>
                  <p className="text-[11px] text-slate-500">2% returned instantly on all networks</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
