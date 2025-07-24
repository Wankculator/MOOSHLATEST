@echo off
REM MOOSH Wallet - Complete Documentation Organization Script
REM This will organize ALL scattered MD files into a clean structure

echo.
echo ==========================================
echo MOOSH Wallet Documentation Organization
echo ==========================================
echo.

if not exist "package.json" (
    echo ERROR: Run from MOOSH Wallet root directory
    exit /b 1
)

echo This will organize ALL documentation into:
echo.
echo docs/
echo ├── 00-START-HERE/     (AI guides, quick start)
echo ├── 01-architecture/   (System design, blueprints)
echo ├── 02-development/    (Guides, workflows)
echo ├── 03-api/           (API documentation)
echo ├── 04-components/    (Component docs)
echo ├── 05-deployment/    (Deploy, emergency)
echo ├── 06-business/      (Rules, compliance)
echo ├── 07-testing/       (Test guides)
echo └── archive/          (Old versions)
echo.
echo Root will only have: README, CHANGELOG, CONTRIBUTING, etc.
echo.
set /p "confirm=Continue? (Y/N): "
if /i not "%confirm%"=="Y" (
    echo Cancelled
    exit /b 1
)

echo.
echo Creating organized structure...
echo.

REM Create new organized structure
mkdir "docs\00-START-HERE" 2>nul
mkdir "docs\01-architecture" 2>nul
mkdir "docs\02-development" 2>nul
mkdir "docs\03-api" 2>nul
mkdir "docs\04-components" 2>nul
mkdir "docs\05-deployment" 2>nul
mkdir "docs\06-business" 2>nul
mkdir "docs\07-testing" 2>nul
mkdir "docs\archive" 2>nul
mkdir "docs\archive\old-systems" 2>nul

echo [1/10] Moving AI/Start documentation...
REM Primary AI guides to START-HERE
if exist "AI-START-HERE.md" move "AI-START-HERE.md" "docs\00-START-HERE\" >nul 2>&1
if exist "CLAUDE.md" move "CLAUDE.md" "docs\00-START-HERE\" >nul 2>&1
if exist "docs\AI_DEVELOPMENT_GUIDELINES.md" move "docs\AI_DEVELOPMENT_GUIDELINES.md" "docs\00-START-HERE\" >nul 2>&1

REM Keep best version of master prompt
if exist "MASTER_PROMPT_IMPROVED.md" (
    move "MASTER_PROMPT_IMPROVED.md" "docs\00-START-HERE\MASTER_PROMPT.md" >nul 2>&1
    if exist "MASTER_PROMPT.md" move "MASTER_PROMPT.md" "docs\archive\" >nul 2>&1
) else (
    if exist "MASTER_PROMPT.md" move "MASTER_PROMPT.md" "docs\00-START-HERE\" >nul 2>&1
)

echo [2/10] Moving architecture documentation...
if exist "WALLET_ARCHITECTURE.md" move "WALLET_ARCHITECTURE.md" "docs\01-architecture\" >nul 2>&1
if exist "docs\MODULE_STRUCTURE.md" move "docs\MODULE_STRUCTURE.md" "docs\01-architecture\" >nul 2>&1
if exist "docs\FOLDER_STRUCTURE.md" move "docs\FOLDER_STRUCTURE.md" "docs\01-architecture\" >nul 2>&1
if exist "MOOSH-WALLET-PROFESSIONAL-DOCS\COMPLETE-ARCHITECTURE-BLUEPRINT.md" (
    copy "MOOSH-WALLET-PROFESSIONAL-DOCS\COMPLETE-ARCHITECTURE-BLUEPRINT.md" "docs\01-architecture\" >nul 2>&1
)

REM Remove duplicate PROJECT_STRUCTURE.md
if exist "PROJECT_STRUCTURE.md" move "PROJECT_STRUCTURE.md" "docs\archive\" >nul 2>&1

echo [3/10] Moving development guides...
if exist "DEVELOPMENT-WORKFLOWS.md" move "DEVELOPMENT-WORKFLOWS.md" "docs\02-development\" >nul 2>&1
if exist "MOOSH_BEST_PRACTICES.md" move "MOOSH_BEST_PRACTICES.md" "docs\02-development\" >nul 2>&1
if exist "PROFESSIONALIZATION_TODO.md" move "PROFESSIONALIZATION_TODO.md" "docs\02-development\" >nul 2>&1
if exist "docs\DEVELOPER_GUIDE.md" move "docs\DEVELOPER_GUIDE.md" "docs\02-development\" >nul 2>&1
if exist "MCP_AND_RESOURCES_GUIDE.md" move "MCP_AND_RESOURCES_GUIDE.md" "docs\02-development\" >nul 2>&1

REM Move all implementation guides
if exist "docs\COMPLETE_WALLET_IMPLEMENTATION_GUIDE.md" move "docs\COMPLETE_WALLET_IMPLEMENTATION_GUIDE.md" "docs\02-development\" >nul 2>&1
if exist "docs\SEED_GENERATION_IMPLEMENTATION_GUIDE.md" move "docs\SEED_GENERATION_IMPLEMENTATION_GUIDE.md" "docs\02-development\" >nul 2>&1

echo [4/10] Moving API documentation...
if exist "docs\api" xcopy /s /q "docs\api\*" "docs\03-api\" >nul 2>&1

echo [5/10] Moving component documentation...
REM Copy from knowledge base
if exist "MOOSH-WALLET-KNOWLEDGE-BASE\CODE-DNA" (
    xcopy /s /q "MOOSH-WALLET-KNOWLEDGE-BASE\CODE-DNA\*" "docs\04-components\" >nul 2>&1
)

echo [6/10] Moving deployment documentation...
if exist "EMERGENCY-RECOVERY.md" move "EMERGENCY-RECOVERY.md" "docs\05-deployment\" >nul 2>&1
if exist "MOOSH-WALLET-PROFESSIONAL-DOCS\DEPLOYMENT-GUIDE.md" (
    copy "MOOSH-WALLET-PROFESSIONAL-DOCS\DEPLOYMENT-GUIDE.md" "docs\05-deployment\" >nul 2>&1
)
if exist "docs\handoff" xcopy /s /q "docs\handoff\*" "docs\05-deployment\handoff\" >nul 2>&1

echo [7/10] Moving business documentation...
if exist "BUSINESS-LOGIC-RULES.md" move "BUSINESS-LOGIC-RULES.md" "docs\06-business\" >nul 2>&1
if exist "PRODUCT_REQUIREMENTS_DOCUMENT.md" move "PRODUCT_REQUIREMENTS_DOCUMENT.md" "docs\06-business\" >nul 2>&1

echo [8/10] Moving test documentation...
if exist "MOOSH-WALLET-PROFESSIONAL-DOCS\TESTING-FRAMEWORK.md" (
    copy "MOOSH-WALLET-PROFESSIONAL-DOCS\TESTING-FRAMEWORK.md" "docs\07-testing\" >nul 2>&1
)
if exist "docs\reports" xcopy /s /q "docs\reports\*" "docs\07-testing\reports\" >nul 2>&1

echo [9/10] Archiving old documentation systems...
if exist "MOOSH-WALLET-ENTERPRISE-DOCS" move "MOOSH-WALLET-ENTERPRISE-DOCS" "docs\archive\old-systems\" >nul 2>&1
if exist "MOOSH-WALLET-KNOWLEDGE-BASE" move "MOOSH-WALLET-KNOWLEDGE-BASE" "docs\archive\old-systems\" >nul 2>&1
if exist "MOOSH-WALLET-NEXT-GEN-DOCS" move "MOOSH-WALLET-NEXT-GEN-DOCS" "docs\archive\old-systems\" >nul 2>&1
if exist "MOOSH-WALLET-PROFESSIONAL-DOCS" move "MOOSH-WALLET-PROFESSIONAL-DOCS" "docs\archive\old-systems\" >nul 2>&1

echo [10/10] Moving remaining docs...
if exist "ORDINALS_PERFORMANCE_FIX_SUMMARY.md" move "ORDINALS_PERFORMANCE_FIX_SUMMARY.md" "docs\02-development\" >nul 2>&1
if exist "DOCUMENTATION-CONSOLIDATION-PLAN.md" move "DOCUMENTATION-CONSOLIDATION-PLAN.md" "docs\archive\" >nul 2>&1

REM Clean up empty README files
if exist "examples\README.md" del "examples\README.md" >nul 2>&1
if exist "public\images\README.md" del "public\images\README.md" >nul 2>&1
if exist "scripts\README.md" del "scripts\README.md" >nul 2>&1

echo.
echo Creating master index...

REM Create new master documentation index
echo # 📚 MOOSH Wallet Documentation > "docs\README.md"
echo. >> "docs\README.md"
echo ## 🚀 Quick Start >> "docs\README.md"
echo - **[AI Development Start Here](00-START-HERE/AI-START-HERE.md)** - Start here if using AI >> "docs\README.md"
echo - **[Claude Quick Reference](00-START-HERE/CLAUDE.md)** - Quick context for Claude >> "docs\README.md"
echo - **[Master Prompt](00-START-HERE/MASTER_PROMPT.md)** - Comprehensive AI guide >> "docs\README.md"
echo. >> "docs\README.md"
echo ## 📁 Documentation Structure >> "docs\README.md"
echo. >> "docs\README.md"
echo ### 00-START-HERE/ >> "docs\README.md"
echo Essential starting points and AI development guides >> "docs\README.md"
echo. >> "docs\README.md"
echo ### 01-architecture/ >> "docs\README.md"
echo System design, blueprints, and architecture decisions >> "docs\README.md"
echo. >> "docs\README.md"
echo ### 02-development/ >> "docs\README.md"
echo Development guides, workflows, and implementation details >> "docs\README.md"
echo. >> "docs\README.md"
echo ### 03-api/ >> "docs\README.md"
echo API documentation and endpoint references >> "docs\README.md"
echo. >> "docs\README.md"
echo ### 04-components/ >> "docs\README.md"
echo Component-level documentation and patterns >> "docs\README.md"
echo. >> "docs\README.md"
echo ### 05-deployment/ >> "docs\README.md"
echo Deployment guides and emergency procedures >> "docs\README.md"
echo. >> "docs\README.md"
echo ### 06-business/ >> "docs\README.md"
echo Business logic, rules, and requirements >> "docs\README.md"
echo. >> "docs\README.md"
echo ### 07-testing/ >> "docs\README.md"
echo Testing framework and test documentation >> "docs\README.md"

echo.
echo ==========================================
echo Organization Complete!
echo ==========================================
echo.
echo ✅ All documentation now organized in /docs
echo ✅ Root directory cleaned up
echo ✅ Old systems archived in docs/archive/old-systems
echo ✅ Master index created at docs/README.md
echo.
echo Root now contains only:
dir /b *.md
echo.
echo Next steps:
echo 1. Review docs/README.md for the new structure
echo 2. Delete docs/archive if not needed
echo 3. Run CLEANUP-PRESERVE-DOCS.bat to clean other files
echo 4. Commit: git add -A && git commit -m "Organize all documentation"
echo.

pause