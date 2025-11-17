import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import type { Hunt } from '../types';

const HUNTS_COLLECTION = 'hunts';

export const huntsService = {
  /**
   * Get all hunts for the current user
   */
  async getUserHunts(): Promise<Hunt[]> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const huntsRef = collection(db, HUNTS_COLLECTION);
    const q = query(
      huntsRef,
      where('user_id', '==', user.uid),
      orderBy('date', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Hunt[];
  },

  /**
   * Get a single hunt by ID
   */
  async getHunt(huntId: string): Promise<Hunt | null> {
    const huntRef = doc(db, HUNTS_COLLECTION, huntId);
    const huntSnap = await getDoc(huntRef);

    if (!huntSnap.exists()) return null;

    return {
      id: huntSnap.id,
      ...huntSnap.data(),
    } as Hunt;
  },

  /**
   * Create a new hunt
   */
  async createHunt(hunt: Omit<Hunt, 'id'>): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const huntData = {
      ...hunt,
      user_id: user.uid,
      created_at: Timestamp.now().toDate().toISOString(),
      updated_at: Timestamp.now().toDate().toISOString(),
    };

    const docRef = await addDoc(collection(db, HUNTS_COLLECTION), huntData);
    return docRef.id;
  },

  /**
   * Update an existing hunt
   */
  async updateHunt(huntId: string, updates: Partial<Hunt>): Promise<void> {
    const huntRef = doc(db, HUNTS_COLLECTION, huntId);
    await updateDoc(huntRef, {
      ...updates,
      updated_at: Timestamp.now().toDate().toISOString(),
    });
  },

  /**
   * Delete a hunt
   */
  async deleteHunt(huntId: string): Promise<void> {
    const huntRef = doc(db, HUNTS_COLLECTION, huntId);
    await deleteDoc(huntRef);
  },
};
