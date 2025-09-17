import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// --- AUTO-DETECTS GOOGLE_APPLICATION_CREDENTIALS or your env/service json ---

const adminApp =
  global._adminApp ||
  initializeApp({
    credential: applicationDefault(),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET // Put your bucket name in .env if needed
  });

if (!global._adminApp) global._adminApp = adminApp;

const adminDb = getFirestore(adminApp);
const adminStorage = getStorage(adminApp);

export { adminDb, adminStorage };