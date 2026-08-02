import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { audioEngineInstance } from '../utils/audioEngine';
import { colors } from '../theme';

interface AudioVisualizerProps {
  isPlaying: boolean;
}

type VisualMode = 'dual-bars' | 'overlay' | 'waveform';

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isPlaying }) => {
  const [visualMode, setVisualMode] = useState<VisualMode>('dual-bars');
  const [barsA, setBarsA] = useState<number[]>(Array(32).fill(10));
  const [barsB, setBarsB] = useState<number[]>(Array(32).fill(10));

  useEffect(() => {
    const interval = setInterval(() => {
      const dataA = audioEngineInstance.getSpectrumData('A');
      const dataB = audioEngineInstance.getSpectrumData('B');

      const barCount = visualMode === 'dual-bars' ? 32 : 64;
      const newBarsA: number[] = [];
      const newBarsB: number[] = [];

      for (let i = 0; i < barCount; i++) {
        const valA = isPlaying ? (dataA[i] || 0) : Math.sin(Date.now() / 300 + i * 0.2) * 15 + 15;
        const valB = isPlaying ? (dataB[i] || 0) : Math.cos(Date.now() / 300 + i * 0.2) * 15 + 15;
        newBarsA.push(valA);
        newBarsB.push(valB);
      }
      setBarsA(newBarsA);
      setBarsB(newBarsB);
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, visualMode]);

  const renderDualBars = () => (
    <View style={styles.dualBars}>
      {/* Channel A (top) */}
      <View style={styles.channelHalf}>
        {barsA.map((val, i) => (
          <View
            key={i}
            style={[
              styles.bar,
              {
                height: Math.max(2, (val / 255) * 60),
                backgroundColor: i > 26 ? colors.rose : i > 20 ? colors.amber : colors.cyan,
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.divider} />
      {/* Channel B (bottom) */}
      <View style={styles.channelHalf}>
        {barsB.map((val, i) => (
          <View
            key={i}
            style={[
              styles.bar,
              {
                height: Math.max(2, (val / 255) * 60),
                backgroundColor: i > 26 ? colors.rose : i > 20 ? colors.amber : colors.purple,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );

  const renderOverlay = () => (
    <View style={styles.overlayBars}>
      {barsA.map((valA, i) => {
        const valB = barsB[i] || 0;
        return (
          <View key={i} style={styles.overlayColumn}>
            <View
              style={[
                styles.overlayBarA,
                { height: Math.max(2, (valA / 255) * 120) },
              ]}
            />
            <View
              style={[
                styles.overlayBarB,
                { height: Math.max(2, (valB / 255) * 120) },
              ]}
            />
          </View>
        );
      })}
    </View>
  );

  const renderWaveform = () => (
    <View style={styles.waveform}>
      <View style={styles.waveformLineA}>
        {barsA.map((val, i) => (
          <View
            key={i}
            style={[
              styles.waveDot,
              {
                height: Math.max(2, (val / 255) * 80),
                backgroundColor: colors.cyan,
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.waveformLineB}>
        {barsB.map((val, i) => (
          <View
            key={i}
            style={[
              styles.waveDot,
              {
                height: Math.max(2, (val / 255) * 80),
                backgroundColor: colors.purple,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="pulse" size={16} color={colors.cyan} />
          <Text style={styles.title}>Analyseur de Spectre Double Signal</Text>
        </View>
        <Text style={styles.legend}>
          <Text style={{ color: colors.cyan }}>Cyan: A</Text> •{' '}
          <Text style={{ color: colors.purple }}>Violet: B</Text>
        </Text>
      </View>

      <View style={styles.modeSelector}>
        {(['dual-bars', 'overlay', 'waveform'] as VisualMode[]).map((mode) => (
          <TouchableOpacity
            key={mode}
            onPress={() => setVisualMode(mode)}
            style={[styles.modeButton, visualMode === mode && styles.modeButtonActive]}
          >
            <Text style={[styles.modeText, visualMode === mode && styles.modeTextActive]}>
              {mode === 'dual-bars' ? 'Dual' : mode === 'overlay' ? 'Overlay' : 'Oscillo'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.visualizerBox}>
        {visualMode === 'dual-bars' && renderDualBars()}
        {visualMode === 'overlay' && renderOverlay()}
        {visualMode === 'waveform' && renderWaveform()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  legend: {
    color: colors.slate400,
    fontSize: 10,
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.bg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    gap: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeText: {
    color: colors.slate400,
    fontSize: 10,
    fontWeight: '600',
  },
  modeTextActive: {
    color: colors.cyan,
  },
  visualizerBox: {
    height: 140,
    backgroundColor: colors.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    padding: 8,
  },
  dualBars: {
    flex: 1,
    gap: 4,
  },
  channelHalf: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  bar: {
    flex: 1,
    borderRadius: 1,
  },
  divider: {
    height: 2,
    backgroundColor: colors.surfaceLight,
  },
  overlayBars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1,
  },
  overlayColumn: {
    flex: 1,
    justifyContent: 'flex-end',
    gap: 1,
  },
  overlayBarA: {
    backgroundColor: 'rgba(34,211,238,0.6)',
    borderRadius: 1,
  },
  overlayBarB: {
    backgroundColor: 'rgba(192,132,252,0.6)',
    borderRadius: 1,
  },
  waveform: {
    flex: 1,
    justifyContent: 'space-around',
  },
  waveformLineA: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 60,
  },
  waveformLineB: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 60,
  },
  waveDot: {
    flex: 1,
    borderRadius: 1,
  },
});