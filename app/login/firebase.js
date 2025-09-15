// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only on client-side and when config is available
let app = null;
let auth = null;
let db = null;
let storage = null;
let googleProvider = null;
let githubProvider = null;

// Function to initialize Firebase
const initializeFirebase = () => {
  if (typeof window !== 'undefined' && !app) {
    // Check if all required config values are present
    const hasValidConfig = Object.values(firebaseConfig).every(value => value && value !== 'undefined');
    
    if (hasValidConfig) {
      try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
        googleProvider = new GoogleAuthProvider();
        githubProvider = new GithubAuthProvider();
      } catch (error) {
        console.warn('Firebase initialization failed:', error);
      }
    } else {
      console.warn('Firebase configuration is incomplete. Some features may not work.');
    }
  }
  return { app, auth, db, storage, googleProvider, githubProvider };
};

// Initialize on first import if we're on client-side
if (typeof window !== 'undefined') {
  initializeFirebase();
}

// Export function to get Firebase instances
export const getFirebaseInstances = () => {
  if (!app && typeof window !== 'undefined') {
    initializeFirebase();
  }
  return { app, auth, db, storage, googleProvider, githubProvider };
};

// Export individual instances for backward compatibility
export { app, auth, db, storage, googleProvider, githubProvider };

// Export initialization function for manual initialization if needed
export { initializeFirebase };
