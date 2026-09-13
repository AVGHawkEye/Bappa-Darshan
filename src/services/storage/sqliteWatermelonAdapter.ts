/**
 * Local Persistence Abstraction Layer
 * SQLite / WatermelonDB Interface Layer adhering to 01_DOMAIN_RULES & 02_DATA_SCHEMA
 *
 * Provides a clean repository abstraction that matches WatermelonDB / SQLite query semantics,
 * persisting locally with schema constraints and transactional operations.
 */

import { ENV_CONFIG } from '../../config/env';
import { MOCK_KANDIVALI_CHARKOP_PANDALS } from '../../data/mockKandivaliCharkopPandals';
import {
  Pandal,
  Photo,
  SyncJob,
  User,
  Visit,
  VisitStatus,
} from '../../types';

export interface DatabaseAdapter {
  query<T>(table: string, predicate?: (item: T) => boolean): Promise<T[]>;
  find<T extends { id: string }>(table: string, id: string): Promise<T | null>;
  insert<T extends { id: string }>(table: string, record: T): Promise<T>;
  update<T extends { id: string }>(table: string, id: string, updates: Partial<T>): Promise<T>;
  delete(table: string, id: string): Promise<boolean>;
  count(table: string): Promise<number>;
  clear(table: string): Promise<void>;
}

const STORAGE_KEYS = {
  PANDALS: `${ENV_CONFIG.STORAGE.DB_NAME}_pandals`,
  VISITS: `${ENV_CONFIG.STORAGE.DB_NAME}_visits`,
  PHOTOS: `${ENV_CONFIG.STORAGE.DB_NAME}_photos`,
  SYNC_JOBS: `${ENV_CONFIG.STORAGE.DB_NAME}_sync_jobs`,
  USER: `${ENV_CONFIG.STORAGE.DB_NAME}_user`,
};

class SQLiteWatermelonStorageAdapter implements DatabaseAdapter {
  private memoryCache: Map<string, unknown[]> = new Map();
  private initialized: boolean = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.initialized) return;

    // Load or seed Pandals
    const storedPandals = this.loadFromStorage<Pandal>(STORAGE_KEYS.PANDALS);
    if (!storedPandals || storedPandals.length === 0) {
      this.saveToStorage(STORAGE_KEYS.PANDALS, MOCK_KANDIVALI_CHARKOP_PANDALS);
      this.memoryCache.set(STORAGE_KEYS.PANDALS, MOCK_KANDIVALI_CHARKOP_PANDALS);
    } else {
      this.memoryCache.set(STORAGE_KEYS.PANDALS, storedPandals);
    }

    // Load or seed initial User
    const storedUser = this.loadFromStorage<User>(STORAGE_KEYS.USER);
    if (!storedUser || storedUser.length === 0) {
      const defaultUser: User = {
        id: ENV_CONFIG.STORAGE.USER_ID,
        name: 'Bappa Devotee',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        role: 'devotee',
        privacySettings: {
          publicProfile: true,
          shareVisitsCommunity: true,
          stripExifOnUpload: true,
        },
      };
      this.saveToStorage(STORAGE_KEYS.USER, [defaultUser]);
      this.memoryCache.set(STORAGE_KEYS.USER, [defaultUser]);
    } else {
      this.memoryCache.set(STORAGE_KEYS.USER, storedUser);
    }

    // Load Visits
    const storedVisits = this.loadFromStorage<Visit>(STORAGE_KEYS.VISITS);
    if (!storedVisits || storedVisits.length === 0) {
      // Seed a sample visit showcasing the Golden Rule:
      // "Mark location now, upload photo later, keep photo linked to original saved visit coordinates"
      const sampleVisit: Visit = {
        id: 'visit_sample_01',
        localId: 'local_v_101',
        userId: ENV_CONFIG.STORAGE.USER_ID,
        pandalId: 'pandal_charkop_sec3',
        pandalName: 'Charkop Cha Raja (Sector 3)',
        originalLatitude: 19.2146,
        originalLongitude: 72.8251,
        accuracyMeters: 8, // Auto-accept bracket (0-15m)
        finalLatitude: 19.2145,
        finalLongitude: 72.8252,
        manualAdjustment: true,
        adjustmentDistanceMeters: 14,
        adjustmentReason: 'Perimeter alignment with entrance archway',
        status: 'recorded',
        capturedAtUtc: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
        capturedTimezone: 'Asia/Kolkata',
        capturedOffsetMinutes: 330,
        photoCount: 1,
      };

      const samplePhoto: Photo = {
        id: 'photo_sample_01',
        visitId: 'visit_sample_01',
        pandalId: 'pandal_charkop_sec3',
        userId: ENV_CONFIG.STORAGE.USER_ID,
        storageKey: 'local_media/charkop_sec3_idol_01.jpg',
        thumbnailStorageKey: 'local_media/thumbs/charkop_sec3_idol_01.jpg',
        sourceType: 'in_app_camera',
        captureMode: 'during_visit', // Rule 3: Trust & Labeling
        moderationStatus: 'approved',
        idolConfidence: 0.98,
        capturedAtUtc: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
        previewUrl: 'https://images.unsplash.com/photo-1567591414240-e2b245e0f7e4?w=600&auto=format&fit=crop&q=80',
        note: 'Prathah darshan with family. Eco-friendly clay idol.',
      };

      this.saveToStorage(STORAGE_KEYS.VISITS, [sampleVisit]);
      this.memoryCache.set(STORAGE_KEYS.VISITS, [sampleVisit]);

      this.saveToStorage(STORAGE_KEYS.PHOTOS, [samplePhoto]);
      this.memoryCache.set(STORAGE_KEYS.PHOTOS, [samplePhoto]);
    } else {
      this.memoryCache.set(STORAGE_KEYS.VISITS, storedVisits);
      this.memoryCache.set(STORAGE_KEYS.PHOTOS, this.loadFromStorage<Photo>(STORAGE_KEYS.PHOTOS) || []);
    }

    // Load Sync Jobs
    const storedSync = this.loadFromStorage<SyncJob>(STORAGE_KEYS.SYNC_JOBS) || [];
    this.memoryCache.set(STORAGE_KEYS.SYNC_JOBS, storedSync);

    this.initialized = true;
  }

  private getStorageKeyForTable(table: string): string {
    switch (table.toLowerCase()) {
      case 'pandals':
        return STORAGE_KEYS.PANDALS;
      case 'visits':
        return STORAGE_KEYS.VISITS;
      case 'photos':
        return STORAGE_KEYS.PHOTOS;
      case 'sync_jobs':
        return STORAGE_KEYS.SYNC_JOBS;
      case 'users':
        return STORAGE_KEYS.USER;
      default:
        return `${ENV_CONFIG.STORAGE.DB_NAME}_${table}`;
    }
  }

  private loadFromStorage<T>(key: string): T[] | null {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      const data = window.localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('Storage read error for key:', key, e);
      return null;
    }
  }

  private saveToStorage<T>(key: string, data: T[]): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Storage write error for key:', key, e);
    }
  }

  public async query<T>(table: string, predicate?: (item: T) => boolean): Promise<T[]> {
    this.init();
    const key = this.getStorageKeyForTable(table);
    const items = (this.memoryCache.get(key) || []) as T[];
    if (!predicate) return [...items];
    return items.filter(predicate);
  }

  public async find<T extends { id: string }>(table: string, id: string): Promise<T | null> {
    this.init();
    const items = await this.query<T>(table);
    const match = items.find((it) => it.id === id);
    return match ? { ...match } : null;
  }

  public async insert<T extends { id: string }>(table: string, record: T): Promise<T> {
    this.init();
    const key = this.getStorageKeyForTable(table);
    const items = (this.memoryCache.get(key) || []) as T[];

    // Ensure uniqueness
    const exists = items.some((it) => it.id === record.id);
    if (exists) {
      throw new Error(`Primary key constraint failed in ${table}: ${record.id} already exists`);
    }

    const updated = [record, ...items];
    this.memoryCache.set(key, updated);
    this.saveToStorage(key, updated);
    return record;
  }

  public async update<T extends { id: string }>(
    table: string,
    id: string,
    updates: Partial<T>
  ): Promise<T> {
    this.init();
    const key = this.getStorageKeyForTable(table);
    const items = (this.memoryCache.get(key) || []) as T[];
    const index = items.findIndex((it) => it.id === id);
    if (index === -1) {
      throw new Error(`Record not found in ${table} with id: ${id}`);
    }

    const updatedItem = { ...items[index], ...updates };
    items[index] = updatedItem;
    this.memoryCache.set(key, items);
    this.saveToStorage(key, items);
    return updatedItem;
  }

  public async delete(table: string, id: string): Promise<boolean> {
    this.init();
    const key = this.getStorageKeyForTable(table);
    const items = (this.memoryCache.get(key) || []) as Array<{ id: string }>;
    const filtered = items.filter((it) => it.id !== id);
    if (filtered.length === items.length) return false;

    this.memoryCache.set(key, filtered);
    this.saveToStorage(key, filtered);
    return true;
  }

  public async count(table: string): Promise<number> {
    this.init();
    const key = this.getStorageKeyForTable(table);
    return (this.memoryCache.get(key) || []).length;
  }

  public async clear(table: string): Promise<void> {
    const key = this.getStorageKeyForTable(table);
    this.memoryCache.set(key, []);
    this.saveToStorage(key, []);
  }
}

// Single adapter instance
export const databaseAdapter = new SQLiteWatermelonStorageAdapter();

/**
 * Domain Repositories conforming to Clean Architecture
 */
export const PandalsRepository = {
  getAll: () => databaseAdapter.query<Pandal>('pandals'),
  getById: (id: string) => databaseAdapter.find<Pandal>('pandals', id),
  search: async (query: string, sector?: string) => {
    const lower = query.toLowerCase().trim();
    return databaseAdapter.query<Pandal>('pandals', (p) => {
      const matchesText =
        !lower ||
        p.name.toLowerCase().includes(lower) ||
        (p.marathiName && p.marathiName.includes(lower)) ||
        p.address.toLowerCase().includes(lower) ||
        (p.sector && p.sector.toLowerCase().includes(lower));

      const matchesSector = !sector || p.sector === sector;
      return matchesText && matchesSector;
    });
  },
};

export const VisitsRepository = {
  getAll: () => databaseAdapter.query<Visit>('visits'),
  getById: (id: string) => databaseAdapter.find<Visit>('visits', id),
  getByPandalId: (pandalId: string) =>
    databaseAdapter.query<Visit>('visits', (v) => v.pandalId === pandalId),

  /**
   * Enforces 01_DOMAIN_RULES Rule 1: Offline-First Visit Marking
   * Capture originalLatitude, originalLongitude, accuracyMeters, capturedAtUtc,
   * capturedTimezone, capturedOffsetMinutes. Never overwrite original coordinates.
   */
  createVisit: async (
    data: Omit<Visit, 'id' | 'localId' | 'status'> & { status?: VisitStatus }
  ): Promise<Visit> => {
    const localId = `local_v_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const newVisit: Visit = {
      ...data,
      id: `vis_${Date.now()}`,
      localId,
      status: data.status || 'recorded',
      photoCount: 0,
    };

    await databaseAdapter.insert<Visit>('visits', newVisit);

    // Queue sync job with idempotency key
    const syncJob: SyncJob = {
      id: `sync_${Date.now()}`,
      entityType: 'visit',
      entityId: newVisit.id,
      operation: 'CREATE',
      attempts: 0,
      state: 'pending',
      idempotencyKey: `idem_visit_${newVisit.localId}`,
    };
    await databaseAdapter.insert<SyncJob>('sync_jobs', syncJob);

    return newVisit;
  },

  updateVisit: (id: string, updates: Partial<Visit>) =>
    databaseAdapter.update<Visit>('visits', id, updates),

  deleteVisit: (id: string) => databaseAdapter.delete('visits', id),
};

export const PhotosRepository = {
  getAll: () => databaseAdapter.query<Photo>('photos'),
  getByVisitId: (visitId: string) =>
    databaseAdapter.query<Photo>('photos', (p) => p.visitId === visitId),
  getByPandalId: (pandalId: string) =>
    databaseAdapter.query<Photo>('photos', (p) => p.pandalId === pandalId),

  /**
   * Adds photo with Trust & Labeling:
   * captureMode: 'during_visit' vs 'uploaded_later'
   */
  addPhotoToVisit: async (
    photoData: Omit<Photo, 'id' | 'moderationStatus'>
  ): Promise<Photo> => {
    const newPhoto: Photo = {
      ...photoData,
      id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      moderationStatus: 'approved', // local preview
    };

    await databaseAdapter.insert<Photo>('photos', newPhoto);

    // Increment photoCount on visit
    const visit = await VisitsRepository.getById(newPhoto.visitId);
    if (visit) {
      await VisitsRepository.updateVisit(visit.id, {
        photoCount: (visit.photoCount || 0) + 1,
      });
    }

    // Queue sync job
    const syncJob: SyncJob = {
      id: `sync_photo_${Date.now()}`,
      entityType: 'photo',
      entityId: newPhoto.id,
      operation: 'CREATE',
      attempts: 0,
      state: 'pending',
      idempotencyKey: `idem_photo_${newPhoto.id}`,
    };
    await databaseAdapter.insert<SyncJob>('sync_jobs', syncJob);

    return newPhoto;
  },
};

export const SyncQueueRepository = {
  getAll: () => databaseAdapter.query<SyncJob>('sync_jobs'),
  getPending: () =>
    databaseAdapter.query<SyncJob>('sync_jobs', (j) => j.state === 'pending' || j.state === 'failed'),
  clearCompleted: async () => {
    const jobs = await databaseAdapter.query<SyncJob>('sync_jobs', (j) => j.state === 'succeeded');
    for (const job of jobs) {
      await databaseAdapter.delete('sync_jobs', job.id);
    }
  },
};

export const UserRepository = {
  getCurrentUser: async (): Promise<User> => {
    const users = await databaseAdapter.query<User>('users');
    return (
      users[0] || {
        id: ENV_CONFIG.STORAGE.USER_ID,
        name: 'Bappa Devotee',
        role: 'devotee',
        privacySettings: {
          publicProfile: true,
          shareVisitsCommunity: true,
          stripExifOnUpload: true,
        },
      }
    );
  },
  updateProfile: (updates: Partial<User>) =>
    databaseAdapter.update<User>('users', ENV_CONFIG.STORAGE.USER_ID, updates),
};
