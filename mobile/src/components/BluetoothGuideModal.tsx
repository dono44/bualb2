import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

interface BluetoothGuideModalProps {
  onClose: () => void;
  onScanDevices: () => void;
}

type TabKey = 'android' | 'samsung' | 'xiaomi' | 'pixel';

export const BluetoothGuideModal: React.FC<BluetoothGuideModalProps> = ({
  onClose,
  onScanDevices,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('android');

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'android', label: 'Android' },
    { key: 'samsung', label: 'Samsung' },
    { key: 'xiaomi', label: 'Xiaomi' },
    { key: 'pixel', label: 'Pixel' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'android':
        return (
          <View style={styles.contentBlock}>
            <Text style={styles.contentTitle}>📱 Android Général (Dual Audio)</Text>
            <Text style={styles.contentText}>
              1. Appairez vos 2 enceintes/casques Bluetooth dans Paramètres {'>'} Bluetooth.{'\n\n'}
              2. Ouvrez le panneau de notification et appuyez sur "Média" (Media Output).{'\n\n'}
              3. Cochez les deux appareils Bluetooth pour les activer simultanément.{'\n\n'}
              4. Utilisez la compensation de latence dans le mixeur pour synchroniser le son.
            </Text>
          </View>
        );
      case 'samsung':
        return (
          <View style={styles.contentBlock}>
            <Text style={styles.contentTitle}>⭐ Samsung Galaxy (Dual Audio)</Text>
            <Text style={styles.contentText}>
              1. Paramètres {'>'} Connexions {'>'} Bluetooth, appairez vos 2 appareils.{'\n\n'}
              2. Faites glisser la barre de notification et appuyez sur "Média".{'\n\n'}
              3. Cochez les deux appareils Bluetooth dans la liste.{'\n\n'}
              4. Revenez dans l'app et utilisez la compensation de latence.
            </Text>
          </View>
        );
      case 'xiaomi':
        return (
          <View style={styles.contentBlock}>
            <Text style={styles.contentTitle}>📱 Xiaomi / POCO / Redmi (Audio Share)</Text>
            <Text style={styles.contentText}>
              1. Connectez vos deux écouteurs Bluetooth au téléphone.{'\n\n'}
              2. Ouvrez le volet de contrôle et appuyez longuement sur Bluetooth.{'\n\n'}
              3. Activez le partage audio simultané (Audio Share).{'\n\n'}
              4. Le flux stéréo est envoyé vers les deux appareils.
            </Text>
          </View>
        );
      case 'pixel':
        return (
          <View style={styles.contentBlock}>
            <Text style={styles.contentTitle}>📱 Google Pixel / Stock Android</Text>
            <Text style={styles.contentText}>
              1. Lorsque la musique joue, ouvrez le panneau de notification.{'\n\n'}
              2. Appuyez sur l'icône de périphérique en haut à droite de la carte Média.{'\n\n'}
              3. Sélectionnez vos sorties Bluetooth connectées.{'\n\n'}
              4. Utilisez le sélecteur média pour choisir les appareils.
            </Text>
          </View>
        );
    }
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.iconBox}>
                <Ionicons name="bluetooth" size={20} color={colors.indigo} />
              </View>
              <View>
                <Text style={styles.title}>Guide Double Bluetooth</Text>
                <Text style={styles.subtitle}>Comment diffuser sur 2 appareils</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={20} color={colors.slate400} />
            </TouchableOpacity>
          </View>

          {/* Scan Button */}
          <TouchableOpacity style={styles.scanButton} onPress={onScanDevices}>
            <Ionicons name="refresh" size={14} color={colors.cyan} />
            <Text style={styles.scanButtonText}>Scanner les périphériques</Text>
          </TouchableOpacity>

          {/* Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              >
                <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Content */}
          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
            {renderContent()}
          </ScrollView>

          {/* Footer */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Fermer le guide</Text>
          </TouchableOpacity>
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
    maxWidth: 500,
    maxHeight: '90%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    gap: 12,
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
    backgroundColor: 'rgba(129,140,248,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(129,140,248,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    color: colors.slate400,
    fontSize: 11,
    marginTop: 2,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.cyanDim,
    borderRadius: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.4)',
  },
  scanButtonText: {
    color: colors.cyan,
    fontSize: 11,
    fontWeight: '600',
  },
  tabsRow: {
    gap: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.cyan,
  },
  tabText: {
    color: colors.slate400,
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.cyan,
  },
  content: {
    flexGrow: 0,
  },
  contentContainer: {
    gap: 8,
  },
  contentBlock: {
    backgroundColor: colors.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  contentTitle: {
    color: colors.white,
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  contentText: {
    color: colors.slate300,
    fontSize: 12,
    lineHeight: 20,
  },
  closeButton: {
    backgroundColor: colors.indigo,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
});