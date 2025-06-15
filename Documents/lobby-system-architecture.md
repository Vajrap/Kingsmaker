# AI CONTEXT: KingsMaker Lobby Service Architecture

> **AI Data Assistance**: This document provides lobby service context for code assistance. Not intended for human documentation.

## Service Overview
```
lobby-service (Bun:7004) → WebSocket server, Room discovery, Player tracking
Technology: Bun + WebSocket + Redis + ioredis
File: services/lobby/index.ts
```

## Redis State Management
```typescript
// Redis Keys (TTL indicated)
"loggedInUsers:<sessionId>": SessionData // 24h
"waitingRooms:<roomId>": WaitingRoomMetadata // 2h  
"waitingRoomPlayers:<roomId>": PlayerSlot[] // 2h
"playerLocation:<userId>": PlayerLocation // 30min

// State Manager: services/lobby/lib/state.ts
class LobbyStateManager {
  storeSession(sessionId, userData): Promise<void>
  getSession(sessionId): Promise<SessionData>
  storeRoom(roomId, roomData): Promise<void>
  getAllRooms(): Promise<WaitingRoomMetadata[]>
  publishRoomCreated(roomId, roomData): Promise<void>
}
```

## Pub/Sub Events
```typescript
// Published by lobby-service
room_created: { roomId: string; roomData: WaitingRoomMetadata }
room_closed: { roomId: string; reason: string }  
player_joined: { roomId: string; userId: string; playerData: PlayerSlot }
player_left: { roomId: string; userId: string }

// Subscribed by lobby-service
room_closed: (from waiting-room service)
game_ended: (from game service)
```

## WebSocket Protocol
```typescript
// Client → Server Messages
type LobbyClientMessage = 
  | { type: "GET_ROOM_LIST"; data: {} }
  | { type: "CREATE_ROOM"; data: { name: string; maxPlayers: 2|3|4 } }
  | { type: "JOIN_ROOM"; data: { roomId: string } }
  | { type: "LEAVE_ROOM"; data: { roomId: string } }
  | { type: "REFRESH_LOBBY"; data: {} };

// Server → Client Messages  
type LobbyServerMessage =
  | { type: "ROOM_LIST"; data: { rooms: WaitingRoomMetadata[] } }
  | { type: "ROOM_CREATED"; data: { room: WaitingRoomMetadata } }
  | { type: "ROOM_JOINED"; data: { roomId: string; success: boolean } }
  | { type: "LOBBY_UPDATE"; data: { rooms: WaitingRoomMetadata[]; onlinePlayers: number } }
  | { type: "ERROR"; data: { message: string; code: string } };
```

## Connection Flow
```
1. Client connects: ws://localhost:7004?sessionId=<sessionId>
2. lobby-service validates sessionId via Redis
3. Connection stored in Map<sessionId, {ws, userData}>
4. Player location updated to 'lobby'
5. Initial lobby state sent to client
```

## Core Data Types
```typescript
interface WaitingRoomMetadata {
  id: string;
  name: string;
  hostId: string;
  hostUsername: string;
  state: "WAITING" | "STARTING" | "IN_PROGRESS";
  maxPlayers: 2 | 3 | 4;
  currentPlayers: number;
  createdAt: string;
  playerList: string[];
}

interface PlayerSlot {
  userId: string;
  username: string;
  userType: 'registered' | 'guest';
  isReady: boolean;
  profile: { portraitId?: string; skinId?: string; };
  lastSeen: string;
}

interface PlayerLocation {
  location: 'lobby' | 'waiting-room' | 'game';
  roomId?: string;
  gameId?: string;
  lastSeen: string;
}
```

## Service Integration
```
Room Creation Flow:
1. Client → lobby-service: CREATE_ROOM
2. lobby-service → Redis: Store room metadata  
3. lobby-service → Redis: PUBLISH room_created
4. waiting-room service ← Redis: SUBSCRIBE room_created
5. waiting-room initializes room instance
6. lobby-service → Client: ROOM_CREATED confirmation

Player Join Flow:
1. Client → lobby-service: JOIN_ROOM
2. lobby-service validates room availability via Redis
3. lobby-service updates room player count
4. lobby-service → Redis: PUBLISH player_joined  
5. lobby-service → Client: ROOM_JOINED confirmation
6. Client transitions to waiting-room WebSocket
```

## Implementation Details
```typescript
// Main service file: services/lobby/index.ts
const wss = new WebSocketServer({ port: PORT });
const connections = new Map<string, any>(); // sessionId → {ws, userData}
const stateManager = new LobbyStateManager();

// Message handling
async function handleClientMessage(sessionId: string, message: LobbyClientMessage)
async function handleCreateRoom(sessionId: string, roomData)
async function handleJoinRoom(sessionId: string, roomId: string)
async function broadcastLobbyUpdate()

// Redis integration: services/lobby/lib/redis.ts  
import { Redis } from 'ioredis';
const redis = new Redis({ host: REDIS_HOST, port: REDIS_PORT });
const subscriber = new Redis({ host: REDIS_HOST, port: REDIS_PORT });
const publisher = new Redis({ host: REDIS_HOST, port: REDIS_PORT });
```

## Service Dependencies
```
lobby-service → redis (state management, pub/sub)
lobby-service → shared types (@kingsmaker/shared)
waiting-room ← lobby-service (via Redis pub/sub)
game-service ← lobby-service (via Redis pub/sub)
``` 