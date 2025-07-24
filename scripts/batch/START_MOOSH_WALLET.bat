@echo off
echo.
echo =====================================
echo   MOOSH WALLET - Starting Services
echo =====================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Starting MOOSH Wallet servers...
echo.

REM Start both servers
node start-all.js

pause