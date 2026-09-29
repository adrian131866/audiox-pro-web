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
  currentIndex: number; 

  setCurrentTrack: (track: Track | null) => void;
  togglePlay: () => void;
  setVolume: (vol: number) => void;
  addToQueue: (track: Track) => void;
  clearQueue: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsVideoMode: (isVideo: boolean) => void;
  nextTrack: () => void; 
  previousTrack: () => void; 
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  volume: 0.8,
  queue: [],
  currentTime: 0,
  duration: 0,
  isVideoMode: false,
  currentIndex: -1,

  setCurrentTrack: (track) => {
    const state = get();
    const index = track ? state.queue.findIndex(t => t.id === track.id) : -1;
    set({
      currentTrack: track,
      isPlaying: true,
      isVideoMode: track?.type === 'video' || false,
      currentIndex: index
    });
  },

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setVolume: (vol) => set({ volume: vol }),

  addToQueue: (track) => set((state) => ({ queue: [...state.queue, track] })),
  clearQueue: () => set({ queue: [], currentIndex: -1, currentTrack: null }),

  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setIsVideoMode: (isVideo) => set({ isVideoMode: isVideo }),

  nextTrack: () => {
    const state = get();
    if (state.queue.length === 0) return;

    const nextIndex = (state.currentIndex + 1) % state.queue.length;
    const nextTrack = state.queue[nextIndex];

    set({
      currentTrack: nextTrack,
      currentIndex: nextIndex,
      isPlaying: true,
      isVideoMode: nextTrack.type === 'video'
    });
  },
  previousTrack: () => {
    const state = get();
    if (state.queue.length === 0) return;

    const prevIndex = state.currentIndex <= 0 ? state.queue.length - 1 : state.currentIndex - 1;
    const prevTrack = state.queue[prevIndex];

    set({
      currentTrack: prevTrack,
      currentIndex: prevIndex,
      isPlaying: true,
      isVideoMode: prevTrack.type === 'video'
    });
  },
}));