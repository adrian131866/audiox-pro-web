export type MediaType = 'audio' | 'video';

export interface Track {
  id: string;
  file: File;
  name: string;
  url: string; // URL del objeto local (Blob URL)
  type: MediaType;
  duration?: number;
  artist?: string;
  album?: string;
}

export interface DSPProfile {
  id: string;
  name: string;
  eqBands: number[]; // Ganancias de las 10 bandas del ecualizador
  preamp: number;
  bassBoostEnabled: boolean;
  compressorThreshold: number;
}