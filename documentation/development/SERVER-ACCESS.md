# MOOSH Wallet - Server Access URLs

**Status**: Both servers are running successfully!

## Access URLs:

### 1. Main Wallet UI
**URL**: http://localhost:8080/public/index.html
- This is the main wallet interface
- Full drag & drop functionality
- Account management with colors
- All Phase 2 features

### 2. Test Pages
**Manual Test Checklist**: http://localhost:8080/test-manual-verification.html
- 30-point verification checklist
- Saves progress automatically

**Drag & Drop Test**: http://localhost:8080/test-drag-drop.html
- Isolated drag & drop testing
- Visual feedback verification

**Full Simulation**: http://localhost:8080/test-full-simulation.html
- Automated test suite
- Performance metrics

### 3. API Server
**Base URL**: http://localhost:3001
**Status**: Running on port 3001

Available endpoints:
- POST /api/wallet/generate
- POST /api/wallet/import
- POST /api/wallet/validate
- POST /api/wallet/detect
- POST /api/wallet/test-paths
- POST /api/spark/generate
- POST /api/ordinals/inscriptions

## Quick Test Commands:

Test API health:
```bash
curl http://localhost:3001/api/wallet/validate -X POST -H "Content-Type: application/json" -d '{}'
```

## Server PIDs:
- UI Server (Python): PID 2265
- API Server (Node): PID 2422

## To Stop Servers:
```bash
# Stop UI server
kill 2265

# Stop API server
kill 2422
```

---

Ready for testing! Open http://localhost:8080/public/index.html in your browser.