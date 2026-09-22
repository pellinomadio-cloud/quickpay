import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { User, Transaction, QuickCode } from './types';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Analytics (supported in browser environment)
let analyticsInstance: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        analyticsInstance = getAnalytics(app);
      }
    })
    .catch(() => {
      // Graceful fallback if analytics is blocked in iframe/environment
    });
}
export const analytics = analyticsInstance;

// Initialize Firestore with explicit database ID from config, or default
export const db = (() => {
  try {
    return firebaseConfig.firestoreDatabaseId
      ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
      : getFirestore(app);
  } catch {
    return getFirestore(app);
  }
})();

// Initialize Firebase Authentication
export const auth = getAuth(app);
export { onAuthStateChanged };
export type { FirebaseUser };
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Validate Connection to Firestore on startup
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or connecting...');
    }
  }
}
testConnection();

// Required Firestore Error Handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// -------------------------------------------------------------
// FIRESTORE DATABASE HELPERS (Real-time sync with strict rules)
// -------------------------------------------------------------

/**
 * Save or update user document in /users/{userId}
 */
export async function firestoreSaveUser(user: User): Promise<void> {
  const path = `users/${user.id}`;
  try {
    const userDocRef = doc(db, 'users', user.id);
    const existingSnap = await getDoc(userDocRef);
    if (existingSnap.exists()) {
      await updateDoc(userDocRef, {
        balance: user.balance,
        name: user.name,
        phone: user.phone || '',
      });
    } else {
      await setDoc(userDocRef, {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        balance: user.balance,
        createdAt: user.createdAt || new Date().toISOString(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Fetch user document from /users/{userId}
 */
export async function firestoreGetUser(userId: string): Promise<User | null> {
  const path = `users/${userId}`;
  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      id: data.id || snap.id,
      name: data.name || 'QuickPay User',
      email: data.email || '',
      password: data.password || '123456',
      phone: data.phone || '',
      balance: typeof data.balance === 'number' ? data.balance : 0,
      createdAt: data.createdAt || new Date().toISOString(),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Save transaction under /users/{userId}/transactions/{transactionId}
 */
export async function firestoreAddTransaction(transaction: Transaction): Promise<void> {
  const path = `users/${transaction.userId}/transactions/${transaction.id}`;
  try {
    const txRef = doc(db, 'users', transaction.userId, 'transactions', transaction.id);
    await setDoc(txRef, {
      id: transaction.id,
      userId: transaction.userId,
      type: transaction.type,
      title: transaction.title,
      subtitle: transaction.subtitle,
      amount: transaction.amount,
      isCredit: transaction.isCredit,
      date: transaction.date,
      status: transaction.status,
      reference: transaction.reference,
      network: transaction.network || '',
      recipient: transaction.recipient || '',
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Real-time listener for user transactions under /users/{userId}/transactions
 */
export function subscribeToFirestoreTransactions(
  userId: string,
  onUpdate: (txs: Transaction[]) => void
): () => void {
  const path = `users/${userId}/transactions`;
  const txColRef = collection(db, 'users', userId, 'transactions');
  
  return onSnapshot(
    txColRef,
    (snapshot) => {
      const items: Transaction[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        items.push({
          id: d.id || docSnap.id,
          userId: d.userId,
          type: d.type,
          title: d.title,
          subtitle: d.subtitle,
          amount: d.amount,
          isCredit: d.isCredit,
          date: d.date,
          status: d.status,
          reference: d.reference,
          network: d.network,
          recipient: d.recipient,
        });
      });
      // Sort newest first
      items.sort((a, b) => b.id.localeCompare(a.id));
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

/**
 * Save QuickCode under /users/{userId}/quickCodes/{codeId}
 */
export async function firestoreAddQuickCode(code: QuickCode): Promise<void> {
  const path = `users/${code.userId}/quickCodes/${code.id}`;
  try {
    const codeRef = doc(db, 'users', code.userId, 'quickCodes', code.id);
    await setDoc(codeRef, {
      id: code.id,
      code: code.code,
      userId: code.userId,
      amountPaid: code.amountPaid,
      createdAt: code.createdAt,
      status: code.status,
      usedAt: code.usedAt || '',
      usedForTxRef: code.usedForTxRef || '',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Mark QuickCode as used under /users/{userId}/quickCodes/{codeId}
 */
export async function firestoreConsumeQuickCode(
  userId: string,
  codeId: string,
  txRef: string
): Promise<void> {
  const path = `users/${userId}/quickCodes/${codeId}`;
  try {
    const codeRef = doc(db, 'users', userId, 'quickCodes', codeId);
    await updateDoc(codeRef, {
      status: 'used',
      usedAt: new Date().toISOString(),
      usedForTxRef: txRef,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Real-time listener for QuickCodes
 */
export function subscribeToFirestoreQuickCodes(
  userId: string,
  onUpdate: (codes: QuickCode[]) => void
): () => void {
  const path = `users/${userId}/quickCodes`;
  const codesColRef = collection(db, 'users', userId, 'quickCodes');

  return onSnapshot(
    codesColRef,
    (snapshot) => {
      const items: QuickCode[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        items.push({
          id: d.id || docSnap.id,
          code: d.code,
          userId: d.userId,
          amountPaid: d.amountPaid,
          createdAt: d.createdAt,
          status: d.status,
          usedAt: d.usedAt,
          usedForTxRef: d.usedForTxRef,
        });
      });
      items.sort((a, b) => b.id.localeCompare(a.id));
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// -------------------------------------------------------------
// FIREBASE AUTHENTICATION (Google Sign-In)
// -------------------------------------------------------------
export async function signInWithGoogle(): Promise<User> {
  const cred = await signInWithPopup(auth, googleProvider);
  const fbUser = cred.user;

  // Check if user already exists in Firestore
  let existingUser: User | null = null;
  try {
    existingUser = await firestoreGetUser(fbUser.uid);
  } catch {
    // If not existing yet, create a new record
  }

  if (existingUser) {
    return existingUser;
  }

  // Create new user profile with Google details
  const newUser: User = {
    id: fbUser.uid,
    name: fbUser.displayName || 'QuickPay Member',
    email: fbUser.email || '',
    password: '000000',
    phone: fbUser.phoneNumber || '',
    balance: 0.0,
    createdAt: new Date().toISOString(),
  };

  try {
    await firestoreSaveUser(newUser);
  } catch (e) {
    console.warn('Could not save new user to Firestore immediately:', e);
  }

  return newUser;
}

export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
}
