# AI CONTEXT: KingsMaker Service Separation Architecture

> **AI Data Assistance**: This document provides service separation context for code assistance. Not intended for human documentation.

## Service Matrix
```
auth-service (Bun:7001) → Login, register, guest, session management
lobby-service (Bun:7004) → WebSocket, room discovery, player tracking
waiting-room (Go:7005) → Pre-game setup, player readiness 
game-service (Go:7003) → Game instances, turn logic
redis (Redis:7379) → Central state, pub/sub coordination
postgresql (DB:7432) → Persistent data storage
```

## Service Responsibilities
```
auth-service:
  - JWT token issuing/validation
  - User registration/login/guest
  - Session storage in Redis
  - User data persistence

lobby-service:
  - Primary WebSocket connections to clients
  - Room listing and discovery
  - Player location tracking
  - Room join/leave coordination

waiting-room:  
  - Room-specific WebSocket connections
  - Pre-game configuration and readiness
  - Game start orchestration
  - Room state management

game-service:
  - Game-specific WebSocket connections  
  - Game logic execution
  - Turn management
  - Game state persistence
```

## Redis State Ownership
```typescript
// Shared state via Redis
"loggedInUsers:<sessionId>": SessionData // auth-service writes, others read
"waitingRooms:<roomId>": WaitingRoomMetadata // lobby creates, waiting-room manages
"waitingRoomPlayers:<roomId>": PlayerSlot[] // waiting-room manages
"playerLocation:<userId>": PlayerLocation // lobby-service manages
"games:<gameId>": GameState // game-service manages
```

## Inter-Service Communication
```typescript
// Pub/Sub Events
room_created: lobby-service → waiting-room
room_closed: waiting-room → lobby-service  
player_joined: lobby-service → waiting-room
player_left: waiting-room → lobby-service
game_starting: waiting-room → game-service
game_ended: game-service → lobby-service
```

## Client Connection Strategy
```
Sequential Connection Model:
1. Client → auth-service (HTTP) → Get session
2. Client → lobby-service (WebSocket) → Primary connection
3. Client → waiting-room (WebSocket) → When joining room
4. Client → game-service (WebSocket) → When game starts

Connection Rules:
- Only one active WebSocket per service per client
- Previous WebSocket closes when connecting to next service
- Redis maintains consistent state across transitions
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
auth-service → redis, postgresql
lobby-service → redis (session validation, state management)
waiting-room → redis (room state, pub/sub)
game-service → redis (game state, pub/sub)

Data Flow:
auth → redis → {lobby, waiting-room, game}
lobby ↔ waiting-room ↔ game-service (via Redis pub/sub)
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
