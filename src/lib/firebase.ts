import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Official Web app's Firebase configuration provided by user
export const firebaseConfig = {
  apiKey: "AIzaSyAFSSc_F4c9HS5tK87eIsabT2R9BYmIYqk",
  authDomain: "quickpay-e63bd.firebaseapp.com",
  projectId: "quickpay-e63bd",
  storageBucket: "quickpay-e63bd.firebasestorage.app",
  messagingSenderId: "677633765004",
  appId: "1:677633765004:web:b0dffbe94bd1f70b0d15a9",
  measurementId: "G-2E1YRDJEXX"
};

// Initialize Firebase App singleton
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Safely initialize Analytics in browser context
export let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch((err) => {
    console.warn('Firebase Analytics not supported in this environment:', err);
  });
}
