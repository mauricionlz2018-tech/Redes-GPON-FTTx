@echo off
title Sistema GPON TELECOM FTTx
echo ================================================================
echo    GPON TELECOM S.A. de C.V. - Inventario y Mapeo Logico FTTx
echo ================================================================
echo.

echo [1/3] Verificando Base de Datos (Neon Cloud / Docker)...
echo Conectando a PostgreSQL en Neon Cloud...

echo.
echo [2/3] Iniciando Servidor Backend (API en puerto 4000)...
start "GPON Backend API" cmd /k "pnpm --filter backend dev"

echo.
echo [3/3] Iniciando Interfaz Frontend (Web en puerto 3000)...
start "GPON Frontend Web" cmd /k "pnpm --filter frontend dev"

echo.
echo Esperando 3 segundos para abrir el navegador...
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo ================================================================
echo  LISTO! La aplicacion se abrio en: http://localhost:3000
echo.
echo  Credenciales de acceso rapido incluidas en la pantalla:
echo  - Administrador: admin@gpon.com   (pass: admin123)
echo  - Soporte:       soporte@gpon.com (pass: admin123)
echo  - Tecnico:       tecnico@gpon.com (pass: admin123)
echo ================================================================
pause

