/**
 * AudioManager handles:
 * - Synthesizing realistic telephony ringing & hangup tones via Web Audio API.
 * - Browser microphone capture, audio processing, and live spectrum analysis for waveform visualization.
 */

class AudioManager {
  private audioCtx: AudioContext | null = null;
  private ringInterval: number | null = null;

  private mediaStream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private isMuted: boolean = false;

  private initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // --- Telephony Ringing Sound (US Standard: 440Hz + 480Hz, 2s tone, 3s silence) ---
  public startRingtone() {
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const playToneBurst = () => {
        if (!this.audioCtx) return;
        const now = this.audioCtx.currentTime;

        const osc1 = this.audioCtx.createOscillator();
        const osc2 = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(440, now); // 440 Hz

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(480, now); // 480 Hz

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.1);
        gain.gain.setValueAtTime(0.08, now + 1.8);
        gain.gain.linearRampToValueAtTime(0, now + 2.0);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 2.0);
        osc2.stop(now + 2.0);
      };

      // Play first burst immediately
      playToneBurst();
      // Repeat every 4 seconds
      this.ringInterval = window.setInterval(playToneBurst, 4000);
    } catch (e) {
      console.warn("Could not play ringtone:", e);
    }
  }

  public stopRingtone() {
    if (this.ringInterval) {
      clearInterval(this.ringInterval);
      this.ringInterval = null;
    }
  }

  // --- Call End Tone (480Hz + 620Hz, three quick beeps) ---
  public playEndCallTone() {
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      [0, 0.4, 0.8].forEach((offset) => {
        if (!this.audioCtx) return;
        const t = now + offset;
        const osc1 = this.audioCtx.createOscillator();
        const osc2 = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(480, t);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(620, t);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.08, t + 0.05);
        gain.gain.setValueAtTime(0.08, t + 0.25);
        gain.gain.linearRampToValueAtTime(0, t + 0.3);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc1.start(t);
        osc2.start(t);
        osc1.stop(t + 0.3);
        osc2.stop(t + 0.3);
      });
    } catch (e) {
      console.warn("Could not play end tone:", e);
    }
  }

  // --- Microphone Capture & Waveform Analyser ---
  public async startMicrophone(): Promise<MediaStream | null> {
    try {
      this.initContext();
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      });

      if (this.audioCtx) {
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 64;
        this.analyser.smoothingTimeConstant = 0.8;

        this.micSource = this.audioCtx.createMediaStreamSource(this.mediaStream);
        this.micSource.connect(this.analyser);
      }
      this.isMuted = false;
      return this.mediaStream;
    } catch (err) {
      console.warn("Microphone access permission error:", err);
      return null;
    }
  }

  public getAudioFrequencyData(): Uint8Array {
    if (!this.analyser) {
      return new Uint8Array(32);
    }
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  public toggleMute(): boolean {
    if (this.mediaStream) {
      this.isMuted = !this.isMuted;
      this.mediaStream.getAudioTracks().forEach(track => {
        track.enabled = !this.isMuted;
      });
    }
    return this.isMuted;
  }

  public stopMicrophone() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.micSource) {
      try {
        this.micSource.disconnect();
      } catch {}
      this.micSource = null;
    }
    this.analyser = null;
    this.isMuted = false;
  }

  public cleanup() {
    this.stopRingtone();
    this.stopMicrophone();
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      try {
        this.audioCtx.close();
      } catch {}
      this.audioCtx = null;
    }
  }
}

export const audioManager = new AudioManager();
