import React, { useState } from 'react';
import { User } from '../types';
import { getStoredUsers, saveUser, setCurrentUserId } from '../data/storage';
import { signInWithGoogle } from '../firebase';
import { Lock, Mail, User as UserIcon, Phone, Eye, EyeOff, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import logoImg from '../assets/images/quickpay_gold_logo_1789754815185.jpg';

interface AuthPageProps {
  onSuccess: (user: User) => void;
  initialMode?: 'register' | 'login';
  onClose?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess, initialMode = 'register', onClose }) => {
  const [mode, setMode] = useState<'register' | 'login'>(initialMode);
  
  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const user = await signInWithGoogle();
      saveUser(user);
      setCurrentUserId(user.id);
      onSuccess(user);
    } catch (err: unknown) {
      console.error('Google sign in error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('popup-closed-by-user')) {
        setError('Google sign-in was closed before completing.');
      } else {
        setError(msg || 'Failed to authenticate with Google. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // Validate 6-digit numeric password
  const handlePasswordChange = (val: string) => {
    const numeric = val.replace(/\D/g, '').slice(0, 6);
    setPassword(numeric);
    if (error) setError(null);
  };

  const handleConfirmPasswordChange = (val: string) => {
    const numeric = val.replace(/\D/g, '').slice(0, 6);
    setConfirmPassword(numeric);
    if (error) setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length !== 6 || !/^\d{6}$/.test(password)) {
      setError('Password must be exactly 6 numeric digits.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const users = getStoredUsers();

      if (mode === 'register') {
        const cleanName = name.trim();
        if (!cleanName || cleanName.length < 2) {
          setError('Please enter your full legal name.');
          setLoading(false);
          return;
        }

        const cleanPhone = phone.trim().replace(/\s+/g, '');
        if (!cleanPhone || cleanPhone.length < 10) {
          setError('Please enter a valid Nigerian mobile phone number.');
          setLoading(false);
          return;
        }

        if (confirmPassword && confirmPassword !== password) {
          setError('Passwords do not match.');
          setLoading(false);
          return;
        }

        // Check if email already registered
        const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
        if (existing) {
          setError('An account with this email is already registered. Please sign in.');
          setLoading(false);
          return;
        }

        const newUser: User = {
          id: `user_${Date.now()}`,
          name: cleanName,
          email: cleanEmail,
          password: password,
          phone: cleanPhone,
          balance: 0.0,
          createdAt: new Date().toISOString(),
        };

        saveUser(newUser);
        setCurrentUserId(newUser.id);
        setLoading(false);
        onSuccess(newUser);
      } else {
        // Sign in mode - strictly verify registered credentials
        const found = users.find((u) => u.email.toLowerCase() === cleanEmail);
        if (!found) {
          setError('No registered account found with this email. Please register first.');
          setLoading(false);
          return;
        }

        if (found.password !== password) {
          setError('Incorrect 6-digit password. Please try again.');
          setLoading(false);
          return;
        }

        setCurrentUserId(found.id);
        setLoading(false);
        onSuccess(found);
      }
    }, 450);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-[#032e1e] via-[#05432a] to-[#022115] relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 -right-24 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* SVG golden ribbons */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox="0 0 1000 1000"
      >
        <path
          d="M0,200 C300,100 700,350 1000,220 L1000,300 C700,430 300,180 0,280 Z"
          fill="url(#goldGradAuth)"
        />
        <path
          d="M0,600 C400,450 600,750 1000,620 L1000,680 C600,810 400,510 0,660 Z"
          fill="url(#goldGradAuth2)"
        />
        <defs>
          <linearGradient id="goldGradAuth" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#ffd269" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#b45309" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="goldGradAuth2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d97706" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
          </linearGradient>
        </defs>
      </svg>

      <div className="w-full max-w-md relative z-10">
        {/* Top Branding Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-1 rounded-full bg-gradient-to-tr from-[#e5b74b] via-[#ffd56b] to-[#b38328] shadow-lg shadow-black/30 mb-3">
            <img
              src={logoImg}
              alt="QuickPay Emblem"
              className="w-16 h-16 rounded-full object-cover border-2 border-emerald-950"
            />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-1.5">
            Quick<span className="text-[#f6c344]">Pay</span>
          </h1>
          <p className="text-emerald-200/80 text-sm mt-1">
            {mode === 'register'
              ? 'Register your official QuickPay wallet account'
              : 'Sign in with your registered account'}
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-[#063b25]/90 backdrop-blur-xl border border-emerald-500/25 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50 text-white">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 bg-[#022115]/80 p-1 rounded-2xl mb-5 border border-emerald-500/20">
            <button
              type="button"
              id="auth-tab-register"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`py-2.5 text-xs font-extrabold rounded-xl transition cursor-pointer ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-[#e5b74b] to-[#c99527] text-slate-950 shadow-md'
                  : 'text-emerald-200/70 hover:text-white'
              }`}
            >
              Register
            </button>
            <button
              type="button"
              id="auth-tab-login"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`py-2.5 text-xs font-extrabold rounded-xl transition cursor-pointer ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-[#e5b74b] to-[#c99527] text-slate-950 shadow-md'
                  : 'text-emerald-200/70 hover:text-white'
              }`}
            >
              Sign In
            </button>
          </div>

          {/* Google Sign-in Option */}
          <button
            type="button"
            id="google-auth-btn"
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading}
            className="w-full py-3 px-4 bg-white hover:bg-slate-100 active:scale-[0.99] text-slate-900 font-bold rounded-xl shadow-md flex items-center justify-center gap-2.5 text-sm transition cursor-pointer disabled:opacity-60 mb-5 border border-emerald-500/20"
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span className="font-extrabold text-[#4285F4] text-base leading-none">G</span>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <div className="relative flex py-1 items-center mb-5">
            <div className="flex-grow border-t border-emerald-500/20"></div>
            <span className="flex-shrink mx-3 text-[10px] font-semibold text-emerald-300/60 uppercase tracking-wider">
              Or use 6-digit PIN
            </span>
            <div className="flex-grow border-t border-emerald-500/20"></div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-xs text-red-200 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name (Register mode only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-emerald-200/90 mb-1.5">
                  Full Legal Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-emerald-400/60 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    id="register-fullname"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-11 pr-4 py-3 bg-[#032819] border border-emerald-600/40 rounded-xl text-white placeholder-emerald-400/40 focus:outline-none focus:ring-2 focus:ring-[#e5b74b] focus:border-transparent text-sm transition"
                    required
                  />
                </div>
              </div>
            )}

            {/* Phone Number (Register mode only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-emerald-200/90 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-emerald-400/60 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="tel"
                    id="register-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 08012345678"
                    className="w-full pl-11 pr-4 py-3 bg-[#032819] border border-emerald-600/40 rounded-xl text-white placeholder-emerald-400/40 focus:outline-none focus:ring-2 focus:ring-[#e5b74b] focus:border-transparent text-sm transition"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-emerald-200/90 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-emerald-400/60 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="email"
                  id="auth-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-[#032819] border border-emerald-600/40 rounded-xl text-white placeholder-emerald-400/40 focus:outline-none focus:ring-2 focus:ring-[#e5b74b] focus:border-transparent text-sm transition"
                  required
                />
              </div>
            </div>

            {/* 6-digit Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-emerald-200/90">
                  6-Digit Password / PIN
                </label>
                <span className="text-[10px] text-[#ffd778]">6 numbers only</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-emerald-400/60 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="auth-password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="•••••• (6 numbers)"
                  className="w-full pl-11 pr-11 py-3 bg-[#032819] border border-emerald-600/40 rounded-xl text-white tracking-widest placeholder:tracking-normal placeholder-emerald-400/40 focus:outline-none focus:ring-2 focus:ring-[#e5b74b] focus:border-transparent text-sm transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 text-emerald-300/70 hover:text-white absolute right-3 top-2.5 transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Register mode only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-emerald-200/90 mb-1.5">
                  Confirm 6-Digit Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-emerald-400/60 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="register-confirm-password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={confirmPassword}
                    onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                    placeholder="•••••• Re-enter 6 numbers"
                    className="w-full pl-11 pr-4 py-3 bg-[#032819] border border-emerald-600/40 rounded-xl text-white tracking-widest placeholder:tracking-normal placeholder-emerald-400/40 focus:outline-none focus:ring-2 focus:ring-[#e5b74b] focus:border-transparent text-sm transition"
                    required
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              id="auth-submit-btn"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-[#e5b74b] via-[#f7cb59] to-[#d69f2e] hover:brightness-105 active:scale-[0.99] text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 text-base transition duration-150 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'register' ? 'Complete Registration' : 'Sign In to Wallet'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-emerald-300/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#e5b74b]" />
            <span>256-bit Bank Grade Security & NDIC Regulated</span>
          </div>
        </div>

        {onClose && (
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-emerald-300/70 hover:text-white underline underline-offset-4"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
