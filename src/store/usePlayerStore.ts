import { create } from 'zustand';
import { type Track } from '../types';

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  queue: Track[];
  currentIndex: number;
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

  nextTrack: () => void;
  previousTrack: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  volume: 0.8,
  queue: [],
  currentIndex: 0,
  currentTime: 0,
  duration: 0,
  isVideoMode: false,
  eqBands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],

  setCurrentTrack: (track) => set({
    currentTrack: track,
    isPlaying: true,
    isVideoMode: track?.type === 'video' || false
  }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setVolume: (vol) => set({ volume: vol }),
  addToQueue: (track) => set((state) => ({ queue: [...state.queue, track] })),
  clearQueue: () => set({ queue: [], currentIndex: 0 }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setIsVideoMode: (isVideo) => set({ isVideoMode: isVideo }),
  setEqBands: (bands) => set({ eqBands: bands }),

  nextTrack: () => {
    const { queue, currentIndex } = get();
    if (queue.length === 0) return;

    const nextIndex = (currentIndex + 1) % queue.length;
    const next = queue[nextIndex];

    set({
      currentTrack: next,
      currentIndex: nextIndex,
      isPlaying: true,
      isVideoMode: next?.type === 'video' || false,
      currentTime: 0
    });
  },

  previousTrack: () => {
    const { queue, currentIndex } = get();
    if (queue.length === 0) return;

    const prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1;
    const prev = queue[prevIndex];

    set({
      currentTrack: prev,
      currentIndex: prevIndex,
      isPlaying: true,
      isVideoMode: prev?.type === 'video' || false,
      currentTime: 0
    });
  },
}));