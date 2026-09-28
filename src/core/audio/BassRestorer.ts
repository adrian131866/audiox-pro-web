export class BassRestorer {
  public inputNode: GainNode;
  public outputNode: GainNode;
  private context: AudioContext;
  
  private lowpassFilter: BiquadFilterNode;
  private shaper: WaveShaperNode;
  private mixGain: GainNode;
  private dryGain: GainNode;
  private bypassGain: GainNode;
  private isEnabled: boolean = true;

  constructor(context: AudioContext) {
    this.context = context;
    this.inputNode = context.createGain();
    this.outputNode = context.createGain();
    this.bypassGain = context.createGain();
    this.bypassGain.gain.value = 1;

    this.lowpassFilter = context.createBiquadFilter();
    this.lowpassFilter.type = 'lowpass';
    this.lowpassFilter.frequency.value = 120;

    this.shaper = context.createWaveShaper();
    const curveData = this.makeDistortionCurve(20);
    this.shaper.curve = new Float32Array(curveData);
    this.shaper.oversample = '4x';

    this.dryGain = context.createGain();
    this.mixGain = context.createGain();

    this.dryGain.gain.value = 1;
    this.mixGain.gain.value = 0;

    // Ruta procesada
    this.inputNode.connect(this.lowpassFilter);
    this.lowpassFilter.connect(this.shaper);
    this.shaper.connect(this.mixGain);
    this.mixGain.connect(this.outputNode);

    // Ruta limpia (dry)
    this.inputNode.connect(this.dryGain);
    this.dryGain.connect(this.outputNode);

    // Ruta bypass (cuando el módulo está completamente desactivado)
    this.inputNode.connect(this.bypassGain);
    this.bypassGain.connect(this.outputNode);
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    const bypassValue = enabled ? 0 : 1;
    this.bypassGain.gain.setTargetAtTime(bypassValue, this.context.currentTime, 0.05);
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  public setIntensity(value: number): void {
    const clampedValue = Math.max(0, Math.min(1, value));
    this.dryGain.gain.setTargetAtTime(1, this.context.currentTime, 0.1);
    this.mixGain.gain.setTargetAtTime(clampedValue, this.context.currentTime, 0.1);
  }

  private makeDistortionCurve(amount: number): Float32Array {
    const k = typeof amount === 'number' ? amount : 50;
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