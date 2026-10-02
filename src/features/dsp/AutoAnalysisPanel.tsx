import { useState, useEffect, useRef } from 'react';
import { audioEngine } from '../../core/audio/AudioEngine';
import { AudioAnalyzer } from '../../core/audio/AudioAnalyzer';
import { usePlayerStore } from '../../store/usePlayerStore';

interface AutoAnalysisPanelProps {
    onApplyEQ: (eqBands: number[]) => void;
    onApplySubHarmonic: (params: {
        restoration: number;
        subRange: number;
        sweep: number;
        wide: number;
        mix: number;
    }) => void;
}

export const AutoAnalysisPanel: React.FC<AutoAnalysisPanelProps> = ({
    onApplyEQ,
    onApplySubHarmonic
}) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisComplete, setAnalysisComplete] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [suggestedEQ, setSuggestedEQ] = useState<number[]>([]);
    const [suggestedSub, setSuggestedSub] = useState<any>(null);
    const [selectedMode, setSelectedMode] = useState<'auto' | 'manual'>('manual');

    const analyzerRef = useRef<AudioAnalyzer | null>(null);

    const { isPlaying } = usePlayerStore();

    useEffect(() => {
        const context = audioEngine.getContext();
        const analyser = audioEngine.getAnalyser();

        if (context && analyser) {
            analyzerRef.current = new AudioAnalyzer(context, analyser);
        }
    }, []);

    const handleAnalyze = () => {
        if (!analyzerRef.current || !isPlaying) {
            alert('Reproduce una canción primero para analizarla');
            return;
        }

        setIsAnalyzing(true);

        setTimeout(() => {
            if (analyzerRef.current) {
                const profile = analyzerRef.current.analyze();
                const eq = analyzerRef.current.suggestEQ();
                const sub = analyzerRef.current.suggestSubHarmonic();

                setProfile(profile);
                setSuggestedEQ(eq);
                setSuggestedSub(sub);
                setAnalysisComplete(true);
                setIsAnalyzing(false);
            }
        }, 2000);
    };

    const handleApplyAutoEQ = () => {
        if (suggestedEQ.length > 0) {
            onApplyEQ(suggestedEQ);
            setSelectedMode('auto');
        }
    };

    const handleApplyAutoSub = () => {
        if (suggestedSub) {
            onApplySubHarmonic(suggestedSub);
            setSelectedMode('auto');
        }
    };

    const handleManualMode = () => {
        setSelectedMode('manual');
    };

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-xl border border-ax-border">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="text-ax-accent">🤖</span>
                        Auto-Análisis Inteligente
                    </h3>
                    <p className="text-xs text-ax-muted mt-1">
                        Analiza la pista y propone ajustes óptimos
                    </p>
                </div>
            </div>

            {/* Botón de análisis */}
            <div className="mb-6">
                <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !isPlaying}
                    className={`w-full py-3 rounded-lg font-medium transition-all ${isAnalyzing
                            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                            : !isPlaying
                                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                : 'bg-ax-accent hover:bg-ax-accentHover text-white'
                        }`}
                >
                    {isAnalyzing ? (
                        <span className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Analizando...
                        </span>
                    ) : !isPlaying ? (
                        'Reproduce una canción primero'
                    ) : (
                        '🔍 Analizar Pista Actual'
                    )}
                </button>
            </div>

            {/* Resultados del análisis */}
            {analysisComplete && profile && (
                <div className="space-y-4">
                    {/* Perfil detectado */}
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                        <h4 className="text-sm font-bold text-white mb-3">Perfil Detectado</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <div className="text-xs text-ax-muted">Género Sugerido</div>
                                <div className="text-sm font-bold text-ax-accent">{profile.suggestedGenre}</div>
                            </div>
                            <div>
                                <div className="text-xs text-ax-muted">Rango Dinámico</div>
                                <div className="text-sm font-bold text-white">{Math.round(profile.dynamicRange)}%</div>
                            </div>
                            <div>
                                <div className="text-xs text-ax-muted">Nivel de Graves</div>
                                <div className="text-sm font-bold text-white">{Math.round(profile.bassLevel)}%</div>
                            </div>
                            <div>
                                <div className="text-xs text-ax-muted">Ancho Estéreo</div>
                                <div className="text-sm font-bold text-white">{Math.round(profile.stereoWidth)}%</div>
                            </div>
                        </div>
                    </div>

                    {/* Modo de aplicación */}
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                        <h4 className="text-sm font-bold text-white mb-3">Modo de Ajuste</h4>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <button
                                onClick={() => setSelectedMode('auto')}
                                className={`p-3 rounded-lg border transition-all ${selectedMode === 'auto'
                                        ? 'bg-ax-accent/20 border-ax-accent text-white'
                                        : 'bg-slate-700/50 border-slate-600 text-ax-muted'
                                    }`}
                            >
                                <div className="text-xl mb-1">🤖</div>
                                <div className="text-xs font-bold">Automático</div>
                            </button>
                            <button
                                onClick={handleManualMode}
                                className={`p-3 rounded-lg border transition-all ${selectedMode === 'manual'
                                        ? 'bg-ax-accent/20 border-ax-accent text-white'
                                        : 'bg-slate-700/50 border-slate-600 text-ax-muted'
                                    }`}
                            >
                                <div className="text-xl mb-1">✋</div>
                                <div className="text-xs font-bold">Manual</div>
                            </button>
                        </div>

                        {selectedMode === 'auto' && (
                            <div className="space-y-2">
                                <button
                                    onClick={handleApplyAutoEQ}
                                    className="w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    ✅ Aplicar Auto-EQ Sugerido
                                </button>
                                <button
                                    onClick={handleApplyAutoSub}
                                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    ✅ Aplicar Auto-Epicenter Sugerido
                                </button>
                            </div>
                        )}

                        {selectedMode === 'manual' && (
                            <div className="text-xs text-ax-muted text-center py-2">
                                Ajusta los parámetros manualmente en los paneles de EQ y Sub-Harmonic
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};