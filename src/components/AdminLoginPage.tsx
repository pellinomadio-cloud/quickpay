import React, { useState } from 'react';
import { ADMIN_ACCESS_CODE } from '../data/storage';
import { ArrowLeft, ShieldCheck, Lock, Eye, EyeOff, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';
import logoImg from '../assets/images/quickpay_gold_logo_1789754815185.jpg';

interface AdminLoginPageProps {
  onSuccess: () => void;
  onBack: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onSuccess, onBack }) => {
  const [adminCode, setAdminCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCodeChange = (val: string) => {
    setAdminCode(val);
    if (error) setError(null);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const clean = adminCode.trim().toUpperCase();
    if (!clean) {
      setError('Please enter the administrative access code.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      if (clean === ADMIN_ACCESS_CODE) {
        setLoading(false);
        onSuccess();
      } else {
        setLoading(false);
        setError('Invalid administrative access code. Access restricted.');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#021f14] via-[#043422] to-[#01140c] text-white flex flex-col relative overflow-hidden">
      {/* Top Header */}
      <header className="px-4 sm:px-6 py-4 flex items-center justify-between z-20 border-b border-emerald-500/20 bg-black/20 backdrop-blur-md">
        <button
          type="button"
          id="admin-login-back-btn"
          onClick={onBack}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit</span>
        </button>

        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#e5b74b]" />
          <span className="text-xs font-mono font-bold tracking-wider text-emerald-200">
            SYSTEM ADMIN GATEWAY
          </span>
        </div>

        <div className="w-8 h-8 rounded-full overflow-hidden border border-[#e5b74b] p-0.5">
          <img src={logoImg} alt="QuickPay" className="w-full h-full object-cover rounded-full" />
        </div>
      </header>

      {/* Decorative ambient elements */}
      <div className="absolute top-20 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-80 h-80 bg-[#e5b74b]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-md">
          {/* Top Emblem & Title */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center p-3 rounded-3xl bg-gradient-to-tr from-[#e5b74b] to-[#b38328] shadow-lg shadow-black/40 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center">
                <KeyRound className="w-6 h-6 text-[#ffd56b]" />
              </div>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Admin Authentication
            </h2>
            <p className="text-xs text-emerald-300/80 mt-1 max-w-xs mx-auto">
              Crypto & Wallet Swap Administrative Console. Enter the designated access code to proceed.
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-[#052d1d]/90 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/60">
            {error && (
              <div className="mb-4 p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-xs text-red-200 flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-extrabold text-emerald-200 tracking-wide">
                    Admin Access Code
                  </label>
                  <span className="text-[10px] text-emerald-400/70 font-mono">Restricted</span>
                </div>

                <div className="relative">
                  <Lock className="w-4 h-4 text-emerald-400/60 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type={showCode ? 'text' : 'password'}
                    id="admin-access-code-input"
                    value={adminCode}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    placeholder="Enter security access code"
                    className="w-full pl-11 pr-11 py-3 bg-[#02180f] border border-emerald-600/40 rounded-xl text-white font-mono tracking-widest placeholder:tracking-normal placeholder-emerald-400/40 focus:outline-none focus:ring-2 focus:ring-[#e5b74b] focus:border-transparent text-sm transition"
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCode(!showCode)}
                    className="p-1.5 text-emerald-300/70 hover:text-white absolute right-3 top-2.5 transition cursor-pointer"
                  >
                    {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#02180f]/80 border border-emerald-600/20 text-[11px] text-emerald-300/80 leading-relaxed">
                Notice: Administrative access is restricted to verified management personnel with master authorization credentials.
              </div>

              <button
                type="submit"
                id="admin-login-submit-btn"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-[#e5b74b] via-[#f7cb59] to-[#d69f2e] hover:brightness-105 active:scale-[0.99] text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 text-sm transition duration-150 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Unlock Admin Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};
