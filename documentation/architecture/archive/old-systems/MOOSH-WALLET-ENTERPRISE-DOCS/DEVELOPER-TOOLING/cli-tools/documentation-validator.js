#!/usr/bin/env node

/**
 * MOOSH Wallet Documentation Validator
 * Ensures documentation quality and completeness
 */

const fs = require('fs').promises;
const path = require('path');

class DocumentationValidator {
    constructor() {
        this.violations = [];
        this.warnings = [];
        this.stats = {
            totalComponents: 0,
            documentedComponents: 0,
            missingDocs: [],
            qualityScores: {}
        };
    }

    /**
     * Required sections for component documentation
     */
    static REQUIRED_SECTIONS = {
        manifest: [
            'id', 'name', 'type', 'purpose', 'architecture',
            'dependencies', 'methods', 'testing', 'aiContext'
        ],
        aiContext: [
            'criticalWarnings', 'commonMistakes', 'bestPractices',
            'dependencies', 'redFlags'
        ]
    };

    /**
     * Quality metrics
     */
    static QUALITY_RULES = {
        minExamples: 3,
        minWarnings: 5,
        maxComplexity: 10,
        minTestCases: 5,
        maxTokenCount: 8000
    };

    /**
     * Validate all documentation
     */
    async validateAll() {
        console.log('🔍 MOOSH Wallet Documentation Validator\n');
        
        try {
            // Find all components
            const componentsPath = path.join(__dirname, '../../../CODE-DNA/atomic-units');
            await this.scanComponents(componentsPath);
            
            // Validate each component
            for (const component of this.stats.missingDocs) {
                await this.validateComponent(component);
            }
            
            // Generate report
            this.generateReport();
            
        } catch (error) {
            console.error('❌ Validation failed:', error.message);
            process.exit(1);
        }
    }

    /**
     * Scan for components
     */
    async scanComponents(dir) {
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    this.stats.totalComponents++;
                    
                    const manifestPath = path.join(dir, entry.name, 'manifest.json');
                    const aiContextPath = path.join(dir, entry.name, 'ai-context.md');
                    
                    const hasManifest = await this.fileExists(manifestPath);
                    const hasAiContext = await this.fileExists(aiContextPath);
                    
                    if (hasManifest && hasAiContext) {
                        this.stats.documentedComponents++;
                        await this.validateComponentDocs(entry.name, manifestPath, aiContextPath);
                    } else {
                        this.stats.missingDocs.push(entry.name);
                        this.violations.push({
                            component: entry.name,
                            type: 'MISSING_DOCUMENTATION',
                            severity: 'ERROR',
                            message: `Missing ${!hasManifest ? 'manifest.json' : ''} ${!hasAiContext ? 'ai-context.md' : ''}`
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error scanning components:', error);
        }
    }

    /**
     * Validate component documentation
     */
    async validateComponentDocs(componentName, manifestPath, aiContextPath) {
        const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
        const aiContext = await fs.readFile(aiContextPath, 'utf8');
        
        // Validate manifest structure
        this.validateManifest(componentName, manifest);
        
        // Validate AI context
        this.validateAiContext(componentName, aiContext);
        
        // Calculate quality score
        const qualityScore = this.calculateQualityScore(manifest, aiContext);
        this.stats.qualityScores[componentName] = qualityScore;
    }

    /**
     * Validate manifest.json
     */
    validateManifest(componentName, manifest) {
        // Check required sections
        for (const section of DocumentationValidator.REQUIRED_SECTIONS.manifest) {
            if (!manifest[section]) {
                this.violations.push({
                    component: componentName,
                    type: 'MISSING_MANIFEST_SECTION',
                    severity: 'ERROR',
                    section: section,
                    message: `Missing required section: ${section}`
                });
            }
        }
        
        // Check method documentation
        if (manifest.methods) {
            const methodCount = Object.keys(manifest.methods).length;
            if (methodCount < 1) {
                this.warnings.push({
                    component: componentName,
                    type: 'NO_METHODS_DOCUMENTED',
                    severity: 'WARNING',
                    message: 'No methods documented'
                });
            }
        }
        
        // Check dependencies completeness
        if (manifest.dependencies) {
            if (!manifest.dependencies.internal || manifest.dependencies.internal.length === 0) {
                this.warnings.push({
                    component: componentName,
                    type: 'NO_INTERNAL_DEPENDENCIES',
                    severity: 'WARNING',
                    message: 'No internal dependencies listed'
                });
            }
        }
    }

    /**
     * Validate ai-context.md
     */
    validateAiContext(componentName, aiContext) {
        // Check for required sections
        const requiredHeaders = [
            '## Critical Understanding',
            '## When Modifying',
            '## Common AI Hallucinations',
            '## Red Flags',
            '## AI Instructions Summary'
        ];
        
        for (const header of requiredHeaders) {
            if (!aiContext.includes(header)) {
                this.violations.push({
                    component: componentName,
                    type: 'MISSING_AI_CONTEXT_SECTION',
                    severity: 'ERROR',
                    section: header,
                    message: `Missing required section: ${header}`
                });
            }
        }
        
        // Check for minimum warnings
        const warningCount = (aiContext.match(/⚠️|WARNING|NEVER|ALWAYS/g) || []).length;
        if (warningCount < DocumentationValidator.QUALITY_RULES.minWarnings) {
            this.warnings.push({
                component: componentName,
                type: 'INSUFFICIENT_WARNINGS',
                severity: 'WARNING',
                message: `Only ${warningCount} warnings found (minimum: ${DocumentationValidator.QUALITY_RULES.minWarnings})`
            });
        }
        
        // Check for code examples
        const codeBlockCount = (aiContext.match(/```/g) || []).length / 2;
        if (codeBlockCount < DocumentationValidator.QUALITY_RULES.minExamples) {
            this.warnings.push({
                component: componentName,
                type: 'INSUFFICIENT_EXAMPLES',
                severity: 'WARNING',
                message: `Only ${codeBlockCount} code examples found (minimum: ${DocumentationValidator.QUALITY_RULES.minExamples})`
            });
        }
        
        // Estimate token count
        const tokenCount = this.estimateTokens(aiContext);
        if (tokenCount > DocumentationValidator.QUALITY_RULES.maxTokenCount) {
            this.warnings.push({
                component: componentName,
                type: 'AI_CONTEXT_TOO_LARGE',
                severity: 'WARNING',
                message: `AI context is ~${tokenCount} tokens (maximum: ${DocumentationValidator.QUALITY_RULES.maxTokenCount})`
            });
        }
    }

    /**
     * Calculate quality score
     */
    calculateQualityScore(manifest, aiContext) {
        let score = 100;
        
        // Deduct for missing sections
        const missingManifestSections = DocumentationValidator.REQUIRED_SECTIONS.manifest
            .filter(section => !manifest[section]).length;
        score -= missingManifestSections * 10;
        
        // Bonus for comprehensive documentation
        if (manifest.testing && manifest.testing.criticalPaths) {
            score += 5;
        }
        if (manifest.performance) {
            score += 5;
        }
        if (manifest.security) {
            score += 5;
        }
        
        // AI context quality
        const warningCount = (aiContext.match(/⚠️|WARNING|NEVER|ALWAYS/g) || []).length;
        if (warningCount >= 10) score += 5;
        
        const codeBlockCount = (aiContext.match(/```/g) || []).length / 2;
        if (codeBlockCount >= 5) score += 5;
        
        return Math.max(0, Math.min(100, score));
    }

    /**
     * Estimate token count
     */
    estimateTokens(text) {
        // Rough estimate: ~4 characters per token
        return Math.ceil(text.length / 4);
    }

    /**
     * Check if file exists
     */
    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Generate validation report
     */
    generateReport() {
        console.log('📊 Documentation Validation Report\n');
        console.log('═'.repeat(50));
        
        // Summary
        const coverage = (this.stats.documentedComponents / this.stats.totalComponents * 100).toFixed(1);
        console.log(`📈 Coverage: ${coverage}% (${this.stats.documentedComponents}/${this.stats.totalComponents})`);
        
        // Quality scores
        if (Object.keys(this.stats.qualityScores).length > 0) {
            const avgQuality = Object.values(this.stats.qualityScores)
                .reduce((a, b) => a + b, 0) / Object.keys(this.stats.qualityScores).length;
            console.log(`⭐ Average Quality Score: ${avgQuality.toFixed(1)}/100`);
        }
        
        console.log(`❌ Errors: ${this.violations.length}`);
        console.log(`⚠️  Warnings: ${this.warnings.length}`);
        
        console.log('\n' + '═'.repeat(50) + '\n');
        
        // Missing documentation
        if (this.stats.missingDocs.length > 0) {
            console.log('📝 Components Missing Documentation:');
            this.stats.missingDocs.forEach(comp => {
                console.log(`   - ${comp}`);
            });
            console.log('');
        }
        
        // Violations
        if (this.violations.length > 0) {
            console.log('❌ Violations:');
            this.violations.forEach(v => {
                console.log(`   [${v.severity}] ${v.component}: ${v.message}`);
            });
            console.log('');
        }
        
        // Warnings
        if (this.warnings.length > 0) {
            console.log('⚠️  Warnings:');
            this.warnings.forEach(w => {
                console.log(`   [${w.severity}] ${w.component}: ${w.message}`);
            });
            console.log('');
        }
        
        // Quality scores
        console.log('📊 Component Quality Scores:');
        Object.entries(this.stats.qualityScores)
            .sort((a, b) => b[1] - a[1])
            .forEach(([comp, score]) => {
                const emoji = score >= 90 ? '🟢' : score >= 70 ? '🟡' : '🔴';
                console.log(`   ${emoji} ${comp}: ${score}/100`);
            });
        
        console.log('\n' + '═'.repeat(50));
        
        // Exit code
        if (this.violations.length > 0) {
            console.log('\n❌ Validation failed with errors');
            process.exit(1);
        } else if (this.warnings.length > 0) {
            console.log('\n⚠️  Validation passed with warnings');
            process.exit(0);
        } else {
            console.log('\n✅ All documentation validated successfully!');
            process.exit(0);
        }
    }
}

// Run validator if called directly
if (require.main === module) {
    const validator = new DocumentationValidator();
    validator.validateAll();
}

module.exports = DocumentationValidator;