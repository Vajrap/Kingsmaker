# TEMP_DEVLOG.md

## Task: Implement Redis Integration in Auth Service

### Current Situation:
From devlog.md I can see that auth service is listed as "OPERATIONAL" with "JWT + session management via Redis", but looking at the actual code, it appears Redis integration may not be fully implemented. The user wants to add Redis integration without changing too much of the existing auth service.

### Planned Changes:
- [ ] Check if auth service already has Redis dependencies
- [ ] Add ioredis dependency to Server/services/auth/package.json
- [ ] Create Server/services/auth/lib/redis.ts (following established patterns)
- [ ] Create Server/services/auth/lib/session.ts for session management
- [ ] Update Server/services/auth/index.ts to use Redis for session storage
- [ ] Ensure session data follows SessionData type from shared/types

### Integration Points:
- auth-service → redis (session storage using key pattern `session:<sessionId>`)
- lobby-service validates sessions by reading from redis (already implemented)
- SessionData type already exists in shared/types/types.ts

### Testing Approach:
- Test auth endpoints (/login, /register, /guest) store sessions in Redis
- Test that sessions can be validated by other services
- Check Redis keys are properly formatted and have TTL

### Considerations:
- Don't break existing auth functionality 
- Follow exact Redis client patterns from lobby service
- Use existing SessionData interface from shared types
- Maintain existing JWT functionality
- Sessions should have 24h TTL as per architecture docs 