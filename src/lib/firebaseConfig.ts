import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';


const firebaseConfig = {
  apiKey: "AIzaSyAeGvzJX4f6YrhEkB4Ttywj8pYxlqJI5XI",
  authDomain: "swytch-pet.firebaseapp.com",
  databaseURL: "https://swytch-pet-default-rtdb.firebaseio.com",
  projectId: "swytch-pet",
  storageBucket: "swytch-pet.firebasestorage.app",
  messagingSenderId: "845433042703",
  appId: "1:845433042703:web:4587b195f97d14d412b07a"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { app };
