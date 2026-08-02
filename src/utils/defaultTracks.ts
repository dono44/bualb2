import { Track } from '../types';

export const DEFAULT_TRACKS: Track[] = [
  {
    id: 'preset-1',
    title: 'Midnight Chill Beats',
    artist: 'Lofi Dual Session',
    album: 'Bluetooth Horizon',
    duration: 184,
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=80',
    format: 'MP3 • 320 kbps',
    isPreset: true,
  },
  {
    id: 'preset-2',
    title: 'Neon Synthwave Drive',
    artist: 'Cyber Pulse',
    album: 'Dual Output Frequency',
    duration: 215,
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=synthwave-80s-110045.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80',
    format: 'MP3 • 320 kbps',
    isPreset: true,
  },
  {
    id: 'preset-3',
    title: 'Acoustic Sunset Dual Vibes',
    artist: 'Acoustic Waves',
    album: 'Stereo Echoes',
    duration: 162,
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=acoustic-guitars-ambient-10642.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    format: 'MP3 • 256 kbps',
    isPreset: true,
  },
  {
    id: 'preset-4',
    title: 'Deep House Wireless Groove',
    artist: 'Bluetooth Club Collective',
    album: 'Twin Speakers',
    duration: 198,
    url: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f1680d.mp3?filename=electronic-future-beats-117997.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80',
    format: 'MP3 • 320 kbps',
    isPreset: true,
  }
];

/**
 * Creates a synthetic audio buffer for offline testing if remote tracks are blocked or slow
 */
export function createSyntheticAudioBuffer(audioContext: AudioContext, durationSec = 10, title = 'Test Tone'): AudioBuffer {
  const sampleRate = audioContext.sampleRate;
  const numSamples = sampleRate * durationSec;
  const buffer = audioContext.createBuffer(2, numSamples, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  // Generate a nice chord progression (C - Am - F - G)
  const freqs = [261.63, 220.00, 174.61, 196.00];
  
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const chordIndex = Math.floor(t / 2.5) % freqs.length;
    const baseFreq = freqs[chordIndex];
    
    // Smooth envelope
    const env = Math.sin((t % 2.5) / 2.5 * Math.PI) * 0.3;
    
    // Synth sound with fundamental + harmonics
    const wave = Math.sin(2 * Math.PI * baseFreq * t) * 0.5 +
                 Math.sin(2 * Math.PI * baseFreq * 2 * t) * 0.25 +
                 Math.sin(2 * Math.PI * baseFreq * 3 * t) * 0.125;
                 
    // Rhythm pulse
    const beat = (Math.floor(t * 2) % 2 === 0) ? 1.1 : 0.9;
    
    left[i] = wave * env * beat;
    right[i] = wave * env * (2.2 - beat); // subtle stereo panning rhythm
  }

  return buffer;
}
