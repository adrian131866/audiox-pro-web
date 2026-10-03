export interface SubHarmonicState {
    active: boolean;
    mode: 'pro' | 'standard';
    restoration: number;      // -12 dB a +12 dB (default: +8)
    sweepFrequency: number;   // 20 Hz - 120 Hz (default: 70)
    wide: number;             // 0% - 100% (default: 60)
    frequencyRange: { low: number; high: number }; // default: {20, 60}
    depth: number;            // Profundidad del bajo (0-100, default: 70)
    body: number;             // Cuerpo del bajo (0-100, default: 50)
    presence: number;         // Presencia del bajo (0-100, default: 40)
}

export class SubHarmonicRestorer {
    public inputNode: GainNode;
    public outputNode: GainNode;
    private context: AudioContext;
    private state: SubHarmonicState;

    private lowpassFilter: BiquadFilterNode;
    private highpassFilter: BiquadFilterNode;
    private shaper: WaveShaperNode;
    private subOscillatorGain: GainNode;
    private dryGain: GainNode;
    private wetGain: GainNode;
    private bypassGain: GainNode;
    private wideGain: GainNode;
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

        this.lowpassFilter = context.createBiquadFilter();
        this.lowpassFilter.type = 'lowpass';
        this.lowpassFilter.frequency.value = 120;
        this.lowpassFilter.Q.value = 0.707;

        this.highpassFilter = context.createBiquadFilter();
        this.highpassFilter.type = 'highpass';
        this.highpassFilter.frequency.value = 20;
        this.highpassFilter.Q.value = 0.707;

        this.shaper = context.createWaveShaper();
        this.shaper.curve = this.makeDistortionCurve(30);
        this.shaper.oversample = '4x';

        this.subOscillatorGain = context.createGain();
        this.subOscillatorGain.gain.value = 0;

        this.dryGain = context.createGain();
        this.dryGain.gain.value = 1;

        this.wetGain = context.createGain();
        this.wetGain.gain.value = 0;

        this.bypassGain = context.createGain();
        this.bypassGain.gain.value = 1;

        this.wideGain = context.createGain();
        this.wideGain.gain.value = 0.6;

        this.analyser = context.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.8;
        this.inputNode.connect(this.highpassFilter);
        this.highpassFilter.connect(this.lowpassFilter);
        this.lowpassFilter.connect(this.shaper);
        this.shaper.connect(this.subOscillatorGain);
        this.subOscillatorGain.connect(this.wideGain);
        this.wideGain.connect(this.wetGain);
        this.wetGain.connect(this.outputNode);
        this.inputNode.connect(this.dryGain);
        this.dryGain.connect(this.outputNode);
        this.inputNode.connect(this.bypassGain);
        this.bypassGain.connect(this.outputNode);
        this.wetGain.connect(this.analyser);
    }

    public setActive(active: boolean): void {
        this.state.active = active;
        const bypassValue = active ? 0 : 1;
        this.bypassGain.gain.setTargetAtTime(bypassValue, this.context.currentTime, 0.05);
    }

    public getActive(): boolean {
        return this.state.active;
    }

    public setRestoration(db: number): void {
        this.state.restoration = db;
        const linearGain = Math.pow(10, db / 20);
        this.subOscillatorGain.gain.setTargetAtTime(linearGain, this.context.currentTime, 0.1);
    }

    public setSweepFrequency(freq: number): void {
        this.state.sweepFrequency = freq;
        this.lowpassFilter.frequency.setTargetAtTime(freq, this.context.currentTime, 0.1);
    }

    public setWide(percent: number): void {
        this.state.wide = percent;
        this.wideGain.gain.setTargetAtTime(percent / 100, this.context.currentTime, 0.1);
    }

    public setDepth(value: number): void {
        this.state.depth = value;
        const normalized = value / 100;
        this.shaper.curve = this.makeDistortionCurve(10 + normalized * 40);
    }

    public setBody(value: number): void {
        this.state.body = value;
        const normalized = value / 100;
        const lowFreq = 20 + normalized * 20; // 20-40 Hz
        const highFreq = 40 + normalized * 40; // 40-80 Hz
        this.state.frequencyRange = { low: lowFreq, high: highFreq };
        this.highpassFilter.frequency.setTargetAtTime(lowFreq, this.context.currentTime, 0.1);
    }

    public setPresence(value: number): void {
        this.state.presence = value;
        const normalized = value / 100;
        this.wetGain.gain.setTargetAtTime(normalized * 0.8, this.context.currentTime, 0.1);
    }

    public getState(): SubHarmonicState {
        return { ...this.state };
    }

    public applyState(state: Partial<SubHarmonicState>): void {
        if (state.active !== undefined) this.setActive(state.active);
        if (state.restoration !== undefined) this.setRestoration(state.restoration);
        if (state.sweepFrequency !== undefined) this.setSweepFrequency(state.sweepFrequency);
        if (state.wide !== undefined) this.setWide(state.wide);
        if (state.depth !== undefined) this.setDepth(state.depth);
        if (state.body !== undefined) this.setBody(state.body);
        if (state.presence !== undefined) this.setPresence(state.presence);
        if (state.mode !== undefined) this.state.mode = state.mode;
        if (state.frequencyRange !== undefined) this.state.frequencyRange = state.frequencyRange;
    }

    public getAnalyser(): AnalyserNode {
        return this.analyser;
    }

    private makeDistortionCurve(amount: number): Float32Array<ArrayBuffer> {
        const k = amount;
        const n_samples = 44100;
        const buffer = new ArrayBuffer(n_samples * Float32Array.BYTES_PER_ELEMENT);
        const curve = new Float32Array(buffer);
        const deg = Math.PI / 180;

        for (let i = 0; i < n_samples; ++i) {
            const x = (i * 2) / n_samples - 1;
            curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
        }
        return curve;
    }
}