#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning up extracted code from moosh-wallet.js...\n');

const filePath = path.join(__dirname, '..', 'public', 'js', 'moosh-wallet.js');

// Read the file
const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

// Define the ranges to remove (in reverse order to maintain line numbers)
const rangesToRemove = [
    { name: 'DashboardPage', start: 26809, end: 31509 },
    { name: 'ReceivePaymentModal', start: 26513, end: 26804 },
    { name: 'SendPaymentModal', start: 26375, end: 26508 },
    { name: 'PasswordModal', start: 25996, end: 26370 },
    { name: 'WalletSettingsModal', start: 24869, end: 25991 },
    { name: 'SwapModal', start: 23408, end: 24864 },
    { name: 'OrdinalsTerminalModal', start: 22911, end: 23403 },
    { name: 'OrdinalsModal', start: 21117, end: 22906 },
    { name: 'TokenMenuModal', start: 20842, end: 21112 },
    { name: 'TransactionHistoryModal', start: 20461, end: 20840 },
    { name: 'AccountListModal', start: 18382, end: 20459 },
    { name: 'MultiAccountModal', start: 16274, end: 18378 },
    { name: 'WalletDetailsPage', start: 13060, end: 16268 },
    { name: 'WalletCreatedPage', start: 8934, end: 11651 }
];

let totalLinesRemoved = 0;

// Process each range
rangesToRemove.forEach(range => {
    // Adjust for 0-based indexing
    const startIdx = range.start - 1;
    const endIdx = range.end;
    const linesToRemove = endIdx - startIdx;
    
    console.log(`📦 Removing ${range.name}: Lines ${range.start}-${range.end} (${linesToRemove} lines)`);
    
    // Remove the lines
    lines.splice(startIdx - totalLinesRemoved, linesToRemove);
    totalLinesRemoved += linesToRemove;
});

// Write the cleaned content back
const cleanedContent = lines.join('\n');
fs.writeFileSync(filePath, cleanedContent);

// Calculate stats
const originalSize = content.length;
const newSize = cleanedContent.length;
const reduction = originalSize - newSize;
const percentReduction = ((reduction / originalSize) * 100).toFixed(1);

console.log('\n✅ Cleanup complete!');
console.log(`📊 Statistics:`);
console.log(`   - Original size: ${(originalSize / 1024).toFixed(1)} KB`);
console.log(`   - New size: ${(newSize / 1024).toFixed(1)} KB`);
console.log(`   - Removed: ${(reduction / 1024).toFixed(1)} KB (${percentReduction}%)`);
console.log(`   - Total lines removed: ${totalLinesRemoved}`);