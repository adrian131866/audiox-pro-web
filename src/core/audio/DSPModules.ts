export class CrossoverModule {
  public inputNode: GainNode;
  public outputNode: GainNode;
  private lowpass: BiquadFilterNode;
  private highpass: BiquadFilterNode;
  private bypassGain: GainNode;
  private context: AudioContext;
  private isEnabled: boolean = true;

  constructor(context: AudioContext) {
    this.context = context;
    this.inputNode = context.createGain();
    this.outputNode = context.createGain();
    this.bypassGain = context.createGain();
    this.bypassGain.gain.value = 1;

    this.lowpass = context.createBiquadFilter();
    this.lowpass.type = 'lowpass';
    this.lowpass.frequency.value = 20000;
    this.lowpass.Q.value = 0.707;

    this.highpass = context.createBiquadFilter();
    this.highpass.type = 'highpass';
    this.highpass.frequency.value = 20;
    this.highpass.Q.value = 0.707;

    this.inputNode.connect(this.highpass);
    this.highpass.connect(this.lowpass);
    this.lowpass.connect(this.outputNode);

    this.inputNode.connect(this.bypassGain);
    this.bypassGain.connect(this.outputNode);
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    const bypassValue = enabled ? 0 : 1;
    this.bypassGain.gain.setTargetAtTime(bypassValue, this.context.currentTime, 0.05);
  }

  public getEnabled(): boolean { return this.isEnabled; }

  public setLowPassFreq(freq: number): void {
    this.lowpass.frequency.setTargetAtTime(freq, this.context.currentTime, 0.1);
  }

  public setHighPassFreq(freq: number): void {
    this.highpass.frequency.setTargetAtTime(freq, this.context.currentTime, 0.1);
  }
}

export class CompressorModule {
  public inputNode: GainNode;
  public outputNode: GainNode;
  public node: DynamicsCompressorNode;
  private bypassGain: GainNode;
  private context: AudioContext;
  private isEnabled: boolean = true;

  constructor(context: AudioContext) {
    this.context = context;
    this.inputNode = context.createGain();
    this.outputNode = context.createGain();
    this.bypassGain = context.createGain();
    this.bypassGain.gain.value = 1;

    this.node = context.createDynamicsCompressor();
    this.node.threshold.value = -24;
    this.node.knee.value = 30;
    this.node.ratio.value = 12;
    this.node.attack.value = 0.003;
    this.node.release.value = 0.25;

    this.inputNode.connect(this.node);
    this.node.connect(this.outputNode);

    this.inputNode.connect(this.bypassGain);
    this.bypassGain.connect(this.outputNode);
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    const bypassValue = enabled ? 0 : 1;
    this.bypassGain.gain.setTargetAtTime(bypassValue, this.context.currentTime, 0.05);
  }

  public getEnabled(): boolean { return this.isEnabled; }

  public setThreshold(val: number): void { this.node.threshold.setTargetAtTime(val, this.context.currentTime, 0.1); }
  public setRatio(val: number): void { this.node.ratio.setTargetAtTime(val, this.context.currentTime, 0.1); }
  public setAttack(val: number): void { this.node.attack.setTargetAtTime(val, this.context.currentTime, 0.1); }
  public setRelease(val: number): void { this.node.release.setTargetAtTime(val, this.context.currentTime, 0.1); }
}