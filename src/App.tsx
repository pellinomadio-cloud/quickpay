import React, { useState, useEffect } from 'react';
import { User, Transaction, ActivePage, ActiveTab } from './types';
import {
  getCurrentUser,
  setCurrentUserId,
  getTransactions,
  saveUser,
} from './data/storage';

import { DashboardHeader } from './components/DashboardHeader';
import { BalanceCard } from './components/BalanceCard';
import { QuickActions } from './components/QuickActions';
import { SpecialOfferBanner } from './components/SpecialOfferBanner';
import { RecentTransactions } from './components/RecentTransactions';
import { BottomNav } from './components/BottomNav';
import { AuthPage } from './components/AuthPage';

import { FundWalletPage } from './components/FundWalletPage';
import { BuyDataPage } from './components/BuyDataPage';
import { BuyAirtimePage } from './components/BuyAirtimePage';
import { TransferPage } from './components/TransferPage';
import { MessageServicePage } from './components/MessageServicePage';
import { PromoPage } from './components/PromoPage';
import { NotificationsPage } from './components/NotificationsPage';
import { TransactionHistoryPage } from './components/TransactionHistoryPage';
import { TransactionReceiptPage } from './components/TransactionReceiptPage';
import { WithdrawPage } from './components/WithdrawPage';
import { EarnPage } from './components/EarnPage';
import { QuickCodePage } from './components/QuickCodePage';
import { ServicesView } from './components/ServicesView';
import { ProfileView } from './components/ProfileView';

export default function App() {
  const [currentUser, setLocalCurrentUser] = useState<User | null>(() => getCurrentUser());
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');

  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [pageHistory, setPageHistory] = useState<ActivePage[]>(['home']);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [selectedQuickCode, setSelectedQuickCode] = useState<string>('');

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const user = getCurrentUser();
    return user ? getTransactions(user.id) : [];
  });

  // Load user transactions when currentUser changes
  useEffect(() => {
    if (!currentUser) {
      setTransactions([]);
      return;
    }
    setTransactions(getTransactions(currentUser.id));
  }, [currentUser?.id]);

  const navigateTo = (page: ActivePage) => {
    setActivePage(page);
    setPageHistory((prev) => [...prev, page]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateBack = () => {
    if (pageHistory.length > 1) {
      const newHistory = [...pageHistory];
      newHistory.pop(); // remove current page
      const prevPage = newHistory[newHistory.length - 1] || 'home';
      setPageHistory(newHistory);
      setActivePage(prevPage);
    } else {
      setActivePage('home');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUserLoginOrRegisterSuccess = (user: User) => {
    setLocalCurrentUser(user);
    setShowAuth(false);
    setActivePage('home');
    setPageHistory(['home']);
    setTransactions(getTransactions(user.id));
  };

  const handleLogout = () => {
    setCurrentUserId(null);
    setLocalCurrentUser(null);
    setShowAuth(true);
    setAuthMode('login');
  };

  const handleSwitchToRegister = () => {
    setShowAuth(true);
    setAuthMode('register');
  };

  const handleBalanceUpdated = (updatedUser: User) => {
    setLocalCurrentUser(updatedUser);
    setTransactions(getTransactions(updatedUser.id));
  };

  // If user is not logged in or requested auth page
  if (!currentUser || showAuth) {
    return (
      <AuthPage
        initialMode={authMode}
        onSuccess={handleUserLoginOrRegisterSuccess}
        onClose={currentUser ? () => setShowAuth(false) : undefined}
      />
    );
  }

  // Map activePage to bottom nav tab
  const getBottomNavTab = (): ActiveTab => {
    if (activePage === 'home') return 'home';
    if (activePage === 'transfer') return 'transfer';
    if (activePage === 'services') return 'services';
    if (activePage === 'profile') return 'profile';
    if (activePage === 'withdraw') return 'withdraw';
    return 'home';
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col items-center justify-start antialiased text-slate-900 selection:bg-emerald-200">
      {/* Mobile-centric application container matching the screenshot layout */}
      <div className="w-full max-w-md min-h-screen bg-white shadow-2xl shadow-slate-300 relative flex flex-col">
        
        {/* Main Dashboard Header (rendered only on Home screen; other pages have dedicated headers with Back buttons) */}
        {activePage === 'home' && (
          <DashboardHeader
            user={currentUser}
            onOpenNotifications={() => navigateTo('notifications')}
            onOpenProfile={() => navigateTo('profile')}
          />
        )}

        {/* 1. PAGE: HOME DASHBOARD */}
        {activePage === 'home' && (
          <main className="flex-1 pb-24">
            {/* Balance Card with Fund and Withdraw buttons */}
            <BalanceCard
              balance={currentUser.balance}
              onFundWallet={() => navigateTo('fund')}
              onWithdraw={() => navigateTo('withdraw')}
            />

            {/* Quick Actions Grid (Message Service, Buy Data, Buy Airtime, Promo) */}
            <QuickActions
              onSelectAction={(action) => navigateTo(action)}
              onViewAll={() => navigateTo('services')}
            />

            {/* Special Offer Banner */}
            <SpecialOfferBanner
              onCheckPromo={() => navigateTo('promo')}
            />

            {/* Recent Transactions Section */}
            <div id="recent-transactions-container">
              <RecentTransactions
                transactions={transactions}
                onViewAll={() => navigateTo('history')}
                onSelectTransaction={(tx) => {
                  setSelectedTx(tx);
                  navigateTo('receipt');
                }}
              />
            </div>
          </main>
        )}

        {/* 2. PAGE: WITHDRAWAL */}
        {activePage === 'withdraw' && (
          <WithdrawPage
            user={currentUser}
            onBack={navigateBack}
            onBalanceUpdated={handleBalanceUpdated}
            onOpenFund={() => navigateTo('fund')}
            onOpenQuickCode={() => navigateTo('quick-code')}
            initialQuickCode={selectedQuickCode}
          />
        )}

        {/* PAGE: QUICK CODE (PURCHASE WITHDRAWAL AUTHORIZATION CODES) */}
        {activePage === 'quick-code' && (
          <QuickCodePage
            user={currentUser}
            onBack={navigateBack}
            onBalanceUpdated={handleBalanceUpdated}
            onOpenFund={() => navigateTo('fund')}
            onNavigateToWithdraw={(code) => {
              if (code) setSelectedQuickCode(code);
              navigateTo('withdraw');
            }}
          />
        )}

        {/* 3. PAGE: FUND WALLET */}
        {activePage === 'fund' && (
          <FundWalletPage
            user={currentUser}
            onBack={navigateBack}
            onBalanceUpdated={handleBalanceUpdated}
          />
        )}

        {/* 4. PAGE: BUY DATA */}
        {activePage === 'data' && (
          <BuyDataPage
            user={currentUser}
            onBack={navigateBack}
            onBalanceUpdated={handleBalanceUpdated}
            onOpenFund={() => navigateTo('fund')}
          />
        )}

        {/* 5. PAGE: BUY AIRTIME */}
        {activePage === 'airtime' && (
          <BuyAirtimePage
            user={currentUser}
            onBack={navigateBack}
            onBalanceUpdated={handleBalanceUpdated}
            onOpenFund={() => navigateTo('fund')}
          />
        )}

        {/* 6. PAGE: TRANSFER */}
        {activePage === 'transfer' && (
          <TransferPage
            user={currentUser}
            onBack={navigateBack}
            onBalanceUpdated={handleBalanceUpdated}
            onOpenFund={() => navigateTo('fund')}
          />
        )}

        {/* 7. PAGE: MESSAGE SERVICE (24/7 SUPPORT CHAT) */}
        {activePage === 'message' && (
          <MessageServicePage
            user={currentUser}
            onBack={navigateBack}
          />
        )}

        {/* 8. PAGE: PROMOTIONS & REWARDS */}
        {activePage === 'promo' && (
          <PromoPage
            user={currentUser}
            onBack={navigateBack}
            onBalanceUpdated={handleBalanceUpdated}
          />
        )}

        {/* PAGE: EARN */}
        {activePage === 'earn' && (
          <EarnPage
            user={currentUser}
            onBack={navigateBack}
            onBalanceUpdated={handleBalanceUpdated}
          />
        )}

        {/* 9. PAGE: NOTIFICATIONS & ALERTS */}
        {activePage === 'notifications' && (
          <NotificationsPage
            onBack={navigateBack}
          />
        )}

        {/* 10. PAGE: TRANSACTION HISTORY */}
        {activePage === 'history' && (
          <TransactionHistoryPage
            transactions={transactions}
            onBack={navigateBack}
            onSelectTransaction={(tx) => {
              setSelectedTx(tx);
              navigateTo('receipt');
            }}
          />
        )}

        {/* 11. PAGE: TRANSACTION RECEIPT */}
        {activePage === 'receipt' && selectedTx && (
          <TransactionReceiptPage
            transaction={selectedTx}
            onBack={navigateBack}
          />
        )}

        {/* 12. PAGE: ALL SERVICES */}
        {activePage === 'services' && (
          <ServicesView
            onNavigate={(page) => navigateTo(page)}
            onBackToHome={() => navigateTo('home')}
          />
        )}

        {/* 13. PAGE: PROFILE & SECURITY */}
        {activePage === 'profile' && (
          <ProfileView
            user={currentUser}
            onLogout={handleLogout}
            onSwitchToRegister={handleSwitchToRegister}
            onUserUpdated={(u) => setLocalCurrentUser(u)}
            onBackToHome={() => navigateTo('home')}
          />
        )}

        {/* Fixed Bottom Navigation */}
        <BottomNav
          activeTab={getBottomNavTab()}
          onChangeTab={(tab) => navigateTo(tab)}
        />
      </div>
    </div>
  );
}
