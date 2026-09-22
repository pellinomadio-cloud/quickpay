import React, { useState } from 'react';
import { User, Transaction } from '../types';
import { updateUserBalance, formatNaira, addTransaction } from '../data/storage';
import { ArrowLeft, Gift, CheckCircle2, ChevronRight, Sparkles, Coins, CalendarCheck, ShieldCheck } from 'lucide-react';

interface EarnPageProps {
  user: User;
  onBack: () => void;
  onBalanceUpdated: (updatedUser: User) => void;
}

export const EarnPage: React.FC<EarnPageProps> = ({
  user,
  onBack,
  onBalanceUpdated,
}) => {
  const [claimedToday, setClaimedToday] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleClaimDailyBonus = () => {
    if (claimedToday) return;

    const BONUS_AMOUNT = 50.0;
    const newBal = +(user.balance + BONUS_AMOUNT).toFixed(2);
    const updated = updateUserBalance(user.id, newBal);

    if (updated) {
      onBalanceUpdated(updated);
      setClaimedToday(true);
      setStatusMessage('₦50.00 daily reward credited to your wallet!');

      const now = new Date();
      const dateStr = `Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      const tx: Transaction = {
        id: `tx_daily_bonus_${Date.now()}`,
        userId: user.id,
        type: 'promo',
        title: 'Daily Login Reward',
        subtitle: 'Free daily bonus credited',
        amount: BONUS_AMOUNT,
        isCredit: true,
        date: dateStr,
        status: 'successful',
        reference: `QP-BONUS-${Math.floor(100000 + Math.random() * 900000)}`,
      };
      addTransaction(tx);
    }
  };

  const earningTasks = [
    {
      id: 'task_daily',
      title: 'Daily Check-in',
      reward: '₦50.00',
      description: 'Check in every 24 hours to claim your free wallet balance.',
      completed: claimedToday,
      action: handleClaimDailyBonus,
      actionText: claimedToday ? 'Claimed' : 'Claim Now',
    },
    {
      id: 'task_transfer',
      title: 'First Bank Transfer',
      reward: '₦20.00 Cashback',
      description: 'Send money to any verified Nigerian bank account.',
      completed: false,
      actionText: 'Available',
    },
    {
      id: 'task_airtime',
      title: 'Buy Airtime or Data',
      reward: '2% Instant Discount',
      description: 'Recharge MTN, Airtel, Glo, or 9mobile instantly.',
      completed: false,
      actionText: 'Available',
    },
    {
      id: 'task_referral',
      title: 'Refer a Friend',
      reward: '₦100.00 per invite',
      description: 'Share QuickPay with friends and family.',
      completed: false,
      actionText: 'Share',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 flex flex-col pb-24">
      {/* Plain Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-3.5 flex items-center justify-between">
        <button
          type="button"
          id="earn-back-btn"
          onClick={onBack}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <h1 className="text-base font-semibold text-slate-900">
          Rewards & Earn
        </h1>

        <div className="w-16"></div>
      </header>

      {/* Main Content */}
      <div className="max-w-md mx-auto w-full px-4 pt-4 space-y-4">
        {/* Simple Summary Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-slate-500 font-medium">Your Wallet Balance</p>
              <h2 className="text-2xl font-bold text-slate-900 mt-0.5">
                {formatNaira(user.balance)}
              </h2>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Earn cash rewards and cashback bonuses directly into your main wallet. Rewards are instantly spendable or withdrawable.
          </p>
        </div>

        {/* Status Alert */}
        {statusMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Daily Bonus Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-semibold text-slate-900">Daily Bonus</h3>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              +₦50.00
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Claim your daily reward once every 24 hours.
          </p>

          <button
            type="button"
            id="claim-daily-reward-btn"
            disabled={claimedToday}
            onClick={handleClaimDailyBonus}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition cursor-pointer ${
              claimedToday
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
            }`}
          >
            {claimedToday ? 'Claimed for Today' : 'Claim ₦50.00 Now'}
          </button>
        </div>

        {/* Task List */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            More Ways to Earn
          </h3>

          <div className="divide-y divide-slate-100">
            {earningTasks.slice(1).map((task) => (
              <div key={task.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-semibold text-slate-800">
                      {task.title}
                    </h4>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      {task.reward}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    {task.description}
                  </p>
                </div>

                <span className="text-xs font-medium text-slate-400 shrink-0">
                  {task.actionText}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Security / Safe note */}
        <div className="p-3 bg-slate-100 rounded-xl flex items-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
          <span>All bonus rewards are safely credited to your official wallet.</span>
        </div>
      </div>
    </div>
  );
};
