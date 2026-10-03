import { useState, useEffect, useRef } from 'react';
import { SmartLimiter, type LimiterMode } from '../../core/audio/SmartLimiter';
import { Shield, Zap, Activity } from 'lucide-react';

interface SmartLimiterPanelProps {
    limiter: SmartLimiter | null;
}

export const SmartLimiterPanel: React.FC<SmartLimiterPanelProps> = ({ limiter }) => {
    const [mode, setMode] = useState<LimiterMode>('off');
    const [threshold, setThreshold] = useState(-1);
    const [attack, setAttack] = useState(0.1);
    const [release, setRelease] = useState(50);
    const [grBars, setGrBars] = useState<number[]>(new Array(20).fill(0));
    const [bassLevel, setBassLevel] = useState(0);
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        if (!limiter) return;

        // Sincronizar estado inicial
        const state = limiter.getState();
        setMode(state.mode);
        setThreshold(state.threshold);
        setAttack(state.attack);
        setRelease(state.release);

        const updateGR = () => {
            const gr = limiter.getGainReduction();
            const bass = limiter.getBassContent();

            const bars = 20;
            const newBars: number[] = [];
            for (let i = 0; i < bars; i++) {
                const threshold = -(i + 1); // -1, -2, -3, ... -20
                newBars.push(gr <= threshold ? 1 : 0);
            }

            setGrBars(newBars);
            setBassLevel(bass);
            animationRef.current = requestAnimationFrame(updateGR);
        };

        updateGR();

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [limiter]);

    const handleModeChange = (newMode: LimiterMode) => {
        limiter?.setMode(newMode);
        setMode(newMode);
    };

    const handleThresholdChange = (val: number) => {
        limiter?.setThreshold(val);
        setThreshold(val);
    };

    const handleAttackChange = (val: number) => {
        limiter?.setAttack(val);
        setAttack(val);
    };

    const handleReleaseChange = (val: number) => {
        limiter?.setRelease(val);
        setRelease(val);
    };

    const getGRColor = (index: number) => {
        if (index < 6) return 'bg-green-500';
        if (index < 12) return 'bg-yellow-500';
        if (index < 16) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const getModeIcon = (m: LimiterMode) => {
        if (m === 'ai-sens') return <Zap className="w-4 h-4" />;
        if (m === 'safe-bass') return <Shield className="w-4 h-4" />;
        return <Activity className="w-4 h-4" />;
    };

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-2xl border border-ax-border">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="text-ax-accent">{getModeIcon(mode)}</span>
                        Limiter Inteligente
                    </h3>
                    <p className="text-xs text-ax-muted mt-1">Protección de altavoces y prevención de distorsión</p>
                </div>
            </div>

            {/* Selector de modo */}
            <div className="grid grid-cols-3 gap-2 mb-6">
                <button
                    onClick={() => handleModeChange('off')}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${mode === 'off'
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-slate-900/50 border-ax-border text-ax-muted hover:border-ax-accent/50'
                        }`}
                >
                    <Activity className="w-4 h-4 mx-auto mb-1" />
                    Off
                </button>
                <button
                    onClick={() => handleModeChange('ai-sens')}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${mode === 'ai-sens'
                        ? 'bg-ax-accent/20 border-ax-accent text-ax-accent'
                        : 'bg-slate-900/50 border-ax-border text-ax-muted hover:border-ax-accent/50'
                        }`}
                >
                    <Zap className="w-4 h-4 mx-auto mb-1" />
                    AI Sens
                </button>
                <button
                    onClick={() => handleModeChange('safe-bass')}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${mode === 'safe-bass'
                        ? 'bg-ax-accent/20 border-ax-accent text-ax-accent'
                        : 'bg-slate-900/50 border-ax-border text-ax-muted hover:border-ax-accent/50'
                        }`}
                >
                    <Shield className="w-4 h-4 mx-auto mb-1" />
                    Safe Bass
                </button>
            </div>

            {/* Medidor de Gain Reduction */}
            <div className="mb-6 bg-slate-950/50 p-4 rounded-lg border border-ax-border">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-white">Limiter GR</span>
                    <span className="text-xs font-mono text-ax-accent">
                        {grBars.filter(b => b === 1).length > 0
                            ? `-${grBars.filter(b => b === 1).length} dB`
                            : '0 dB'}
                    </span>
                </div>
                <div className="flex items-end justify-between h-12 gap-0.5">
                    {grBars.map((active, i) => (
                        <div
                            key={i}
                            className={`flex-1 rounded-t transition-all duration-75 ${active ? getGRColor(i) : 'bg-slate-800'
                                }`}
                            style={{ height: active ? '100%' : '20%' }}
                        />
                    ))}
                </div>
                <div className="flex justify-between text-[10px] text-ax-muted mt-1">
                    <span>0 dB</span>
                    <span>Gain Reduction</span>
                    <span>-20 dB</span>
                </div>
            </div>

            {/* Indicador de nivel de graves (solo en Safe Bass mode) */}
            {mode === 'safe-bass' && (
                <div className="mb-6 bg-slate-950/50 p-3 rounded-lg border border-ax-border">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-white">Nivel de Graves</span>
                        <span className="text-xs font-mono text-ax-accent">{bassLevel.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-100"
                            style={{ width: `${bassLevel}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Controles manuales (solo si no está en modo off) */}
            {mode !== 'off' && (
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-medium text-white">Threshold</label>
                            <span className="text-xs font-mono text-ax-accent">{threshold} dB</span>
                        </div>
                        <input
                            type="range"
                            min="-20"
                            max="0"
                            step="1"
                            value={threshold}
                            onChange={(e) => handleThresholdChange(Number(e.target.value))}
                            className="w-full accent-ax-accent"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-ax-muted block mb-1">Attack: {attack.toFixed(1)} ms</label>
                            <input
                                type="range"
                                min="0.1"
                                max="10"
                                step="0.1"
                                value={attack}
                                onChange={(e) => handleAttackChange(parseFloat(e.target.value))}
                                className="w-full accent-ax-accent"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-ax-muted block mb-1">Release: {release.toFixed(0)} ms</label>
                            <input
                                type="range"
                                min="10"
                                max="200"
                                step="5"
                                value={release}
                                onChange={(e) => handleReleaseChange(Number(e.target.value))}
                                className="w-full accent-ax-accent"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Descripción del modo activo */}
            {mode !== 'off' && (
                <div className="mt-4 p-3 bg-ax-accent/10 border border-ax-accent/30 rounded-lg">
                    <p className="text-xs text-white">
                        {mode === 'ai-sens' && '🤖 AI Sens: Análisis dinámico del contenido de audio. Ajusta automáticamente la limitación basada en el RMS de la señal.'}
                        {mode === 'safe-bass' && '🛡️ Safe Bass: Protección agresiva de graves. Previene distorsión en frecuencias bajas (20-200 Hz) ideal para subwoofers.'}
                    </p>
                </div>
            )}
        </div>
    );
};