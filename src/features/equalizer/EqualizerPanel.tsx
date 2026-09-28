import { useState, useEffect } from 'react';
import { Equalizer } from '../../core/audio/Equalizer';
import { audioEngine } from '../../core/audio/AudioEngine';

interface EqualizerPanelProps {
  onEqualizerReady?: (eq: Equalizer) => void;
}

export const EqualizerPanel: React.FC<EqualizerPanelProps> = ({ onEqualizerReady }) => {
  const [gains, setGains] = useState<number[]>(new Array(10).fill(0));
  const [equalizer, setEqualizer] = useState<Equalizer | null>(null);
  const frequencies = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

  useEffect(() => {
    const context = audioEngine.getContext();
    if (!context) return;

    // Crear el ecualizador
    const eq = new Equalizer(context);
    setEqualizer(eq);

    if (audioEngine.inputNode && audioEngine.outputNode) {
      audioEngine.connectDSPModule(eq.inputNode, eq.outputNode);
    }

    if (onEqualizerReady) {
      onEqualizerReady(eq);
    }

    console.log('🎚️ Equalizer: Inicializado y conectado.');
  }, [onEqualizerReady]);

  const handleBandChange = (index: number, value: number) => {
    if (equalizer) {
      equalizer.setBandGain(index, value);
      const newGains = [...gains];
      newGains[index] = value;
      setGains(newGains);
    }
  };

  const handleReset = () => {
    if (equalizer) {
      equalizer.reset();
      setGains(new Array(10).fill(0));
    }
  };

  return (
    <div className="bg-ax-panel p-6 rounded-xl border border-ax-border shadow-2xl w-full max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-ax-accent">🎚️</span> Ecualizador Profesional
        </h2>
        <button
          onClick={handleReset}
          className="px-3 py-1 text-xs bg-ax-card hover:bg-slate-700 text-white rounded transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Contenedor de las bandas del ecualizador */}
      <div className="flex justify-between items-stretch h-70 gap-2 px-2">
        {frequencies.map((freq, index) => (
          <div key={freq} className="flex flex-col items-center flex-1 h-full">
            
            {/* FRECUENCIA ARRIBA */}
            <span className="text-xs text-ax-accent font-mono font-bold mb-2 bg-slate-900/50 px-2 py-1 rounded">
              {freq >= 1000 ? `${freq / 1000}k` : freq}
              <span className="text-[10px] text-ax-muted ml-0.5">Hz</span>
            </span>

            {/* Valor de ganancia en dB */}
            <span className="text-[10px] text-ax-muted font-mono mb-1">
              {gains[index] > 0 ? '+' : ''}{gains[index].toFixed(1)} dB
            </span>

            {/* Slider vertical */}
            <div className="flex-1 flex items-center justify-center w-full relative">
              {/* Línea central de referencia (0 dB) */}
              <div className="absolute w-full h-px bg-ax-border/50"></div>
              
              <input
                type="range"
                min="-12"
                max="12"
                step="0.5"
                value={gains[index]}
                onChange={(e) => handleBandChange(index, parseFloat(e.target.value))}
                className="h-50 w-2 appearance-none bg-slate-700 rounded-full cursor-pointer
                           [&::-webkit-slider-thumb]:appearance-none
                           [&::-webkit-slider-thumb]:w-4
                           [&::-webkit-slider-thumb]:h-4
                           [&::-webkit-slider-thumb]:rounded-full
                           [&::-webkit-slider-thumb]:bg-ax-accent
                           [&::-webkit-slider-thumb]:shadow-lg
                           [&::-webkit-slider-thumb]:cursor-pointer
                           [&::-webkit-slider-thumb]:border-2
                           [&::-webkit-slider-thumb]:border-ax-bg"
                style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Indicador de estado */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-ax-muted">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        <span>10 bandas paramétricas activas (ISO 1/3 octava)</span>
      </div>
    </div>
  );
};