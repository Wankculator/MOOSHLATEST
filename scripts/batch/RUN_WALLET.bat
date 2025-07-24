@echo off
echo Starting MOOSH Wallet...
echo.
cd /d "%~dp0"
node src\server\server.js
pause