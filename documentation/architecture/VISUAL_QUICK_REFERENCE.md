# 🎯 MOOSH Wallet Visual Quick Reference
**Last Updated**: 2025-07-21
**Purpose**: Quick visual reference for AI to understand system at a glance

## 🏗️ System Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           MOOSH WALLET AT A GLANCE                              │
│                                                                                 │
│  Frontend (3333)                    API (3001)                  External        │
│  ┌─────────────┐                    ┌──────────┐               ┌─────────┐     │
│  │ Pure JS SPA │ ◄════ HTTP ═════► │ Express  │ ◄═══ HTTPS ══► │ Bitcoin │     │
│  │ 33K+ lines  │                    │ Services │                │ Network │     │
│  └─────────────┘                    └──────────┘                └─────────┘     │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 📁 File Structure Quick Map

```
MOOSH-WALLET/
│
├── public/js/
│   └── moosh-wallet.js          [33,000+ lines - MAIN APP]
│       ├── Lines 1-1000:        Core initialization
│       ├── Lines 1896-1922:     generateSparkWallet() ⚠️ CRITICAL
│       ├── Lines 3224-3261:     generateWallet() ⚠️ CRITICAL
│       ├── Lines 4319-4560:     AccountSwitcher
│       ├── Lines 13700-14500:   DashboardPage
│       ├── Lines 18564-19600:   MultiAccountModal
│       └── Lines 20267-20500:   TransactionHistoryModal
│
├── src/server/
│   ├── api-server.js            [API endpoints]
│   │   └── Line 126:            POST /api/spark/generate-wallet ⚠️
│   └── services/
│       ├── walletService.js     [Core wallet operations]
│       ├── sparkService.js      [Spark protocol]
│       └── networkService.js    [Blockchain interaction]
│
└── documentation/
    ├── CLAUDE.md               [⚠️ READ FIRST - Critical rules]
    └── components/             [Component documentation]
```

## 🔑 Critical Endpoints

```
┌────────────────────────────────────────────────────────────────┐
│                    NEVER CHANGE THESE                          │
├────────────────────────────────────────────────────────────────┤
│ POST /api/spark/generate-wallet     → Wallet generation       │
│ GET  /api/bitcoin/balance/:address  → Balance check          │
│ GET  /api/bitcoin/transactions      → TX history             │
│ POST /api/transaction/broadcast     → Send transaction       │
└────────────────────────────────────────────────────────────────┘
```

## 💡 Component Communication Pattern

```
         USER ACTION
              │
              ▼
    ┌─────────────────┐
    │   Component     │
    │  handleEvent()  │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐      ┌─────────────────┐
    │  StateManager   │ ───► │     Events      │
    │  setState()     │      │  emit/notify    │
    └─────────────────┘      └────────┬────────┘
                                      │
                            ┌─────────┴─────────┐
                            ▼                   ▼
                    ┌─────────────┐     ┌─────────────┐
                    │ Component A │     │ Component B │
                    │  update()   │     │  update()   │
                    └─────────────┘     └─────────────┘
```

## ⚡ Performance Targets

```
┌─────────────────────────────────────────────────────────────┐
│ Metric              │ Target    │ Current   │ Status        │
├─────────────────────┼───────────┼───────────┼───────────────┤
│ Page Load           │ < 3s      │ ~2.5s     │ ✅ GOOD       │
│ API Response        │ < 500ms   │ ~300ms    │ ✅ GOOD       │
│ Seed Generation     │ < 60s     │ 10-60s    │ ✅ NORMAL     │
│ Memory Usage        │ < 200MB   │ ~185MB    │ ✅ GOOD       │
│ Bundle Size         │ < 500KB   │ 1.4MB     │ ⚠️  NEEDS WORK│
└─────────────────────┴───────────┴───────────┴───────────────┘
```

## 🚨 Common Issues & Solutions

```
ISSUE                           SOLUTION
─────────────────────────────────────────────────────────────
Seed generation timeout    →    Increase timeout to 60s minimum
CORS errors               →    Use app.apiService.request()
Memory leaks              →    Add removeEventListener in cleanup
Math.random() in crypto   →    Use crypto.getRandomValues()
Direct DOM manipulation   →    Use ElementFactory methods
```

## 🔐 Security Checklist

```
CLIENT SIDE                     SERVER SIDE
□ No keys in localStorage       □ No key storage
□ Memory-only storage          □ Stateless design
□ Input validation             □ Rate limiting
□ XSS prevention               □ CORS configured
□ HTTPS only (prod)            □ Input sanitization
```

## 📝 Development Workflow

```
     START
       │
       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Run MCPs     │ ──► │ Make Changes │ ──► │ Test Again   │
│ npm test     │     │              │     │ npm test     │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                                  ▼
                                            ┌──────────────┐
                                            │ All Pass? ✓  │
                                            │ Commit       │
                                            └──────────────┘
```

## 🎯 Quick Commands

```bash
# Development
npm run dev              # Start both servers
npm test                 # Run TestSprite validation
npm run mcp:validate-all # Run all validations

# Testing specific
curl -X POST http://localhost:3001/api/spark/generate-wallet \
  -H "Content-Type: application/json" \
  -d '{"strength": 256}'

# Check logs
tail -f logs/api-server.log
```

## 📍 Line Number Quick Reference

```
Feature                 Location                    Lines
─────────────────────────────────────────────────────────
Core App               moosh-wallet.js             1-1000
Seed Generation        moosh-wallet.js             1896-1922, 3224-3261
Account Switcher       moosh-wallet.js             4319-4560
Balance Display        moosh-wallet.js             9114-9200
Dashboard              moosh-wallet.js             13700-14500
Multi-Account Modal    moosh-wallet.js             18564-19600
Transaction History    moosh-wallet.js             20267-20500
Footer                 moosh-wallet.js             31400-31424
API Endpoints          api-server.js               126 (critical)
```

---

**Use this quick reference for rapid understanding of MOOSH Wallet architecture and critical paths.**