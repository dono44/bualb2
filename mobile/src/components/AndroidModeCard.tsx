import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { triggerHaptic, isAndroidDevice } from '../utils/haptics';
import { colors } from '../theme';

interface AndroidModeCardProps {
  onApplyLatencyPreset: (channel: 'A' | 'B', ms: number) => void;
  onOpenAndroidGuide: () => void;
}

export const AndroidModeCard: React.FC<AndroidModeCardProps> = ({
  onApplyLatencyPreset,
  onOpenAndroidGuide,
}) => {
  const [selectedLatencyPreset, setSelectedLatencyPreset] = useState<string>('aac');

  const handleSelectPreset = (presetKey: string, delayA: number, delayB: number) => {
    setSelectedLatencyPreset(presetKey);
    triggerHaptic('light');
    onApplyLatencyPreset('A', delayA);
    onApplyLatencyPreset('B', delayB);
  };

  const presets = [
    { key: 'direct', label: 'Direct (0 ms)', delayA: 0, delayB: 0 },
    { key: 'sbc', label: 'SBC (+120 ms B)', delayA: 0, delayB: 120 },
    { key: 'aac', label: 'AAC (+80 ms B)', delayA: 0, delayB: 80 },
    { key: 'aptx', label: 'aptX (+35 ms B)', delayA: 0, delayB: 35 },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.badges}>
          <View style={styles.androidBadge}>
            <Ionicons name="phone-portrait" size={14} color={colors.emerald} />
            <Text style={styles.androidBadgeText}>Mode Spécial Android</Text>
          </View>
          {isAndroidDevice() && (
            <View style={styles.deviceBadge}>
              <Text style={styles.deviceBadgeText}>📱 Appareil Android Détecté</Text>
            </View>
          )}
        </View>

        <Text style={styles.title}>Double Diffusion Audio pour Android & Samsung Galaxy</Text>
        <Text style={styles.subtitle}>
          Diffusez votre musique sur deux enceintes ou écouteurs Bluetooth en même temps.
        </Text>

        <View style={styles.presetsSection}>
          <Text style={styles.presetsLabel}>Préréglages Latence Android:</Text>
          <View style={styles.presetsRow}>
            {presets.map((preset) => (
              <TouchableOpacity
                key={preset.key}
                onPress={() => handleSelectPreset(preset.key, preset.delayA, preset.delayB)}
                style={[
                  styles.presetButton,
                  selectedLatencyPreset === preset.key && styles.presetButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.presetText,
                    selectedLatencyPreset === preset.key && styles.presetTextActive,
                  ]}
                >
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => {
          triggerHaptic('light');
          onOpenAndroidGuide();
        }}
        style={styles.guideButton}
      >
        <Ionicons name="help-circle" size={16} color={colors.emerald} />
        <Text style={styles.guideButtonText}>Guide Samsung & Android</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(6,78,59,0.2)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.3)',
    padding: 16,
    gap: 12,
  },
  content: {
    gap: 8,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  androidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.emeraldDim,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.4)',
  },
  androidBadgeText: {
    color: colors.emerald,
    fontSize: 10,
    fontWeight: 'bold',
  },
  deviceBadge: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  deviceBadgeText: {
    color: colors.slate300,
    fontSize: 10,
  },
  title: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  subtitle: {
    color: colors.slate300,
    fontSize: 11,
    lineHeight: 16,
  },
  presetsSection: {
    gap: 6,
  },
  presetsLabel: {
    color: colors.slate400,
    fontSize: 10,
    fontWeight: '600',
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  presetButton: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetButtonActive: {
    backgroundColor: colors.emeraldDim,
    borderColor: 'rgba(52,211,153,0.5)',
  },
  presetText: {
    color: colors.slate300,
    fontSize: 10,
  },
  presetTextActive: {
    color: colors.emerald,
  },
  guideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.4)',
  },
  guideButtonText: {
    color: colors.emerald,
    fontSize: 11,
    fontWeight: '600',
  },
});