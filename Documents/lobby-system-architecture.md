# AI CONTEXT: KingsMaker Lobby Service Architecture

> **AI Data Assistance**: This document provides lobby service context for code assistance. **UPDATED** to reflect SessionManager service integration.

## Service Overview
```
lobby-service (Bun:7004) → WebSocket server, Room discovery, Player tracking
sessionManager-service (Bun:7007) → Session validation, presence tracking
Technology: Bun + WebSocket + Redis (room state) + SessionManager (session validation)
File: services/lobby/index.ts
```

## State Management Split
```typescript
// SessionManager (In-Memory) - Session & Presence
Map<userId, ConnectedClient> where ConnectedClient = {
  sessionId: string;
  userType: 'registered' | 'guest' | 'admin';
  username: string;
  presenceStatus: 'INITIAL' | 'IN_LOBBY' | 'IN_WAITING_ROOM' | 'IN_GAME' | 'OFFLINE';
  lastSeen: Date;
  connectedAt: Date;
}

// Redis - Room State Only
"waitingRooms:<roomId>": WaitingRoomMetadata // 2h TTL
"waitingRoomPlayers:<roomId>": PlayerSlot[] // 2h TTL

// State Manager: services/lobby/lib/state.ts
class LobbyStateManager {
  storeRoom(roomId, roomData): Promise<void>
  getAllRooms(): Promise<WaitingRoomMetadata[]>
  publishRoomCreated(roomId, roomData): Promise<void>
}
```

## Session Validation Pattern
```typescript
// services/lobby/lib/sessionServiceClient.ts
const SESSION_MANAGER_URL = process.env.SESSION_MANAGER_URL || "http://sessionmanager:3000";

export async function validateSession(userId: number): Promise<ConnectedClient | null> {
    const response = await fetch(`${SESSION_MANAGER_URL}/getConnection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
    });
    
    const json = await response.json();
    return json.success ? json.data : null;
}

export async function updatePresence(userId: number, presence: string): Promise<boolean> {
    const response = await fetch(`${SESSION_MANAGER_URL}/updatePresence`, {
        method: 'POST',
        body: JSON.stringify({ userId, presence })
    });
    
    const json = await response.json();
    return json.success;
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
2. lobby-service validates sessionId via SessionManager HTTP API
3. SessionManager updates presence to 'IN_LOBBY'
4. Connection stored in Map<sessionId, {ws, userData}>
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

interface ConnectedClient {
  sessionId: string;
  userType: 'registered' | 'guest' | 'admin';
  username: string;
  presenceStatus: 'INITIAL' | 'IN_LOBBY' | 'IN_WAITING_ROOM' | 'IN_GAME' | 'OFFLINE';
  lastSeen: Date;
  connectedAt: Date;
}
```

## Service Integration
```
Room Creation Flow:
1. Client → lobby-service: CREATE_ROOM
2. lobby-service validates session via SessionManager HTTP API
3. lobby-service → Redis: Store room metadata  
4. lobby-service → Redis: PUBLISH room_created
5. waiting-room service ← Redis: SUBSCRIBE room_created
6. waiting-room initializes room instance
7. lobby-service → Client: ROOM_CREATED confirmation

Player Join Flow:
1. Client → lobby-service: JOIN_ROOM
2. lobby-service validates session via SessionManager HTTP API
3. lobby-service validates room availability via Redis
4. lobby-service → SessionManager: updatePresence(userId, 'IN_WAITING_ROOM')
5. lobby-service → Redis: PUBLISH player_joined  
6. lobby-service → Client: ROOM_JOINED confirmation
7. Client transitions to waiting-room WebSocket
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

// SessionManager integration: services/lobby/lib/sessionServiceClient.ts  
import { validateSession, updatePresence } from './sessionServiceClient';

// Redis integration (room state only): services/lobby/lib/redis.ts
import { Redis } from 'ioredis';
const redis = new Redis({ host: REDIS_HOST, port: REDIS_PORT });
const subscriber = new Redis({ host: REDIS_HOST, port: REDIS_PORT });
const publisher = new Redis({ host: REDIS_HOST, port: REDIS_PORT });
```

## Service Dependencies
```
lobby-service → sessionManager-service (session validation, presence tracking)
lobby-service → redis (room state management, pub/sub)
lobby-service → shared types (@kingsmaker/shared)
waiting-room ← lobby-service (via Redis pub/sub)
game-service ← lobby-service (via Redis pub/sub)
``` 