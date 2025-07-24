/**
 * Context7-style MCP implementation for MOOSH Wallet
 */
const fs = require('fs');
const path = require('path');

class ContextManager {
    constructor() {
        this.context = new Map();
        this.maxDepth = 5;
    }

    async analyzeFile(filePath, depth = 0) {
        if (depth > this.maxDepth) return;
        
        const content = fs.readFileSync(filePath, 'utf-8');
        const imports = this.extractImports(content);
        const exports = this.extractExports(content);
        const functions = this.extractFunctions(content);
        
        this.context.set(filePath, {
            imports,
            exports,
            functions,
            size: content.length,
            lines: content.split('\n').length
        });
        
        // Recursively analyze imports
        for (const imp of imports) {
            const importPath = this.resolveImportPath(imp, filePath);
            if (importPath && !this.context.has(importPath)) {
                await this.analyzeFile(importPath, depth + 1);
            }
        }
    }

    extractImports(content) {
        const importRegex = /(?:import|require)\s*\(?['"]([^'"]+)['"]\)?/g;
        const imports = [];
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            imports.push(match[1]);
        }
        return imports;
    }

    extractExports(content) {
        const exportRegex = /export\s+(?:default\s+)?(?:function|class|const|let|var)\s+(\w+)/g;
        const exports = [];
        let match;
        while ((match = exportRegex.exec(content)) !== null) {
            exports.push(match[1]);
        }
        return exports;
    }

    extractFunctions(content) {
        const functionRegex = /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[^=]*)=>)/g;
        const functions = [];
        let match;
        while ((match = functionRegex.exec(content)) !== null) {
            functions.push(match[1] || match[2]);
        }
        return functions;
    }

    resolveImportPath(importPath, fromFile) {
        // Simple path resolution
        if (importPath.startsWith('.')) {
            return path.resolve(path.dirname(fromFile), importPath + '.js');
        }
        return null;
    }

    getContext() {
        return Object.fromEntries(this.context);
    }
}

module.exports = ContextManager;
