@echo off
echo.
echo ================================================
echo    PUSHING MOOSH WALLET TO GITHUB
echo ================================================
echo.

REM Navigate to the project directory
cd /d "C:\Users\sk84l\OneDrive\Desktop\MOOSH WALLET"

REM Check if we're in a git repository
git status >nul 2>&1
if errorlevel 1 (
    echo ERROR: Not a git repository!
    echo Please make sure you're in the MOOSH WALLET directory
    pause
    exit /b 1
)

REM Show current branch
echo Current branch:
git branch --show-current
echo.

REM Show status
echo Git status:
git status --short
echo.

REM Push to GitHub
echo Pushing to GitHub...
git push origin complete-theme-notification-fix

if %errorlevel% equ 0 (
    echo.
    echo ================================================
    echo    SUCCESS! Pushed to GitHub
    echo ================================================
    echo.
    echo Key Features Implemented:
    echo - Real BIP39 seed generation
    echo - Correct Spark Protocol addresses
    echo - Fixed wallet details page
    echo - Comprehensive documentation
    echo.
    echo GitHub URL: https://github.com/Wankculator/Moosh
    echo.
) else (
    echo.
    echo ERROR: Push failed!
    echo Please check your internet connection and try again.
)

pause