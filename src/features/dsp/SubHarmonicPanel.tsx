import { useState, useEffect } from 'react';
import { audioEngine } from '../../core/audio/AudioEngine';
import { SubHarmonicRestorer } from '../../core/audio/SubHarmonicRestorer';
import { Switch } from '../../components/Switch';

export const SubHarmonicPanel = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [restoration, setRestoration] = useState(8);
  const [subRange, setSubRange] = useState(40);
  const [sweep, setSweep] = useState(70);
  const [wide, setWide] = useState(60);
  const [mix, setMix] = useState(50);
  const [level, setLevel] = useState(0);

  const [restorer, setRestorer] = useState<SubHarmonicRestorer | null>(null);

  useEffect(() => {
    const context = audioEngine.getContext();
    if (!context) return;

    const sub = new SubHarmonicRestorer(context);
    setRestorer(sub);

    console.log(' SubHarmonicRestorer inicializado');

    const interval = setInterval(() => {
      if (isEnabled) {
        setLevel(Math.random() * 100);
      } else {
        setLevel(0);
      }
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleToggle = (enabled: boolean) => {
    setIsEnabled(enabled);
    restorer?.setEnabled(enabled);
  };

  const handleRestoration = (val: number) => {
    setRestoration(val);
    restorer?.setRestoration(val);
  };

  const handleSubRange = (val: number) => {
    setSubRange(val);
    restorer?.setSubRange(val);
  };

  const handleSweep = (val: number) => {
    setSweep(val);
    restorer?.setSweep(val);
  };

  const handleWide = (val: number) => {
    setWide(val);
    restorer?.setWide(val);
  };

  const handleMix = (val: number) => {
    setMix(val);
    restorer?.setMix(val);
  };

  const renderLevelMeter = () => {
    const segments = 12;
    const activeSegments = Math.floor((level / 100) * segments);
    
    return (
      <div className="flex gap-1 h-8 items-end">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 rounded-sm transition-all duration-75 ${
              i < activeSegments
                ? i < 6
                  ? 'bg-green-500'
                  : i < 9
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
                : 'bg-slate-700'
            }`}
            style={{ height: `${20 + (i / segments) * 80}%` }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-xl border border-ax-border">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-ax-accent">️</span>
            Sub-Harmonic Restorer
          </h3>
          <p className="text-xs text-ax-muted mt-1">
            Generador de sub-armónicos profesional
          </p>
        </div>
        <Switch enabled={isEnabled} onChange={handleToggle} />
      </div>

      {/* Medidor de nivel */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-ax-muted">Output Level</span>
          <span className="text-xs font-mono text-ax-accent">{Math.round(level)}%</span>
        </div>
        {renderLevelMeter()}
      </div>

      {/* Controles */}
      <div className={`space-y-4 transition-opacity ${isEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        
        {/* Restoration */}
        <div className="bg-slate-800/50 p-3 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-medium text-white">Restoration</label>
            <span className="text-xs font-mono text-ax-accent">
              {restoration <= -60 ? '-∞' : `+${restoration}`} dB
            </span>
          </div>
          <input
            type="range"
            min="-60"
            max="12"
            step="1"
            value={restoration}
            onChange={(e) => handleRestoration(Number(e.target.value))}
            className="w-full accent-ax-accent"
          />
          <div className="flex justify-between text-[10px] text-ax-muted mt-1">
            <span>-∞</span>
            <span>+12 dB</span>
          </div>
        </div>

        {/* Sub Range */}
        <div className="bg-slate-800/50 p-3 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-medium text-white">Sub Range</label>
            <span className="text-xs font-mono text-ax-accent">{subRange} Hz</span>
          </div>
          <input
            type="range"
            min="20"
            max="60"
            step="1"
            value={subRange}
            onChange={(e) => handleSubRange(Number(e.target.value))}
            className="w-full accent-ax-accent"
          />
          <div className="flex justify-between text-[10px] text-ax-muted mt-1">
            <span>20 Hz</span>
            <span>60 Hz</span>
          </div>
        </div>

        {/* Sweep */}
        <div className="bg-slate-800/50 p-3 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-medium text-white">Sweep</label>
            <span className="text-xs font-mono text-ax-accent">{sweep} Hz</span>
          </div>
          <input
            type="range"
            min="20"
            max="200"
            step="1"
            value={sweep}
            onChange={(e) => handleSweep(Number(e.target.value))}
            className="w-full accent-ax-accent"
          />
          <div className="flex justify-between text-[10px] text-ax-muted mt-1">
            <span>20 Hz</span>
            <span>200 Hz</span>
          </div>
        </div>

        {/* Wide */}
        <div className="bg-slate-800/50 p-3 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-medium text-white">Wide (Stereo)</label>
            <span className="text-xs font-mono text-ax-accent">{wide}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={wide}
            onChange={(e) => handleWide(Number(e.target.value))}
            className="w-full accent-ax-accent"
          />
          <div className="flex justify-between text-[10px] text-ax-muted mt-1">
            <span>Mono</span>
            <span>Ultra Wide</span>
          </div>
        </div>

        {/* Mix */}
        <div className="bg-slate-800/50 p-3 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-medium text-white">Mix</label>
            <span className="text-xs font-mono text-ax-accent">{mix}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={mix}
            onChange={(e) => handleMix(Number(e.target.value))}
            className="w-full accent-ax-accent"
          />
          <div className="flex justify-between text-[10px] text-ax-muted mt-1">
            <span>Dry</span>
            <span>Wet</span>
          </div>
        </div>
      </div>
    </div>
  );
};