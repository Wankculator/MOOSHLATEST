@echo off
echo ========================================
echo  MOOSH Wallet - Starting Servers
echo ========================================
echo.

echo Stopping any existing Node servers...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Starting API Server on port 3001...
start "MOOSH API Server" cmd /k "cd src\server && node simple-server.js"

timeout /t 3 /nobreak >nul

echo Starting Main Wallet Server on port 3333...
start "MOOSH Wallet Server" cmd /k "cd /d %~dp0 && node src\server\server.js"

echo.
echo ========================================
echo  Both servers are now running!
echo ========================================
echo  API Server:    http://localhost:3001
echo  Wallet App:    http://localhost:3333
echo ========================================
echo.
echo To stop servers, close the command windows
echo or press Ctrl+C in each window.
echo.
pause