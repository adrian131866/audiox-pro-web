// src/components/visualizers/SpectrumAnalyzer.tsx
import { useEffect, useRef } from 'react';
import { audioEngine } from '../../core/audio/AudioEngine';

export const SpectrumAnalyzer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false }); // Optimización: desactivar transparencia
    if (!ctx) return;

    const analyser = audioEngine.getAnalyser();
    if (!analyser) return;

    // Configuración inicial del canvas (solo una vez)
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Preparar el array para recibir los datos de frecuencia
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Variables para limitación de FPS
    let lastTime = 0;
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;

    // Función de dibujo recursiva (bucle de renderizado)
    const draw = (currentTime: number) => {
      animationRef.current = requestAnimationFrame(draw);

      // Optimización: Limitar a 60 FPS para evitar consumo innecesario de CPU
      const deltaTime = currentTime - lastTime;
      if (deltaTime < frameInterval) return;
      lastTime = currentTime;

      // Obtener datos de frecuencia en tiempo real (0 a 255)
      analyser.getByteFrequencyData(dataArray);

      const width = rect.width;
      const height = rect.height;

      // Limpiar el canvas con fondo sólido (más rápido que clearRect)
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, width, height);

      // Calcular ancho de cada barra
      const barWidth = (width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      // Dibujar cada barra del espectro
      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * height;

        // Crear un gradiente profesional (Azul -> Cian -> Morado)
        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, '#6366f1'); // Índigo (color principal)
        gradient.addColorStop(0.5, '#818cf8'); // Índigo claro
        gradient.addColorStop(1, '#c084fc'); // Púrpura

        ctx.fillStyle = gradient;
        
        // Dibujar la barra con un pequeño espacio entre ellas
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    // Iniciar el bucle de animación
    draw(0);

    // Manejar redimensionamiento de ventana
    const handleResize = () => {
      const newRect = canvas.getBoundingClientRect();
      canvas.width = newRect.width * dpr;
      canvas.height = newRect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', handleResize);

    // Limpieza al desmontar el componente (evita fugas de memoria)
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className="w-full h-48 bg-ax-bg rounded-xl border border-ax-border overflow-hidden shadow-inner">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block"
      />
    </div>
  );
};