import React, { useState } from 'react';
import { User, Transaction } from '../types';
import { addTransaction, updateUserBalance, formatNaira } from '../data/storage';
import { X, Smartphone, Lock, CheckCircle2, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

interface BuyAirtimeModalProps {
  user: User;
  onClose: () => void;
  onBalanceUpdated: (updatedUser: User) => void;
  onOpenFund: () => void;
}

const NETWORKS = [
  { id: 'MTN', name: 'MTN', color: 'bg-[#ffcc00] text-slate-900 border-[#e6b800]' },
  { id: 'Airtel', name: 'Airtel', color: 'bg-[#ff0000] text-white border-[#cc0000]' },
  { id: 'Glo', name: 'Glo', color: 'bg-[#009933] text-white border-[#007a29]' },
  { id: '9mobile', name: '9mobile', color: 'bg-[#005a36] text-white border-[#00472b]' },
];

const PRESETS = [100, 200, 500, 1000, 2000, 5000];

export const BuyAirtimeModal: React.FC<BuyAirtimeModalProps> = ({
  user,
  onClose,
  onBalanceUpdated,
  onOpenFund,
}) => {
  const [selectedNetwork, setSelectedNetwork] = useState('MTN');
  const [amount, setAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState('');
  const [phone, setPhone] = useState(user.phone || '08123456789');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<'details' | 'pin'>('details');
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const effectiveAmount = customAmount ? parseFloat(customAmount) || 0 : amount;
  // 2% cashback
  const discount = Math.round(effectiveAmount * 0.02 * 100) / 100;
  const payAmount = effectiveAmount - discount;

  const handleProceedToPin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!phone || phone.length < 10) {
      setError('Please enter a valid recipient phone number.');
      return;
    }
    if (effectiveAmount < 50) {
      setError('Minimum airtime recharge is ₦50.');
      return;
    }
    if (user.balance < payAmount) {
      setError(`Insufficient balance. You need ${formatNaira(payAmount)}, but your balance is ${formatNaira(user.balance)}.`);
      return;
    }
    setStep('pin');
  };

  const handlePinChange = (val: string) => {
    const numeric = val.replace(/\D/g, '').slice(0, 6);
    setPin(numeric);
    if (error) setError(null);
  };

  const handleConfirmPurchase = () => {
    if (pin.length !== 6) {
      setError('Please enter your 6-digit password.');
      return;
    }

    if (pin !== user.password) {
      setError('Incorrect 6-digit password. Please try again.');
      return;
    }

    setProcessing(true);
    setTimeout(() => {
      const newBalance = user.balance - payAmount;
      const updated = updateUserBalance(user.id, newBalance);

      const tx: Transaction = {
        id: `tx_${Date.now()}`,
        userId: user.id,
        type: 'airtime',
        title: `${selectedNetwork} Airtime Top-up`,
        subtitle: `${phone} • 2% Cashback applied`,
        amount: payAmount,
        isCredit: false,
        date: 'Just now',
        status: 'successful',
        reference: `QP-AIR-${Math.floor(100000 + Math.random() * 900000)}`,
        network: selectedNetwork,
        recipient: phone,
      };
      addTransaction(tx);

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
              <Smartphone className="w-4 h-4 text-emerald-200" />
            </div>
            <h3 className="text-xl font-extrabold tracking-tight">Buy Airtime</h3>
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

          {user.balance < payAmount && step === 'details' && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
              <span>Your balance is low ({formatNaira(user.balance)})</span>
              <button
                type="button"
                onClick={onOpenFund}
                className="px-2.5 py-1 bg-[#064e32] text-white text-[11px] font-bold rounded-lg hover:bg-emerald-900 transition"
              >
                Top Up Now
              </button>
            </div>
          )}

          {step === 'details' ? (
            <form onSubmit={handleProceedToPin} className="space-y-4">
              {/* Network */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
                  Select Network Provider
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {NETWORKS.map((net) => (
                    <button
                      key={net.id}
                      type="button"
                      onClick={() => setSelectedNetwork(net.id)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                        selectedNetwork === net.id
                          ? `${net.color} ring-2 ring-emerald-600 shadow-sm scale-102`
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {net.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Presets */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Amount
                  </label>
                  <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    2% Instant Cashback
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {PRESETS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setAmount(amt);
                        setCustomAmount('');
                      }}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        amount === amt && !customAmount
                          ? 'bg-[#064e32] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {formatNaira(amt)}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Or enter custom amount (e.g. 750)"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#064e32]"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="airtime-phone-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08012345678"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#064e32]"
                  required
                />
              </div>

              {/* Summary */}
              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-600">You Pay (after 2% discount):</span>
                <span className="text-sm font-extrabold text-[#064e32]">
                  {formatNaira(payAmount)}
                </span>
              </div>

              <button
                type="submit"
                id="airtime-proceed-btn"
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#064e32] to-[#0a6642] hover:brightness-105 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <span>Proceed to Recharge</span>
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
                  Confirm Recharge with 6-Digit PIN
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Recharging <span className="font-bold text-slate-800">{formatNaira(effectiveAmount)}</span> {selectedNetwork} airtime to{' '}
                  <span className="font-bold text-slate-800">{phone}</span>.
                </p>
              </div>

              <div>
                <input
                  type="password"
                  id="airtime-pin-input"
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
                  id="airtime-confirm-pay-btn"
                  disabled={pin.length !== 6 || processing}
                  onClick={handleConfirmPurchase}
                  className="flex-1 py-3 bg-[#064e32] text-white text-xs font-bold rounded-xl hover:bg-emerald-900 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {processing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : success ? (
                    <div className="flex items-center gap-1 text-amber-300">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Recharge Successful!</span>
                    </div>
                  ) : (
                    <span>Confirm & Pay</span>
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
