#!/usr/bin/env node

/**
 * Bundle Optimization Script for MOOSH Wallet
 * Analyzes and optimizes JavaScript bundle size and performance
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// Configuration
const config = {
    modulesDir: path.join(__dirname, '../public/js/modules'),
    outputDir: path.join(__dirname, '../public/js/optimized'),
    targetSizeKB: 50, // Target size for each module
    enableMinification: true,
    enableTreeShaking: true,
    enableCodeSplitting: true,
    enableLazyLoading: true
};

// Optimization strategies
const optimizations = {
    // Remove console.log statements in production
    removeConsoleLogs: (code) => {
        return code.replace(/console\.(log|debug|info|warn)\([^)]*\);?/g, '');
    },

    // Remove excessive whitespace and comments
    minifyWhitespace: (code) => {
        // Remove multi-line comments
        code = code.replace(/\/\*[\s\S]*?\*\//g, '');
        // Remove single-line comments (but preserve important ones)
        code = code.replace(/\/\/(?!.*@preserve|.*@license|.*eslint).*$/gm, '');
        // Remove excessive whitespace
        code = code.replace(/\s+/g, ' ');
        // Remove whitespace around operators
        code = code.replace(/\s*([=+\-*/<>!&|,;:{}()[\]])\s*/g, '$1');
        return code.trim();
    },

    // Extract and consolidate duplicate code
    extractCommonCode: (code) => {
        const patterns = {
            // Common error handling pattern
            errorHandler: /catch\s*\((?:error|e)\)\s*{\s*console\.error\([^}]+}/g,
            // Common validation patterns
            validation: /if\s*\(![\w.]+\)\s*{\s*(?:return|throw)[^}]+}/g,
            // Common DOM queries
            domQueries: /document\.(?:getElementById|querySelector)\(['"]\w+['"]\)/g
        };

        const extracted = new Map();
        
        // Extract patterns
        for (const [name, pattern] of Object.entries(patterns)) {
            const matches = code.match(pattern) || [];
            if (matches.length > 2) { // Only extract if pattern appears more than twice
                extracted.set(name, matches);
            }
        }

        return { code, extracted };
    },

    // Convert large static arrays/objects to lazy-loaded modules
    extractStaticData: (code) => {
        const largeArrayPattern = /const\s+\w+\s*=\s*\[[^\]]{1000,}\]/g;
        const largeObjectPattern = /const\s+\w+\s*=\s*\{[^}]{1000,}\}/g;
        
        const staticData = [];
        
        // Extract large arrays
        code = code.replace(largeArrayPattern, (match) => {
            const varName = match.match(/const\s+(\w+)/)[1];
            staticData.push({ name: varName, data: match });
            return `const ${varName} = await import('./static/${varName}.js').then(m => m.default);`;
        });
        
        // Extract large objects
        code = code.replace(largeObjectPattern, (match) => {
            const varName = match.match(/const\s+(\w+)/)[1];
            staticData.push({ name: varName, data: match });
            return `const ${varName} = await import('./static/${varName}.js').then(m => m.default);`;
        });
        
        return { code, staticData };
    },

    // Implement lazy loading for heavy components
    addLazyLoading: (code, moduleName) => {
        const heavyImports = [
            'OrdinalsModal',
            'SwapModal',
            'TransactionHistoryModal',
            'AccountListModal'
        ];

        if (heavyImports.includes(moduleName)) {
            // Wrap in lazy loading function
            return `
// Lazy-loaded module: ${moduleName}
export default function load${moduleName}() {
    return new Promise((resolve) => {
        ${code}
        resolve(${moduleName});
    });
}
`;
        }
        return code;
    },

    // Debounce frequently called functions
    addDebouncing: (code) => {
        // Find functions that might benefit from debouncing
        const apiCallPattern = /async\s+function\s+(\w*(?:fetch|load|update|refresh)\w*)\s*\(/g;
        const matches = [...code.matchAll(apiCallPattern)];
        
        for (const match of matches) {
            const funcName = match[1];
            const debouncedName = `debounced${funcName.charAt(0).toUpperCase() + funcName.slice(1)}`;
            
            // Add debounced version
            code = code.replace(
                new RegExp(`(${funcName}\\s*\\()`, 'g'),
                `${debouncedName}(`
            );
            
            // Add debounce wrapper
            code = `
const ${debouncedName} = debounce(${funcName}, 300);
${code}`;
        }
        
        return code;
    },

    // Optimize event listeners
    optimizeEventListeners: (code) => {
        // Convert multiple addEventListener calls to event delegation
        const listenerPattern = /(\w+)\.addEventListener\(['"](\w+)['"]/g;
        const listeners = new Map();
        
        let match;
        while ((match = listenerPattern.exec(code)) !== null) {
            const [, element, event] = match;
            if (!listeners.has(element)) {
                listeners.set(element, new Set());
            }
            listeners.get(element).add(event);
        }
        
        // If an element has multiple listeners, suggest event delegation
        for (const [element, events] of listeners) {
            if (events.size > 3) {
                console.log(`⚡ Consider event delegation for ${element} (${events.size} listeners)`);
            }
        }
        
        return code;
    },

    // Cache DOM queries
    cacheDOMQueries: (code) => {
        const domQueryPattern = /document\.(?:getElementById|querySelector|querySelectorAll)\(['"]([\w\-#.]+)['"]\)/g;
        const queries = new Map();
        
        // Find repeated DOM queries
        let match;
        while ((match = domQueryPattern.exec(code)) !== null) {
            const query = match[1];
            queries.set(query, (queries.get(query) || 0) + 1);
        }
        
        // Cache frequently accessed elements
        let cacheCode = '';
        for (const [query, count] of queries) {
            if (count > 2) {
                const varName = `cached${query.replace(/[#.\-]/g, '_')}`;
                cacheCode += `const ${varName} = document.querySelector('${query}');\n`;
                
                // Replace queries with cached version
                code = code.replace(
                    new RegExp(`document\\.(?:getElementById|querySelector)\\(['"]${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]\\)`, 'g'),
                    varName
                );
            }
        }
        
        return cacheCode + code;
    }
};

// Analyze module size and complexity
async function analyzeModule(filePath) {
    const stats = await stat(filePath);
    const content = await readFile(filePath, 'utf8');
    
    return {
        path: filePath,
        size: stats.size,
        lines: content.split('\n').length,
        functions: (content.match(/function\s+\w+|=>\s*{|async\s+\w+/g) || []).length,
        complexity: calculateComplexity(content)
    };
}

// Calculate cyclomatic complexity
function calculateComplexity(code) {
    const patterns = [
        /if\s*\(/g,
        /else\s+if\s*\(/g,
        /switch\s*\(/g,
        /case\s+/g,
        /while\s*\(/g,
        /for\s*\(/g,
        /\?\s*[^:]+:/g, // ternary
        /&&/g,
        /\|\|/g
    ];
    
    let complexity = 1;
    for (const pattern of patterns) {
        complexity += (code.match(pattern) || []).length;
    }
    
    return complexity;
}

// Optimize a single module
async function optimizeModule(modulePath) {
    console.log(`🔧 Optimizing ${path.basename(modulePath)}...`);
    
    let code = await readFile(modulePath, 'utf8');
    const originalSize = code.length;
    
    // Apply optimizations
    if (config.enableMinification) {
        code = optimizations.removeConsoleLogs(code);
        code = optimizations.minifyWhitespace(code);
    }
    
    code = optimizations.cacheDOMQueries(code);
    code = optimizations.optimizeEventListeners(code);
    
    // Extract static data if module is too large
    const stats = await stat(modulePath);
    if (stats.size > config.targetSizeKB * 1024) {
        const { code: optimizedCode, staticData } = optimizations.extractStaticData(code);
        code = optimizedCode;
        
        // Save static data as separate modules
        for (const data of staticData) {
            const staticPath = path.join(config.outputDir, 'static', `${data.name}.js`);
            await writeFile(staticPath, `export default ${data.data};`);
        }
    }
    
    const newSize = code.length;
    const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(1);
    
    console.log(`   ✅ Reduced by ${reduction}% (${originalSize} → ${newSize} bytes)`);
    
    return { code, reduction };
}

// Create optimized bundles
async function createOptimizedBundles() {
    console.log('🚀 Starting bundle optimization...\n');
    
    // Create output directory
    if (!fs.existsSync(config.outputDir)) {
        fs.mkdirSync(config.outputDir, { recursive: true });
        fs.mkdirSync(path.join(config.outputDir, 'static'), { recursive: true });
    }
    
    // Find all modules
    const modules = [];
    async function findModules(dir) {
        const files = await readdir(dir);
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stats = await stat(filePath);
            
            if (stats.isDirectory()) {
                await findModules(filePath);
            } else if (file.endsWith('.js')) {
                modules.push(filePath);
            }
        }
    }
    
    await findModules(config.modulesDir);
    
    // Analyze modules
    console.log('📊 Analyzing modules...\n');
    const analyses = await Promise.all(modules.map(analyzeModule));
    
    // Sort by size
    analyses.sort((a, b) => b.size - a.size);
    
    // Show largest modules
    console.log('📦 Largest modules:');
    analyses.slice(0, 10).forEach(module => {
        const sizeKB = (module.size / 1024).toFixed(1);
        console.log(`   ${path.basename(module.path)}: ${sizeKB}KB (${module.lines} lines, complexity: ${module.complexity})`);
    });
    console.log('');
    
    // Optimize modules
    console.log('🔨 Optimizing modules...\n');
    let totalOriginalSize = 0;
    let totalOptimizedSize = 0;
    
    for (const module of analyses) {
        if (module.size > 10 * 1024) { // Only optimize modules > 10KB
            const { code, reduction } = await optimizeModule(module.path);
            
            // Save optimized version
            const relativePath = path.relative(config.modulesDir, module.path);
            const outputPath = path.join(config.outputDir, relativePath);
            const outputDir = path.dirname(outputPath);
            
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }
            
            await writeFile(outputPath, code);
            
            totalOriginalSize += module.size;
            totalOptimizedSize += code.length;
        }
    }
    
    // Generate optimization report
    const totalReduction = ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(1);
    
    console.log('\n📈 Optimization Summary:');
    console.log(`   Original size: ${(totalOriginalSize / 1024).toFixed(1)}KB`);
    console.log(`   Optimized size: ${(totalOptimizedSize / 1024).toFixed(1)}KB`);
    console.log(`   Total reduction: ${totalReduction}%`);
    
    // Generate bundle configuration
    const bundleConfig = {
        entry: modules.map(m => path.relative(config.modulesDir, m)),
        optimization: {
            minimize: true,
            splitChunks: {
                chunks: 'all',
                cacheGroups: {
                    core: {
                        test: /[\\/]core[\\/]/,
                        name: 'core',
                        priority: 10
                    },
                    ui: {
                        test: /[\\/](ui|pages|modals)[\\/]/,
                        name: 'ui',
                        priority: 5
                    },
                    utils: {
                        test: /[\\/]utils[\\/]/,
                        name: 'utils',
                        priority: 1
                    }
                }
            }
        }
    };
    
    await writeFile(
        path.join(config.outputDir, 'bundle.config.json'),
        JSON.stringify(bundleConfig, null, 2)
    );
    
    console.log('\n✅ Optimization complete!');
    console.log(`📁 Optimized files saved to: ${config.outputDir}`);
}

// Add debounce utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Run optimization
if (require.main === module) {
    createOptimizedBundles().catch(console.error);
}

module.exports = { optimizations, analyzeModule, optimizeModule };