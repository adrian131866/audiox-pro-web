import { useState, useEffect } from 'react';
import { Equalizer } from '../../core/audio/Equalizer';
import { audioEngine } from '../../core/audio/AudioEngine';
import { usePlayerStore } from '../../store/usePlayerStore';

interface EqualizerPanelProps {
  onEqualizerReady?: (eq: Equalizer) => void;
}

export const EqualizerPanel: React.FC<EqualizerPanelProps> = ({ onEqualizerReady }) => {

  const { eqBands, setEqBands } = usePlayerStore();
  
  const [equalizer, setEqualizer] = useState<Equalizer | null>(null);
  const frequencies = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

  useEffect(() => {
    const context = audioEngine.getContext();
    if (!context) return;

    const eq = new Equalizer(context);
    setEqualizer(eq);

    audioEngine.connectDSPModule(eq.inputNode, eq.outputNode);

    eqBands.forEach((gain, index) => {
      eq.setBandGain(index, gain);
    });

    if (onEqualizerReady) {
      onEqualizerReady(eq);
    }

    console.log('🎚️ Equalizer: Inicializado y conectado a la cadena DSP.');
  }, []);

  useEffect(() => {
    if (equalizer) {
      eqBands.forEach((gain, index) => {
        equalizer.setBandGain(index, gain);
      });
    }
  }, [eqBands, equalizer]);

  const handleBandChange = (index: number, value: number) => {
    if (equalizer) {
      equalizer.setBandGain(index, value);
      const newGains = [...eqBands];
      newGains[index] = value;
      setEqBands(newGains); 
    }
  };

  const handleReset = () => {
    if (equalizer) {
      equalizer.reset();
      const flatBands = new Array(10).fill(0);
      setEqBands(flatBands);
    }
  };

  const getBarColor = (gain: number) => {
    if (gain > 6) return 'bg-red-500';
    if (gain > 3) return 'bg-orange-500';
    if (gain > 0) return 'bg-yellow-500';
    if (gain > -3) return 'bg-blue-500';
    if (gain > -6) return 'bg-indigo-500';
    return 'bg-purple-500';
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-5xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">🎚️</span> 
            Ecualizador Profesional
          </h2>
          <p className="text-sm text-slate-400 mt-1">10 bandas paramétricas • ISO 1/3 octava</p>
        </div>
        <button
          onClick={handleReset}
          className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium text-sm"
        >
          Reset Flat
        </button>
      </div>

      {/* Contenedor de bandas */}
      <div className="bg-slate-950/50 rounded-xl p-6 border border-slate-800">
        <div className="flex justify-between items-stretch h-80 gap-3">
          {frequencies.map((freq, index) => {
            const gain = eqBands[index];
            const percentage = ((gain + 12) / 24) * 100; 
            
            return (
              <div key={freq} className="flex flex-col items-center flex-1 h-full relative">
                
                {/* Valor de ganancia en dB */}
                <div className={`text-sm font-bold mb-2 px-2 py-1 rounded ${
                  gain > 0 ? 'text-green-400 bg-green-500/10' : 
                  gain < 0 ? 'text-red-400 bg-red-500/10' : 
                  'text-slate-400 bg-slate-800'
                }`}>
                  {gain > 0 ? '+' : ''}{gain.toFixed(1)} dB
                </div>

                {/* Track del slider (fondo) */}
                <div className="flex-1 w-full relative flex items-center justify-center">
                  {/* Línea de referencia 0 dB */}
                  <div className="absolute w-full h-0.5 bg-slate-600 z-0"></div>
                  
                  {/* Barra visual de ganancia */}
                  <div className="absolute w-8 rounded-full overflow-hidden bg-slate-800 z-10" style={{ height: '90%' }}>
                    {/* Mitad superior (ganancia positiva) */}
                    <div className="absolute top-0 left-0 right-0 h-1/2 flex flex-col-reverse">
                      <div 
                        className={`w-full ${getBarColor(gain)} transition-all duration-150`}
                        style={{ height: `${Math.max(0, (percentage - 50) * 2)}%` }}
                      ></div>
                    </div>
                    {/* Mitad inferior (ganancia negativa) */}
                    <div className="absolute bottom-0 left-0 right-0 h-1/2">
                      <div 
                        className={`w-full ${getBarColor(gain)} transition-all duration-150`}
                        style={{ height: `${Math.max(0, (50 - percentage) * 2)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Slider real (invisible pero funcional) */}
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="0.5"
                    value={gain}
                    onChange={(e) => handleBandChange(index, parseFloat(e.target.value))}
                    className="absolute w-full h-full opacity-0 cursor-pointer z-20"
                    style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                  />

                  {/* Thumb visual del slider */}
                  <div 
                    className="absolute w-10 h-6 bg-gradient-to-b from-slate-300 to-slate-500 rounded shadow-lg border-2 border-slate-600 z-30 pointer-events-none transition-all duration-150"
                    style={{ 
                      bottom: `${percentage}%`,
                      transform: 'translateY(50%)'
                    }}
                  >
                    <div className="w-full h-0.5 bg-slate-700 mt-2.5"></div>
                  </div>
                </div>

                {/* Frecuencia */}
                <div className="mt-3 text-center">
                  <div className="text-sm font-bold text-white">
                    {freq >= 1000 ? `${freq / 1000}k` : freq}
                  </div>
                  <div className="text-xs text-slate-500">Hz</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Indicador de estado */}
      <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        <span>Motor DSP activo • Procesamiento en tiempo real</span>
      </div>
    </div>
  );
};