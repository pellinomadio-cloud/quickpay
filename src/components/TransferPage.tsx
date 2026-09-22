import React, { useState } from 'react';
import { User, Transaction } from '../types';
import { addTransaction, updateUserBalance, formatNaira, getStoredUsers } from '../data/storage';
import {
  ArrowLeft,
  ArrowLeftRight,
  Lock,
  CheckCircle2,
  AlertCircle,
  Building2,
  User as UserIcon,
  ShieldCheck,
  Zap,
  RotateCcw,
} from 'lucide-react';
import logoImg from '../assets/images/quickpay_gold_logo_1789754815185.jpg';

interface TransferPageProps {
  user: User;
  onBack: () => void;
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

export const TransferPage: React.FC<TransferPageProps> = ({
  user,
  onBack,
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
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    setError(null);

    setTimeout(() => {
      const newBal = user.balance - numAmount;
      const updated = updateUserBalance(user.id, newBal);

      const ref = `QP-TRF-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
      const now = new Date();
      const dateStr = `Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

      const tx: Transaction = {
        id: `tx_${Date.now()}`,
        userId: user.id,
        type: 'transfer',
        title:
          transferType === 'quickpay'
            ? `Transfer to @${recipient}`
            : `Transfer to ${bank}`,
        subtitle: `${recipient} • ${narration || 'Funds Transfer'}`,
        amount: numAmount,
        isCredit: false,
        date: dateStr,
        status: 'successful',
        reference: ref,
        recipient: recipient,
      };

      addTransaction(tx);
      setCompletedTx(tx);

      if (updated) {
        onBalanceUpdated(updated);
      }
      setProcessing(false);
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 800);
  };

  const handleReset = () => {
    setRecipient('');
    setAmount('');
    setNarration('');
    setPin('');
    setStep('details');
    setError(null);
    setSuccess(false);
    setCompletedTx(null);
  };

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] dark:bg-[#03140d] text-slate-900 dark:text-white flex flex-col pb-24 transition-colors duration-200">
      {/* Top Application Header Bar */}
      <header className="bg-gradient-to-r from-[#022818] via-[#044329] to-[#022818] dark:from-[#011a10] dark:via-[#022a1a] dark:to-[#01180e] text-white sticky top-0 z-30 shadow-md">
        <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            id="transfer-page-back-btn"
            onClick={onBack}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="text-center">
            <h1 className="text-base font-extrabold tracking-tight text-white">Transfer Money</h1>
            <p className="text-[10px] text-emerald-200/90 font-medium">Instant Peer & Bank Payout</p>
          </div>

          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#e5b74b] p-0.5">
            <img src={logoImg} alt="QuickPay" className="w-full h-full object-cover rounded-full" />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 sm:px-6 pt-5">
        {/* Balance Preview Card */}
        <div className="bg-gradient-to-br from-[#043d26] via-[#065837] to-[#033420] dark:from-[#021f14] dark:via-[#043d26] dark:to-[#01150d] rounded-3xl p-5 sm:p-6 text-white shadow-lg border border-emerald-500/20 mb-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">
              Available Wallet Balance
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight">
              {formatNaira(user.balance)}
            </h2>
          </div>
          <button
            type="button"
            onClick={onOpenFund}
            className="py-2 px-3 rounded-2xl bg-[#e5b74b] hover:bg-[#d6a536] text-slate-900 text-xs font-black transition cursor-pointer shadow-md"
          >
            + Top Up
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl text-xs text-red-700 dark:text-red-300 flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{error}</span>
              {error.includes('Insufficient balance') && (
                <button
                  type="button"
                  onClick={onOpenFund}
                  className="block mt-1 font-bold text-emerald-800 dark:text-emerald-300 underline cursor-pointer"
                >
                  Fund wallet now &rarr;
                </button>
              )}
            </div>
          </div>
        )}

        {/* SUCCESS VIEW */}
        {success && completedTx ? (
          <div className="bg-white dark:bg-[#062417] text-slate-900 dark:text-white rounded-3xl p-6 shadow-sm dark:shadow-black/50 border border-slate-200/80 dark:border-emerald-800/40 text-center animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Transfer Successful
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {formatNaira(completedTx.amount)}
            </h3>
            <p className="text-xs text-slate-500 dark:text-emerald-200/60 mt-1">
              Sent to {recipient}
            </p>

            <div className="my-5 p-4 bg-slate-50 dark:bg-[#021810] rounded-2xl border border-slate-100 dark:border-emerald-800/40 text-left space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-emerald-900/40">
                <span className="text-slate-500 dark:text-emerald-200/60">Recipient</span>
                <span className="font-bold text-slate-900 dark:text-white">{recipient}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-emerald-900/40">
                <span className="text-slate-500 dark:text-emerald-200/60">Destination</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {transferType === 'quickpay' ? 'QuickPay Wallet' : bank}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-emerald-900/40">
                <span className="text-slate-500 dark:text-emerald-200/60">Reference</span>
                <span className="font-mono font-bold text-slate-800 dark:text-emerald-300">{completedTx.reference}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 dark:text-emerald-200/60">Date</span>
                <span className="font-medium text-slate-800 dark:text-emerald-100">{completedTx.date}</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={onBack}
                className="w-full py-3.5 bg-[#064e32] dark:bg-emerald-600 hover:bg-emerald-900 dark:hover:bg-emerald-500 text-white text-sm font-extrabold rounded-2xl transition cursor-pointer shadow-md"
              >
                Return to Dashboard
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="w-full py-3 bg-slate-100 dark:bg-[#021810] hover:bg-slate-200 dark:hover:bg-[#052c1c] text-slate-700 dark:text-emerald-200 text-xs font-bold rounded-2xl transition cursor-pointer flex items-center justify-center gap-1.5 border border-transparent dark:border-emerald-800/40"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Send Another Transfer</span>
              </button>
            </div>
          </div>
        ) : step === 'details' ? (
          /* DETAILS STEP */
          <div className="bg-white dark:bg-[#062417] text-slate-900 dark:text-white rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-black/50 border border-slate-200/80 dark:border-emerald-800/40">
            {/* Transfer Type Switcher */}
            <div className="grid grid-cols-2 bg-slate-100 dark:bg-[#021810] p-1 rounded-2xl mb-4 border border-transparent dark:border-emerald-800/40">
              <button
                type="button"
                onClick={() => setTransferType('quickpay')}
                className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  transferType === 'quickpay'
                    ? 'bg-white dark:bg-[#062417] text-[#064e32] dark:text-[#ffd56b] shadow-xs'
                    : 'text-slate-600 dark:text-emerald-200/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>QuickPay User</span>
              </button>
              <button
                type="button"
                onClick={() => setTransferType('bank')}
                className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  transferType === 'bank'
                    ? 'bg-white dark:bg-[#062417] text-[#064e32] dark:text-[#ffd56b] shadow-xs'
                    : 'text-slate-600 dark:text-emerald-200/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Other Bank</span>
              </button>
            </div>

            <form onSubmit={handleProceed} className="space-y-4">
              {transferType === 'bank' && (
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 dark:text-emerald-200 mb-1.5">
                    Select Bank
                  </label>
                  <select
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#021810] border border-slate-200 dark:border-emerald-800/60 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#064e32] dark:focus:ring-emerald-400 focus:bg-white dark:focus:bg-[#021810]"
                  >
                    {BANKS.map((b) => (
                      <option key={b} value={b} className="bg-white dark:bg-[#062417] text-slate-900 dark:text-white">
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-extrabold text-slate-800 dark:text-emerald-200 mb-1.5">
                  {transferType === 'quickpay' ? 'Recipient Email or Phone' : '10-Digit Account Number'}
                </label>
                <input
                  type={transferType === 'bank' ? 'number' : 'text'}
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder={
                    transferType === 'quickpay' ? 'e.g. friend@quickpay.ng or phone' : '0123456789'
                  }
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-[#021810] border border-slate-200 dark:border-emerald-800/60 rounded-2xl text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-[#064e32] dark:focus:ring-emerald-400 focus:bg-white dark:focus:bg-[#021810]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 dark:text-emerald-200 mb-1.5">
                  Amount to Send
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-slate-400 dark:text-emerald-400 font-bold text-base">₦</span>
                  <input
                    type="number"
                    min="100"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00 (Min ₦100)"
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-[#021810] border border-slate-200 dark:border-emerald-800/60 rounded-2xl text-base font-black text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-[#064e32] dark:focus:ring-emerald-400 focus:bg-white dark:focus:bg-[#021810]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 dark:text-emerald-200 mb-1.5">
                  Narration / Note (Optional)
                </label>
                <input
                  type="text"
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                  placeholder="e.g. For dinner, bills, project"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-[#021810] border border-slate-200 dark:border-emerald-800/60 rounded-2xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-[#064e32] dark:focus:ring-emerald-400 focus:bg-white dark:focus:bg-[#021810]"
                />
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-[#021810] rounded-2xl border border-emerald-100 dark:border-emerald-800/40 flex items-center gap-2 text-xs text-emerald-900 dark:text-emerald-200">
                <Zap className="w-4 h-4 text-[#e5b74b] shrink-0" />
                <span>Instant settlement. Zero transfer fee on QuickPay.</span>
              </div>

              <button
                type="submit"
                id="transfer-proceed-btn"
                className="w-full py-4 bg-[#064e32] dark:bg-emerald-600 hover:bg-emerald-900 dark:hover:bg-emerald-500 text-white text-sm font-extrabold rounded-2xl transition cursor-pointer shadow-md mt-2"
              >
                Proceed to Confirm
              </button>
            </form>
          </div>
        ) : (
          /* PIN STEP */
          <div className="bg-white dark:bg-[#062417] text-slate-900 dark:text-white rounded-3xl p-6 shadow-sm dark:shadow-black/50 border border-slate-200/80 dark:border-emerald-800/40 animate-in fade-in">
            <div className="text-center py-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mx-auto mb-2">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Confirm Transfer</h3>
              <p className="text-xs text-slate-500 dark:text-emerald-200/60 mt-0.5">
                Authorize transfer of <span className="font-extrabold text-slate-900 dark:text-white">{formatNaira(numAmount)}</span> to {recipient}
              </p>
            </div>

            <div className="space-y-3 mt-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-emerald-200 mb-1.5 text-center">
                  Enter 6-Digit Password
                </label>
                <input
                  type="password"
                  id="transfer-pin-input"
                  maxLength={6}
                  inputMode="numeric"
                  value={pin}
                  onChange={(e) => handlePinChange(e.target.value)}
                  placeholder="••••••"
                  className="w-full py-3 bg-slate-50 dark:bg-[#021810] border border-slate-200 dark:border-emerald-800/60 rounded-2xl text-center text-2xl font-black tracking-widest text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#064e32] dark:focus:ring-emerald-400"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  disabled={processing}
                  className="flex-1 py-3.5 border border-slate-200 dark:border-emerald-800/60 text-slate-700 dark:text-emerald-200 text-xs font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-[#021810] cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  id="transfer-confirm-submit-btn"
                  onClick={handleConfirmTransfer}
                  disabled={processing || pin.length !== 6}
                  className="flex-1 py-3.5 bg-[#064e32] dark:bg-emerald-600 hover:bg-emerald-900 dark:hover:bg-emerald-500 text-white text-xs font-extrabold rounded-2xl transition cursor-pointer shadow-md disabled:opacity-50"
                >
                  {processing ? 'Sending...' : 'Confirm Transfer'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
