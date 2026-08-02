import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AudioEngineCapabilities } from '../types';
import { colors } from '../theme';

interface HeaderProps {
  capabilities: AudioEngineCapabilities;
  onScanDevices: () => void;
  onOpenGuide: () => void;
  isScanning: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  capabilities,
  onScanDevices,
  onOpenGuide,
  isScanning,
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <View style={styles.logo}>
          <Ionicons name="volume-high" size={20} color={colors.cyan} />
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>2x</Text>
          </View>
        </View>
        <View style={styles.brandText}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>DualAudio</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Bluetooth Studio</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>Diffusion audio simultanée sur 2 périphériques</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <View style={styles.statusBadge}>
          <Ionicons name="hardware-chip" size={14} color={colors.cyan} />
          <Text style={styles.statusText}>
            {capabilities.setSinkIdSupported ? 'Support Natif' : 'Routage Audio Dédié'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.scanButton}
          onPress={onScanDevices}
          disabled={isScanning}
        >
          <Ionicons
            name="refresh"
            size={14}
            color={colors.cyan}
            style={isScanning ? styles.spinning : undefined}
          />
          <Text style={styles.scanText}>{isScanning ? 'Recherche...' : 'Scanner'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.guideButton} onPress={onOpenGuide}>
          <Ionicons name="phone-portrait" size={14} color={colors.emerald} />
          <Text style={styles.guideText}>Guide</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.cyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadgeText: {
    color: colors.bg,
    fontSize: 8,
    fontWeight: 'bold',
  },
  brandText: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: colors.cyanDim,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.2)',
  },
  badgeText: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '600',
  },
  subtitle: {
    color: colors.slate400,
    fontSize: 11,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusText: {
    color: colors.slate400,
    fontSize: 11,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scanText: {
    color: colors.slate400,
    fontSize: 11,
    fontWeight: '500',
  },
  spinning: {
    transform: [{ rotate: '45deg' }],
  },
  guideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.emeraldDim,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.3)',
  },
  guideText: {
    color: colors.emerald,
    fontSize: 11,
    fontWeight: '500',
  },
});