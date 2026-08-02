import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Track, PlaybackState } from '../types';
import { colors } from '../theme';

interface PlayerControlsProps {
  currentTrack?: Track;
  playbackState: PlaybackState;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (seconds: number) => void;
  onToggleShuffle: () => void;
  onChangeRepeat: () => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  currentTrack,
  playbackState,
  onPlay,
  onPause,
  onStop,
  onPrev,
  onNext,
  onSeek,
  onToggleShuffle,
  onChangeRepeat,
}) => {
  const progressPercent = playbackState.duration
    ? (playbackState.currentTime / playbackState.duration) * 100
    : 0;

  return (
    <View style={styles.container}>
      {/* Track Info */}
      <View style={styles.trackInfo}>
        <View style={styles.cover}>
          <Ionicons name="musical-notes" size={24} color={colors.slate500} />
          {playbackState.isPlaying && (
            <View style={styles.playingOverlay}>
              <Ionicons name="disc" size={20} color={colors.cyan} />
            </View>
          )}
        </View>
        <View style={styles.trackText}>
          <View style={styles.formatRow}>
            <Text style={styles.formatBadge}>{currentTrack?.format || 'AUDIO DECK'}</Text>
            {currentTrack?.isPreset && (
              <Text style={styles.demoBadge}>Démo</Text>
            )}
          </View>
          <Text style={styles.title} numberOfLines={1}>
            {currentTrack?.title || 'Aucun morceau sélectionné'}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentTrack?.artist || 'Choisissez une chanson dans la liste'}
            {currentTrack?.album ? ` • ${currentTrack.album}` : ''}
          </Text>
        </View>
      </View>

      {/* Transport Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={onToggleShuffle}
          style={[styles.smallButton, playbackState.shuffle && styles.activeButton]}
        >
          <Ionicons
            name="shuffle"
            size={16}
            color={playbackState.shuffle ? colors.cyan : colors.slate400}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={onPrev} style={styles.smallButton}>
          <Ionicons name="play-skip-back" size={20} color={colors.slate300} />
        </TouchableOpacity>

        {playbackState.isPlaying ? (
          <TouchableOpacity onPress={onPause} style={styles.mainButton}>
            <Ionicons name="pause" size={24} color={colors.bg} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={onPlay}
            disabled={!currentTrack || playbackState.isLoading}
            style={[styles.mainButton, (!currentTrack || playbackState.isLoading) && styles.disabledButton]}
          >
            {playbackState.isLoading ? (
              <Ionicons name="hourglass" size={22} color={colors.bg} />
            ) : (
              <Ionicons name="play" size={24} color={colors.bg} />
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={onStop} style={styles.smallButton}>
          <Ionicons name="stop" size={18} color={colors.slate400} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onNext} style={styles.smallButton}>
          <Ionicons name="play-skip-forward" size={20} color={colors.slate300} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onChangeRepeat}
          style={[styles.smallButton, playbackState.repeat !== 'off' && styles.activeButton]}
        >
          <Ionicons
            name="repeat"
            size={16}
            color={playbackState.repeat !== 'off' ? colors.cyan : colors.slate400}
          />
          {playbackState.repeat === 'one' && (
            <View style={styles.repeatBadge}>
              <Text style={styles.repeatBadgeText}>1</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressRow}>
        <Text style={styles.timeText}>{formatTime(playbackState.currentTime)}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={playbackState.duration || 1}
          value={Math.min(playbackState.currentTime, playbackState.duration || 1)}
          onSlidingComplete={onSeek}
          minimumTrackTintColor={colors.cyan}
          maximumTrackTintColor={colors.surfaceLight}
          thumbTintColor={colors.white}
        />
        <Text style={styles.timeText}>{formatTime(playbackState.duration)}</Text>
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
    gap: 16,
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cover: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playingOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(2,6,23,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackText: {
    flex: 1,
  },
  formatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  formatBadge: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '600',
    backgroundColor: colors.cyanDim,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  demoBadge: {
    color: colors.slate400,
    fontSize: 10,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  title: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  artist: {
    color: colors.slate400,
    fontSize: 12,
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  smallButton: {
    padding: 8,
    borderRadius: 10,
  },
  activeButton: {
    backgroundColor: colors.cyanDim,
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.4)',
  },
  mainButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.cyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.4,
  },
  repeatBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.cyan,
    borderRadius: 6,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  repeatBadgeText: {
    color: colors.bg,
    fontSize: 8,
    fontWeight: 'bold',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  slider: {
    flex: 1,
    height: 32,
  },
  timeText: {
    color: colors.slate400,
    fontSize: 11,
    fontFamily: 'monospace',
  },
});