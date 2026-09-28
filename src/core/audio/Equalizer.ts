export class Equalizer {
  private context: AudioContext;
  private bands: BiquadFilterNode[] = [];
  public inputNode: GainNode;
  public outputNode: GainNode;

  private static FREQUENCIES = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

  constructor(context: AudioContext) {
    this.context = context;

    // Crear nodos de entrada y salida del módulo
    this.inputNode = context.createGain();
    this.outputNode = context.createGain();

    // Crear los 10 filtros en serie
    let previousNode: AudioNode = this.inputNode;

    Equalizer.FREQUENCIES.forEach((freq) => {
      const filter = context.createBiquadFilter();
      filter.type = 'peaking'; // Tipo "peaking" para ecualización paramétrica
      filter.frequency.value = freq;
      filter.Q.value = 1.41; // Factor Q estándar (ancho de banda)
      filter.gain.value = 0; // Ganancia inicial en 0 dB (sin alteración)

      previousNode.connect(filter);
      previousNode = filter;
      this.bands.push(filter);
    });

    // Conectar el último filtro al outputNode
    previousNode.connect(this.outputNode);
  }

  /**
   * Ajusta la ganancia de una banda específica.
   * @param bandIndex - Índice de la banda (0-9)
   * @param gainDB - Ganancia en decibelios (-12 a +12)
   */
  public setBandGain(bandIndex: number, gainDB: number): void {
    if (bandIndex >= 0 && bandIndex < this.bands.length) {
      const filter = this.bands[bandIndex];
      // Usar setTargetAtTime para transiciones suaves (sin clicks)
      filter.gain.setTargetAtTime(gainDB, this.context.currentTime, 0.02);
    }
  }

  /**
   * Resetea todas las bandas a 0 dB.
   */
  public reset(): void {
    this.bands.forEach((filter) => {
      filter.gain.setTargetAtTime(0, this.context.currentTime, 0.02);
    });
  }

  /**
   * Obtiene las frecuencias de las bandas (para la UI).
   */
  public getFrequencies(): number[] {
    return Equalizer.FREQUENCIES;
  }

  /**
   * Obtiene la ganancia actual de cada banda (para la UI).
   */
  public getBandGains(): number[] {
    return this.bands.map((filter) => filter.gain.value);
  }
  
  public setAllGains(gains: number[]): void {
    gains.forEach((gain, index) => {
      if (index < this.bands.length) {
        this.bands[index].gain.setTargetAtTime(gain, this.context.currentTime, 0.02);
      }
    });
  }
}