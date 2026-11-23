import { TranscriptMessage, BookingConfirmation } from '../types';
import { audioManager } from './audioManager';

export type VoiceClientEvent = 
  | { type: 'state_change'; state: 'idle' | 'calling' | 'connected' | 'ended' }
  | { type: 'agent_transcript'; message: TranscriptMessage }
  | { type: 'user_transcript'; message: TranscriptMessage }
  | { type: 'booking_confirmed'; data: BookingConfirmation }
  | { type: 'appointment_cancelled'; data: { appointment_id: number; doctor_name: string; phone_number: string } }
  | { type: 'tool_activity'; tool: string; message: string }
  | { type: 'agent_speaking'; isSpeaking: boolean };

export class VoiceClient {
  private ws: WebSocket | null = null;
  private listeners: ((event: VoiceClientEvent) => void)[] = [];
  private mediaRecorder: MediaRecorder | null = null;
  private audioQueue: string[] = [];
  private isPlayingAudio: boolean = false;
  private currentAudioElement: HTMLAudioElement | null = null;

  public subscribe(cb: (event: VoiceClientEvent) => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private emit(event: VoiceClientEvent) {
    this.listeners.forEach(cb => cb(event));
  }

  public async startCall() {
    this.emit({ type: 'state_change', state: 'calling' });
    audioManager.startRingtone();

    // Protocol auto-detect: ws:// or wss://
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/call`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = async () => {
        // Stop ringing after connecting
        window.setTimeout(async () => {
          audioManager.stopRingtone();
          this.emit({ type: 'state_change', state: 'connected' });

          // Request mic access
          const stream = await audioManager.startMicrophone();
          if (stream) {
            this.startAudioStreaming(stream);
          }

          // Trigger agent initial greeting
          this.sendMessage({ type: 'start_call' });
        }, 1800); // 1.8s realistic ringing simulation
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleServerMessage(data);
        } catch (e) {
          console.error("Error parsing WS message:", e);
        }
      };

      this.ws.onclose = () => {
        this.endCall(false);
      };

      this.ws.onerror = (err) => {
        console.warn("WebSocket error:", err);
      };

    } catch (err) {
      console.error("Failed to initialize WebSocket:", err);
      audioManager.stopRingtone();
      this.emit({ type: 'state_change', state: 'ended' });
    }
  }

  private startAudioStreaming(stream: MediaStream) {
    try {
      // Use standard MediaRecorder to capture chunks
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      this.mediaRecorder = new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 16000 });

      this.mediaRecorder.ondataavailable = async (e) => {
        if (e.data.size > 0 && this.ws && this.ws.readyState === WebSocket.OPEN) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            this.sendMessage({
              type: 'audio_chunk',
              audio_base64: base64
            });
          };
          reader.readAsDataURL(e.data);
        }
      };

      this.mediaRecorder.start(250); // send slice every 250ms for low latency
    } catch (e) {
      console.warn("MediaRecorder setup error:", e);
    }
  }

  private handleServerMessage(data: any) {
    if (data.type === 'agent_transcript') {
      this.emit({
        type: 'agent_transcript',
        message: {
          id: Math.random().toString(),
          role: 'agent',
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      });
    } else if (data.type === 'user_transcript') {
      this.emit({
        type: 'user_transcript',
        message: {
          id: Math.random().toString(),
          role: 'user',
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      });
    } else if (data.type === 'agent_audio') {
      if (data.audio_base64) {
        this.enqueueAudio(data.audio_base64, data.mime || 'audio/mp3');
      }
    } else if (data.type === 'booking_confirmed') {
      this.emit({
        type: 'booking_confirmed',
        data: data.data
      });
    } else if (data.type === 'appointment_cancelled') {
      this.emit({
        type: 'appointment_cancelled',
        data: data.data
      });
    } else if (data.type === 'tool_activity') {
      this.emit({
        type: 'tool_activity',
        tool: data.tool,
        message: data.message
      });
    } else if (data.type === 'call_ended') {
      this.endCall(false);
    }
  }

  private enqueueAudio(base64: string, mime: string) {
    this.audioQueue.push(`data:${mime};base64,${base64}`);
    if (!this.isPlayingAudio) {
      this.playNextAudio();
    }
  }

  private playNextAudio() {
    if (this.audioQueue.length === 0) {
      this.isPlayingAudio = false;
      this.emit({ type: 'agent_speaking', isSpeaking: false });
      return;
    }

    this.isPlayingAudio = true;
    this.emit({ type: 'agent_speaking', isSpeaking: true });

    const src = this.audioQueue.shift()!;
    this.currentAudioElement = new Audio(src);

    this.currentAudioElement.onended = () => {
      this.playNextAudio();
    };

    this.currentAudioElement.onerror = () => {
      this.playNextAudio();
    };

    this.currentAudioElement.play().catch(e => {
      console.warn("Audio playback interrupted:", e);
      this.playNextAudio();
    });
  }

  public sendTextMessage(text: string) {
    if (!text.trim()) return;
    this.emit({
      type: 'user_transcript',
      message: {
        id: Math.random().toString(),
        role: 'user',
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    });

    this.sendMessage({
      type: 'text_input',
      text: text.trim()
    });
  }

  public sendMessage(msg: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  public endCall(sendEndMsg = true) {
    if (sendEndMsg && this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ type: 'end_call' }));
      } catch {}
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {}
      this.mediaRecorder = null;
    }

    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement = null;
    }
    this.audioQueue = [];
    this.isPlayingAudio = false;

    audioManager.stopRingtone();
    audioManager.playEndCallTone();
    audioManager.stopMicrophone();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.emit({ type: 'state_change', state: 'ended' });
  }
}

export const voiceClient = new VoiceClient();
