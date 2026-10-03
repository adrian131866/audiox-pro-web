import { create } from 'zustand';
import { type Track } from '../types';

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  queue: Track[];
  currentTime: number;
  duration: number;
  isVideoMode: boolean;

  eqBands: number[];

  setCurrentTrack: (track: Track | null) => void;
  togglePlay: () => void;
  setVolume: (vol: number) => void;
  addToQueue: (track: Track) => void;
  clearQueue: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsVideoMode: (isVideo: boolean) => void;

  setEqBands: (bands: number[]) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentTrack: null,
  isPlaying: false,
  volume: 0.8,
  queue: [],
  currentTime: 0,
  duration: 0,
  isVideoMode: false,
  eqBands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 10 bandas en 0 dB por defecto

  setCurrentTrack: (track) => set({
    currentTrack: track,
    isPlaying: true,
    isVideoMode: track?.type === 'video' || false
  }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setVolume: (vol) => set({ volume: vol }),
  addToQueue: (track) => set((state) => ({ queue: [...state.queue, track] })),
  clearQueue: () => set({ queue: [] }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setIsVideoMode: (isVideo) => set({ isVideoMode: isVideo }),

  setEqBands: (bands) => set({ eqBands: bands }),
}));