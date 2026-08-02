@echo off
cd /d "%~dp0"
echo === Running EAS build from: %CD% ===
set EAS_NO_VCS=1
call npx eas-cli build --platform android --profile preview --non-interactive
echo === BUILD FINISHED ===
pause