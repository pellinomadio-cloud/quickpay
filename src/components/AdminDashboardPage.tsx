import React, { useState, useEffect } from 'react';
import { CompanyAccount, User, DepositRequest, QuickCodeRequest, PromoCode } from '../types';
import {
  getCompanyAccount,
  saveCompanyAccount,
  resetCompanyAccount,
  getStoredUsers,
  updateUserBalance,
  addTransaction,
  formatNaira,
  generateQuickCodeString,
  addQuickCode,
  getQuickCodes,
  getDepositRequests,
  approveDepositRequest,
  declineDepositRequest,
  getQuickCodeRequests,
  approveQuickCodeRequest,
  declineQuickCodeRequest,
  QUICK_CODE_PRICE,
  getPromoCodes,
  generateAdminPromoCode,
  deletePromoCode,
  PROMO_CODE_REWARD,
} from '../data/storage';
import {
  Building2,
  Check,
  RotateCcw,
  ShieldCheck,
  ArrowLeft,
  Users,
  Wallet,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ArrowUpRight,
  ExternalLink,
  Edit3,
  Copy,
  Clock,
  XCircle,
  Eye,
  Check as CheckIcon,
  X as CloseIcon,
  X,
  CreditCard,
  Filter,
  FileCheck,
  Gift,
  Sparkles,
  Timer,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import logoImg from '../assets/images/quickpay_gold_logo_1789754815185.jpg';

interface AdminDashboardPageProps {
  onBackToApp: () => void;
}

const COMMON_BANKS = [
  'Zenith Bank',
  'Access Bank',
  'GTBank (Guaranty Trust Bank)',
  'First Bank of Nigeria',
  'United Bank for Africa (UBA)',
  'Kuda Microfinance Bank',
  'Moniepoint Microfinance Bank',
  'OPay Digital Services',
  'PalmPay',
  'Stanbic IBTC Bank',
  'Fidelity Bank',
  'Wema Bank / ALAT',
  'Sterling Bank',
  'Union Bank',
];

const DECLINE_REASONS = [
  'Payment not received on bank statement',
  'Transferred amount does not match request',
  'Illegible or unclear screenshot',
  'Duplicate receipt submission',
  'Incorrect receiving account used',
];

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onBackToApp }) => {
  const [activeTab, setActiveTab] = useState<'deposits' | 'company-account' | 'users' | 'quick-codes' | 'promo-codes'>('deposits');

  // Deposit Requests State
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>(() => getDepositRequests());
  const [depositFilter, setDepositFilter] = useState<'all' | 'pending' | 'approved' | 'declined'>('all');
  const [viewingScreenshot, setViewingScreenshot] = useState<string | null>(null);
  const [decliningReq, setDecliningReq] = useState<DepositRequest | null>(null);
  const [selectedDeclineReason, setSelectedDeclineReason] = useState<string>(DECLINE_REASONS[0]);
  const [customDeclineReason, setCustomDeclineReason] = useState<string>('');
  const [actionToast, setActionToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Company Account Form State
  const [companyAccount, setCompanyAccount] = useState<CompanyAccount>(() => getCompanyAccount());
  const [bankName, setBankName] = useState(companyAccount.bankName);
  const [accountNumber, setAccountNumber] = useState(companyAccount.accountNumber);
  const [accountName, setAccountName] = useState(companyAccount.accountName);
  const [sortCode, setSortCode] = useState(companyAccount.sortCode);
  const [narrationNote, setNarrationNote] = useState(companyAccount.narrationNote);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Users Management State
  const [users, setUsers] = useState<User[]>(() => getStoredUsers());
  const [selectedUserForCredit, setSelectedUserForCredit] = useState<User | null>(null);
  const [creditAmount, setCreditAmount] = useState<string>('5000');
  const [creditSuccessMsg, setCreditSuccessMsg] = useState<string | null>(null);

  // Quick Codes & Purchases State
  const [allCodes, setAllCodes] = useState<any[]>([]);
  const [codeGeneratedMsg, setCodeGeneratedMsg] = useState<string | null>(null);
  const [quickCodeRequests, setQuickCodeRequests] = useState<QuickCodeRequest[]>(() => getQuickCodeRequests());
  const [qcFilter, setQcFilter] = useState<'all' | 'pending' | 'approved' | 'declined'>('all');
  const [decliningQuickCodeReq, setDecliningQuickCodeReq] = useState<QuickCodeRequest | null>(null);
  const [selectedQCDeclineReason, setSelectedQCDeclineReason] = useState<string>(DECLINE_REASONS[0]);
  const [customQCDeclineReason, setCustomQCDeclineReason] = useState<string>('');

  // Promo Codes State (₦300,000, 1-hour expiry, single use per user)
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(() => getPromoCodes());
  const [customPromoInput, setCustomPromoInput] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [expandedPromoId, setExpandedPromoId] = useState<string | null>(null);
  const [promoFilter, setPromoFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [copiedPromoCode, setCopiedPromoCode] = useState<string | null>(null);

  const refreshAllData = () => {
    const freshUsers = getStoredUsers();
    setUsers(freshUsers);

    const freshRequests = getDepositRequests();
    setDepositRequests(freshRequests);

    const freshQCRequests = getQuickCodeRequests();
    setQuickCodeRequests(freshQCRequests);

    setPromoCodes(getPromoCodes());

    // gather all quick codes
    const codesList: any[] = [];
    freshUsers.forEach((u) => {
      const userCodes = getQuickCodes(u.id);
      userCodes.forEach((c) => {
        codesList.push({ ...c, userName: u.name, userEmail: u.email });
      });
    });
    setAllCodes(codesList);
  };

  // Keep live 1-second ticker for accurate promo code countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    refreshAllData();

    const handleDepositsUpdate = () => {
      setDepositRequests(getDepositRequests());
      setUsers(getStoredUsers());
    };
    const handleQuickCodeUpdate = () => {
      setQuickCodeRequests(getQuickCodeRequests());
      refreshAllData();
    };
    const handlePromosUpdate = () => {
      setPromoCodes(getPromoCodes());
      setUsers(getStoredUsers());
    };

    window.addEventListener('quickpay_deposits_updated', handleDepositsUpdate);
    window.addEventListener('quickpay_user_updated', handleDepositsUpdate);
    window.addEventListener('quickpay_quickcode_updated', handleQuickCodeUpdate);
    window.addEventListener('quickpay_promos_updated', handlePromosUpdate);

    return () => {
      window.removeEventListener('quickpay_deposits_updated', handleDepositsUpdate);
      window.removeEventListener('quickpay_user_updated', handleDepositsUpdate);
      window.removeEventListener('quickpay_quickcode_updated', handleQuickCodeUpdate);
      window.removeEventListener('quickpay_promos_updated', handlePromosUpdate);
    };
  }, []);

  // Promo Code Handlers
  const handleGeneratePromoCode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const res = generateAdminPromoCode(customPromoInput.trim() || undefined);
    if (res.success && res.promo) {
      setCustomPromoInput('');
      setPromoCodes(getPromoCodes());
      setActionToast({
        text: `Promo Code ${res.promo.code} generated! Value: ₦300,000 (Expires in 1 Hour).`,
        type: 'success',
      });
      setTimeout(() => setActionToast(null), 5000);
    } else {
      setActionToast({
        text: res.error || 'Failed to generate promo code.',
        type: 'error',
      });
      setTimeout(() => setActionToast(null), 5000);
    }
  };

  const handleDeletePromoCode = (promoId: string, code: string) => {
    deletePromoCode(promoId);
    setPromoCodes(getPromoCodes());
    setActionToast({
      text: `Promo code ${code} deleted.`,
      type: 'success',
    });
    setTimeout(() => setActionToast(null), 3000);
  };

  const handleCopyPromo = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedPromoCode(code);
    setTimeout(() => setCopiedPromoCode(null), 2000);
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - currentTime;
    if (diff <= 0) return 'Expired';
    const totalSecs = Math.floor(diff / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  // Quick Code Approval & Decline Handlers
  const handleApproveQuickCode = (req: QuickCodeRequest) => {
    const res = approveQuickCodeRequest(req.id);
    if (res.success) {
      setActionToast({
        text: `Approved! Quick Code ${res.code} issued to ${req.userName}.`,
        type: 'success',
      });
      refreshAllData();
      setTimeout(() => setActionToast(null), 4000);
    } else {
      setActionToast({
        text: res.error || 'Failed to approve quick code purchase.',
        type: 'error',
      });
      setTimeout(() => setActionToast(null), 4000);
    }
  };

  const handleOpenDeclineQCModal = (req: QuickCodeRequest) => {
    setDecliningQuickCodeReq(req);
    setSelectedQCDeclineReason(DECLINE_REASONS[0]);
    setCustomQCDeclineReason('');
  };

  const handleConfirmDeclineQC = (e: React.FormEvent) => {
    e.preventDefault();
    if (!decliningQuickCodeReq) return;

    const finalReason = customQCDeclineReason.trim() || selectedQCDeclineReason;
    const res = declineQuickCodeRequest(decliningQuickCodeReq.id, finalReason);

    if (res.success) {
      setActionToast({
        text: `Quick Code purchase for ${decliningQuickCodeReq.userName} has been declined. User will be notified to make payment.`,
        type: 'success',
      });
      refreshAllData();
      setTimeout(() => setActionToast(null), 4000);
    }

    setDecliningQuickCodeReq(null);
  };

  // Deposit Request Actions
  const handleApproveDeposit = (req: DepositRequest) => {
    const success = approveDepositRequest(req.id);
    if (success) {
      setActionToast({
        text: `Approved! ₦${req.amount.toLocaleString()} has been credited to ${req.userName}'s wallet.`,
        type: 'success',
      });
      refreshAllData();
      setTimeout(() => setActionToast(null), 4000);
    } else {
      setActionToast({
        text: 'Failed to approve deposit. Please try again.',
        type: 'error',
      });
      setTimeout(() => setActionToast(null), 4000);
    }
  };

  const handleOpenDeclineModal = (req: DepositRequest) => {
    setDecliningReq(req);
    setSelectedDeclineReason(DECLINE_REASONS[0]);
    setCustomDeclineReason('');
  };

  const handleConfirmDecline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!decliningReq) return;

    const finalReason = customDeclineReason.trim() || selectedDeclineReason;
    const success = declineDepositRequest(decliningReq.id, finalReason);

    if (success) {
      setActionToast({
        text: `Deposit of ₦${decliningReq.amount.toLocaleString()} for ${decliningReq.userName} has been declined.`,
        type: 'success',
      });
      refreshAllData();
      setTimeout(() => setActionToast(null), 4000);
    }

    setDecliningReq(null);
  };

  // Company Account Form Handling
  const handleSaveCompanyAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    const cleanBank = bankName.trim();
    const cleanNum = accountNumber.trim().replace(/\D/g, '');
    const cleanName = accountName.trim();

    if (!cleanBank) {
      setSaveError('Please provide a bank name.');
      return;
    }

    if (cleanNum.length < 9) {
      setSaveError('Please enter a valid bank account number (at least 10 digits).');
      return;
    }

    if (!cleanName) {
      setSaveError('Please provide the corporate account name.');
      return;
    }

    const updated: CompanyAccount = {
      bankName: cleanBank,
      accountNumber: cleanNum,
      accountName: cleanName,
      sortCode: sortCode.trim() || '058152062',
      narrationNote: narrationNote.trim() || 'QuickPay Wallet Deposit',
    };

    saveCompanyAccount(updated);
    setCompanyAccount(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleResetToDefault = () => {
    if (window.confirm('Reset company account to original default details?')) {
      const def = resetCompanyAccount();
      setCompanyAccount(def);
      setBankName(def.bankName);
      setAccountNumber(def.accountNumber);
      setAccountName(def.accountName);
      setSortCode(def.sortCode);
      setNarrationNote(def.narrationNote);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleCopyAccount = () => {
    navigator.clipboard?.writeText?.(companyAccount.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Direct Credit User
  const handleDirectCredit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForCredit) return;

    const amt = parseFloat(creditAmount) || 0;
    if (amt <= 0) return;

    const newBal = +(selectedUserForCredit.balance + amt).toFixed(2);
    updateUserBalance(selectedUserForCredit.id, newBal);

    const ref = `QP-ADM-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date();
    const dateStr = `Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    addTransaction({
      id: `tx_${Date.now()}`,
      userId: selectedUserForCredit.id,
      type: 'deposit',
      title: 'Administrator Balance Credit',
      subtitle: 'Manual credit by Master Admin',
      amount: amt,
      isCredit: true,
      date: dateStr,
      status: 'successful',
      reference: ref,
    });

    setCreditSuccessMsg(`Successfully credited ${formatNaira(amt)} to ${selectedUserForCredit.name}!`);
    refreshAllData();
    setTimeout(() => {
      setCreditSuccessMsg(null);
      setSelectedUserForCredit(null);
    }, 2500);
  };

  // Generate Quick Code for User
  const handleGenerateCodeForUser = (user: User) => {
    const code = generateQuickCodeString();
    addQuickCode({
      id: `qc_${Date.now()}`,
      userId: user.id,
      code,
      amountPaid: 0,
      status: 'unused',
      createdAt: new Date().toISOString(),
    });
    setCodeGeneratedMsg(`Generated Quick Code ${code} for user ${user.name}!`);
    refreshAllData();
    setTimeout(() => setCodeGeneratedMsg(null), 4000);
  };

  const pendingCount = depositRequests.filter((r) => r.status === 'pending').length;
  const approvedCount = depositRequests.filter((r) => r.status === 'approved').length;
  const declinedCount = depositRequests.filter((r) => r.status === 'declined').length;

  const filteredRequests = depositRequests.filter((r) => {
    if (depositFilter === 'all') return true;
    return r.status === depositFilter;
  });

  const pendingQCCount = quickCodeRequests.filter((r) => r.status === 'pending').length;
  const approvedQCCount = quickCodeRequests.filter((r) => r.status === 'approved').length;
  const declinedQCCount = quickCodeRequests.filter((r) => r.status === 'declined').length;

  const filteredQCRequests = quickCodeRequests.filter((r) => {
    if (qcFilter === 'all') return true;
    return r.status === qcFilter;
  });

  const totalBalance = users.reduce((acc, u) => acc + (u.balance || 0), 0);

  return (
    <div className="w-full min-h-screen bg-[#071d13] text-white flex flex-col pb-24 selection:bg-[#e5b74b] selection:text-black">
      {/* Top Admin Header */}
      <header className="bg-[#04291b] border-b border-emerald-500/20 px-4 sm:px-6 py-4 sticky top-0 z-30 shadow-lg">
        <div className="flex items-center justify-between">
          <button
            type="button"
            id="admin-dashboard-exit-btn"
            onClick={onBackToApp}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to App</span>
          </button>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h1 className="text-sm sm:text-base font-black tracking-tight text-white uppercase">
                Admin Control Dashboard
              </h1>
            </div>
            <p className="text-[10px] text-[#ffd56b] font-semibold">Master Access Granted (MC999)</p>
          </div>

          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#e5b74b] p-0.5">
            <img src={logoImg} alt="QuickPay" className="w-full h-full object-cover rounded-full" />
          </div>
        </div>

        {/* Action Toast */}
        {actionToast && (
          <div
            className={`mt-3 p-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
              actionToast.type === 'success'
                ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-300'
                : 'bg-red-500/20 border border-red-400/40 text-red-300'
            }`}
          >
            {actionToast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{actionToast.text}</span>
          </div>
        )}

        {/* Admin Navigation Tabs */}
        <div className="grid grid-cols-5 gap-1 mt-4 p-1 bg-black/40 rounded-2xl border border-emerald-500/20">
          <button
            type="button"
            id="admin-tab-deposits"
            onClick={() => setActiveTab('deposits')}
            className={`py-2 text-[11px] sm:text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1 relative ${
              activeTab === 'deposits'
                ? 'bg-[#e5b74b] text-slate-950 shadow-md font-black'
                : 'text-emerald-200/70 hover:text-white'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Deposit Proofs</span>
            <span className="sm:hidden">Deposits</span>
            {pendingCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-red-600 text-white rounded-full text-[9px] font-black animate-bounce">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            id="admin-tab-company-account"
            onClick={() => setActiveTab('company-account')}
            className={`py-2 text-[11px] sm:text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'company-account'
                ? 'bg-[#e5b74b] text-slate-950 shadow-md font-black'
                : 'text-emerald-200/70 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Company Account</span>
            <span className="sm:hidden">Account</span>
          </button>

          <button
            type="button"
            id="admin-tab-users"
            onClick={() => setActiveTab('users')}
            className={`py-2 text-[11px] sm:text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'users'
                ? 'bg-[#e5b74b] text-slate-950 shadow-md font-black'
                : 'text-emerald-200/70 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span>Users ({users.length})</span>
          </button>

          <button
            type="button"
            id="admin-tab-quick-codes"
            onClick={() => setActiveTab('quick-codes')}
            className={`py-2 text-[11px] sm:text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1 relative ${
              activeTab === 'quick-codes'
                ? 'bg-[#e5b74b] text-slate-950 shadow-md font-black'
                : 'text-emerald-200/70 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Quick Codes</span>
            <span className="sm:hidden">Codes</span>
            {pendingQCCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-slate-950 rounded-full text-[9px] font-black animate-bounce">
                {pendingQCCount}
              </span>
            )}
          </button>

          <button
            type="button"
            id="admin-tab-promo-codes"
            onClick={() => setActiveTab('promo-codes')}
            className={`py-2 text-[11px] sm:text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1 relative ${
              activeTab === 'promo-codes'
                ? 'bg-[#e5b74b] text-slate-950 shadow-md font-black'
                : 'text-emerald-200/70 hover:text-white'
            }`}
          >
            <Gift className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Promos (300k)</span>
            <span className="sm:hidden">Promos</span>
            {promoCodes.filter((p) => p.isActive && new Date(p.expiresAt).getTime() > currentTime).length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-emerald-400 text-slate-950 rounded-full text-[9px] font-black">
                {promoCodes.filter((p) => p.isActive && new Date(p.expiresAt).getTime() > currentTime).length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 sm:px-6 pt-5">
        {/* Stat Overview Banner */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          <div className="bg-[#053221] border border-emerald-500/20 rounded-2xl p-2.5 text-center">
            <span className="text-[9px] text-emerald-300 font-bold uppercase tracking-wider block">
              Pending
            </span>
            <span className="text-base sm:text-lg font-black text-[#ffd56b]">{pendingCount}</span>
          </div>

          <div className="bg-[#053221] border border-emerald-500/20 rounded-2xl p-2.5 text-center">
            <span className="text-[9px] text-emerald-300 font-bold uppercase tracking-wider block">
              Approved
            </span>
            <span className="text-base sm:text-lg font-black text-emerald-400">{approvedCount}</span>
          </div>

          <div className="bg-[#053221] border border-emerald-500/20 rounded-2xl p-2.5 text-center">
            <span className="text-[9px] text-emerald-300 font-bold uppercase tracking-wider block">
              Users
            </span>
            <span className="text-base sm:text-lg font-black text-white">{users.length}</span>
          </div>

          <div className="bg-[#053221] border border-emerald-500/20 rounded-2xl p-2.5 text-center">
            <span className="text-[9px] text-emerald-300 font-bold uppercase tracking-wider block">
              Balances
            </span>
            <span className="text-xs sm:text-sm font-black text-[#ffd56b] truncate block mt-0.5">
              {formatNaira(totalBalance)}
            </span>
          </div>
        </div>

        {/* TAB 1: DEPOSIT REQUESTS & SCREENSHOT APPROVALS */}
        {activeTab === 'deposits' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Filter Bar */}
            <div className="bg-[#053221] border border-emerald-500/30 rounded-2xl p-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-bold">
                <Filter className="w-3.5 h-3.5 text-[#e5b74b]" />
                <span>Filter:</span>
              </div>
              <div className="flex items-center gap-1 overflow-x-auto">
                {(['all', 'pending', 'approved', 'declined'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setDepositFilter(filter)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold uppercase tracking-wider transition cursor-pointer ${
                      depositFilter === filter
                        ? 'bg-[#e5b74b] text-slate-950 font-black'
                        : 'bg-black/40 text-emerald-200/70 hover:text-white'
                    }`}
                  >
                    {filter}
                    {filter === 'pending' && pendingCount > 0 && ` (${pendingCount})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Deposit Request Cards */}
            {filteredRequests.length === 0 ? (
              <div className="bg-[#053221] border border-emerald-500/30 rounded-3xl p-8 text-center text-emerald-300/70 text-xs">
                <FileCheck className="w-10 h-10 text-emerald-500/40 mx-auto mb-2" />
                <p className="font-bold text-sm text-white mb-1">No deposit submissions found</p>
                <p>When users transfer to the corporate account and upload payment screenshots, they appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-[#053221] border border-emerald-500/30 rounded-3xl p-4 sm:p-5 shadow-lg relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-2 pb-3 border-b border-emerald-500/20">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-white">{req.userName}</h4>
                          {/* Status Badge */}
                          {req.status === 'pending' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Pending Review</span>
                            </span>
                          )}
                          {req.status === 'approved' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Approved & Credited</span>
                            </span>
                          )}
                          {req.status === 'declined' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-400/20 text-red-300 border border-red-400/30 flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              <span>Declined</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-emerald-300/70 mt-0.5">{req.userEmail}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-lg sm:text-xl font-black text-[#ffd56b]">
                          +{formatNaira(req.amount)}
                        </span>
                        <p className="text-[10px] text-emerald-400/60 font-mono mt-0.5">
                          {req.reference}
                        </p>
                      </div>
                    </div>

                    {/* Screenshot & Info Grid */}
                    <div className="mt-3 flex flex-col sm:flex-row items-center gap-3">
                      {/* Screenshot Thumbnail with Click to Zoom */}
                      <div
                        onClick={() => setViewingScreenshot(req.screenshotUrl)}
                        className="w-full sm:w-36 h-36 rounded-2xl overflow-hidden bg-black/40 border-2 border-emerald-500/30 cursor-pointer relative group shrink-0"
                      >
                        <img
                          src={req.screenshotUrl}
                          alt="Payment Proof"
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1 text-white text-xs font-bold">
                          <Eye className="w-4 h-4 text-[#ffd56b]" />
                          <span>View Full Proof</span>
                        </div>
                      </div>

                      {/* Details & Metadata */}
                      <div className="flex-1 w-full text-xs space-y-1.5 bg-[#02180f] p-3 rounded-2xl border border-emerald-500/20">
                        <div className="flex justify-between">
                          <span className="text-emerald-300/60">Submitted:</span>
                          <span className="text-emerald-100 font-medium">
                            {new Date(req.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-emerald-300/60">Company Bank:</span>
                          <span className="text-emerald-100 font-bold truncate max-w-[180px]">
                            {req.companyAccount.bankName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-emerald-300/60">Account Number:</span>
                          <span className="text-[#ffd56b] font-mono font-bold">
                            {req.companyAccount.accountNumber}
                          </span>
                        </div>
                        {(req.reviewedAt || req.processedAt) && (
                          <div className="flex justify-between border-t border-emerald-500/20 pt-1">
                            <span className="text-emerald-300/60">Reviewed At:</span>
                            <span className="text-emerald-200">
                              {new Date((req.reviewedAt || req.processedAt)!).toLocaleTimeString()}
                            </span>
                          </div>
                        )}
                        {req.notes && (
                          <div className="border-t border-emerald-500/20 pt-1">
                            <span className="text-red-400 font-bold">Reason: </span>
                            <span className="text-emerald-100">{req.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Controls for Pending Requests */}
                    {req.status === 'pending' && (
                      <div className="mt-3.5 pt-3 border-t border-emerald-500/20 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          id={`approve-deposit-${req.id}`}
                          onClick={() => handleApproveDeposit(req)}
                          className="py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                        >
                          <CheckIcon className="w-4 h-4" />
                          <span>Approve & Credit Balance</span>
                        </button>

                        <button
                          type="button"
                          id={`decline-deposit-${req.id}`}
                          onClick={() => handleOpenDeclineModal(req)}
                          className="py-2.5 px-3 bg-red-600/30 hover:bg-red-600 text-red-200 hover:text-white border border-red-500/40 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <CloseIcon className="w-4 h-4" />
                          <span>Decline Request</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: COMPANY ACCOUNT EDITOR */}
        {activeTab === 'company-account' && (
          <div className="space-y-5 animate-in fade-in">
            {/* Live Corporate Account Preview */}
            <div className="bg-gradient-to-br from-[#06432b] to-[#042f1e] rounded-3xl p-5 sm:p-6 border-2 border-[#e5b74b] shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#ffd56b]" />
                  <div>
                    <h3 className="text-sm font-black text-white">Active Corporate Bank Account</h3>
                    <p className="text-[10px] text-emerald-200/80">Displayed to all users when funding</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e5b74b] text-slate-950">
                  LIVE ON APP
                </span>
              </div>

              <div className="bg-black/30 backdrop-blur-xs p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#ffd56b] font-bold uppercase tracking-wider block">
                    {companyAccount.bankName}
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-white tracking-widest font-mono block mt-0.5">
                    {companyAccount.accountNumber}
                  </span>
                  <span className="text-xs font-semibold text-white/90 block mt-1">
                    {companyAccount.accountName}
                  </span>
                  <span className="text-[10px] text-emerald-300/70 block mt-0.5">
                    Sort Code: {companyAccount.sortCode} • Note: {companyAccount.narrationNote}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyAccount}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                  title="Copy Account Number"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Edit Company Account Form */}
            <div className="bg-[#053221] border border-emerald-500/30 rounded-3xl p-5 sm:p-6 shadow-lg">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-[#e5b74b]" />
                  <h3 className="text-sm font-black text-white">Modify Receiving Bank Details</h3>
                </div>
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="text-[11px] text-emerald-300 hover:text-white flex items-center gap-1 font-bold cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Default</span>
                </button>
              </div>

              {saveSuccess && (
                <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Company corporate account details updated successfully!</span>
                </div>
              )}

              {saveError && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-400/40 rounded-2xl text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              <form onSubmit={handleSaveCompanyAccount} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    id="admin-bank-name"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. Zenith Bank"
                    list="bank-suggestions"
                    className="w-full px-4 py-3 bg-[#02180f] border border-emerald-500/40 rounded-2xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#e5b74b]"
                    required
                  />
                  <datalist id="bank-suggestions">
                    {COMMON_BANKS.map((b) => (
                      <option key={b} value={b} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">
                    Account Number (10 Digits)
                  </label>
                  <input
                    type="text"
                    id="admin-account-number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    maxLength={10}
                    placeholder="10-digit account number"
                    className="w-full px-4 py-3 bg-[#02180f] border border-emerald-500/40 rounded-2xl text-lg font-mono font-black text-[#ffd56b] focus:outline-none focus:ring-2 focus:ring-[#e5b74b]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">
                    Account Name
                  </label>
                  <input
                    type="text"
                    id="admin-account-name"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="e.g. QUICKPAY DIGITAL TECHNOLOGIES LTD"
                    className="w-full px-4 py-3 bg-[#02180f] border border-emerald-500/40 rounded-2xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#e5b74b]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-emerald-200 mb-1">
                      Sort Code / Branch
                    </label>
                    <input
                      type="text"
                      value={sortCode}
                      onChange={(e) => setSortCode(e.target.value)}
                      placeholder="e.g. 058152062"
                      className="w-full px-4 py-2.5 bg-[#02180f] border border-emerald-500/40 rounded-2xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#e5b74b]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-emerald-200 mb-1">
                      Narration Note
                    </label>
                    <input
                      type="text"
                      value={narrationNote}
                      onChange={(e) => setNarrationNote(e.target.value)}
                      placeholder="e.g. QuickPay Wallet Deposit"
                      className="w-full px-4 py-2.5 bg-[#02180f] border border-emerald-500/40 rounded-2xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#e5b74b]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="admin-save-company-account-btn"
                  className="w-full py-3.5 bg-[#e5b74b] hover:bg-[#d6a536] text-slate-950 text-sm font-black rounded-2xl transition cursor-pointer shadow-md mt-2"
                >
                  Save & Apply Company Account
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: USERS & DIRECT CREDIT */}
        {activeTab === 'users' && (
          <div className="space-y-4 animate-in fade-in">
            {creditSuccessMsg && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{creditSuccessMsg}</span>
              </div>
            )}

            <div className="bg-[#053221] border border-emerald-500/30 rounded-3xl p-5 shadow-lg">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#e5b74b]" />
                  <h3 className="text-sm font-black text-white">Registered Users</h3>
                </div>
                <span className="text-xs font-bold text-emerald-300">
                  {users.length} Registered
                </span>
              </div>

              <div className="space-y-3">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="bg-[#02180f] rounded-2xl p-4 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">{u.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.2 bg-emerald-500/20 text-emerald-300 rounded">
                          {u.id}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-300/70 mt-0.5">{u.email}</p>
                      {u.phone && <p className="text-[11px] text-emerald-400/60 mt-0.5">{u.phone}</p>}
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="text-xs font-bold text-[#ffd56b]">
                          Balance: {formatNaira(u.balance)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Password: <span className="font-mono text-white">{u.password}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedUserForCredit(u)}
                        className="px-3 py-1.5 bg-[#e5b74b] hover:bg-[#d6a536] text-slate-950 text-xs font-black rounded-xl transition cursor-pointer"
                      >
                        + Credit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleGenerateCodeForUser(u)}
                        className="px-3 py-1.5 bg-emerald-700/50 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        Gen Code
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Credit Modal */}
            {selectedUserForCredit && (
              <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                <div className="bg-[#053221] border border-emerald-500/40 rounded-3xl p-5 max-w-sm w-full text-white shadow-2xl">
                  <h4 className="text-sm font-black text-white mb-1">
                    Direct Credit: {selectedUserForCredit.name}
                  </h4>
                  <p className="text-xs text-emerald-300/70 mb-4">
                    Instantly add funds to this user's QuickPay balance.
                  </p>

                  <form onSubmit={handleDirectCredit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-emerald-200 mb-1">
                        Amount to Credit (₦)
                      </label>
                      <input
                        type="number"
                        min="100"
                        step="100"
                        value={creditAmount}
                        onChange={(e) => setCreditAmount(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#02180f] border border-emerald-500/40 rounded-xl text-lg font-black text-[#ffd56b]"
                        required
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedUserForCredit(null)}
                        className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-[#e5b74b] hover:bg-[#d6a536] text-slate-950 rounded-xl text-xs font-black cursor-pointer"
                      >
                        Confirm Credit
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: QUICK CODES */}
        {activeTab === 'quick-codes' && (
          <div className="space-y-5 animate-in fade-in">
            {codeGeneratedMsg && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{codeGeneratedMsg}</span>
              </div>
            )}

            {/* SECTION 1: QUICK CODE PURCHASE SUBMISSIONS */}
            <div className="bg-[#053221] border border-emerald-500/30 rounded-3xl p-5 shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#ffd56b]" />
                  <div>
                    <h3 className="text-sm font-black text-white">Quick Code Purchase Submissions</h3>
                    <p className="text-[10px] text-emerald-300/70">
                      Users paying ₦7,800 into company account for withdrawal authorization
                    </p>
                  </div>
                </div>

                {/* Filter pills */}
                <div className="flex items-center gap-1 bg-[#02180f] p-1 rounded-xl border border-emerald-500/20 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setQcFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition ${
                      qcFilter === 'all'
                        ? 'bg-[#e5b74b] text-slate-950 font-black shadow-xs'
                        : 'text-emerald-300/70 hover:text-white'
                    }`}
                  >
                    All ({quickCodeRequests.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setQcFilter('pending')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition flex items-center gap-1 ${
                      qcFilter === 'pending'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                        : 'text-emerald-300/70 hover:text-white'
                    }`}
                  >
                    <span>Pending</span>
                    {pendingQCCount > 0 && (
                      <span className="px-1.5 py-0.2 bg-red-600 text-white rounded-full text-[9px] font-black">
                        {pendingQCCount}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setQcFilter('approved')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition ${
                      qcFilter === 'approved'
                        ? 'bg-emerald-400 text-slate-950 font-black shadow-xs'
                        : 'text-emerald-300/70 hover:text-white'
                    }`}
                  >
                    Approved ({approvedQCCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setQcFilter('declined')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition ${
                      qcFilter === 'declined'
                        ? 'bg-red-500 text-white font-black shadow-xs'
                        : 'text-emerald-300/70 hover:text-white'
                    }`}
                  >
                    Declined ({declinedQCCount})
                  </button>
                </div>
              </div>

              {filteredQCRequests.length === 0 ? (
                <div className="text-center py-8 text-xs text-emerald-300/70">
                  {qcFilter === 'all'
                    ? 'No Quick Code purchase requests have been submitted yet.'
                    : `No ${qcFilter} Quick Code requests found.`}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredQCRequests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-[#02180f] rounded-2xl p-4 border border-emerald-500/20 hover:border-emerald-500/40 transition space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-black text-white">{req.userName}</h4>
                            <span className="text-[10px] text-emerald-300/60">({req.userEmail})</span>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                req.status === 'approved'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                                  : req.status === 'declined'
                                  ? 'bg-red-500/20 text-red-300 border border-red-400/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-400/30 animate-pulse'
                              }`}
                            >
                              {req.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-emerald-200/80">
                            <span className="font-bold text-[#ffd56b]">Price: {formatNaira(req.amount)}</span>
                            <span>•</span>
                            <span className="font-mono text-[10px] text-slate-300">Ref: {req.reference}</span>
                            <span>•</span>
                            <span className="text-[10px] text-emerald-400/60">
                              {new Date(req.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Thumbnail View Button */}
                        <button
                          type="button"
                          onClick={() => setViewingScreenshot(req.screenshotUrl)}
                          className="shrink-0 p-1 bg-black/40 rounded-xl border border-emerald-500/30 hover:border-[#ffd56b] transition cursor-pointer group flex items-center gap-1.5 px-2"
                        >
                          <img
                            src={req.screenshotUrl}
                            alt="Receipt thumbnail"
                            className="w-7 h-7 object-cover rounded-lg"
                          />
                          <span className="text-[10px] font-bold text-emerald-300 group-hover:text-white">
                            Inspect
                          </span>
                        </button>
                      </div>

                      {/* Display Issued Code or Decline Reason */}
                      {req.status === 'approved' && req.generatedCode && (
                        <div className="p-2.5 bg-emerald-950/60 rounded-xl border border-emerald-500/40 flex items-center justify-between text-xs">
                          <span className="text-emerald-200 text-[11px]">Issued One-Time Quick Code:</span>
                          <span className="font-mono font-black text-[#ffd56b] tracking-wider text-sm">
                            {req.generatedCode}
                          </span>
                        </div>
                      )}

                      {req.status === 'declined' && req.declineReason && (
                        <div className="p-2.5 bg-red-950/60 rounded-xl border border-red-500/40 text-[11px] text-red-200">
                          <span className="font-bold text-red-100">Decline Reason:</span> {req.declineReason}
                        </div>
                      )}

                      {/* Approval/Decline Actions for Pending */}
                      {req.status === 'pending' && (
                        <div className="flex items-center gap-2 pt-1 border-t border-emerald-500/20">
                          <button
                            type="button"
                            onClick={() => handleApproveQuickCode(req)}
                            className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-black transition cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve & Issue Quick Code</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenDeclineQCModal(req)}
                            className="py-2 px-4 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Decline</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 2: SYSTEM QUICK CODES & MANUAL GENERATOR */}
            <div className="bg-[#053221] border border-emerald-500/30 rounded-3xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#e5b74b]" />
                  <div>
                    <h3 className="text-sm font-black text-white">Active & Used Quick Codes</h3>
                    <p className="text-[10px] text-emerald-300/70">
                      Single-use codes for withdrawal authorization
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-300">
                  {allCodes.length} Generated
                </span>
              </div>

              {/* Manual Generator */}
              <div className="p-3.5 bg-[#02180f] rounded-2xl border border-emerald-500/20 space-y-2">
                <span className="text-xs font-bold text-white block">Generate Manual Code for User</span>
                <div className="flex items-center gap-2">
                  <select
                    id="admin-manual-qc-user-select"
                    onChange={(e) => {
                      const found = users.find((u) => u.id === e.target.value);
                      if (found) handleGenerateCodeForUser(found);
                      e.target.value = '';
                    }}
                    defaultValue=""
                    className="flex-1 px-3 py-2 bg-[#04291b] border border-emerald-500/30 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#e5b74b]"
                  >
                    <option value="" disabled>
                      Select user to generate one-time code...
                    </option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {allCodes.length === 0 ? (
                <div className="text-center py-6 text-xs text-emerald-300/70">
                  No Quick Codes generated across any users yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {allCodes.map((c, i) => (
                    <div
                      key={c.id || i}
                      className="bg-[#02180f] rounded-2xl p-3.5 border border-emerald-500/20 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black font-mono tracking-wider text-[#ffd56b]">
                            {c.code}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              c.status === 'unused'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                                : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                            }`}
                          >
                            {c.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[10px] text-emerald-300/70 mt-1">
                          Owner: {c.userName || 'User'} ({c.userEmail})
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-emerald-400/60 block">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                        {c.usedForTxRef && (
                          <span className="text-[9px] font-mono text-slate-400 block">
                            Used in: {c.usedForTxRef}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PROMO CODES (₦300,000, 1-HOUR EXPIRY, 1-TIME PER USER) */}
        {activeTab === 'promo-codes' && (
          <div className="space-y-4">
            {/* Promo Generator Card */}
            <div className="bg-[#053221] border border-amber-400/30 rounded-3xl p-5 shadow-xl relative overflow-hidden">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-lg">
                    <Gift className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                        ₦300,000 Promo Code Generator
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-black uppercase">
                        1-Hr Expiry
                      </span>
                    </div>
                    <p className="text-xs text-emerald-200/80 mt-0.5">
                      Generate promo codes granting ₦300,000. Codes expire 1 hour after generation and can only be used once per user.
                    </p>
                  </div>
                </div>
              </div>

              {/* Specs Pills */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-black/40 rounded-2xl border border-emerald-500/20 mb-4">
                <div className="text-center">
                  <span className="text-[10px] font-bold text-emerald-300 block uppercase">Reward Payout</span>
                  <span className="text-xs sm:text-sm font-black text-[#ffd56b]">₦300,000.00</span>
                </div>
                <div className="text-center border-x border-emerald-500/20">
                  <span className="text-[10px] font-bold text-emerald-300 block uppercase">Valid Duration</span>
                  <span className="text-xs sm:text-sm font-black text-emerald-300">Exactly 1 Hour</span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] font-bold text-emerald-300 block uppercase">Usage Limit</span>
                  <span className="text-xs sm:text-sm font-black text-white">1x Per User</span>
                </div>
              </div>

              {/* Generator Form */}
              <form onSubmit={handleGeneratePromoCode} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    id="admin-custom-promo-input"
                    value={customPromoInput}
                    onChange={(e) => setCustomPromoInput(e.target.value.toUpperCase())}
                    placeholder="Custom code (or leave blank to auto-generate)"
                    className="flex-1 px-4 py-3 bg-black/50 border border-emerald-500/30 rounded-2xl text-xs font-mono font-bold text-white placeholder:font-sans placeholder:text-emerald-300/40 focus:outline-none focus:ring-2 focus:ring-amber-400 uppercase"
                  />
                  <button
                    type="submit"
                    id="admin-generate-promo-btn"
                    className="px-5 py-3 bg-gradient-to-r from-amber-400 to-[#e5b74b] hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs rounded-2xl transition cursor-pointer shadow-lg flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generate ₦300,000 Code</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Promo Codes List */}
            <div className="bg-[#053221] border border-emerald-500/20 rounded-3xl p-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-500/20 mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#ffd56b]" />
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    Generated Promo Codes ({promoCodes.length})
                  </h4>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-emerald-500/20">
                  <button
                    type="button"
                    onClick={() => setPromoFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                      promoFilter === 'all'
                        ? 'bg-amber-400 text-slate-950'
                        : 'text-emerald-300/70 hover:text-white'
                    }`}
                  >
                    All ({promoCodes.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPromoFilter('active')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                      promoFilter === 'active'
                        ? 'bg-emerald-500 text-slate-950 font-black'
                        : 'text-emerald-300/70 hover:text-white'
                    }`}
                  >
                    Active ({promoCodes.filter((p) => p.isActive && new Date(p.expiresAt).getTime() > currentTime).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPromoFilter('expired')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                      promoFilter === 'expired'
                        ? 'bg-red-500 text-white font-black'
                        : 'text-emerald-300/70 hover:text-white'
                    }`}
                  >
                    Expired ({promoCodes.filter((p) => !p.isActive || new Date(p.expiresAt).getTime() <= currentTime).length})
                  </button>
                </div>
              </div>

              {promoCodes.length === 0 ? (
                <div className="text-center py-10 bg-black/20 rounded-2xl border border-emerald-500/10">
                  <Gift className="w-10 h-10 text-emerald-400/40 mx-auto mb-2" />
                  <p className="text-xs font-bold text-white">No Promo Codes Generated Yet</p>
                  <p className="text-[11px] text-emerald-300/60 mt-1">
                    Generate promo codes above to credit ₦300,000 to user wallets.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {promoCodes
                    .filter((p) => {
                      const isExpired = !p.isActive || new Date(p.expiresAt).getTime() <= currentTime;
                      if (promoFilter === 'active') return !isExpired;
                      if (promoFilter === 'expired') return isExpired;
                      return true;
                    })
                    .map((p) => {
                      const isExpired = !p.isActive || new Date(p.expiresAt).getTime() <= currentTime;
                      const timeStr = formatTimeRemaining(p.expiresAt);
                      const isExpanded = expandedPromoId === p.id;

                      return (
                        <div
                          key={p.id}
                          className={`p-4 rounded-2xl border transition ${
                            !isExpired
                              ? 'bg-black/40 border-emerald-500/40'
                              : 'bg-black/20 border-slate-700/50 opacity-80'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-base font-black font-mono tracking-wider text-[#ffd56b] bg-black/60 px-3 py-1 rounded-xl border border-amber-400/30">
                                  {p.code}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyPromo(p.code)}
                                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                                  title="Copy Code"
                                >
                                  {copiedPromoCode === p.code ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                      <span className="text-emerald-400">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                                {!isExpired ? (
                                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-black flex items-center gap-1">
                                    <Timer className="w-3 h-3 text-emerald-400" />
                                    <span>{timeStr}</span>
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-black flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-red-400" />
                                    <span>Expired</span>
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-emerald-200/80">
                                <span>
                                  Reward: <strong className="text-white">₦300,000</strong>
                                </span>
                                <span>•</span>
                                <span>
                                  Created:{' '}
                                  <strong className="text-white">
                                    {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </strong>
                                </span>
                                <span>•</span>
                                <span>
                                  Expires:{' '}
                                  <strong className={isExpired ? 'text-red-400' : 'text-amber-300'}>
                                    {new Date(p.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </strong>
                                </span>
                                <span>•</span>
                                <span>
                                  Redemptions:{' '}
                                  <strong className="text-emerald-300 font-bold">
                                    {p.redeemedBy.length} user{p.redeemedBy.length === 1 ? '' : 's'} (1x each)
                                  </strong>
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center">
                              {p.redeemedBy.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setExpandedPromoId(isExpanded ? null : p.id)}
                                  className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-emerald-200 transition cursor-pointer flex items-center gap-1"
                                >
                                  <span>{isExpanded ? 'Hide Users' : `Users (${p.redeemedBy.length})`}</span>
                                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeletePromoCode(p.id, p.code)}
                                className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition cursor-pointer"
                                title="Delete promo code"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Expanded list of users who redeemed */}
                          {isExpanded && p.redeemedBy.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-emerald-500/20 bg-black/40 rounded-xl p-3">
                              <h5 className="text-[10px] font-black text-emerald-300 uppercase tracking-wider mb-2">
                                Users who redeemed {p.code} (Single-use per user)
                              </h5>
                              <div className="space-y-1.5">
                                {p.redeemedBy.map((r, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-white/5"
                                  >
                                    <div>
                                      <span className="font-bold text-white">{r.userName}</span>
                                      <span className="text-[10px] text-emerald-300/70 ml-2">({r.userEmail})</span>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-[10px] text-emerald-400 font-mono">
                                        +₦300,000 on {new Date(r.redeemedAt).toLocaleDateString()} {new Date(r.redeemedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* FULL-SIZE SCREENSHOT LIGHTBOX */}
      {viewingScreenshot && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#053221] border border-emerald-500/40 rounded-3xl max-w-xl w-full p-4 overflow-hidden shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20 mb-3">
              <span className="text-xs font-bold text-emerald-200">
                Payment Proof Inspection (Admin Lightbox)
              </span>
              <button
                type="button"
                onClick={() => setViewingScreenshot(null)}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto flex items-center justify-center bg-black/60 rounded-2xl p-2">
              <img
                src={viewingScreenshot}
                alt="Enlarged Payment Screenshot"
                className="max-h-[70vh] object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* DECLINE REASON MODAL */}
      {decliningReq && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#053221] border border-red-500/40 rounded-3xl max-w-md w-full p-5 text-white shadow-2xl">
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <AlertCircle className="w-5 h-5" />
              <h4 className="text-sm font-black text-white">Decline Deposit Submission</h4>
            </div>

            <p className="text-xs text-emerald-200/80 mb-3 leading-relaxed">
              Decline ₦{decliningReq.amount.toLocaleString()} deposit submitted by{' '}
              <strong className="text-white">{decliningReq.userName}</strong>. Select or write a reason so the user knows why it was not approved:
            </p>

            <form onSubmit={handleConfirmDecline} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-1.5">
                  Select Preset Reason
                </label>
                <div className="space-y-1.5">
                  {DECLINE_REASONS.map((r) => (
                    <label
                      key={r}
                      className={`flex items-center gap-2 p-2 rounded-xl text-xs cursor-pointer transition ${
                        selectedDeclineReason === r
                          ? 'bg-red-500/20 border border-red-400 text-white font-semibold'
                          : 'bg-[#02180f] border border-emerald-500/20 text-emerald-200/80 hover:text-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="declineReason"
                        value={r}
                        checked={selectedDeclineReason === r}
                        onChange={() => setSelectedDeclineReason(r)}
                        className="accent-red-500"
                      />
                      <span>{r}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-1">
                  Custom Notes (Optional)
                </label>
                <input
                  type="text"
                  value={customDeclineReason}
                  onChange={(e) => setCustomDeclineReason(e.target.value)}
                  placeholder="Or enter a specific explanation..."
                  className="w-full px-3 py-2 bg-[#02180f] border border-emerald-500/30 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDecliningReq(null)}
                  className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-md"
                >
                  Confirm Decline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK CODE DECLINE REASON MODAL */}
      {decliningQuickCodeReq && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#053221] border border-red-500/40 rounded-3xl max-w-md w-full p-5 text-white shadow-2xl">
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <AlertCircle className="w-5 h-5" />
              <h4 className="text-sm font-black text-white">Decline Quick Code Purchase</h4>
            </div>

            <p className="text-xs text-emerald-200/80 mb-3 leading-relaxed">
              Decline Quick Code purchase proof (₦{decliningQuickCodeReq.amount.toLocaleString()}) submitted by{' '}
              <strong className="text-white">{decliningQuickCodeReq.userName}</strong>. The user will receive an
              immediate popup notifying them that their payment for quick code failed and they should make the requested
              payment of ₦7,800 to make a withdrawal:
            </p>

            <form onSubmit={handleConfirmDeclineQC} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-1.5">
                  Select Preset Reason
                </label>
                <div className="space-y-1.5">
                  {[
                    'Payment could not be verified on the company account',
                    'Incorrect transfer amount (must be exactly ₦7,800)',
                    'Screenshot/receipt illegible or unconfirmed',
                    'Duplicate receipt submission',
                  ].map((r) => (
                    <label
                      key={r}
                      className={`flex items-center gap-2 p-2 rounded-xl text-xs cursor-pointer transition ${
                        selectedQCDeclineReason === r
                          ? 'bg-red-500/20 border border-red-400 text-white font-semibold'
                          : 'bg-[#02180f] border border-emerald-500/20 text-emerald-200/80 hover:text-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="qcDeclineReason"
                        value={r}
                        checked={selectedQCDeclineReason === r}
                        onChange={() => setSelectedQCDeclineReason(r)}
                        className="accent-red-500"
                      />
                      <span>{r}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-1">
                  Custom Notes (Optional)
                </label>
                <input
                  type="text"
                  value={customQCDeclineReason}
                  onChange={(e) => setCustomQCDeclineReason(e.target.value)}
                  placeholder="Or enter custom reason..."
                  className="w-full px-3 py-2 bg-[#02180f] border border-emerald-500/30 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDecliningQuickCodeReq(null)}
                  className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-md"
                >
                  Confirm Decline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
