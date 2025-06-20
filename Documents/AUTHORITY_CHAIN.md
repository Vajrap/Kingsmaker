# AI CONTEXT: KingsMaker Authority Chain Architecture

> **AI Data Assistance**: This document defines service authority and data ownership for code assistance.

## 🔒 Authority Chain Overview

**Core Principle**: Each service is the **single source of truth** for its domain. Services validate their own authority rather than trusting shared state.

```
Action                 | Source of Truth        | Validation Method
-----------------------|------------------------|------------------
Identity & Login       | Auth Service + DB     | Credential validation
Session & Presence     | SessionManager Service | In-memory tracking
Room Metadata          | Lobby Service + SessionManager  | Room existence check
Game/Match Validity    | Game/Match Service     | Game state validation
Player Profiles        | Auth Service + DB     | User data validation
```

## 🎯 Service Authority Definitions

### **Auth Service (Bun:7001)**
**OWNS:**
- User credentials & identity validation
- SessionId generation & expiration
- User profile data (username, email, type)
- Initial session establishment

**AUTHORITY:**
- Final say on: "Is this user who they claim to be?"
- Controls: sessionId lifecycle, user data persistence
- Validates: login credentials, session expiration

**DOES NOT:**
- Track ongoing presence (delegates to SessionManager)
- Validate game/room states (delegates to respective services)

### **SessionManager Service (Bun:7007)**
**OWNS:**
- User presence status tracking
- Connection state management  
- Presence transitions (INITIAL → IN_LOBBY → IN_WAITING_ROOM → IN_GAME)

**AUTHORITY:**
- Final say on: "Where is this user right now?"
- Controls: presence status, connection tracking
- Validates: session existence before connection

**DOES NOT:**
- Validate if presence claims are accurate (other services validate)
- Store user identity data (reads from Auth)

### **Lobby Service (Bun:7004)**
**OWNS:**
- Room listing & discovery
- Room creation metadata
- Player-to-room assignments

**AUTHORITY:**
- Final say on: "What rooms exist and who can join?"
- Controls: room metadata, room availability
- Validates: room capacity, room existence

**DOES NOT:**
- Track detailed game state (delegates to Game Service)
- Manage presence status (reads from SessionManager)

### **WaitingRoom Service (Go:7005)**
**OWNS:**
- Pre-game room state
- Player readiness status
- Game start orchestration

**AUTHORITY:**
- Final say on: "Is this waiting room valid and ready?"
- Controls: player readiness, game start timing
- Validates: room membership, readiness states

### **Game Service (Go:7003)**
**OWNS:**
- Active game instances
- Game logic & turn management
- Game state persistence

**AUTHORITY:**
- Final say on: "Is this game valid and ongoing?"
- Controls: game logic, turn execution, game state
- Validates: game existence, player participation

## 🔄 Authority Validation Flow

### **Login Flow Authority:**
```
1. Client → Auth: "I am user X with password Y"
2. Auth validates: credentials against DB ✅ AUTHORITY
3. Auth → SessionManager: "Add connection for validated user"
4. SessionManager validates: sessionId exists ✅ AUTHORITY  
5. SessionManager tracks: user presence
6. Auth → Client: "Login successful + current presence"
```

### **Presence Claim Validation:**
```
1. SessionManager reports: user has presence "IN_GAME"
2. Client connects to game based on presence
3. Game Service validates: ✅ AUTHORITY
   - Does this game exist?
   - Is this user actually in this game?
   - Is the game still active?
4. If invalid → Game Service → SessionManager: updatePresence(userId, "IN_LOBBY")
5. Game Service → Client: "Invalid, return to lobby"
```

### **Room Join Authority:**
```
1. Client → Lobby: "Join room X"
2. Lobby Service validates: ✅ AUTHORITY
   - Does room exist?
   - Is room full?
   - Is room accepting players?
3. If valid → Lobby updates room metadata
4. Lobby → SessionManager: updatePresence(userId, "IN_WAITING_ROOM")
```

## 🚨 Authority Violation Prevention

### **What Services CANNOT Do:**
- **Auth**: Cannot determine if a game is still valid
- **SessionManager**: Cannot validate room/game existence  
- **Lobby**: Cannot execute game logic or determine game state
- **Game**: Cannot modify user credentials or create sessions

### **Cross-Service Validation:**
```typescript
// ❌ WRONG: Trusting presence blindly
if (sessionManager.getPresence(userId) === "IN_GAME") {
  // Assume user is in valid game
}

// ✅ CORRECT: Validate authority
const presence = sessionManager.getPresence(userId);
if (presence === "IN_GAME") {
  const gameValid = await gameService.validateUserInGame(userId);
  if (!gameValid) {
    await sessionManager.updatePresence(userId, "IN_LOBBY");
    return redirectToLobby();
  }
}
```

## 📋 Implementation Guidelines

### **Service Communication Pattern:**
1. **Query Authority**: Ask the authoritative service
2. **Validate Response**: Don't trust claims from non-authoritative sources
3. **Update State**: Only update what you own
4. **Delegate Changes**: Request other services to update their authority

### **Error Recovery:**
- When authority validation fails → reset to safe state (usually IN_LOBBY)
- Log authority conflicts for debugging
- Never assume shared state is correct

## 🔒 Security Benefits

**Data Integrity**: Each service validates its own domain
**Conflict Resolution**: Clear hierarchy prevents state conflicts  
**Attack Surface**: Limited blast radius from service compromise
**Debugging**: Clear responsibility makes issues easier to trace 