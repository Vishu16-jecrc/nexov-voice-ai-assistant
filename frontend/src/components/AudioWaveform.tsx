import React, { useEffect, useRef } from 'react';
import { audioManager } from '../services/audioManager';

interface AudioWaveformProps {
  isAgentSpeaking: boolean;
  isCallConnected: boolean;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({ isAgentSpeaking, isCallConnected }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      animId = requestAnimationFrame(render);
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (!isCallConnected) {
        // Idle flat baseline
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.strokeStyle = '#e4e4e7';
        ctx.lineWidth = 2;
        ctx.stroke();
        return;
      }

      if (isAgentSpeaking) {
        // AI Speaking: Fluid Sine waves in high-contrast black/zinc
        phase += 0.08;
        const waves = [
          { amplitude: 18, color: 'rgba(0, 0, 0, 0.85)', speed: 1 },
          { amplitude: 12, color: 'rgba(39, 39, 42, 0.55)', speed: 1.4 },
          { amplitude: 8, color: 'rgba(113, 113, 122, 0.35)', speed: 1.8 }
        ];

        waves.forEach(wave => {
          ctx.beginPath();
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = wave.color;

          for (let x = 0; x < width; x++) {
            const progress = x / width;
            const envelope = Math.sin(progress * Math.PI);
            const y = height / 2 + Math.sin(progress * 8 + phase * wave.speed) * wave.amplitude * envelope;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        });
      } else {
        // Caller Speaking / Listening: High-contrast monochrome frequency bars
        const freqData = audioManager.getAudioFrequencyData();
        const barCount = 28;
        const barWidth = 4;
        const totalSpacing = (width - (barCount * barWidth)) / (barCount + 1);

        for (let i = 0; i < barCount; i++) {
          const val = freqData[i % freqData.length] || 0;
          const normalized = val / 255;
          const barHeight = Math.max(4, normalized * (height * 0.75));
          const x = totalSpacing + i * (barWidth + totalSpacing);
          const y = (height - barHeight) / 2;

          ctx.fillStyle = '#09090b';
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 2);
          ctx.fill();
        }
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isAgentSpeaking, isCallConnected]);

  return (
    <div className="w-full flex items-center justify-center p-2 bg-zinc-100 rounded-2xl border border-zinc-200 shadow-inner">
      <canvas 
        ref={canvasRef} 
        width={280} 
        height={56} 
        className="w-full h-[56px]"
      />
    </div>
  );
};
