@echo off
echo.
echo ================================================
echo    CREATING REAL WALLET IMPLEMENTATION BRANCH
echo ================================================
echo.

REM Navigate to the project directory
cd /d "C:\Users\sk84l\OneDrive\Desktop\MOOSH WALLET"

REM Define the new branch name
set BRANCH_NAME=real-wallet-implementation

echo Creating branch: %BRANCH_NAME%
echo.

REM Ensure we're up to date with master
echo Fetching latest from GitHub...
git fetch origin master

REM Create new branch from master
echo Creating new branch from master...
git checkout -b %BRANCH_NAME% origin/master

if %errorlevel% equ 0 (
    echo.
    echo Branch created successfully!
    echo.
    
    REM Cherry-pick our commit with real wallet implementation
    echo Applying real wallet implementation changes...
    git cherry-pick f41fa06
    
    if %errorlevel% equ 0 (
        echo.
        echo Changes applied successfully!
        echo.
        echo Pushing to GitHub...
        git push -u origin %BRANCH_NAME%
        
        if %errorlevel% equ 0 (
            echo.
            echo ================================================
            echo    SUCCESS! Branch created and pushed
            echo ================================================
            echo.
            echo Branch: %BRANCH_NAME%
            echo.
            echo View on GitHub:
            echo https://github.com/Wankculator/Moosh/tree/%BRANCH_NAME%
            echo.
            echo Create Pull Request:
            echo https://github.com/Wankculator/Moosh/compare/master...%BRANCH_NAME%
            echo.
        ) else (
            echo ERROR: Failed to push to GitHub
        )
    ) else (
        echo ERROR: Failed to apply changes
        echo You may need to resolve conflicts
    )
) else (
    echo ERROR: Failed to create branch
)

pause