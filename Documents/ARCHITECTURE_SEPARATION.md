# AI CONTEXT: KingsMaker Service Separation Architecture

> **AI Data Assistance**: This document provides service separation context for code assistance. **UPDATED** to reflect SessionManager service and authority-based validation.

## Service Matrix
```
auth-service (Bun:7001) → Identity validation, credential management
sessionManager-service (Bun:7007) → Presence tracking, connection management
lobby-service (Bun:7004) → Room discovery, WebSocket coordination
waiting-room (Go:7005) → Pre-game rooms, player readiness
game-service (Go:7003) → Game instances, turn logic
redis (Redis:7379) → State storage, pub/sub coordination
postgresql (DB:7432) → Persistent data storage
```

## Service Responsibilities
```
auth-service:
  - User credential validation
  - SessionId generation/expiration
  - User registration/login/guest
  - Database user data persistence
  - Initial session establishment

sessionManager-service:
  - User presence status tracking  
  - Connection state management
  - Presence transition validation
  - In-memory session store (no Redis)

lobby-service:
  - Room listing and discovery
  - Room creation/join coordination  
  - WebSocket room management
  - Redis room state storage

waiting-room:  
  - Pre-game room validation
  - Player readiness management
  - Game start orchestration
  - Room membership validation

game-service:
  - Game instance validation
  - Game logic execution
  - Turn management  
  - Game state persistence
```

## Authority-Based State Ownership
```typescript
// Each service owns its authority domain
Auth Service (DB):
  - User credentials, profiles
  - SessionId generation/expiration

SessionManager Service (In-Memory):
  - User presence status
  - Connection tracking

Lobby Service (Redis):
  - "waitingRooms:<roomId>": WaitingRoomMetadata
  - Room discovery/listing state

WaitingRoom Service (Redis):
  - "waitingRoomPlayers:<roomId>": PlayerSlot[]
  - "userRoomMapping:<userId>": { roomId }

Game Service (Redis):
  - "games:<gameId>": GameState
  - "userGameMapping:<userId>": { gameId }
```

## Inter-Service Communication
```typescript
// HTTP Service-to-Service Calls
Auth ↔ SessionManager: addConnection, resumeConnection, updatePresence
Lobby → SessionManager: validateSession, updatePresence
WaitingRoom → SessionManager: validateSession, updatePresence  
Game → SessionManager: validateSession, updatePresence

// Pub/Sub Events (Redis)
room_created: lobby-service → waiting-room
room_closed: waiting-room → lobby-service  
player_joined: lobby-service → waiting-room
player_left: waiting-room → lobby-service
game_starting: waiting-room → game-service
game_ended: game-service → lobby-service
```

## Client Connection Strategy
```
Presence-Based Routing Model:
1. Client → auth-service (HTTP) → Get session + presenceStatus
2. Client routing based on presenceStatus:
   - INITIAL/IN_LOBBY → lobby-service (WebSocket)
   - IN_WAITING_ROOM → waiting-room validation → WebSocket
   - IN_GAME → game-service validation → WebSocket

Validation Rules:
- Services validate their own authority before connection
- Invalid presence claims redirect to lobby
- SessionManager tracks presence across all transitions
```

## Technology Choices
```
Bun Services (auth, lobby):
  - Fast I/O performance
  - Rapid development cycle
  - Built-in WebSocket support
  - Native JWT handling

Go Services (waiting-room, game):
  - High concurrency (goroutines)
  - Efficient memory usage
  - CPU-intensive game logic
  - Isolated per-instance scaling

Redis:
  - Central state coordinator
  - TTL-based automatic cleanup
  - Pub/sub for decoupled communication
  - Single source of truth
```

## Service Dependencies
```
auth-service → postgresql, sessionManager-service
sessionManager-service → postgresql (user validation)
lobby-service → redis, sessionManager-service
waiting-room → redis, sessionManager-service
game-service → redis, sessionManager-service

Authority Flow:
auth → sessionManager (presence tracking)
{lobby, waiting-room, game} → sessionManager (presence validation)
{lobby, waiting-room, game} ↔ redis (state storage/pub-sub)
```

## Deployment Architecture
```yaml
# Docker Compose Structure
services:
  redis: [Redis 7 Alpine]
  db: [PostgreSQL 15]
  auth: [Bun service, depends_on: redis, db]
  lobby: [Bun service, depends_on: redis]  
  waiting-room: [Go service, depends_on: redis]
  game: [Go service, depends_on: redis]
```

## Scaling Strategy
```
Horizontal Scaling:
- auth-service: Stateless, scale via load balancer
- lobby-service: Redis-backed state, scale with sticky sessions

Vertical Scaling:  
- waiting-room: Per-room Go routines
- game-service: Per-game Go routines/processes

Isolation Benefits:
- Service failures don't cascade
- Independent technology optimization
- Clear responsibility boundaries
- Solo developer maintainability
```
