// Script to clean up moosh-wallet.js by removing duplicate classes
const fs = require('fs');
const path = require('path');

const sourceFile = path.join(__dirname, '../public/js/moosh-wallet.js');
let content = fs.readFileSync(sourceFile, 'utf8');

// Classes that should be removed (already extracted to modules)
const classesToRemove = [
    'ElementFactory',
    'ResponsiveUtils', 
    'ComplianceUtils',
    'StyleManager',
    'SecureStorage',
    'StateManager',
    'APIService',
    'Terminal',
    'Button',
    'HomePage',
    'TokenMenuModal',
    'OrdinalsTerminalModal'
];

// Function to remove a class definition
function removeClass(content, className) {
    // Find class start
    const classRegex = new RegExp(`\\s*class ${className}[\\s\\S]*?\\n    \\}(?=\\n\\n|\\n    class|\\n    \\/\\/|$)`, 'g');
    const match = classRegex.exec(content);
    
    if (match) {
        console.log(`Removing class ${className} (${match[0].length} chars)`);
        content = content.replace(match[0], '');
    }
    
    return content;
}

// Remove each class
classesToRemove.forEach(className => {
    content = removeClass(content, className);
});

// Remove any commented out class definitions
content = content.replace(/\/\*[\s\S]*?class[\s\S]*?\*\//g, '');

// Clean up extra newlines
content = content.replace(/\n{4,}/g, '\n\n\n');

// Add module loading section if not present
if (!content.includes('MODULE LOADING SECTION')) {
    const moduleSection = `
    // ═══════════════════════════════════════════════════════════════════════
    // MODULE LOADING SECTION
    // ═══════════════════════════════════════════════════════════════════════
    // All core modules are loaded from separate files in index.html:
    // 
    // Core Modules:
    // - /js/modules/core/element-factory.js
    // - /js/modules/core/responsive-utils.js
    // - /js/modules/core/compliance-utils.js
    // - /js/modules/core/style-manager.js
    // - /js/modules/core/secure-storage.js
    // - /js/modules/core/state-manager.js
    // - /js/modules/core/api-service.js
    // - /js/modules/core/router.js
    // - /js/modules/core/component.js
    //
    // UI Components:
    // - /js/modules/ui/terminal.js
    // - /js/modules/ui/button.js
    // - /js/modules/ui/header.js
    //
    // Page Components:
    // - /js/modules/pages/home-page.js
    // - /js/modules/pages/dashboard-page.js
    // - /js/modules/pages/generate-seed-page.js
    // - /js/modules/pages/confirm-seed-page.js
    // - /js/modules/pages/import-seed-page.js
    // - /js/modules/pages/wallet-created-page.js
    // - /js/modules/pages/wallet-imported-page.js
    // - /js/modules/pages/wallet-details-page.js
    //
    // Modals:
    // - /js/modules/modals/modal-base.js
    // - /js/modules/modals/send-modal.js
    // - /js/modules/modals/receive-modal.js
    // - /js/modules/modals/ordinals-modal.js
    // - /js/modules/modals/ordinals-terminal-modal.js
    // - /js/modules/modals/token-menu-modal.js
    //
    // Spark Protocol:
    // - /js/modules/spark/spark-state-manager.js
    // - /js/modules/spark/spark-bitcoin-manager.js
    // - /js/modules/spark/spark-lightning-manager.js
    // - /js/modules/spark/spark-wallet-manager.js
    //
    // Features:
    // - /js/modules/features/ordinals-manager.js
    // - /js/modules/features/wallet-manager.js
    // - /js/modules/features/wallet-detector.js

`;
    
    // Insert after the initial IIFE opening
    const insertPoint = content.indexOf('(function(window) {');
    if (insertPoint !== -1) {
        const afterIIFE = content.indexOf('\n', insertPoint) + 1;
        content = content.substring(0, afterIIFE) + moduleSection + content.substring(afterIIFE);
    }
}

// Write the cleaned up file
fs.writeFileSync(sourceFile, content, 'utf8');

// Report results
const originalSize = fs.readFileSync(sourceFile + '.backup-before-cleanup', 'utf8').length;
const newSize = content.length;
const reduction = originalSize - newSize;
const percentReduction = ((reduction / originalSize) * 100).toFixed(2);

console.log('\\n✅ Cleanup complete!');
console.log(`📊 File size: ${originalSize} → ${newSize} bytes`);
console.log(`📉 Reduction: ${reduction} bytes (${percentReduction}%)`);
console.log(`📝 Lines: ${content.split('\\n').length}`);

// Create backup
fs.writeFileSync(sourceFile + '.backup-before-cleanup', fs.readFileSync(sourceFile, 'utf8'));
console.log('\\n💾 Backup created: moosh-wallet.js.backup-before-cleanup');