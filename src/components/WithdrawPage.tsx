import React, { useState, useEffect } from 'react';
import { User, Transaction } from '../types';
import {
  updateUserBalance,
  addTransaction,
  formatNaira,
  getValidQuickCode,
  consumeQuickCode,
  getQuickCodes,
} from '../data/storage';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowDownLeft,
  ChevronDown,
  ShieldCheck,
  Copy,
  Check,
  RotateCcw,
  KeyRound,
  Sparkles,
  Zap,
} from 'lucide-react';
import logoImg from '../assets/images/quickpay_gold_logo_1789754815185.jpg';

interface WithdrawPageProps {
  user: User;
  onBack: () => void;
  onBalanceUpdated: (updatedUser: User) => void;
  onOpenFund: () => void;
  onOpenQuickCode?: () => void;
  initialQuickCode?: string;
}

export const NIGERIAN_BANKS = [
  'Access Bank',
  'GTBank (Guaranty Trust Bank)',
  'Zenith Bank',
  'First Bank of Nigeria',
  'United Bank for Africa (UBA)',
  'Kuda Microfinance Bank',
  'OPay Digital Services',
  'PalmPay',
  'Wema Bank / ALAT',
  'Stanbic IBTC Bank',
  'Fidelity Bank',
  'Union Bank of Nigeria',
  'Ecobank Nigeria',
  'Sterling Bank',
  'Moniepoint Microfinance Bank',
  'FairMoney Microfinance Bank',
  'FCMB (First City Monument Bank)',
  'Polaris Bank',
  'Keystone Bank',
  'Jaiz Bank',
  'Taj Bank',
];

export const WithdrawPage: React.FC<WithdrawPageProps> = ({
  user,
  onBack,
  onBalanceUpdated,
  onOpenFund,
  onOpenQuickCode,
  initialQuickCode = '',
}) => {
  // Step 1: Select Bank First
  const [selectedBank, setSelectedBank] = useState(NIGERIAN_BANKS[0]);
  // Step 2: Input Account Number
  const [accountNumber, setAccountNumber] = useState('');
  // Step 3: Input Account Name
  const [accountName, setAccountName] = useState(user?.name ? user.name.toUpperCase() : '');
  // Step 4: Input Quick Code
  const [quickCode, setQuickCode] = useState(initialQuickCode);
  // Amount to withdraw
  const [amount, setAmount] = useState('');

  // States
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);
  const [usedCodeRecord, setUsedCodeRecord] = useState<string>('');
  const [copiedRef, setCopiedRef] = useState(false);

  // Sync if initialQuickCode changes
  useEffect(() => {
    if (initialQuickCode) {
      setQuickCode(initialQuickCode);
    }
  }, [initialQuickCode]);

  const numAmount = parseFloat(amount) || 0;

  // Unused quick codes
  const myQuickCodes = getQuickCodes(user.id);
  const unusedCodes = myQuickCodes.filter((c) => c.status === 'unused');
  const currentCodeValid = quickCode.trim() ? !!getValidQuickCode(user.id, quickCode) : false;

  const handleAccountNumberChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setAccountNumber(cleaned);
    if (error) setError(null);

    // Auto-fill account name if user hasn't modified it
    if (cleaned.length === 10 && !accountName.trim()) {
      setAccountName(user.name.toUpperCase());
    }
  };

  const handleQuickAmount = (val: number) => {
    setAmount(val.toString());
    if (error) setError(null);
  };

  // Direct simple withdrawal execution - NO PIN NEEDED
  const handleDirectWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedBank) {
      setError('Please select a destination bank.');
      return;
    }

    if (accountNumber.length !== 10) {
      setError('Please enter a valid 10-digit NUBAN account number.');
      return;
    }

    if (!accountName.trim()) {
      setError('Please enter the recipient account name.');
      return;
    }

    if (!quickCode.trim()) {
      setError('Please enter your Quick Code to authorize this withdrawal.');
      return;
    }

    const validCode = getValidQuickCode(user.id, quickCode.trim());
    if (!validCode) {
      setError('Invalid or already used Quick Code. Please check the code or purchase a new one.');
      return;
    }

    if (numAmount < 100) {
      setError('Minimum withdrawal amount is ₦100.00.');
      return;
    }

    if (numAmount > user.balance) {
      setError(`Insufficient balance. Your available balance is ${formatNaira(user.balance)}.`);
      return;
    }

    setProcessing(true);

    setTimeout(() => {
      const newBal = user.balance - numAmount;
      const updatedUser = updateUserBalance(user.id, newBal);

      const ref = `WTH-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
      const now = new Date();
      const dateStr = `Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

      // Consume the Quick Code (one-time use)
      consumeQuickCode(user.id, quickCode.trim(), ref);
      setUsedCodeRecord(validCode.code);

      const tx: Transaction = {
        id: `tx_withdraw_${Date.now()}`,
        userId: user.id,
        type: 'transfer',
        title: `Withdrawal to ${selectedBank}`,
        subtitle: `${accountNumber} • ${accountName.trim()} • Quick Code: ${validCode.code}`,
        amount: numAmount,
        isCredit: false,
        date: dateStr,
        status: 'successful',
        reference: ref,
        recipient: `${accountNumber} (${selectedBank})`,
      };

      addTransaction(tx);
      setCompletedTx(tx);
      if (updatedUser) {
        onBalanceUpdated(updatedUser);
      }

      setProcessing(false);
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 750);
  };

  const handleCopyRef = (reference: string) => {
    navigator.clipboard?.writeText?.(reference);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleResetForAnotherWithdrawal = () => {
    setAmount('');
    setQuickCode('');
    setError(null);
    setSuccess(false);
    setCompletedTx(null);
    setUsedCodeRecord('');
  };

  return (
    <div className="w-full min-h-screen bg-[#03140d] text-white flex flex-col pb-24 transition-colors duration-200">
      {/* Top Header */}
      <header className="bg-gradient-to-r from-[#011a10] via-[#022a1a] to-[#01180e] text-white sticky top-0 z-30 shadow-md border-b border-emerald-900/30">
        <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            id="withdraw-page-back-btn"
            onClick={onBack}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="text-center">
            <h1 className="text-base font-extrabold tracking-tight text-white">Withdraw Funds</h1>
            <p className="text-[10px] text-emerald-300/80 font-medium">
              Instant Payout to Nigerian Bank Account
            </p>
          </div>

          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#e5b74b] p-0.5 shadow-xs">
            <img src={logoImg} alt="QuickPay" className="w-full h-full object-cover rounded-full" />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 sm:px-6 pt-5">
        {/* Available Balance Banner */}
        <div className="bg-[#062417] rounded-3xl p-5 sm:p-6 text-white shadow-lg border border-emerald-800/40 mb-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-300/80 uppercase tracking-wider">
                Available Wallet Balance
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-0.5 tracking-tight">
                {formatNaira(user.balance)}
              </h2>
            </div>
            <button
              type="button"
              id="withdraw-page-fund-btn"
              onClick={onOpenFund}
              className="py-2 px-3.5 rounded-2xl bg-[#e5b74b] hover:bg-[#d6a536] text-slate-950 text-xs font-black transition cursor-pointer shadow-md"
            >
              + Top Up
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-4 p-3.5 bg-red-950/50 border border-red-800/60 rounded-2xl text-xs text-red-200 flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{error}</span>
              {error.includes('Quick Code') && onOpenQuickCode && (
                <button
                  type="button"
                  onClick={onOpenQuickCode}
                  className="block mt-1 font-black text-[#ffd56b] underline cursor-pointer"
                >
                  Buy Quick Code now &rarr;
                </button>
              )}
            </div>
          </div>
        )}

        {/* VIEW 1: SUCCESSFUL WITHDRAWAL RECEIPT */}
        {success && completedTx ? (
          <div className="bg-[#062417] text-white rounded-3xl p-6 shadow-xl border border-emerald-800/40 animate-in fade-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-950 text-emerald-300 flex items-center justify-center mx-auto mb-3 shadow-inner border border-emerald-700/40">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>

            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Settlement Dispatched
            </span>
            <h3 className="text-2xl font-black text-white mt-1">Withdrawal Successful</h3>
            <p className="text-xs text-emerald-200/60 mt-1">
              Funds have been transferred to your destination bank account.
            </p>

            <div className="my-5 p-4 bg-[#021810] rounded-2xl border border-emerald-900/40 text-left space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-emerald-900/30">
                <span className="text-emerald-200/60">Amount Sent</span>
                <span className="text-base font-extrabold text-white">
                  {formatNaira(completedTx.amount)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-emerald-900/30">
                <span className="text-emerald-200/60">Destination Bank</span>
                <span className="font-bold text-white">{selectedBank}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-emerald-900/30">
                <span className="text-emerald-200/60">Account Number</span>
                <span className="font-mono font-bold text-[#ffd56b]">{accountNumber}</span>
              </div>
              {accountName && (
                <div className="flex justify-between py-1 border-b border-emerald-900/30">
                  <span className="text-emerald-200/60">Account Name</span>
                  <span className="font-bold text-white">{accountName}</span>
                </div>
              )}
              {usedCodeRecord && (
                <div className="flex justify-between py-1 border-b border-emerald-900/30">
                  <span className="text-emerald-200/60">Quick Code Used</span>
                  <span className="font-mono font-black text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded-lg border border-emerald-700/40">
                    {usedCodeRecord}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-emerald-900/30">
                <span className="text-emerald-200/60">Date & Time</span>
                <span className="font-medium text-white">{completedTx.date}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-emerald-200/60">Reference Number</span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-white">
                  <span>{completedTx.reference}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyRef(completedTx.reference)}
                    className="p-1 hover:bg-emerald-900/40 rounded text-emerald-300 cursor-pointer"
                    title="Copy reference"
                  >
                    {copiedRef ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                id="withdraw-receipt-done-btn"
                onClick={onBack}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-extrabold rounded-2xl transition cursor-pointer shadow-md"
              >
                Return to Dashboard
              </button>
              <button
                type="button"
                onClick={handleResetForAnotherWithdrawal}
                className="w-full py-2.5 text-emerald-300 hover:text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Make Another Withdrawal</span>
              </button>
            </div>
          </div>
        ) : (
          /* VIEW 2: SIMPLE WITHDRAWAL FORM (DARK MODE, ORDERED AS REQUESTED) */
          <div className="bg-[#062417] text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-emerald-800/40">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-emerald-800/40">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-950 text-emerald-300 flex items-center justify-center border border-emerald-800/40">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Transfer to Bank</h3>
                  <p className="text-[11px] text-emerald-300/70">Simple direct payout</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/40">
                Zero Fees
              </span>
            </div>

            <form onSubmit={handleDirectWithdraw} className="space-y-4">
              {/* 1. SELECT BANK FIRST */}
              <div>
                <label className="block text-xs font-extrabold text-emerald-200 mb-1.5">
                  Select Destination Bank
                </label>
                <div className="relative">
                  <select
                    id="withdraw-page-bank-select"
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full px-4 py-3 bg-[#021810] border border-emerald-800/60 rounded-2xl text-sm font-bold text-white appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition cursor-pointer pr-10"
                    required
                  >
                    {NIGERIAN_BANKS.map((bankName) => (
                      <option key={bankName} value={bankName} className="bg-[#021810] text-white">
                        {bankName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-emerald-400 absolute right-4 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* 2. INPUT ACCOUNT NUMBER */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-extrabold text-emerald-200">
                    Account Number
                  </label>
                  <span className="text-[11px] text-emerald-400/50 font-medium">10-Digit NUBAN</span>
                </div>
                <input
                  type="text"
                  id="withdraw-page-account-number"
                  maxLength={10}
                  inputMode="numeric"
                  value={accountNumber}
                  onChange={(e) => handleAccountNumberChange(e.target.value)}
                  placeholder="Enter 10-digit NUBAN number"
                  className="w-full px-4 py-3 bg-[#021810] border border-emerald-800/60 rounded-2xl text-sm font-bold text-white placeholder:text-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  required
                />
              </div>

              {/* 3. INPUT ACCOUNT NAME */}
              <div>
                <label className="block text-xs font-extrabold text-emerald-200 mb-1.5">
                  Account Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="withdraw-page-account-name"
                    value={accountName}
                    onChange={(e) => {
                      setAccountName(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Enter recipient account name"
                    className="w-full px-4 py-3 bg-[#021810] border border-emerald-800/60 rounded-2xl text-sm font-bold text-white placeholder:text-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    required
                  />
                  {accountName.trim() && (
                    <span className="absolute right-3.5 top-3.5 text-emerald-400">
                      <ShieldCheck className="w-4 h-4" />
                    </span>
                  )}
                </div>
              </div>

              {/* 4. INPUT QUICK CODE */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-extrabold text-emerald-200 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#ffd56b]" />
                    <span>Quick Code</span>
                    <span className="text-[#ffd56b] font-bold">*</span>
                  </label>

                  {onOpenQuickCode && (
                    <button
                      type="button"
                      id="withdraw-buy-quickcode-link"
                      onClick={onOpenQuickCode}
                      className="text-[11px] font-black text-[#ffd56b] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-[#ffd56b]" />
                      <span>Get Quick Code (₦7,800)</span>
                    </button>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    id="withdraw-page-quickcode-input"
                    value={quickCode}
                    onChange={(e) => {
                      setQuickCode(e.target.value.toUpperCase());
                      if (error) setError(null);
                    }}
                    placeholder="Enter your Quick Code"
                    className={`w-full px-4 py-3 bg-[#021810] border rounded-2xl text-base font-black font-mono tracking-wider text-[#ffd56b] placeholder:text-emerald-500/40 placeholder:font-sans placeholder:font-normal focus:outline-none focus:ring-2 transition ${
                      currentCodeValid
                        ? 'border-emerald-500 ring-1 ring-emerald-500/30'
                        : 'border-emerald-800/60 focus:ring-emerald-500'
                    }`}
                    required
                  />

                  {currentCodeValid && (
                    <span className="absolute right-3.5 top-3.5 text-[11px] font-extrabold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Verified
                    </span>
                  )}
                </div>

                {/* Available Quick Code Quick-Select Chips */}
                {unusedCodes.length > 0 && (
                  <div className="mt-2 p-2.5 bg-emerald-950/60 border border-emerald-800/60 rounded-xl">
                    <p className="text-[10px] font-bold text-emerald-300 mb-1">
                      Your Available Quick Code (Click to use):
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {unusedCodes.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setQuickCode(c.code);
                            if (error) setError(null);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                            quickCode === c.code
                              ? 'bg-emerald-500 text-slate-950 shadow-xs font-black'
                              : 'bg-[#021810] text-[#ffd56b] border border-emerald-800 hover:bg-[#062c1b]'
                          }`}
                        >
                          {c.code}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 5. AMOUNT TO WITHDRAW */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-extrabold text-emerald-200">
                    Amount to Withdraw
                  </label>
                  <button
                    type="button"
                    onClick={() => handleQuickAmount(user.balance)}
                    className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                  >
                    Withdraw All ({formatNaira(user.balance)})
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-emerald-400/60 font-extrabold text-lg">
                    ₦
                  </span>
                  <input
                    type="number"
                    id="withdraw-page-amount-input"
                    min="100"
                    step="50"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="0.00"
                    className="w-full pl-9 pr-4 py-3 bg-[#021810] border border-emerald-800/60 rounded-2xl text-lg font-black text-white placeholder:text-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    required
                  />
                </div>

                {/* Quick amount chips */}
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {[1000, 5000, 10000, 20000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleQuickAmount(preset)}
                      className="py-1.5 text-xs font-bold rounded-xl border border-emerald-800/50 bg-[#082a1b] hover:bg-[#0d3d27] text-emerald-200 transition cursor-pointer text-center"
                    >
                      ₦{preset.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Info Note */}
              <div className="p-3 bg-emerald-950/40 rounded-2xl border border-emerald-800/40 flex items-center gap-2 text-[11px] text-emerald-200/80">
                <Zap className="w-4 h-4 text-[#ffd56b] shrink-0" />
                <span>Instant bank settlement authorized directly with your Quick Code.</span>
              </div>

              {/* Direct Submit Action Button (NO PIN STEP) */}
              <button
                type="submit"
                id="withdraw-page-proceed-btn"
                disabled={processing}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-black rounded-2xl transition cursor-pointer shadow-lg flex items-center justify-center gap-2 mt-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <span>Processing Withdrawal...</span>
                ) : (
                  <>
                    <span>Withdraw {numAmount > 0 ? formatNaira(numAmount) : 'Funds'}</span>
                    <ArrowDownLeft className="w-4 h-4 font-black" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
