import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'double' = 'light') {
  try {
    switch (type) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'double':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      default:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch {
    // Ignore haptic errors
  }
}

export function isAndroidDevice(): boolean {
  return Platform.OS === 'android';
}