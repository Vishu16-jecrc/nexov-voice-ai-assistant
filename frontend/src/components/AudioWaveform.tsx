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
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.stroke();
        return;
      }

      if (isAgentSpeaking) {
        // AI Speaking: Fluid glowing Sine waves
        phase += 0.08;
        const waves = [
          { amplitude: 18, color: 'rgba(13, 148, 136, 0.85)', speed: 1 },
          { amplitude: 12, color: 'rgba(45, 212, 191, 0.65)', speed: 1.4 },
          { amplitude: 8, color: 'rgba(94, 234, 212, 0.45)', speed: 1.8 }
        ];

        waves.forEach(wave => {
          ctx.beginPath();
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = wave.color;

          for (let x = 0; x < width; x++) {
            const progress = x / width;
            // Envelope so wave tapers at edges
            const envelope = Math.sin(progress * Math.PI);
            const y = height / 2 + Math.sin(progress * 8 + phase * wave.speed) * wave.amplitude * envelope;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        });
      } else {
        // Caller Speaking / Listening: Mic frequency spectrum bars
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

          // Gradient from teal to cyan
          const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
          grad.addColorStop(0, '#2dd4bf');
          grad.addColorStop(1, '#0f766e');

          ctx.fillStyle = grad;
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
    <div className="w-full flex items-center justify-center p-2 bg-slate-900/60 rounded-xl border border-slate-800/80 shadow-inner">
      <canvas 
        ref={canvasRef} 
        width={280} 
        height={60} 
        className="w-full h-[60px]"
      />
    </div>
  );
};
