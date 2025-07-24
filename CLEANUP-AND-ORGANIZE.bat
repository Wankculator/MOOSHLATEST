@echo off
REM MOOSH Wallet Folder Cleanup and Organization Script for Windows
REM This script will clean up and organize the MOOSH Wallet project structure

echo.
echo ========================================
echo MOOSH Wallet Cleanup and Organization
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: Please run this script from the MOOSH Wallet root directory
    exit /b 1
)

echo WARNING: This script will:
echo   - Remove all log files
echo   - Clean up duplicate files
echo   - Organize folder structure
echo   - Remove unnecessary files
echo.
set /p "confirm=Do you want to continue? (Y/N): "
if /i not "%confirm%"=="Y" (
    echo Cleanup cancelled
    exit /b 1
)

echo.
echo Starting cleanup...
echo.

REM 1. Remove all log files
echo Removing log files...
del /s /q *.log 2>nul
echo [OK] Removed all .log files

REM 2. Remove backup directory
echo Removing backup directory...
if exist "backups" rmdir /s /q "backups"
echo [OK] Removed backups directory

REM 3. Create proper test directory structure
echo Organizing test files...
if not exist "tests\unit" mkdir "tests\unit"
if not exist "tests\integration" mkdir "tests\integration"
if not exist "tests\fixtures" mkdir "tests\fixtures"

REM Move test files to proper location
if exist "src\server\final-spark-test.cjs" move "src\server\final-spark-test.cjs" "tests\integration\" >nul 2>&1
if exist "src\server\real-100-percent-wallet-test.cjs" move "src\server\real-100-percent-wallet-test.cjs" "tests\integration\" >nul 2>&1
if exist "src\server\test-wif-generation.cjs" move "src\server\test-wif-generation.cjs" "tests\unit\" >nul 2>&1
if exist "test-ordinals-performance.html" move "test-ordinals-performance.html" "tests\fixtures\" >nul 2>&1
if exist "test-seed-generation.cjs" move "test-seed-generation.cjs" "tests\unit\" >nul 2>&1
echo [OK] Moved test files to tests\ directory

REM 4. Clean up server services
echo Organizing server services...
if not exist "src\server\services\_archive" mkdir "src\server\services\_archive"

REM Move mock and test files to archive
cd src\server\services
for %%f in (*mock*.js *test*.js *old*.js *backup*.js) do (
    if exist "%%f" move "%%f" "_archive\" >nul 2>&1
)
cd ..\..\..
echo [OK] Organized service files

REM 5. Remove nested node_modules
echo Cleaning up nested node_modules...
if exist "src\server\node_modules" rmdir /s /q "src\server\node_modules"
if exist "src\server\package.json" del /q "src\server\package.json"
if exist "src\server\package-lock.json" del /q "src\server\package-lock.json"
echo [OK] Removed nested node_modules

REM 6. Consolidate documentation
echo Organizing documentation...
if not exist "docs\archive" mkdir "docs\archive"
if not exist "docs\api" mkdir "docs\api"
if not exist "docs\guides" mkdir "docs\guides"
if not exist "docs\architecture" mkdir "docs\architecture"

REM Move duplicate files to archive
if exist "PROJECT_STRUCTURE.md" move "PROJECT_STRUCTURE.md" "docs\archive\" >nul 2>&1
if exist "MASTER_PROMPT_IMPROVED.md" move "MASTER_PROMPT_IMPROVED.md" "docs\archive\" >nul 2>&1

REM Move architecture docs
if exist "WALLET_ARCHITECTURE.md" move "WALLET_ARCHITECTURE.md" "docs\architecture\" >nul 2>&1
if exist "PRODUCT_REQUIREMENTS_DOCUMENT.md" move "PRODUCT_REQUIREMENTS_DOCUMENT.md" "docs\architecture\" >nul 2>&1

echo [OK] Organized documentation

REM 7. Clean up scripts directory
echo Consolidating scripts...
if not exist "scripts\archive" mkdir "scripts\archive"

REM Move duplicate scripts to archive
if exist "scripts\windows" (
    xcopy /s /q "scripts\windows\*" "scripts\archive\" >nul 2>&1
    rmdir /s /q "scripts\windows"
)
echo [OK] Consolidated scripts

REM 8. Remove temporary files
echo Removing temporary files...
if exist "optimize-ordinals-loading.js" del /q "optimize-ordinals-loading.js"
del /s /q .DS_Store 2>nul
del /s /q Thumbs.db 2>nul
echo [OK] Removed temporary files

REM 9. Remove old documentation systems
echo Cleaning up old documentation systems...
if exist "MOOSH-WALLET-ENTERPRISE-DOCS" rmdir /s /q "MOOSH-WALLET-ENTERPRISE-DOCS"
if exist "MOOSH-WALLET-KNOWLEDGE-BASE" rmdir /s /q "MOOSH-WALLET-KNOWLEDGE-BASE"
if exist "MOOSH-WALLET-NEXT-GEN-DOCS" rmdir /s /q "MOOSH-WALLET-NEXT-GEN-DOCS"
echo [OK] Removed old documentation systems

REM 10. Create recommended structure
echo Creating recommended directory structure...
if not exist "src\client" mkdir "src\client"
if not exist "src\shared" mkdir "src\shared"
if not exist "config" mkdir "config"
if not exist ".github\workflows" mkdir ".github\workflows"

echo.
echo ========================================
echo Cleanup Report
echo ========================================
echo.
echo [OK] Removed all log files
echo [OK] Deleted backup directory
echo [OK] Organized test files into tests\
echo [OK] Cleaned up service files
echo [OK] Removed nested node_modules
echo [OK] Consolidated documentation
echo [OK] Organized scripts
echo [OK] Removed old documentation systems
echo [OK] Created recommended structure
echo.

echo New folder structure:
echo.
echo MOOSH-WALLET\
echo   - src\
echo     - server\
echo     - client\
echo     - shared\
echo   - public\
echo   - tests\
echo     - unit\
echo     - integration\
echo     - fixtures\
echo   - docs\
echo     - api\
echo     - guides\
echo     - architecture\
echo   - scripts\
echo   - config\
echo.

echo ========================================
echo Cleanup complete!
echo ========================================
echo.
echo Important next steps:
echo 1. Review src\server\services\_archive\ and delete unneeded files
echo 2. Commit these changes: git add -A ^&^& git commit -m "Clean up and organize project structure"
echo 3. Update any import paths that may have changed
echo 4. Run 'npm install' to ensure dependencies are correct
echo.

pause