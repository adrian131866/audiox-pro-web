import { useState, useEffect } from 'react';
import { audioEngine } from '../../core/audio/AudioEngine';
import { Equalizer } from '../../core/audio/Equalizer';
import { SubHarmonicRestorer } from '../../core/audio/SubHarmonicRestorer';
import { CrossoverModule, CompressorModule } from '../../core/audio/DSPModules';
import { type AudioPreset } from '../../core/audio/presets';
import { EpicenterPanel } from '../../components/dsp/EpicenterPanel';
import { PresetsModal } from '../../components/dsp/PresetsModal';
import { AutoAdjustPanel } from '../../components/dsp/AutoAdjustPanel';
import { Switch } from '../../components/Switch';
import { Library } from 'lucide-react';

export const AdvancedDSPPanel = () => {
 
  const [crossoverEnabled, setCrossoverEnabled] = useState(false);
  const [compressorEnabled, setCompressorEnabled] = useState(false);

  const [crossoverLow, setCrossoverLow] = useState(20000);
  const [crossoverHigh, setCrossoverHigh] = useState(20);
  const [compThreshold, setCompThreshold] = useState(-24);
  const [compRatio, setCompRatio] = useState(12);

  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [currentPresetId, setCurrentPresetId] = useState<string>('custom');

  const [modules, setModules] = useState<{
    eq: Equalizer | null;
    epicenter: SubHarmonicRestorer | null;
    crossover: CrossoverModule | null;
    compressor: CompressorModule | null;
  }>({
    eq: null,
    epicenter: null,
    crossover: null,
    compressor: null,
  });

  useEffect(() => {
    const context = audioEngine.getContext();
    if (!context || !audioEngine.inputNode || !audioEngine.outputNode) return;

    const eq = new Equalizer(context);
    const epicenter = new SubHarmonicRestorer(context);
    const crossover = new CrossoverModule(context);
    const compressor = new CompressorModule(context);

    epicenter.setActive(false);
    crossover.setEnabled(false);
    compressor.setEnabled(false);

    setModules({ eq, epicenter, crossover, compressor });

    audioEngine.inputNode.connect(eq.inputNode);
    eq.outputNode.connect(epicenter.inputNode);
    epicenter.outputNode.connect(crossover.inputNode);
    crossover.outputNode.connect(compressor.inputNode);
    compressor.outputNode.connect(audioEngine.outputNode);

    console.log('🔗 DSP Chain: EQ -> Epicenter -> Crossover -> Compressor');
  }, []);

  const handlePresetSelect = (preset: AudioPreset) => {
    setCurrentPresetId(preset.id);
    if (modules.epicenter) {
      modules.epicenter.applyState(preset.epicenter);
    }
    if (modules.eq && preset.eqBands) {
      preset.eqBands.forEach((gain, i) => modules.eq?.setBandGain(i, gain));
    }
  };

  const handleApplyEQ = (bands: number[]) => {
    bands.forEach((gain, i) => modules.eq?.setBandGain(i, gain));
  };

  const handleCrossoverToggle = (enabled: boolean) => {
    setCrossoverEnabled(enabled);
    modules.crossover?.setEnabled(enabled);
  };
  const handleCrossoverLow = (val: number) => { setCrossoverLow(val); modules.crossover?.setLowPassFreq(val); };
  const handleCrossoverHigh = (val: number) => { setCrossoverHigh(val); modules.crossover?.setHighPassFreq(val); };

  const handleCompressorToggle = (enabled: boolean) => {
    setCompressorEnabled(enabled);
    modules.compressor?.setEnabled(enabled);
  };
  const handleCompThreshold = (val: number) => { setCompThreshold(val); modules.compressor?.setThreshold(val); };
  const handleCompRatio = (val: number) => { setCompRatio(val); modules.compressor?.setRatio(val); };

  return (
    <div className="space-y-6">
      {/* Botón de Presets */}
      <button
        onClick={() => setIsPresetsOpen(true)}
        className="w-full p-4 bg-gradient-to-r from-ax-accent/20 to-purple-500/20 border border-ax-accent/50 rounded-xl text-white font-medium flex items-center justify-center gap-2 hover:from-ax-accent/30 hover:to-purple-500/30 transition-all"
      >
        <Library className="w-5 h-5" />
        Abrir Biblioteca de Presets
        {currentPresetId !== 'custom' && (
          <span className="ml-2 px-2 py-0.5 bg-ax-accent/30 rounded text-xs">
            {currentPresetId}
          </span>
        )}
      </button>

      {/* Motor Epicenter */}
      <EpicenterPanel epicenter={modules.epicenter} />

      {/* Auto-Ajuste Inteligente */}
      <AutoAdjustPanel
        analyser={audioEngine.getAnalyser()}
        epicenter={modules.epicenter}
        equalizer={modules.eq}
        onApplyEQ={handleApplyEQ}
      />

      {/* Crossover */}
      <div className="bg-slate-900/50 p-4 rounded-lg border border-ax-border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-white">Crossover Digital</h3>
          <Switch enabled={crossoverEnabled} onChange={handleCrossoverToggle} />
        </div>
        <div className={crossoverEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-ax-muted block mb-1">Low Pass: {crossoverLow} Hz</label>
              <input type="range" min="200" max="20000" step="100" value={crossoverLow} onChange={(e) => handleCrossoverLow(Number(e.target.value))} className="w-full accent-ax-accent" />
            </div>
            <div>
              <label className="text-xs text-ax-muted block mb-1">High Pass: {crossoverHigh} Hz</label>
              <input type="range" min="20" max="5000" step="10" value={crossoverHigh} onChange={(e) => handleCrossoverHigh(Number(e.target.value))} className="w-full accent-ax-accent" />
            </div>
          </div>
        </div>
      </div>

      {/* Compresor */}
      <div className="bg-slate-900/50 p-4 rounded-lg border border-ax-border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-white">Compresor Dinámico</h3>
          <Switch enabled={compressorEnabled} onChange={handleCompressorToggle} />
        </div>
        <div className={compressorEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-ax-muted block mb-1">Threshold: {compThreshold} dB</label>
              <input type="range" min="-60" max="0" step="1" value={compThreshold} onChange={(e) => handleCompThreshold(Number(e.target.value))} className="w-full accent-ax-accent" />
            </div>
            <div>
              <label className="text-xs text-ax-muted block mb-1">Ratio: {compRatio}:1</label>
              <input type="range" min="1" max="20" step="1" value={compRatio} onChange={(e) => handleCompRatio(Number(e.target.value))} className="w-full accent-ax-accent" />
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Presets */}
      <PresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onSelect={handlePresetSelect}
        currentPresetId={currentPresetId}
      />
    </div>
  );
};