export class SubHarmonicRestorer {
    public inputNode: GainNode;
    public outputNode: GainNode;

    private context: AudioContext;
    private isEnabled: boolean = false;

    private lowpassFilter: BiquadFilterNode;
    private subGenerator: WaveShaperNode;
    private subGain: GainNode;
    private sweepFilter: BiquadFilterNode;
    private wideSplitter: ChannelSplitterNode;
    private wideMerger: ChannelMergerNode;
    private wideGainL: GainNode;
    private wideGainR: GainNode;

    private dryGain: GainNode;
    private wetGain: GainNode;
    private bypassGain: GainNode;

    private params = {
        restoration: 8,
        subRange: 40,
        sweep: 70,
        wide: 60,
    };

    constructor(context: AudioContext) {
        this.context = context;
        this.inputNode = context.createGain();
        this.outputNode = context.createGain();
        this.bypassGain = context.createGain();
        this.bypassGain.gain.value = 1;

        this.lowpassFilter = context.createBiquadFilter();
        this.lowpassFilter.type = 'lowpass';
        this.lowpassFilter.frequency.value = this.params.subRange;
        this.lowpassFilter.Q.value = 0.707;

        this.subGenerator = context.createWaveShaper();
        this.subGenerator.curve = this.createSubHarmonicCurve();
        this.subGenerator.oversample = '4x';

        this.subGain = context.createGain();
        this.subGain.gain.value = this.dbToGain(this.params.restoration);

        this.sweepFilter = context.createBiquadFilter();
        this.sweepFilter.type = 'lowpass';
        this.sweepFilter.frequency.value = this.params.sweep;
        this.sweepFilter.Q.value = 1.0;

        this.wideSplitter = context.createChannelSplitter(2);
        this.wideMerger = context.createChannelMerger(2);
        this.wideGainL = context.createGain();
        this.wideGainR = context.createGain();
        this.applyWide(this.params.wide);

        this.dryGain = context.createGain();
        this.dryGain.gain.value = 1;
        this.wetGain = context.createGain();
        this.wetGain.gain.value = 0.5;

        this.inputNode.connect(this.lowpassFilter);
        this.lowpassFilter.connect(this.subGenerator);
        this.subGenerator.connect(this.subGain);
        this.subGain.connect(this.sweepFilter);
        this.sweepFilter.connect(this.wideSplitter);

        this.wideSplitter.connect(this.wideGainL, 0);
        this.wideSplitter.connect(this.wideGainR, 1);
        this.wideGainL.connect(this.wideMerger, 0, 0);
        this.wideGainR.connect(this.wideMerger, 0, 1);

        this.wideMerger.connect(this.wetGain);
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

    public setRestoration(db: number): void {
        this.params.restoration = Math.max(-60, Math.min(12, db));
        const gainValue = this.params.restoration <= -60 ? 0 : this.dbToGain(this.params.restoration);
        this.subGain.gain.setTargetAtTime(gainValue, this.context.currentTime, 0.1);
    }

    public setSubRange(hz: number): void {
        this.params.subRange = Math.max(20, Math.min(60, hz));
        this.lowpassFilter.frequency.setTargetAtTime(this.params.subRange, this.context.currentTime, 0.1);
    }

    public setSweep(hz: number): void {
        this.params.sweep = Math.max(20, Math.min(200, hz));
        this.sweepFilter.frequency.setTargetAtTime(this.params.sweep, this.context.currentTime, 0.1);
    }

    public setWide(percent: number): void {
        this.params.wide = Math.max(0, Math.min(100, percent));
        this.applyWide(this.params.wide);
    }

    public setMix(percent: number): void {
        const normalized = Math.max(0, Math.min(100, percent)) / 100;
        this.wetGain.gain.setTargetAtTime(normalized, this.context.currentTime, 0.1);
    }

    public getParams() {
        return { ...this.params };
    }

    public applyParams(params: Partial<typeof this.params>): void {
        if (params.restoration !== undefined) this.setRestoration(params.restoration);
        if (params.subRange !== undefined) this.setSubRange(params.subRange);
        if (params.sweep !== undefined) this.setSweep(params.sweep);
        if (params.wide !== undefined) this.setWide(params.wide);
    }

    private dbToGain(db: number): number {
        return Math.pow(10, db / 20);
    }

    private applyWide(percent: number): void {
        const factor = percent / 100;
        // Left = Mid + Side * factor
        // Right = Mid - Side * factor
        const leftGain = 0.5 + factor * 0.5;
        const rightGain = 0.5 + factor * 0.5;
        this.wideGainL.gain.setTargetAtTime(leftGain, this.context.currentTime, 0.1);
        this.wideGainR.gain.setTargetAtTime(rightGain, this.context.currentTime, 0.1);
    }

    private createSubHarmonicCurve(): Float32Array<ArrayBuffer> {
        const samples = 44100;
        const curve = new Float32Array(new ArrayBuffer(samples * Float32Array.BYTES_PER_ELEMENT));
        const k = 50;
        const deg = Math.PI / 180;

        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
        }
        return curve;
    }
}