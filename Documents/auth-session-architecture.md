# AI CONTEXT: KingsMaker Auth & Session Architecture

> **AI Data Assistance**: This document provides authentication context for code assistance. Not intended for human documentation.

## Service Overview
```
auth-service (Bun:7001) → Authentication, JWT, Session management
Technology: Bun + Redis + PostgreSQL + JWT
```

## User Types
```typescript
RegisteredUser: email/password → JWT token → persistent data
GuestUser: auto-generated → guest token → session-only data
```

## Token Management
```typescript
// JWT Token (Registered users)
Format: JWT (HS256)
Storage: Redis + Client localStorage
Lifetime: 24h sliding window
Key: `session:<sessionId>`

// Guest Session  
Format: `guest_<uuid>`
Storage: Redis + Client localStorage
Lifetime: Browser session
Key: `session:<sessionId>`
```

## Redis Session Data
```typescript
interface SessionData {
  type: "registered" | "guest";
  userId: string;
  username: string;
  email?: string; // registered only
  issuedAt: string;
  lastActivity: string;
}

// Redis Keys
"session:<sessionId>": SessionData // TTL: 24h
"user-sessions:<userId>": string[] // active session IDs
```

## Auth API Endpoints
```typescript
POST /auth/register: { email, username, password } → { token, sessionId, user }
POST /auth/login: { email, password } → { token, sessionId, user }  
POST /auth/guest: { preferredUsername? } → { token, sessionId, user }
POST /auth/refresh: Bearer token → { token, expiresAt }
POST /auth/logout: Bearer token → { success }
GET /auth/me: Bearer token → { user, sessionInfo }
```

## Security Implementation
```typescript
// Password hashing (Bun built-in)
const hash = await password.hash(plainPassword, {
  algorithm: "argon2id",
  memoryCost: 19456,
  timeCost: 2,
});

// JWT config
{
  algorithm: 'HS256',
  expiresIn: '24h',
  issuer: 'kingsmaker-auth',
  audience: 'kingsmaker-game'
}
```

## Session Lifecycle
```typescript
// Create session
async createSession(user: User): Promise<SessionResponse>
  → Generate sessionId
  → Store in Redis with TTL
  → Track in user-sessions set

// Validate session  
async validateSession(sessionId: string): Promise<SessionData | null>
  → Check Redis existence
  → Return session data or null

// Refresh session
async refreshSession(sessionId: string): Promise<boolean>
  → Update lastActivity
  → Extend TTL
```

## Database Schema (Prisma)
```prisma
model User {
  id            Int       @id @default(autoincrement())
  username      String    @unique
  email         String    @unique
  password      String
  type          UserType  // registered | guest | admin
  nameAlias     String    @unique
  isConfirmed   Boolean   @default(false)
  Session       Session[]
}

model Session {
  id        String   @id @default(cuid())
  userID    Int
  user      User     @relation(fields: [userID], references: [id])
  expiresAt DateTime
  createdAt DateTime @default(now())
}
```

## Service Dependencies
```
auth-service → redis (session storage)
auth-service → postgresql (user data)
Other services → redis (session validation)
``` 