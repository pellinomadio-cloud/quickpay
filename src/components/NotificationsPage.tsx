import React from 'react';
import {
  ArrowLeft,
  Bell,
  CheckCheck,
  ShieldCheck,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import logoImg from '../assets/images/quickpay_gold_logo_1789754815185.jpg';

interface NotificationsPageProps {
  onBack: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  iconType: 'credit' | 'security' | 'promo' | 'system';
  unread: boolean;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onBack }) => {
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([
    {
      id: 'n1',
      title: 'Virtual Account Ready',
      body: 'Your dedicated virtual bank account is active. You can receive deposits 24/7 with zero fees.',
      time: '10 mins ago',
      iconType: 'security',
      unread: true,
    },
    {
      id: 'n2',
      title: 'Withdrawal Feature Activated',
      body: 'You can now withdraw money straight to any Nigerian commercial or microfinance bank in seconds.',
      time: '1 hour ago',
      iconType: 'credit',
      unread: true,
    },
    {
      id: 'n3',
      title: 'Weekend Cashback Deal',
      body: 'Earn 2% instant cashback discount on all MTN, Airtel, Glo, and 9mobile airtime purchases.',
      time: 'Yesterday',
      iconType: 'promo',
      unread: false,
    },
    {
      id: 'n4',
      title: 'Security Alert: Password Set',
      body: 'Your 6-digit transaction password is registered. Keep your 6-digit passcode confidential.',
      time: '2 days ago',
      iconType: 'system',
      unread: false,
    },
  ]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] dark:bg-[#03140d] text-slate-900 dark:text-white flex flex-col pb-24 transition-colors duration-200">
      {/* Top Header */}
      <header className="bg-gradient-to-r from-[#022818] via-[#044329] to-[#022818] dark:from-[#011a10] dark:via-[#022a1a] dark:to-[#01180e] text-white sticky top-0 z-30 shadow-md">
        <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            id="notifications-page-back-btn"
            onClick={onBack}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="text-center">
            <h1 className="text-base font-extrabold tracking-tight text-white">Notifications</h1>
            <p className="text-[10px] text-emerald-200/90 font-medium">Activity & Alerts</p>
          </div>

          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#e5b74b] p-0.5">
            <img src={logoImg} alt="QuickPay" className="w-full h-full object-cover rounded-full" />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 sm:px-6 pt-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-slate-800 dark:text-emerald-200 uppercase tracking-wider">
              Recent Alerts
            </span>
            <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black flex items-center justify-center">
              {notifications.filter((n) => n.unread).length}
            </span>
          </div>

          <button
            type="button"
            onClick={handleMarkAllRead}
            className="text-xs font-bold text-[#064e32] dark:text-[#ffd56b] hover:text-emerald-950 dark:hover:text-amber-200 flex items-center gap-1 cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        </div>

        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition ${
                n.unread
                  ? 'bg-white dark:bg-[#062417] border-emerald-300 dark:border-emerald-700 shadow-xs ring-1 ring-emerald-500/20'
                  : 'bg-white dark:bg-[#041d13] border-slate-200 dark:border-emerald-900/40 opacity-90'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    n.iconType === 'credit'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                      : n.iconType === 'security'
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                      : n.iconType === 'promo'
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                      : 'bg-slate-100 dark:bg-[#021810] text-slate-700 dark:text-emerald-200'
                  }`}
                >
                  {n.iconType === 'credit' && <ArrowDownLeft className="w-4 h-4 text-[#064e32] dark:text-emerald-400" />}
                  {n.iconType === 'security' && <ShieldCheck className="w-4 h-4 text-blue-700 dark:text-blue-400" />}
                  {n.iconType === 'promo' && <Sparkles className="w-4 h-4 text-[#e5b74b]" />}
                  {n.iconType === 'system' && <Bell className="w-4 h-4 text-slate-700 dark:text-emerald-300" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">{n.title}</h4>
                    <span className="text-[10px] text-slate-400 dark:text-emerald-400/60 font-medium">{n.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-emerald-200/70 mt-1 leading-relaxed">{n.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
