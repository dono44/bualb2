@echo off
cd /d "%~dp0"
echo === Running EAS init from: %CD% ===
call npx eas-cli init --force --non-interactive 2>&1
echo === DONE ===