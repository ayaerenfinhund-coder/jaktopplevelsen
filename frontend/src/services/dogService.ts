import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import type { Dog } from '../types';

const getUserDogsRef = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('Bruker ikke pålogget');
  return collection(db, 'users', user.uid, 'dogs');
};

export const dogService = {
  /**
   * Opprett ny hund
   */
  async create(dogData: Omit<Dog, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const dogsRef = getUserDogsRef();
    const docRef = await addDoc(dogsRef, {
      ...dogData,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });
    return docRef.id;
  },

  /**
   * Hent alle hunder
   */
  async list(): Promise<Dog[]> {
    const dogsRef = getUserDogsRef();
    const q = query(dogsRef, orderBy('name'));
    const snapshot = await getDocs(q);

    const dogs: Dog[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      dogs.push({
        id: doc.id,
        ...data,
        birth_date: data.birth_date?.toDate?.() || data.birth_date,
        created_at: data.created_at?.toDate?.() || data.created_at,
        updated_at: data.updated_at?.toDate?.() || data.updated_at,
      } as Dog);
    });

    return dogs;
  },

  /**
   * Hent aktive hunder
   */
  async listActive(): Promise<Dog[]> {
    const dogsRef = getUserDogsRef();
    const q = query(dogsRef, where('is_active', '==', true), orderBy('name'));
    const snapshot = await getDocs(q);

    const dogs: Dog[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      dogs.push({
        id: doc.id,
        ...data,
        birth_date: data.birth_date?.toDate?.() || data.birth_date,
        created_at: data.created_at?.toDate?.() || data.created_at,
        updated_at: data.updated_at?.toDate?.() || data.updated_at,
      } as Dog);
    });

    return dogs;
  },

  /**
   * Hent en spesifikk hund
   */
  async get(dogId: string): Promise<Dog | null> {
    const user = auth.currentUser;
    if (!user) throw new Error('Bruker ikke pålogget');

    const dogRef = doc(db, 'users', user.uid, 'dogs', dogId);
    const snapshot = await getDoc(dogRef);

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data();
    return {
      id: snapshot.id,
      ...data,
      birth_date: data.birth_date?.toDate?.() || data.birth_date,
      created_at: data.created_at?.toDate?.() || data.created_at,
      updated_at: data.updated_at?.toDate?.() || data.updated_at,
    } as Dog;
  },

  /**
   * Oppdater hund
   */
  async update(dogId: string, updates: Partial<Dog>): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Bruker ikke pålogget');

    const dogRef = doc(db, 'users', user.uid, 'dogs', dogId);
    await updateDoc(dogRef, {
      ...updates,
      updated_at: Timestamp.now(),
    });
  },

  /**
   * Slett hund (myk sletting - marker som inaktiv)
   */
  async delete(dogId: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Bruker ikke pålogget');

    const dogRef = doc(db, 'users', user.uid, 'dogs', dogId);
    await updateDoc(dogRef, {
      is_active: false,
      updated_at: Timestamp.now(),
    });
  },
};
