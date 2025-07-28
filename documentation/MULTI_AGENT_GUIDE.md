# Multi-Agent Orchestration Guide for MOOSH Wallet

## Introduction

This guide explains how to use Claude Code's recursive agent capabilities for complex MOOSH Wallet development tasks. Based on the latest Claude Code features, we can spawn multiple specialized agents working in parallel to accelerate development while maintaining quality.

## Architecture

```
┌─────────────────┐
│   ARCHITECT     │ ← Plans & coordinates
└────────┬────────┘
         │
    ┌────┴────┬──────────┬────────┐
    ▼         ▼          ▼        ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│BUILDER1│ │BUILDER2│ │BUILDER3│ │VALIDATOR│
└────────┘ └────────┘ └────────┘ └────────┘
                                      │
                                      ▼
                                 ┌────────┐
                                 │ SCRIBE │
                                 └────────┘
```

## Quick Start

### 1. Identify Need for Multi-Agent

Use multi-agent when:
- Feature touches 10+ files
- Requires parallel development streams
- Complex integrations needed
- Time-critical delivery

### 2. Launch Architect Agent

```bash
cd /path/to/moosh-wallet
claude

# In Claude:
You are ARCHITECT agent for MOOSH Wallet. Create a multi-agent plan for [FEATURE].
Use the template in /templates/MULTI_AGENT_PLAN_TEMPLATE.md.
```

### 3. Spawn Builder Agents

Open new terminals for each builder:

```bash
# Terminal 2
claude
You are BUILDER-1. Read MULTI_AGENT_PLAN.md and implement your assigned tasks.

# Terminal 3
claude
You are BUILDER-2. Read MULTI_AGENT_PLAN.md and implement your assigned tasks.
```

### 4. Launch Validator

```bash
# Terminal 4
claude
You are VALIDATOR. Monitor MULTI_AGENT_PLAN.md, test all implementations.
Run MCP validations after each builder commits.
```

### 5. Deploy Scribe

```bash
# Terminal 5
claude
You are SCRIBE. Document all changes as they happen.
Update /documentation/ with feature guides.
```

## Communication Protocol

### Shared Files

1. **MULTI_AGENT_PLAN.md** - Central task tracker
2. **AGENT_PROGRESS.md** - Real-time updates
3. **VALIDATION_REPORT.md** - Test results
4. **BLOCKER_ALERT.md** - Urgent issues

### Status Updates

Each agent updates their status every commit:
```markdown
## BUILDER-1 STATUS
- Current: Implementing API endpoints
- Completed: Database schema
- Next: Unit tests
- Blockers: None
- MCP: ✅ Passing
```

### Handoff Protocol

When passing work between agents:
```markdown
## HANDOFF: BUILDER-1 → BUILDER-2
- Component: UserAuth API
- Status: Complete
- Interface: See /src/api/auth.js
- Tests: /tests/auth.test.js
- Notes: Uses JWT tokens
```

## Best Practices

### 1. Clear Boundaries

Each agent owns specific domains:
- **BUILDER-1**: Backend/API
- **BUILDER-2**: Frontend/UI
- **BUILDER-3**: Integration/Testing
- **VALIDATOR**: Quality assurance
- **SCRIBE**: Documentation

### 2. Continuous Integration

```bash
# Each builder after changes:
npm run mcp:validate-all
git add .
git commit -m "feat(agent-1): implement feature X"
git push origin feature/agent-1-work
```

### 3. Conflict Resolution

If agents conflict:
1. STOP all work
2. ARCHITECT resolves
3. Update MULTI_AGENT_PLAN.md
4. Resume with new instructions

### 4. Performance Monitoring

Track metrics per agent:
- Lines of code/hour
- MCP pass rate
- Test coverage
- Documentation completeness

## Example: Multi-Wallet System Implementation

Here's how we implemented the multi-wallet system using agents:

### ARCHITECT Plan
```markdown
Feature: Multi-Wallet System
Agents: 4 builders, 1 validator, 1 scribe

BUILDER-1: Core wallet manager
BUILDER-2: UI modal system  
BUILDER-3: State integration
BUILDER-4: Migration system
VALIDATOR: Test all components
SCRIBE: User documentation
```

### Results
- Completed in 2 hours vs estimated 2 days
- 100% MCP compliance
- Full test coverage
- Complete documentation

## Advanced Techniques

### Recursive Sub-Agents

For deep analysis tasks:
```
ARCHITECT: "Analyze entire codebase"
├── ANALYZER-1: Frontend analysis
│   ├── SUB-1: Component analysis
│   └── SUB-2: State management
├── ANALYZER-2: Backend analysis
│   ├── SUB-1: API endpoints
│   └── SUB-2: Database queries
└── ANALYZER-3: Security audit
```

### Parallel Testing

```bash
# Spawn 3 test agents
TEST-1: Unit tests
TEST-2: Integration tests  
TEST-3: E2E tests

# All report to VALIDATOR
```

### Emergency Procedures

If system fails:

1. **All agents execute:**
   ```bash
   git stash
   echo "EMERGENCY STOP" > BLOCKER_ALERT.md
   ```

2. **ARCHITECT assesses damage**

3. **Create recovery plan**

4. **Resume with adjusted strategy**

## Integration with MOOSH Workflow

### MCP Compliance

Every agent must:
1. Run `npm run mcp:validate-all` before commits
2. Fix any failures immediately
3. Never merge failing code

### Security Protocol

For crypto-related changes:
1. BUILDER implements
2. VALIDATOR security audit
3. ARCHITECT approval required
4. SCRIBE documents security measures

### Documentation Standards

SCRIBE must maintain:
- Feature documentation
- API changes
- Migration guides
- User tutorials

## Metrics and Reporting

Track agent performance:

```markdown
## AGENT METRICS - [DATE]

### BUILDER-1
- Tasks: 5/5 complete
- Lines: 500 added, 100 modified
- MCP: 100% pass rate
- Time: 45 minutes

### BUILDER-2  
- Tasks: 3/4 complete
- Lines: 300 added
- MCP: 1 failure fixed
- Time: 50 minutes
```

## Troubleshooting

### Common Issues

1. **Agent Conflicts**
   - Solution: Clear file ownership in plan
   
2. **Context Loss**
   - Solution: Re-read MULTI_AGENT_PLAN.md
   
3. **MCP Failures**
   - Solution: Dedicated fixer agent

4. **Communication Breakdown**
   - Solution: ARCHITECT intervention

## Conclusion

Multi-agent orchestration enables:
- 5-10x faster development
- Higher code quality
- Better documentation
- Parallel progress

When used correctly, it transforms complex features from multi-day efforts into multi-hour accomplishments.

Remember: **With great agents comes great responsibility!**