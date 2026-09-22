import React, { useState } from 'react';
import { User, Transaction } from '../types';
import { addTransaction, updateUserBalance, formatNaira, getStoredUsers } from '../data/storage';
import { X, ArrowLeftRight, Lock, CheckCircle2, AlertCircle, Building2, User as UserIcon, ArrowRight } from 'lucide-react';

interface TransferModalProps {
  user: User;
  onClose: () => void;
  onBalanceUpdated: (updatedUser: User) => void;
  onOpenFund: () => void;
}

const BANKS = [
  'Access Bank',
  'GTBank (Guaranty Trust)',
  'Zenith Bank',
  'First Bank of Nigeria',
  'United Bank for Africa (UBA)',
  'Kuda Bank',
  'OPay',
  'PalmPay',
  'Wema Bank / ALAT',
  'Stanbic IBTC Bank',
];

export const TransferModal: React.FC<TransferModalProps> = ({
  user,
  onClose,
  onBalanceUpdated,
  onOpenFund,
}) => {
  const [transferType, setTransferType] = useState<'quickpay' | 'bank'>('quickpay');
  const [recipient, setRecipient] = useState('');
  const [bank, setBank] = useState(BANKS[0]);
  const [amount, setAmount] = useState('');
  const [narration, setNarration] = useState('');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<'details' | 'pin'>('details');
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const numAmount = parseFloat(amount) || 0;

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (numAmount < 100) {
      setError('Minimum transfer amount is ₦100.');
      return;
    }

    if (numAmount > user.balance) {
      setError(`Insufficient balance. Your balance is ${formatNaira(user.balance)}.`);
      return;
    }

    if (!recipient.trim()) {
      setError('Please provide recipient details.');
      return;
    }

    setStep('pin');
  };

  const handlePinChange = (val: string) => {
    const numeric = val.replace(/\D/g, '').slice(0, 6);
    setPin(numeric);
    if (error) setError(null);
  };

  const handleConfirmTransfer = () => {
    if (pin.length !== 6) {
      setError('Please enter your 6-digit password.');
      return;
    }

    if (pin !== user.password) {
      setError('Incorrect 6-digit password.');
      return;
    }

    setProcessing(true);
    setTimeout(() => {
      const newBal = user.balance - numAmount;
      const updated = updateUserBalance(user.id, newBal);

      const title = transferType === 'quickpay'
        ? `Transfer to QuickPay user`
        : `Transfer to ${bank}`;
      const subtitle = `${recipient} • ${narration || 'Funds Transfer'}`;

      const tx: Transaction = {
        id: `tx_${Date.now()}`,
        userId: user.id,
        type: 'transfer',
        title,
        subtitle,
        amount: numAmount,
        isCredit: false,
        date: 'Just now',
        status: 'successful',
        reference: `QP-TRF-${Math.floor(100000 + Math.random() * 900000)}`,
        recipient,
      };
      addTransaction(tx);

      // If transferred to another QuickPay user in localStorage, credit them
      if (transferType === 'quickpay') {
        const users = getStoredUsers();
        const destUser = users.find(
          (u) => u.email.toLowerCase() === recipient.toLowerCase() || u.phone === recipient
        );
        if (destUser && destUser.id !== user.id) {
          updateUserBalance(destUser.id, destUser.balance + numAmount);
          addTransaction({
            id: `tx_rec_${Date.now()}`,
            userId: destUser.id,
            type: 'deposit',
            title: `Transfer from ${user.name}`,
            subtitle: `${user.phone} • ${narration || 'QuickPay Transfer'}`,
            amount: numAmount,
            isCredit: true,
            date: 'Just now',
            status: 'successful',
            reference: `QP-TRF-${Math.floor(100000 + Math.random() * 900000)}`,
          });
        }
      }

      if (updated) {
        onBalanceUpdated(updated);
      }
      setProcessing(false);
      setSuccess(true);

      setTimeout(() => {
        onClose();
      }, 1600);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#033421] to-[#054b30] text-white p-5 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-700/80 flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4 text-emerald-200" />
            </div>
            <h3 className="text-xl font-extrabold tracking-tight">Transfer Money</h3>
          </div>
          <p className="text-xs text-emerald-200/80 mt-1">
            Wallet Balance: <span className="font-bold text-white">{formatNaira(user.balance)}</span>
          </p>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 'details' ? (
            <form onSubmit={handleProceed} className="space-y-4">
              {/* Type Switcher */}
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTransferType('quickpay')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                    transferType === 'quickpay'
                      ? 'bg-white text-[#064e32] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  To QuickPay (Zero Fee)
                </button>
                <button
                  type="button"
                  onClick={() => setTransferType('bank')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                    transferType === 'bank'
                      ? 'bg-white text-[#064e32] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  To Other Banks
                </button>
              </div>

              {transferType === 'bank' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                      Select Destination Bank
                    </label>
                    <select
                      value={bank}
                      onChange={(e) => setBank(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#064e32]"
                    >
                      {BANKS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                      10-Digit Account Number
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 0123456789"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#064e32]"
                      required
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                    QuickPay Account (Email or Phone or Account #)
                  </label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="e.g. friend@gmail.com or 08012345678"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#064e32]"
                    required
                  />
                </div>
              )}

              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                  Amount (₦)
                </label>
                <input
                  type="number"
                  min="100"
                  step="10"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 5,000"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#064e32]"
                  required
                />
              </div>

              {/* Narration */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                  Remark / Narration (Optional)
                </label>
                <input
                  type="text"
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                  placeholder="e.g. Lunch or project fee"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#064e32]"
                />
              </div>

              <button
                type="submit"
                id="transfer-proceed-btn"
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#064e32] to-[#0a6642] hover:brightness-105 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <span>Proceed to Transfer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* PIN step */
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#064e32] mx-auto flex items-center justify-center mb-2">
                  <Lock className="w-6 h-6" />
                </div>
                <h4 className="text-base font-extrabold text-slate-900">
                  Authorize Transfer
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Sending <span className="font-bold text-slate-800">{formatNaira(numAmount)}</span> to{' '}
                  <span className="font-bold text-slate-800">{recipient}</span>.
                </p>
              </div>

              <div>
                <input
                  type="password"
                  id="transfer-pin-input"
                  inputMode="numeric"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => handlePinChange(e.target.value)}
                  placeholder="••••••"
                  className="w-full text-center tracking-[1em] text-2xl py-3 bg-slate-50 border-2 border-emerald-600/60 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  autoFocus
                />
                <div className="flex justify-center gap-2 mt-2">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <span
                      key={i}
                      className={`w-2.5 h-2.5 rounded-full ${
                        i < pin.length ? 'bg-[#064e32]' : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  id="transfer-confirm-btn"
                  disabled={pin.length !== 6 || processing}
                  onClick={handleConfirmTransfer}
                  className="flex-1 py-3 bg-[#064e32] text-white text-xs font-bold rounded-xl hover:bg-emerald-900 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {processing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : success ? (
                    <div className="flex items-center gap-1 text-amber-300">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Transfer Successful!</span>
                    </div>
                  ) : (
                    <span>Send {formatNaira(numAmount)}</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
