#!/usr/bin/env node

/**
 * Script to remove commented extracted code from moosh-wallet.js
 * This will clean up the main file by removing all code that has been
 * successfully extracted to modules.
 */

const fs = require('fs');
const path = require('path');

const MAIN_FILE = path.join(__dirname, '..', 'public', 'js', 'moosh-wallet.js');
const BACKUP_FILE = path.join(__dirname, '..', 'public', 'js', 'moosh-wallet.js.backup-before-comment-removal');

console.log('🧹 Starting cleanup of extracted code comments...\n');

// Read the file
let content = fs.readFileSync(MAIN_FILE, 'utf8');
const originalSize = content.length;
const originalLines = content.split('\n').length;

// Create backup
fs.writeFileSync(BACKUP_FILE, content);
console.log(`✅ Created backup at: ${BACKUP_FILE}`);

// Track what we're removing
const removedSections = [];

// Find and remove each extracted section
// Pattern: /* EXTRACTED TO MODULE ... (content) ... */ // END OF EXTRACTED
const extractedSections = [];
let currentPos = 0;

while (true) {
    // Find start of extracted section
    const startMatch = content.indexOf('/* EXTRACTED TO MODULE', currentPos);
    if (startMatch === -1) break;
    
    // Find module name
    const moduleLineEnd = content.indexOf('\n', startMatch);
    const moduleLine = content.substring(startMatch, moduleLineEnd);
    const moduleMatch = moduleLine.match(/Load from ([^\s]+)/);
    const moduleName = moduleMatch ? moduleMatch[1] : 'Unknown';
    
    // Find end of extracted section
    const endPattern = '*/ // END OF EXTRACTED';
    const endMatch = content.indexOf(endPattern, startMatch);
    if (endMatch === -1) {
        console.warn(`⚠️  Warning: No end marker found for ${moduleName}`);
        currentPos = startMatch + 1;
        continue;
    }
    
    // Calculate section info
    const sectionEnd = endMatch + endPattern.length;
    const section = content.substring(startMatch, sectionEnd);
    const lines = section.split('\n').length;
    
    extractedSections.push({
        start: startMatch,
        end: sectionEnd,
        moduleName,
        lines
    });
    
    removedSections.push({ moduleName, lines });
    currentPos = sectionEnd;
}

// Remove sections in reverse order to preserve positions
extractedSections.reverse().forEach(section => {
    // Find the line start before the comment
    let lineStart = section.start;
    while (lineStart > 0 && content[lineStart - 1] !== '\n') {
        lineStart--;
    }
    
    // Find the line end after the comment
    let lineEnd = section.end;
    while (lineEnd < content.length && content[lineEnd] !== '\n') {
        lineEnd++;
    }
    if (lineEnd < content.length) lineEnd++; // Include the newline
    
    content = content.substring(0, lineStart) + content.substring(lineEnd);
});

// Also remove any standalone MOVED TO comments
content = content.replace(/^\s*\/\/.*MOVED TO modules\/.*$/gm, '');

// Clean up multiple empty lines (replace 3+ newlines with 2)
content = content.replace(/\n{3,}/g, '\n\n');

// Remove trailing whitespace
content = content.replace(/[ \t]+$/gm, '');

// Write the cleaned file
fs.writeFileSync(MAIN_FILE, content);

// Calculate results
const newSize = content.length;
const newLines = content.split('\n').length;
const sizeReduction = ((originalSize - newSize) / originalSize * 100).toFixed(1);
const linesRemoved = originalLines - newLines;

// Display results
console.log('\n📊 Cleanup Results:');
console.log('═══════════════════════════════════════════════════════════');
console.log(`Original file: ${(originalSize / 1024).toFixed(1)} KB (${originalLines.toLocaleString()} lines)`);
console.log(`Cleaned file:  ${(newSize / 1024).toFixed(1)} KB (${newLines.toLocaleString()} lines)`);
console.log(`Reduction:     ${sizeReduction}% (${linesRemoved.toLocaleString()} lines removed)`);

if (removedSections.length > 0) {
    console.log('\n🗑️  Removed Sections:');
    removedSections.forEach(section => {
        console.log(`   - ${section.moduleName} (${section.lines.toLocaleString()} lines)`);
    });
}

console.log('\n✅ Cleanup complete!');
console.log(`💾 Backup saved as: ${path.basename(BACKUP_FILE)}`);
console.log('\n⚡ Next step: Run validation to ensure everything still works');
console.log('   npm test');