import { User, Transaction, QuickCode } from '../types';

const USERS_STORAGE_KEY = 'quickpay_registered_users_v1';
const CURRENT_USER_ID_KEY = 'quickpay_current_user_id_v1';
const TRANSACTIONS_STORAGE_KEY = 'quickpay_transactions_v1';
const QUICK_CODES_STORAGE_KEY = 'quickpay_quick_codes_v1';

// Official QuickPay Verified Corporate Account for all deposits and wallet funding
export const QUICKPAY_COMPANY_ACCOUNT = {
  bankName: 'Zenith Bank',
  accountNumber: '1018492039',
  accountName: 'QuickPay Financial Technologies Ltd',
  sortCode: '057-150013',
  narrationNote: 'QuickPay Wallet Deposit',
};

export function getStoredUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error loading stored users:', e);
    return [];
  }
}

export function saveUser(user: User): void {
  const users = getStoredUsers();
  const existingIndex = users.findIndex((u) => u.id === user.id);
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export function getCurrentUser(): User | null {
  try {
    const userId = localStorage.getItem(CURRENT_USER_ID_KEY);
    if (!userId) return null;
    const users = getStoredUsers();
    return users.find((u) => u.id === userId) || null;
  } catch (e) {
    console.error('Error getting current user:', e);
    return null;
  }
}

export function setCurrentUserId(userId: string | null): void {
  if (userId) {
    localStorage.setItem(CURRENT_USER_ID_KEY, userId);
  } else {
    localStorage.removeItem(CURRENT_USER_ID_KEY);
  }
}

export function getTransactions(userId: string): Transaction[] {
  try {
    const raw = localStorage.getItem(`${TRANSACTIONS_STORAGE_KEY}_${userId}`);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error getting transactions:', e);
    return [];
  }
}

export function setTransactions(userId: string, txs: Transaction[]): void {
  try {
    localStorage.setItem(`${TRANSACTIONS_STORAGE_KEY}_${userId}`, JSON.stringify(txs));
  } catch (e) {
    console.error('Error setting transactions:', e);
  }
}

export function addTransaction(transaction: Transaction): void {
  try {
    const list = getTransactions(transaction.userId);
    const updated = [transaction, ...list];
    localStorage.setItem(`${TRANSACTIONS_STORAGE_KEY}_${transaction.userId}`, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving transaction:', e);
  }
}

export function updateUserBalance(userId: string, newBalance: number): User | null {
  const users = getStoredUsers();
  const user = users.find((u) => u.id === userId);
  if (user) {
    user.balance = Math.max(0, Math.round(newBalance * 100) / 100);
    saveUser(user);
    return user;
  }
  return null;
}

export function formatNaira(amount: number): string {
  return '₦' + amount.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function generateQuickCodeString(): string {
  const part1 = Math.floor(1000 + Math.random() * 9000);
  const part2 = Math.floor(1000 + Math.random() * 9000);
  return `QC-${part1}-${part2}`;
}

export function getQuickCodes(userId: string): QuickCode[] {
  try {
    const raw = localStorage.getItem(`${QUICK_CODES_STORAGE_KEY}_${userId}`);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error getting quick codes:', e);
    return [];
  }
}

export function setQuickCodes(userId: string, codes: QuickCode[]): void {
  try {
    localStorage.setItem(`${QUICK_CODES_STORAGE_KEY}_${userId}`, JSON.stringify(codes));
  } catch (e) {
    console.error('Error setting quick codes:', e);
  }
}

export function addQuickCode(quickCode: QuickCode): void {
  try {
    const list = getQuickCodes(quickCode.userId);
    const updated = [quickCode, ...list];
    localStorage.setItem(`${QUICK_CODES_STORAGE_KEY}_${quickCode.userId}`, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving quick code:', e);
  }
}

export function getValidQuickCode(userId: string, codeString: string): QuickCode | null {
  const codes = getQuickCodes(userId);
  const normalized = codeString.trim().toUpperCase();
  return (
    codes.find(
      (c) =>
        c.status === 'unused' &&
        (c.code.toUpperCase() === normalized ||
          c.code.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() ===
            normalized.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())
    ) || null
  );
}

export function consumeQuickCode(userId: string, codeString: string, txRef: string): boolean {
  try {
    const codes = getQuickCodes(userId);
    const normalized = codeString.trim().toUpperCase();
    const index = codes.findIndex(
      (c) =>
        c.status === 'unused' &&
        (c.code.toUpperCase() === normalized ||
          c.code.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() ===
            normalized.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())
    );

    if (index === -1) return false;

    const matchedCode = codes[index];
    matchedCode.status = 'used';
    matchedCode.usedAt = new Date().toISOString();
    matchedCode.usedForTxRef = txRef;

    localStorage.setItem(`${QUICK_CODES_STORAGE_KEY}_${userId}`, JSON.stringify(codes));

    return true;
  } catch (e) {
    console.error('Error consuming quick code:', e);
    return false;
  }
}
