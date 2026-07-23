import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA6YjFQEO2QsuV7Y-YUBgqjds5Lcnz6ya4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "hiretrack-9145d.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hiretrack-9145d",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "hiretrack-9145d.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "601061486299",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:601061486299:web:2e623f2c0f33feed2de6fe",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-3S62CDYCTQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
