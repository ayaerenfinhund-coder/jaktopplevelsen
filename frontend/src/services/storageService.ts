import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
} from 'firebase/storage';
import { storage, auth } from './firebase';

export const storageService = {
  /**
   * Last opp bilde for jakttur
   */
  async uploadPhoto(
    huntId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ url: string; thumbnailUrl: string; filename: string }> {
    const user = auth.currentUser;
    if (!user) throw new Error('Bruker ikke pålogget');

    const timestamp = Date.now();
    const filename = `${timestamp}_${file.name}`;
    const filePath = `users/${user.uid}/hunts/${huntId}/photos/${filename}`;
    const storageRef = ref(storage, filePath);

    // Last opp fil
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);

    // For nå bruker vi samme URL for thumbnail
    // I produksjon ville vi brukt Cloud Functions for å generere thumbnails
    const thumbnailUrl = url;

    return { url, thumbnailUrl, filename };
  },

  /**
   * Slett bilde
   */
  async deletePhoto(huntId: string, filename: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Bruker ikke pålogget');

    const filePath = `users/${user.uid}/hunts/${huntId}/photos/${filename}`;
    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);
  },

  /**
   * Last opp GPX-fil
   */
  async uploadGPX(file: File): Promise<{ url: string; filename: string }> {
    const user = auth.currentUser;
    if (!user) throw new Error('Bruker ikke pålogget');

    const timestamp = Date.now();
    const filename = `${timestamp}_${file.name}`;
    const filePath = `users/${user.uid}/gpx/${filename}`;
    const storageRef = ref(storage, filePath);

    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);

    return { url, filename };
  },

  /**
   * Last opp profilbilde
   */
  async uploadAvatar(file: File): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error('Bruker ikke pålogget');

    const filePath = `users/${user.uid}/avatar.${file.name.split('.').pop()}`;
    const storageRef = ref(storage, filePath);

    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  },

  /**
   * Last opp hundebilde
   */
  async uploadDogPhoto(dogId: string, file: File): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error('Bruker ikke pålogget');

    const filePath = `users/${user.uid}/dogs/${dogId}/photo.${file.name.split('.').pop()}`;
    const storageRef = ref(storage, filePath);

    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  },
};
