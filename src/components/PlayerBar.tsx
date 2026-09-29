import {
  Play, Pause, SkipBack, SkipForward,
  Shuffle, Repeat, Volume2, Music
} from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { audioEngine } from '../core/audio/AudioEngine';

export const PlayerBar = () => {
  const {
    currentTrack, isPlaying, volume,
    togglePlay, setVolume,
    nextTrack, previousTrack
  } = usePlayerStore();

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    audioEngine.setMasterVolume(newVolume);
  };

  const handlePlayPause = () => {
    if (!currentTrack) return;
    togglePlay();
  };

  const handleNext = () => {
    nextTrack();
  };

  const handlePrevious = () => {
    previousTrack();
  };

  return (
    <footer className="h-20 bg-ax-sidebar border-t border-ax-border flex items-center px-6 gap-6">
      {/* Info de la pista (izquierda) */}
      <div className="w-64 flex items-center gap-3">
        {currentTrack ? (
          <>
            <div className="w-12 h-12 bg-ax-card rounded-lg flex items-center justify-center">
              <Music className="w-6 h-6 text-ax-muted" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{currentTrack.name}</p>
              <p className="text-xs text-ax-muted">
                {currentTrack.type === 'video' ? 'Video' : 'Audio'}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="w-12 h-12 bg-ax-card rounded-lg flex items-center justify-center">
              <Music className="w-6 h-6 text-ax-muted" />
            </div>
            <div>
              <p className="text-sm font-medium text-ax-muted">No track loaded</p>
              <p className="text-xs text-ax-muted">Select a song to play</p>
            </div>
          </>
        )}
      </div>

      {/* Controles centrales */}
      <div className="flex-1 flex flex-col items-center gap-2">
        <div className="flex items-center gap-4">
          <button className="text-ax-muted hover:text-white transition-colors">
            <Shuffle className="w-4 h-4" />
          </button>

          {/* Botón Anterior - AHORA FUNCIONAL */}
          <button
            onClick={handlePrevious}
            disabled={!currentTrack}
            className={`transition-colors ${currentTrack ? 'text-ax-muted hover:text-white' : 'text-slate-700 cursor-not-allowed'
              }`}
          >
            <SkipBack className="w-5 h-5" />
          </button>

          {/* Botón Play/Pause */}
          <button
            onClick={handlePlayPause}
            disabled={!currentTrack}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${currentTrack
                ? 'bg-ax-accent hover:bg-ax-accentHover text-white'
                : 'bg-ax-card text-ax-muted cursor-not-allowed'
              }`}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>

          {/* Botón Siguiente - AHORA FUNCIONAL */}
          <button
            onClick={handleNext}
            disabled={!currentTrack}
            className={`transition-colors ${currentTrack ? 'text-ax-muted hover:text-white' : 'text-slate-700 cursor-not-allowed'
              }`}
          >
            <SkipForward className="w-5 h-5" />
          </button>

          <button className="text-ax-muted hover:text-white transition-colors">
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Barra de progreso (informativa por ahora) */}
        <div className="w-full max-w-xl flex items-center gap-3 text-xs text-ax-muted">
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

      {/* Volumen (derecha) */}
      <div className="w-48 flex items-center gap-3">
        <Volume2 className="w-4 h-4 text-ax-muted" />
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