// src/core/audio/SubHarmonicRestorer.ts
// Motor Epicenter Profesional: Bass Enhancer sin distorsión metálica

export interface SubHarmonicState {
  active: boolean;
  mode: 'pro' | 'standard';
  restoration: number;
  sweepFrequency: number;
  wide: number;
  frequencyRange: { low: number; high: number };
  depth: number;
  body: number;
  presence: number;
}

export class SubHarmonicRestorer {
  public inputNode: GainNode;
  public outputNode: GainNode;
  private context: AudioContext;
  private state: SubHarmonicState;

  private lowpassFilter: BiquadFilterNode;
  private highpassFilter: BiquadFilterNode;
  private bassBoost: BiquadFilterNode;
  private shaper: WaveShaperNode;
  private subGain: GainNode;
  private dryGain: GainNode;
  private wetGain: GainNode;
  private bypassGain: GainNode;
  private analyser: AnalyserNode;

  constructor(context: AudioContext) {
    this.context = context;
    this.inputNode = context.createGain();
    this.outputNode = context.createGain();

    this.state = {
      active: false,
      mode: 'pro',
      restoration: 8,
      sweepFrequency: 70,
      wide: 60,
      frequencyRange: { low: 20, high: 60 },
      depth: 70,
      body: 50,
      presence: 40,
    };

    this.highpassFilter = context.createBiquadFilter();
    this.highpassFilter.type = 'highpass';
    this.highpassFilter.frequency.value = 20;

    this.lowpassFilter = context.createBiquadFilter();
    this.lowpassFilter.type = 'lowpass';
    this.lowpassFilter.frequency.value = 120;
    this.lowpassFilter.Q.value = 0.707;

    this.bassBoost = context.createBiquadFilter();
    this.bassBoost.type = 'lowshelf';
    this.bassBoost.frequency.value = 100;
    this.bassBoost.gain.value = 0;

    this.shaper = context.createWaveShaper();
    this.shaper.curve = this.makeSmoothSaturationCurve(10) as any;
    this.shaper.oversample = '4x';

    this.subGain = context.createGain();
    this.subGain.gain.value = 0;

    this.dryGain = context.createGain();
    this.dryGain.gain.value = 1;

    this.wetGain = context.createGain();
    this.wetGain.gain.value = 0;

    this.bypassGain = context.createGain();
    this.bypassGain.gain.value = 1;

    this.analyser = context.createAnalyser();
    this.analyser.fftSize = 256;

    
    this.inputNode.connect(this.dryGain);
    this.dryGain.connect(this.outputNode);

    this.inputNode.connect(this.highpassFilter);
    this.highpassFilter.connect(this.lowpassFilter);
    this.lowpassFilter.connect(this.bassBoost);
    this.bassBoost.connect(this.shaper);
    this.shaper.connect(this.subGain);
    this.subGain.connect(this.wetGain);
    this.wetGain.connect(this.outputNode);

    this.inputNode.connect(this.bypassGain);
    this.bypassGain.connect(this.outputNode);

    this.outputNode.connect(this.analyser);
  }

  public setActive(active: boolean): void {
    this.state.active = active;
    const bypassValue = active ? 0 : 1;
    this.bypassGain.gain.setTargetAtTime(bypassValue, this.context.currentTime, 0.05);
  }

  public getActive(): boolean { return this.state.active; }

  public setRestoration(db: number): void {
    this.state.restoration = db;
    const normalized = (db + 12) / 24;
    this.shaper.curve = this.makeSmoothSaturationCurve(5 + normalized * 30) as any;
    this.subGain.gain.setTargetAtTime(normalized * 0.8, this.context.currentTime, 0.1);
  }

  public setSweepFrequency(freq: number): void {
    this.state.sweepFrequency = freq;
    this.lowpassFilter.frequency.setTargetAtTime(freq, this.context.currentTime, 0.1);
  }

  public setWide(percent: number): void {
    this.state.wide = percent;
    this.wetGain.gain.setTargetAtTime(percent / 100, this.context.currentTime, 0.1);
  }

  public setDepth(value: number): void {
    this.state.depth = value;
    const normalized = value / 100;
    const freq = 60 + normalized * 60;
    this.lowpassFilter.frequency.setTargetAtTime(freq, this.context.currentTime, 0.1);
  }

  public setBody(value: number): void {
    this.state.body = value;
    const normalized = value / 100;
    this.bassBoost.gain.setTargetAtTime(normalized * 12, this.context.currentTime, 0.1);
  }

  public setPresence(value: number): void {
    this.state.presence = value;
    const normalized = value / 100;
    this.wetGain.gain.setTargetAtTime(normalized * 0.6, this.context.currentTime, 0.1);
  }

  public getState(): SubHarmonicState { return { ...this.state }; }

  public applyState(state: Partial<SubHarmonicState>): void {
    if (state.active !== undefined) this.setActive(state.active);
    if (state.restoration !== undefined) this.setRestoration(state.restoration);
    if (state.sweepFrequency !== undefined) this.setSweepFrequency(state.sweepFrequency);
    if (state.wide !== undefined) this.setWide(state.wide);
    if (state.depth !== undefined) this.setDepth(state.depth);
    if (state.body !== undefined) this.setBody(state.body);
    if (state.presence !== undefined) this.setPresence(state.presence);
  }

  public getAnalyser(): AnalyserNode { return this.analyser; }

  private makeSmoothSaturationCurve(amount: number): Float32Array {
    const k = amount;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;

    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }
}
