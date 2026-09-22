import React from 'react';
import { Home, ArrowLeftRight, LayoutGrid, User } from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const tabs = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'transfer' as const, label: 'Transfer', icon: ArrowLeftRight },
    { id: 'services' as const, label: 'Services', icon: LayoutGrid },
    { id: 'profile' as const, label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#021810]/95 backdrop-blur-md border-t border-slate-200/80 dark:border-emerald-900/40 shadow-lg dark:shadow-black/60 transition-colors duration-200">
      <div className="max-w-xl mx-auto flex items-center justify-around py-2 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              id={`nav-${tab.id}-btn`}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer relative ${
                isActive
                  ? 'text-[#064e32] dark:text-[#ffd56b]'
                  : 'text-slate-400 dark:text-emerald-300/40 hover:text-slate-600 dark:hover:text-emerald-200'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'
                  }`}
                />
              </div>
              <span
                className={`text-[11px] font-semibold mt-1 transition-colors ${
                  isActive ? 'text-[#064e32] dark:text-[#ffd56b] font-bold' : 'text-slate-500 dark:text-emerald-300/60'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-[#064e32] dark:bg-[#ffd56b] mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
