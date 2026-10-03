import { EqualizerPanel } from '../features/equalizer/EqualizerPanel';
import { AdvancedDSPPanel } from '../features/dsp/AdvancedDSPPanel';
import { SpectrumAnalyzer } from './visualizers/SpectrumAnalyzer';

interface ToolsViewProps {
  activeTool: 'equalizer' | 'dsp' | 'visualizer';
  onSectionChange?: (section: string) => void;
}

export const ToolsView: React.FC<ToolsViewProps> = ({ activeTool, onSectionChange }) => {
  return (
    <div className="flex-1 overflow-y-auto px-8 py-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {(activeTool === 'visualizer' || activeTool === 'equalizer' || activeTool === 'dsp') && (
          <div>
            <h3 className="text-sm font-medium text-ax-muted uppercase tracking-wider mb-3">
              Real-Time Analyzer
            </h3>
            <SpectrumAnalyzer />
          </div>
        )}

        {activeTool === 'equalizer' && (
          <div>
            <h3 className="text-sm font-medium text-ax-muted uppercase tracking-wider mb-3">
              Parametric Equalizer
            </h3>
            <EqualizerPanel />
          </div>
        )}

        {activeTool === 'dsp' && (
          <div>
            <h3 className="text-sm font-medium text-ax-muted uppercase tracking-wider mb-3">
              Advanced DSP Processing
            </h3>
            <AdvancedDSPPanel onSectionChange={onSectionChange} /> {/* ← PASAR LA PROP */}
          </div>
        )}

        {activeTool === 'visualizer' && (
          <div className="bg-ax-panel p-6 rounded-xl border border-ax-border">
            <h3 className="text-lg font-bold text-white mb-4">Visualizer Modes</h3>
            <p className="text-sm text-ax-muted">
              El analizador de espectro está activo arriba.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};