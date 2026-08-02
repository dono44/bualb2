@echo off
cd /d "%~dp0"
echo === Running TypeScript check from: %CD% ===
call npx tsc --noEmit
echo === DONE ===