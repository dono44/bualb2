import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Track } from '../types';
import { triggerHaptic } from '../utils/haptics';
import { colors } from '../theme';

interface PlaylistProps {
  tracks: Track[];
  currentTrackId?: string;
  onSelectTrack: (track: Track) => void;
  onAddFiles: (files: { uri: string; name: string; size?: number }[]) => void;
  onAddStreamUrl: (title: string, artist: string, url: string) => void;
  onRemoveTrack: (trackId: string) => void;
}

const formatDuration = (secs: number) => {
  if (isNaN(secs) || secs <= 0) return '00:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const Playlist: React.FC<PlaylistProps> = ({
  tracks,
  currentTrackId,
  onSelectTrack,
  onAddFiles,
  onAddStreamUrl,
  onRemoveTrack,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showStreamModal, setShowStreamModal] = useState(false);
  const [streamTitle, setStreamTitle] = useState('');
  const [streamArtist, setStreamArtist] = useState('');
  const [streamUrl, setStreamUrl] = useState('');

  const filteredTracks = tracks.filter(
    (t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePickFiles = async () => {
    triggerHaptic('medium');
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*', 'application/octet-stream'],
        multiple: true,
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const files = result.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.name,
        size: asset.size,
      }));
      onAddFiles(files);
    } catch (err) {
      console.error('File pick error:', err);
    }
  };

  const handleStreamSubmit = () => {
    if (!streamUrl.trim()) return;
    onAddStreamUrl(
      streamTitle.trim() || 'Radio Web Stream',
      streamArtist.trim() || 'Live Audio Stream',
      streamUrl.trim()
    );
    setStreamTitle('');
    setStreamArtist('');
    setStreamUrl('');
    setShowStreamModal(false);
  };

  return (
    <View style={styles.container}>
      {/* Import Hero */}
      <View style={styles.hero}>
        <View style={styles.heroText}>
          <View style={styles.heroIcon}>
            <Ionicons name="phone-portrait" size={20} color={colors.cyan} />
          </View>
          <View style={styles.heroTextBlock}>
            <Text style={styles.heroTitle}>Musique du Téléphone</Text>
            <Text style={styles.heroSubtitle}>Importez vos chansons MP3 / FLAC / M4A</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.importButton} onPress={handlePickFiles}>
          <Ionicons name="cloud-upload" size={16} color={colors.bg} />
          <Text style={styles.importButtonText}>Importer</Text>
        </TouchableOpacity>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="list" size={18} color={colors.cyan} />
          <Text style={styles.headerTitle}>
            Bibliothèque ({tracks.length} morceau{tracks.length > 1 ? 'x' : ''})
          </Text>
        </View>
        <TouchableOpacity
          style={styles.streamButton}
          onPress={() => {
            triggerHaptic('light');
            setShowStreamModal(true);
          }}
        >
          <Ionicons name="radio" size={14} color={colors.indigo} />
          <Text style={styles.streamButtonText}>Flux Web</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color={colors.slate500} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher..."
          placeholderTextColor={colors.slate500}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {/* Track List */}
      <FlatList
        data={filteredTracks}
        keyExtractor={(item) => item.id}
        style={styles.trackList}
        contentContainerStyle={styles.trackListContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucun morceau trouvé.</Text>
        }
        renderItem={({ item, index }) => {
          const isCurrent = item.id === currentTrackId;
          return (
            <TouchableOpacity
              onPress={() => {
                triggerHaptic('light');
                onSelectTrack(item);
              }}
              style={[styles.trackItem, isCurrent && styles.trackItemActive]}
            >
              <View style={styles.trackIcon}>
                <Ionicons
                  name={isCurrent ? 'play' : 'musical-note'}
                  size={16}
                  color={isCurrent ? colors.cyan : colors.slate400}
                />
              </View>
              <View style={styles.trackInfo}>
                <Text style={[styles.trackTitle, isCurrent && { color: colors.cyan }]} numberOfLines={1}>
                  {index + 1}. {item.title}
                </Text>
                <Text style={styles.trackArtist} numberOfLines={1}>
                  {item.artist}
                  {item.album ? ` • ${item.album}` : ''}
                </Text>
              </View>
              <View style={styles.trackMeta}>
                <Text style={styles.trackFormat}>{item.format || 'AUDIO'}</Text>
                <Text style={styles.trackDuration}>{formatDuration(item.duration)}</Text>
                {!item.isPreset && (
                  <TouchableOpacity
                    onPress={() => {
                      triggerHaptic('light');
                      onRemoveTrack(item.id);
                    }}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={14} color={colors.slate400} />
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Stream Modal */}
      <Modal
        visible={showStreamModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStreamModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Ionicons name="radio" size={20} color={colors.indigo} />
                <Text style={styles.modalTitle}>Ajouter un Flux Web / Radio</Text>
              </View>
              <TouchableOpacity onPress={() => setShowStreamModal(false)}>
                <Ionicons name="close" size={20} color={colors.slate400} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Entrez l'URL directe d'un flux audio MP3 ou AAC
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nom du Flux / Station</Text>
              <TextInput
                style={styles.input}
                placeholder="ex: Chillout Lounge Radio"
                placeholderTextColor={colors.slate500}
                value={streamTitle}
                onChangeText={setStreamTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Artiste / Genre</Text>
              <TextInput
                style={styles.input}
                placeholder="ex: Radio Deep House 24/7"
                placeholderTextColor={colors.slate500}
                value={streamArtist}
                onChangeText={setStreamArtist}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>URL du Flux Audio</Text>
              <TextInput
                style={styles.input}
                placeholder="https://stream.example.com/radio.mp3"
                placeholderTextColor={colors.slate500}
                value={streamUrl}
                onChangeText={setStreamUrl}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowStreamModal(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleStreamSubmit}>
                <Text style={styles.submitButtonText}>Ajouter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  hero: {
    backgroundColor: 'rgba(8,47,73,0.4)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.3)',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  heroIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.cyanDim,
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextBlock: {
    flex: 1,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 13,
    fontWeight: 'bold',
  },
  heroSubtitle: {
    color: colors.slate300,
    fontSize: 10,
    marginTop: 2,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.cyan,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  importButtonText: {
    color: colors.bg,
    fontSize: 11,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  streamButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(129,140,248,0.2)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(129,140,248,0.3)',
  },
  streamButtonText: {
    color: colors.indigo,
    fontSize: 11,
    fontWeight: '600',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.white,
    fontSize: 12,
    padding: 0,
  },
  trackList: {
    maxHeight: 320,
  },
  trackListContent: {
    gap: 6,
  },
  emptyText: {
    color: colors.slate500,
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 24,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(2,6,23,0.4)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
  },
  trackItemActive: {
    backgroundColor: colors.cyanDim,
    borderColor: 'rgba(34,211,238,0.4)',
  },
  trackIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    color: colors.slate200 || colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  trackArtist: {
    color: colors.slate400,
    fontSize: 10,
    marginTop: 2,
  },
  trackMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trackFormat: {
    color: colors.slate400,
    fontSize: 9,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  trackDuration: {
    color: colors.slate400,
    fontSize: 10,
    fontFamily: 'monospace',
  },
  deleteButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2,6,23,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: 'bold',
  },
  modalSubtitle: {
    color: colors.slate400,
    fontSize: 11,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    color: colors.slate300,
    fontSize: 11,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.white,
    fontSize: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 4,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  cancelButtonText: {
    color: colors.slate400,
    fontSize: 12,
  },
  submitButton: {
    backgroundColor: colors.indigo,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
});