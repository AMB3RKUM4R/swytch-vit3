// src/lib/firebaseConfig.ts
import { initializeApp, getApps, getApp, FirebaseApp, FirebaseOptions } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Declare global variables provided by the Canvas environment (optional for local dev)
declare global {
  var __app_id: string | undefined;
  var __firebase_config: string | undefined;
  var __initial_auth_token: string | undefined;
}

// Load environment variables from Vite
const {
  VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID,
  VITE_FIREBASE_DATABASE_URL,
} = import.meta.env;

const firebaseConfig: FirebaseOptions = {
  apiKey: VITE_FIREBASE_API_KEY || 'AIzaSyAeGvzJX4f6YrhEkB4Ttywj8pYxlqJI5XI',
  authDomain: VITE_FIREBASE_AUTH_DOMAIN || 'swytch-pet.firebaseapp.com',
  projectId: VITE_FIREBASE_PROJECT_ID || 'swytch-pet',
  storageBucket: VITE_FIREBASE_STORAGE_BUCKET || 'swytch-pet.firebasestorage.app',
  messagingSenderId: VITE_FIREBASE_MESSAGING_SENDER_ID || '845433042703',
  appId: VITE_FIREBASE_APP_ID || '1:845433042703:web:4587b195f97d14d412b07a',
  databaseURL: VITE_FIREBASE_DATABASE_URL || 'https://swytch-pet-default-rtdb.firebaseio.com',
};

// Initialize Firebase only once per unique app ID
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const app: FirebaseApp = !getApps().some(existingApp => existingApp.name === appId)
  ? initializeApp(firebaseConfig, appId)
  : getApp(appId);

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

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
    } else if (typeof __initial_auth_token !== 'undefined') {
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