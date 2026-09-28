const DB_NAME = 'AudioXProDB';
const DB_VERSION = 1;
const PROFILES_STORE = 'profiles';

export interface AudioProfile {
  id: string;
  name: string;
  createdAt: number;
  eqBands: number[];       
  bassIntensity: number;  
  masterVolume: number;   
}

class DatabaseService {
  private db: IDBDatabase | null = null;

  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(PROFILES_STORE)) {
          const store = db.createObjectStore(PROFILES_STORE, { keyPath: 'id' });
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  async saveProfile(profile: AudioProfile): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(PROFILES_STORE, 'readwrite');
      const store = transaction.objectStore(PROFILES_STORE);
      const request = store.put(profile);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllProfiles(): Promise<AudioProfile[]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(PROFILES_STORE, 'readonly');
      const store = transaction.objectStore(PROFILES_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteProfile(id: string): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(PROFILES_STORE, 'readwrite');
      const store = transaction.objectStore(PROFILES_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async loadDefaultProfiles(): Promise<void> {
    const existing = await this.getAllProfiles();
    if (existing.length > 0) return;

    const defaults: AudioProfile[] = [
      {
        id: 'flat',
        name: 'Flat (Neutral)',
        createdAt: Date.now(),
        eqBands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        bassIntensity: 0,
        masterVolume: 0.8,
      },
      {
        id: 'rock',
        name: 'Rock',
        createdAt: Date.now(),
        eqBands: [5, 4, 3, 1, -1, -1, 0, 2, 3, 4],
        bassIntensity: 0.3,
        masterVolume: 0.8,
      },
      {
        id: 'pop',
        name: 'Pop',
        createdAt: Date.now(),
        eqBands: [-1, 1, 3, 4, 3, 0, -1, -1, 1, 2],
        bassIntensity: 0.2,
        masterVolume: 0.8,
      },
      {
        id: 'bass-boost',
        name: 'Bass Boost',
        createdAt: Date.now(),
        eqBands: [8, 7, 5, 2, 0, 0, 0, 0, 0, 0],
        bassIntensity: 0.8,
        masterVolume: 0.7,
      },
      {
        id: 'electronic',
        name: 'Electrónica',
        createdAt: Date.now(),
        eqBands: [6, 5, 2, 0, -2, 0, 2, 4, 5, 6],
        bassIntensity: 0.6,
        masterVolume: 0.75,
      },
      {
        id: 'vocal',
        name: 'Voz / Podcast',
        createdAt: Date.now(),
        eqBands: [-3, -2, 0, 2, 4, 5, 4, 2, 0, -2],
        bassIntensity: 0,
        masterVolume: 0.85,
      },
    ];

    for (const profile of defaults) {
      await this.saveProfile(profile);
    }
    console.log('📦 Perfiles predefinidos cargados en IndexedDB.');
  }

  async getProfilesSummary(): Promise<Pick<AudioProfile, 'id' | 'name' | 'createdAt'>[]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(PROFILES_STORE, 'readonly');
      const store = transaction.objectStore(PROFILES_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        
        const summary = request.result.map((p: AudioProfile) => ({
          id: p.id,
          name: p.name,
          createdAt: p.createdAt
        }));
        resolve(summary);
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export const dbService = new DatabaseService();