import { type SubHarmonicState } from './SubHarmonicRestorer';

export interface AudioPreset {
  id: string;
  name: string;
  category: 'bass' | 'voice' | 'genre' | 'custom';
  icon: string;
  description: string;
  epicenter: Partial<SubHarmonicState>;
  eqBands: number[]; // 10 bandas: -12 a +12 dB
}

export const PRESETS: AudioPreset[] = [
  {
    id: 'none',
    name: 'Ninguno',
    category: 'custom',
    icon: '🚫',
    description: 'Audio sin procesamiento',
    epicenter: { active: false, restoration: 0 },
    eqBands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: 'custom',
    name: 'Personalizado',
    category: 'custom',
    icon: '️',
    description: 'Usa tus propios ajustes',
    epicenter: { active: true, restoration: 8, sweepFrequency: 70, wide: 60, depth: 70, body: 50, presence: 40 },
    eqBands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: 'voice-clarity',
    name: 'Claridad de Voz',
    category: 'voice',
    icon: '🎙️',
    description: 'Optimizado para podcasts y voz hablada',
    epicenter: { active: false, restoration: -4 },
    eqBands: [-6, -4, -2, 0, 2, 4, 3, 2, 1, 0],
  },
  {
    id: 'pop',
    name: 'Pop',
    category: 'genre',
    icon: '🎤',
    description: 'Balanceado para música pop moderna',
    epicenter: { active: true, restoration: 4, sweepFrequency: 80, wide: 50, depth: 60, body: 40, presence: 50 },
    eqBands: [-2, 0, 2, 3, 2, 0, -1, 1, 2, 3],
  },
  {
    id: 'bass-boost',
    name: 'Bass Boost',
    category: 'bass',
    icon: '🔊',
    description: 'Refuerzo agresivo de graves',
    epicenter: { active: true, restoration: 12, sweepFrequency: 60, wide: 70, depth: 90, body: 80, presence: 60 },
    eqBands: [8, 7, 5, 3, 1, 0, -1, 0, 1, 2],
  },
  {
    id: 'v-shape',
    name: 'V-Shape Clarity',
    category: 'custom',
    icon: '📐',
    description: 'Graves y agudos realzados, medios reducidos',
    epicenter: { active: true, restoration: 6, sweepFrequency: 75, wide: 65, depth: 75, body: 60, presence: 55 },
    eqBands: [6, 5, 3, 1, -2, -3, -2, 1, 4, 6],
  },
  {
    id: 'jazz',
    name: 'Jazz',
    category: 'genre',
    icon: '🎷',
    description: 'Cálido y natural para jazz',
    epicenter: { active: true, restoration: 3, sweepFrequency: 90, wide: 40, depth: 50, body: 60, presence: 30 },
    eqBands: [-1, 1, 2, 3, 2, 1, 0, -1, 0, 1],
  },
  {
    id: 'cumbia',
    name: 'Cumbia',
    category: 'genre',
    icon: '💃',
    description: 'Rítmico con graves presentes',
    epicenter: { active: true, restoration: 7, sweepFrequency: 65, wide: 55, depth: 70, body: 65, presence: 45 },
    eqBands: [5, 4, 2, 1, 0, -1, 0, 2, 3, 2],
  },
  {
    id: 'corridos',
    name: 'Corridos',
    category: 'genre',
    icon: '',
    description: 'Guitarras y voz prominentes',
    epicenter: { active: true, restoration: 5, sweepFrequency: 70, wide: 50, depth: 60, body: 55, presence: 50 },
    eqBands: [3, 2, 1, 2, 3, 2, 1, 2, 3, 2],
  },
  {
    id: 'bass-amplifier',
    name: 'Amplificador de Bajos',
    category: 'bass',
    icon: '🔈',
    description: 'Máximo refuerzo de sub-graves',
    epicenter: { active: true, restoration: 10, sweepFrequency: 50, wide: 80, depth: 95, body: 90, presence: 70 },
    eqBands: [10, 9, 7, 4, 2, 0, -2, 0, 1, 2],
  },
  {
    id: 'voice-amplifier',
    name: 'Amplificador de Voz',
    category: 'voice',
    icon: '📢',
    description: 'Voz clara y presente',
    epicenter: { active: false, restoration: -2 },
    eqBands: [-4, -2, 0, 2, 4, 5, 4, 2, 1, 0],
  },
  {
    id: 'rap',
    name: 'Rap',
    category: 'genre',
    icon: '🎧',
    description: 'Graves profundos y voz clara',
    epicenter: { active: true, restoration: 9, sweepFrequency: 55, wide: 60, depth: 85, body: 75, presence: 55 },
    eqBands: [7, 6, 4, 2, 0, -1, 1, 2, 3, 2],
  },
  {
    id: 'reggaeton',
    name: 'Reggaeton',
    category: 'genre',
    icon: '🔥',
    description: 'Dembow con graves potentes',
    epicenter: { active: true, restoration: 11, sweepFrequency: 45, wide: 75, depth: 90, body: 85, presence: 65 },
    eqBands: [9, 8, 6, 3, 1, -1, 0, 2, 4, 3],
  },
  {
    id: 'trap',
    name: 'Trap',
    category: 'genre',
    icon: '⚡',
    description: '808s profundos y agudos brillantes',
    epicenter: { active: true, restoration: 10, sweepFrequency: 40, wide: 70, depth: 95, body: 80, presence: 60 },
    eqBands: [10, 9, 7, 4, 2, 0, -2, 1, 5, 7],
  },
  {
    id: 'electronic',
    name: 'Electrónica',
    category: 'genre',
    icon: '🎛️',
    description: 'Synths y bajos electrónicos',
    epicenter: { active: true, restoration: 8, sweepFrequency: 50, wide: 85, depth: 80, body: 70, presence: 55 },
    eqBands: [6, 5, 3, 1, -1, 0, 1, 3, 5, 6],
  },
  {
    id: 'rock',
    name: 'Rock',
    category: 'genre',
    icon: '🎸',
    description: 'Guitarras eléctricas con punch',
    epicenter: { active: true, restoration: 6, sweepFrequency: 75, wide: 55, depth: 70, body: 60, presence: 65 },
    eqBands: [4, 3, 2, 1, 0, 1, 2, 3, 4, 3],
  },
  {
    id: 'classical',
    name: 'Clásica',
    category: 'genre',
    icon: '',
    description: 'Natural y equilibrada',
    epicenter: { active: false, restoration: 0 },
    eqBands: [0, 1, 1, 0, 0, 0, 0, 0, 1, 1],
  },
  {
    id: 'lofi',
    name: 'Lo-Fi',
    category: 'genre',
    icon: '',
    description: 'Cálido y vintage',
    epicenter: { active: true, restoration: 4, sweepFrequency: 100, wide: 30, depth: 40, body: 70, presence: 20 },
    eqBands: [3, 2, 1, 0, -1, -2, -3, -2, -1, -2],
  },
];

export const getPresetById = (id: string): AudioPreset | undefined => {
  return PRESETS.find(p => p.id === id);
};

export const getPresetsByCategory = (category: AudioPreset['category']): AudioPreset[] => {
  return PRESETS.filter(p => p.category === category);
};