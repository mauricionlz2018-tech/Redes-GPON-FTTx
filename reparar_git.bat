@echo off
echo ========================================================
echo Reparando indice de Git afectado por sincronizacion de OneDrive
echo ========================================================
del /f /q .git\index 2>nul
git reset
echo ========================================================
echo [OK] Indice de Git reconstruido y reparado exitosamente.
echo ========================================================
pause

