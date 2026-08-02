@echo off
cd /d "%~dp0"
echo === Running from: %CD% ===
call npx expo install expo-linear-gradient react-native-svg
call npx tsc --noEmit
echo === DONE ===