import React from 'react';
import { X, Bell, Sparkles, ShieldCheck, ArrowDownLeft, CheckCircle2 } from 'lucide-react';

interface NotificationsDrawerProps {
  onClose: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({ onClose }) => {
  const notifications = [
    {
      id: 'n1',
      title: 'Weekend Data Carnival 🚀',
      message: 'Get up to 35% discount on all MTN & Airtel 10GB subscriptions this weekend.',
      time: '15 mins ago',
      icon: Sparkles,
      iconBg: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'n2',
      title: 'Security Notice',
      message: 'Your 6-digit password protects all wallet transfers. Never disclose it to callers.',
      time: '2 hours ago',
      icon: ShieldCheck,
      iconBg: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'n3',
      title: 'Welcome to QuickPay!',
      message: 'Your dedicated virtual bank account is ready. Fund your wallet anytime with zero fees.',
      time: 'Yesterday',
      icon: CheckCircle2,
      iconBg: 'bg-teal-100 text-teal-800',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#033421] to-[#054b30] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#e5b74b]" />
            <h3 className="text-lg font-extrabold tracking-tight">Notifications</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications list */}
        <div className="p-4 space-y-3 max-h-[420px] overflow-y-auto">
          {notifications.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 flex items-start gap-3 transition"
              >
                <div className={`w-9 h-9 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-slate-900 truncate">{item.title}</h5>
                    <span className="text-[10px] text-slate-400 shrink-0">{item.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.message}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Close Notifications
          </button>
        </div>
      </div>
    </div>
  );
};
