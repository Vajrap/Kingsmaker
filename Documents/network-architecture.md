# AI CONTEXT: KingsMaker Network Architecture

> **AI Data Assistance**: This document provides architectural context for code assistance. **UPDATED** to reflect SessionManager in-memory approach and current service dependencies.

## Current Service Matrix
```
auth-service (Bun:7001) → Authentication, sessionId generation, user validation
sessionManager-service (Bun:7007) → In-memory presence tracking, connection management
lobby-service (Bun:7004) → WebSocket, Room discovery, Player tracking  
waitingRoom-service (Bun:7005) → Pre-game rooms, Player readiness, Grace period management
game-service (Bun:7003) → Game instances, Turn logic
chat-service (Bun:7002) → Chat functionality
store-service (Bun:7006) → Store/marketplace functionality
db (PostgreSQL:7432) → Persistent data, embedded sessions
```

## Session Management Architecture (No Redis)

### **SessionManager In-Memory State:**
```typescript
// SessionManager tracks all active sessions in-memory
Map<userId, ConnectedClient> where ConnectedClient = {
  sessionId: string;
  userType: 'registered' | 'guest' | 'admin';
  username: string;
  presenceStatus: 'INITIAL' | 'IN_LOBBY' | 'IN_WAITING_ROOM' | 'IN_GAME' | 'OFFLINE';
  lastSeen: Date;
  connectedAt: Date;
}
```

### **Database Session Storage (Embedded Approach):**
```sql
-- PostgreSQL User table with embedded sessions
CREATE TABLE User (
  id SERIAL PRIMARY KEY,
  username VARCHAR UNIQUE,
  sessionId VARCHAR UNIQUE,     -- Embedded session ID
  sessionExpireAt TIMESTAMP,    -- Embedded session expiration
  type UserType,
  email VARCHAR UNIQUE,
  -- ... other user fields
);
```

## State Management Layers

### **Layer 1: Persistent Session Data (PostgreSQL)**
```typescript
// Database stores session credentials
interface UserSessionData {
  sessionId: string;           // Persistent session identifier
  sessionExpireAt: Date;       // Session expiration timestamp
  userId: number;              // User identifier
}
```

### **Layer 2: Active Session Tracking (SessionManager In-Memory)**
```typescript
// SessionManager tracks active connections
interface ConnectedClient {
  sessionId: string;
  userType: 'registered' | 'guest' | 'admin';
  username: string;
  presenceStatus: 'INITIAL' | 'IN_LOBBY' | 'IN_WAITING_ROOM' | 'IN_GAME' | 'OFFLINE';
  lastSeen: Date;
  connectedAt: Date;
}
```

### **Layer 3: Service-Specific State (Various)**
```typescript
// WaitingRoom Service - Room membership with connection tracking
interface Player {
  userId: string;
  username: string;
  connectionStatus: "connected" | "disconnected" | "grace_period";
  disconnectedAt?: string;
  lastSeen: string;
  isReady: boolean;
}

// Game Service - Game state
interface GameState {
  gameId: string;
  players: Player[];
  currentTurn: string;
  gameStatus: "active" | "paused" | "ended";
}
```

## Service Communication Patterns

### **Authentication Flow:**
```
1. Client → Auth Service: POST /login
2. Auth Service → PostgreSQL: Validate credentials, get/create sessionId
3. Auth Service → SessionManager: addConnection(user) [HTTP]
4. SessionManager → Auth Service: ConnectedClient data [HTTP Response]
5. Auth Service → Client: LoginResponse with presenceStatus
```

### **Session Validation Flow:**
```
1. Service → SessionManager: POST /getConnection { userId } [HTTP]
2. SessionManager → Service: ConnectedClient | null [HTTP Response]
3. Service validates session and proceeds with logic
```

### **Presence Update Flow:**
```
1. Service → SessionManager: POST /updatePresence { userId, presence } [HTTP]
2. SessionManager updates in-memory presence state
3. SessionManager → Service: Success confirmation [HTTP Response]
```

## Client Connection Flow
```
1. Client → auth-service (HTTP) → sessionId + presenceStatus
2. Client routing based on presenceStatus:
   - INITIAL/IN_LOBBY → lobby-service (WebSocket)
   - IN_WAITING_ROOM → waitingRoom-service (WebSocket + validation)
   - IN_GAME → game-service (WebSocket + validation)
3. All services validate sessions via SessionManager HTTP API
4. Services handle their own state management locally
```

## Service Dependencies
```
Core Dependencies:
- auth-service → postgresql (credentials), sessionManager-service (session tracking)
- sessionManager-service → postgresql (user validation only)

Service Dependencies:
- lobby-service → sessionManager-service (session validation)
- waitingRoom-service → sessionManager-service (session validation)
- game-service → sessionManager-service (session validation)
- chat-service → sessionManager-service (session validation)
- store-service → sessionManager-service (session validation)

Note: No Redis dependencies for session management
```

## Message Types & APIs

### **Auth Service HTTP API:**
```typescript
POST /auth/login: { username, password } → LoginResponse
POST /auth/guest: { preferredUsername? } → LoginResponse
POST /auth/autoLogin: { token } → LoginResponse
POST /auth/logout: { sessionId } → Success

interface LoginResponse {
  sessionId: string;
  userId: number;
  userType: 'registered' | 'guest' | 'admin';
  username: string;
  nameAlias: string;
  presenceStatus: 'INITIAL' | 'IN_LOBBY' | 'IN_WAITING_ROOM' | 'IN_GAME';
}
```

### **SessionManager HTTP API:**
```typescript
POST /sessionManager/addConnection: User → SessionData
POST /sessionManager/resumeConnection: User → SessionData  
POST /sessionManager/getConnection: { userId } → SessionData | null
POST /sessionManager/updatePresence: { userId, presence } → { success: boolean }
DELETE /sessionManager/removeConnection: { userId } → { success: boolean }

interface SessionData {
  sessionId: string;
  userId: number;
  userType: 'registered' | 'guest' | 'admin';
  username: string;
  connectedAt: string;
  lastSeen: string;
  presenceStatus: 'INITIAL' | 'IN_LOBBY' | 'IN_WAITING_ROOM' | 'IN_GAME' | 'OFFLINE';
}
```

### **WaitingRoom WebSocket API (Enhanced):**
```typescript
// Client → Server
GET_ROOM_DATA: { sessionId, roomId }
PLAYER_UPDATE: { sessionId, roomId, updateData }
LEAVE_ROOM: { sessionId, roomId }

// Server → Client  
ROOM_DATA: { 
  room: GameRoom, 
  playerRole: 'host' | 'player',
  connectionInfo: { connectedPlayers: number, disconnectedPlayers: number }
}
PLAYER_STATUS_UPDATE: { 
  players: PlayerWithStatus[] // Includes connectionStatus and displayStatus
}
ERROR: { code: string, message: string }
```

## Docker Compose Configuration
```yaml
services:
  db:
    image: postgres:15
    ports: ["7432:5432"]
    environment:
      POSTGRES_DB: kingsmaker
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres

  sessionmanager:
    build: 
      context: ..
      dockerfile: Server/services/sessionManager/Dockerfile
    ports: ["7007:3000"]
    depends_on: [db]
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/kingsmaker

  auth:
    build:
      context: ..
      dockerfile: Server/services/auth/Dockerfile
    ports: ["7001:3000"]
    depends_on: [db, sessionmanager]
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/kingsmaker
      SESSION_MANAGER_URL: http://sessionmanager:3000

  lobby:
    build:
      context: ..
      dockerfile: Server/services/lobby/Dockerfile
    ports: ["7004:3000"]
    depends_on: [db, sessionmanager]
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/kingsmaker
      SESSION_MANAGER_URL: http://sessionmanager:3000
      WAITING_ROOM_URL: http://waitingRoom:3000

  waitingroom:
    build:
      context: ..
      dockerfile: Server/services/waitingRoom/Dockerfile
    ports: ["7005:3000"]
    depends_on: [db, sessionmanager]
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/kingsmaker
      SESSION_MANAGER_URL: http://sessionmanager:3000

  # Other services follow similar pattern...
```

## Performance Characteristics

### **Session Management Performance:**
```
SessionManager (In-Memory):
- Lookup: O(1) HashMap access
- Memory usage: ~200KB per 1000 active sessions
- Throughput: 10,000+ requests/second
- Latency: <1ms for session validation

PostgreSQL (Persistent):
- Session storage: Embedded in User table
- Lookup: O(1) with sessionId index
- Durability: ACID compliant
- Backup/Recovery: Standard PostgreSQL tools
```

### **Service Communication Latency:**
```
Service → SessionManager: 1-5ms (internal HTTP)
Service → PostgreSQL: 5-20ms (database query)
Client → Service: 50-200ms (external HTTP/WebSocket)
```

## Scaling Considerations

### **SessionManager Scaling:**
```
Current: Single in-memory instance
Future: Horizontal scaling options:
- Sticky sessions with load balancer
- Redis cluster for shared session state
- Database-backed session validation
```

### **Service Scaling:**
```
Stateless Services (auth, lobby, chat, store):
- Scale horizontally via load balancer
- All state managed via SessionManager

Stateful Services (waitingRoom, game):
- Scale per-room/per-game instances
- Session validation still via SessionManager
```

## Security & Validation

### **Session Security:**
```
1. SessionId generation: Cryptographically secure random
2. Session expiration: Configurable timeout in database
3. Session validation: All services validate via SessionManager
4. Session cleanup: Automatic expiration + manual logout
```

### **Service Security:**
```
1. Internal HTTP: Services communicate via internal network
2. Session validation: Required for all authenticated endpoints
3. Rate limiting: Per-service basis
4. Input validation: All user inputs validated
``` 