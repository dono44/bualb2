@echo off
start cmd /k "cd /d %~dp0 && set EAS_NO_VCS=1 && npx eas-cli build --platform android --profile preview"