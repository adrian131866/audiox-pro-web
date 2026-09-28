import { create } from 'zustand';
import type { Track } from '../types';

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  queue: Track[];
  currentTime: number;
  duration: number;
  isVideoMode: boolean;

  setCurrentTrack: (track: Track | null) => void;
  togglePlay: () => void;
  setVolume: (vol: number) => void;
  addToQueue: (track: Track) => void;
  clearQueue: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsVideoMode: (isVideo: boolean) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentTrack: null,
  isPlaying: false,
  volume: 0.8,
  queue: [],
  currentTime: 0,
  duration: 0,
  isVideoMode: false,

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
}));