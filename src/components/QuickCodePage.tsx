import React, { useState, useEffect, useRef } from 'react';
import { User, QuickCode, QuickCodeRequest, CompanyAccount } from '../types';
import {
  formatNaira,
  getQuickCodes,
  getCompanyAccount,
  addQuickCodeRequest,
  getUserQuickCodeRequests,
  QUICK_CODE_PRICE,
} from '../data/storage';
import {
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Sparkles,
  Lock,
  ArrowRight,
  Upload,
  Image as ImageIcon,
  Clock,
  X,
  Eye,
  Info,
  Building2,
  CreditCard,
  RefreshCw,
  Zap,
} from 'lucide-react';
import logoImg from '../assets/images/quickpay_gold_logo_1789754815185.jpg';

interface QuickCodePageProps {
  user: User;
  onBack: () => void;
  onBalanceUpdated?: (updatedUser: User) => void;
  onOpenFund: () => void;
  onNavigateToWithdraw?: (code?: string) => void;
}

// Client-side image compression
function compressImage(file: File, maxWidth = 800, maxHeight = 800, quality = 0.72): Promise<string> {
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

export const QuickCodePage: React.FC<QuickCodePageProps> = ({
  user,
  onBack,
  onOpenFund,
  onNavigateToWithdraw,
}) => {
  const [companyAccount, setCompanyAccount] = useState<CompanyAccount>(() => getCompanyAccount());
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Quick Code & Requests Data
  const [myCodes, setMyCodes] = useState<QuickCode[]>(() => getQuickCodes(user.id));
  const [myRequests, setMyRequests] = useState<QuickCodeRequest[]>(() => getUserQuickCodeRequests(user.id));

  // Upload Form State
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [senderRemark, setSenderRemark] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [viewingScreenshot, setViewingScreenshot] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with storage events
  useEffect(() => {
    const handleSync = () => {
      setCompanyAccount(getCompanyAccount());
      setMyCodes(getQuickCodes(user.id));
      setMyRequests(getUserQuickCodeRequests(user.id));
    };

    window.addEventListener('quickpay_quickcode_updated', handleSync);
    window.addEventListener('quickpay_company_account_updated', handleSync);

    return () => {
      window.removeEventListener('quickpay_quickcode_updated', handleSync);
      window.removeEventListener('quickpay_company_account_updated', handleSync);
    };
  }, [user.id]);

  const handleCopyAccount = () => {
    navigator.clipboard?.writeText?.(companyAccount.accountNumber);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText?.(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file (JPG, PNG, or WEBP).');
      return;
    }
    setFormError(null);
    setScreenshotFile(file);

    try {
      const compressed = await compressImage(file);
      setScreenshotPreview(compressed);
    } catch (e) {
      console.error('Image compression error:', e);
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

  const handleRemoveScreenshot = () => {
    setScreenshotPreview(null);
    setScreenshotFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitSuccess(null);

    if (!screenshotPreview) {
      setFormError('Please upload your payment screenshot/receipt of ₦7,800.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const ref = `QP-QC-${Math.floor(100000 + Math.random() * 900000)}`;
      const newRequest: QuickCodeRequest = {
        id: `qcreq_${Date.now()}`,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        amount: QUICK_CODE_PRICE, // ₦7,800
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

      addQuickCodeRequest(newRequest);
      setMyRequests(getUserQuickCodeRequests(user.id));
      setIsSubmitting(false);
      setSubmitSuccess(`Payment proof submitted successfully! Reference: ${ref}. Awaiting Admin Approval.`);
      handleRemoveScreenshot();
      setSenderRemark('');

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 600);
  };

  // Find active unused quick code
  const activeUnusedCode = myCodes.find((c) => c.status === 'unused');
  // Find pending request
  const pendingRequest = myRequests.find((r) => r.status === 'pending');
  // Find latest declined request
  const latestDeclinedRequest = myRequests.find((r) => r.status === 'declined');

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] dark:bg-[#03140d] text-slate-900 dark:text-white flex flex-col pb-24 transition-colors duration-200">
      {/* Top Header */}
      <header className="bg-gradient-to-r from-[#022818] via-[#044329] to-[#022818] dark:from-[#011a10] dark:via-[#022a1a] dark:to-[#01180e] text-white sticky top-0 z-30 shadow-md">
        <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            id="quick-code-back-btn"
            onClick={onBack}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5">
              <KeyRound className="w-4 h-4 text-[#ffd778]" />
              <h1 className="text-base font-extrabold tracking-tight text-white">Quick Code Hub</h1>
            </div>
            <p className="text-[10px] text-emerald-200/90 font-medium">
              Mandatory Single-Use Withdrawal Authorization
            </p>
          </div>

          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#e5b74b] p-0.5">
            <img src={logoImg} alt="QuickPay" className="w-full h-full object-cover rounded-full" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 sm:px-6 pt-5 space-y-5">
        {/* PRICE & EXPIRATION RULE BANNER */}
        <section
          aria-label="Quick Code Price and Terms"
          className="bg-gradient-to-br from-[#043320] via-[#064e32] to-[#022818] dark:from-[#021f14] dark:via-[#043d26] dark:to-[#01150d] rounded-3xl p-6 text-white shadow-xl border-2 border-[#ffd778]/50 relative overflow-hidden"
        >
          {/* Shimmer background accent */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-[#ffd778]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between mb-3">
            <span className="px-2.5 py-0.5 rounded-full bg-[#ffd778] text-slate-950 text-[10px] font-black uppercase tracking-wider">
              Official Authorization Pass
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-200 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#ffd778]" />
              Verified Payout Key
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-[#ffd778]">
              {formatNaira(QUICK_CODE_PRICE)}
            </span>
            <span className="text-xs text-emerald-200/90 font-medium">/ per quick code</span>
          </div>

          {/* Key Rule Callout */}
          <div className="mt-4 pt-3.5 border-t border-emerald-500/25 space-y-2 text-xs">
            <div className="flex items-start gap-2 text-emerald-100">
              <CheckCircle2 className="w-4 h-4 text-[#ffd778] shrink-0 mt-0.5" />
              <span>
                <strong>1 Withdrawal Validity:</strong> You can use this quick code for{' '}
                <strong className="text-white">one withdrawal</strong> and it will{' '}
                <strong className="text-[#ffd778]">expire automatically after one withdrawal</strong>.
              </span>
            </div>

            <div className="flex items-start gap-2 text-emerald-100">
              <CheckCircle2 className="w-4 h-4 text-[#ffd778] shrink-0 mt-0.5" />
              <span>
                Make payment of <strong>{formatNaira(QUICK_CODE_PRICE)}</strong> into the official company account,
                upload payment screenshot below, and your code is issued upon admin approval.
              </span>
            </div>
          </div>
        </section>

        {/* ACTIVE UNUSED QUICK CODE DISPLAY (IF ADMIN APPROVED) */}
        {activeUnusedCode && (
          <section
            aria-label="Active One-Time Quick Code"
            className="bg-gradient-to-br from-[#02311f] to-[#044a2f] text-white rounded-3xl p-6 shadow-xl border-2 border-[#ffd778] animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <Check className="w-3 h-3 stroke-[3]" />
                Active One-Time Quick Code
              </span>
              <span className="text-[11px] text-emerald-200/90">Single-use authorization</span>
            </div>

            <p className="text-xs text-emerald-100 mt-1">
              Your one-time Quick Code has been generated by the administrator. Use it to authorize your bank withdrawal:
            </p>

            <div className="my-3.5 p-4 bg-black/40 rounded-2xl border border-[#ffd778]/40 flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-300 block font-medium">Quick Code</span>
                <span className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-[#ffd778]">
                  {activeUnusedCode.code}
                </span>
              </div>

              <button
                type="button"
                id="copy-active-quick-code-btn"
                onClick={() => handleCopyCode(activeUnusedCode.code)}
                className="py-2.5 px-3.5 bg-[#e5b74b] hover:bg-[#ffd778] text-slate-950 text-xs font-black rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                {copiedCode === activeUnusedCode.code ? (
                  <>
                    <Check className="w-4 h-4 text-slate-950" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-950" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/10 text-emerald-100 text-[11px] mb-4">
              <Zap className="w-3.5 h-3.5 text-[#ffd778] shrink-0" />
              <span>
                <strong>Reminder:</strong> This code is valid for 1 withdrawal and will expire after your withdrawal is processed.
              </span>
            </div>

            {onNavigateToWithdraw && (
              <button
                type="button"
                id="quick-code-proceed-to-withdraw-btn"
                onClick={() => onNavigateToWithdraw(activeUnusedCode.code)}
                className="w-full py-3.5 bg-gradient-to-r from-[#ffe485] via-[#ffd24d] to-[#f59e0b] hover:from-[#fff0ad] hover:to-[#fbbf24] text-slate-950 text-sm font-black rounded-2xl transition cursor-pointer shadow-lg flex items-center justify-center gap-2"
              >
                <span>Proceed to Withdraw with this Code</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </section>
        )}

        {/* PENDING APPROVAL CARD (IF REQUEST IS SUBMITTED & PENDING) */}
        {pendingRequest && (
          <div className="bg-amber-500/10 border-2 border-amber-400/50 rounded-3xl p-5 text-amber-950 dark:text-amber-200 flex items-start gap-3.5 animate-in fade-in">
            <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 animate-pulse" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-amber-900 dark:text-amber-300">
                  Quick Code Purchase Under Review
                </h4>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 uppercase">
                  Pending Admin Approval
                </span>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-200/90 mt-1">
                Your payment proof of <strong>{formatNaira(pendingRequest.amount)}</strong> (Ref:{' '}
                <span className="font-mono font-bold">{pendingRequest.reference}</span>) has been submitted to the
                admin dashboard.
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-300/80 mt-1">
                Once the administrator approves your transfer, your one-time Quick Code will appear right here and on
                your dashboard for your withdrawal.
              </p>
            </div>
          </div>
        )}

        {/* DECLINED WARNING BANNER (IF PREVIOUS REQUEST WAS DECLINED) */}
        {latestDeclinedRequest && (
          <div className="bg-red-50 dark:bg-red-950/40 border-2 border-red-300 dark:border-red-800/80 rounded-3xl p-5 text-red-950 dark:text-red-200 space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
              <h4 className="text-sm font-black text-red-900 dark:text-red-300">Payment for Quick Code Failed</h4>
            </div>
            <p className="text-xs text-red-800 dark:text-red-200/90 leading-relaxed">
              Your payment for quick code failed. Please make the requested payment of{' '}
              <strong>{formatNaira(QUICK_CODE_PRICE)}</strong> for quick code into the official company account below so
              you can make a withdrawal.
            </p>
            {latestDeclinedRequest.declineReason && (
              <div className="p-2.5 bg-red-100/70 dark:bg-red-900/40 rounded-xl text-[11px] text-red-900 dark:text-red-200 italic">
                Reason: "{latestDeclinedRequest.declineReason}"
              </div>
            )}
          </div>
        )}

        {/* SUBMISSION SUCCESS TOAST */}
        {submitSuccess && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-black block text-emerald-950 dark:text-emerald-100">Proof Submitted!</span>
              <span>{submitSuccess}</span>
            </div>
          </div>
        )}

        {/* STEP 1: OFFICIAL COMPANY ACCOUNT DETAILS TO PAY ₦7,800 */}
        <section
          aria-label="Official Company Account for Quick Code"
          className="bg-white dark:bg-[#062417] text-slate-900 dark:text-white rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-black/50 border border-slate-200/90 dark:border-emerald-800/40 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-emerald-800/40 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-[#064e32] dark:text-emerald-300 flex items-center justify-center font-black">
                1
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Pay ₦7,800 into Company Account</h3>
                <p className="text-[11px] text-slate-500 dark:text-emerald-200/60">Official QuickPay Receiving Account</p>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-black border border-emerald-200 dark:border-emerald-700/40">
              Verified
            </span>
          </div>

          {/* Account Details Box */}
          <div className="p-4 rounded-2xl bg-[#f0fdf4] dark:bg-[#021810] border border-[#bbf7d0] dark:border-emerald-800/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600 dark:text-emerald-200/70 font-medium">Bank Name</span>
              <span className="text-xs font-black text-slate-900 dark:text-white">{companyAccount.bankName}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-y border-emerald-200/50 dark:border-emerald-900/40">
              <div>
                <span className="text-xs text-slate-600 dark:text-emerald-200/70 font-medium block">Account Number</span>
                <span className="text-lg sm:text-xl font-black font-mono text-[#064e32] dark:text-[#ffd56b] tracking-wider">
                  {companyAccount.accountNumber}
                </span>
              </div>

              <button
                type="button"
                id="copy-quick-code-account-btn"
                onClick={handleCopyAccount}
                className="py-1.5 px-3 rounded-xl bg-[#064e32] dark:bg-emerald-600 hover:bg-[#043d26] dark:hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                {copiedAccount ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#ffd778]" />
                    <span className="text-[#ffd778]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600 dark:text-emerald-200/70 font-medium">Account Name</span>
              <span className="text-xs font-bold text-slate-800 dark:text-emerald-100 text-right">{companyAccount.accountName}</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-emerald-200/50 dark:border-emerald-900/40">
              <span className="text-xs text-slate-600 dark:text-emerald-200/70 font-medium">Transfer Amount</span>
              <span className="text-sm font-black text-[#064e32] dark:text-emerald-400">{formatNaira(QUICK_CODE_PRICE)}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-[#021810] border border-slate-100 dark:border-emerald-900/40 rounded-2xl text-[11px] text-slate-600 dark:text-emerald-200/80 flex items-start gap-2">
            <Info className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Please transfer exactly <strong>₦7,800</strong> from your banking app. Use{' '}
              <strong className="text-slate-900 dark:text-white">"Quick Code - {user.name}"</strong> as your transfer narration.
            </span>
          </div>
        </section>

        {/* STEP 2: UPLOAD PAYMENT PROOF */}
        <section
          aria-label="Upload Payment Proof"
          className="bg-white dark:bg-[#062417] text-slate-900 dark:text-white rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-black/50 border border-slate-200/90 dark:border-emerald-800/40 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-emerald-800/40 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-[#064e32] dark:text-emerald-300 flex items-center justify-center font-black">
                2
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Upload Payment Proof</h3>
                <p className="text-[11px] text-slate-500 dark:text-emerald-200/60">Screenshot or debit receipt of ₦7,800</p>
              </div>
            </div>
          </div>

          {formError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmitProof} className="space-y-4">
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            {/* Drop / Upload Zone */}
            {!screenshotPreview ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 sm:p-8 rounded-3xl border-2 border-dashed text-center transition cursor-pointer flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? 'border-[#064e32] dark:border-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/40 ring-4 ring-emerald-500/10'
                    : 'border-slate-300 dark:border-emerald-800/60 hover:border-[#064e32] dark:hover:border-emerald-400 bg-slate-50/60 dark:bg-[#021810] hover:bg-emerald-50/20 dark:hover:bg-[#052b1b]'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#062417] shadow-xs border border-slate-200 dark:border-emerald-800/60 flex items-center justify-center text-[#064e32] dark:text-emerald-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Click to select payment screenshot
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-emerald-200/60 mt-0.5">
                    or drag & drop your receipt here (PNG, JPG, WEBP)
                  </p>
                </div>
                <span className="py-1.5 px-3 rounded-full bg-[#064e32] dark:bg-emerald-500 text-[#ffd778] dark:text-slate-950 text-[11px] font-black">
                  Select Screenshot
                </span>
              </div>
            ) : (
              <div className="p-4 rounded-3xl bg-slate-50 dark:bg-[#021810] border border-slate-200 dark:border-emerald-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Screenshot Ready (₦7,800)
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveScreenshot}
                    className="p-1 rounded-lg text-slate-400 dark:text-slate-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-emerald-800/40 bg-white dark:bg-[#062417] max-h-56 flex items-center justify-center">
                  <img
                    src={screenshotPreview}
                    alt="Quick code payment proof"
                    className="w-full h-full object-contain max-h-56"
                  />
                  <button
                    type="button"
                    onClick={() => setViewingScreenshot(screenshotPreview)}
                    className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/70 text-white hover:bg-black text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Zoom</span>
                  </button>
                </div>
              </div>
            )}

            {/* Optional Remark */}
            <div>
              <label htmlFor="quick-code-sender-remark" className="block text-xs font-bold text-slate-700 dark:text-emerald-200 mb-1">
                Sender Name or Bank (Optional)
              </label>
              <input
                type="text"
                id="quick-code-sender-remark"
                value={senderRemark}
                onChange={(e) => setSenderRemark(e.target.value)}
                placeholder="e.g. Sent from GTBank - John Doe"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-emerald-800/60 bg-white dark:bg-[#021810] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-emerald-500/40 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#064e32] dark:focus:ring-emerald-400"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="submit-quick-code-proof-btn"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#064e32] via-[#085b3b] to-[#043d26] dark:from-emerald-600 dark:via-emerald-700 dark:to-emerald-800 hover:from-[#05432b] hover:to-[#032f1e] text-[#ffd778] text-sm font-black transition cursor-pointer shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#ffd778]" />
                  <span>Submitting to Admin Dashboard...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 text-[#ffd778]" />
                  <span>Submit Proof for Quick Code ({formatNaira(QUICK_CODE_PRICE)})</span>
                  <ArrowRight className="w-4 h-4 text-[#ffd778]" />
                </>
              )}
            </button>
          </form>
        </section>

        {/* SECTION: PURCHASE & CODE HISTORY */}
        <section
          aria-label="Quick Code History"
          className="bg-white dark:bg-[#062417] text-slate-900 dark:text-white rounded-3xl p-5 shadow-sm dark:shadow-black/50 border border-slate-200/90 dark:border-emerald-800/40"
        >
          <h3 className="text-xs font-extrabold text-slate-800 dark:text-emerald-200 uppercase tracking-wider mb-3">
            Quick Code Activity & History
          </h3>

          {myRequests.length === 0 && myCodes.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-emerald-300/60 py-3 text-center">
              No Quick Code purchases yet. Purchase a code above to authorize withdrawals.
            </p>
          ) : (
            <div className="space-y-2.5">
              {/* Requests */}
              {myRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#021810] border border-slate-200 dark:border-emerald-800/40 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">Proof: {req.reference}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          req.status === 'approved'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                            : req.status === 'declined'
                            ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        }`}
                      >
                        {req.status === 'approved'
                          ? 'Approved'
                          : req.status === 'declined'
                          ? 'Declined'
                          : 'Pending Review'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-emerald-300/60 block mt-0.5">
                      Amount: {formatNaira(req.amount)} • {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                    {req.generatedCode && (
                      <span className="text-[11px] font-mono font-bold text-[#064e32] dark:text-[#ffd56b] block">
                        Issued Code: {req.generatedCode}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setViewingScreenshot(req.screenshotUrl)}
                    className="p-1.5 rounded-xl bg-white dark:bg-[#062417] border border-slate-200 dark:border-emerald-800/60 text-slate-600 dark:text-emerald-200 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Screenshot Lightbox Modal */}
      {viewingScreenshot && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs"
        >
          <div className="relative max-w-lg w-full bg-slate-900 rounded-3xl p-3 border border-white/20">
            <button
              type="button"
              onClick={() => setViewingScreenshot(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 text-white hover:bg-white/40 transition cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={viewingScreenshot}
              alt="Payment proof zoom"
              className="w-full max-h-[80vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
