# MULTI-AGENT PLAN - [FEATURE NAME]

**Created by**: ARCHITECT Agent
**Date**: [DATE]
**Feature**: [BRIEF DESCRIPTION]
**Estimated Completion**: [TIMEFRAME]

## 📋 OVERVIEW

[Detailed description of the feature and its requirements]

## 🎯 OBJECTIVES

1. [Primary objective]
2. [Secondary objective]
3. [Success criteria]

## 👥 AGENT ASSIGNMENTS

### BUILDER-1: [Component Name]
- **Status**: PENDING | IN_PROGRESS | COMPLETED | BLOCKED
- **Priority**: HIGH | MEDIUM | LOW
- **Files**:
  - [ ] `/path/to/file1.js`
  - [ ] `/path/to/file2.js`
- **Tasks**:
  - [ ] Task 1 description
  - [ ] Task 2 description
- **Dependencies**: None | Requires BUILDER-X completion
- **MCP Status**: ⏳ Not Run | ✅ Passed | ❌ Failed

### BUILDER-2: [Component Name]
- **Status**: PENDING
- **Priority**: HIGH
- **Files**:
  - [ ] `/path/to/file3.js`
- **Tasks**:
  - [ ] Task description
- **Dependencies**: BUILDER-1 API interface
- **MCP Status**: ⏳ Not Run

### BUILDER-3: [Component Name]
- **Status**: PENDING
- **Priority**: MEDIUM
- **Files**:
  - [ ] `/path/to/file4.js`
- **Tasks**:
  - [ ] Task description
- **Dependencies**: None
- **MCP Status**: ⏳ Not Run

### VALIDATOR: Quality Assurance
- **Status**: WAITING
- **Tasks**:
  - [ ] Review all Builder implementations
  - [ ] Run comprehensive test suite
  - [ ] Verify MCP compliance
  - [ ] Security audit (if applicable)
  - [ ] Performance benchmarking
- **Output**: `VALIDATION_REPORT.md`

### SCRIBE: Documentation
- **Status**: WAITING
- **Tasks**:
  - [ ] Create feature documentation
  - [ ] Update API documentation
  - [ ] Write user guide
  - [ ] Update CHANGELOG.md
  - [ ] Create migration guide (if needed)
- **Output**: `/documentation/features/[FEATURE_NAME].md`

## 🔄 PROGRESS TRACKING

### Current Phase: PLANNING | DEVELOPMENT | TESTING | DOCUMENTATION | COMPLETE

### Timeline:
- **Day 1**: Planning and task breakdown ✅
- **Day 2-3**: Parallel development (BUILDERS)
- **Day 4**: Testing and validation
- **Day 5**: Documentation and cleanup

### Blockers:
- [ ] None currently

### Communication Log:
- `[TIMESTAMP]` ARCHITECT: Initial plan created
- `[TIMESTAMP]` BUILDER-1: Started implementation
- `[TIMESTAMP]` [Add entries as work progresses]

## 🔧 TECHNICAL SPECIFICATIONS

### API Changes:
```javascript
// New endpoints
POST /api/[endpoint]
GET /api/[endpoint]/:id
```

### Data Structures:
```javascript
// New data models
{
  id: string,
  // ... define structure
}
```

### Dependencies:
- No new npm packages | List any new dependencies

## ✅ ACCEPTANCE CRITERIA

- [ ] All assigned tasks completed
- [ ] All MCP validations pass
- [ ] Test coverage > 95%
- [ ] Documentation complete
- [ ] Code review approved
- [ ] No security vulnerabilities
- [ ] Performance benchmarks met

## 🚨 RISK ASSESSMENT

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| [Risk 1] | Low/Med/High | Low/Med/High | [Strategy] |

## 📝 NOTES

- Special considerations
- Design decisions
- Future enhancements

---

**Last Updated**: [TIMESTAMP]
**Next Sync**: [TIME]