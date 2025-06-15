# AI CONTEXT: KingsMaker Network Architecture

> **AI Data Assistance**: This document provides architectural context for code assistance. Not intended for human documentation.

## Service Matrix
```
auth-service (Bun:7001) → Authentication, JWT, Sessions
lobby-service (Bun:7004) → WebSocket, Room discovery, Player tracking  
waiting-room (Go:7005) → Pre-game rooms, Player readiness
game-service (Go:7003) → Game instances, Turn logic
redis (Redis:7379) → State management, Pub/sub
db (PostgreSQL:7432) → Persistent data
```

## Redis State Keys
```typescript
"loggedInUsers:<sessionId>": SessionData // TTL: 24h
"waitingRooms:<roomId>": WaitingRoomMetadata // TTL: 2h  
"waitingRoomPlayers:<roomId>": PlayerSlot[] // TTL: 2h
"playerLocation:<userId>": PlayerLocation // TTL: 30min
"games:<gameId>": GameState // TTL: 4h
```

## Pub/Sub Channels
```typescript
room_created: { roomId, roomData }
room_closed: { roomId, reason }
player_joined: { roomId, userId, playerData }
player_left: { roomId, userId }
game_starting: { roomId, gameId }
game_ended: { roomId, gameId }
```

## Client Connection Flow
```
1. Client → auth-service (HTTP) → JWT + sessionId
2. Client → lobby-service (WebSocket) → session validation via Redis
3. Client → waiting-room (WebSocket) → room-specific connection
4. Client → game-service (WebSocket) → game-specific connection
```

## Message Types
```typescript
// Lobby WebSocket
LobbyClientMessage: GET_ROOM_LIST | CREATE_ROOM | JOIN_ROOM | LEAVE_ROOM
LobbyServerMessage: ROOM_LIST | ROOM_CREATED | LOBBY_UPDATE | ERROR

// Auth HTTP
POST /auth/login: { email, password } → { token, sessionId, user }
POST /auth/guest: { nickname? } → { token, sessionId, user }
POST /auth/refresh: Bearer token → { token, expiresAt }
```

## Service Dependencies
```
lobby-service → redis, db
waiting-room → redis, db  
game-service → redis, db
auth-service → redis, db
```

## Core Types
```typescript
interface SessionData {
  userId: string;  
  userType: 'registered' | 'guest';
  username: string;
  connectedAt: string;
}

interface WaitingRoomMetadata {
  id: string;
  name: string; 
  hostId: string;
  state: 'WAITING' | 'STARTING' | 'IN_PROGRESS';
  maxPlayers: 2 | 3 | 4;
  currentPlayers: number;
}
``` 