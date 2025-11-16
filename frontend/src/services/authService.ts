import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { User, UserSettings } from '../types';

const defaultSettings: UserSettings = {
  theme: 'dark',
  language: 'no',
  units: 'metric',
  map_style: 'terrain',
  auto_sync_garmin: false,
  notification_preferences: {
    email_summary: true,
    new_track_imported: true,
    backup_reminder: true,
  },
};

export const authService = {
  /**
   * Registrer ny bruker
   */
  async register(
    email: string,
    password: string,
    name: string
  ): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Oppdater profil med navn
    await updateProfile(userCredential.user, { displayName: name });

    // Opprett brukerdokument i Firestore
    const userDoc = {
      email,
      name,
      avatar_url: null,
      settings: defaultSettings,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), userDoc);

    return {
      id: userCredential.user.uid,
      email,
      name,
      settings: defaultSettings,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  /**
   * Logg inn
   */
  async signIn(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    const data = userDoc.data();

    return {
      id: userCredential.user.uid,
      email: userCredential.user.email!,
      name: data?.name || userCredential.user.displayName || '',
      avatar_url: data?.avatar_url,
      settings: data?.settings || defaultSettings,
      created_at: data?.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
      updated_at: data?.updated_at?.toDate?.()?.toISOString() || new Date().toISOString(),
    };
  },

  /**
   * Logg ut
   */
  async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  },

  /**
   * Hent nåværende bruker
   */
  async getCurrentUser(): Promise<User | null> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;

    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    const data = userDoc.data();

    if (!data) return null;

    return {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      name: data.name || firebaseUser.displayName || '',
      avatar_url: data.avatar_url,
      settings: data.settings || defaultSettings,
      created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
      updated_at: data.updated_at?.toDate?.()?.toISOString() || new Date().toISOString(),
    };
  },

  /**
   * Oppdater brukerinnstillinger
   */
  async updateSettings(settings: Partial<UserSettings>): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Bruker ikke pålogget');

    const userRef = doc(db, 'users', user.uid);
    const currentDoc = await getDoc(userRef);
    const currentSettings = currentDoc.data()?.settings || defaultSettings;

    await updateDoc(userRef, {
      settings: { ...currentSettings, ...settings },
      updated_at: Timestamp.now(),
    });
  },

  /**
   * Oppdater brukerprofil
   */
  async updateProfile(updates: { name?: string; avatar_url?: string }): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Bruker ikke pålogget');

    if (updates.name) {
      await updateProfile(user, { displayName: updates.name });
    }

    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      ...updates,
      updated_at: Timestamp.now(),
    });
  },

  /**
   * Lytt til autentiseringsstatus
   */
  onAuthStateChange(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  },
};
