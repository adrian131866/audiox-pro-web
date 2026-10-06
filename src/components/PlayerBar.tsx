// src/components/PlayerBar.tsx
import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  Music,
} from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { audioEngine } from '../core/audio/AudioEngine';

export const PlayerBar: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    volume,
    togglePlay,
    setVolume,
    nextTrack,
    previousTrack,
  } = usePlayerStore();

  const handlePlayPause = () => {
    if (!currentTrack) return;

    if (isPlaying) {
      audioEngine.pause();
    } else {
      audioEngine.play();
    }
    togglePlay();
  };

  const handleVolumeChange = (newVolume: number) => {
    audioEngine.setVolume(newVolume); 
    setVolume(newVolume);
  };

  const handleNext = () => {
    nextTrack();
  };

  const handlePrevious = () => {
    previousTrack();
  };

  return (
    <footer className="h-20 sm:h-20 bg-ax-sidebar border-t border-ax-border flex items-center px-3 sm:px-6 gap-3 sm:gap-6">
      {/* 1. INFORMACIÓN DE LA PISTA (IZQUIERDA) */}
      <div className="flex-1 flex items-center gap-3 min-w-0 max-w-[30%]">
        {currentTrack?.coverArt ? (
          <img
            src={currentTrack.coverArt}
            alt="Album cover"
            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-ax-card flex items-center justify-center flex-shrink-0">
            <Music className="w-6 h-6 text-ax-muted" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-white truncate">
            {currentTrack?.name || 'No track loaded'}
          </div>
          <div className="text-xs text-ax-muted truncate">
            {currentTrack?.artist || 'Select a song to play'}
          </div>
        </div>
      </div>

      {/* 2. CONTROLES DE REPRODUCCIÓN (CENTRO) */}
      <div className="flex-1 flex flex-col items-center gap-1 sm:gap-2">
        <div className="flex items-center gap-2 sm:gap-4">
          <button className="text-ax-muted hover:text-white transition-colors hidden sm:block">
            <Shuffle className="w-4 h-4" />
          </button>
          <button
            onClick={handlePrevious}
            className="text-ax-muted hover:text-white transition-colors"
            disabled={!currentTrack}
            aria-label="Previous track"
          >
            <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={handlePlayPause}
            disabled={!currentTrack}
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors ${
              currentTrack
                ? 'bg-ax-accent hover:bg-ax-accentHover text-white'
                : 'bg-ax-card text-ax-muted cursor-not-allowed'
            }`}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>
          <button
            onClick={handleNext}
            className="text-ax-muted hover:text-white transition-colors"
            disabled={!currentTrack}
            aria-label="Next track"
          >
            <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button className="text-ax-muted hover:text-white transition-colors hidden sm:block">
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Barra de progreso */}
        <div className="w-full max-w-xl flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-ax-muted">
          <span>0:00</span>
          <input
            type="range"
            min="0"
            max="100"
            value="0"
            className="flex-1"
            readOnly
          />
          <span>-0:00</span>
        </div>
      </div>

      {/* 3. CONTROL DE VOLUMEN (DERECHA) */}
      <div className="w-32 sm:w-48 flex items-center gap-2 sm:gap-3">
        <Volume2 className="w-4 h-4 text-ax-muted hidden sm:block" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          className="flex-1"
        />
      </div>
    </footer>
  );
};