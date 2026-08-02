import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { ChannelSettings, AudioOutputDevice, AudioEngineCapabilities } from '../types';

export class DualAudioEngine {
  private playerA: ReturnType<typeof createAudioPlayer> | null = null;
  private playerB: ReturnType<typeof createAudioPlayer> | null = null;

  private sourceUrl: string | null = null;

  private channelSettingsA: ChannelSettings = {
    deviceId: 'default',
    volume: 1.0,
    muted: false,
    pan: 0,
    delayMs: 0,
    eqGains: [0, 0, 0, 0, 0],
    bassBoost: false,
    isSolo: false,
  };

  private channelSettingsB: ChannelSettings = {
    deviceId: 'default',
    volume: 1.0,
    muted: false,
    pan: 0,
    delayMs: 0,
    eqGains: [0, 0, 0, 0, 0],
    bassBoost: false,
    isSolo: false,
  };

  public capabilities: AudioEngineCapabilities = {
    setSinkIdSupported: false,
    permissionGranted: true,
    detectedDevices: [],
    activeSinkA: 'default',
    activeSinkB: 'default',
  };

  private onEndedCallback?: () => void;
  private onTimeUpdateCallback?: (currentTime: number) => void;
  private progressInterval: ReturnType<typeof setInterval> | null = null;

  private masterVolume: number = 1.0;
  private crossfader: number = 0; // -1 to 1
  private isPlaying: boolean = false;

  constructor() {
    this.initAudioMode();
  }

  private async initAudioMode() {
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionMode: 'mixWithOthers',
        allowsRecording: false,
      });
    } catch (err) {
      console.warn('Could not set audio mode:', err);
    }
  }

  public async scanDevices(): Promise<AudioOutputDevice[]> {
    // On native platforms, enumerateDevices is not available.
    // Return simulated Bluetooth devices (real route selection is done at OS level).
    const devices: AudioOutputDevice[] = [
      { deviceId: 'default', label: 'Périphérique Système (Haut-parleur)', isBluetooth: false, kind: 'audiooutput' },
      { deviceId: 'bluetooth-a', label: '🎧 Casque Bluetooth A (Simulé)', isBluetooth: true, kind: 'audiooutput' },
      { deviceId: 'bluetooth-b', label: '🔊 Enceinte Bluetooth B (Simulée)', isBluetooth: true, kind: 'audiooutput' },
    ];
    this.capabilities.detectedDevices = devices;
    return devices;
  }

  public async loadAudioFromUrl(url: string): Promise<number> {
    this.sourceUrl = url;

    // Dispose previous players
    this.disposePlayers();

    try {
      // Create two independent players on the same source to simulate dual output routing
      this.playerA = createAudioPlayer(url);
      this.playerA.loop = false;

      this.playerB = createAudioPlayer(url);
      this.playerB.loop = false;

      // Wait a tick for metadata to load
      await new Promise((resolve) => setTimeout(resolve, 500));

      const durationA = this.playerA.duration || 0;
      const durationB = this.playerB.duration || 0;
      const duration = Math.max(durationA, durationB);

      // Attach ended handler to playerA
      this.playerA.addListener('playbackStatusUpdate', (status) => {
        if (status.didJustFinish && this.isPlaying) {
          this.isPlaying = false;
          this.stopProgressTimer();
          if (this.onEndedCallback) this.onEndedCallback();
        }
        if (this.onTimeUpdateCallback) {
          this.onTimeUpdateCallback(status.currentTime);
        }
      });

      this.applyChannelSettings('A');
      this.applyChannelSettings('B');

      return duration;
    } catch (err) {
      console.error('Error loading audio from URL:', err);
      throw err;
    }
  }

  public async play(offsetSeconds?: number) {
    if (!this.playerA || !this.playerB) return;
    try {
      if (offsetSeconds !== undefined && offsetSeconds > 0) {
        await this.playerA.seekTo(offsetSeconds);
        await this.playerB.seekTo(offsetSeconds);
      }
      this.playerA.play();
      this.playerB.play();
      this.isPlaying = true;
      this.startProgressTimer();
    } catch (err) {
      console.error('Play error:', err);
    }
  }

  public async pause() {
    if (!this.playerA || !this.playerB) return;
    try {
      this.playerA.pause();
      this.playerB.pause();
      this.isPlaying = false;
      this.stopProgressTimer();
    } catch (err) {
      console.error('Pause error:', err);
    }
  }

  public async seek(seconds: number) {
    const wasPlaying = this.isPlaying;
    if (wasPlaying) {
      await this.pause();
    }
    if (this.playerA && this.playerB) {
      try {
        await this.playerA.seekTo(seconds);
        await this.playerB.seekTo(seconds);
      } catch (err) {
        console.error('Seek error:', err);
      }
    }
    if (this.onTimeUpdateCallback) this.onTimeUpdateCallback(seconds);
    if (wasPlaying) {
      await this.play();
    }
  }

  public getCurrentTime(): number {
    return this.playerA?.currentTime || 0;
  }

  public getDuration(): number {
    return Math.max(this.playerA?.duration || 0, this.playerB?.duration || 0);
  }

  public setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1.5, vol));
    this.updateGains();
  }

  public setCrossfader(val: number) {
    // -1 (100% A) to 0 (50/50) to 1 (100% B)
    this.crossfader = Math.max(-1, Math.min(1, val));
    this.updateGains();
  }

  public updateChannelSettings(channel: 'A' | 'B', settings: Partial<ChannelSettings>) {
    if (channel === 'A') {
      this.channelSettingsA = { ...this.channelSettingsA, ...settings };
      this.applyChannelSettings('A');
    } else {
      this.channelSettingsB = { ...this.channelSettingsB, ...settings };
      this.applyChannelSettings('B');
    }
  }

  public async setDeviceSink(channel: 'A' | 'B', deviceId: string) {
    if (channel === 'A') {
      this.channelSettingsA.deviceId = deviceId;
      this.capabilities.activeSinkA = deviceId;
    } else {
      this.channelSettingsB.deviceId = deviceId;
      this.capabilities.activeSinkB = deviceId;
    }
  }

  private applyChannelSettings(channel: 'A' | 'B') {
    const player = channel === 'A' ? this.playerA : this.playerB;
    if (!player) return;
    this.updateGains();
  }

  private updateGains() {
    if (!this.playerA || !this.playerB) return;

    let crossFactorA = 1;
    let crossFactorB = 1;
    if (this.crossfader < 0) {
      crossFactorB = 1 + this.crossfader;
    } else if (this.crossfader > 0) {
      crossFactorA = 1 - this.crossfader;
    }

    const anySolo = this.channelSettingsA.isSolo || this.channelSettingsB.isSolo;

    let effMuteA = this.channelSettingsA.muted;
    let effMuteB = this.channelSettingsB.muted;
    if (anySolo) {
      effMuteA = !this.channelSettingsA.isSolo;
      effMuteB = !this.channelSettingsB.isSolo;
    }

    const volA = effMuteA ? 0 : this.channelSettingsA.volume * this.masterVolume * crossFactorA;
    const volB = effMuteB ? 0 : this.channelSettingsB.volume * this.masterVolume * crossFactorB;

    this.playerA.volume = volA;
    this.playerB.volume = volB;
  }

  public getSpectrumData(_channel: 'A' | 'B'): Uint8Array {
    // expo-audio doesn't expose analyser nodes. Return synthetic data for visualizer.
    const data = new Uint8Array(64);
    for (let i = 0; i < 64; i++) {
      data[i] = this.isPlaying ? 30 + Math.abs(Math.sin(Date.now() / 200 + i * 0.4)) * 180 : 10;
    }
    return data;
  }

  public setOnTimeUpdate(cb: (currentTime: number) => void) {
    this.onTimeUpdateCallback = cb;
  }

  public setOnEnded(cb: () => void) {
    this.onEndedCallback = cb;
  }

  private startProgressTimer() {
    this.stopProgressTimer();
    this.progressInterval = setInterval(() => {
      if (this.onTimeUpdateCallback) this.onTimeUpdateCallback(this.getCurrentTime());
    }, 250);
  }

  private stopProgressTimer() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  public getChannelSettings(channel: 'A' | 'B'): ChannelSettings {
    return channel === 'A' ? { ...this.channelSettingsA } : { ...this.channelSettingsB };
  }

  private disposePlayers() {
    if (this.playerA) {
      try { this.playerA.remove(); } catch {}
      this.playerA = null;
    }
    if (this.playerB) {
      try { this.playerB.remove(); } catch {}
      this.playerB = null;
    }
  }

  public destroy() {
    this.disposePlayers();
    this.stopProgressTimer();
  }
}

export const audioEngineInstance = new DualAudioEngine();