import { useState, useEffect, useRef } from 'react';
import { audioEngine } from '../../core/audio/AudioEngine';
import { IntelligentLimiter, type LimiterMode } from '../../core/audio/IntelligentLimiter';
import { Switch } from '../../components/Switch';

export const IntelligentLimiterPanel = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [mode, setMode] = useState<LimiterMode>('standard');
  const [threshold, setThreshold] = useState(-6);
  const [grLevel, setGrLevel] = useState(0);
  
  const limiterRef = useRef<IntelligentLimiter | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const context = audioEngine.getContext();
    if (!context) return;

    const limiter = new IntelligentLimiter(context);
    limiterRef.current = limiter;

    const updateGR = () => {
      if (limiter && limiter.getEnabled()) {
        const reduction = Math.abs(limiter.getGainReduction());
        setGrLevel(Math.min(60, reduction));
      } else {
        setGrLevel(0);
      }
      animationRef.current = requestAnimationFrame(updateGR);
    };
    updateGR();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const handleToggle = (enabled: boolean) => {
    setIsEnabled(enabled);
    limiterRef.current?.setEnabled(enabled);
  };

  const handleModeChange = (newMode: LimiterMode) => {
    setMode(newMode);
    limiterRef.current?.setMode(newMode);
    
    const thresholds: Record<LimiterMode, number> = {
      'standard': -6,
      'ai-sens': -12,
      'safe-bass': -3
    };
    setThreshold(thresholds[newMode]);
    limiterRef.current?.setThreshold(thresholds[newMode]);
  };

  const handleThreshold = (val: number) => {
    setThreshold(val);
    limiterRef.current?.setThreshold(val);
  };

  const renderGRMeter = () => {
    const segments = 20;
    const activeSegments = Math.floor((grLevel / 60) * segments);
    
    return (
      <div className="flex items-end gap-1 h-24">
        {Array.from({ length: segments }).map((_, i) => {
          const isActive = i < activeSegments;
          const color = i < 7 ? 'bg-green-500' : i < 14 ? 'bg-yellow-500' : 'bg-red-500';
          return (
            <div
              key={i}
              className={`flex-1 rounded-sm transition-all duration-75 ${
                isActive ? color : 'bg-slate-700'
              }`}
              style={{ height: `${10 + (i / segments) * 90}%` }}
            />
          );
        })}
      </div>
    );
  };

  const modeLabels: Record<LimiterMode, { label: string; desc: string; icon: string }> = {
    'standard': { label: 'Standard', desc: 'Limitador clásico', icon: '️' },
    'ai-sens': { label: 'AI Sens.', desc: 'Sensibilidad automática', icon: '' },
    'safe-bass': { label: 'Safe Bass', desc: 'Protección de graves', icon: '🛡️' }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-xl border border-ax-border">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-ax-accent"></span>
            Intelligent Limiter
          </h3>
          <p className="text-xs text-ax-muted mt-1">
            Limitación inteligente con 3 modos
          </p>
        </div>
        <Switch enabled={isEnabled} onChange={handleToggle} />
      </div>

      {/* Medidor de Gain Reduction */}
      <div className="mb-6 bg-slate-800/50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-ax-muted">Limiter GR</span>
          <span className="text-xs font-mono text-ax-accent">
            {grLevel > 0 ? `-${grLevel.toFixed(1)} dB` : '0 dB'}
          </span>
        </div>
        {renderGRMeter()}
        <div className="flex justify-between text-[10px] text-ax-muted mt-1">
          <span>0 dB</span>
          <span>-60 dB</span>
        </div>
      </div>

      {/* Selector de modo */}
      <div className={`space-y-4 transition-opacity ${isEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        <div>
          <label className="text-xs font-medium text-white block mb-2">Modo de Limitación</label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(modeLabels) as LimiterMode[]).map((m) => (
              <button
                key={m}
                onClick={() => handleModeChange(m)}
                className={`p-3 rounded-lg border transition-all ${
                  mode === m
                    ? 'bg-ax-accent/20 border-ax-accent text-white'
                    : 'bg-slate-800/50 border-slate-700 text-ax-muted hover:border-slate-600'
                }`}
              >
                <div className="text-xl mb-1">{modeLabels[m].icon}</div>
                <div className="text-xs font-bold">{modeLabels[m].label}</div>
                <div className="text-[10px] mt-1 opacity-70">{modeLabels[m].desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Threshold */}
        <div className="bg-slate-800/50 p-3 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-medium text-white">Threshold</label>
            <span className="text-xs font-mono text-ax-accent">{threshold} dB</span>
          </div>
          <input
            type="range"
            min="-60"
            max="0"
            step="1"
            value={threshold}
            onChange={(e) => handleThreshold(Number(e.target.value))}
            className="w-full accent-ax-accent"
          />
          <div className="flex justify-between text-[10px] text-ax-muted mt-1">
            <span>-60 dB</span>
            <span>0 dB</span>
          </div>
        </div>
      </div>
    </div>
  );
};