Write-Host "Starting MOOSH Wallet Server..." -ForegroundColor Green
Set-Location $PSScriptRoot
node src\server\server.js