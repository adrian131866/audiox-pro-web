import { useState, useEffect } from 'react';
import { audioEngine } from '../../core/audio/AudioEngine';
import { Equalizer } from '../../core/audio/Equalizer';
import { BassRestorer } from '../../core/audio/BassRestorer';
import {
  CrossoverModule,
  CompressorModule,
  DelayModule,
  ReverbModule,
  ChorusModule
} from '../../core/audio/DSPModules';
import { Switch } from '../../components/Switch';
import { SubHarmonicPanel } from './SubHarmonicPanel';
import { IntelligentLimiterPanel } from './IntelligentLimiterPanel';
import { AutoAnalysisPanel } from './AutoAnalysisPanel';

export const AdvancedDSPPanel = () => {
  const [bassEnabled, setBassEnabled] = useState(false);
  const [crossoverEnabled, setCrossoverEnabled] = useState(false);
  const [compressorEnabled, setCompressorEnabled] = useState(false);
  const [delayEnabled, setDelayEnabled] = useState(false);
  const [reverbEnabled, setReverbEnabled] = useState(false);
  const [chorusEnabled, setChorusEnabled] = useState(false);
  const [bassIntensity, setBassIntensity] = useState(0);
  const [crossoverLow, setCrossoverLow] = useState(20000);
  const [crossoverHigh, setCrossoverHigh] = useState(20);
  const [compThreshold, setCompThreshold] = useState(-24);
  const [compRatio, setCompRatio] = useState(12);
  const [delayTime, setDelayTime] = useState(0.3);
  const [delayFeedback, setDelayFeedback] = useState(0.4);
  const [delayMix, setDelayMix] = useState(0.5);
  const [reverbMix, setReverbMix] = useState(0.3);
  const [reverbDecay, setReverbDecay] = useState(2.5);
  const [chorusRate, setChorusRate] = useState(1.5);
  const [chorusDepth, setChorusDepth] = useState(0.005);
  const [chorusMix, setChorusMix] = useState(0.5);

  const [modules, setModules] = useState<{
    eq: Equalizer | null;
    bass: BassRestorer | null;
    crossover: CrossoverModule | null;
    compressor: CompressorModule | null;
    delay: DelayModule | null;
    reverb: ReverbModule | null;
    chorus: ChorusModule | null;
  }>({
    eq: null,
    bass: null,
    crossover: null,
    compressor: null,
    delay: null,
    reverb: null,
    chorus: null
  });

  useEffect(() => {
    const context = audioEngine.getContext();
    if (!context || !audioEngine.inputNode || !audioEngine.outputNode) return;

    const eq = new Equalizer(context);
    const bass = new BassRestorer(context);
    const crossover = new CrossoverModule(context);
    const compressor = new CompressorModule(context);
    const delay = new DelayModule(context);
    const reverb = new ReverbModule(context);
    const chorus = new ChorusModule(context);

    bass.setEnabled(false);
    crossover.setEnabled(false);
    compressor.setEnabled(false);
    delay.setEnabled(false);
    reverb.setEnabled(false);
    chorus.setEnabled(false);

    setModules({ eq, bass, crossover, compressor, delay, reverb, chorus });

    audioEngine.inputNode.connect(eq.inputNode);
    eq.outputNode.connect(bass.inputNode);
    bass.outputNode.connect(crossover.inputNode);
    crossover.outputNode.connect(compressor.inputNode);
    compressor.outputNode.connect(delay.inputNode);
    delay.outputNode.connect(reverb.inputNode);
    reverb.outputNode.connect(chorus.inputNode);
    chorus.outputNode.connect(audioEngine.outputNode);

    console.log('🔗 DSP Chain: EQ -> Bass -> Crossover -> Compressor -> Delay -> Reverb -> Chorus');
  }, []);

  const handleBassToggle = (enabled: boolean) => {
    setBassEnabled(enabled);
    modules.bass?.setEnabled(enabled);
  };

  const handleBassChange = (val: number) => {
    setBassIntensity(val);
    modules.bass?.setIntensity(val);
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

  const handleDelayToggle = (enabled: boolean) => {
    setDelayEnabled(enabled);
    modules.delay?.setEnabled(enabled);
  };

  const handleDelayTime = (val: number) => { setDelayTime(val); modules.delay?.setDelayTime(val); };
  const handleDelayFeedback = (val: number) => { setDelayFeedback(val); modules.delay?.setFeedback(val); };
  const handleDelayMix = (val: number) => { setDelayMix(val); modules.delay?.setMix(val); };

  const handleReverbToggle = (enabled: boolean) => {
    setReverbEnabled(enabled);
    modules.reverb?.setEnabled(enabled);
  };

  const handleReverbMix = (val: number) => { setReverbMix(val); modules.reverb?.setMix(val); };
  const handleReverbDecay = (val: number) => { setReverbDecay(val); modules.reverb?.setDecay(val); };

  const handleChorusToggle = (enabled: boolean) => {
    setChorusEnabled(enabled);
    modules.chorus?.setEnabled(enabled);
  };

  const handleChorusRate = (val: number) => { setChorusRate(val); modules.chorus?.setRate(val); };
  const handleChorusDepth = (val: number) => { setChorusDepth(val); modules.chorus?.setDepth(val); };
  const handleChorusMix = (val: number) => { setChorusMix(val); modules.chorus?.setMix(val); };
  const handleApplyAutoEQ = (eqBands: number[]) => {
    if (modules.eq) {
      eqBands.forEach((gain, index) => {
        modules.eq!.setBandGain(index, gain);
      });
      console.log(' Auto-EQ aplicado:', eqBands);
    }
  };

  const handleApplyAutoSub = (params: {
    restoration: number;
    subRange: number;
    sweep: number;
    wide: number;
    mix: number;
  }) => {
    console.log(' Auto-Epicenter aplicado:', params);
  };

  return (
    <div className="space-y-6">
      {/* AUTO-ANÁLISIS INTELIGENTE */}
      <AutoAnalysisPanel
        onApplyEQ={handleApplyAutoEQ}
        onApplySubHarmonic={handleApplyAutoSub}
      />

      {/* SUB-HARMONIC RESTORER */}
      <SubHarmonicPanel />

      {/* INTELLIGENT LIMITER */}
      <IntelligentLimiterPanel />

      {/* EQUALIZER */}
      <div className="bg-slate-900/50 p-4 rounded-lg border border-ax-border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-white">Ecualizador Paramétrico</h3>
          <span className="text-xs text-green-400 font-medium">SIEMPRE ACTIVO</span>
        </div>
        {modules.eq && (
          <div className="grid grid-cols-10 gap-1 h-32">
            {[31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000].map((freq, i) => (
              <div key={freq} className="flex flex-col items-center">
                <input
                  type="range"
                  min="-12" max="12" step="1"
                  className="h-24 w-1 accent-ax-accent"
                  style={{ writingMode: 'vertical-lr' }}
                  onChange={(e) => modules.eq?.setBandGain(i, Number(e.target.value))}
                />
                <span className="text-[9px] text-ax-muted mt-1">{freq >= 1000 ? `${freq / 1000}k` : freq}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BASS RESTORER */}
      <div className="bg-slate-900/50 p-4 rounded-lg border border-ax-border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-white">Bass Restorer (Epicenter)</h3>
          <Switch enabled={bassEnabled} onChange={handleBassToggle} />
        </div>
        <div className={bassEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs text-ax-muted">Intensidad</label>
            <span className="text-xs font-mono text-ax-accent">{Math.round(bassIntensity * 100)}%</span>
          </div>
          <input
            type="range" min="0" max="1" step="0.01"
            value={bassIntensity}
            onChange={(e) => handleBassChange(parseFloat(e.target.value))}
            className="w-full accent-ax-accent"
          />
        </div>
      </div>

      {/* CROSSOVER */}
      <div className="bg-slate-900/50 p-4 rounded-lg border border-ax-border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-white">Crossover Digital</h3>
          <Switch enabled={crossoverEnabled} onChange={handleCrossoverToggle} />
        </div>
        <div className={crossoverEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-ax-muted block mb-1">Low Pass: {crossoverLow} Hz</label>
              <input
                type="range" min="200" max="20000" step="100"
                value={crossoverLow}
                onChange={(e) => handleCrossoverLow(Number(e.target.value))}
                className="w-full accent-ax-accent"
              />
            </div>
            <div>
              <label className="text-xs text-ax-muted block mb-1">High Pass: {crossoverHigh} Hz</label>
              <input
                type="range" min="20" max="5000" step="10"
                value={crossoverHigh}
                onChange={(e) => handleCrossoverHigh(Number(e.target.value))}
                className="w-full accent-ax-accent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* COMPRESOR */}
      <div className="bg-slate-900/50 p-4 rounded-lg border border-ax-border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-white">Compresor Dinámico</h3>
          <Switch enabled={compressorEnabled} onChange={handleCompressorToggle} />
        </div>
        <div className={compressorEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-ax-muted block mb-1">Threshold: {compThreshold} dB</label>
              <input
                type="range" min="-60" max="0" step="1"
                value={compThreshold}
                onChange={(e) => handleCompThreshold(Number(e.target.value))}
                className="w-full accent-ax-accent"
              />
            </div>
            <div>
              <label className="text-xs text-ax-muted block mb-1">Ratio: {compRatio}:1</label>
              <input
                type="range" min="1" max="20" step="1"
                value={compRatio}
                onChange={(e) => handleCompRatio(Number(e.target.value))}
                className="w-full accent-ax-accent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* DELAY */}
      <div className="bg-slate-900/50 p-4 rounded-lg border border-ax-border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-white">Delay (Eco)</h3>
          <Switch enabled={delayEnabled} onChange={handleDelayToggle} />
        </div>
        <div className={delayEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-ax-muted block mb-1">Tiempo: {delayTime.toFixed(2)}s</label>
              <input
                type="range" min="0.05" max="2" step="0.05"
                value={delayTime}
                onChange={(e) => handleDelayTime(parseFloat(e.target.value))}
                className="w-full accent-ax-accent"
              />
            </div>
            <div>
              <label className="text-xs text-ax-muted block mb-1">Feedback: {Math.round(delayFeedback * 100)}%</label>
              <input
                type="range" min="0" max="0.9" step="0.05"
                value={delayFeedback}
                onChange={(e) => handleDelayFeedback(parseFloat(e.target.value))}
                className="w-full accent-ax-accent"
              />
            </div>
            <div>
              <label className="text-xs text-ax-muted block mb-1">Mix: {Math.round(delayMix * 100)}%</label>
              <input
                type="range" min="0" max="1" step="0.05"
                value={delayMix}
                onChange={(e) => handleDelayMix(parseFloat(e.target.value))}
                className="w-full accent-ax-accent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* REVERB */}
      <div className="bg-slate-900/50 p-4 rounded-lg border border-ax-border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-white">Reverb (Reverberación)</h3>
          <Switch enabled={reverbEnabled} onChange={handleReverbToggle} />
        </div>
        <div className={reverbEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-ax-muted block mb-1">Mix: {Math.round(reverbMix * 100)}%</label>
              <input
                type="range" min="0" max="1" step="0.05"
                value={reverbMix}
                onChange={(e) => handleReverbMix(parseFloat(e.target.value))}
                className="w-full accent-ax-accent"
              />
            </div>
            <div>
              <label className="text-xs text-ax-muted block mb-1">Decay: {reverbDecay.toFixed(1)}s</label>
              <input
                type="range" min="0.5" max="5" step="0.1"
                value={reverbDecay}
                onChange={(e) => handleReverbDecay(parseFloat(e.target.value))}
                className="w-full accent-ax-accent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* CHORUS */}
      <div className="bg-slate-900/50 p-4 rounded-lg border border-ax-border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-white">Chorus (Coro)</h3>
          <Switch enabled={chorusEnabled} onChange={handleChorusToggle} />
        </div>
        <div className={chorusEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-ax-muted block mb-1">Rate: {chorusRate.toFixed(1)} Hz</label>
              <input
                type="range" min="0.1" max="5" step="0.1"
                value={chorusRate}
                onChange={(e) => handleChorusRate(parseFloat(e.target.value))}
                className="w-full accent-ax-accent"
              />
            </div>
            <div>
              <label className="text-xs text-ax-muted block mb-1">Depth: {(chorusDepth * 1000).toFixed(1)} ms</label>
              <input
                type="range" min="0.001" max="0.02" step="0.001"
                value={chorusDepth}
                onChange={(e) => handleChorusDepth(parseFloat(e.target.value))}
                className="w-full accent-ax-accent"
              />
            </div>
            <div>
              <label className="text-xs text-ax-muted block mb-1">Mix: {Math.round(chorusMix * 100)}%</label>
              <input
                type="range" min="0" max="1" step="0.05"
                value={chorusMix}
                onChange={(e) => handleChorusMix(parseFloat(e.target.value))}
                className="w-full accent-ax-accent"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};