
import { getStorage } from '@firebase/storage';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, TwitterAuthProvider, GithubAuthProvider, OAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ✅ Firebase configuration for Swytch
const firebaseConfig = {
  apiKey: "AIzaSyCsAAIDNNDEoeQj76eeBPs4np1BmtXoaME",
  authDomain: "swytch-338f6.firebaseapp.com",
  projectId: "swytch-338f6",
  storageBucket: "swytch-338f6.appspot.com",  // ⚠️ fixed typo (.app → .com)
  messagingSenderId: "624827141895",
  appId: "1:624827141895:web:7bbae5c5a42e811026ffa2",
  // databaseURL is optional if you're not using Realtime Database
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth and Providers
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const twitterProvider = new TwitterAuthProvider();
export const githubProvider = new GithubAuthProvider();
export const microsoftProvider = new OAuthProvider('microsoft.com');

export const db = getFirestore(app);
export const storage = getStorage(app);
