# AI CONTEXT: KingsMaker Auth & Session Architecture

> **AI Data Assistance**: This document provides authentication context for code assistance. **UPDATED** to reflect SessionManager service integration.

## Service Overview
```
auth-service (Bun:7001) → Authentication, credential validation, sessionId management
sessionManager-service (Bun:7007) → Presence tracking, connection management
Technology: Bun + PostgreSQL + SessionManager integration
```

## User Types
```typescript
RegisteredUser: email/password → sessionId → persistent data + presence tracking
GuestUser: auto-generated → sessionId → session-only data + presence tracking
```

## Session Management (NEW ARCHITECTURE)
```typescript
// Session Flow
1. Auth validates credentials → DB
2. Auth generates/reuses sessionId with expiration
3. Auth → SessionManager: addConnection(user) or resumeConnection(user)
4. SessionManager tracks presence in-memory
5. Auth returns sessionId + presenceStatus to client

// SessionId Format
Format: UUID v4 or custom unique string
Storage: PostgreSQL (persistent) + SessionManager (in-memory presence)
Lifetime: Configurable expiration (default: 24h)
```

## SessionManager Integration
```typescript
// Auth Service → SessionManager Communication
interface SessionManagerUserLoginResponse {
  sessionId: string;
  userId: number;
  userType: 'registered' | 'guest' | 'admin';
  username: string;
  connectedAt: string;
  lastSeen: string;
  presenceStatus: 'INITIAL' | 'IN_LOBBY' | 'IN_WAITING_ROOM' | 'IN_GAME' | 'OFFLINE';
}

// SessionManager State (In-Memory)
Map<userId, ConnectedClient> where ConnectedClient = {
  sessionId: string;
  userType: 'registered' | 'guest' | 'admin';
  username: string;
  presenceStatus: ClientPresenceStatus;
  lastSeen: Date;
  connectedAt: Date;
}
```

## Auth API Endpoints
```typescript
POST /register: { email, username, password } → { sessionId, presenceStatus, user }
POST /login: { username, password } → { sessionId, presenceStatus, user }  
POST /guest: { preferredUsername? } → { sessionId, presenceStatus, user }
POST /autoLogin: { token } → { sessionId, presenceStatus, user }
POST /logout: { sessionId } → { success }
```

## Security Implementation
```typescript
// Password hashing (Bun built-in)
const hash = await Bun.password.hash(plainPassword, {
  algorithm: "argon2id",
  memoryCost: 19456,
  timeCost: 2,
});

// SessionId generation
const sessionId = crypto.randomUUID();
const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
```

## Session Lifecycle
```typescript
// Create session
async createSession(user: User): Promise<SessionResponse>
  → Generate sessionId with expiration
  → Store in PostgreSQL
  → Call SessionManager.addConnection(user)
  → Return sessionId + presenceStatus

// Validate session  
async validateSession(sessionId: string): Promise<SessionData | null>
  → Check PostgreSQL for session existence
  → Check expiration timestamp
  → Return session data or null

// Refresh session
async refreshSession(sessionId: string): Promise<boolean>
  → Update lastActivity in PostgreSQL
  → Extend expiration timestamp
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
  sessionId     String?   // Current session
  sessionExpireAt DateTime?
  isConfirmed   Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

## Service Dependencies
```
auth-service → postgresql (user data, sessions)
auth-service → sessionManager-service (presence tracking)
sessionManager-service → postgresql (user validation)
Other services → sessionManager-service (presence validation)
```

## Login Response Format
```typescript
interface LoginResponse {
  sessionId: string;
  userType: 'registered' | 'guest' | 'admin';
  username: string;
  nameAlias: string;
  presenceStatus: 'INITIAL' | 'IN_LOBBY' | 'IN_WAITING_ROOM' | 'IN_GAME' | 'OFFLINE';
}
``` 