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

  public getEnabled(): boolean {
    return this.isEnabled;
  }

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

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  public setThreshold(val: number): void { this.node.threshold.setTargetAtTime(val, this.context.currentTime, 0.1); }
  public setRatio(val: number): void { this.node.ratio.setTargetAtTime(val, this.context.currentTime, 0.1); }
  public setAttack(val: number): void { this.node.attack.setTargetAtTime(val, this.context.currentTime, 0.1); }
  public setRelease(val: number): void { this.node.release.setTargetAtTime(val, this.context.currentTime, 0.1); }
}

export class DelayModule {
  public inputNode: GainNode;
  public outputNode: GainNode;
  private delayNode: DelayNode;
  private feedbackNode: GainNode;
  private wetGain: GainNode;
  private dryGain: GainNode;
  private bypassGain: GainNode;
  private context: AudioContext;
  private isEnabled: boolean = false;

  constructor(context: AudioContext) {
    this.context = context;
    this.inputNode = context.createGain();
    this.outputNode = context.createGain();
    this.bypassGain = context.createGain();
    this.bypassGain.gain.value = 1;

    this.delayNode = context.createDelay(5.0);
    this.delayNode.delayTime.value = 0.3;

    this.feedbackNode = context.createGain();
    this.feedbackNode.gain.value = 0.4;

    this.wetGain = context.createGain();
    this.wetGain.gain.value = 0.5;

    this.dryGain = context.createGain();
    this.dryGain.gain.value = 1;

    this.inputNode.connect(this.delayNode);
    this.delayNode.connect(this.feedbackNode);
    this.feedbackNode.connect(this.delayNode);

    this.delayNode.connect(this.wetGain);
    this.wetGain.connect(this.outputNode);

    this.inputNode.connect(this.dryGain);
    this.dryGain.connect(this.outputNode);

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

  public setDelayTime(seconds: number): void {
    this.delayNode.delayTime.setTargetAtTime(seconds, this.context.currentTime, 0.1);
  }

  public setFeedback(value: number): void {
    this.feedbackNode.gain.setTargetAtTime(value, this.context.currentTime, 0.1);
  }

  public setMix(value: number): void {
    this.wetGain.gain.setTargetAtTime(value, this.context.currentTime, 0.1);
  }
}

export class ReverbModule {
  public inputNode: GainNode;
  public outputNode: GainNode;
  private convolver: ConvolverNode;
  private wetGain: GainNode;
  private dryGain: GainNode;
  private bypassGain: GainNode;
  private context: AudioContext;
  private isEnabled: boolean = false;

  constructor(context: AudioContext) {
    this.context = context;
    this.inputNode = context.createGain();
    this.outputNode = context.createGain();
    this.bypassGain = context.createGain();
    this.bypassGain.gain.value = 1;

    this.convolver = context.createConvolver();
    this.convolver.buffer = this.createImpulseResponse(2.5, 2.0);

    this.wetGain = context.createGain();
    this.wetGain.gain.value = 0.3;

    this.dryGain = context.createGain();
    this.dryGain.gain.value = 1;

    this.inputNode.connect(this.convolver);
    this.convolver.connect(this.wetGain);
    this.wetGain.connect(this.outputNode);

    this.inputNode.connect(this.dryGain);
    this.dryGain.connect(this.outputNode);

    this.inputNode.connect(this.bypassGain);
    this.bypassGain.connect(this.outputNode);
  }

  private createImpulseResponse(duration: number, decay: number): AudioBuffer {
    const sampleRate = this.context.sampleRate;
    const length = sampleRate * duration;
    const impulse = this.context.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }

    return impulse;
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    const bypassValue = enabled ? 0 : 1;
    this.bypassGain.gain.setTargetAtTime(bypassValue, this.context.currentTime, 0.05);
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  public setMix(value: number): void {
    this.wetGain.gain.setTargetAtTime(value, this.context.currentTime, 0.1);
  }

  public setDecay(seconds: number): void {
    this.convolver.buffer = this.createImpulseResponse(seconds, 2.0);
  }
}

export class ChorusModule {
  public inputNode: GainNode;
  public outputNode: GainNode;
  private delayNode: DelayNode;
  private lfo: OscillatorNode;
  private lfoGain: GainNode;
  private wetGain: GainNode;
  private dryGain: GainNode;
  private bypassGain: GainNode;
  private context: AudioContext;
  private isEnabled: boolean = false;

  constructor(context: AudioContext) {
    this.context = context;
    this.inputNode = context.createGain();
    this.outputNode = context.createGain();
    this.bypassGain = context.createGain();
    this.bypassGain.gain.value = 1;

    this.delayNode = context.createDelay(0.1);
    this.delayNode.delayTime.value = 0.025;

    this.lfo = context.createOscillator();
    this.lfo.frequency.value = 1.5;
    this.lfo.type = 'sine';

    this.lfoGain = context.createGain();
    this.lfoGain.gain.value = 0.005;

    this.wetGain = context.createGain();
    this.wetGain.gain.value = 0.5;

    this.dryGain = context.createGain();
    this.dryGain.gain.value = 1;

    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.delayNode.delayTime);

    this.inputNode.connect(this.delayNode);
    this.delayNode.connect(this.wetGain);
    this.wetGain.connect(this.outputNode);

    this.inputNode.connect(this.dryGain);
    this.dryGain.connect(this.outputNode);

    this.inputNode.connect(this.bypassGain);
    this.bypassGain.connect(this.outputNode);

    this.lfo.start();
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    const bypassValue = enabled ? 0 : 1;
    this.bypassGain.gain.setTargetAtTime(bypassValue, this.context.currentTime, 0.05);
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  public setRate(hz: number): void {
    this.lfo.frequency.setTargetAtTime(hz, this.context.currentTime, 0.1);
  }

  public setDepth(seconds: number): void {
    this.lfoGain.gain.setTargetAtTime(seconds, this.context.currentTime, 0.1);
  }

  public setMix(value: number): void {
    this.wetGain.gain.setTargetAtTime(value, this.context.currentTime, 0.1);
  }
}