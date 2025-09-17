// src/lib/firebase.ts

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
// 1. Load your Firebase configuration from Vite's environment variables.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

// 2. Add a simple check to ensure your environment variables are loaded.
// This will prevent runtime errors if you forget to create your .env.local file.
if (!firebaseConfig.apiKey) {
  throw new Error("VITE_FIREBASE_API_KEY is not set. Check your .env.local file.");
}

// 3. Initialize the Firebase app using a singleton pattern.
// This prevents the app from being initialized multiple times.
const app: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

// 4. Export the initialized Firebase services you'll use throughout your app.
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

export { app }; // Export the app instance itself if needed