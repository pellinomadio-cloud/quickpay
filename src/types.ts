export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // 6-digit numeric password
  phone?: string; // Optional - users do not need to register with phone number
  balance: number;
  createdAt: string;
}

export interface DepositRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  screenshotUrl: string; // Base64 payment proof screenshot
  companyAccount: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  status: 'pending' | 'approved' | 'declined';
  createdAt: string;
  reviewedAt?: string;
  processedAt?: string;
  reference: string;
  notes?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'transfer' | 'airtime' | 'data' | 'promo' | 'cashback' | 'quick_code';
  title: string;
  subtitle: string;
  amount: number;
  isCredit: boolean;
  date: string;
  status: 'successful' | 'pending' | 'failed';
  reference: string;
  network?: string;
  recipient?: string;
  hideMinus?: boolean;
}

export interface QuickCode {
  id: string;
  code: string;
  userId: string;
  amountPaid: number;
  createdAt: string;
  status: 'unused' | 'used';
  usedAt?: string;
  usedForTxRef?: string;
}

export interface QuickCodeRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number; // 7800
  screenshotUrl: string; // Base64 payment proof
  companyAccount: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  status: 'pending' | 'approved' | 'declined';
  generatedCode?: string;
  createdAt: string;
  reviewedAt?: string;
  reference: string;
  declineReason?: string;
  dismissedDeclineModal?: boolean;
}

export interface PromoRedemption {
  userId: string;
  userName: string;
  userEmail: string;
  redeemedAt: string;
}

export interface PromoCode {
  id: string;
  code: string;
  rewardAmount: number; // 300,000 Naira
  createdAt: string;
  expiresAt: string; // Exactly 1 hour after createdAt
  redeemedBy: PromoRedemption[];
  isActive: boolean;
  createdBy: string;
}

export interface CompanyAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
  sortCode: string;
  narrationNote: string;
}

export type ActiveTab = 'home' | 'transfer' | 'services' | 'profile' | 'withdraw';

export type ActivePage =
  | 'home'
  | 'transfer'
  | 'services'
  | 'profile'
  | 'withdraw'
  | 'fund'
  | 'data'
  | 'airtime'
  | 'quick-code'
  | 'message'
  | 'promo'
  | 'earn'
  | 'history'
  | 'notifications'
  | 'receipt'
  | 'admin-login'
  | 'admin-dashboard';

export type QuickModalType =
  | 'fund'
  | 'withdraw'
  | 'transfer'
  | 'airtime'
  | 'data'
  | 'promo'
  | 'message'
  | 'history'
  | 'notifications'
  | null;
