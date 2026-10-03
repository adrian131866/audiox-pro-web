import { useState, useEffect, useRef } from 'react';
import { SubHarmonicRestorer, type SubHarmonicState } from '../../core/audio/SubHarmonicRestorer';
import { Switch } from '../Switch';

interface EpicenterPanelProps {
  epicenter: SubHarmonicRestorer | null;
}

export const EpicenterPanel: React.FC<EpicenterPanelProps> = ({ epicenter }) => {
  const [state, setState] = useState<SubHarmonicState>({
    active: false,
    mode: 'pro',
    restoration: 8,
    sweepFrequency: 70,
    wide: 60,
    frequencyRange: { low: 20, high: 60 },
    depth: 70,
    body: 50,
    presence: 40,
  });

  const [levelBars, setLevelBars] = useState<number[]>(new Array(16).fill(0));
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!epicenter) return;

    setState(epicenter.getState());

    const analyser = epicenter.getAnalyser();
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateLevel = () => {
      analyser.getByteFrequencyData(dataArray);

      const bars = 16;
      const binsPerBar = Math.floor(dataArray.length / bars);
      const newBars: number[] = [];

      for (let i = 0; i < bars; i++) {
        let sum = 0;
        for (let j = 0; j < binsPerBar; j++) {
          sum += dataArray[i * binsPerBar + j];
        }
        newBars.push((sum / binsPerBar) / 255);
      }

      setLevelBars(newBars);
      animationRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [epicenter]);

  const handleToggle = (active: boolean) => {
    epicenter?.setActive(active);
    setState(prev => ({ ...prev, active }));
  };

  const handleRestoration = (val: number) => {
    epicenter?.setRestoration(val);
    setState(prev => ({ ...prev, restoration: val }));
  };

  const handleSweep = (val: number) => {
    epicenter?.setSweepFrequency(val);
    setState(prev => ({ ...prev, sweepFrequency: val }));
  };

  const handleWide = (val: number) => {
    epicenter?.setWide(val);
    setState(prev => ({ ...prev, wide: val }));
  };

  const handleDepth = (val: number) => {
    epicenter?.setDepth(val);
    setState(prev => ({ ...prev, depth: val }));
  };

  const handleBody = (val: number) => {
    epicenter?.setBody(val);
    setState(prev => ({ ...prev, body: val }));
  };

  const handlePresence = (val: number) => {
    epicenter?.setPresence(val);
    setState(prev => ({ ...prev, presence: val }));
  };

  const getBarColor = (level: number) => {
    if (level > 0.8) return 'bg-red-500';
    if (level > 0.6) return 'bg-orange-500';
    if (level > 0.4) return 'bg-yellow-500';
    if (level > 0.2) return 'bg-green-500';
    return 'bg-green-600';
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-2xl border border-ax-border">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🔊</span> Motor Epicenter
          </h3>
          <p className="text-xs text-ax-muted mt-1">Restauración de sub-armónicos en tiempo real</p>
        </div>
        <Switch enabled={state.active} onChange={handleToggle} />
      </div>

      {/* Medidor de nivel */}
      <div className="mb-6 bg-slate-950/50 p-3 rounded-lg border border-ax-border">
        <div className="flex items-end justify-between h-16 gap-1">
          {levelBars.map((level, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end h-full">
              <div
                className={`w-full rounded-t transition-all duration-75 ${getBarColor(level)}`}
                style={{ height: `${level * 100}%`, minHeight: level > 0 ? '2px' : '0' }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-ax-muted mt-1">
          <span>20 Hz</span>
          <span>Sub-Harmonic Level</span>
          <span>120 Hz</span>
        </div>
      </div>

      {/* Controles principales */}
      <div className={`space-y-4 ${!state.active ? 'opacity-40 pointer-events-none' : ''}`}>
        {/* Restoration */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-medium text-white">Restoration</label>
            <span className="text-xs font-mono text-ax-accent">
              {state.restoration > 0 ? '+' : ''}{state.restoration.toFixed(1)} dB
            </span>
          </div>
          <input
            type="range"
            min="-12"
            max="12"
            step="0.5"
            value={state.restoration}
            onChange={(e) => handleRestoration(parseFloat(e.target.value))}
            className="w-full accent-ax-accent"
          />
        </div>

        {/* Profundidad, Cuerpo, Presencia */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] text-ax-muted block mb-1">Profundidad</label>
            <input
              type="range"
              min="0"
              max="100"
              value={state.depth}
              onChange={(e) => handleDepth(Number(e.target.value))}
              className="w-full accent-ax-accent"
            />
            <div className="text-[10px] text-ax-accent text-center mt-1">{state.depth}%</div>
          </div>
          <div>
            <label className="text-[10px] text-ax-muted block mb-1">Cuerpo</label>
            <input
              type="range"
              min="0"
              max="100"
              value={state.body}
              onChange={(e) => handleBody(Number(e.target.value))}
              className="w-full accent-ax-accent"
            />
            <div className="text-[10px] text-ax-accent text-center mt-1">{state.body}%</div>
          </div>
          <div>
            <label className="text-[10px] text-ax-muted block mb-1">Presencia</label>
            <input
              type="range"
              min="0"
              max="100"
              value={state.presence}
              onChange={(e) => handlePresence(Number(e.target.value))}
              className="w-full accent-ax-accent"
            />
            <div className="text-[10px] text-ax-accent text-center mt-1">{state.presence}%</div>
          </div>
        </div>

        {/* Sweep y Wide */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs text-ax-muted">Sweep</label>
              <span className="text-xs font-mono text-ax-accent">{state.sweepFrequency} Hz</span>
            </div>
            <input
              type="range"
              min="20"
              max="120"
              step="1"
              value={state.sweepFrequency}
              onChange={(e) => handleSweep(Number(e.target.value))}
              className="w-full accent-ax-accent"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs text-ax-muted">Wide</label>
              <span className="text-xs font-mono text-ax-accent">{state.wide}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={state.wide}
              onChange={(e) => handleWide(Number(e.target.value))}
              className="w-full accent-ax-accent"
            />
          </div>
        </div>
      </div>
    </div>
  );
};