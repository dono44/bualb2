import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { DualMixerState, AudioOutputDevice, ChannelSettings } from '../types';
import { colors } from '../theme';

interface DualMixerProps {
  mixerState: DualMixerState;
  devices: AudioOutputDevice[];
  onUpdateChannel: (channel: 'A' | 'B', settings: Partial<ChannelSettings>) => void;
  onSetSinkDevice: (channel: 'A' | 'B', deviceId: string) => void;
  onUpdateMasterVolume: (volume: number) => void;
  onUpdateCrossfader: (val: number) => void;
  onToggleMonoSplit: () => void;
  onOpenEQModal: (channel: 'A' | 'B') => void;
  isPlaying: boolean;
}

const getDbValue = (vol: number) => {
  if (vol <= 0) return '-∞ dB';
  const db = 20 * Math.log10(vol);
  return `${db >= 0 ? '+' : ''}${db.toFixed(1)} dB`;
};

const ChannelCard: React.FC<{
  channel: 'A' | 'B';
  settings: ChannelSettings;
  devices: AudioOutputDevice[];
  isPlaying: boolean;
  onUpdate: (settings: Partial<ChannelSettings>) => void;
  onSetSink: (deviceId: string) => void;
  onOpenEQ: () => void;
}> = ({ channel, settings, devices, isPlaying, onUpdate, onSetSink, onOpenEQ }) => {
  const isA = channel === 'A';
  const accent = isA ? colors.cyan : colors.purple;
  const accentDim = isA ? colors.cyanDim : colors.purpleDim;

  return (
    <View style={[styles.channelCard, settings.isSolo && { borderColor: accent, borderWidth: 2 }]}>
      {/* Header */}
      <View style={styles.channelHeader}>
        <View style={styles.channelTitleRow}>
          <View style={[styles.channelIcon, { backgroundColor: accentDim, borderColor: accent }]}>
            <Ionicons name="bluetooth" size={16} color={accent} />
          </View>
          <View>
            <Text style={[styles.channelBadge, { color: accent, backgroundColor: accentDim }]}>
              SORTIE {channel}
            </Text>
            <Text style={styles.channelSubtitle}>Périphérique {isA ? '1' : '2'}</Text>
          </View>
        </View>

        <View style={styles.channelActions}>
          <TouchableOpacity
            onPress={() => onUpdate({ isSolo: !settings.isSolo })}
            style={[styles.soloButton, settings.isSolo && { backgroundColor: accent, borderColor: accent }]}
          >
            <Text style={[styles.soloText, settings.isSolo && { color: colors.bg }]}>SOLO</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onUpdate({ muted: !settings.muted })}
            style={[styles.muteButton, settings.muted && { backgroundColor: 'rgba(251,113,133,0.2)', borderColor: 'rgba(251,113,133,0.4)' }]}
          >
            <Ionicons
              name={settings.muted ? 'volume-mute' : 'volume-high'}
              size={14}
              color={settings.muted ? colors.rose : colors.slate300}
            />
            <Text style={[styles.muteText, settings.muted && { color: colors.rose }]}>
              {settings.muted ? 'MUET' : 'ACTIF'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Device Selector */}
      <View style={styles.deviceSection}>
        <Text style={styles.label}>Appareil Cible (Bluetooth / Sortie Audio)</Text>
        <View style={styles.deviceSelector}>
          {devices.map((device) => (
            <TouchableOpacity
              key={device.deviceId}
              onPress={() => onSetSink(device.deviceId)}
              style={[
                styles.deviceOption,
                settings.deviceId === device.deviceId && { borderColor: accent, backgroundColor: accentDim },
              ]}
            >
              <Text
                style={[
                  styles.deviceOptionText,
                  settings.deviceId === device.deviceId && { color: accent },
                ]}
                numberOfLines={1}
              >
                {device.isBluetooth ? '🎧 ' : '🔊 '}
                {device.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Volume */}
      <View style={styles.volumeSection}>
        <View style={styles.volumeHeader}>
          <Text style={[styles.label, { color: accent }]}>Volume Périphérique {channel}</Text>
          <View style={styles.volumeValues}>
            <Text style={[styles.volumePercent, { color: accent }]}>
              {Math.round(settings.volume * 100)}%
            </Text>
            <Text style={styles.volumeDb}>({getDbValue(settings.volume)})</Text>
          </View>
        </View>
        <Slider
          minimumValue={0}
          maximumValue={1.5}
          step={0.01}
          value={settings.volume}
          onValueChange={(v) => onUpdate({ volume: v })}
          minimumTrackTintColor={accent}
          maximumTrackTintColor={colors.surfaceLight}
          thumbTintColor={colors.white}
        />
        {/* VU Meter */}
        <View style={styles.vuMeter}>
          {[...Array(20)].map((_, i) => {
            const active = isPlaying && !settings.muted && settings.volume > 0 && Math.random() < settings.volume * 0.9;
            const color = i > 16 ? colors.rose : i > 12 ? colors.amber : accent;
            return (
              <View
                key={i}
                style={[styles.vuBar, { backgroundColor: color, opacity: active ? 1 : 0.15 }]}
              />
            );
          })}
        </View>
      </View>

      {/* Pan & Bass Boost */}
      <View style={styles.subControls}>
        <View style={styles.panControl}>
          <View style={styles.panHeader}>
            <Text style={styles.panLabel}>Panoramique (G/D)</Text>
            <Text style={[styles.panValue, { color: accent }]}>
              {settings.pan === 0 ? 'Centre' : settings.pan < 0 ? `G ${Math.round(-settings.pan * 100)}%` : `D ${Math.round(settings.pan * 100)}%`}
            </Text>
          </View>
          <Slider
            minimumValue={-1}
            maximumValue={1}
            step={0.1}
            value={settings.pan}
            onValueChange={(v) => onUpdate({ pan: v })}
            minimumTrackTintColor={accent}
            maximumTrackTintColor={colors.surfaceLight}
            thumbTintColor={colors.white}
          />
        </View>

        <TouchableOpacity
          onPress={() => onUpdate({ bassBoost: !settings.bassBoost })}
          style={[styles.bassBoost, settings.bassBoost && { backgroundColor: accentDim, borderColor: accent }]}
        >
          <Text style={styles.bassBoostTitle}>Bass Boost</Text>
          <Text style={styles.bassBoostSub}>+6 dB (60 Hz)</Text>
          <View style={[styles.switch, settings.bassBoost && { backgroundColor: accent, justifyContent: 'flex-end' }]}>
            <View style={styles.switchKnob} />
          </View>
        </TouchableOpacity>
      </View>

      {/* EQ Button */}
      <TouchableOpacity onPress={onOpenEQ} style={[styles.eqButton, { borderColor: accent }]}>
        <Ionicons name="flash" size={14} color={accent} />
        <Text style={[styles.eqButtonText, { color: accent }]}>
          Ouvrir l'Égaliseur 5 Bandes (Sortie {channel})
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export const DualMixer: React.FC<DualMixerProps> = ({
  mixerState,
  devices,
  onUpdateChannel,
  onSetSinkDevice,
  onUpdateMasterVolume,
  onUpdateCrossfader,
  onToggleMonoSplit,
  onOpenEQModal,
  isPlaying,
}) => {
  const { channelA, channelB, masterVolume, crossfader, monoSplitMode } = mixerState;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Table de Mixage Double Sortie Audio</Text>
          <Text style={styles.headerSubtitle}>
            Contrôles indépendants de volume, égaliseur et latence Bluetooth
          </Text>
        </View>

        <View style={styles.crossfaderBox}>
          <Text style={styles.crossfaderLabel}>Balance A/B</Text>
          <View style={styles.crossfaderRow}>
            <Text style={[styles.crossfaderLetter, { color: colors.cyan }]}>A</Text>
            <Slider
              style={styles.crossfaderSlider}
              minimumValue={-1}
              maximumValue={1}
              step={0.05}
              value={crossfader}
              onValueChange={onUpdateCrossfader}
              minimumTrackTintColor={colors.cyan}
              maximumTrackTintColor={colors.purple}
              thumbTintColor={colors.white}
            />
            <Text style={[styles.crossfaderLetter, { color: colors.purple }]}>B</Text>
          </View>
          <TouchableOpacity onPress={() => onUpdateCrossfader(0)} style={styles.centerButton}>
            <Text style={styles.centerButtonText}>50/50</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Channel Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.channelsRow}>
        <ChannelCard
          channel="A"
          settings={channelA}
          devices={devices}
          isPlaying={isPlaying}
          onUpdate={(s) => onUpdateChannel('A', s)}
          onSetSink={(id) => onSetSinkDevice('A', id)}
          onOpenEQ={() => onOpenEQModal('A')}
        />
        <ChannelCard
          channel="B"
          settings={channelB}
          devices={devices}
          isPlaying={isPlaying}
          onUpdate={(s) => onUpdateChannel('B', s)}
          onSetSink={(id) => onSetSinkDevice('B', id)}
          onOpenEQ={() => onOpenEQModal('B')}
        />
      </ScrollView>

      {/* Master Volume & Mono Split */}
      <View style={styles.masterBar}>
        <View style={styles.masterVolume}>
          <Ionicons name="volume-high" size={20} color={colors.indigo} />
          <Text style={styles.masterLabel}>Volume Master</Text>
          <Slider
            style={styles.masterSlider}
            minimumValue={0}
            maximumValue={1}
            step={0.01}
            value={masterVolume}
            onValueChange={onUpdateMasterVolume}
            minimumTrackTintColor={colors.indigo}
            maximumTrackTintColor={colors.surfaceLight}
            thumbTintColor={colors.white}
          />
          <Text style={styles.masterPercent}>{Math.round(masterVolume * 100)}%</Text>
        </View>

        <View style={styles.monoSplit}>
          <View style={styles.monoSplitText}>
            <Ionicons name="layers" size={20} color={colors.cyan} />
            <View>
              <Text style={styles.monoSplitTitle}>Mode Séparation Stéréo</Text>
              <Text style={styles.monoSplitSub}>
                {monoSplitMode ? 'Gauche -> A, Droit -> B' : 'Stéréo sur les deux appareils'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={onToggleMonoSplit}
            style={[styles.monoSplitButton, monoSplitMode && { backgroundColor: colors.cyan }]}
          >
            <Text style={[styles.monoSplitButtonText, monoSplitMode && { color: colors.bg }]}>
              {monoSplitMode ? 'SPLIT G/D' : 'DUAL STÉRÉO'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  header: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
  headerText: {
    gap: 2,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: colors.slate400,
    fontSize: 11,
  },
  crossfaderBox: {
    backgroundColor: colors.bg,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  crossfaderLabel: {
    color: colors.slate400,
    fontSize: 11,
    fontWeight: '600',
  },
  crossfaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  crossfaderLetter: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  crossfaderSlider: {
    flex: 1,
    height: 32,
  },
  centerButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceLight,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  centerButtonText: {
    color: colors.slate300,
    fontSize: 10,
  },
  channelsRow: {
    gap: 12,
    paddingRight: 4,
  },
  channelCard: {
    width: 320,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
  channelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  channelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  channelIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  channelSubtitle: {
    color: colors.slate400,
    fontSize: 10,
    marginTop: 2,
  },
  channelActions: {
    flexDirection: 'row',
    gap: 8,
  },
  soloButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
  },
  soloText: {
    color: colors.slate400,
    fontSize: 10,
    fontWeight: 'bold',
  },
  muteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
  },
  muteText: {
    color: colors.slate300,
    fontSize: 10,
    fontWeight: 'bold',
  },
  deviceSection: {
    gap: 6,
  },
  label: {
    color: colors.slate300,
    fontSize: 11,
    fontWeight: '600',
  },
  deviceSelector: {
    gap: 6,
  },
  deviceOption: {
    backgroundColor: colors.bg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  deviceOptionText: {
    color: colors.slate300,
    fontSize: 11,
  },
  volumeSection: {
    backgroundColor: 'rgba(2,6,23,0.6)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  volumeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  volumeValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  volumePercent: {
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  volumeDb: {
    color: colors.slate400,
    fontSize: 10,
    fontFamily: 'monospace',
  },
  vuMeter: {
    flexDirection: 'row',
    gap: 2,
    height: 6,
  },
  vuBar: {
    flex: 1,
    borderRadius: 1,
  },
  subControls: {
    flexDirection: 'row',
    gap: 12,
  },
  panControl: {
    flex: 1,
    backgroundColor: 'rgba(2,6,23,0.4)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  panHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  panLabel: {
    color: colors.slate400,
    fontSize: 10,
    fontWeight: '600',
  },
  panValue: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  bassBoost: {
    flex: 1,
    backgroundColor: 'rgba(2,6,23,0.4)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 2,
  },
  bassBoostTitle: {
    color: colors.slate300,
    fontSize: 11,
    fontWeight: '600',
  },
  bassBoostSub: {
    color: colors.slate500,
    fontSize: 9,
  },
  switch: {
    width: 36,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surfaceLight,
    padding: 2,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  switchKnob: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  eqButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    paddingVertical: 10,
    borderWidth: 1,
  },
  eqButtonText: {
    fontSize: 11,
    fontWeight: '600',
  },
  masterBar: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 16,
  },
  masterVolume: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  masterLabel: {
    color: colors.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  masterSlider: {
    flex: 1,
    height: 32,
  },
  masterPercent: {
    color: colors.indigo,
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    width: 40,
    textAlign: 'right',
  },
  monoSplit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  monoSplitText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  monoSplitTitle: {
    color: colors.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  monoSplitSub: {
    color: colors.slate400,
    fontSize: 9,
  },
  monoSplitButton: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  monoSplitButtonText: {
    color: colors.slate300,
    fontSize: 10,
    fontWeight: '600',
  },
});