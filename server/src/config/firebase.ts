import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

if (!getApps().length) {
  const projectId = process.env.FIREBASE_PROJECT_ID || 'hiretrack-9145d';
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    privateKey = privateKey.trim();
    if ((privateKey.startsWith('"') && privateKey.endsWith('"')) || (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
      privateKey = privateKey.substring(1, privateKey.length - 1);
    }
    privateKey = privateKey.replace(/\\n/g, '\n');

    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}`;
    }
    if (!privateKey.includes('-----END PRIVATE KEY-----')) {
      privateKey = `${privateKey.trim()}\n-----END PRIVATE KEY-----\n`;
    }
  }

  let initialized = false;
  if (clientEmail && privateKey) {
    try {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey
        })
      });
      initialized = true;
    } catch (err: any) {
      console.warn('⚠️ Service Account initialization warning:', err.message);
    }
  }

  if (!initialized) {
    initializeApp({
      projectId
    });
  }
}

export const firebaseAuth = getAuth();
