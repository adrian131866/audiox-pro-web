// src/components/DropZone.tsx
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
      // Resetear el input para permitir seleccionar el mismo archivo otra vez
      event.target.value = '';
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
      className="flex-1 flex items-center justify-center p-4 sm:p-8 pb-32"
    >
      <div className="border-2 border-dashed border-ax-border rounded-2xl p-6 sm:p-12 text-center max-w-2xl w-full">
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-ax-card rounded-2xl flex items-center justify-center">
            <Upload className="w-7 h-7 sm:w-8 sm:h-8 text-ax-muted" />
          </div>
        </div>
        
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
          Carga Archivo O Carpeta De Audio 
        </h3>
        <p className="text-xs sm:text-sm text-ax-muted mb-6 sm:mb-8 px-4">
          MP3, FLAC, WAV, AAC, OGG, OPUS, M4A, MP4, WEBM —<br className="hidden sm:block" />
          album art and metadata are read automatically.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-ax-accent hover:bg-ax-accentHover text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Music className="w-4 h-4" />
            Elegir Archivo
          </button>
          
          <button
            onClick={() => folderInputRef.current?.click()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-ax-card hover:bg-ax-panel border border-ax-border rounded-lg text-sm font-medium text-white transition-colors"
          >
            <FolderOpen className="w-4 h-4" />
            Elegir Carpeta 
          </button>
        </div>

        {/* Input para archivos de audio - optimizado para móvil */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="audio/*,video/*,.mp3,.wav,.flac,.aac,.ogg,.opus,.m4a,.mp4,.webm"
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