@echo off
echo Starting MOOSH Wallet Server...
cd /d "%~dp0"
node src\server\server.js
pause