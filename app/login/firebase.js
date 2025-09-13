import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only in browser environment
let app;
let auth;
let db;
let googleProvider;
let githubProvider;

const initializeFirebase = () => {
  if (typeof window !== 'undefined' && !app) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    githubProvider = new GithubAuthProvider();
  }
  return { app, auth, db, googleProvider, githubProvider };
};

// Getter functions that ensure Firebase is initialized
export const getFirebaseAuth = () => {
  if (typeof window === 'undefined') return null;
  if (!auth) initializeFirebase();
  return auth;
};

export const getFirebaseDb = () => {
  if (typeof window === 'undefined') return null;
  if (!db) initializeFirebase();
  return db;
};

export const getGoogleProvider = () => {
  if (typeof window === 'undefined') return null;
  if (!googleProvider) initializeFirebase();
  return googleProvider;
};

export const getGithubProvider = () => {
  if (typeof window === 'undefined') return null;
  if (!githubProvider) initializeFirebase();
  return githubProvider;
};

// Legacy exports for backward compatibility (will initialize on first access)
export { getFirebaseAuth as auth, getFirebaseDb as db, getGoogleProvider as googleProvider, getGithubProvider as githubProvider };