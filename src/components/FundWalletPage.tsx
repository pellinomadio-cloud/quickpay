import React, { useState, useEffect, useRef } from 'react';
import { User, DepositRequest, Transaction } from '../types';
import {
  formatNaira,
  getCompanyAccount,
  addDepositRequest,
  getUserDepositRequests,
  addTransaction,
} from '../data/storage';
import {
  ArrowLeft,
  Copy,
  Check,
  Building2,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  Wallet,
  ArrowRight,
  Eye,
  Trash2,
  Info,
} from 'lucide-react';
import logoImg from '../assets/images/quickpay_gold_logo_1789754815185.jpg';

interface FundWalletPageProps {
  user: User;
  onBack: () => void;
  onBalanceUpdated: (updatedUser: User) => void;
}

// Client-side image compression helper to keep base64 storage compact (< 100KB)
function compressImage(file: File, maxWidth = 900, maxHeight = 900, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

export const FundWalletPage: React.FC<FundWalletPageProps> = ({
  user,
  onBack,
}) => {
  const [companyAccount, setCompanyAccount] = useState(() => getCompanyAccount());
  const [copied, setCopied] = useState(false);

  // Form states
  const [amount, setAmount] = useState<string>('5000');
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedRequest, setSubmittedRequest] = useState<DepositRequest | null>(null);

  // User deposit requests history
  const [userRequests, setUserRequests] = useState<DepositRequest[]>(() => getUserDepositRequests(user.id));
  const [viewingScreenshot, setViewingScreenshot] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const presetAmounts = [1000, 2000, 5000, 10000, 20000, 50000];

  useEffect(() => {
    const handleAccountUpdate = () => setCompanyAccount(getCompanyAccount());
    const handleDepositsUpdate = () => setUserRequests(getUserDepositRequests(user.id));

    window.addEventListener('quickpay_company_account_updated', handleAccountUpdate);
    window.addEventListener('quickpay_deposits_updated', handleDepositsUpdate);

    return () => {
      window.removeEventListener('quickpay_company_account_updated', handleAccountUpdate);
      window.removeEventListener('quickpay_deposits_updated', handleDepositsUpdate);
    };
  }, [user.id]);

  const handleCopyCompanyAccount = () => {
    navigator.clipboard?.writeText?.(companyAccount.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, JPEG, WEBP).');
      return;
    }
    setError(null);
    setScreenshotFile(file);

    try {
      const compressed = await compressImage(file);
      setScreenshotPreview(compressed);
    } catch (e) {
      console.error(e);
      // Fallback to basic data URL
      const reader = new FileReader();
      reader.onload = () => setScreenshotPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const effectiveAmount = parseFloat(amount) || 0;

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (effectiveAmount < 100) {
      setError('Minimum deposit amount is ₦100.');
      return;
    }

    if (!screenshotPreview) {
      setError('Please upload your payment transfer screenshot.');
      return;
    }

    setIsSubmitting(true);

    try {
      const ref = `QP-DEP-${Math.floor(100000 + Math.random() * 900000)}`;
      const now = new Date();
      const dateStr = `Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

      const newRequest: DepositRequest = {
        id: `dep_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        amount: effectiveAmount,
        screenshotUrl: screenshotPreview,
        companyAccount: {
          bankName: companyAccount.bankName,
          accountNumber: companyAccount.accountNumber,
          accountName: companyAccount.accountName,
        },
        status: 'pending',
        createdAt: new Date().toISOString(),
        reference: ref,
      };

      // Add to deposit requests
      addDepositRequest(newRequest);

      // Record a pending transaction in user history
      const pendingTx: Transaction = {
        id: `tx_${Date.now()}`,
        userId: user.id,
        type: 'deposit',
        title: 'Company Account Deposit Submitted',
        subtitle: `Awaiting admin approval • ${companyAccount.bankName} (${companyAccount.accountNumber})`,
        amount: effectiveAmount,
        isCredit: true,
        date: dateStr,
        status: 'pending',
        reference: ref,
      };
      addTransaction(pendingTx);

      // Update state
      setUserRequests(getUserDepositRequests(user.id));
      setSubmittedRequest(newRequest);
      setIsSubmitting(false);

      // Reset form fields
      setScreenshotFile(null);
      setScreenshotPreview(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error(err);
      setError('Failed to submit payment proof. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] flex flex-col pb-24">
      {/* Top Header */}
      <header className="bg-gradient-to-r from-[#022818] via-[#044329] to-[#022818] text-white sticky top-0 z-30 shadow-md">
        <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            id="fund-page-back-btn"
            onClick={onBack}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="text-center">
            <h1 className="text-base font-extrabold tracking-tight text-white">Fund Wallet</h1>
            <p className="text-[10px] text-emerald-200/90 font-medium">Pay Company Account & Upload Screenshot</p>
          </div>

          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#e5b74b] p-0.5">
            <img src={logoImg} alt="QuickPay" className="w-full h-full object-cover rounded-full" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 sm:px-6 pt-5">
        {/* Wallet Balance Card */}
        <div className="bg-gradient-to-br from-[#043d26] via-[#065837] to-[#033420] rounded-3xl p-5 sm:p-6 text-white shadow-lg border border-emerald-500/20 mb-5 relative overflow-hidden">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                Current Wallet Balance
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight">
                {formatNaira(user.balance)}
              </h2>
              <p className="text-[11px] text-emerald-200/80 mt-1">
                Zero fees • Balance is updated as soon as admin approves your payment screenshot
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <Wallet className="w-6 h-6 text-[#ffd778]" />
            </div>
          </div>
        </div>

        {/* SUBMISSION CONFIRMATION BANNER */}
        {submittedRequest && (
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border-2 border-amber-300 mb-6 text-center animate-in fade-in">
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>
            <span className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider bg-amber-100 px-3 py-1 rounded-full">
              Submitted for Admin Verification
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-2">
              +{formatNaira(submittedRequest.amount)}
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 max-w-md mx-auto leading-relaxed">
              Your payment screenshot has been sent directly to the Admin Control Dashboard.
              Once the admin approves your deposit, your wallet balance will automatically increase.
            </p>

            <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Reference:</span>
                <span className="font-bold text-slate-800">{submittedRequest.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Paid to:</span>
                <span className="font-bold text-slate-800">
                  {submittedRequest.companyAccount.bankName} - {submittedRequest.companyAccount.accountNumber}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSubmittedRequest(null)}
              className="mt-4 w-full py-3 bg-[#064e32] hover:bg-[#07593a] text-white text-xs font-extrabold rounded-xl transition cursor-pointer"
            >
              Submit Another Deposit
            </button>
          </div>
        )}

        {/* STREAMLINED 3-STEP FUNDING FORM */}
        <form onSubmit={handleSubmitProof} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: INPUT AMOUNT */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
              <div className="w-6 h-6 rounded-full bg-[#064e32] text-white flex items-center justify-center text-xs font-bold">
                1
              </div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
                Enter Amount to Fund
              </h3>
            </div>

            <div className="relative mt-2">
              <span className="absolute left-4 top-3.5 text-slate-400 font-extrabold text-xl">
                ₦
              </span>
              <input
                type="number"
                id="fund-amount-input"
                min="100"
                step="50"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xl sm:text-2xl font-black text-slate-950 focus:outline-none focus:ring-2 focus:ring-[#064e32] focus:bg-white transition"
                required
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3">
              {presetAmounts.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setAmount(p.toString());
                    if (error) setError(null);
                  }}
                  className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer text-center ${
                    effectiveAmount === p
                      ? 'bg-[#064e32] border-[#064e32] text-white shadow-xs'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  ₦{p.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* STEP 2: COMPANY ACCOUNT DETAILS TO PAY INTO */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#064e32] text-white flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
                  Pay into QuickPay Corporate Account
                </h3>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                Receiving Account
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Transfer <span className="font-extrabold text-slate-950 underline">{formatNaira(effectiveAmount)}</span> using your bank app to the verified corporate account below:
            </p>

            {/* Account Card */}
            <div className="bg-gradient-to-br from-[#f0fdf4] via-[#e6f7ec] to-[#dcf2e4] p-4 sm:p-5 rounded-2xl border-2 border-emerald-300 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-emerald-950 uppercase tracking-wide">
                      {companyAccount.bankName}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900">
                      Corporate
                    </span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-slate-950 tracking-wider font-mono mt-1">
                    {companyAccount.accountNumber}
                  </p>
                  <p className="text-xs font-bold text-slate-800 mt-1">
                    {companyAccount.accountName}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Sort Code: {companyAccount.sortCode} • Note: {companyAccount.narrationNote}
                  </p>
                </div>

                <button
                  type="button"
                  id="fund-copy-account-btn"
                  onClick={handleCopyCompanyAccount}
                  className="w-full sm:w-auto px-4 py-3 bg-[#064e32] hover:bg-[#07593a] text-white text-xs font-extrabold rounded-xl transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5 shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Account</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-3 p-2.5 bg-amber-50/90 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
              <span>
                Make sure you transfer from your personal bank account and save the transaction receipt or screenshot.
              </span>
            </div>
          </div>

          {/* STEP 3: UPLOAD PAYMENT SCREENSHOT */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
              <div className="w-6 h-6 rounded-full bg-[#064e32] text-white flex items-center justify-center text-xs font-bold">
                3
              </div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
                Upload Payment Screenshot
              </h3>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Upload the payment receipt screenshot from your bank app as proof of transfer:
            </p>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            {screenshotPreview ? (
              /* Preview Area */
              <div className="border-2 border-emerald-500/40 bg-emerald-50/30 rounded-2xl p-4 flex flex-col items-center">
                <div className="relative group max-h-64 rounded-xl overflow-hidden shadow-md border border-slate-200">
                  <img
                    src={screenshotPreview}
                    alt="Payment Proof"
                    className="max-h-60 object-contain rounded-xl"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setViewingScreenshot(screenshotPreview)}
                      className="p-2 rounded-lg bg-white/90 text-slate-900 hover:bg-white text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Full</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setScreenshotPreview(null);
                        setScreenshotFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>

                <div className="w-full flex items-center justify-between mt-3 text-xs text-slate-600 px-2">
                  <span className="font-semibold truncate max-w-[200px]">
                    {screenshotFile?.name || 'payment_proof.jpg'}
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-emerald-800 hover:text-emerald-900 font-bold underline cursor-pointer"
                  >
                    Change Image
                  </button>
                </div>
              </div>
            ) : (
              /* Drop / Upload Zone */
              <div
                id="screenshot-upload-dropzone"
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition ${
                  isDragging
                    ? 'border-[#064e32] bg-emerald-50/50'
                    : 'border-slate-300 hover:border-emerald-600 bg-slate-50 hover:bg-emerald-50/20'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#064e32] flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-800">
                  Click to select or drag & drop payment screenshot
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supports JPG, PNG, JPEG, WEBP from your mobile bank receipt
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-bold shadow-xs">
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Choose File</span>
                </div>
              </div>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            id="submit-payment-proof-btn"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-[#064e32] via-[#07593a] to-[#043c26] hover:brightness-105 text-white text-sm font-extrabold rounded-2xl shadow-lg shadow-emerald-950/20 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Submit Payment Screenshot for Approval</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* USER'S RECENT DEPOSIT REQUESTS & STATUSES */}
        <div className="mt-8 bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 mb-6">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#064e32]" />
              <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
                My Deposit Requests ({userRequests.length})
              </h4>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Real-time status</span>
          </div>

          {userRequests.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              No deposit submissions yet. Submit your first payment screenshot above to fund your wallet.
            </div>
          ) : (
            <div className="space-y-3">
              {userRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    {/* Thumbnail click to preview */}
                    <button
                      type="button"
                      onClick={() => setViewingScreenshot(req.screenshotUrl)}
                      className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0 relative group cursor-pointer"
                      title="Click to view full screenshot"
                    >
                      <img
                        src={req.screenshotUrl}
                        alt="Proof"
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white">
                        <Eye className="w-3.5 h-3.5" />
                      </div>
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-950">
                          +{formatNaira(req.amount)}
                        </span>
                        {/* Status Chip */}
                        {req.status === 'pending' && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Pending Review</span>
                          </span>
                        )}
                        {req.status === 'approved' && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Approved & Credited</span>
                          </span>
                        )}
                        {req.status === 'declined' && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            <span>Declined</span>
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Ref: {req.reference}
                      </p>
                      {req.notes && req.status === 'declined' && (
                        <p className="text-[11px] text-red-600 mt-0.5 font-medium">
                          Reason: {req.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setViewingScreenshot(req.screenshotUrl)}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-emerald-800 text-xs font-bold shrink-0 transition cursor-pointer"
                  >
                    View Proof
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* FULL-SIZE SCREENSHOT PREVIEW MODAL */}
      {viewingScreenshot && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-4 overflow-hidden shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <span className="text-xs font-bold text-slate-800">Payment Transfer Screenshot</span>
              <button
                type="button"
                onClick={() => setViewingScreenshot(null)}
                className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto flex items-center justify-center bg-slate-950/5 rounded-2xl p-2">
              <img
                src={viewingScreenshot}
                alt="Enlarged Payment Proof"
                className="max-h-[70vh] object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
