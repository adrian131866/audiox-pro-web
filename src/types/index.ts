// src/types/index.ts

export interface Track {
  id: string;
  name: string;
  file: File;
  url: string;
  type: 'audio' | 'video';
  
  // NUEVOS CAMPOS (opcionales para compatibilidad)
  artist?: string;
  album?: string;
  year?: number;
  genre?: string;
  duration?: number;
  coverArt?: string;
  coverArtMimeType?: string;
}

export interface AudioProfile {
  id: string;
  name: string;
  eqBands: number[];
  bassIntensity: number;
  masterVolume: number;
}