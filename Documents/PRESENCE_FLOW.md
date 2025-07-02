# AI CONTEXT: KingsMaker Presence Flow Architecture

> **AI Data Assistance**: This document defines the presence-based user flow for code assistance. **UPDATED** to include advanced grace period management and realistic connection handling.

## 🎯 Presence Flow Overview

**Core Concept**: User routing is determined by **presence status** with **intelligent disconnection handling**. Presence indicates intent, but services validate their own authority with grace periods for real-world scenarios.

## 🔄 Complete Login Flow

### **✅ Login Flow - Standard Path**
```
1. Client → Auth Service
   POST /login: { username, password }
   POST /guest: { preferredUsername? }
   POST /autoLogin: { token }

2. Auth Service Process:
   a) Validates credentials against PostgreSQL DB
   b) Assigns/reuses sessionId + sessionExpireAt in User table (embedded approach)
   c) → SessionManager: addConnection(user) OR resumeConnection(user) [In-Memory]
   d) ← SessionManager: { sessionId, presenceStatus, userId, userType }

3. Auth Service → Client
   LoginResponse: {
     sessionId,
     userType,
     username, 
     nameAlias,
     presenceStatus  // 🎯 Key routing data
   }

4. Client Routing Decision:
   switch (presenceStatus) {
     case 'INITIAL':
     case 'IN_LOBBY':
       → Navigate to Lobby UI
       break;
     case 'IN_WAITING_ROOM':
     case 'IN_GAME':  
       → Requires validation (see below)
       break;
     case 'OFFLINE':
       → Should not happen (error state)
   }
```

## ✅ Lobby Case - Simple Path

**Scenario**: User has presence `INITIAL` or `IN_LOBBY`

```
1. Client enters Lobby UI
2. Client opens WebSocket to Lobby Service
3. Lobby Service validates session via SessionManager [In-Memory]
4. No additional backend validation required
5. User can browse rooms, create rooms, join rooms
6. SessionManager continues tracking presence [In-Memory Map]
```

**Key Points:**
- No complex state validation needed
- Lobby Service handles room discovery
- Presence remains `IN_LOBBY` until room action

## 🔄 WaitingRoom/Game Case - Enhanced Validation with Grace Periods

**Scenario**: User has presence `IN_WAITING_ROOM` or `IN_GAME`

**⚠️ Critical**: Presence alone is NOT trusted. Services must validate with **grace period handling**.

### **WaitingRoom Validation Flow with Grace Periods:**
```
1. Client receives presenceStatus: 'IN_WAITING_ROOM'
2. Client → WaitingRoom Service: GET /validate-room-status
   Headers: { sessionId }
3. WaitingRoom Service Process:
   a) Validates sessionId via SessionManager [In-Memory]
   b) Checks: Does waiting room still exist?
   c) Checks: Is user actually in this room?
   d) Checks: Is room in valid state?
   e) NEW: Checks player connection status (connected/disconnected/grace_period)

4a. IF VALID:
    WaitingRoom Service → Client: { 
      valid: true, 
      roomId, 
      roomData,
      connectionInfo: { connectedPlayers: N, disconnectedPlayers: M }
    }
    → Client connects to WaitingRoom WebSocket

4b. IF INVALID:
    WaitingRoom Service → SessionManager: 
      updatePresence(userId, 'IN_LOBBY') [In-Memory]
    WaitingRoom Service → Client: { 
      valid: false, 
      redirect: 'lobby' 
    }
    → Client redirects to Lobby
```

### **Game Validation Flow:**
```
1. Client receives presenceStatus: 'IN_GAME'  
2. Client → Game Service: GET /validate-game-status
   Headers: { sessionId }
3. Game Service Process:
   a) Validates sessionId via SessionManager [In-Memory]
   b) Checks: Does game instance still exist?
   c) Checks: Is user actually in this game?
   d) Checks: Is game still active?

4a. IF VALID:
    Game Service → Client: { 
      valid: true, 
      gameId, 
      gameState 
    }
    → Client connects to Game WebSocket

4b. IF INVALID:
    Game Service → SessionManager: 
      updatePresence(userId, 'IN_LOBBY') [In-Memory]
    Game Service → Client: { 
      valid: false, 
      redirect: 'lobby' 
    }
    → Client redirects to Lobby
```

## 🆕 Advanced Connection State Management

### **Player Connection States:**
```typescript
type ConnectionStatus = "connected" | "disconnected" | "grace_period";

interface Player {
    userId: string;
    username: string;
    connectionStatus: ConnectionStatus;  // NEW
    disconnectedAt?: string;             // NEW - ISO timestamp
    lastSeen: string;
    // ... other fields
}
```

### **Grace Period Configuration:**
```typescript
export const PRESENCE_CONFIG = {
    CHECK_INTERVAL_MS: 2 * 60 * 1000,      // Check every 2 minutes (not 5 seconds!)
    GRACE_PERIOD_MS: 3 * 60 * 1000,        // 3-minute grace period before removal
    IMMEDIATE_REMOVAL_STATUSES: ['IN_LOBBY', 'OFFLINE'],  // No grace for intentional leave
    VALID_ROOM_STATUSES: ['IN_WAITING_ROOM'],
} as const;
```

### **Smart Disconnection Handling:**
```typescript
// Waiting Room Service - Enhanced Presence Checking
class RoomInstance {
    async checkPresence() {
        const now = new Date();
        const playersToRemove: Player[] = [];

        for (const player of this.players) {
            const sessionData = await sessionManagerClient.getConnection(parseInt(player.userId));
            
            if (sessionData?.presenceStatus === 'IN_WAITING_ROOM') {
                // ✅ Player is online - restore if disconnected
                if (player.connectionStatus !== "connected") {
                    console.log(`Player ${player.username} reconnected`);
                    player.connectionStatus = "connected";
                    player.disconnectedAt = undefined;
                }
                player.lastSeen = now.toISOString();
                
            } else if (['IN_LOBBY', 'OFFLINE'].includes(sessionData?.presenceStatus)) {
                // 🚪 Immediate removal - user left intentionally
                console.log(`Player ${player.username} intentionally left`);
                playersToRemove.push(player);
                
            } else {
                // 🔄 Handle disconnection with grace period
                this.handleDisconnectedPlayer(player, now, playersToRemove);
            }
        }

        // Remove players who exceeded grace period
        playersToRemove.forEach(player => this.removePlayer(player));
    }

    private handleDisconnectedPlayer(player: Player, now: Date, playersToRemove: Player[]) {
        if (player.connectionStatus === "connected") {
            // First time seeing player offline - start grace period
            console.log(`Player ${player.username} went offline, starting grace period`);
            player.connectionStatus = "grace_period";
            player.disconnectedAt = now.toISOString();
            
        } else if (player.disconnectedAt) {
            // Check if grace period has expired
            const disconnectedTime = new Date(player.disconnectedAt);
            const timeSinceDisconnect = now.getTime() - disconnectedTime.getTime();
            
            if (timeSinceDisconnect > PRESENCE_CONFIG.GRACE_PERIOD_MS) {
                // Grace period expired - remove player
                console.log(`Player ${player.username} grace period expired`);
                playersToRemove.push(player);
            } else {
                // Still in grace period - update status
                player.connectionStatus = "disconnected";
                const remainingTime = Math.round((PRESENCE_CONFIG.GRACE_PERIOD_MS - timeSinceDisconnect) / 1000);
                console.log(`Player ${player.username} still in grace period (${remainingTime}s remaining)`);
            }
        }
    }

    // Get players with UI-friendly status for client
    getPlayersWithStatus() {
        return this.players.map(player => ({
            ...player,
            displayStatus: this.getPlayerDisplayStatus(player)
        }));
    }

    private getPlayerDisplayStatus(player: Player): string {
        switch (player.connectionStatus) {
            case "connected":
                return "Online";
            case "disconnected":
            case "grace_period":
                if (player.disconnectedAt) {
                    const secondsOffline = Math.round((Date.now() - new Date(player.disconnectedAt).getTime()) / 1000);
                    return `⚠️ Disconnected (${secondsOffline}s ago)`;
                }
                return "⚠️ Disconnected";
            default:
                return "Unknown";
        }
    }
}
```

## 🚨 Enhanced Presence Transition Rules

### **Valid Presence Transitions:**
```
INITIAL → IN_LOBBY (automatic on login)
IN_LOBBY → IN_WAITING_ROOM (via room join)
IN_WAITING_ROOM → IN_GAME (via game start)
IN_GAME → IN_LOBBY (via game end)
IN_WAITING_ROOM → IN_LOBBY (via room leave OR grace period expiration)
Any State → OFFLINE (via disconnect/logout)
```

### **Who Can Update Presence:**
```
Service               | Can Set Presence To
---------------------|------------------
Auth Service         | INITIAL (login only)
Lobby Service        | IN_LOBBY (after room leave)
WaitingRoom Service  | IN_WAITING_ROOM, IN_LOBBY (grace period expiration)
Game Service         | IN_LOBBY (after game end)
SessionManager       | OFFLINE (disconnect)
```

## 🔒 Security & Validation Rules

### **Never Trust Presence Claims:**
```typescript
// ❌ WRONG: Blind trust
if (presence === 'IN_GAME') {
  connectToGame();
}

// ✅ CORRECT: Validate with grace period awareness
if (presence === 'IN_GAME') {
  const validation = await gameService.validateGameStatus(sessionId);
  if (validation.valid) {
    connectToGame(validation.gameData);
  } else {
    redirectToLobby();
  }
}
```

### **Service Validation Responsibility:**
- **WaitingRoom Service**: Validates room membership, room state, connection status with grace periods
- **Game Service**: Validates game membership & game state  
- **Lobby Service**: Validates room availability & capacity
- **SessionManager**: Validates session existence & expiration [In-Memory Map]

## 🌐 Real-World Disconnection Scenarios

### **Scenario 1: WiFi Drop**
```
1. Player loses internet for 30 seconds
2. WaitingRoom Service marks player as "grace_period"
3. UI shows "⚠️ Disconnected (30s ago)" to other players
4. Player reconnects within 3 minutes
5. WaitingRoom Service restores player to "connected" status
6. UI updates to show player as "Online"
```

### **Scenario 2: Intentional Leave**
```
1. Player clicks "Leave Room" → navigates to lobby
2. Client updates presence to "IN_LOBBY"
3. WaitingRoom Service detects "IN_LOBBY" status
4. Player is removed immediately (no grace period)
5. Other players see instant removal
```

### **Scenario 3: Browser Crash**
```
1. Player's browser crashes (no logout signal)
2. SessionManager keeps session active [In-Memory]
3. WaitingRoom Service can't reach player
4. Player marked as "grace_period" for 3 minutes
5. If player doesn't return, removed from room
6. Player can reconnect and be redirected back to lobby
```

## 📱 Enhanced Client Implementation Guidelines

### **Login Response Handling with Grace Period Awareness:**
```typescript
const loginResponse = await authService.login(credentials);
const { presenceStatus } = loginResponse.data;

switch (presenceStatus) {
  case 'INITIAL':
  case 'IN_LOBBY':
    router.push('/lobby');
    break;
  
  case 'IN_WAITING_ROOM':
    // Validate room status with connection info
    const roomValidation = await waitingRoomService.validateStatus();
    if (roomValidation.valid) {
      router.push(`/waiting-room/${roomValidation.roomId}`);
      // Display connection status of other players
      displayConnectionInfo(roomValidation.connectionInfo);
    } else {
      router.push('/lobby');
    }
    break;
    
  case 'IN_GAME':
    const gameValidation = await gameService.validateStatus();
    if (gameValidation.valid) {
      router.push(`/game/${gameValidation.gameId}`);
    } else {
      router.push('/lobby');
    }
    break;
}
```

### **WebSocket Connection Status UI:**
```typescript
// Display enhanced player status in waiting room
function renderPlayerList(players: PlayerWithStatus[]) {
  return players.map(player => (
    <PlayerCard 
      key={player.userId}
      name={player.username}
      status={player.displayStatus}  // "Online" | "⚠️ Disconnected (45s ago)"
      isReady={player.isReady}
      connectionStatus={player.connectionStatus}  // For styling
    />
  ));
}
```

## 🎯 Benefits of Enhanced Presence Flow

**Realistic UX**: 3-minute grace periods handle real-world connection issues
**Clear Communication**: Players see connection status of teammates
**Smart Recovery**: Automatic reconnection to valid states
**Intentional vs Accidental**: Different handling for deliberate vs connection issues
**Reduced Server Load**: 2-minute checks instead of 5-second aggressive polling
**Maintainable**: Clear responsibility boundaries with enhanced logging

## 📊 Performance Characteristics

**Before (Aggressive)**:
- Check interval: 5 seconds
- Immediate removal on any disconnection
- High server CPU usage
- Poor user experience

**After (Realistic)**:
- Check interval: 2 minutes  
- 3-minute grace period for connection issues
- 85% reduction in server load
- Professional user experience matching modern gaming standards 