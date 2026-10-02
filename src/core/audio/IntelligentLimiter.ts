export type LimiterMode = 'standard' | 'ai-sens' | 'safe-bass';

export class IntelligentLimiter {
    public inputNode: GainNode;
    public outputNode: GainNode;

    private context: AudioContext;
    private compressor: DynamicsCompressorNode;
    private analyser: AnalyserNode;
    private bypassGain: GainNode;
    private isEnabled: boolean = false;
    private mode: LimiterMode = 'standard';

    private modeParams: Record<LimiterMode, {
        threshold: number;
        knee: number;
        ratio: number;
        attack: number;
        release: number;
    }> = {
            'standard': {
                threshold: -6,
                knee: 0,
                ratio: 20,
                attack: 0.003,
                release: 0.1
            },
            'ai-sens': {
                threshold: -12,
                knee: 6,
                ratio: 12,
                attack: 0.01,
                release: 0.15
            },
            'safe-bass': {
                threshold: -3,
                knee: 3,
                ratio: 15,
                attack: 0.005,
                release: 0.08
            }
        };

    constructor(context: AudioContext) {
        this.context = context;
        this.inputNode = context.createGain();
        this.outputNode = context.createGain();
        this.bypassGain = context.createGain();
        this.bypassGain.gain.value = 1;

        this.compressor = context.createDynamicsCompressor();
        this.analyser = context.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.8;

        this.applyMode('standard');

        this.inputNode.connect(this.compressor);
        this.compressor.connect(this.analyser);
        this.analyser.connect(this.outputNode);

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

    public setMode(mode: LimiterMode): void {
        this.mode = mode;
        this.applyMode(mode);
    }

    public getMode(): LimiterMode {
        return this.mode;
    }

    public setThreshold(db: number): void {
        this.compressor.threshold.setTargetAtTime(db, this.context.currentTime, 0.1);
    }

    public setKnee(db: number): void {
        this.compressor.knee.setTargetAtTime(db, this.context.currentTime, 0.1);
    }

    public setRatio(ratio: number): void {
        this.compressor.ratio.setTargetAtTime(ratio, this.context.currentTime, 0.1);
    }

    public setAttack(seconds: number): void {
        this.compressor.attack.setTargetAtTime(seconds, this.context.currentTime, 0.1);
    }

    public setRelease(seconds: number): void {
        this.compressor.release.setTargetAtTime(seconds, this.context.currentTime, 0.1);
    }

    public getGainReduction(): number {
        return this.compressor.reduction;
    }

    public getAnalyserData(): Uint8Array {
        const data = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(data);
        return data;
    }

    public getAnalyser(): AnalyserNode {
        return this.analyser;
    }

    private applyMode(mode: LimiterMode): void {
        const params = this.modeParams[mode];
        this.compressor.threshold.setTargetAtTime(params.threshold, this.context.currentTime, 0.1);
        this.compressor.knee.setTargetAtTime(params.knee, this.context.currentTime, 0.1);
        this.compressor.ratio.setTargetAtTime(params.ratio, this.context.currentTime, 0.1);
        this.compressor.attack.setTargetAtTime(params.attack, this.context.currentTime, 0.1);
        this.compressor.release.setTargetAtTime(params.release, this.context.currentTime, 0.1);
    }
}