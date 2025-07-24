@echo off
echo 🚀 Starting MOOSH Wallet with Spark Protocol Integration...
echo.

cd src\server

if not exist node_modules (
    echo 📦 Installing dependencies...
    call npm install
)

echo ✨ Starting Spark-enabled API server on port 3001...
echo.
echo 📍 API Endpoints:
echo    - http://localhost:3001 (Web Interface)
echo    - http://localhost:3001/api/spark/generate (Generate Wallet)
echo    - http://localhost:3001/api/spark/import (Import Wallet)
echo.
echo 🔒 Your wallet will generate REAL Spark addresses (sp1...)
echo.

node server-api.js