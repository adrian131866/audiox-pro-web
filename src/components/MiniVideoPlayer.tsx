import { X, Maximize2 } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';

interface MiniVideoPlayerProps {
  onExpand: () => void;
  onClose: () => void;
}

export const MiniVideoPlayer: React.FC<MiniVideoPlayerProps> = ({ onExpand, onClose }) => {
  const { currentTrack } = usePlayerStore();

  if (!currentTrack || currentTrack.type !== 'video') return null;

  return (
    <div className="fixed bottom-24 right-6 w-80 bg-ax-panel border border-ax-border rounded-lg shadow-2xl overflow-hidden z-40">
      <div className="relative">
        <video
          src={currentTrack.url}
          className="w-full h-44 object-cover"
          autoPlay
          muted
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <button
            onClick={onExpand}
            className="p-1 bg-black/60 rounded hover:bg-black/80 text-white"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1 bg-black/60 rounded hover:bg-black/80 text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="absolute bottom-2 left-2 text-xs text-white bg-black/60 px-2 py-1 rounded">
          {currentTrack.name}
        </div>
      </div>
    </div>
  );
};