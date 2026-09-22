import React, { useState } from 'react';
import { User } from '../types';
import { saveUser, formatNaira, QUICKPAY_COMPANY_ACCOUNT } from '../data/storage';
import {
  ArrowLeft,
  User as UserIcon,
  Mail,
  Phone,
  ShieldCheck,
  Building2,
  KeyRound,
  LogOut,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Eye,
  EyeOff,
  Copy,
  Check,
} from 'lucide-react';
import logoImg from '../assets/images/quickpay_gold_logo_1789754815185.jpg';

interface ProfileViewProps {
  user: User;
  onLogout: () => void;
  onSwitchToRegister: () => void;
  onUserUpdated: (user: User) => void;
  onBackToHome?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onLogout,
  onSwitchToRegister,
  onUserUpdated,
  onBackToHome,
}) => {
  const [showPinModal, setShowPinModal] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSuccess, setPinSuccess] = useState(false);
  const [copiedCompanyAccount, setCopiedCompanyAccount] = useState(false);

  const handleCopyCompanyAccount = () => {
    navigator.clipboard?.writeText?.(QUICKPAY_COMPANY_ACCOUNT.accountNumber);
    setCopiedCompanyAccount(true);
    setTimeout(() => setCopiedCompanyAccount(false), 2000);
  };

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);

    if (oldPin !== user.password) {
      setPinError('Current 6-digit password does not match.');
      return;
    }

    if (newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
      setPinError('New password must be exactly 6 numeric digits.');
      return;
    }

    if (newPin !== confirmPin) {
      setPinError('New passwords do not match.');
      return;
    }

    const updated = { ...user, password: newPin };
    saveUser(updated);
    onUserUpdated(updated);
    setPinSuccess(true);
    setTimeout(() => {
      setShowPinModal(false);
      setPinSuccess(false);
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
    }, 1200);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col pb-28 text-slate-900">
      {/* Top Header */}
      {onBackToHome && (
        <header className="bg-white border-b border-slate-200 text-slate-900 sticky top-0 z-30">
          <div className="px-4 sm:px-6 py-3.5 flex items-center justify-between max-w-xl mx-auto">
            <button
              type="button"
              id="profile-page-back-btn"
              onClick={onBackToHome}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="text-center">
              <h1 className="text-sm font-bold text-slate-900">Profile & Security</h1>
            </div>

            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 bg-emerald-700">
              <img src={logoImg} alt="QuickPay" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>
      )}

      <div className="w-full max-w-xl mx-auto px-4 sm:px-6 pt-4 space-y-4">
        {/* Profile Card Header */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-200 bg-emerald-700 shrink-0">
              <img src={logoImg} alt="QuickPay" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 truncate">{user.name}</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded-md shrink-0">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 truncate">{user.email}</p>
              <p className="text-xs font-semibold text-emerald-700 mt-1">
                Balance: {formatNaira(user.balance)}
              </p>
            </div>
          </div>
        </div>

        {/* Account Info Details */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs mb-4 space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Personal Information
          </h4>

          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <div className="flex items-center gap-2.5 text-slate-600">
              <UserIcon className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-medium">Full Name</span>
            </div>
            <span className="text-xs font-bold text-slate-900">{user.name}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <div className="flex items-center gap-2.5 text-slate-600">
              <Mail className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-medium">Email Address</span>
            </div>
            <span className="text-xs font-bold text-slate-900">{user.email}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <div className="flex items-center gap-2.5 text-slate-600">
              <Phone className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-medium">Phone Number</span>
            </div>
            <span className="text-xs font-bold text-slate-900">{user.phone}</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2.5 text-slate-600">
              <KeyRound className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-medium">6-Digit Password</span>
            </div>
            <button
              type="button"
              onClick={() => setShowPinModal(true)}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-900 underline cursor-pointer"
            >
              Change Password
            </button>
          </div>
        </div>

        {/* Company Receiving Account Card */}
        <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-200/80 shadow-xs mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#064e32]" />
              <h4 className="text-xs font-bold text-[#064e32] uppercase tracking-wider">
                QuickPay Corporate Account
              </h4>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              For All Deposits
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mb-2">
            Users do not have personal account numbers. For deposits or payments, transfer to:
          </p>
          <div className="bg-white p-3 rounded-xl border border-emerald-200 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">
                {QUICKPAY_COMPANY_ACCOUNT.bankName} • {QUICKPAY_COMPANY_ACCOUNT.accountName}
              </p>
              <p className="text-base font-black text-slate-950 font-mono">
                {QUICKPAY_COMPANY_ACCOUNT.accountNumber}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyCompanyAccount}
              className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              {copiedCompanyAccount ? (
                <Check className="w-3.5 h-3.5 text-emerald-700" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Account Actions */}
        <div className="space-y-2.5">
          <button
            type="button"
            id="profile-switch-register-btn"
            onClick={onSwitchToRegister}
            className="w-full p-3.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-slate-800 text-xs font-bold transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <UserPlus className="w-4 h-4 text-emerald-700" />
              <span>Register a New QuickPay Account</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            type="button"
            id="profile-logout-btn"
            onClick={onLogout}
            className="w-full p-3.5 bg-red-50 hover:bg-red-100 border border-red-200/80 rounded-2xl flex items-center justify-center gap-2 text-red-700 text-xs font-bold transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out of QuickPay</span>
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-extrabold text-slate-900 mb-1">
              Change 6-Digit Password
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter your current password and create a new 6-digit numeric password.
            </p>

            {pinError && (
              <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            {pinSuccess && (
              <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Password updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleUpdatePin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current 6-Digit Password
                </label>
                <input
                  type="password"
                  maxLength={6}
                  inputMode="numeric"
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#064e32]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New 6-Digit Password
                </label>
                <input
                  type="password"
                  maxLength={6}
                  inputMode="numeric"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#064e32]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  maxLength={6}
                  inputMode="numeric"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#064e32]"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#064e32] text-white text-xs font-bold rounded-xl hover:bg-emerald-900 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
