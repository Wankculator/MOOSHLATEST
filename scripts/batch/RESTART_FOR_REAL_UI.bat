@echo off
echo ==========================================
echo   RESTARTING WITH YOUR REAL MOOSH UI
echo ==========================================
echo.

echo Stopping all Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo.
echo Starting YOUR server.js (Port 3333)...
start "MOOSH Wallet UI" cmd /k "cd /d %~dp0 && node server.js"

echo Starting API Server (Port 3001)...
start "MOOSH API Server" cmd /k "cd /d %~dp0 && node src/server/api-server.js"

timeout /t 3 >nul

echo.
echo ==========================================
echo    YOUR REAL MOOSH WALLET IS READY!
echo ==========================================
echo.
echo Opening in browser...
start http://localhost:3333

echo.
echo This is YOUR actual wallet UI with:
echo - Your custom interface
echo - Your dashboard
echo - Your modals
echo - Real wallet generation
echo.
pause