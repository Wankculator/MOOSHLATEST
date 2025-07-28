// Script to extract Spark classes from moosh-wallet.js
const fs = require('fs');
const path = require('path');

const sourceFile = path.join(__dirname, '../public/js/moosh-wallet.js');
const content = fs.readFileSync(sourceFile, 'utf8');

// Find the start and end of Spark classes
const sparkStart = content.indexOf('class SparkStateManager {');
const sparkEnd = content.indexOf('class HomePage extends Component {');

if (sparkStart === -1 || sparkEnd === -1) {
    console.error('Could not find Spark classes boundaries');
    process.exit(1);
}

// Extract everything before Spark classes
const beforeSpark = content.substring(0, sparkStart);

// Extract everything after Spark classes
const afterSpark = content.substring(sparkEnd);

// Add imports for Spark modules
const sparkImports = `
    // ═══════════════════════════════════════════════════════════════════════
    // SPARK PROTOCOL MODULES - Loaded from separate files
    // ═══════════════════════════════════════════════════════════════════════
    // These are loaded in index.html:
    // - /public/js/modules/spark/spark-state-manager.js
    // - /public/js/modules/spark/spark-bitcoin-manager.js
    // - /public/js/modules/spark/spark-lightning-manager.js
    // - /public/js/modules/spark/spark-wallet-manager.js

`;

// Combine the parts
const newContent = beforeSpark + sparkImports + afterSpark;

// Write the updated file
fs.writeFileSync(sourceFile, newContent, 'utf8');

console.log('✅ Successfully extracted Spark classes');
console.log('📊 File size reduced by:', content.length - newContent.length, 'bytes');

// Update index.html to include the new modules
const indexPath = path.join(__dirname, '../public/index.html');
const indexContent = fs.readFileSync(indexPath, 'utf8');

// Find where to insert the new script tags
const insertPoint = indexContent.indexOf('<!-- Modals -->');

if (insertPoint !== -1) {
    const sparkScripts = `    <!-- Spark Protocol Modules -->
    <script src="js/modules/spark/spark-state-manager.js"></script>
    <script src="js/modules/spark/spark-bitcoin-manager.js"></script>
    <script src="js/modules/spark/spark-lightning-manager.js"></script>
    <script src="js/modules/spark/spark-wallet-manager.js"></script>

    `;
    
    const newIndexContent = indexContent.substring(0, insertPoint) + sparkScripts + indexContent.substring(insertPoint);
    fs.writeFileSync(indexPath, newIndexContent, 'utf8');
    console.log('✅ Updated index.html with Spark module imports');
}