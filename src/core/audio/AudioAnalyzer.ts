export interface AudioProfile {
    bassLevel: number;
    midLevel: number;
    highLevel: number;
    dynamicRange: number;
    stereoWidth: number;
    suggestedGenre: string;
}

export class AudioAnalyzer {
    private analyser: AnalyserNode;
    private context: AudioContext;
    private frequencyData: Uint8Array<ArrayBuffer>;

    constructor(context: AudioContext, analyser: AnalyserNode) {
        this.context = context;
        this.analyser = analyser;
        this.analyser.fftSize = 2048;
        this.analyser.smoothingTimeConstant = 0.8;

        this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    }

    public analyze(): AudioProfile {
        this.analyser.getByteFrequencyData(this.frequencyData);

        const sampleRate = this.context.sampleRate;
        const binSize = sampleRate / this.analyser.fftSize;

        const bassRange = { min: 20, max: 250 };
        const midRange = { min: 250, max: 4000 };
        const highRange = { min: 4000, max: 20000 };

        const bassLevel = this.calculateBandLevel(bassRange, binSize);
        const midLevel = this.calculateBandLevel(midRange, binSize);
        const highLevel = this.calculateBandLevel(highRange, binSize);

        const dynamicRange = this.calculateDynamicRange();
        const stereoWidth = this.calculateStereoWidth();
        const suggestedGenre = this.suggestGenre(bassLevel, midLevel, highLevel, dynamicRange);

        return {
            bassLevel,
            midLevel,
            highLevel,
            dynamicRange,
            stereoWidth,
            suggestedGenre
        };
    }

    private calculateBandLevel(range: { min: number; max: number }, binSize: number): number {
        const startBin = Math.floor(range.min / binSize);
        const endBin = Math.floor(range.max / binSize);

        let sum = 0;
        let count = 0;

        for (let i = startBin; i < endBin && i < this.frequencyData.length; i++) {
            sum += this.frequencyData[i];
            count++;
        }

        return count > 0 ? (sum / count / 255) * 100 : 0;
    }

    private calculateDynamicRange(): number {
        let peak = 0;
        let sum = 0;

        for (let i = 0; i < this.frequencyData.length; i++) {
            const value = this.frequencyData[i];
            if (value > peak) peak = value;
            sum += value;
        }

        const rms = Math.sqrt(sum / this.frequencyData.length);
        const dynamicRange = peak - rms;

        return Math.min(100, (dynamicRange / 255) * 100);
    }

    private calculateStereoWidth(): number {
        const highEnergy = this.calculateBandLevel(
            { min: 4000, max: 20000 },
            this.context.sampleRate / this.analyser.fftSize
        );

        return Math.min(100, highEnergy * 1.5);
    }

    private suggestGenre(bass: number, mid: number, high: number, dynamic: number): string {
        if (bass > 70 && dynamic < 40) return 'Reggaeton/Trap';
        if (bass > 60 && mid > 50) return 'Pop';
        if (bass > 50 && high > 60) return 'Electrónica';
        if (mid > 60 && dynamic > 50) return 'Rock';
        if (mid > 50 && bass < 40) return 'Jazz/Vocal';
        if (bass > 70 && mid < 40) return 'Bass Boost';

        return 'General';
    }

    public suggestEQ(): number[] {
        const profile = this.analyze();
        const eqBands = new Array(10).fill(0);

        if (profile.bassLevel < 30) {
            eqBands[0] = 6;
            eqBands[1] = 5;
            eqBands[2] = 4;
        } else if (profile.bassLevel > 70) {
            eqBands[0] = -3;
            eqBands[1] = -2;
            eqBands[2] = -1;
        }

        if (profile.midLevel < 40) {
            eqBands[3] = 3;
            eqBands[4] = 4;
            eqBands[5] = 3;
        } else if (profile.midLevel > 70) {
            eqBands[3] = -2;
            eqBands[4] = -1;
            eqBands[5] = -1;
        }

        if (profile.highLevel < 30) {
            eqBands[6] = 2;
            eqBands[7] = 4;
            eqBands[8] = 5;
            eqBands[9] = 6;
        } else if (profile.highLevel > 70) {
            eqBands[6] = -1;
            eqBands[7] = -2;
            eqBands[8] = -2;
            eqBands[9] = -3;
        }

        return eqBands;
    }

    public suggestSubHarmonic() {
        const profile = this.analyze();

        return {
            restoration: profile.bassLevel < 40 ? 8 : profile.bassLevel < 60 ? 4 : 0,
            subRange: profile.bassLevel < 40 ? 40 : 30,
            sweep: profile.bassLevel < 40 ? 70 : 50,
            wide: profile.stereoWidth < 50 ? 60 : 40,
            mix: profile.bassLevel < 40 ? 50 : 30
        };
    }
}