import React, { useState } from 'react';
import { Eye, EyeOff, PlusCircle, ArrowUpRight, Wallet } from 'lucide-react';
import { formatNaira } from '../data/storage';

interface BalanceCardProps {
  balance: number;
  onFundWallet: () => void;
  onWithdraw: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  onFundWallet,
  onWithdraw,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div className="w-full max-w-xl mx-auto px-4 sm:px-6 pt-4">
      {/* Clean Plain Emerald Card */}
      <div className="rounded-2xl bg-emerald-700 p-5 text-white shadow-xs">
        {/* Top row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-200" />
            <span className="text-xs font-medium text-emerald-100">
              Total Wallet Balance
            </span>
          </div>

          <button
            type="button"
            id="toggle-balance-visibility-btn"
            onClick={() => setIsVisible(!isVisible)}
            className="p-1 rounded-md text-emerald-200 hover:text-white hover:bg-emerald-800 transition cursor-pointer"
            title={isVisible ? 'Hide balance' : 'Show balance'}
            aria-label={isVisible ? 'Hide balance' : 'Show balance'}
          >
            {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>

        {/* Large Naira Balance */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {isVisible ? formatNaira(balance) : '₦••••••'}
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-emerald-600/60">
          <button
            type="button"
            id="fund-wallet-btn"
            onClick={onFundWallet}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 font-semibold text-xs transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Fund Wallet</span>
          </button>

          <button
            type="button"
            id="withdraw-btn"
            onClick={onWithdraw}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs transition cursor-pointer border border-emerald-600"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Withdraw</span>
          </button>
        </div>
      </div>
    </div>
  );
};
