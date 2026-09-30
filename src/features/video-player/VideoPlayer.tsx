import { useEffect, useRef, useState } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  PictureInPicture2, SkipBack, SkipForward 
} from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { videoEngine } from '../../core/video/VideoEngine';

export const VideoPlayer = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { currentTrack, isPlaying, volume, currentTime, duration } = usePlayerStore();
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!currentTrack || currentTrack.type !== 'video') return;

    if (isPlaying) {
      videoEngine.play();
    } else {
      videoEngine.pause();
    }
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    videoEngine.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    if (currentTrack?.type === 'video') {
      videoEngine.loadVideo(currentTrack.url);
    }
  }, [currentTrack]);

  useEffect(() => {
    const video = videoEngine.getVideoElement();
    const handleTimeUpdate = () => {
      usePlayerStore.getState().setCurrentTime(video.currentTime);
      usePlayerStore.getState().setDuration(video.duration || 0);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, []);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    videoEngine.seek(time);
    usePlayerStore.getState().setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    usePlayerStore.getState().setVolume(vol);
    if (vol === 0) setIsMuted(true);
    else setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    videoEngine.setMuted(!isMuted);
  };

  const toggleFullscreen = async () => {
    if (containerRef.current) {
      await videoEngine.toggleFullscreen(containerRef.current);
      setIsFullscreen(!isFullscreen);
    }
  };

  const togglePiP = async () => {
    await videoEngine.togglePictureInPicture();
  };

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    videoEngine.setPlaybackRate(rate);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentTrack || currentTrack.type !== 'video') {
    return null;
  }

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black group">
      {/* Elemento de video */}
      <video
        ref={(el) => {
          if (el && el !== videoEngine.getVideoElement()) {
          }
        }}
        className="w-full h-full object-contain"
        onEnded={() => usePlayerStore.getState().togglePlay()}
      />

      {/* Overlay de controles (aparece al hacer hover) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
        
        {/* Barra de progreso */}
        <div className="mb-4">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-ax-accent"
          />
          <div className="flex justify-between text-xs text-white mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controles inferiores */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => usePlayerStore.getState().togglePlay()} className="text-white hover:text-ax-accent">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button className="text-white hover:text-ax-accent">
              <SkipBack className="w-4 h-4" />
            </button>
            <button className="text-white hover:text-ax-accent">
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Volumen */}
            <div className="flex items-center gap-2">
              <button onClick={toggleMute} className="text-white hover:text-ax-accent">
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              />
            </div>

            {/* Velocidad */}
            <select
              value={playbackRate}
              onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
              className="bg-white/10 text-white text-xs rounded px-2 py-1 border border-white/20"
            >
              <option value="0.5">0.5x</option>
              <option value="1">1x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={togglePiP} className="text-white hover:text-ax-accent" title="Picture-in-Picture">
              <PictureInPicture2 className="w-4 h-4" />
            </button>
            <button onClick={toggleFullscreen} className="text-white hover:text-ax-accent">
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};