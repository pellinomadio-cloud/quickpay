import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  User,
  Transaction,
  QuickCode,
  QuickCodeRequest,
  CompanyAccount,
  DepositRequest,
  PromoCode,
  PromoRedemption,
} from '../types';
import {
  DEFAULT_COMPANY_ACCOUNT,
  PROMO_CODE_REWARD,
  PROMO_CODE_EXPIRATION_MS,
  QUICK_CODE_PRICE,
  generateQuickCodeString,
  getStoredUsers,
  saveUser,
  getTransactions,
  addTransaction,
  getDepositRequests,
  saveAllDepositRequests,
  getQuickCodeRequests,
  saveAllQuickCodeRequests,
  getQuickCodes,
  addQuickCode,
  getPromoCodes,
  savePromoCodes,
  getCompanyAccount,
  saveCompanyAccount,
  updateUserBalance,
} from './storage';

// Collection references
const USERS_COL = 'users';
const TRANSACTIONS_COL = 'transactions';
const DEPOSIT_REQUESTS_COL = 'deposit_requests';
const QUICK_CODE_REQUESTS_COL = 'quick_code_requests';
const QUICK_CODES_COL = 'quick_codes';
const PROMO_CODES_COL = 'promo_codes';
const SETTINGS_COL = 'settings';

// -------------------------------------------------------------
// 1. COMPANY ACCOUNT FIREBASE SYNC
// -------------------------------------------------------------

export function listenToCompanyAccount(onChange?: (acc: CompanyAccount) => void) {
  try {
    const docRef = doc(db, SETTINGS_COL, 'company_account');
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as CompanyAccount;
          const merged = { ...DEFAULT_COMPANY_ACCOUNT, ...data };
          saveCompanyAccount(merged);
          if (onChange) onChange(merged);
        } else {
          // Push local default to Firestore if empty
          const current = getCompanyAccount();
          setDoc(docRef, current, { merge: true }).catch((e) =>
            console.warn('Could not initialize company account in Firebase:', e)
          );
        }
      },
      (err) => {
        console.warn('Company account snapshot listener error:', err);
      }
    );
  } catch (e) {
    console.warn('Error setting up company account listener:', e);
    return () => {};
  }
}

export async function updateFirebaseCompanyAccount(account: CompanyAccount) {
  // Update local storage immediately for fast UI feedback
  saveCompanyAccount(account);
  try {
    const docRef = doc(db, SETTINGS_COL, 'company_account');
    await setDoc(docRef, account, { merge: true });
  } catch (e) {
    console.error('Error saving company account to Firebase:', e);
  }
}

// -------------------------------------------------------------
// 2. USERS FIREBASE SYNC
// -------------------------------------------------------------

export function listenToUsers(onChange?: (users: User[]) => void) {
  try {
    const colRef = collection(db, USERS_COL);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const remoteUsers: User[] = [];
        snapshot.forEach((d) => {
          remoteUsers.push(d.data() as User);
        });
        if (remoteUsers.length > 0) {
          // Merge with local users
          const localUsers = getStoredUsers();
          const userMap = new Map<string, User>();
          localUsers.forEach((u) => userMap.set(u.id, u));
          remoteUsers.forEach((u) => userMap.set(u.id, u));
          const merged = Array.from(userMap.values());
          localStorage.setItem('quickpay_registered_users_v1', JSON.stringify(merged));
          window.dispatchEvent(new Event('quickpay_user_updated'));
          if (onChange) onChange(merged);
        }
      },
      (err) => {
        console.warn('Users snapshot listener error:', err);
      }
    );
  } catch (e) {
    console.warn('Error listening to users:', e);
    return () => {};
  }
}

export async function saveUserToFirebase(user: User) {
  saveUser(user);
  try {
    const docRef = doc(db, USERS_COL, user.id);
    await setDoc(docRef, user, { merge: true });
  } catch (e) {
    console.error('Error saving user to Firebase:', e);
  }
}

export async function updateUserBalanceInFirebase(userId: string, newBalance: number) {
  const updated = updateUserBalance(userId, newBalance);
  try {
    const docRef = doc(db, USERS_COL, userId);
    await updateDoc(docRef, { balance: Math.max(0, Math.round(newBalance * 100) / 100) });
  } catch (e) {
    console.error('Error updating user balance in Firebase:', e);
  }
  return updated;
}

// -------------------------------------------------------------
// 3. DEPOSIT REQUESTS FIREBASE SYNC (FOR ADMIN & USERS)
// -------------------------------------------------------------

export function listenToDepositRequests(onChange?: (reqs: DepositRequest[]) => void) {
  try {
    const colRef = collection(db, DEPOSIT_REQUESTS_COL);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const remoteReqs: DepositRequest[] = [];
        snapshot.forEach((d) => {
          remoteReqs.push(d.data() as DepositRequest);
        });

        if (remoteReqs.length > 0) {
          // Sort descending by createdAt
          remoteReqs.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          saveAllDepositRequests(remoteReqs);
          if (onChange) onChange(remoteReqs);
        }
      },
      (err) => {
        console.warn('Deposit requests listener error:', err);
      }
    );
  } catch (e) {
    console.warn('Error listening to deposit requests:', e);
    return () => {};
  }
}

export async function submitDepositRequestToFirebase(req: DepositRequest) {
  // Save locally
  const current = getDepositRequests();
  saveAllDepositRequests([req, ...current.filter((r) => r.id !== req.id)]);

  // Save to Firebase
  try {
    const docRef = doc(db, DEPOSIT_REQUESTS_COL, req.id);
    await setDoc(docRef, req);
  } catch (e) {
    console.error('Error submitting deposit request to Firebase:', e);
  }
}

export async function approveDepositRequestInFirebase(requestId: string, adminNotes?: string) {
  // First run local approval
  const localResult = (await import('./storage')).approveDepositRequest(requestId, adminNotes);

  try {
    const docRef = doc(db, DEPOSIT_REQUESTS_COL, requestId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as DepositRequest;
      const updates: any = {
        status: 'approved',
        reviewedAt: new Date().toISOString(),
      };
      if (adminNotes) updates.notes = adminNotes;
      await updateDoc(docRef, updates);

      // Update user in Firebase
      if (data.userId) {
        const userDocRef = doc(db, USERS_COL, data.userId);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const u = userSnap.data() as User;
          const newBal = +(u.balance + data.amount).toFixed(2);
          await updateDoc(userDocRef, { balance: newBal });
        }

        // Add credit transaction in Firebase
        const txDocRef = doc(db, TRANSACTIONS_COL, `tx_dep_${Date.now()}`);
        await setDoc(txDocRef, {
          id: txDocRef.id,
          userId: data.userId,
          type: 'deposit',
          title: 'Company Account Deposit Approved',
          subtitle: `Verified into ${data.companyAccount.bankName} (${data.companyAccount.accountNumber})`,
          amount: data.amount,
          isCredit: true,
          date: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          status: 'successful',
          reference: data.reference,
        });
      }
    }
  } catch (e) {
    console.error('Error updating approved deposit in Firebase:', e);
  }

  return localResult;
}

export async function declineDepositRequestInFirebase(requestId: string, reason?: string) {
  const localResult = (await import('./storage')).declineDepositRequest(requestId, reason);

  try {
    const docRef = doc(db, DEPOSIT_REQUESTS_COL, requestId);
    await updateDoc(docRef, {
      status: 'declined',
      reviewedAt: new Date().toISOString(),
      notes: reason || 'Payment could not be verified on corporate account.',
    });
  } catch (e) {
    console.error('Error declining deposit request in Firebase:', e);
  }

  return localResult;
}

// -------------------------------------------------------------
// 4. QUICK CODE REQUESTS FIREBASE SYNC (FOR ADMIN & USERS)
// -------------------------------------------------------------

export function listenToQuickCodeRequests(onChange?: (reqs: QuickCodeRequest[]) => void) {
  try {
    const colRef = collection(db, QUICK_CODE_REQUESTS_COL);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const remoteReqs: QuickCodeRequest[] = [];
        snapshot.forEach((d) => {
          remoteReqs.push(d.data() as QuickCodeRequest);
        });

        if (remoteReqs.length > 0) {
          remoteReqs.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          saveAllQuickCodeRequests(remoteReqs);
          if (onChange) onChange(remoteReqs);
        }
      },
      (err) => {
        console.warn('Quick code requests listener error:', err);
      }
    );
  } catch (e) {
    console.warn('Error listening to quick code requests:', e);
    return () => {};
  }
}

export async function submitQuickCodeRequestToFirebase(req: QuickCodeRequest) {
  const current = getQuickCodeRequests();
  saveAllQuickCodeRequests([req, ...current.filter((r) => r.id !== req.id)]);

  try {
    const docRef = doc(db, QUICK_CODE_REQUESTS_COL, req.id);
    await setDoc(docRef, req);
  } catch (e) {
    console.error('Error submitting quick code request to Firebase:', e);
  }
}

export async function approveQuickCodeRequestInFirebase(requestId: string) {
  // First run local approval
  const localResult = (await import('./storage')).approveQuickCodeRequest(requestId);

  try {
    const docRef = doc(db, QUICK_CODE_REQUESTS_COL, requestId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as QuickCodeRequest;
      const code = localResult.code || generateQuickCodeString();
      const now = new Date();
      const dateStr = `Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

      await updateDoc(docRef, {
        status: 'approved',
        generatedCode: code,
        reviewedAt: now.toISOString(),
      });

      // Write quick code to Firebase
      const codeDocRef = doc(db, QUICK_CODES_COL, `qc_${Date.now()}`);
      await setDoc(codeDocRef, {
        id: codeDocRef.id,
        userId: data.userId,
        code,
        amountPaid: data.amount || QUICK_CODE_PRICE,
        createdAt: dateStr,
        status: 'unused',
      });

      // Write transaction to Firebase
      const txDocRef = doc(db, TRANSACTIONS_COL, `tx_qc_${Date.now()}`);
      await setDoc(txDocRef, {
        id: txDocRef.id,
        userId: data.userId,
        type: 'quick_code',
        title: 'Quick Code Purchase Approved',
        subtitle: `Code: ${code} • Ready on Dashboard`,
        amount: data.amount || QUICK_CODE_PRICE,
        isCredit: true,
        hideMinus: true,
        date: dateStr,
        status: 'successful',
        reference: data.reference,
      });
    }
  } catch (e) {
    console.error('Error approving quick code request in Firebase:', e);
  }

  return localResult;
}

export async function declineQuickCodeRequestInFirebase(requestId: string, reason?: string) {
  const localResult = (await import('./storage')).declineQuickCodeRequest(requestId, reason);

  try {
    const docRef = doc(db, QUICK_CODE_REQUESTS_COL, requestId);
    await updateDoc(docRef, {
      status: 'declined',
      reviewedAt: new Date().toISOString(),
      declineReason:
        reason ||
        'Your payment for quick code could not be verified on the company account. Please transfer ₦7,800 to the official company account.',
      dismissedDeclineModal: false,
    });
  } catch (e) {
    console.error('Error declining quick code request in Firebase:', e);
  }

  return localResult;
}

// -------------------------------------------------------------
// 5. QUICK CODES FIREBASE SYNC
// -------------------------------------------------------------

export function listenToUserQuickCodes(userId: string, onChange?: (codes: QuickCode[]) => void) {
  if (!userId) return () => {};
  try {
    const q = query(collection(db, QUICK_CODES_COL), where('userId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const remoteCodes: QuickCode[] = [];
        snapshot.forEach((d) => {
          remoteCodes.push(d.data() as QuickCode);
        });

        if (remoteCodes.length > 0) {
          const localCodes = getQuickCodes(userId);
          const map = new Map<string, QuickCode>();
          localCodes.forEach((c) => map.set(c.code, c));
          remoteCodes.forEach((c) => map.set(c.code, c));
          const merged = Array.from(map.values());
          localStorage.setItem(`quickpay_quick_codes_v1_${userId}`, JSON.stringify(merged));
          window.dispatchEvent(new Event('quickpay_quickcode_updated'));
          if (onChange) onChange(merged);
        }
      },
      (err) => {
        console.warn('Quick codes snapshot listener error:', err);
      }
    );
  } catch (e) {
    console.warn('Error listening to user quick codes:', e);
    return () => {};
  }
}

export async function consumeQuickCodeInFirebase(userId: string, codeString: string, txRef: string) {
  const localSuccess = (await import('./storage')).consumeQuickCode(userId, codeString, txRef);

  try {
    const q = query(
      collection(db, QUICK_CODES_COL),
      where('userId', '==', userId),
      where('code', '==', codeString.trim().toUpperCase())
    );
    const snap = await getDocs(q);
    snap.forEach(async (d) => {
      await updateDoc(d.ref, {
        status: 'used',
        usedAt: new Date().toISOString(),
        usedForTxRef: txRef,
      });
    });
  } catch (e) {
    console.error('Error consuming quick code in Firebase:', e);
  }

  return localSuccess;
}

// -------------------------------------------------------------
// 6. PROMO CODES FIREBASE SYNC (ADMIN & USER)
// -------------------------------------------------------------

export function listenToPromoCodes(onChange?: (promos: PromoCode[]) => void) {
  try {
    const colRef = collection(db, PROMO_CODES_COL);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const remotePromos: PromoCode[] = [];
        snapshot.forEach((d) => {
          remotePromos.push(d.data() as PromoCode);
        });

        if (remotePromos.length > 0) {
          remotePromos.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          savePromoCodes(remotePromos);
          if (onChange) onChange(remotePromos);
        }
      },
      (err) => {
        console.warn('Promo codes snapshot listener error:', err);
      }
    );
  } catch (e) {
    console.warn('Error listening to promo codes:', e);
    return () => {};
  }
}

export async function createPromoCodeInFirebase(promo: PromoCode) {
  const current = getPromoCodes();
  savePromoCodes([promo, ...current.filter((p) => p.id !== promo.id)]);

  try {
    const docRef = doc(db, PROMO_CODES_COL, promo.id);
    await setDoc(docRef, promo);
  } catch (e) {
    console.error('Error saving promo code to Firebase:', e);
  }
}

export async function deletePromoCodeInFirebase(promoId: string) {
  (await import('./storage')).deletePromoCode(promoId);

  try {
    const docRef = doc(db, PROMO_CODES_COL, promoId);
    await deleteDoc(docRef);
  } catch (e) {
    console.error('Error deleting promo code in Firebase:', e);
  }
}

export async function redeemPromoCodeInFirebase(rawCode: string, user: User) {
  // First execute local redemption
  const localResult = (await import('./storage')).redeemUserPromoCode(rawCode, user);
  if (!localResult.success) {
    return localResult;
  }

  // Update in Firebase
  try {
    const cleanCode = rawCode.trim().toUpperCase();
    const q = query(collection(db, PROMO_CODES_COL), where('code', '==', cleanCode));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const docSnap = snap.docs[0];
      const promoData = docSnap.data() as PromoCode;

      const newRedemption: PromoRedemption = {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        redeemedAt: new Date().toISOString(),
      };

      const updatedRedemptions = [...(promoData.redeemedBy || []), newRedemption];
      await updateDoc(docSnap.ref, { redeemedBy: updatedRedemptions });

      // Update user balance in Firebase
      const reward = promoData.rewardAmount || PROMO_CODE_REWARD;
      const userRef = doc(db, USERS_COL, user.id);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const u = userSnap.data() as User;
        await updateDoc(userRef, { balance: u.balance + reward });
      }

      // Add transaction in Firebase
      const txRef = doc(db, TRANSACTIONS_COL, `tx_promo_${Date.now()}`);
      await setDoc(txRef, {
        id: txRef.id,
        userId: user.id,
        type: 'promo',
        title: `Promo Code Redeemed: ${promoData.code}`,
        subtitle: `Instant ₦${reward.toLocaleString()} Promo Reward Added`,
        amount: reward,
        isCredit: true,
        date: 'Just now',
        status: 'successful',
        reference: `QP-PROMO-${Math.floor(100000 + Math.random() * 900000)}`,
      });
    }
  } catch (e) {
    console.error('Error updating redeemed promo in Firebase:', e);
  }

  return localResult;
}

// -------------------------------------------------------------
// 7. TRANSACTIONS FIREBASE SYNC
// -------------------------------------------------------------

export function listenToUserTransactions(
  userId: string,
  onChange?: (txs: Transaction[]) => void
) {
  if (!userId) return () => {};
  try {
    const q = query(collection(db, TRANSACTIONS_COL), where('userId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const remoteTxs: Transaction[] = [];
        snapshot.forEach((d) => {
          remoteTxs.push(d.data() as Transaction);
        });

        if (remoteTxs.length > 0) {
          const localTxs = getTransactions(userId);
          const map = new Map<string, Transaction>();
          localTxs.forEach((t) => map.set(t.id, t));
          remoteTxs.forEach((t) => map.set(t.id, t));
          const merged = Array.from(map.values());
          localStorage.setItem(`quickpay_transactions_v1_${userId}`, JSON.stringify(merged));
          window.dispatchEvent(new Event('quickpay_transactions_updated'));
          if (onChange) onChange(merged);
        }
      },
      (err) => {
        console.warn('Transactions listener error:', err);
      }
    );
  } catch (e) {
    console.warn('Error listening to transactions:', e);
    return () => {};
  }
}

export async function addTransactionToFirebase(tx: Transaction) {
  addTransaction(tx);
  try {
    const docRef = doc(db, TRANSACTIONS_COL, tx.id);
    await setDoc(docRef, tx);
  } catch (e) {
    console.error('Error adding transaction to Firebase:', e);
  }
}

// -------------------------------------------------------------
// 8. MASTER INITIALIZER: SYNC EVERYTHING ON APP LOAD
// -------------------------------------------------------------

export function initGlobalFirebaseSync(currentUserId?: string) {
  const unsubscribers: Array<() => void> = [];

  // 1. Company account sync
  unsubscribers.push(listenToCompanyAccount());

  // 2. Deposit requests sync
  unsubscribers.push(listenToDepositRequests());

  // 3. Quick code requests sync
  unsubscribers.push(listenToQuickCodeRequests());

  // 4. Promo codes sync
  unsubscribers.push(listenToPromoCodes());

  // 5. Users sync
  unsubscribers.push(listenToUsers());

  // 6. User-specific sync
  if (currentUserId) {
    unsubscribers.push(listenToUserTransactions(currentUserId));
    unsubscribers.push(listenToUserQuickCodes(currentUserId));
  }

  return () => {
    unsubscribers.forEach((unsub) => {
      try {
        unsub();
      } catch (e) {
        // ignore
      }
    });
  };
}
