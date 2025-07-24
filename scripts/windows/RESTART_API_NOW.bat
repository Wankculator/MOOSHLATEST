@echo off
echo ========================================
echo   RESTARTING API SERVER WITH FIXES
echo ========================================
echo.

echo Stopping API server...
taskkill /F /FI "WINDOWTITLE eq MOOSH API Server*" 2>nul
taskkill /F /FI "WINDOWTITLE eq api-server*" 2>nul
timeout /t 2 >nul

echo.
echo Starting API Server with wallet generation fixes...
start "MOOSH API Server" cmd /k "cd /d %~dp0 && node src/server/api-server.js"

timeout /t 3 >nul

echo.
echo ========================================
echo   API SERVER RESTARTED!
echo ========================================
echo.
echo Now go back to your wallet at http://localhost:3333
echo and click "Create New Wallet" - it will work!
echo.
pause