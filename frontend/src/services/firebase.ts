import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Firebase-konfigurasjon - Erstatt med dine egne verdier
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'din-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'ditt-prosjekt.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'ditt-prosjekt-id',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'ditt-prosjekt.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abc123',
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Eksporter tjenester
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'europe-west1');

export default app;
