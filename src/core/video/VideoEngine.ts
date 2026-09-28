export class VideoEngine {
  private videoElement: HTMLVideoElement | null = null;

  constructor() {}

  public getVideoElement(): HTMLVideoElement {
    if (!this.videoElement) {
      this.videoElement = document.createElement('video');
      this.videoElement.crossOrigin = 'anonymous';
      this.videoElement.playsInline = true; 
      console.log('🎬 VideoEngine: Elemento de video creado.');
    }
    return this.videoElement;
  }

  public loadVideo(url: string): void {
    const video = this.getVideoElement();
    video.src = url;
    video.load();
    console.log('🎬 VideoEngine: Video cargado.');
  }

  public async play(): Promise<void> {
    const video = this.getVideoElement();
    try {
      await video.play();
      console.log('▶️ VideoEngine: Reproduciendo.');
    } catch (error) {
      console.error(' VideoEngine: Error al reproducir:', error);
    }
  }

  public pause(): void {
    const video = this.getVideoElement();
    video.pause();
    console.log('️ VideoEngine: Pausado.');
  }

  public seek(seconds: number): void {
    const video = this.getVideoElement();
    video.currentTime = seconds;
  }

  public setVolume(volume: number): void {
    const video = this.getVideoElement();
    video.volume = volume;
  }

  public setMuted(muted: boolean): void {
    const video = this.getVideoElement();
    video.muted = muted;
  }

  public setPlaybackRate(rate: number): void {
    const video = this.getVideoElement();
    video.playbackRate = rate;
  }

  public async togglePictureInPicture(): Promise<void> {
    const video = this.getVideoElement();
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (error) {
      console.error('❌ VideoEngine: PiP no soportado:', error);
    }
  }

  
  public async toggleFullscreen(container: HTMLElement): Promise<void> {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await container.requestFullscreen();
      }
    } catch (error) {
      console.error('❌ VideoEngine: Fullscreen no soportado:', error);
    }
  }

 
  public getState() {
    const video = this.getVideoElement();
    return {
      currentTime: video.currentTime,
      duration: video.duration || 0,
      volume: video.volume,
      muted: video.muted,
      playbackRate: video.playbackRate,
      isPlaying: !video.paused,
    };
  }
}

export const videoEngine = new VideoEngine();