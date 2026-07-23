import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA6YjFQEO2QsuV7Y-YUBgqjds5Lcnz6ya4",
  authDomain: "hiretrack-9145d.firebaseapp.com",
  projectId: "hiretrack-9145d",
  storageBucket: "hiretrack-9145d.firebasestorage.app",
  messagingSenderId: "601061486299",
  appId: "1:601061486299:web:2e623f2c0f33feed2de6fe",
  measurementId: "G-3S62CDYCTQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
