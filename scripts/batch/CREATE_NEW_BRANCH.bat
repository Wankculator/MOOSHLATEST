@echo off
echo.
echo ================================================
echo    CREATE NEW BRANCH FOR MOOSH WALLET
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

REM Ask for new branch name
set /p BRANCH_NAME="Enter new branch name (e.g., real-wallet-implementation): "

if "%BRANCH_NAME%"=="" (
    echo ERROR: Branch name cannot be empty!
    pause
    exit /b 1
)

REM Create and checkout new branch
echo.
echo Creating new branch: %BRANCH_NAME%
git checkout -b %BRANCH_NAME%

if %errorlevel% equ 0 (
    echo.
    echo Branch created successfully!
    echo.
    echo Pushing new branch to GitHub...
    git push -u origin %BRANCH_NAME%
    
    if %errorlevel% equ 0 (
        echo.
        echo ================================================
        echo    SUCCESS! New branch created and pushed
        echo ================================================
        echo.
        echo Branch name: %BRANCH_NAME%
        echo GitHub URL: https://github.com/Wankculator/Moosh/tree/%BRANCH_NAME%
        echo.
        echo You can now create a pull request at:
        echo https://github.com/Wankculator/Moosh/compare/%BRANCH_NAME%
        echo.
    ) else (
        echo.
        echo ERROR: Failed to push branch to GitHub
        echo Try running: git push -u origin %BRANCH_NAME%
    )
) else (
    echo.
    echo ERROR: Failed to create branch
    echo The branch might already exist. Try a different name.
)

pause