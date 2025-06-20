# AI CONTEXT: KingsMaker Presence Flow Architecture

> **AI Data Assistance**: This document defines the presence-based user flow for code assistance.

## 🎯 Presence Flow Overview

**Core Concept**: User routing is determined by **presence status** rather than complex state management. Presence indicates intent, but services validate their own authority.

## 🔄 Complete Login Flow

### **✅ Login Flow - Standard Path**
```
1. Client → Auth Service
   POST /login: { username, password }
   POST /guest: { preferredUsername? }
   POST /autoLogin: { token }

2. Auth Service Process:
   a) Validates credentials against DB
   b) Assigns/reuses sessionId with expiration
   c) → SessionManager: addConnection(user) OR resumeConnection(user)
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
3. Lobby Service validates session via SessionManager
4. No additional backend validation required
5. User can browse rooms, create rooms, join rooms
6. SessionManager continues tracking presence
```

**Key Points:**
- No complex state validation needed
- Lobby Service handles room discovery
- Presence remains `IN_LOBBY` until room action

## 🔄 WaitingRoom/Game Case - Validation Required

**Scenario**: User has presence `IN_WAITING_ROOM` or `IN_GAME`

**⚠️ Critical**: Presence alone is NOT trusted. Services must validate.

### **WaitingRoom Validation Flow:**
```
1. Client receives presenceStatus: 'IN_WAITING_ROOM'
2. Client → WaitingRoom Service: GET /validate-room-status
   Headers: { sessionId }
3. WaitingRoom Service Process:
   a) Validates sessionId via SessionManager
   b) Checks: Does waiting room still exist?
   c) Checks: Is user actually in this room?
   d) Checks: Is room in valid state?

4a. IF VALID:
    WaitingRoom Service → Client: { 
      valid: true, 
      roomId, 
      roomData 
    }
    → Client connects to WaitingRoom WebSocket

4b. IF INVALID:
    WaitingRoom Service → SessionManager: 
      updatePresence(userId, 'IN_LOBBY')
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
   a) Validates sessionId via SessionManager
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
      updatePresence(userId, 'IN_LOBBY')
    Game Service → Client: { 
      valid: false, 
      redirect: 'lobby' 
    }
    → Client redirects to Lobby
```

## 🚨 Presence Transition Rules

### **Valid Presence Transitions:**
```
INITIAL → IN_LOBBY (automatic on login)
IN_LOBBY → IN_WAITING_ROOM (via room join)
IN_WAITING_ROOM → IN_GAME (via game start)
IN_GAME → IN_LOBBY (via game end)
IN_WAITING_ROOM → IN_LOBBY (via room leave)
Any State → OFFLINE (via disconnect/logout)
```

### **Who Can Update Presence:**
```
Service               | Can Set Presence To
---------------------|------------------
Auth Service         | INITIAL (login only)
Lobby Service        | IN_LOBBY (after room leave)
WaitingRoom Service  | IN_WAITING_ROOM, IN_GAME
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

// ✅ CORRECT: Validate first
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
- **WaitingRoom Service**: Validates room membership & room state
- **Game Service**: Validates game membership & game state  
- **Lobby Service**: Validates room availability & capacity
- **SessionManager**: Validates session existence & expiration

## 📱 Client Implementation Guidelines

### **Login Response Handling:**
```typescript
const loginResponse = await authService.login(credentials);
const { presenceStatus } = loginResponse.data;

switch (presenceStatus) {
  case 'INITIAL':
  case 'IN_LOBBY':
    router.push('/lobby');
    break;
  
  case 'IN_WAITING_ROOM':
    const roomValidation = await waitingRoomService.validateStatus();
    if (roomValidation.valid) {
      router.push(`/waiting-room/${roomValidation.roomId}`);
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

## 🎯 Benefits of This Flow

**Simplicity**: Clear routing based on presence
**Security**: Services validate their own authority
**Reliability**: Invalid states are corrected automatically
**Maintainability**: Clear responsibility boundaries
**User Experience**: Seamless reconnection to valid states 