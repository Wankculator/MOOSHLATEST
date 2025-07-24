@echo off
REM MOOSH Wallet Cleanup Script - Preserves All Documentation
REM This version keeps all documentation for AI development

echo.
echo ========================================
echo MOOSH Wallet Cleanup (Docs Preserved)
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: Please run this script from the MOOSH Wallet root directory
    exit /b 1
)

echo This script will:
echo   [+] Remove all log files
echo   [+] Clean up duplicate service files
echo   [+] Organize test files
echo   [+] Remove temporary files
echo   [+] KEEP all documentation systems
echo   [+] KEEP all MD files for AI reference
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
echo [1/8] Removing log files...
del /s /q *.log 2>nul
if exist "logs" rmdir /s /q "logs"
echo [OK] Removed all .log files

REM 2. Remove backup directory
echo [2/8] Removing backup directory...
if exist "backups" rmdir /s /q "backups"
echo [OK] Removed backups directory

REM 3. Create proper test directory structure
echo [3/8] Organizing test files...
if not exist "tests\unit" mkdir "tests\unit"
if not exist "tests\integration" mkdir "tests\integration"
if not exist "tests\fixtures" mkdir "tests\fixtures"

REM Move test files to proper location
if exist "src\server\final-spark-test.cjs" move "src\server\final-spark-test.cjs" "tests\integration\" >nul 2>&1
if exist "src\server\real-100-percent-wallet-test.cjs" move "src\server\real-100-percent-wallet-test.cjs" "tests\integration\" >nul 2>&1
if exist "src\server\test-wif-generation.cjs" move "src\server\test-wif-generation.cjs" "tests\unit\" >nul 2>&1
if exist "test-ordinals-performance.html" move "test-ordinals-performance.html" "tests\fixtures\" >nul 2>&1
if exist "test-seed-generation.cjs" move "test-seed-generation.cjs" "tests\unit\" >nul 2>&1
echo [OK] Organized test files

REM 4. Clean up server services (archive old ones)
echo [4/8] Organizing server services...
if not exist "src\server\services\_archive" mkdir "src\server\services\_archive"

REM Move clearly unused service files
cd src\server\services
for %%f in (*mock*.js *test*.js *old*.js *backup*.js *temp*.js) do (
    if exist "%%f" move "%%f" "_archive\" >nul 2>&1
)
cd ..\..\..
echo [OK] Archived unused service files

REM 5. Remove nested node_modules
echo [5/8] Cleaning nested node_modules...
if exist "src\server\node_modules" rmdir /s /q "src\server\node_modules"
if exist "src\server\package.json" del /q "src\server\package.json"
if exist "src\server\package-lock.json" del /q "src\server\package-lock.json"
echo [OK] Removed nested node_modules

REM 6. Clean up scripts directory
echo [6/8] Consolidating scripts...
if not exist "scripts\archive" mkdir "scripts\archive"

REM Archive duplicate Windows scripts
if exist "scripts\windows" (
    xcopy /s /q "scripts\windows\*" "scripts\archive\" >nul 2>&1
    rmdir /s /q "scripts\windows"
)
echo [OK] Consolidated scripts

REM 7. Remove temporary files
echo [7/8] Removing temporary files...
if exist "optimize-ordinals-loading.js" del /q "optimize-ordinals-loading.js"
del /s /q .DS_Store 2>nul
del /s /q Thumbs.db 2>nul
echo [OK] Removed temporary files

REM 8. Update .gitignore
echo [8/8] Updating .gitignore...
echo. >> .gitignore
echo # Cleanup additions >> .gitignore
echo *.log >> .gitignore
echo logs/ >> .gitignore
echo backups/ >> .gitignore
echo *_archive/ >> .gitignore
echo .DS_Store >> .gitignore
echo Thumbs.db >> .gitignore
echo [OK] Updated .gitignore

echo.
echo ========================================
echo Cleanup Complete! Documentation Preserved
echo ========================================
echo.
echo [+] Cleaned: Log files, backups, temp files
echo [+] Organized: Tests, services, scripts
echo [+] PRESERVED: All documentation systems
echo.
echo Documentation Systems Available:
echo   - AI-START-HERE.md (Master guide)
echo   - CLAUDE.md (Quick reference)
echo   - /MOOSH-WALLET-KNOWLEDGE-BASE/
echo   - /MOOSH-WALLET-ENTERPRISE-DOCS/
echo   - /MOOSH-WALLET-PROFESSIONAL-DOCS/
echo   - /docs/ (All guides and architecture)
echo.
echo Next Steps:
echo 1. Review src\server\services\_archive\ and delete if not needed
echo 2. Run: git add -A
echo 3. Run: git commit -m "Clean project structure, preserve all docs"
echo 4. Run: npm install (to ensure dependencies are correct)
echo 5. Start building with AI using AI-START-HERE.md!
echo.

pause