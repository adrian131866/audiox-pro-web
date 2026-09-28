import { useEffect } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { audioEngine } from '../core/audio/AudioEngine';

export const useAudioPlayer = () => {
  const { currentTrack, isPlaying, volume } = usePlayerStore();

  useEffect(() => {
    if (currentTrack) {
      audioEngine.loadTrack(currentTrack.url);
    }
  }, [currentTrack]);

  useEffect(() => {
    if (!currentTrack) return;

    if (isPlaying) {
      audioEngine.play().catch(e => console.error('Error al reproducir:', e));
    } else {
      audioEngine.pause();
    }
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    audioEngine.setMasterVolume(volume);
  }, [volume]);
};