import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoPlaceholderKeyForPublicRelease123",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "hiretrack-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hiretrack-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "hiretrack-demo.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:demoappid",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-DEMO12345"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
