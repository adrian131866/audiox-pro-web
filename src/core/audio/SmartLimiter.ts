export type LimiterMode = 'ai-sens' | 'safe-bass' | 'off';

export interface SmartLimiterState {
    mode: LimiterMode;
    threshold: number;      // dB (default: -1)
    attack: number;         // ms (default: 0.1)
    release: number;        // ms (default: 50)
    gainReduction: number;  // dB en tiempo real (0 a -20)
}

export class SmartLimiter {
    public inputNode: GainNode;
    public outputNode: GainNode;
    private context: AudioContext;
    private state: SmartLimiterState;

    private compressor: DynamicsCompressorNode;
    private analyser: AnalyserNode;
    private dataArray: Uint8Array<ArrayBuffer>;
    private bassAnalyser: AnalyserNode;
    private bassDataArray: Uint8Array<ArrayBuffer>;

    constructor(context: AudioContext) {
        this.context = context;
        this.inputNode = context.createGain();
        this.outputNode = context.createGain();

        this.state = {
            mode: 'off',
            threshold: -1,
            attack: 0.1,
            release: 50,
            gainReduction: 0,
        };

        this.compressor = context.createDynamicsCompressor();
        this.compressor.threshold.value = -1;
        this.compressor.knee.value = 0;
        this.compressor.ratio.value = 20; 
        this.compressor.attack.value = 0.001;
        this.compressor.release.value = 0.05;

       
        this.analyser = context.createAnalyser();
        this.analyser.fftSize = 1024;
        this.analyser.smoothingTimeConstant = 0.8;
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

        this.bassAnalyser = context.createAnalyser();
        this.bassAnalyser.fftSize = 256;
        this.bassAnalyser.smoothingTimeConstant = 0.9;
        this.bassDataArray = new Uint8Array(this.bassAnalyser.frequencyBinCount);

        this.inputNode.connect(this.compressor);
        this.compressor.connect(this.analyser);
        this.compressor.connect(this.bassAnalyser);
        this.analyser.connect(this.outputNode);
    }

    public setMode(mode: LimiterMode): void {
        this.state.mode = mode;

        if (mode === 'off') {
          
            this.compressor.threshold.setTargetAtTime(0, this.context.currentTime, 0.1);
            this.compressor.ratio.setTargetAtTime(1, this.context.currentTime, 0.1);
        } else if (mode === 'ai-sens') {
            
            this.compressor.threshold.setTargetAtTime(-3, this.context.currentTime, 0.1);
            this.compressor.ratio.setTargetAtTime(15, this.context.currentTime, 0.1);
            this.compressor.attack.setTargetAtTime(0.003, this.context.currentTime, 0.1);
            this.compressor.release.setTargetAtTime(0.1, this.context.currentTime, 0.1);
        } else if (mode === 'safe-bass') {
        
            this.compressor.threshold.setTargetAtTime(-6, this.context.currentTime, 0.1);
            this.compressor.ratio.setTargetAtTime(20, this.context.currentTime, 0.1);
            this.compressor.attack.setTargetAtTime(0.001, this.context.currentTime, 0.1);
            this.compressor.release.setTargetAtTime(0.01, this.context.currentTime, 0.1);
        }
    }

    public getMode(): LimiterMode {
        return this.state.mode;
    }

    public setThreshold(db: number): void {
        this.state.threshold = db;
        this.compressor.threshold.setTargetAtTime(db, this.context.currentTime, 0.1);
    }

    public setAttack(ms: number): void {
        this.state.attack = ms;
        this.compressor.attack.setTargetAtTime(ms / 1000, this.context.currentTime, 0.1);
    }

    public setRelease(ms: number): void {
        this.state.release = ms;
        this.compressor.release.setTargetAtTime(ms / 1000, this.context.currentTime, 0.1);
    }

    public getGainReduction(): number {
        if (this.state.mode === 'off') return 0;

        this.analyser.getByteFrequencyData(this.dataArray);

        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            sum += this.dataArray[i];
        }
        const avg = sum / this.dataArray.length;
        const rms = avg / 255;

        const db = 20 * Math.log10(rms);
        const gr = Math.max(-20, Math.min(0, db));

        this.state.gainReduction = gr;
        return gr;
    }

    public getBassContent(): number {
        if (this.state.mode !== 'safe-bass') return 0;

        this.bassAnalyser.getByteFrequencyData(this.bassDataArray);

        const bassBins = 10;
        let sum = 0;
        for (let i = 0; i < bassBins; i++) {
            sum += this.bassDataArray[i];
        }
        const avg = sum / bassBins;
        return (avg / 255) * 100; // 0-100%
    }

    public getState(): SmartLimiterState {
        return { ...this.state };
    }

    public getAnalyser(): AnalyserNode {
        return this.analyser;
    }
}