export interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  year?: number;
  genre?: string;
  duration: number;
  type: 'audio' | 'video';
  file: File;
  url: string;
  coverArt?: string; // URL de la carátula del álbum (base64 o blob URL)
  coverArtMimeType?: string;
}

export interface AudioProfile {
  id: string;
  name: string;
  eqBands: number[];
  bassIntensity: number;
  masterVolume: number;
}
export interface DSPProfile {
  id: string;
  name: string;
  eqBands: number[]; // Ganancias de las 10 bandas del ecualizador
  preamp: number;
  bassBoostEnabled: boolean;
  compressorThreshold: number;
}