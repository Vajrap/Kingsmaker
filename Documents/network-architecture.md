# AI CONTEXT: KingsMaker Network Architecture

> **AI Data Assistance**: This document provides architectural context for code assistance. **UPDATED** to reflect SessionManager service integration.

## Service Matrix
```
auth-service (Bun:7001) → Authentication, sessionId generation, user validation
sessionManager-service (Bun:7007) → Presence tracking, connection management
lobby-service (Bun:7004) → WebSocket, Room discovery, Player tracking  
waiting-room (Go:7005) → Pre-game rooms, Player readiness
game-service (Go:7003) → Game instances, Turn logic
redis (Redis:7379) → State management, Pub/sub (room/game state only)
db (PostgreSQL:7432) → Persistent data
```

## SessionManager State (In-Memory)
```typescript
// SessionManager tracks presence in-memory
Map<userId, ConnectedClient> where ConnectedClient = {
  sessionId: string;
  userType: 'registered' | 'guest' | 'admin';
  username: string;
  presenceStatus: 'INITIAL' | 'IN_LOBBY' | 'IN_WAITING_ROOM' | 'IN_GAME' | 'OFFLINE';
  lastSeen: Date;
  connectedAt: Date;
}
```

## Redis State Keys (Non-Session)
```typescript
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
1. Client → auth-service (HTTP) → sessionId + presenceStatus
2. Client routing based on presenceStatus:
   - INITIAL/IN_LOBBY → lobby-service (WebSocket)
   - IN_WAITING_ROOM → waiting-room (WebSocket)
   - IN_GAME → game-service (WebSocket)
3. Services validate sessions via SessionManager HTTP API
```

## Message Types
```typescript
// Lobby WebSocket
LobbyClientMessage: GET_ROOM_LIST | CREATE_ROOM | JOIN_ROOM | LEAVE_ROOM
LobbyServerMessage: ROOM_LIST | ROOM_CREATED | LOBBY_UPDATE | ERROR

// Auth HTTP
POST /auth/login: { username, password } → { sessionId, presenceStatus, user }
POST /auth/guest: { preferredUsername? } → { sessionId, presenceStatus, user }
POST /auth/autoLogin: { token } → { sessionId, presenceStatus, user }

// SessionManager HTTP
POST /sessionManager/addConnection: User → SessionManagerUserLoginResponse
POST /sessionManager/getConnection: { userId } → ConnectedClient
POST /sessionManager/updatePresence: { userId, presence } → success
DELETE /sessionManager/removeConnection: { userId } → success
```

## Service Dependencies
```
auth-service → postgresql, sessionManager-service
sessionManager-service → postgresql (user validation)
lobby-service → redis (room state), sessionManager-service (session validation)
waiting-room → redis (room state), sessionManager-service (session validation)
game-service → redis (game state), sessionManager-service (session validation)
```

## Core Types
```typescript
interface SessionManagerUserLoginResponse {
  sessionId: string;
  userId: number;
  userType: 'registered' | 'guest' | 'admin';
  username: string;
  connectedAt: string;
  lastSeen: string;
  presenceStatus: 'INITIAL' | 'IN_LOBBY' | 'IN_WAITING_ROOM' | 'IN_GAME' | 'OFFLINE';
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