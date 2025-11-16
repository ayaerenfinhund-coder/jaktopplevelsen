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
  limit,
  startAfter,
  Timestamp,
  DocumentSnapshot,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import type { Hunt, HuntFilters, PaginatedResponse } from '../types';

const getUserHuntsRef = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('Bruker ikke pålogget');
  return collection(db, 'users', user.uid, 'hunts');
};

export const huntService = {
  /**
   * Opprett ny jakttur
   */
  async create(huntData: Omit<Hunt, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const huntsRef = getUserHuntsRef();
    const docRef = await addDoc(huntsRef, {
      ...huntData,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });
    return docRef.id;
  },

  /**
   * Hent alle jaktturer med paginering
   */
  async list(
    pageSize: number = 10,
    lastDoc?: DocumentSnapshot,
    filters?: HuntFilters
  ): Promise<PaginatedResponse<Hunt>> {
    const huntsRef = getUserHuntsRef();
    let q = query(huntsRef, orderBy('date', 'desc'));

    // Filtrer etter dato
    if (filters?.date_from) {
      q = query(q, where('date', '>=', filters.date_from));
    }
    if (filters?.date_to) {
      q = query(q, where('date', '<=', filters.date_to));
    }

    // Filtrer etter favoritt
    if (filters?.is_favorite !== undefined) {
      q = query(q, where('is_favorite', '==', filters.is_favorite));
    }

    // Paginering
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }
    q = query(q, limit(pageSize));

    const snapshot = await getDocs(q);
    const hunts: Hunt[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      hunts.push({
        id: doc.id,
        ...data,
        date: data.date?.toDate?.() || data.date,
        created_at: data.created_at?.toDate?.() || data.created_at,
        updated_at: data.updated_at?.toDate?.() || data.updated_at,
      } as Hunt);
    });

    return {
      items: hunts,
      total: hunts.length,
      page: 1,
      page_size: pageSize,
      total_pages: 1,
    };
  },

  /**
   * Hent en spesifikk jakttur
   */
  async get(huntId: string): Promise<Hunt | null> {
    const user = auth.currentUser;
    if (!user) throw new Error('Bruker ikke pålogget');

    const huntRef = doc(db, 'users', user.uid, 'hunts', huntId);
    const snapshot = await getDoc(huntRef);

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data();
    return {
      id: snapshot.id,
      ...data,
      date: data.date?.toDate?.() || data.date,
      created_at: data.created_at?.toDate?.() || data.created_at,
      updated_at: data.updated_at?.toDate?.() || data.updated_at,
    } as Hunt;
  },

  /**
   * Oppdater jakttur
   */
  async update(huntId: string, updates: Partial<Hunt>): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Bruker ikke pålogget');

    const huntRef = doc(db, 'users', user.uid, 'hunts', huntId);
    await updateDoc(huntRef, {
      ...updates,
      updated_at: Timestamp.now(),
    });
  },

  /**
   * Slett jakttur
   */
  async delete(huntId: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Bruker ikke pålogget');

    const huntRef = doc(db, 'users', user.uid, 'hunts', huntId);
    await deleteDoc(huntRef);
  },

  /**
   * Veksle favoritt-status
   */
  async toggleFavorite(huntId: string): Promise<boolean> {
    const hunt = await this.get(huntId);
    if (!hunt) throw new Error('Jakttur ikke funnet');

    const newStatus = !hunt.is_favorite;
    await this.update(huntId, { is_favorite: newStatus });
    return newStatus;
  },
};
