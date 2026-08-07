import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeFirestore, 
  getFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  Firestore
} from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import defaultConfig from '../../firebase-applet-config.json';

// Support environment variables (Vite import.meta.env) with fallback to config file
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || defaultConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || defaultConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || defaultConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || defaultConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || defaultConfig.appId,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || defaultConfig.firestoreDatabaseId,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

function getOrCreateFirestore(): Firestore {
  try {
    const dbSettings = {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    };
    return firebaseConfig.firestoreDatabaseId
      ? initializeFirestore(app, dbSettings, firebaseConfig.firestoreDatabaseId)
      : initializeFirestore(app, dbSettings);
  } catch (e) {
    // If initializeFirestore fails (e.g. already initialized), fallback to getFirestore
    return firebaseConfig.firestoreDatabaseId
      ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
      : getFirestore(app);
  }
}

export const db = getOrCreateFirestore();

export const auth = getAuth(app);

// Ensure user is signed in anonymously for Firestore access
signInAnonymously(auth).catch((err) => {
  // Gracefully log without breaking offline usage
  console.warn('Firebase anonymous auth info:', err?.message || err);
});


