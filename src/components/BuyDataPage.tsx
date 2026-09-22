import React, { useState } from 'react';
import { User, Transaction } from '../types';
import { addTransaction, updateUserBalance, formatNaira } from '../data/storage';
import {
  ArrowLeft,
  Globe,
  Lock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap,
  RotateCcw,
} from 'lucide-react';
import logoImg from '../assets/images/quickpay_gold_logo_1789754815185.jpg';

interface BuyDataPageProps {
  user: User;
  onBack: () => void;
  onBalanceUpdated: (updatedUser: User) => void;
  onOpenFund: () => void;
}

const NETWORKS = [
  { id: 'MTN', name: 'MTN', color: 'bg-[#ffcc00] text-slate-900 border-[#e6b800]' },
  { id: 'Airtel', name: 'Airtel', color: 'bg-[#ff0000] text-white border-[#cc0000]' },
  { id: 'Glo', name: 'Glo', color: 'bg-[#009933] text-white border-[#007a29]' },
  { id: '9mobile', name: '9mobile', color: 'bg-[#005a36] text-white border-[#00472b]' },
];

const DATA_PLANS = [
  { id: 'd1', name: '1.0 GB SME (30 Days)', price: 290, popular: false },
  { id: 'd2', name: '2.5 GB Direct (30 Days)', price: 500, popular: true },
  { id: 'd3', name: '5.0 GB Direct (30 Days)', price: 1000, popular: false },
  { id: 'd4', name: '10.0 GB Mega (30 Days)', price: 2000, popular: false },
  { id: 'd5', name: '20.0 GB Ultra (30 Days)', price: 4000, popular: false },
];

export const BuyDataPage: React.FC<BuyDataPageProps> = ({
  user,
  onBack,
  onBalanceUpdated,
  onOpenFund,
}) => {
  const [selectedNetwork, setSelectedNetwork] = useState('MTN');
  const [selectedPlan, setSelectedPlan] = useState(DATA_PLANS[1]);
  const [phone, setPhone] = useState(user.phone || '08123456789');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<'details' | 'pin'>('details');
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);

  const handleProceedToPin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!phone || phone.length < 10) {
      setError('Please enter a valid recipient phone number.');
      return;
    }
    if (user.balance < selectedPlan.price) {
      setError(`Insufficient balance. You need ${formatNaira(selectedPlan.price)}, but your balance is ${formatNaira(user.balance)}.`);
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
    setError(null);

    setTimeout(() => {
      const newBal = user.balance - selectedPlan.price;
      const updatedUser = updateUserBalance(user.id, newBal);

      const ref = `QP-DAT-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
      const now = new Date();
      const dateStr = `Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

      const tx: Transaction = {
        id: `tx_${Date.now()}`,
        userId: user.id,
        type: 'data',
        title: `${selectedNetwork} Data Purchase`,
        subtitle: `${selectedPlan.name} • ${phone}`,
        amount: selectedPlan.price,
        isCredit: false,
        date: dateStr,
        status: 'successful',
        reference: ref,
        network: selectedNetwork,
        recipient: phone,
      };

      addTransaction(tx);
      setCompletedTx(tx);
      if (updatedUser) {
        onBalanceUpdated(updatedUser);
      }
      setProcessing(false);
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1000);
  };

  const handleReset = () => {
    setPin('');
    setStep('details');
    setSuccess(false);
    setError(null);
  };

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] dark:bg-[#03140d] text-slate-900 dark:text-white flex flex-col pb-24 transition-colors duration-200">
      {/* Top Application Header Bar */}
      <header className="bg-gradient-to-r from-[#022818] via-[#044329] to-[#022818] dark:from-[#011a10] dark:via-[#022a1a] dark:to-[#01180e] text-white sticky top-0 z-30 shadow-md">
        <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            id="data-page-back-btn"
            onClick={onBack}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="text-center">
            <h1 className="text-base font-extrabold tracking-tight text-white">Buy Mobile Data</h1>
            <p className="text-[10px] text-emerald-200/90 font-medium">Instant Telecom Delivery</p>
          </div>

          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#e5b74b] p-0.5">
            <img src={logoImg} alt="QuickPay" className="w-full h-full object-cover rounded-full" />
          </div>
        </div>
      </header>

      {/* Main Page Container */}
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
              Data Delivered Successfully
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {formatNaira(completedTx.amount)}
            </h3>
            <p className="text-xs text-slate-500 dark:text-emerald-200/60 mt-1">
              {completedTx.subtitle}
            </p>

            <div className="my-5 p-4 bg-slate-50 dark:bg-[#021810] rounded-2xl border border-slate-100 dark:border-emerald-800/40 text-left space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-emerald-900/40">
                <span className="text-slate-500 dark:text-emerald-200/60">Network</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedNetwork}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-emerald-900/40">
                <span className="text-slate-500 dark:text-emerald-200/60">Plan</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-emerald-900/40">
                <span className="text-slate-500 dark:text-emerald-200/60">Recipient Phone</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-emerald-900/40">
                <span className="text-slate-500 dark:text-emerald-200/60">Date</span>
                <span className="font-medium text-slate-800 dark:text-emerald-100">{completedTx.date}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 dark:text-emerald-200/60">Reference</span>
                <span className="font-mono font-bold text-slate-800 dark:text-emerald-300">{completedTx.reference}</span>
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
                <span>Buy Another Bundle</span>
              </button>
            </div>
          </div>
        ) : step === 'details' ? (
          /* DETAILS STEP */
          <div className="bg-white dark:bg-[#062417] text-slate-900 dark:text-white rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-black/50 border border-slate-200/80 dark:border-emerald-800/40">
            <form onSubmit={handleProceedToPin} className="space-y-4">
              {/* Network Selector */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 dark:text-emerald-200 mb-2">
                  1. Select Telecom Network
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {NETWORKS.map((net) => (
                    <button
                      key={net.id}
                      type="button"
                      onClick={() => setSelectedNetwork(net.id)}
                      className={`p-3 rounded-2xl border text-xs font-black transition cursor-pointer flex flex-col items-center gap-1 ${
                        selectedNetwork === net.id
                          ? 'border-[#064e32] dark:border-emerald-400 bg-emerald-50 dark:bg-[#021810] text-[#064e32] dark:text-[#ffd56b] ring-2 ring-[#064e32] dark:ring-emerald-400'
                          : 'border-slate-200 dark:border-emerald-800/50 bg-white dark:bg-[#041d13] hover:bg-slate-50 dark:hover:bg-[#021810] text-slate-700 dark:text-emerald-200'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${net.color.split(' ')[0]}`} />
                      <span>{net.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Plan Selection */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 dark:text-emerald-200 mb-2">
                  2. Select Data Plan
                </label>
                <div className="space-y-2">
                  {DATA_PLANS.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan)}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                        selectedPlan.id === plan.id
                          ? 'border-[#064e32] dark:border-emerald-400 bg-[#f0f9f4] dark:bg-[#021810] ring-1 ring-[#064e32] dark:ring-emerald-400'
                          : 'border-slate-200 dark:border-emerald-800/50 hover:border-emerald-200 dark:hover:border-emerald-500 bg-white dark:bg-[#041d13]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            selectedPlan.id === plan.id
                              ? 'border-[#064e32] dark:border-emerald-400 bg-[#064e32] dark:bg-emerald-500'
                              : 'border-slate-300 dark:border-emerald-800'
                          }`}
                        >
                          {selectedPlan.id === plan.id && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-emerald-100">{plan.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {plan.popular && (
                          <span className="text-[9px] font-black bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 px-1.5 py-0.5 rounded-full border border-transparent dark:border-amber-700/40">
                            POPULAR
                          </span>
                        )}
                        <span className="text-xs font-extrabold text-[#064e32] dark:text-[#ffd56b]">
                          {formatNaira(plan.price)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 dark:text-emerald-200 mb-1.5">
                  3. Recipient Phone Number
                </label>
                <input
                  type="tel"
                  id="data-phone-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  placeholder="08012345678"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-[#021810] border border-slate-200 dark:border-emerald-800/60 rounded-2xl text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-[#064e32] dark:focus:ring-emerald-400 focus:bg-white dark:focus:bg-[#021810]"
                  required
                />
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-[#021810] rounded-2xl border border-emerald-100 dark:border-emerald-800/40 flex items-center gap-2 text-xs text-emerald-900 dark:text-emerald-200">
                <Zap className="w-4 h-4 text-[#e5b74b] shrink-0" />
                <span>Automated instant delivery to {selectedNetwork} line in 1-5 seconds.</span>
              </div>

              <button
                type="submit"
                id="data-proceed-btn"
                className="w-full py-4 bg-[#064e32] dark:bg-emerald-600 hover:bg-emerald-900 dark:hover:bg-emerald-500 text-white text-sm font-extrabold rounded-2xl transition cursor-pointer shadow-md mt-2"
              >
                Continue to Authorize ({formatNaira(selectedPlan.price)})
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
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Confirm Data Subscription</h3>
              <p className="text-xs text-slate-500 dark:text-emerald-200/60 mt-0.5">
                Pay <span className="font-extrabold text-slate-900 dark:text-white">{formatNaira(selectedPlan.price)}</span> for {selectedPlan.name} on {selectedNetwork}
              </p>
            </div>

            <div className="my-4 p-4 bg-slate-50 dark:bg-[#021810] rounded-2xl border border-slate-100 dark:border-emerald-800/40 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-emerald-200/60">Recipient</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-emerald-200/60">Network</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedNetwork}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-emerald-800/40 font-bold">
                <span className="text-slate-700 dark:text-emerald-200">Total Deduction</span>
                <span className="text-emerald-700 dark:text-[#ffd56b] text-sm font-black">{formatNaira(selectedPlan.price)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-emerald-200 mb-1.5 text-center">
                  Enter 6-Digit Password
                </label>
                <input
                  type="password"
                  id="data-pin-input"
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
                  id="data-confirm-submit-btn"
                  onClick={handleConfirmPurchase}
                  disabled={processing || pin.length !== 6}
                  className="flex-1 py-3.5 bg-[#064e32] dark:bg-emerald-600 hover:bg-emerald-900 dark:hover:bg-emerald-500 text-white text-xs font-extrabold rounded-2xl transition cursor-pointer shadow-md disabled:opacity-50"
                >
                  {processing ? 'Delivering...' : 'Confirm & Purchase'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
