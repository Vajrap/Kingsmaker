# KingsMaker Lobby Service

A WebSocket-based lobby service built with Bun that manages room discovery, player connections, and real-time lobby updates using Redis as the central state store.

## Features

- **WebSocket Connections**: Real-time communication with clients
- **Redis State Management**: Centralized state storage with TTL-based cleanup
- **Room Management**: Create, join, leave, and list waiting rooms
- **Session Validation**: Validates player sessions stored in Redis
- **Pub/Sub Integration**: Communicates with other services via Redis pub/sub
- **Player Tracking**: Tracks player locations and online status

## Architecture

The lobby service follows the KingsMaker architecture patterns:

- **Bun Runtime**: High-performance JavaScript runtime for I/O operations
- **Redis Integration**: Uses `ioredis` for state management and pub/sub
- **WebSocket Server**: Native WebSocket server for real-time communication
- **Shared Types**: Uses `@kingsmaker/shared` for type definitions
- **Docker Deployment**: Containerized with Redis dependencies

## Installation

```bash
# Install dependencies
bun install

# Build shared library (required)
cd ../../shared && bun run build

# Generate types (if using Prisma)
bunx prisma generate

# Start development server
bun run dev
```

## Environment Variables

```env
PORT=3000                    # Service port (default: 3000)
REDIS_HOST=redis            # Redis hostname (default: localhost)
REDIS_PORT=6379             # Redis port (default: 6379)
```

## WebSocket API

### Connection

Connect to the lobby WebSocket with a valid session ID:

```javascript
const ws = new WebSocket('ws://localhost:3000?sessionId=your-session-id');
```

### Client Messages

| Type | Data | Description |
|------|------|-------------|
| `GET_ROOM_LIST` | `{}` | Request list of available rooms |
| `CREATE_ROOM` | `{ name: string, maxPlayers: 2\|3\|4 }` | Create a new room |
| `JOIN_ROOM` | `{ roomId: string }` | Join an existing room |
| `LEAVE_ROOM` | `{ roomId: string }` | Leave a room |
| `REFRESH_LOBBY` | `{}` | Request current lobby state |

### Server Messages

| Type | Data | Description |
|------|------|-------------|
| `LOBBY_UPDATE` | `{ rooms: Room[], onlinePlayers: number }` | Current lobby state |
| `ROOM_LIST` | `{ rooms: Room[] }` | List of available rooms |
| `ROOM_CREATED` | `{ room: Room }` | Confirmation of room creation |
| `ROOM_JOINED` | `{ roomId: string, success: boolean }` | Join result |
| `ERROR` | `{ message: string, code: string }` | Error message |

## Redis State Structure

The service manages the following Redis keys:

```typescript
// Session data (24h TTL)
"loggedInUsers:<sessionId>": SessionData

// Room metadata (2h TTL)
"waitingRooms:<roomId>": WaitingRoomMetadata

// Room players (2h TTL)
"waitingRoomPlayers:<roomId>": PlayerSlot[]

// Player location (30min TTL)
"playerLocation:<userId>": PlayerLocation
```

## Pub/Sub Events

### Published Events

```typescript
// Room lifecycle
"room_created": { roomId, roomData }
"room_closed": { roomId, reason }
"room_updated": { roomId, roomData }

// Player events
"player_joined": { roomId, userId, playerData }
"player_left": { roomId, userId }
"player_ready": { roomId, userId, isReady }

// Game transitions
"game_starting": { roomId, gameId }
"game_ended": { roomId, gameId }
```

### Subscribed Events

- `room_closed`: When waiting room services close rooms
- `game_ended`: When games end and players return to lobby

## Development

### Local Development

```bash
# Start Redis (if not using Docker)
redis-server

# Start the service
bun run dev
```

### Docker Development

```bash
# From the Server directory
docker-compose up redis lobby
```

### Testing Connection

```bash
# Test WebSocket connection (requires wscat)
npm install -g wscat
wscat -c 'ws://localhost:3000?sessionId=test-session'
```

## Integration with Other Services

### Auth Service Integration

The lobby service validates sessions created by the auth service:

1. Auth service stores session in Redis with `loggedInUsers:<sessionId>`
2. Lobby service validates session on WebSocket connection
3. Player data is retrieved from the session for room operations

### Waiting Room Integration

When players join rooms, the lobby service:

1. Publishes `room_created` events for waiting room services
2. Publishes `player_joined` events when players enter rooms
3. Listens for `room_closed` events to update lobby state

### Game Service Integration

The lobby receives `game_ended` events to handle players returning from completed games.

## Monitoring

The service includes:

- **Health Checks**: Redis ping for connection validation
- **Cleanup Tasks**: Periodic cleanup of expired data (every 5 minutes)
- **Connection Tracking**: Active WebSocket connection monitoring
- **Logging**: Structured logging for all major operations

## Troubleshooting

### Common Issues

1. **WebSocket Connection Fails**
   - Verify session ID is valid in Redis
   - Check Redis connection
   - Ensure proper CORS setup if needed

2. **Rooms Not Appearing**
   - Check Redis TTL settings
   - Verify room state is 'WAITING'
   - Check for network connectivity

3. **Pub/Sub Not Working**
   - Verify Redis pub/sub connections
   - Check subscriber channel subscriptions
   - Monitor Redis logs for connection issues

### Debug Commands

```bash
# Check Redis connections
redis-cli ping

# Monitor Redis pub/sub
redis-cli monitor

# List Redis keys
redis-cli keys "*"
```
