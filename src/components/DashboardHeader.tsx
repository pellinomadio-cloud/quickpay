import React from 'react';
import { User } from '../types';
import { Bell, Sun, Moon } from 'lucide-react';
import logoImg from '../assets/images/quickpay_gold_logo_1789754815185.jpg';

interface DashboardHeaderProps {
  user: User;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  unreadCount?: number;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  onOpenNotifications,
  onOpenProfile,
  unreadCount = 2,
  isDark = true,
  onToggleTheme,
}) => {
  return (
    <header className="w-full bg-gradient-to-b from-[#022a1a] via-[#033621] to-[#044028] dark:from-[#011a10] dark:via-[#022416] dark:to-[#032a1a] text-white pt-6 pb-5 px-4 sm:px-6 relative overflow-hidden transition-colors duration-300">
      {/* Subtle curved background gold glow */}
      <div className="absolute top-0 right-0 w-72 h-44 bg-emerald-400/10 dark:bg-emerald-400/5 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-xl mx-auto flex items-center justify-between relative z-10">
        {/* Left side: Avatar + Welcome Text */}
        <div className="flex items-center gap-3">
          {/* Circular Gold Emblem Logo matching screenshot */}
          <button
            type="button"
            onClick={onOpenProfile}
            title="View Profile"
            className="relative shrink-0 p-0.5 rounded-full bg-gradient-to-tr from-[#d4a034] via-[#ffd670] to-[#9b6c16] shadow-md shadow-black/20 hover:scale-105 transition cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#032e1e] bg-[#032e1e]">
              <img
                src={logoImg}
                alt="QuickPay Emblem"
                className="w-full h-full object-cover"
              />
            </div>
          </button>

          {/* User Name & Tagline */}
          <div className="flex flex-col">
            <span className="text-xs text-emerald-200/90 font-medium tracking-wide">
              Welcome Back
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-tight">
              {user.name}
            </h2>
            <span className="text-[11px] sm:text-xs text-emerald-200/80 font-normal">
              Your success is our priority
            </span>
          </div>
        </div>

        {/* Right side: Dark Mode Toggle & Notification Bell */}
        <div className="flex items-center gap-2">
          {onToggleTheme && (
            <button
              type="button"
              id="theme-toggle-btn"
              onClick={onToggleTheme}
              className="p-2.5 rounded-full bg-[#032919]/80 dark:bg-[#021d13] border border-emerald-600/30 dark:border-emerald-500/30 text-amber-300 hover:text-amber-200 hover:bg-emerald-900/50 transition cursor-pointer shadow-sm"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-300 animate-pulse" /> : <Moon className="w-4 h-4 text-emerald-200" />}
            </button>
          )}

          <button
            type="button"
            id="notifications-bell-btn"
            onClick={onOpenNotifications}
            className="relative p-2.5 rounded-full bg-[#032919]/80 dark:bg-[#021d13] border border-emerald-600/30 dark:border-emerald-500/30 text-emerald-100 hover:text-white hover:bg-emerald-900/50 transition cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-[#043c26] dark:ring-[#021d13]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
