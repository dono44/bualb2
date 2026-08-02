@echo off
cd /d "%~dp0"
echo === Running from: %CD% ===
call npx expo install expo-audio expo-document-picker expo-file-system expo-haptics @react-native-community/slider @expo/vector-icons
echo === DONE ===