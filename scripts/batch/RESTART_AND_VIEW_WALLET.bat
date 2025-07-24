@echo off
echo ========================================
echo      MOOSH WALLET RESTART SCRIPT
echo ========================================
echo.
echo Killing existing Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo.
echo Starting API Server (Port 3001)...
start "MOOSH API Server" cmd /k "cd /d %~dp0 && node src/server/api-server.js"
timeout /t 3 >nul

echo Starting UI Server (Port 3333)...
start "MOOSH UI Server" cmd /k "cd /d %~dp0 && node src/server/server.js"
timeout /t 3 >nul

echo.
echo ========================================
echo   Servers are starting up...
echo ========================================
echo.
echo Opening MOOSH Wallet in browser...
timeout /t 2 >nul
start http://localhost:3333

echo.
echo ========================================
echo   IMPORTANT: Clear browser cache!
echo   Press Ctrl+F5 in browser
echo ========================================
echo.
pause