# AI WORKFLOW: KingsMaker Development Process

> **AI Assistant Guidelines**: This document defines the workflow process for implementing changes in the KingsMaker project.

## 🔄 Standard Implementation Workflow

### Phase 1: Context Gathering
```
1. READ architecture docs in Documents/
   - network-architecture.md
   - auth-session-architecture.md  
   - lobby-system-architecture.md
   - ARCHITECTURE_SEPARATION.md
   - SERVICE_ARCHITECTURE_PATTERNS.md
   - devlog.md (current status)

2. UNDERSTAND current implementation
   - Read existing service code
   - Check docker-compose.yml dependencies
   - Review shared types

3. IDENTIFY integration points
   - What services need to communicate?
   - What Redis keys/patterns to use?
   - What types need to be shared?
```

### Phase 2: Planning & Documentation
```
4. CREATE temp_devlog.md in Documents/
   - Document planned changes
   - List files to be modified
   - Note potential issues/considerations
   - Outline testing approach

5. VALIDATE approach
   - Check against architecture patterns
   - Ensure Redis integration follows established patterns
   - Verify service separation principles
```

### Phase 3: Implementation
```
6. IMPLEMENT changes in order:
   a) Update dependencies (package.json)
   b) Add/modify lib files (redis.ts, state.ts, etc.)
   c) Update main service files (index.ts)
   d) Update docker-compose.yml if needed
   e) Update shared types if needed

7. FOLLOW established patterns:
   - Use SERVICE_ARCHITECTURE_PATTERNS.md
   - Match existing Redis client setup
   - Follow same error handling patterns
   - Use consistent naming conventions
```

### Phase 4: Validation & Documentation
```
8. READ temp_devlog.md
   - Verify all planned changes completed
   - Check for any missed integration points
   - Ensure testing approach is clear

9. UPDATE final documentation:
   - Clear temp_devlog.md content
   - Update devlog.md with completion status
   - Update architecture docs if patterns changed
   - Note any new integration points

10. SUMMARY for user:
    - What was implemented
    - What files were changed  
    - How to test the changes
    - Next steps if any
```

## 🚨 Critical Checkpoints

### Before Starting
- [ ] Read ALL architecture docs
- [ ] Understand current service state from devlog.md
- [ ] Create temp_devlog.md with plan

### During Implementation  
- [ ] Follow SERVICE_ARCHITECTURE_PATTERNS.md
- [ ] Match existing Redis patterns from lobby service
- [ ] Update temp_devlog.md with progress
- [ ] Test each change incrementally

### Before Completion
- [ ] All files from temp_devlog.md updated
- [ ] Clear temp_devlog.md content  
- [ ] Update devlog.md with new status
- [ ] Provide clear testing instructions

## 📋 Current Task Template

```markdown
# TEMP_DEVLOG.md Template

## Task: [Brief description]

### Planned Changes:
- [ ] File 1: Description
- [ ] File 2: Description  
- [ ] etc.

### Integration Points:
- Service A ↔ Service B via Redis key pattern
- New types needed in shared/

### Testing Approach:
- How to verify changes work
- What to test manually

### Considerations:
- Potential issues
- Dependencies
- Order of operations
```

## 🎯 Success Criteria

A task is complete when:
1. ✅ All architecture docs have been consulted
2. ✅ temp_devlog.md plan executed fully
3. ✅ Changes follow established patterns
4. ✅ devlog.md reflects new status
5. ✅ Clear testing path provided to user 