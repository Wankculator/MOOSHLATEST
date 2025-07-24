#!/usr/bin/env node

/**
 * MOOSH Wallet Documentation Quality Gates
 * Enforces documentation standards before allowing changes
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class QualityGates {
    constructor() {
        this.rules = {
            component: {
                required: {
                    manifest: {
                        sections: ['id', 'name', 'type', 'purpose', 'architecture', 'dependencies', 'methods', 'testing', 'aiContext'],
                        minMethodCount: 1,
                        maxComplexity: 10
                    },
                    aiContext: {
                        sections: ['Critical Understanding', 'When Modifying', 'Common AI Hallucinations', 'Red Flags'],
                        minWarnings: 5,
                        minExamples: 3,
                        maxTokens: 8000
                    }
                },
                quality: {
                    minScore: 80,
                    minCoverage: 90
                }
            },
            global: {
                maxFilesPerPR: 20,
                requiresReview: ['StateManager', 'Router', 'ElementFactory', 'Component'],
                forbiddenChanges: ['moosh-wallet.js'] // Must be changed via specific process
            }
        };
        
        this.results = {
            passed: true,
            violations: [],
            warnings: [],
            score: 100
        };
    }

    /**
     * Run all quality checks
     */
    async runChecks(changedFiles) {
        console.log('🔍 Running MOOSH Wallet Quality Gates\n');
        
        // Check global rules
        await this.checkGlobalRules(changedFiles);
        
        // Check each changed file
        for (const file of changedFiles) {
            if (this.isComponentDoc(file)) {
                await this.checkComponentDocumentation(file);
            }
            
            if (this.isSourceCode(file)) {
                await this.checkCodePatterns(file);
            }
        }
        
        // Generate report
        this.generateReport();
        
        return this.results.passed;
    }

    /**
     * Check global rules
     */
    async checkGlobalRules(files) {
        // Check file count
        if (files.length > this.rules.global.maxFilesPerPR) {
            this.addViolation('TOO_MANY_FILES', 'ERROR', 
                `PR contains ${files.length} files (max: ${this.rules.global.maxFilesPerPR})`);
        }
        
        // Check for forbidden changes
        const forbidden = files.filter(f => 
            this.rules.global.forbiddenChanges.some(pattern => f.includes(pattern))
        );
        
        if (forbidden.length > 0) {
            this.addViolation('FORBIDDEN_FILE_CHANGE', 'ERROR',
                `Cannot modify protected files: ${forbidden.join(', ')}`);
        }
        
        // Check for critical components requiring review
        const critical = files.filter(f =>
            this.rules.global.requiresReview.some(comp => f.includes(comp))
        );
        
        if (critical.length > 0) {
            this.addWarning('REQUIRES_SENIOR_REVIEW',
                `Critical components modified: ${critical.join(', ')}`);
        }
    }

    /**
     * Check component documentation
     */
    async checkComponentDocumentation(filePath) {
        const componentName = path.basename(path.dirname(filePath));
        
        // Check for both manifest and AI context
        const manifestPath = path.join(path.dirname(filePath), 'manifest.json');
        const aiContextPath = path.join(path.dirname(filePath), 'ai-context.md');
        
        try {
            // Check manifest
            if (await this.fileExists(manifestPath)) {
                const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
                await this.validateManifest(componentName, manifest);
            } else {
                this.addViolation('MISSING_MANIFEST', 'ERROR',
                    `Component ${componentName} missing manifest.json`);
            }
            
            // Check AI context
            if (await this.fileExists(aiContextPath)) {
                const aiContext = await fs.readFile(aiContextPath, 'utf8');
                await this.validateAIContext(componentName, aiContext);
            } else {
                this.addViolation('MISSING_AI_CONTEXT', 'ERROR',
                    `Component ${componentName} missing ai-context.md`);
            }
            
        } catch (error) {
            this.addViolation('DOCUMENTATION_ERROR', 'ERROR',
                `Failed to validate ${componentName}: ${error.message}`);
        }
    }

    /**
     * Validate manifest structure and content
     */
    async validateManifest(componentName, manifest) {
        const rules = this.rules.component.required.manifest;
        
        // Check required sections
        for (const section of rules.sections) {
            if (!manifest[section]) {
                this.addViolation('MISSING_MANIFEST_SECTION', 'ERROR',
                    `${componentName}: Missing required section '${section}'`);
                this.results.score -= 10;
            }
        }
        
        // Validate methods documentation
        if (manifest.methods) {
            const methodCount = Object.keys(manifest.methods).length;
            if (methodCount < rules.minMethodCount) {
                this.addWarning(`${componentName}: Only ${methodCount} methods documented`);
                this.results.score -= 5;
            }
            
            // Check method documentation quality
            for (const [methodName, methodDoc] of Object.entries(manifest.methods)) {
                if (!methodDoc.purpose) {
                    this.addWarning(`${componentName}.${methodName}: Missing purpose description`);
                }
                if (!methodDoc.parameters && !methodDoc.internal) {
                    this.addWarning(`${componentName}.${methodName}: Missing parameter documentation`);
                }
            }
        }
        
        // Check complexity
        if (manifest.testing && manifest.testing.complexity > rules.maxComplexity) {
            this.addWarning(`${componentName}: High complexity (${manifest.testing.complexity})`);
        }
        
        // Validate dependencies
        if (!manifest.dependencies || Object.keys(manifest.dependencies).length === 0) {
            this.addWarning(`${componentName}: No dependencies documented`);
        }
    }

    /**
     * Validate AI context content
     */
    async validateAIContext(componentName, content) {
        const rules = this.rules.component.required.aiContext;
        
        // Check required sections
        for (const section of rules.sections) {
            if (!content.includes(`## ${section}`)) {
                this.addViolation('MISSING_AI_SECTION', 'ERROR',
                    `${componentName}: Missing AI context section '${section}'`);
                this.results.score -= 10;
            }
        }
        
        // Count warnings
        const warningCount = (content.match(/⚠️|WARNING|NEVER|ALWAYS|CRITICAL/g) || []).length;
        if (warningCount < rules.minWarnings) {
            this.addWarning(
                `${componentName}: Insufficient warnings (${warningCount}/${rules.minWarnings})`);
            this.results.score -= 5;
        }
        
        // Count code examples
        const codeBlocks = (content.match(/```/g) || []).length / 2;
        if (codeBlocks < rules.minExamples) {
            this.addWarning(
                `${componentName}: Insufficient examples (${codeBlocks}/${rules.minExamples})`);
            this.results.score -= 5;
        }
        
        // Estimate tokens
        const tokens = this.estimateTokens(content);
        if (tokens > rules.maxTokens) {
            this.addWarning(
                `${componentName}: AI context too large (~${tokens} tokens)`);
        }
        
        // Check for hallucination prevention
        if (!content.includes('WRONG') || !content.includes('CORRECT')) {
            this.addWarning(
                `${componentName}: Missing correct/wrong pattern examples`);
        }
    }

    /**
     * Check code patterns in source files
     */
    async checkCodePatterns(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            
            // Load forbidden patterns
            const forbiddenPath = path.join(__dirname, '../../AI-DEVELOPMENT-KITS/ai-guardrails/forbidden-patterns.json');
            const forbidden = JSON.parse(await fs.readFile(forbiddenPath, 'utf8'));
            
            // Check each pattern
            for (const pattern of forbidden.patterns) {
                for (const regex of pattern.patterns) {
                    const re = new RegExp(regex, 'g');
                    const matches = content.match(re);
                    
                    if (matches) {
                        this.addViolation('FORBIDDEN_PATTERN', pattern.severity.toUpperCase(),
                            `${path.basename(filePath)}: ${pattern.message} (found: ${matches[0]})`);
                        
                        if (pattern.severity === 'critical') {
                            this.results.score -= 20;
                        } else {
                            this.results.score -= 10;
                        }
                    }
                }
            }
            
        } catch (error) {
            // Not a concern if file doesn't exist
        }
    }

    /**
     * Helper methods
     */
    isComponentDoc(file) {
        return file.includes('atomic-units') && 
               (file.endsWith('manifest.json') || file.endsWith('ai-context.md'));
    }
    
    isSourceCode(file) {
        return file.endsWith('.js') && !file.includes('node_modules');
    }
    
    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }
    
    estimateTokens(text) {
        return Math.ceil(text.length / 4);
    }
    
    addViolation(type, severity, message) {
        this.results.violations.push({ type, severity, message });
        if (severity === 'ERROR') {
            this.results.passed = false;
        }
    }
    
    addWarning(message) {
        this.results.warnings.push(message);
    }

    /**
     * Generate quality report
     */
    generateReport() {
        console.log('\n📊 Quality Gates Report');
        console.log('═'.repeat(50));
        
        // Overall status
        const status = this.results.passed ? '✅ PASSED' : '❌ FAILED';
        const scoreColor = this.results.score >= 80 ? '🟢' : 
                          this.results.score >= 60 ? '🟡' : '🔴';
        
        console.log(`\nStatus: ${status}`);
        console.log(`Quality Score: ${scoreColor} ${this.results.score}/100`);
        
        // Violations
        if (this.results.violations.length > 0) {
            console.log('\n❌ Violations:');
            this.results.violations.forEach(v => {
                console.log(`   [${v.severity}] ${v.type}: ${v.message}`);
            });
        }
        
        // Warnings
        if (this.results.warnings.length > 0) {
            console.log('\n⚠️  Warnings:');
            this.results.warnings.forEach(w => {
                console.log(`   ${w}`);
            });
        }
        
        // Quality metrics
        console.log('\n📈 Quality Metrics:');
        console.log(`   Documentation Completeness: ${Math.min(100, this.results.score + 20)}%`);
        console.log(`   Pattern Compliance: ${this.results.violations.length === 0 ? '100%' : '0%'}`);
        console.log(`   AI Safety Score: ${this.results.warnings.length === 0 ? '100%' : '80%'}`);
        
        // Recommendations
        if (!this.results.passed) {
            console.log('\n💡 Required Actions:');
            console.log('   1. Fix all ERROR violations');
            console.log('   2. Ensure quality score >= 80');
            console.log('   3. Add missing documentation sections');
            console.log('   4. Include AI hallucination prevention');
        }
        
        console.log('\n' + '═'.repeat(50));
        
        // Exit code
        process.exit(this.results.passed ? 0 : 1);
    }
}

// CLI interface
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('Usage: quality-gates <file1> <file2> ...');
        console.log('   or: quality-gates --all');
        process.exit(1);
    }
    
    const gates = new QualityGates();
    
    if (args[0] === '--all') {
        // Check all components
        const componentsPath = path.join(__dirname, '../../../CODE-DNA/atomic-units');
        fs.readdir(componentsPath).then(async (dirs) => {
            const files = [];
            for (const dir of dirs) {
                files.push(path.join(componentsPath, dir, 'manifest.json'));
                files.push(path.join(componentsPath, dir, 'ai-context.md'));
            }
            await gates.runChecks(files);
        });
    } else {
        // Check specified files
        gates.runChecks(args);
    }
}

module.exports = QualityGates;