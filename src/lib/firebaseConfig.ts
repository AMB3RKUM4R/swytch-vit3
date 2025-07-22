// src/lib/firebaseConfig.ts
import { initializeApp, getApps, getApp, FirebaseApp, FirebaseOptions } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
// Removed: import { getStorage, FirebaseStorage } from 'firebase/storage'; // Firebase Storage removed

// Declare global variables provided by the Canvas environment (optional for local dev)
declare global {
  var __app_id: string | undefined;
  var __firebase_config: string | undefined;
  var __initial_auth_token: string | undefined;
}

// Define a default Firebase configuration using Vite environment variables
// This will be used if __firebase_config is NOT provided by the Canvas environment.
const defaultFirebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'YOUR_DEFAULT_VITE_API_KEY', // Replace with a real default if needed
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'YOUR_DEFAULT_VITE_AUTH_DOMAIN',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'YOUR_DEFAULT_VITE_PROJECT_ID',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'YOUR_DEFAULT_VITE_STORAGE_BUCKET', // Still needs to be defined in config but won't be used
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_DEFAULT_VITE_MESSAGING_SENDER_ID',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'YOUR_DEFAULT_VITE_APP_ID',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'YOUR_DEFAULT_VITE_DATABASE_URL',
};

// Determine the Firebase configuration to use
let firebaseConfig: FirebaseOptions;

// Check if __firebase_config is provided by the Canvas environment
if (typeof __firebase_config !== 'undefined' && __firebase_config) {
  try {
    firebaseConfig = JSON.parse(__firebase_config);
    console.log("Using Firebase config from Canvas environment.");
  } catch (e) {
    console.error("Error parsing __firebase_config from Canvas, falling back to default:", e);
    firebaseConfig = defaultFirebaseConfig;
  }
} else {
  console.log("Canvas __firebase_config not found, using default Vite environment variables.");
  firebaseConfig = defaultFirebaseConfig;
}

// Initialize Firebase only once per unique app ID
// The __app_id is provided by the Canvas environment to ensure unique app instances.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const app: FirebaseApp = !getApps().some(existingApp => existingApp.name === appId)
  ? initializeApp(firebaseConfig, appId)
  : getApp(appId);

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
// Removed: export const storage: FirebaseStorage = getStorage(app); // Firebase Storage removed

/**
 * Initializes Firebase authentication and sets up a persistent auth state listener.
 * This function should be called in a top-level component (e.g., App.tsx) or auth hook.
 * It ensures a user is signed in (anonymously or via custom token) and provides a cleanup function.
 *
 * @returns {() => void} A cleanup function to unsubscribe from the auth state listener.
 */
export const initializeFirebaseAuthAndListen = (): (() => void) => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log("Firebase auth state changed: User is signed in.", user.uid);
    } else if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
      try {
        await signInWithCustomToken(auth, __initial_auth_token);
        console.log("Signed in with custom token from Canvas.");
      } catch (error) {
        console.error("Firebase custom token sign-in error, falling back to anonymous:", error);
        try {
          await signInAnonymously(auth);
          console.log("Signed in anonymously after custom token failure.");
        } catch (anonError) {
          console.error("Firebase anonymous sign-in error:", anonError);
        }
      }
    } else {
      try {
        await signInAnonymously(auth);
        console.log("Signed in anonymously.");
      } catch (error) {
        console.error("Firebase anonymous sign-in error:", error);
      }
    }
  });

  return unsubscribe;
};
