@echo off
echo ==========================================
echo     RUNNING YOUR REAL MOOSH WALLET UI
echo ==========================================
echo.

echo Starting your actual wallet UI (Port 8080)...
start "MOOSH Wallet UI" cmd /k "cd /d %~dp0 && node moosh-ui-server.js"

echo Starting API Server (Port 3001)...
start "MOOSH API Server" cmd /k "cd /d %~dp0 && node src/server/api-server.js"

timeout /t 3 >nul

echo.
echo ==========================================
echo   YOUR MOOSH WALLET IS STARTING!
echo ==========================================
echo.
echo Opening your wallet in browser...
start http://localhost:8080

echo.
echo Your real MOOSH Wallet UI includes:
echo - Landing page with "Get Started"
echo - Dashboard with wallet info
echo - Send/Receive/Swap buttons
echo - Settings and theme toggle
echo - All your custom styling
echo.
pause