import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Prevent multiple initializations in development
if (!getApps().length) {
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountKey) {
      const serviceAccount = JSON.parse(serviceAccountKey);
      initializeApp({
        credential: cert(serviceAccount),
      });
      console.log('Firebase Admin initialized successfully');
    } else {
      console.warn('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Firebase Admin features will be unavailable.');
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

export const adminAuth = getApps().length ? getAuth() : null as any;
export const adminDb = getApps().length ? getFirestore() : null as any;
