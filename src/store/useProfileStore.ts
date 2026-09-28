import { create } from 'zustand';
import type { AudioProfile } from '../core/storage/db';

interface ProfileState {
  profiles: AudioProfile[];
  currentProfileId: string | null;
  isLoading: boolean;

  loadProfiles: () => Promise<void>;
  saveProfile: (profile: AudioProfile) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  setCurrentProfile: (id: string | null) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profiles: [],
  currentProfileId: null,
  isLoading: false,

  loadProfiles: async () => {
    set({ isLoading: true });
    try {
      const { dbService } = await import('../core/storage/db');
      await dbService.loadDefaultProfiles();
      const profiles = await dbService.getAllProfiles();
      set({ profiles, isLoading: false });
    } catch (error) {
      console.error('Error al cargar perfiles:', error);
      set({ isLoading: false });
    }
  },

  saveProfile: async (profile) => {
    try {
      const { dbService } = await import('../core/storage/db');
      await dbService.saveProfile(profile);
      const profiles = await dbService.getAllProfiles();
      set({ profiles });
    } catch (error) {
      console.error('Error al guardar perfil:', error);
    }
  },

  deleteProfile: async (id) => {
    try {
      const { dbService } = await import('../core/storage/db');
      await dbService.deleteProfile(id);
      const profiles = await dbService.getAllProfiles();
      set({ profiles });
    } catch (error) {
      console.error('Error al eliminar perfil:', error);
    }
  },

  setCurrentProfile: (id) => set({ currentProfileId: id }),
}));