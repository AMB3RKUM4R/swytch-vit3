// src/lib/firebaseConfig.ts
import { initializeApp, getApps, getApp, FirebaseApp, FirebaseOptions } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged, Auth, User } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Declare global variables provided by the Canvas environment for robust type checking.
declare global {
  var __app_id: string | undefined;
  var __firebase_config: string | undefined;
  var __initial_auth_token: string | undefined;
}

// Default Firebase configuration for local development (using Vite environment variables).
// This is used as a fallback if the Canvas environment config is not available.
const defaultFirebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

// --- Firebase Initialization ---

let firebaseConfig: FirebaseOptions;

// Use the configuration provided by the Canvas environment if available.
if (typeof __firebase_config !== 'undefined' && __firebase_config) {
  try {
    firebaseConfig = JSON.parse(__firebase_config);
    console.log("Using Firebase config from Canvas environment.");
  } catch (e) {
    console.error("Error parsing __firebase_config, falling back to default:", e);
    firebaseConfig = defaultFirebaseConfig;
  }
} else {
  console.log("Using default Vite environment variables for Firebase config.");
  firebaseConfig = defaultFirebaseConfig;
}

// Initialize the Firebase app, ensuring only one instance is created per app ID.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const app: FirebaseApp = !getApps().some(existingApp => existingApp.name === appId)
  ? initializeApp(firebaseConfig, appId)
  : getApp(appId);

// Export singleton instances of Firestore and Auth services.
export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);


// --- Authentication Logic ---

/**
 * Performs the initial sign-in for the user.
 * It first attempts to sign in with a custom token if provided by the Canvas environment.
 * If the token is absent or fails, it falls back to signing in anonymously.
 * This function should be called once when the application loads.
 *
 * @returns {Promise<User | null>} A promise that resolves with the signed-in user object or null on failure.
 */
export const performInitialSignIn = async (): Promise<User | null> => {
  // If a user is already signed in, return the current user.
  if (auth.currentUser) {
    console.log("User already signed in:", auth.currentUser.uid);
    return auth.currentUser;
  }

  // Attempt to sign in with a custom token if available.
  if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
    try {
      const userCredential = await signInWithCustomToken(auth, __initial_auth_token);
      console.log("Successfully signed in with custom token.");
      return userCredential.user;
    } catch (error) {
      console.error("Custom token sign-in failed, falling back to anonymous:", error);
    }
  }

  // Fallback to anonymous sign-in.
  try {
    const userCredential = await signInAnonymously(auth);
    console.log("Successfully signed in anonymously.");
    return userCredential.user;
  } catch (error) {
    console.error("Anonymous sign-in failed:", error);
    return null;
  }
};

/**
 * Sets up a listener for Firebase authentication state changes.
 * This function wraps onAuthStateChanged to provide a clear way to react
 * to user sign-in/sign-out events throughout the application.
 *
 * @param {(user: User | null) => void} callback - The function to call when the auth state changes.
 * @returns {() => void} An unsubscribe function to clean up the listener.
 */
export const listenForAuthChanges = (callback: (user: User | null) => void): (() => void) => {
  return onAuthStateChanged(auth, callback);
};