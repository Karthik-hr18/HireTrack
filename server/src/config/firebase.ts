import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

if (!getApps().length) {
  const projectId = process.env.FIREBASE_PROJECT_ID || 'hiretrack-9145d';
  initializeApp({
    projectId
  });
}

export const firebaseAuth = getAuth();
