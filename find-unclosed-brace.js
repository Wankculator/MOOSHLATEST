const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'js', 'moosh-wallet.js');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

let braceCount = 0;
let inString = false;
let stringChar = null;
let inComment = false;
let inMultiLineComment = false;

console.log('Searching for unclosed braces...\n');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let escaped = false;
    
    for (let j = 0; j < line.length; j++) {
        const char = line[j];
        const nextChar = line[j + 1];
        
        // Handle multi-line comments
        if (!inString && char === '/' && nextChar === '*') {
            inMultiLineComment = true;
            j++; // Skip next char
            continue;
        }
        if (inMultiLineComment && char === '*' && nextChar === '/') {
            inMultiLineComment = false;
            j++; // Skip next char
            continue;
        }
        
        // Handle single-line comments
        if (!inString && !inMultiLineComment && char === '/' && nextChar === '/') {
            break; // Rest of line is comment
        }
        
        // Skip if in comment
        if (inMultiLineComment) continue;
        
        // Handle strings
        if (!escaped && (char === '"' || char === "'" || char === '`')) {
            if (!inString) {
                inString = true;
                stringChar = char;
            } else if (char === stringChar) {
                inString = false;
                stringChar = null;
            }
        }
        
        // Count braces only outside strings
        if (!inString) {
            if (char === '{') {
                braceCount++;
                if (braceCount % 10 === 0 || braceCount < 20) {
                    console.log(`Line ${i + 1}: { (count: ${braceCount})`);
                }
            } else if (char === '}') {
                braceCount--;
                if (braceCount % 10 === 0 || braceCount < 20) {
                    console.log(`Line ${i + 1}: } (count: ${braceCount})`);
                }
                if (braceCount < 0) {
                    console.log(`\n❌ Extra closing brace at line ${i + 1}`);
                    console.log(`Context:`);
                    for (let k = Math.max(0, i - 2); k <= Math.min(lines.length - 1, i + 2); k++) {
                        console.log(`${k + 1}: ${lines[k]}`);
                    }
                    process.exit(1);
                }
            }
        }
        
        escaped = !escaped && char === '\\';
    }
}

console.log(`\nFinal brace count: ${braceCount}`);

if (braceCount > 0) {
    console.log(`\n❌ Missing ${braceCount} closing brace(s)`);
    console.log('\nSearching for potential locations...');
    
    // Look for patterns that might indicate where a brace is missing
    let functionCount = 0;
    for (let i = lines.length - 1; i >= Math.max(0, lines.length - 100); i--) {
        if (lines[i].includes('function') || lines[i].includes('=>')) {
            console.log(`Line ${i + 1}: ${lines[i].trim().substring(0, 60)}...`);
        }
    }
} else if (braceCount === 0) {
    console.log('\n✅ All braces are balanced!');
} else {
    console.log('\n❌ Too many closing braces!');
}