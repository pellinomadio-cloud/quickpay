import React from 'react';
import { ActivePage } from '../types';
import {
  ArrowLeft,
  MessageSquare,
  Globe,
  Smartphone,
  Gift,
  Tv,
  Zap,
  Gamepad2,
  CreditCard,
  Building2,
  Shield,
  Plane,
  Coins,
  ArrowDownLeft,
  KeyRound,
} from 'lucide-react';
import logoImg from '../assets/images/quickpay_gold_logo_1789754815185.jpg';

interface ServicesViewProps {
  onNavigate: (page: ActivePage) => void;
  onBackToHome: () => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({
  onNavigate,
  onBackToHome,
}) => {
  const telecomServices = [
    { id: 'quick-code', label: 'Quick Code', icon: KeyRound, action: 'quick-code' as const, hot: true },
    { id: 'earn', label: 'Earn Rewards', icon: Coins, action: 'earn' as const, hot: true },
    { id: 'withdraw', label: 'Withdraw', icon: ArrowDownLeft, action: 'withdraw' as const, hot: false },
    { id: 'data', label: 'Buy Data', icon: Globe, action: 'data' as const, hot: false },
    { id: 'airtime', label: 'Buy Airtime', icon: Smartphone, action: 'airtime' as const, hot: false },
    { id: 'fund', label: 'Fund Wallet', icon: Building2, action: 'fund' as const, hot: false },
    { id: 'message', label: 'Support Chat', icon: MessageSquare, action: 'message' as const, hot: false },
    { id: 'promo', label: 'Promos', icon: Gift, action: 'promo' as const, hot: false },
  ];

  const utilityServices = [
    { id: 'service-electricity-btn', label: 'Electricity Bills', icon: Zap, sub: 'IKEDC, EKEDC, AEDC', action: 'data' as const },
    { id: 'service-cable-tv-btn', label: 'Cable TV Sub', icon: Tv, sub: 'DStv, GOtv, Startimes', action: 'airtime' as const },
    { id: 'service-betting-btn', label: 'Betting Wallet', icon: Gamepad2, sub: 'SportyBet, Bet9ja', action: 'transfer' as const },
    { id: 'service-virtual-card-btn', label: 'Virtual USD Card', icon: CreditCard, sub: 'Online Shopping', action: 'fund' as const },
    { id: 'service-flight-btn', label: 'Flight Booking', icon: Plane, sub: 'Local & International', action: 'transfer' as const },
    { id: 'service-crypto-wallet-swap-btn', label: 'Crypto & Wallet Swap', icon: Coins, sub: 'Instant OTC & Wallet Swap', action: 'admin-login' as const },
  ];

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] dark:bg-[#03140d] text-slate-900 dark:text-white flex flex-col pb-24 transition-colors duration-200">
      {/* Top Application Header Bar */}
      <header className="bg-gradient-to-r from-[#022818] via-[#044329] to-[#022818] dark:from-[#011a10] dark:via-[#022a1a] dark:to-[#01180e] text-white sticky top-0 z-30 shadow-md">
        <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            id="services-page-back-btn"
            onClick={onBackToHome}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="text-center">
            <h1 className="text-base font-extrabold tracking-tight text-white">All Services</h1>
            <p className="text-[10px] text-emerald-200/90 font-medium">QuickPay Hub</p>
          </div>

          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#e5b74b] p-0.5">
            <img src={logoImg} alt="QuickPay" className="w-full h-full object-cover rounded-full" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 sm:px-6 pt-5">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-[#033421] to-[#054b30] dark:from-[#022215] dark:to-[#033320] rounded-3xl p-5 text-white mb-6 shadow-md border border-emerald-500/20 dark:border-emerald-500/30">
          <h3 className="text-lg font-extrabold tracking-tight">QuickPay Financial Services</h3>
          <p className="text-xs text-emerald-200/80 mt-1">
            Tap any service to open its dedicated processing page with instant settlement.
          </p>
        </div>

        {/* Core Telecom Services */}
        <div className="mb-6">
          <h4 className="text-xs font-extrabold text-slate-800 dark:text-emerald-200 uppercase tracking-wider mb-3">
            Telecom & Banking Pages
          </h4>
          <div className="grid grid-cols-3 gap-2.5">
            {telecomServices.map((srv) => {
              const Icon = srv.icon;
              return (
                <button
                  key={srv.id}
                  type="button"
                  onClick={() => onNavigate(srv.action)}
                  className="relative p-3.5 rounded-2xl bg-white dark:bg-[#062417] hover:bg-emerald-50/50 dark:hover:bg-[#0a3522] border border-slate-200 dark:border-emerald-800/40 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition text-center flex flex-col items-center justify-center gap-1.5 group cursor-pointer shadow-2xs"
                >
                  {srv.hot && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-red-600 text-white text-[8px] font-black rounded-full shadow-xs">
                      HOT
                    </span>
                  )}
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-[#0a3a25] border border-emerald-100 dark:border-emerald-700/50 flex items-center justify-center group-hover:scale-105 transition">
                    <Icon className="w-5 h-5 text-[#064e32] dark:text-emerald-300" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-emerald-100">{srv.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Utility Bills */}
        <div>
          <h4 className="text-xs font-extrabold text-slate-800 dark:text-emerald-200 uppercase tracking-wider mb-3">
            Bills & Digital Subscriptions
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {utilityServices.map((u, i) => {
              const Icon = u.icon;
              return (
                <button
                  key={i}
                  type="button"
                  id={u.id || `service-util-${i}`}
                  onClick={() => onNavigate(u.action)}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#062417] border border-slate-200 dark:border-emerald-800/40 hover:border-emerald-300 dark:hover:border-emerald-500/50 hover:bg-emerald-50/30 dark:hover:bg-[#0a3522] transition flex items-center gap-3 cursor-pointer text-left shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-[#093522] border border-slate-100 dark:border-emerald-700/40 text-slate-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#064e32] dark:text-emerald-300" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">{u.label}</h5>
                    <p className="text-[11px] text-slate-500 dark:text-emerald-200/60 truncate">{u.sub}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};
