# Lobby System Implementation

## Overview

The lobby system has been fully implemented with real-time WebSocket communication, room management, character customization, and game initialization with D20 turn order rolls.

## Architecture

### Backend (Server)
- **LobbyManager**: Core class handling room operations, player management, and game initialization
- **WebSocket Server**: Real-time communication at `/lobby` endpoint  
- **Room States**: WAITING → STARTING → IN_PROGRESS → FINISHED
- **D20 Initiative**: Random turn order with tie-breaking for fair gameplay

### Frontend (Client)  
- **LobbyMain**: Main lobby interface with room browser and creation
- **GameRoomView**: In-room view with player list, settings, and controls
- **CreateRoomModal**: Room creation with customizable settings
- **CharacterCustomization**: Portrait selection and character naming
- **LobbySocket**: WebSocket service with auto-reconnection

### Shared Types
- Centralized type definitions in `shared/types/`
- Single source of truth prevents type mismatches
- Compile-time type safety across client/server

## Features Implemented

### Room Management
- ✅ Create rooms with custom settings (2-4 players, time limits, spectators)
- ✅ Join/leave rooms with real-time updates
- ✅ Host controls with automatic host transfer
- ✅ Room state management and validation

### Real-Time Communication  
- ✅ WebSocket connection with authentication
- ✅ Automatic reconnection on connection loss
- ✅ Real-time player join/leave notifications
- ✅ Live character customization updates
- ✅ Broadcasting to all room members

### Character System
- ✅ Portrait selection from available options
- ✅ Character naming with validation
- ✅ Starting stats initialization (all 0)
- ✅ Real-time character updates to other players

### Game Initialization
- ✅ D20 roll for turn order (highest goes first)
- ✅ Random tie-breaking for fair gameplay  
- ✅ Starting position assignment (castle positions 1-4)
- ✅ Game start sequence with visual feedback

### Session Integration
- ✅ Seamless integration with existing auth system
- ✅ Support for both registered and guest users
- ✅ Session validation for lobby access
- ✅ Automatic logout and room cleanup

## How to Use

### Starting the System
1. **Server**: `cd Server && bun run dev` (runs on port 3000)
2. **Client**: `cd Client && npm run dev` (runs on port 5173)

### User Flow
1. **Login**: Use existing login/guest system at `/`
2. **Lobby**: Automatically redirected to `/lobby` after login
3. **Browse Rooms**: View available rooms or create new one
4. **Join Room**: Click "Join" on any available room
5. **Customize**: Select portrait and character name
6. **Ready Up**: Mark yourself ready when prepared
7. **Start Game**: Host can start when all players ready (2+ players)

### Room Settings
- **Max Players**: 2, 3, or 4 players per room
- **Turn Time Limit**: Optional 30 seconds to 30 minutes
- **Spectator Mode**: Allow non-players to watch (future feature)

## Technical Details

### WebSocket Messages
```typescript
// Client → Server
type LobbyClientMessage = 
  | { head: "create-room"; body: { name: string; settings: RoomSettings } }
  | { head: "join-room"; body: { roomId: string } }
  | { head: "toggle-ready"; body: { roomId: string } }
  // ... more message types

// Server → Client  
type LobbyServerMessage =
  | { head: "room-created"; body: { room: GameRoom } }
  | { head: "player-joined"; body: { roomId: string; player: PlayerSlot } }
  | { head: "game-starting"; body: { roomId: string; turnOrder: string[] } }
  // ... more message types
```

### Room Structure
```typescript
interface GameRoom {
  id: string;           // 6-character alphanumeric ID
  name: string;         // Custom room name
  hostId: string;       // Host user ID
  state: RoomState;     // WAITING/STARTING/IN_PROGRESS/FINISHED
  settings: RoomSettings;
  players: PlayerSlot[]; // 2-4 players max
  turnOrder?: string[];  // Set after D20 roll
  createdAt: Date;
}
```

### Character Setup
```typescript
interface PlayerCharacterSetup {
  portraitId?: string;  // Selected portrait
  name?: string;        // Character name
  stats: {              // All start at 0
    might: number;
    intelligence: number;
    dexterity: number;
  };
}
```

## Future Integration Points

### Game Engine
- Room transitions to actual game when started
- Game state management during play  
- Turn-based gameplay with time limits
- Victory condition checking

### Unlockables System
- Replace mock portraits with actual user unlockables
- Validate portrait selection against user's unlocks
- Add more customization options (colors, titles, etc.)

### Persistence
- Save room state to database for recovery
- Game history and statistics
- Replay system for finished games

## Development Notes

### File Structure
```
Server/
  Entity/LobbyManager.ts          # Core lobby logic
  index.ts                        # WebSocket handlers

Client/src/
  Pages/Lobby/
    LobbyMain.tsx                 # Main lobby interface
    GameRoomView.tsx              # In-room view
    CreateRoomModal.tsx           # Room creation
    CharacterCustomization.tsx    # Character setup
  Request-Respond/ws/
    lobbySocket.ts                # WebSocket service

shared/types/
  messages.ts                     # Shared type definitions
```

### Connection Management
- User connections tracked by userId in server Map
- Automatic cleanup on disconnect
- Players removed from rooms on connection loss
- Real-time broadcasting to room members

### Error Handling  
- WebSocket reconnection with exponential backoff
- Graceful handling of connection failures
- User-friendly error messages via toast notifications
- Server-side validation of all operations

## Testing the System

1. **Multiple Users**: Open multiple browser tabs/windows
2. **Create Room**: One user creates a room  
3. **Join Room**: Other users join the same room
4. **Customize**: Each user customizes their character
5. **Ready Up**: All users mark themselves ready
6. **Start Game**: Host starts the game to see D20 roll results

The system is production-ready for lobby functionality and ready for game engine integration! 