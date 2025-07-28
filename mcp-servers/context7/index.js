#!/usr/bin/env node

/**
 * Context7 MCP Implementation for MOOSH Wallet
 * Advanced context management for better code understanding and impact analysis
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

class Context7MCP {
    constructor() {
        this.projectRoot = path.join(__dirname, '../..');
        this.codebaseMap = new Map();
        this.dependencies = new Map();
        this.impacts = new Map();
        this.contextCache = new Map();
        
        // File patterns to analyze
        this.filePatterns = {
            javascript: /\.js$/,
            json: /\.json$/,
            markdown: /\.md$/,
            config: /\.(config|rc)\.js$/
        };
        
        // Import/export patterns
        this.patterns = {
            imports: {
                es6: /import\s+(?:{[^}]+}|[\w\s,]+)\s+from\s+['"]([^'"]+)['"]/g,
                commonjs: /require\s*\(['"]([^'"]+)['"]\)/g,
                dynamic: /import\s*\(['"]([^'"]+)['"]\)/g
            },
            exports: {
                es6: /export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)/g,
                commonjs: /module\.exports\s*=\s*(\w+)/g,
                named: /export\s*{\s*([^}]+)\s*}/g
            },
            windowAssignments: /window\.(\w+)\s*=/g,
            globalAssignments: /global\.(\w+)\s*=/g
        };
    }

    /**
     * Initialize the MCP and analyze the codebase
     */
    async initialize() {
        console.log('🚀 Context7 MCP - Initializing codebase analysis...\n');
        
        try {
            // Analyze the codebase
            await this.analyzeCodebase();
            
            // Build dependency graph
            await this.buildDependencyGraph();
            
            // Analyze impact paths
            await this.analyzeImpactPaths();
            
            console.log('✅ Context7 MCP initialized successfully!\n');
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Context7:', error);
            return false;
        }
    }

    /**
     * Analyze the entire codebase
     */
    async analyzeCodebase() {
        console.log('📂 Analyzing codebase structure...');
        
        const directories = [
            'public/js',
            'public/js/modules',
            'src/server',
            'src/server/services',
            'scripts',
            'tests'
        ];
        
        for (const dir of directories) {
            const fullPath = path.join(this.projectRoot, dir);
            if (fs.existsSync(fullPath)) {
                await this.analyzeDirectory(fullPath);
            }
        }
        
        console.log(`   Found ${this.codebaseMap.size} files\n`);
    }

    /**
     * Analyze a directory recursively
     */
    async analyzeDirectory(dirPath) {
        const files = await readdir(dirPath);
        
        for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stats = await stat(filePath);
            
            if (stats.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
                await this.analyzeDirectory(filePath);
            } else if (stats.isFile() && this.shouldAnalyzeFile(file)) {
                await this.analyzeFile(filePath);
            }
        }
    }

    /**
     * Check if file should be analyzed
     */
    shouldAnalyzeFile(filename) {
        return Object.values(this.filePatterns).some(pattern => pattern.test(filename));
    }

    /**
     * Analyze a single file
     */
    async analyzeFile(filePath) {
        try {
            const content = await readFile(filePath, 'utf8');
            const relativePath = path.relative(this.projectRoot, filePath);
            
            const fileInfo = {
                path: relativePath,
                size: content.length,
                lines: content.split('\n').length,
                imports: this.extractImports(content),
                exports: this.extractExports(content),
                functions: this.extractFunctions(content),
                classes: this.extractClasses(content),
                dependencies: new Set(),
                dependents: new Set()
            };
            
            this.codebaseMap.set(relativePath, fileInfo);
        } catch (error) {
            console.error(`Error analyzing ${filePath}:`, error.message);
        }
    }

    /**
     * Extract imports from code
     */
    extractImports(content) {
        const imports = new Set();
        
        // ES6 imports
        let match;
        while ((match = this.patterns.imports.es6.exec(content)) !== null) {
            imports.add(match[1]);
        }
        
        // CommonJS requires
        this.patterns.imports.commonjs.lastIndex = 0;
        while ((match = this.patterns.imports.commonjs.exec(content)) !== null) {
            imports.add(match[1]);
        }
        
        // Dynamic imports
        this.patterns.imports.dynamic.lastIndex = 0;
        while ((match = this.patterns.imports.dynamic.exec(content)) !== null) {
            imports.add(match[1]);
        }
        
        return Array.from(imports);
    }

    /**
     * Extract exports from code
     */
    extractExports(content) {
        const exports = new Set();
        
        // ES6 exports
        let match;
        while ((match = this.patterns.exports.es6.exec(content)) !== null) {
            exports.add(match[1]);
        }
        
        // CommonJS exports
        this.patterns.exports.commonjs.lastIndex = 0;
        while ((match = this.patterns.exports.commonjs.exec(content)) !== null) {
            exports.add(match[1]);
        }
        
        // Named exports
        this.patterns.exports.named.lastIndex = 0;
        while ((match = this.patterns.exports.named.exec(content)) !== null) {
            match[1].split(',').forEach(exp => {
                exports.add(exp.trim());
            });
        }
        
        // Window assignments
        this.patterns.windowAssignments.lastIndex = 0;
        while ((match = this.patterns.windowAssignments.exec(content)) !== null) {
            exports.add(match[1]);
        }
        
        return Array.from(exports);
    }

    /**
     * Extract function definitions
     */
    extractFunctions(content) {
        const functions = [];
        const functionPattern = /(?:async\s+)?function\s+(\w+)\s*\([^)]*\)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g;
        
        let match;
        while ((match = functionPattern.exec(content)) !== null) {
            functions.push(match[1] || match[2]);
        }
        
        return functions;
    }

    /**
     * Extract class definitions
     */
    extractClasses(content) {
        const classes = [];
        const classPattern = /class\s+(\w+)(?:\s+extends\s+\w+)?\s*{/g;
        
        let match;
        while ((match = classPattern.exec(content)) !== null) {
            classes.push(match[1]);
        }
        
        return classes;
    }

    /**
     * Build dependency graph
     */
    async buildDependencyGraph() {
        console.log('🔗 Building dependency graph...');
        
        for (const [filePath, fileInfo] of this.codebaseMap) {
            for (const importPath of fileInfo.imports) {
                const resolvedPath = this.resolveImportPath(filePath, importPath);
                if (resolvedPath && this.codebaseMap.has(resolvedPath)) {
                    fileInfo.dependencies.add(resolvedPath);
                    this.codebaseMap.get(resolvedPath).dependents.add(filePath);
                }
            }
        }
        
        // Find circular dependencies
        const circular = this.findCircularDependencies();
        if (circular.length > 0) {
            console.log(`   ⚠️  Found ${circular.length} circular dependencies`);
        }
        
        console.log('   Dependency graph built successfully\n');
    }

    /**
     * Resolve import path to actual file
     */
    resolveImportPath(fromFile, importPath) {
        // Skip external modules
        if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
            return null;
        }
        
        const fromDir = path.dirname(fromFile);
        let resolvedPath = path.join(fromDir, importPath);
        
        // Try different extensions
        const extensions = ['.js', '.json', '/index.js'];
        for (const ext of extensions) {
            const testPath = resolvedPath.endsWith('.js') ? resolvedPath : resolvedPath + ext;
            const relativePath = path.relative(this.projectRoot, path.join(this.projectRoot, testPath));
            
            if (this.codebaseMap.has(relativePath)) {
                return relativePath;
            }
        }
        
        return null;
    }

    /**
     * Find circular dependencies
     */
    findCircularDependencies() {
        const circular = [];
        const visited = new Set();
        const stack = new Set();
        
        const dfs = (file, path = []) => {
            if (stack.has(file)) {
                const cycleStart = path.indexOf(file);
                circular.push(path.slice(cycleStart));
                return;
            }
            
            if (visited.has(file)) return;
            
            visited.add(file);
            stack.add(file);
            
            const fileInfo = this.codebaseMap.get(file);
            if (fileInfo) {
                for (const dep of fileInfo.dependencies) {
                    dfs(dep, [...path, file]);
                }
            }
            
            stack.delete(file);
        };
        
        for (const file of this.codebaseMap.keys()) {
            if (!visited.has(file)) {
                dfs(file);
            }
        }
        
        return circular;
    }

    /**
     * Analyze impact paths
     */
    async analyzeImpactPaths() {
        console.log('💥 Analyzing impact paths...');
        
        // Identify critical files
        const criticalFiles = this.identifyCriticalFiles();
        
        // Calculate impact scores
        for (const [file, info] of this.codebaseMap) {
            const impactScore = this.calculateImpactScore(file);
            this.impacts.set(file, {
                score: impactScore,
                directDependents: info.dependents.size,
                totalDependents: this.getTotalDependents(file).size,
                isCritical: criticalFiles.has(file)
            });
        }
        
        console.log(`   Analyzed ${this.impacts.size} files for impact\n`);
    }

    /**
     * Identify critical files
     */
    identifyCriticalFiles() {
        const critical = new Set();
        
        // Files with many dependents
        for (const [file, info] of this.codebaseMap) {
            if (info.dependents.size > 5) {
                critical.add(file);
            }
        }
        
        // Core files
        const corePatterns = [
            /state-manager\.js$/,
            /api-service\.js$/,
            /router\.js$/,
            /moosh-wallet\.js$/,
            /element-factory\.js$/
        ];
        
        for (const file of this.codebaseMap.keys()) {
            if (corePatterns.some(pattern => pattern.test(file))) {
                critical.add(file);
            }
        }
        
        return critical;
    }

    /**
     * Calculate impact score for a file
     */
    calculateImpactScore(file) {
        const directDependents = this.codebaseMap.get(file)?.dependents.size || 0;
        const totalDependents = this.getTotalDependents(file).size;
        const isCritical = this.identifyCriticalFiles().has(file);
        
        let score = directDependents * 10 + totalDependents * 5;
        if (isCritical) score *= 2;
        
        return score;
    }

    /**
     * Get all dependents (recursive)
     */
    getTotalDependents(file, visited = new Set()) {
        if (visited.has(file)) return visited;
        
        visited.add(file);
        const fileInfo = this.codebaseMap.get(file);
        
        if (fileInfo) {
            for (const dependent of fileInfo.dependents) {
                this.getTotalDependents(dependent, visited);
            }
        }
        
        return visited;
    }

    /**
     * Get context for a specific file
     */
    getFileContext(filePath) {
        const fileInfo = this.codebaseMap.get(filePath);
        if (!fileInfo) return null;
        
        const impact = this.impacts.get(filePath);
        
        return {
            file: filePath,
            info: fileInfo,
            impact: impact,
            dependencies: Array.from(fileInfo.dependencies),
            dependents: Array.from(fileInfo.dependents),
            totalImpact: this.getTotalDependents(filePath).size
        };
    }

    /**
     * Get change impact analysis
     */
    getChangeImpact(changedFiles) {
        const impactedFiles = new Set();
        const impacts = [];
        
        for (const file of changedFiles) {
            const dependents = this.getTotalDependents(file);
            dependents.forEach(dep => impactedFiles.add(dep));
            
            impacts.push({
                file,
                directImpact: this.codebaseMap.get(file)?.dependents.size || 0,
                totalImpact: dependents.size,
                criticalDependents: Array.from(dependents).filter(dep => 
                    this.impacts.get(dep)?.isCritical
                )
            });
        }
        
        return {
            totalFiles: impactedFiles.size,
            impacts,
            criticalFiles: Array.from(impactedFiles).filter(file => 
                this.impacts.get(file)?.isCritical
            )
        };
    }

    /**
     * Generate context report
     */
    generateReport() {
        const report = {
            summary: {
                totalFiles: this.codebaseMap.size,
                totalDependencies: 0,
                criticalFiles: 0,
                circularDependencies: this.findCircularDependencies().length
            },
            criticalFiles: [],
            highImpactFiles: [],
            recommendations: []
        };
        
        // Calculate totals
        for (const [file, info] of this.codebaseMap) {
            report.summary.totalDependencies += info.dependencies.size;
            
            const impact = this.impacts.get(file);
            if (impact?.isCritical) {
                report.summary.criticalFiles++;
                report.criticalFiles.push({
                    file,
                    dependents: impact.directDependents,
                    score: impact.score
                });
            }
            
            if (impact?.score > 100) {
                report.highImpactFiles.push({
                    file,
                    score: impact.score,
                    dependents: impact.totalDependents
                });
            }
        }
        
        // Sort by impact
        report.criticalFiles.sort((a, b) => b.score - a.score);
        report.highImpactFiles.sort((a, b) => b.score - a.score);
        
        // Generate recommendations
        if (report.summary.circularDependencies > 0) {
            report.recommendations.push('Resolve circular dependencies to improve maintainability');
        }
        
        if (report.highImpactFiles.length > 10) {
            report.recommendations.push('Consider refactoring high-impact files to reduce coupling');
        }
        
        return report;
    }
}

// CLI interface
if (require.main === module) {
    const context7 = new Context7MCP();
    
    context7.initialize().then(() => {
        const report = context7.generateReport();
        
        console.log('📊 Context7 Analysis Report');
        console.log('==========================\n');
        
        console.log('Summary:');
        console.log(`  Total Files: ${report.summary.totalFiles}`);
        console.log(`  Total Dependencies: ${report.summary.totalDependencies}`);
        console.log(`  Critical Files: ${report.summary.criticalFiles}`);
        console.log(`  Circular Dependencies: ${report.summary.circularDependencies}\n`);
        
        console.log('Top 5 Critical Files:');
        report.criticalFiles.slice(0, 5).forEach(file => {
            console.log(`  ${file.file} (${file.dependents} dependents, score: ${file.score})`);
        });
        
        console.log('\nTop 5 High Impact Files:');
        report.highImpactFiles.slice(0, 5).forEach(file => {
            console.log(`  ${file.file} (score: ${file.score})`);
        });
        
        if (report.recommendations.length > 0) {
            console.log('\nRecommendations:');
            report.recommendations.forEach(rec => {
                console.log(`  - ${rec}`);
            });
        }
    });
}

module.exports = Context7MCP;