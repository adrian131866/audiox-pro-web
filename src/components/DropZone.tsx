import { Upload, Music, FolderOpen } from 'lucide-react';
import { useRef } from 'react';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFilesSelected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onFilesSelected(Array.from(files));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFilesSelected(files);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="flex-1 flex items-center justify-center p-8"
    >
      <div className="border-2 border-dashed border-ax-border rounded-2xl p-12 text-center max-w-2xl w-full">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-ax-card rounded-2xl flex items-center justify-center">
            <Upload className="w-8 h-8 text-ax-muted" />
          </div>
        </div>
        
        <h3 className="text-xl font-semibold text-white mb-2">
          Drop audio files or folders
        </h3>
        <p className="text-sm text-ax-muted mb-8">
          MP3, FLAC, WAV, AAC, OGG, OPUS, M4A, MP4, WEBM —<br />
          album art and metadata are read automatically.
        </p>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-6 py-3 bg-ax-card hover:bg-ax-panel border border-ax-border rounded-lg text-sm font-medium text-white transition-colors"
          >
            <Music className="w-4 h-4" />
            Choose files
          </button>
          
          <button
            onClick={() => folderInputRef.current?.click()}
            className="flex items-center gap-2 px-6 py-3 bg-ax-card hover:bg-ax-panel border border-ax-border rounded-lg text-sm font-medium text-white transition-colors"
          >
            <FolderOpen className="w-4 h-4" />
            Choose folder
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="audio/*,video/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          ref={folderInputRef}
          type="file"
          // @ts-ignore - webkitdirectory es una propiedad no estándar pero soportada
          webkitdirectory=""
          directory=""
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};