@echo off
echo Starting MOOSH Wallet Servers...
echo.

REM Kill any existing Node processes
taskkill /F /IM node.exe 2>nul

REM Start wallet server in new window
start "MOOSH Wallet Server - Port 3333" cmd /k "cd /d %~dp0 && node src\server\server.js"

REM Wait 2 seconds
timeout /t 2 /nobreak >nul

REM Start API server in new window
start "MOOSH API Server - Port 3001" cmd /k "cd /d %~dp0\src\server && node simple-api-server.js"

echo.
echo Both servers are starting in separate windows:
echo - Wallet Server: http://localhost:3333
echo - API Server: http://localhost:3001
echo.
echo If you see any errors, check the individual command windows.
pause