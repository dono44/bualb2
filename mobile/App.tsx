import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { Header } from './src/components/Header';
import { PlayerControls } from './src/components/PlayerControls';
import { DualMixer } from './src/components/DualMixer';
import { AudioVisualizer } from './src/components/AudioVisualizer';
import { Playlist } from './src/components/Playlist';
import { EqualizerModal } from './src/components/EqualizerModal';
import { BluetoothGuideModal } from './src/components/BluetoothGuideModal';
import { AndroidModeCard } from './src/components/AndroidModeCard';

import {
  Track,
  DualMixerState,
  PlaybackState,
  AudioEngineCapabilities,
  ChannelSettings,
} from './src/types';
import { DEFAULT_TRACKS } from './src/utils/defaultTracks';
import { audioEngineInstance } from './src/utils/audioEngine';
import { triggerHaptic } from './src/utils/haptics';
import { parseAudioFilename } from './src/utils/fileMetadata';
import { colors } from './src/theme';

const AUDIO_EXTENSIONS = /\.(mp3|flac|wav|m4a|aac|ogg|wma|opus|mp4)$/i;

export default function App() {
  const [tracks, setTracks] = useState<Track[]>(DEFAULT_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);

  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    currentTrackIndex: 0,
    shuffle: false,
    repeat: 'off',
    isLoading: false,
    error: null,
  });

  const [mixerState, setMixerState] = useState<DualMixerState>({
    masterVolume: 1.0,
    crossfader: 0,
    monoSplitMode: false,
    channelA: audioEngineInstance.getChannelSettings('A'),
    channelB: audioEngineInstance.getChannelSettings('B'),
  });

  const [capabilities, setCapabilities] = useState<AudioEngineCapabilities>({
    ...audioEngineInstance.capabilities,
    detectedDevices: audioEngineInstance.capabilities.detectedDevices.length > 0 ? audioEngineInstance.capabilities.detectedDevices : [],
  });

  const [activeEQModal, setActiveEQModal] = useState<'A' | 'B' | null>(null);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const currentTrack = tracks[currentTrackIndex];

  // Scan Bluetooth/Audio Devices
  const handleScanDevices = useCallback(async () => {
    setIsScanning(true);
    try {
      const devices = await audioEngineInstance.scanDevices();
      setCapabilities({
        ...audioEngineInstance.capabilities,
        detectedDevices: devices,
      });
    } catch (err) {
      console.error('Scan failed:', err);
    } finally {
      setIsScanning(false);
    }
  }, []);

  // Initial scanning on load
  useEffect(() => {
    handleScanDevices();
  }, [handleScanDevices]);

  // Load track into audio engine
  const loadTrack = useCallback(async (track: Track, autoPlay = false) => {
    setPlaybackState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const duration = await audioEngineInstance.loadAudioFromUrl(track.url);
      setPlaybackState((prev) => ({
        ...prev,
        duration,
        currentTime: 0,
        isLoading: false,
      }));

      if (autoPlay) {
        await audioEngineInstance.play(0);
        setPlaybackState((prev) => ({ ...prev, isPlaying: true }));
      }
    } catch (err) {
      console.error('Track loading error:', err);
      setPlaybackState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Impossible de charger le fichier audio.',
      }));
    }
  }, []);

  // Setup event listeners for audio engine
  useEffect(() => {
    audioEngineInstance.setOnTimeUpdate((time) => {
      setPlaybackState((prev) => ({ ...prev, currentTime: time }));
    });

    audioEngineInstance.setOnEnded(() => {
      setPlaybackState((prev) => {
        if (prev.repeat === 'one') {
          audioEngineInstance.play(0);
          return { ...prev, currentTime: 0, isPlaying: true };
        }
        return { ...prev, isPlaying: false, currentTime: 0 };
      });

      // Advance to next if repeat all or normal
      setCurrentTrackIndex((prevIndex) => {
        const nextIdx = (prevIndex + 1) % tracks.length;
        if (nextIdx !== 0 || playbackState.repeat === 'all') {
          setTimeout(() => {
            loadTrack(tracks[nextIdx], true);
          }, 100);
          return nextIdx;
        }
        return prevIndex;
      });
    });

    return () => {
      audioEngineInstance.setOnTimeUpdate(() => {});
      audioEngineInstance.setOnEnded(() => {});
    };
  }, [tracks, playbackState.repeat, loadTrack]);

  // Initial load of first track
  useEffect(() => {
    if (tracks.length > 0) {
      loadTrack(tracks[0], false);
    }
  }, []);

  // Transport Controls with Haptic Feedback
  const handlePlay = () => {
    if (!currentTrack) return;
    triggerHaptic('light');
    audioEngineInstance.play();
    setPlaybackState((prev) => ({ ...prev, isPlaying: true }));
  };

  const handlePause = () => {
    triggerHaptic('light');
    audioEngineInstance.pause();
    setPlaybackState((prev) => ({ ...prev, isPlaying: false }));
  };

  const handleStop = () => {
    triggerHaptic('medium');
    audioEngineInstance.pause();
    audioEngineInstance.seek(0);
    setPlaybackState((prev) => ({ ...prev, isPlaying: false, currentTime: 0 }));
  };

  const handlePrev = () => {
    triggerHaptic('light');
    if (tracks.length === 0) return;
    let prevIdx = currentTrackIndex - 1;
    if (prevIdx < 0) prevIdx = tracks.length - 1;
    setCurrentTrackIndex(prevIdx);
    loadTrack(tracks[prevIdx], playbackState.isPlaying);
  };

  const handleNext = () => {
    triggerHaptic('light');
    if (tracks.length === 0) return;
    let nextIdx = currentTrackIndex + 1;
    if (playbackState.shuffle) {
      nextIdx = Math.floor(Math.random() * tracks.length);
    } else if (nextIdx >= tracks.length) {
      nextIdx = 0;
    }
    setCurrentTrackIndex(nextIdx);
    loadTrack(tracks[nextIdx], playbackState.isPlaying);
  };

  const handleSeek = (seconds: number) => {
    triggerHaptic('light');
    audioEngineInstance.seek(seconds);
    setPlaybackState((prev) => ({ ...prev, currentTime: seconds }));
  };

  const handleApplyLatencyPreset = (channel: 'A' | 'B', ms: number) => {
    audioEngineInstance.updateChannelSettings(channel, { delayMs: ms });
    setMixerState((prev) => ({
      ...prev,
      channelA: audioEngineInstance.getChannelSettings('A'),
      channelB: audioEngineInstance.getChannelSettings('B'),
    }));
  };

  const handleToggleShuffle = () => {
    setPlaybackState((prev) => ({ ...prev, shuffle: !prev.shuffle }));
  };

  const handleChangeRepeat = () => {
    setPlaybackState((prev) => {
      const nextMode = prev.repeat === 'off' ? 'all' : prev.repeat === 'all' ? 'one' : 'off';
      return { ...prev, repeat: nextMode };
    });
  };

  // Mixer Updates
  const handleUpdateChannel = (channel: 'A' | 'B', settings: Partial<ChannelSettings>) => {
    audioEngineInstance.updateChannelSettings(channel, settings);
    setMixerState((prev) => ({
      ...prev,
      channelA: audioEngineInstance.getChannelSettings('A'),
      channelB: audioEngineInstance.getChannelSettings('B'),
    }));
  };

  const handleSetSinkDevice = async (channel: 'A' | 'B', deviceId: string) => {
    await audioEngineInstance.setDeviceSink(channel, deviceId);
    setCapabilities({
      ...audioEngineInstance.capabilities,
      activeSinkA: audioEngineInstance.capabilities.activeSinkA,
      activeSinkB: audioEngineInstance.capabilities.activeSinkB,
    });
    setMixerState((prev) => ({
      ...prev,
      channelA: audioEngineInstance.getChannelSettings('A'),
      channelB: audioEngineInstance.getChannelSettings('B'),
    }));
  };

  const handleUpdateMasterVolume = (vol: number) => {
    audioEngineInstance.setMasterVolume(vol);
    setMixerState((prev) => ({ ...prev, masterVolume: vol }));
  };

  const handleUpdateCrossfader = (val: number) => {
    audioEngineInstance.setCrossfader(val);
    setMixerState((prev) => ({ ...prev, crossfader: val }));
  };

  const handleToggleMonoSplit = () => {
    setMixerState((prev) => {
      const nextSplit = !prev.monoSplitMode;
      if (nextSplit) {
        audioEngineInstance.updateChannelSettings('A', { pan: -1 });
        audioEngineInstance.updateChannelSettings('B', { pan: 1 });
      } else {
        audioEngineInstance.updateChannelSettings('A', { pan: 0 });
        audioEngineInstance.updateChannelSettings('B', { pan: 0 });
      }
      return {
        ...prev,
        monoSplitMode: nextSplit,
        channelA: audioEngineInstance.getChannelSettings('A'),
        channelB: audioEngineInstance.getChannelSettings('B'),
      };
    });
  };

  // Playlist Actions
  const handleSelectTrack = (track: Track) => {
    const idx = tracks.findIndex((t) => t.id === track.id);
    if (idx !== -1) {
      setCurrentTrackIndex(idx);
      loadTrack(track, true);
    }
  };

  const handleAddFiles = async (files: { uri: string; name: string; size?: number }[]) => {
    triggerHaptic('medium');

    const audioFiles = files.filter(
      (f) =>
        f.name.match(AUDIO_EXTENSIONS) ||
        f.name.toLowerCase().endsWith('.mp3') ||
        f.name.toLowerCase().endsWith('.flac') ||
        f.name.toLowerCase().endsWith('.wav') ||
        f.name.toLowerCase().endsWith('.m4a') ||
        f.name.toLowerCase().endsWith('.aac') ||
        f.name.toLowerCase().endsWith('.ogg') ||
        f.name.toLowerCase().endsWith('.opus')
    );

    if (audioFiles.length === 0) {
      alert('⚠️ Aucun fichier audio détecté. Sélectionnez des fichiers MP3, FLAC, M4A ou WAV.');
      return;
    }

    const newTracks: Track[] = audioFiles.map((file, i) => {
      const name = file.name || `audio-${i}.mp3`;
      const { title, artist, album } = parseAudioFilename(name);
      const ext = name.split('.').pop()?.toUpperCase() || 'AUDIO';
      return {
        id: `phone-file-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
        title,
        artist,
        album,
        duration: 0,
        url: file.uri,
        format: ext,
        isPreset: false,
      };
    });

    setTracks((prev) => [...prev, ...newTracks]);
    triggerHaptic('double');

    if (!playbackState.isPlaying && tracks.length === 0) {
      setCurrentTrackIndex(0);
      loadTrack(newTracks[0], true);
    }
  };

  const handleAddStreamUrl = (title: string, artist: string, url: string) => {
    const newStreamTrack: Track = {
      id: `stream-${Date.now()}`,
      title,
      artist,
      album: 'Flux Web / Radio Stream',
      duration: 9999,
      url,
      format: 'STREAM HTTP',
      isPreset: false,
    };

    setTracks((prev) => [newStreamTrack, ...prev]);
    setCurrentTrackIndex(0);
    loadTrack(newStreamTrack, true);
  };

  const handleRemoveTrack = (trackId: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <View style={styles.container}>
        <Header
          capabilities={capabilities}
          onScanDevices={handleScanDevices}
          onOpenGuide={() => setShowGuideModal(true)}
          isScanning={isScanning}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <AndroidModeCard
            onApplyLatencyPreset={handleApplyLatencyPreset}
            onOpenAndroidGuide={() => setShowGuideModal(true)}
          />

          <PlayerControls
            currentTrack={currentTrack}
            playbackState={playbackState}
            onPlay={handlePlay}
            onPause={handlePause}
            onStop={handleStop}
            onPrev={handlePrev}
            onNext={handleNext}
            onSeek={handleSeek}
            onToggleShuffle={handleToggleShuffle}
            onChangeRepeat={handleChangeRepeat}
          />

          <DualMixer
            mixerState={mixerState}
            devices={capabilities.detectedDevices}
            onUpdateChannel={handleUpdateChannel}
            onSetSinkDevice={handleSetSinkDevice}
            onUpdateMasterVolume={handleUpdateMasterVolume}
            onUpdateCrossfader={handleUpdateCrossfader}
            onToggleMonoSplit={handleToggleMonoSplit}
            onOpenEQModal={(ch) => setActiveEQModal(ch)}
            isPlaying={playbackState.isPlaying}
          />

          <View style={styles.bottomGrid}>
            <View style={styles.visualizerColumn}>
              <AudioVisualizer isPlaying={playbackState.isPlaying} />
            </View>
            <View style={styles.playlistColumn}>
              <Playlist
                tracks={tracks}
                currentTrackId={currentTrack?.id}
                onSelectTrack={handleSelectTrack}
                onAddFiles={handleAddFiles}
                onAddStreamUrl={handleAddStreamUrl}
                onRemoveTrack={handleRemoveTrack}
              />
            </View>
          </View>

          <Text style={styles.footer}>DualAudio Bluetooth Studio • Multi-diffusion audio avec compensation de latence</Text>
        </ScrollView>
      </View>

      {activeEQModal && (
        <EqualizerModal
          channel={activeEQModal}
          settings={
            activeEQModal === 'A' ? mixerState.channelA : mixerState.channelB
          }
          onUpdate={(settings) => handleUpdateChannel(activeEQModal, settings)}
          onClose={() => setActiveEQModal(null)}
        />
      )}

      {showGuideModal && (
        <BluetoothGuideModal
          onClose={() => setShowGuideModal(false)}
          onScanDevices={handleScanDevices}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  bottomGrid: {
    flexDirection: 'column',
    gap: 16,
  },
  visualizerColumn: {
    width: '100%',
  },
  playlistColumn: {
    width: '100%',
  },
  footer: {
    color: colors.slate500,
    fontSize: 10,
    textAlign: 'center',
    paddingVertical: 8,
  },
});