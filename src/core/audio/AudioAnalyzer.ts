import { type SubHarmonicState } from './SubHarmonicRestorer';

export interface AnalysisResult {
    bassContent: number;      // 0-100: contenido de graves
    midContent: number;       // 0-100: contenido de medios
    highContent: number;      // 0-100: contenido de agudos
    dynamicRange: number;     // 0-100: rango dinámico
    recommendedEpicenter: Partial<SubHarmonicState>;
    recommendedEQ: number[];  // 10 bandas
    trackType: 'bass-heavy' | 'vocal' | 'balanced' | 'bright' | 'muddy';
}

export class AutoAnalyzer {
    private analyser: AnalyserNode;
    private dataArray: Uint8Array<ArrayBuffer>;

    constructor(analyser: AnalyserNode) {
        this.analyser = analyser;
        this.dataArray = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
    }

    public analyze(): AnalysisResult {
        this.analyser.getByteFrequencyData(this.dataArray);

        const binCount = this.dataArray.length;
        const sampleRate = this.analyser.context.sampleRate;
        const binSize = sampleRate / (binCount * 2);

        const bassEnd = Math.floor(250 / binSize);
        const midEnd = Math.floor(4000 / binSize);

        let bassSum = 0, midSum = 0, highSum = 0;
        let maxVal = 0;

        for (let i = 0; i < binCount; i++) {
            const val = this.dataArray[i];
            if (val > maxVal) maxVal = val;

            if (i < bassEnd) bassSum += val;
            else if (i < midEnd) midSum += val;
            else highSum += val;
        }

        const bassContent = (bassSum / (bassEnd * 255)) * 100;
        const midContent = (midSum / ((midEnd - bassEnd) * 255)) * 100;
        const highContent = (highSum / ((binCount - midEnd) * 255)) * 100;

        let trackType: AnalysisResult['trackType'] = 'balanced';
        if (bassContent > 60) trackType = 'bass-heavy';
        else if (midContent > 60 && bassContent < 30) trackType = 'vocal';
        else if (highContent > 60) trackType = 'bright';
        else if (bassContent > 50 && midContent > 50 && highContent < 30) trackType = 'muddy';

        const recommendedEpicenter = this.recommendEpicenter(bassContent, trackType);
        const recommendedEQ = this.recommendEQ(bassContent, midContent, highContent, trackType);

        return {
            bassContent,
            midContent,
            highContent,
            dynamicRange: (maxVal / 255) * 100,
            recommendedEpicenter,
            recommendedEQ,
            trackType,
        };
    }

    private recommendEpicenter(bassContent: number, trackType: string): Partial<SubHarmonicState> {
        // Si la pista tiene pocos graves, activar Epicenter con más intensidad
        if (bassContent < 30 || trackType === 'vocal' || trackType === 'bright') {
            return {
                active: true,
                restoration: 8 + (30 - bassContent) * 0.2, // Más restauración si hay menos graves
                sweepFrequency: 70,
                wide: 60,
                depth: 75,
                body: 60,
                presence: 50,
            };
        }

        // Si ya tiene buenos graves, usar Epicenter suave
        return {
            active: true,
            restoration: 4,
            sweepFrequency: 80,
            wide: 50,
            depth: 50,
            body: 40,
            presence: 30,
        };
    }

    private recommendEQ(bass: number, mid: number, high: number, trackType: string): number[] {
        const eq = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        const bassBias = Math.max(-2, Math.min(2, Math.round((bass - 50) / 25)));
        const midBias = Math.max(-2, Math.min(2, Math.round((mid - 50) / 25)));
        const highBias = Math.max(-2, Math.min(2, Math.round((high - 50) / 25)));

        if (trackType === 'bass-heavy') {
            eq[0] = -3; eq[1] = -2; eq[2] = -1; eq[3] = 0; eq[4] = 1;
            eq[5] = 2; eq[6] = 2; eq[7] = 1; eq[8] = 0; eq[9] = 0;
        } else if (trackType === 'vocal') {
            eq[0] = -2; eq[1] = -1; eq[2] = 0; eq[3] = 1; eq[4] = 2;
            eq[5] = 3; eq[6] = 2; eq[7] = 1; eq[8] = 0; eq[9] = -1;
        } else if (trackType === 'bright') {
            eq[0] = 1; eq[1] = 1; eq[2] = 1; eq[3] = 0; eq[4] = 0;
            eq[5] = 0; eq[6] = 0; eq[7] = -1; eq[8] = -2; eq[9] = -3;
        } else if (trackType === 'muddy') {
            eq[0] = 2; eq[1] = 1; eq[2] = 0; eq[3] = -2; eq[4] = -1;
            eq[5] = 0; eq[6] = 1; eq[7] = 2; eq[8] = 2; eq[9] = 1;
        } else {
            eq[0] = 2; eq[1] = 1; eq[2] = 0; eq[3] = 0; eq[4] = 0;
            eq[5] = 0; eq[6] = 0; eq[7] = 0; eq[8] = 1; eq[9] = 2;
        }

        for (let i = 0; i < eq.length; i++) {
            if (i < 3) {
                eq[i] += bassBias;
            } else if (i < 7) {
                eq[i] += midBias;
            } else {
                eq[i] += highBias;
            }
        }

        return eq.map(value => Math.max(-6, Math.min(6, value)));
    }
}