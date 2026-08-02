import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { ChannelSettings } from '../types';
import { colors } from '../theme';

interface EqualizerModalProps {
  channel: 'A' | 'B';
  settings: ChannelSettings;
  onUpdate: (settings: Partial<ChannelSettings>) => void;
  onClose: () => void;
}

const EQ_PRESETS: { name: string; gains: number[] }[] = [
  { name: 'Plat', gains: [0, 0, 0, 0, 0] },
  { name: 'Bass Boost', gains: [8, 5, 1, 0, 0] },
  { name: 'Electronic', gains: [6, 3, -1, 4, 5] },
  { name: 'Rock / Pop', gains: [4, -2, 2, 5, 4] },
  { name: 'Voix', gains: [-3, 2, 5, 3, -1] },
  { name: 'Acoustic', gains: [3, 2, 1, 3, 4] },
];

const FREQ_LABELS = ['60 Hz', '230 Hz', '910 Hz', '4 kHz', '14 kHz'];
const BAND_NAMES = ['Sub Bass', 'Bass', 'Mids', 'Highs', 'Treble'];

export const EqualizerModal: React.FC<EqualizerModalProps> = ({
  channel,
  settings,
  onUpdate,
  onClose,
}) => {
  const isA = channel === 'A';
  const accent = isA ? colors.cyan : colors.purple;
  const accentDim = isA ? colors.cyanDim : colors.purpleDim;

  const handleGainChange = (index: number, val: number) => {
    const newGains = [...settings.eqGains];
    newGains[index] = val;
    onUpdate({ eqGains: newGains });
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={[styles.iconBox, { backgroundColor: accentDim }]}>
                <Ionicons name="options" size={20} color={accent} />
              </View>
              <View>
                <View style={styles.titleRowInner}>
                  <Text style={styles.title}>Égaliseur 5 Bandes</Text>
                  <Text style={[styles.channelBadge, { color: accent, backgroundColor: accentDim }]}>
                    Périphérique {channel}
                  </Text>
                </View>
                <Text style={styles.subtitle}>
                  Ajustez les fréquences pour la sortie {channel}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={20} color={colors.slate400} />
            </TouchableOpacity>
          </View>

          {/* Presets */}
          <View style={styles.presetsSection}>
            <Text style={styles.sectionLabel}>Préréglages d'Égalisation</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsRow}>
              {EQ_PRESETS.map((preset) => (
                <TouchableOpacity
                  key={preset.name}
                  onPress={() => onUpdate({ eqGains: preset.gains })}
                  style={styles.presetButton}
                >
                  <Text style={styles.presetText}>{preset.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* 5 Band Faders */}
          <View style={styles.fadersContainer}>
            {settings.eqGains.map((gain, index) => (
              <View key={index} style={styles.faderColumn}>
                <Text style={[styles.gainValue, { color: accent }]}>
                  {gain > 0 ? `+${gain}` : gain} dB
                </Text>
                <Slider
                  style={styles.verticalSlider}
                  minimumValue={-12}
                  maximumValue={12}
                  step={0.5}
                  value={gain}
                  onValueChange={(v) => handleGainChange(index, v)}
                  minimumTrackTintColor={accent}
                  maximumTrackTintColor={colors.surfaceLight}
                  thumbTintColor={colors.white}
                />
                <Text style={styles.freqLabel}>{FREQ_LABELS[index]}</Text>
                <Text style={styles.bandLabel}>{BAND_NAMES[index]}</Text>
              </View>
            ))}
          </View>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={() => onUpdate({ bassBoost: !settings.bassBoost })}
              style={[
                styles.bassBoostButton,
                settings.bassBoost && { backgroundColor: accentDim, borderColor: accent },
              ]}
            >
              <Ionicons name="flash" size={14} color={settings.bassBoost ? accent : colors.slate400} />
              <Text style={[styles.bassBoostText, settings.bassBoost && { color: accent }]}>
                Bass Boost (+6dB)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onUpdate({ eqGains: [0, 0, 0, 0, 0], bassBoost: false })}
              style={styles.resetButton}
            >
              <Ionicons name="refresh" size={14} color={colors.slate400} />
              <Text style={styles.resetText}>Réinitialiser</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2,6,23,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  container: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  channelBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  subtitle: {
    color: colors.slate400,
    fontSize: 11,
    marginTop: 2,
  },
  presetsSection: {
    gap: 8,
  },
  sectionLabel: {
    color: colors.slate300,
    fontSize: 11,
    fontWeight: '600',
  },
  presetsRow: {
    gap: 8,
  },
  presetButton: {
    backgroundColor: colors.bg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  presetText: {
    color: colors.slate300,
    fontSize: 11,
  },
  fadersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(2,6,23,0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 8,
  },
  faderColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  gainValue: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  verticalSlider: {
    height: 160,
    transform: [{ rotate: '-90deg' }],
    width: 120,
  },
  freqLabel: {
    color: colors.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  bandLabel: {
    color: colors.slate500,
    fontSize: 9,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  bassBoostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bassBoostText: {
    color: colors.slate400,
    fontSize: 11,
    fontWeight: '600',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  resetText: {
    color: colors.slate400,
    fontSize: 11,
  },
});