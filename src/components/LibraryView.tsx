import { Music, Play, Clock } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import type { Track } from '../types';
import { DropZone } from './DropZone';

interface LibraryViewProps {
  onFilesSelected: (files: File[]) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ onFilesSelected }) => {
  const { queue, currentTrack, setCurrentTrack, isPlaying, togglePlay } = usePlayerStore();

  const handlePlayTrack = (track: Track) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      setCurrentTrack(track);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

 
  if (queue.length === 0) {
    return <DropZone onFilesSelected={onFilesSelected} />;
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 py-4">
      <div className="grid grid-cols-[40px_1fr_120px_80px] gap-4 px-4 py-2 text-xs font-medium text-ax-muted uppercase tracking-wider border-b border-ax-border">
        <div>#</div>
        <div>Title</div>
        <div>Duration</div>
        <div></div>
      </div>

      <div className="mt-2 space-y-1">
        {queue.map((track, index) => {
          const isCurrent = currentTrack?.id === track.id;
          return (
            <div
              key={track.id}
              onClick={() => handlePlayTrack(track)}
              className={`grid grid-cols-[40px_1fr_120px_80px] gap-4 px-4 py-3 rounded-lg cursor-pointer transition-colors group ${
                isCurrent
                  ? 'bg-ax-accent/10 border-l-2 border-ax-accent'
                  : 'hover:bg-ax-card/50'
              }`}
            >
              <div className="flex items-center text-sm text-ax-muted">
                {isCurrent && isPlaying ? (
                  <div className="flex items-end gap-0.5 h-4">
                    <div className="w-0.5 bg-ax-accent animate-[bounce_1s_infinite] h-2"></div>
                    <div className="w-0.5 bg-ax-accent animate-[bounce_1.2s_infinite] h-3"></div>
                    <div className="w-0.5 bg-ax-accent animate-[bounce_0.8s_infinite] h-2"></div>
                  </div>
                ) : (
                  <span className="group-hover:hidden">{index + 1}</span>
                )}
                <Play className="w-4 h-4 text-white hidden group-hover:block" />
              </div>

              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-ax-card rounded flex items-center justify-center flex-shrink-0">
                  <Music className="w-5 h-5 text-ax-muted" />
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-medium truncate ${isCurrent ? 'text-ax-accent' : 'text-white'}`}>
                    {track.name}
                  </p>
                  <p className="text-xs text-ax-muted truncate">
                    {track.type === 'video' ? 'Video' : 'Audio'} • {track.file.type || 'unknown'}
                  </p>
                </div>
              </div>

              <div className="flex items-center text-sm text-ax-muted">
                <Clock className="w-3 h-3 mr-1" />
                {formatDuration(track.duration)}
              </div>

              <div className="flex items-center justify-end">
                <span className="text-xs text-ax-muted">
                  {(track.file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};