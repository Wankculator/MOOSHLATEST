#!/usr/bin/env node

/**
 * Comprehensive cleanup script for all extracted code in moosh-wallet.js
 * Handles various comment patterns and missing end markers
 */

const fs = require('fs');
const path = require('path');

const MAIN_FILE = path.join(__dirname, '..', 'public', 'js', 'moosh-wallet.js');
const BACKUP_FILE = path.join(__dirname, '..', 'public', 'js', 'moosh-wallet.js.backup-comprehensive-cleanup');

console.log('🧹 Starting comprehensive cleanup of extracted code...\n');

// Read the file
let content = fs.readFileSync(MAIN_FILE, 'utf8');
const lines = content.split('\n');
const originalSize = content.length;
const originalLineCount = lines.length;

// Create backup
fs.writeFileSync(BACKUP_FILE, content);
console.log(`✅ Created backup at: ${BACKUP_FILE}`);

// Track what we're removing
const removedSections = [];

// Find all extraction patterns
console.log('🔍 Searching for extracted code sections...\n');

// Pattern 1: Look for /* EXTRACTED TO MODULE or /* EXTRACTED TO MODULES
const extractionMarkers = [];
lines.forEach((line, index) => {
    if (line.includes('/* EXTRACTED TO MODULE')) {
        extractionMarkers.push({
            line: index + 1,
            content: line,
            type: 'EXTRACTED_TO_MODULE'
        });
    }
});

// Find sections to remove
const sectionsToRemove = [];

// 1. Find WalletDetailsPage end
const walletDetailsEnd = lines.findIndex(line => line.includes('END OF EXTRACTED WalletDetailsPage MODULE'));
if (walletDetailsEnd !== -1) {
    // Search backwards for the start
    let walletDetailsStart = walletDetailsEnd;
    for (let i = walletDetailsEnd - 1; i >= 0; i--) {
        if (lines[i].includes('class WalletDetailsPage') || lines[i].includes('EXTRACTED TO MODULE')) {
            walletDetailsStart = i;
            break;
        }
    }
    
    // Look even further back for the comment start
    for (let i = walletDetailsStart - 1; i >= Math.max(0, walletDetailsStart - 10); i--) {
        if (lines[i].includes('/*')) {
            walletDetailsStart = i;
            break;
        }
    }
    
    sectionsToRemove.push({
        start: walletDetailsStart,
        end: walletDetailsEnd,
        name: 'WalletDetailsPage',
        lines: walletDetailsEnd - walletDetailsStart + 1
    });
}

// 2. Find AccountListModal section
const accountListStart = lines.findIndex(line => line.includes('/* EXTRACTED TO MODULE - Load from modules/modals/AccountListModal.js'));
if (accountListStart !== -1) {
    // Find the end - look for closing */ or next extraction marker
    let accountListEnd = accountListStart;
    for (let i = accountListStart + 1; i < lines.length; i++) {
        if (lines[i].includes('*/ // End of') || lines[i].includes('END OF EXTRACTED')) {
            accountListEnd = i;
            break;
        }
        // Also check for next extraction marker
        if (i > accountListStart + 10 && lines[i].includes('/* EXTRACTED TO MODULE')) {
            accountListEnd = i - 1;
            break;
        }
    }
    
    sectionsToRemove.push({
        start: accountListStart,
        end: accountListEnd,
        name: 'AccountListModal',
        lines: accountListEnd - accountListStart + 1
    });
}

// 3. Find SwapModal section
const swapModalStart = lines.findIndex(line => line.includes('/* EXTRACTED TO MODULES - SwapModal'));
if (swapModalStart !== -1) {
    // Find the closing */
    let swapModalEnd = swapModalStart;
    for (let i = swapModalStart + 1; i < lines.length; i++) {
        if (lines[i].trim() === '*/') {
            swapModalEnd = i;
            break;
        }
    }
    
    sectionsToRemove.push({
        start: swapModalStart,
        end: swapModalEnd,
        name: 'SwapModal',
        lines: swapModalEnd - swapModalStart + 1
    });
}

// 4. Find WalletSettingsModal section
const walletSettingsStart = lines.findIndex(line => line.includes('/* EXTRACTED TO MODULES - WalletSettingsModal'));
if (walletSettingsStart !== -1) {
    // This might go to end of file
    let walletSettingsEnd = lines.length - 1;
    
    // Look for closing */ before end of file
    for (let i = walletSettingsStart + 1; i < lines.length; i++) {
        if (lines[i].trim() === '*/') {
            walletSettingsEnd = i;
            break;
        }
    }
    
    sectionsToRemove.push({
        start: walletSettingsStart,
        end: walletSettingsEnd,
        name: 'WalletSettingsModal',
        lines: walletSettingsEnd - walletSettingsStart + 1
    });
}

// Sort sections by start line (descending) to remove from bottom to top
sectionsToRemove.sort((a, b) => b.start - a.start);

console.log('📋 Found sections to remove:');
sectionsToRemove.forEach(section => {
    console.log(`   - ${section.name}: Lines ${section.start + 1}-${section.end + 1} (${section.lines} lines)`);
});

// Remove sections
sectionsToRemove.forEach(section => {
    lines.splice(section.start, section.end - section.start + 1);
    removedSections.push({
        name: section.name,
        lines: section.lines
    });
});

// Also remove standalone MOVED TO comments
let removedStandaloneComments = 0;
for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].match(/^\s*\/\/.*MOVED TO modules\//)) {
        lines.splice(i, 1);
        removedStandaloneComments++;
    }
}

// Join lines back
content = lines.join('\n');

// Clean up multiple empty lines
content = content.replace(/\n{3,}/g, '\n\n');

// Remove trailing whitespace
content = content.replace(/[ \t]+$/gm, '');

// Write the cleaned file
fs.writeFileSync(MAIN_FILE, content);

// Calculate results
const newSize = content.length;
const newLineCount = content.split('\n').length;
const sizeReduction = ((originalSize - newSize) / originalSize * 100).toFixed(1);
const linesRemoved = originalLineCount - newLineCount;

// Display results
console.log('\n📊 Cleanup Results:');
console.log('═══════════════════════════════════════════════════════════');
console.log(`Original file: ${(originalSize / 1024).toFixed(1)} KB (${originalLineCount.toLocaleString()} lines)`);
console.log(`Cleaned file:  ${(newSize / 1024).toFixed(1)} KB (${newLineCount.toLocaleString()} lines)`);
console.log(`Reduction:     ${sizeReduction}% (${linesRemoved.toLocaleString()} lines removed)`);

console.log('\n🗑️  Removed Sections:');
removedSections.forEach(section => {
    console.log(`   ✓ ${section.name} (${section.lines.toLocaleString()} lines)`);
});

if (removedStandaloneComments > 0) {
    console.log(`   ✓ ${removedStandaloneComments} standalone MOVED TO comments`);
}

console.log('\n✅ Cleanup complete!');
console.log(`💾 Backup saved as: ${path.basename(BACKUP_FILE)}`);
console.log('\n⚡ Next steps:');
console.log('   1. Run TestSprite validation: npm test');
console.log('   2. Check functionality in browser');
console.log('   3. Run full MCP validation: npm run mcp:validate-all');