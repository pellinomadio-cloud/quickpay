import React from 'react';
import { User } from '../types';
import { Bell } from 'lucide-react';
import logoImg from '../assets/images/quickpay_gold_logo_1789754815185.jpg';

interface DashboardHeaderProps {
  user: User;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  unreadCount?: number;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  onOpenNotifications,
  onOpenProfile,
  unreadCount = 2,
}) => {
  return (
    <header className="w-full bg-white border-b border-slate-200 text-slate-900 pt-4 pb-3.5 px-4 sm:px-6">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        {/* Left side: Avatar + Welcome Text */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenProfile}
            title="View Profile"
            className="shrink-0 rounded-full overflow-hidden border border-slate-200 hover:opacity-90 transition cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden bg-emerald-700">
              <img
                src={logoImg}
                alt="QuickPay Emblem"
                className="w-full h-full object-cover"
              />
            </div>
          </button>

          <div className="flex flex-col">
            <span className="text-[11px] text-slate-500 font-medium">
              Welcome back
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              {user.name}
            </h2>
          </div>
        </div>

        {/* Right side: Notification Bell */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="notifications-bell-btn"
            onClick={onOpenNotifications}
            className="relative p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-600 rounded-full ring-2 ring-white" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
