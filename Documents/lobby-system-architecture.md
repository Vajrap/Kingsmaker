# KingsMaker Lobby System Architecture

## Overview

The lobby system manages game room creation, player matchmaking, character selection, and game initialization for KingsMaker. It supports 2-4 players per game with real-time WebSocket communication.

---

## Game Room Structure

### Room States
- **WAITING**: Room is open, accepting players
- **STARTING**: All players ready, game initialization in progress  
- **IN_PROGRESS**: Game has started, room is locked
- **FINISHED**: Game completed

### Room Data Model
```typescript
interface GameRoom {
  id: string;                    // UUID or short code
  name: string;                  // Room display name
  hostId: string;                // Creator's user ID
  state: RoomState;
  settings: RoomSettings;
  players: PlayerSlot[];         // 2-4 slots
  turnOrder?: string[];          // Player IDs in turn order (after D20 roll)
  createdAt: Date;
  startedAt?: Date;
}

interface PlayerSlot {
  userId?: string;               // null if empty slot
  username?: string;
  userType: 'registered' | 'guest';
  isReady: boolean;
  character: PlayerCharacterSetup;
  position?: number;             // Starting castle position (1-4)
}

interface PlayerCharacterSetup {
  portraitId?: string;           // Selected portrait from unlockables
  name?: string;                 // Character name
  stats: {                       // Starting stat allocation (if any)
    might: number;
    intelligence: number;
    dexterity: number;
  };
}

interface RoomSettings {
  maxPlayers: 2 | 3 | 4;        // Room capacity
  mapId?: string;               // Map/scenario selection
  turnTimeLimit?: number;       // Seconds per turn (optional)
  spectatorMode: boolean;       // Allow spectators
}
```

---

## WebSocket Events

### Client → Server Messages
```typescript
type LobbyClientMessage = 
  | { type: "CREATE_ROOM"; data: { name: string; settings: RoomSettings } }
  | { type: "JOIN_ROOM"; data: { roomId: string } }
  | { type: "LEAVE_ROOM"; data: { roomId: string } }
  | { type: "UPDATE_CHARACTER"; data: { character: PlayerCharacterSetup } }
  | { type: "TOGGLE_READY"; data: { roomId: string } }
  | { type: "START_GAME"; data: { roomId: string } }
  | { type: "GET_ROOM_LIST" }
  | { type: "GET_ROOM_INFO"; data: { roomId: string } };
```

### Server → Client Messages  
```typescript
type LobbyServerMessage =
  | { type: "ROOM_CREATED"; data: { room: GameRoom } }
  | { type: "ROOM_JOINED"; data: { room: GameRoom } }
  | { type: "ROOM_LEFT"; data: { roomId: string } }
  | { type: "ROOM_UPDATED"; data: { room: GameRoom } }
  | { type: "PLAYER_JOINED"; data: { roomId: string; player: PlayerSlot } }
  | { type: "PLAYER_LEFT"; data: { roomId: string; userId: string } }
  | { type: "CHARACTER_UPDATED"; data: { roomId: string; userId: string; character: PlayerCharacterSetup } }
  | { type: "GAME_STARTING"; data: { roomId: string; turnOrder: string[] } }
  | { type: "GAME_STARTED"; data: { roomId: string; gameId: string } }
  | { type: "ROOM_LIST"; data: { rooms: GameRoom[] } }
  | { type: "ERROR"; data: { message: string } };
```

---

## Data Storage

### In-Memory Storage (Development)
```typescript
class LobbyManager {
  private rooms: Map<string, GameRoom> = new Map();
  private playerRooms: Map<string, string> = new Map(); // userId → roomId
  
  createRoom(hostId: string, settings: RoomSettings): GameRoom
  joinRoom(roomId: string, userId: string): GameRoom | null
  leaveRoom(roomId: string, userId: string): void
  updateCharacter(roomId: string, userId: string, character: PlayerCharacterSetup): void
  toggleReady(roomId: string, userId: string): void
  startGame(roomId: string): GameInstance | null
}
```

### Future: Redis Storage (Production)
- Store rooms with TTL for auto-cleanup
- Pub/Sub for multi-server support
- Persistence for game recovery

---

## Game Initialization Flow

### 1. Room Setup
- Host creates room with settings
- Players join room (2-4 slots)
- Players select portraits and customize characters
- Players mark themselves ready

### 2. Character Selection
- **Portrait Selection**: Choose from unlocked portraits
- **Character Name**: Optional custom name
- **Starting Stats**: All start at 0 (from character.md)
- **No Skills**: Player Character starts with no skills

### 3. Game Start Sequence
```typescript
async function startGame(room: GameRoom): Promise<GameInstance> {
  // 1. Validate all players ready
  if (!allPlayersReady(room)) throw new Error("Not all players ready");
  
  // 2. Roll D20 for turn order (highest goes first)
  const turnOrder = rollInitiative(room.players);
  
  // 3. Assign starting positions (castles)
  const startingPositions = assignStartingCastles(room.players, room.settings.mapId);
  
  // 4. Create game instance
  const gameInstance = new GameInstance({
    roomId: room.id,
    players: room.players,
    turnOrder,
    startingPositions,
    map: loadMap(room.settings.mapId)
  });
  
  // 5. Transition room state
  room.state = "IN_PROGRESS";
  room.startedAt = new Date();
  
  return gameInstance;
}
```

### 4. Starting Conditions (from game.md & location.md)
- Each player starts with **1 Castle**
- Turn order by D20 roll (highest first, then clockwise)
- Starting resources based on castle location
- Character starts with 0 in all stats

---

## Integration Points

### Authentication
- Use existing session system for player identification
- Validate session tokens for WebSocket connections
- Handle guest vs registered user differences

### Unlockables
- Load player's unlocked portraits for selection
- Validate selected portraits against user's unlockables
- Default portraits for guests

### Game Engine
- Transition from lobby to actual game logic
- Maintain game state during play
- Handle reconnections and spectator mode

---

## Technical Implementation

### WebSocket Server (Server)
```typescript
// WebSocket handler for lobby events
app.ws("/lobby", (ws, req) => {
  const sessionId = getSessionFromRequest(req);
  const user = validateSession(sessionId);
  
  ws.on("message", (data) => {
    const message = JSON.parse(data);
    handleLobbyMessage(ws, user, message);
  });
});
```

### Lobby Manager (Server)
```typescript
class LobbyManager {
  // Room management
  // Player management  
  // WebSocket broadcasting
  // Game initialization
}
```

### Lobby UI (Client)
- Room list/browser
- Room creation dialog
- In-room player list
- Character customization panel
- Ready status indicators
- Game start countdown

---

## Future Enhancements

- **Spectator Mode**: Allow non-players to watch games
- **Room Persistence**: Save rooms to database for recovery
- **Advanced Matchmaking**: ELO-based matching, skill groups
- **Game Replay**: Save and replay finished games
- **Tournament Mode**: Bracket-style competitions
- **Custom Maps**: User-generated map support 