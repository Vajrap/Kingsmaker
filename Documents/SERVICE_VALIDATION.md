# AI CONTEXT: KingsMaker Service Validation Architecture

> **AI Data Assistance**: This document defines how services validate their own authority and state.

## 🔒 Validation Principle

**Core Rule**: Services MUST validate their own authority. Never blindly trust state from other services or shared storage.

## 🎯 Service-Specific Validation Patterns

### **Auth Service Validation**

**Validates:**
- User credentials against database
- Session expiration timestamps
- JWT token integrity
- Password hash verification

```typescript
// Auth Service Validation Example
export async function validateLoginRequest(loginData: LoginBody): Promise<ValidationResult> {
  // 1. Validate user exists
  const user = await prisma.user.findUnique({ 
    where: { username: loginData.username } 
  });
  if (!user) return { valid: false, reason: "User not found" };

  // 2. Validate password
  const passwordValid = await Bun.password.verify(loginData.password, user.password);
  if (!passwordValid) return { valid: false, reason: "Invalid password" };

  // 3. Validate session expiration
  if (user.sessionExpireAt < new Date()) {
    // Session expired, need new sessionId
    return { valid: true, requiresNewSession: true };
  }

  return { valid: true, user };
}
```

### **SessionManager Service Validation**

**Validates:**
- Session existence and mapping
- Connection state consistency
- Presence transition validity

```typescript
// SessionManager Validation Example
export async function validateConnectionRequest(user: User): Promise<ValidationResult> {
  // 1. Validate session exists in our store
  const existingConnection = sessionManager.getClient(user.id);
  
  // 2. Validate sessionId matches our records
  if (existingConnection && existingConnection.sessionId !== user.sessionId) {
    return { valid: false, reason: "Session ID mismatch" };
  }

  // 3. Validate user data integrity
  if (!user.sessionId || !user.id) {
    return { valid: false, reason: "Invalid user data" };
  }

  return { valid: true };
}

export async function validatePresenceTransition(
  userId: number, 
  fromPresence: string, 
  toPresence: string
): Promise<ValidationResult> {
  // Validate transition is allowed
  const validTransitions = {
    'INITIAL': ['IN_LOBBY'],
    'IN_LOBBY': ['IN_WAITING_ROOM', 'OFFLINE'],
    'IN_WAITING_ROOM': ['IN_GAME', 'IN_LOBBY', 'OFFLINE'],
    'IN_GAME': ['IN_LOBBY', 'OFFLINE'],
    'OFFLINE': ['INITIAL'] // Re-login
  };

  if (!validTransitions[fromPresence]?.includes(toPresence)) {
    return { valid: false, reason: `Invalid transition: ${fromPresence} → ${toPresence}` };
  }

  return { valid: true };
}
```

### **Lobby Service Validation**

**Validates:**
- Session validity via SessionManager
- Room existence and capacity
- User permissions for room actions

```typescript
// Lobby Service Validation Example
export async function validateRoomJoinRequest(
  sessionId: string, 
  roomId: string
): Promise<ValidationResult> {
  // 1. Validate session with SessionManager
  const sessionValid = await sessionManagerClient.validateSession(sessionId);
  if (!sessionValid.valid) {
    return { valid: false, reason: "Invalid session" };
  }

  // 2. Validate room exists in our Redis store
  const roomData = await redis.get(`waitingRooms:${roomId}`);
  if (!roomData) {
    return { valid: false, reason: "Room not found" };
  }

  const room: WaitingRoomMetadata = JSON.parse(roomData);

  // 3. Validate room capacity
  if (room.currentPlayers >= room.maxPlayers) {
    return { valid: false, reason: "Room is full" };
  }

  // 4. Validate room state
  if (room.state !== 'WAITING') {
    return { valid: false, reason: "Room is not accepting players" };
  }

  return { valid: true, room, user: sessionValid.user };
}
```

### **WaitingRoom Service Validation**

**Validates:**
- Room membership and state
- Player readiness status
- Game start conditions

```typescript
// WaitingRoom Service Validation Example
export async function validateRoomStatusRequest(sessionId: string): Promise<ValidationResult> {
  // 1. Get user from SessionManager
  const sessionData = await sessionManagerClient.getConnection(sessionId);
  if (!sessionData.valid) {
    return { valid: false, reason: "Invalid session", redirect: 'lobby' };
  }

  // 2. Find which room this user should be in
  const userRoomData = await redis.get(`userRoomMapping:${sessionData.userId}`);
  if (!userRoomData) {
    // User not in any room according to our records
    await sessionManagerClient.updatePresence(sessionData.userId, 'IN_LOBBY');
    return { valid: false, reason: "No room membership found", redirect: 'lobby' };
  }

  const { roomId } = JSON.parse(userRoomData);

  // 3. Validate room still exists
  const roomData = await redis.get(`waitingRooms:${roomId}`);
  if (!roomData) {
    // Room no longer exists
    await redis.del(`userRoomMapping:${sessionData.userId}`);
    await sessionManagerClient.updatePresence(sessionData.userId, 'IN_LOBBY');
    return { valid: false, reason: "Room no longer exists", redirect: 'lobby' };
  }

  // 4. Validate user is actually in this room
  const room: WaitingRoomMetadata = JSON.parse(roomData);
  if (!room.playerList.includes(sessionData.userId.toString())) {
    // User not in room player list
    await redis.del(`userRoomMapping:${sessionData.userId}`);
    await sessionManagerClient.updatePresence(sessionData.userId, 'IN_LOBBY');
    return { valid: false, reason: "Not a member of this room", redirect: 'lobby' };
  }

  return { valid: true, roomId, roomData: room };
}
```

### **Game Service Validation**

**Validates:**
- Game instance existence
- Player participation
- Game state validity

```typescript
// Game Service Validation Example
export async function validateGameStatusRequest(sessionId: string): Promise<ValidationResult> {
  // 1. Get user from SessionManager
  const sessionData = await sessionManagerClient.getConnection(sessionId);
  if (!sessionData.valid) {
    return { valid: false, reason: "Invalid session", redirect: 'lobby' };
  }

  // 2. Find which game this user should be in
  const userGameData = await redis.get(`userGameMapping:${sessionData.userId}`);
  if (!userGameData) {
    // User not in any game according to our records
    await sessionManagerClient.updatePresence(sessionData.userId, 'IN_LOBBY');
    return { valid: false, reason: "No game membership found", redirect: 'lobby' };
  }

  const { gameId } = JSON.parse(userGameData);

  // 3. Validate game still exists and is active
  const gameData = await redis.get(`games:${gameId}`);
  if (!gameData) {
    // Game no longer exists
    await redis.del(`userGameMapping:${sessionData.userId}`);
    await sessionManagerClient.updatePresence(sessionData.userId, 'IN_LOBBY');
    return { valid: false, reason: "Game no longer exists", redirect: 'lobby' };
  }

  const game: GameState = JSON.parse(gameData);

  // 4. Validate game is still active
  if (game.status === 'ENDED' || game.status === 'CANCELLED') {
    await redis.del(`userGameMapping:${sessionData.userId}`);
    await sessionManagerClient.updatePresence(sessionData.userId, 'IN_LOBBY');
    return { valid: false, reason: "Game has ended", redirect: 'lobby' };
  }

  // 5. Validate user is actually a player in this game
  if (!game.players.some(p => p.userId === sessionData.userId)) {
    await redis.del(`userGameMapping:${sessionData.userId}`);
    await sessionManagerClient.updatePresence(sessionData.userId, 'IN_LOBBY');
    return { valid: false, reason: "Not a player in this game", redirect: 'lobby' };
  }

  return { valid: true, gameId, gameData: game };
}
```

## 🚨 Cross-Service Validation Pattern

### **Service Client Validation**
Services should validate responses from other services:

```typescript
// Example: Auth Service calling SessionManager
export async function callSessionManager(user: User): Promise<SessionManagerResponse | null> {
  try {
    const response = await fetch(`${SESSION_MANAGER_URL}/addConnection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });

    const json = await response.json();

    // 🔒 VALIDATE RESPONSE STRUCTURE
    if (!isApiResponse(json)) {
      console.error('SessionManager returned invalid structure', json);
      return null;
    }

    // 🔒 VALIDATE RESPONSE SUCCESS
    if (!response.ok || !json.success) {
      console.error(`SessionManager failed: ${json.message || response.status}`);
      return null;
    }

    // 🔒 VALIDATE RESPONSE DATA
    const data = json.data as SessionManagerUserLoginResponse;
    if (!data.sessionId || !data.userId || !data.presenceStatus) {
      console.error('SessionManager returned incomplete data', data);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to call SessionManager:', error);
    return null;
  }
}
```

## 📋 Validation Guidelines

### **Always Validate:**
1. **Input Parameters**: Never trust input data
2. **External Service Responses**: Validate structure and content
3. **Database Query Results**: Check for null/undefined
4. **Redis/Cache Data**: Validate existence and format
5. **State Transitions**: Ensure valid state changes

### **Validation Response Pattern:**
```typescript
interface ValidationResult {
  valid: boolean;
  reason?: string;        // Why validation failed
  redirect?: string;      // Where to redirect if invalid
  data?: any;            // Valid data if successful
  requiresAction?: boolean; // If additional action needed
}
```

### **Error Recovery Strategy:**
1. **Log the validation failure** for debugging
2. **Reset to safe state** (usually IN_LOBBY)
3. **Notify other services** of state change
4. **Return clear error response** to client

## 🔒 Security Benefits

**Data Integrity**: Each service ensures its own data is valid
**Attack Mitigation**: Invalid requests are caught early  
**Graceful Degradation**: Services continue operating despite external failures
**Audit Trail**: Validation failures are logged for security analysis 