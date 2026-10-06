export class AudioEngine {
  public setVolume(newVolume: number): void {
    this.setMasterVolume(newVolume);
  }
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private limiter: DynamicsCompressorNode | null = null;
  private mediaSource: MediaElementAudioSourceNode | null = null;
  private audioElement: HTMLAudioElement | null = null;
  
  
  public inputNode: GainNode | null = null;
  public outputNode: GainNode | null = null;
  
  private isInitialized: boolean = false;

  constructor() {}

  public async init(): Promise<void> {
    if (this.isInitialized && this.context) {
      if (this.context.state === 'suspended') await this.context.resume();
      return;
    }

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.context = new AudioContextClass();

    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;

    this.limiter = this.context.createDynamicsCompressor();
    this.limiter.threshold.value = -1.0;
    this.limiter.knee.value = 0;
    this.limiter.ratio.value = 20;
    this.limiter.attack.value = 0.003;
    this.limiter.release.value = 0.1;

    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = 0.8;

    // Nodos de inserción DSP (Puntos de conexión)
    this.inputNode = this.context.createGain();
    this.outputNode = this.context.createGain();

    // Cadena final: OutputNode -> Limiter -> Analyser -> MasterGain -> Destino
    this.outputNode.connect(this.limiter);
    this.limiter.connect(this.analyser);
    this.analyser.connect(this.masterGain);
    this.masterGain.connect(this.context.destination);

    this.isInitialized = true;
    console.log('🛡️ AudioEngine: Inicializado con cadena DSP modular.');
  }

  public getAudioElement(): HTMLAudioElement {
    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.crossOrigin = 'anonymous';
      if (this.context && this.isInitialized) {
        this.mediaSource = this.context.createMediaElementSource(this.audioElement);
        this.mediaSource.connect(this.inputNode!);
      }
    }
    return this.audioElement;
  }

  /**
   * Conecta un módulo DSP entre inputNode y outputNode
   */
  public connectDSPModule(input: AudioNode, output: AudioNode): void {
    if (!this.context || !this.isInitialized || !this.inputNode || !this.outputNode) {
      console.warn('⚠️ AudioEngine: No se puede conectar módulo DSP. Motor no inicializado.');
      return;
    }
    
    // Desconectar conexión directa anterior
    this.inputNode.disconnect();
    
    // inputNode → módulo DSP input → outputNode
    this.inputNode.connect(input);
    output.connect(this.outputNode);
    
    console.log(' AudioEngine: Módulo DSP conectado.');
  }

  public loadTrack(url: string): void {
    const audio = this.getAudioElement();
    audio.src = url;
    audio.load();
  }

  public async play(): Promise<void> {
    const audio = this.getAudioElement();
    await this.resume();
    await audio.play();
  }

  public pause(): void {
    if (this.audioElement) this.audioElement.pause();
  }

  public setMasterVolume(volume: number): void {
    if (this.masterGain && this.context) {
      this.masterGain.gain.setTargetAtTime(volume, this.context.currentTime, 0.1);
    }
  }

  public getAnalyser(): AnalyserNode | null { return this.analyser; }
  public getContext(): AudioContext | null { return this.context; }

  public async suspend(): Promise<void> {
    if (this.context && this.context.state === 'running') await this.context.suspend();
  }

  public async resume(): Promise<void> {
    if (this.context && this.context.state === 'suspended') await this.context.resume();
  }
}

export const audioEngine = new AudioEngine();