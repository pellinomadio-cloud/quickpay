import React, { useState } from 'react';
import { User } from '../types';
import { getStoredUsers, saveUser, setCurrentUserId } from '../data/storage';
import { Lock, Mail, User as UserIcon, Phone, Eye, EyeOff, AlertCircle } from 'lucide-react';
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
          setError('Please enter a valid mobile phone number.');
          setLoading(false);
          return;
        }

        if (confirmPassword && confirmPassword !== password) {
          setError('Passwords do not match.');
          setLoading(false);
          return;
        }

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
    }, 350);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50 text-slate-900">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600 text-white shadow-sm mb-3 overflow-hidden">
            <img
              src={logoImg}
              alt="QuickPay"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            QuickPay
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {mode === 'register'
              ? 'Create your QuickPay wallet account'
              : 'Sign in to access your wallet'}
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl mb-5">
            <button
              type="button"
              id="auth-tab-register"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
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
              className={`py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    id="register-fullname"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    required={mode === 'register'}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
                  />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="tel"
                    id="register-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 08012345678"
                    required={mode === 'register'}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="email"
                  id="auth-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-700">
                  6-Digit Password
                </label>
                <span className="text-[11px] text-slate-400 font-mono">Numbers only</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="auth-password"
                  maxLength={6}
                  inputMode="numeric"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-mono tracking-widest placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Confirm 6-Digit Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="register-confirm-password"
                    maxLength={6}
                    inputMode="numeric"
                    value={confirmPassword}
                    onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                    placeholder="••••••"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-mono tracking-widest placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              id="auth-submit-btn"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium rounded-xl text-sm transition cursor-pointer disabled:opacity-60 shadow-xs"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </span>
              ) : mode === 'register' ? (
                'Create Account'
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {onClose && (
            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Cancel and return
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
