import { useState } from 'react';
import { AutoAnalyzer, type AnalysisResult } from '../../core/audio/AudioAnalyzer';
import { SubHarmonicRestorer } from '../../core/audio/SubHarmonicRestorer';
import { usePlayerStore } from '../../store/usePlayerStore';
import { Sparkles, Zap, Sliders } from 'lucide-react';

interface AutoAdjustPanelProps {
    analyser: AnalyserNode | null;
    epicenter: SubHarmonicRestorer | null;
    onApplyEQ: (bands: number[]) => void;
    onSectionChange?: (section: string) => void;
}

type AutoMode = 'manual' | 'auto-epicenter' | 'auto-eq' | 'auto-full';

export const AutoAdjustPanel: React.FC<AutoAdjustPanelProps> = ({
    analyser,
    epicenter,
    onApplyEQ,
    onSectionChange,
}) => {
    const { setEqBands } = usePlayerStore();
    const [mode, setMode] = useState<AutoMode>('manual');
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleAnalyze = () => {
        if (!analyser) return;

        setIsAnalyzing(true);

        const analyzer = new AutoAnalyzer(analyser);
        let totalBass = 0, totalMid = 0, totalHigh = 0;
        const samples = 30;
        let sampleCount = 0;

        const interval = setInterval(() => {
            const result = analyzer.analyze();
            totalBass += result.bassContent;
            totalMid += result.midContent;
            totalHigh += result.highContent;
            sampleCount++;

            if (sampleCount >= samples) {
                clearInterval(interval);
                const avg: AnalysisResult = {
                    bassContent: totalBass / samples,
                    midContent: totalMid / samples,
                    highContent: totalHigh / samples,
                    dynamicRange: result.dynamicRange,
                    recommendedEpicenter: result.recommendedEpicenter,
                    recommendedEQ: result.recommendedEQ,
                    trackType: result.trackType,
                };
                setAnalysis(avg);
                setIsAnalyzing(false);
            }
        }, 33); // ~30 FPS
    };

    const handleApplyAutoEpicenter = () => {
        if (!analysis || !epicenter) return;
        epicenter.applyState(analysis.recommendedEpicenter);
        setMode('auto-epicenter');
    };

    const handleApplyAutoEQ = () => {
        if (!analysis) return;

        onApplyEQ(analysis.recommendedEQ);

        setEqBands(analysis.recommendedEQ);

        setMode('auto-eq');
    };

    const handleApplyFull = () => {
        if (!analysis) return;

        handleApplyAutoEpicenter();
        handleApplyAutoEQ();
        setMode('auto-full');
    };

    const handleManualAdjust = () => {
        setMode('manual');

        if (analysis) {
            setEqBands(analysis.recommendedEQ);
        }

        if (onSectionChange) {
            onSectionChange('equalizer');
        }
    };

    const getTrackTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'bass-heavy': 'Graves dominantes',
            'vocal': 'Voz predominante',
            'balanced': 'Balanceada',
            'bright': 'Brillante',
            'muddy': 'Medios densos',
        };
        return labels[type] || type;
    };

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-2xl border border-ax-border">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-ax-accent" />
                        Auto-Ajuste Inteligente
                    </h3>
                    <p className="text-xs text-ax-muted mt-1">Análisis espectral en tiempo real</p>
                </div>
                <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !analyser}
                    className="px-4 py-2 bg-ax-accent hover:bg-ax-accentHover text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                    {isAnalyzing ? 'Analizando...' : 'Analizar pista'}
                </button>
            </div>

            {analysis && (
                <>
                    {/* Resultados del análisis */}
                    <div className="mb-4 p-4 bg-slate-950/50 rounded-lg border border-ax-border">
                        <div className="grid grid-cols-3 gap-3 mb-3">
                            <div>
                                <div className="text-[10px] text-ax-muted">Graves</div>
                                <div className="text-lg font-bold text-ax-accent">{analysis.bassContent.toFixed(0)}%</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-ax-muted">Medios</div>
                                <div className="text-lg font-bold text-ax-accent">{analysis.midContent.toFixed(0)}%</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-ax-muted">Agudos</div>
                                <div className="text-lg font-bold text-ax-accent">{analysis.highContent.toFixed(0)}%</div>
                            </div>
                        </div>
                        <div className="text-xs text-white">
                            Tipo de pista:{' '}
                            <span className="text-ax-accent font-medium">
                                {getTrackTypeLabel(analysis.trackType)}
                            </span>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                        {/* Botón 1: Auto-Epicenter */}
                        <button
                            onClick={handleApplyAutoEpicenter}
                            className={`p-3 rounded-lg border text-sm font-medium transition-colors flex items-center justify-center gap-2 ${mode === 'auto-epicenter' || mode === 'auto-full'
                                    ? 'bg-ax-accent/20 border-ax-accent text-ax-accent'
                                    : 'bg-slate-900/50 border-ax-border text-white hover:border-ax-accent/50'
                                }`}
                        >
                            <Zap className="w-4 h-4" />
                            <span className="hidden sm:inline">Auto-Epicenter</span>
                            <span className="sm:hidden">Epicenter</span>
                        </button>

                        {/* Botón 2: Auto-EQ */}
                        <button
                            onClick={handleApplyAutoEQ}
                            className={`p-3 rounded-lg border text-sm font-medium transition-colors flex items-center justify-center gap-2 ${mode === 'auto-eq' || mode === 'auto-full'
                                    ? 'bg-ax-accent/20 border-ax-accent text-ax-accent'
                                    : 'bg-slate-900/50 border-ax-border text-white hover:border-ax-accent/50'
                                }`}
                        >
                            <Sliders className="w-4 h-4" />
                            <span className="hidden sm:inline">Auto-EQ</span>
                            <span className="sm:hidden">EQ</span>
                        </button>

                        {/* Botón 3: Aplicar Todo (NUEVO) */}
                        <button
                            onClick={handleApplyFull}
                            className={`p-3 rounded-lg border text-sm font-medium transition-colors flex items-center justify-center gap-2 ${mode === 'auto-full'
                                    ? 'bg-ax-accent/20 border-ax-accent text-ax-accent'
                                    : 'bg-slate-900/50 border-ax-border text-white hover:border-ax-accent/50'
                                }`}
                        >
                            <Sparkles className="w-4 h-4" />
                            <span className="hidden sm:inline">Aplicar Todo</span>
                            <span className="sm:hidden">Todo</span>
                        </button>

                        {/* Botón 4: Ajustar Manualmente */}
                        <button
                            onClick={handleManualAdjust}
                            className={`p-3 rounded-lg border text-sm font-medium transition-colors flex items-center justify-center gap-2 ${mode === 'manual'
                                    ? 'bg-ax-accent/20 border-ax-accent text-ax-accent'
                                    : 'bg-slate-900/50 border-ax-border text-white hover:border-ax-accent/50'
                                }`}
                        >
                            <Sliders className="w-4 h-4" />
                            <span className="hidden sm:inline">Manual</span>
                            <span className="sm:hidden">Manual</span>
                        </button>
                    </div>

                    {/* Valores propuestos (siempre visibles para referencia) */}
                    <div className="p-3 bg-slate-950/30 rounded border border-ax-border">
                        <div className="text-xs text-ax-muted mb-2">
                            Valores recomendados por el análisis:
                        </div>
                        <div className="text-xs text-white space-y-1">
                            <div>
                                <strong>Epicenter:</strong> Restoration +
                                {analysis.recommendedEpicenter.restoration?.toFixed(1)} dB, Sweep{' '}
                                {analysis.recommendedEpicenter.sweepFrequency} Hz
                            </div>
                            <div>
                                <strong>EQ:</strong>[
                                {analysis.recommendedEQ.map((v) => (v > 0 ? '+' : '') + v).join(', ')}]
                            </div>
                        </div>
                    </div>
                </>
            )}

            {!analysis && !isAnalyzing && (
                <div className="text-center py-8 text-ax-muted">
                    <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Haz clic en "Analizar pista" para comenzar</p>
                </div>
            )}
        </div>
    );
};