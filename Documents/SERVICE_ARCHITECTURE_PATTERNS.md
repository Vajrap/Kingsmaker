# AI CONTEXT: KingsMaker Service Architecture Patterns

> **AI Data Assistance**: This document provides service implementation patterns for code assistance. **UPDATED** to reflect SessionManager service and removal of Redis session management.

## Service Directory Structure
```
services/[service-name]/
├── index.ts              # Main entry point
├── package.json          # Dependencies + @kingsmaker/shared
├── Dockerfile           # Bun container pattern
├── tsconfig.json        # TypeScript config
├── lib/                 # Service utilities (sessionServiceClient.ts, db.ts)
├── routes/              # HTTP handlers
└── entity/              # Service-specific entities (sessionManager only)
```

## Package.json Pattern
```json
{
  "name": "@kingsmaker/[service-name]-service",
  "dependencies": {
    "@kingsmaker/shared": "file:../../shared",
    "@prisma/client": "^6.9.0",
    "@elysiajs/cors": "^1.3.3",
    "elysia": "^1.3.4",
    "bun-types": "latest",
    "dotenv": "^16.5.0"
  },
  "scripts": {
    "dev": "bun run --watch index.ts",
    "build": "bun build ./index.ts --outdir ./dist --target node",
    "start": "bun run dist/index.js"
  }
}
```

## Dockerfile Pattern
```dockerfile
FROM oven/bun:1.0.35 as base
WORKDIR /app
COPY package.json ./
COPY shared ./shared
COPY database ./database
COPY services/[SERVICE-NAME] ./services/[SERVICE-NAME]
RUN bun install
RUN cd shared && bun run build
RUN cd services/[SERVICE-NAME] && bun build ./index.ts --outdir ./dist --target node
WORKDIR /app/services/[SERVICE-NAME]
CMD ["bun", "run", "dist/index.js"]
```

## SessionManager Integration Pattern
```typescript
// services/auth/lib/sessionServiceClient.ts
const SESSION_MANAGER_URL = process.env.SESSION_MANAGER_URL || "http://sessionmanager:3000";

export async function addConnectionToSessionManager(user: User): Promise<SessionManagerUserLoginResponse | null> {
    const response = await fetch(`${SESSION_MANAGER_URL}/addConnection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
    });
    
    const json = await response.json();
    return json.success ? json.data : null;
}

export async function removeConnectionFromSessionManager(userId: number): Promise<boolean> {
    const response = await fetch(`${SESSION_MANAGER_URL}/removeConnection`, {
        method: 'DELETE',
        body: JSON.stringify({ userId })
    });
    
    const json = await response.json();
    return json.success;
}
```

## SessionManager Entity Pattern
```typescript
// services/sessionManager/entity/sessionManager.ts
type ClientPresenceStatus = 'INITIAL' | 'IN_LOBBY' | 'IN_WAITING_ROOM' | 'IN_GAME' | 'OFFLINE';

type ConnectedClient = {
    sessionId: string;
    userType: 'registered' | 'guest' | 'admin';
    username: string;
    presenceStatus: ClientPresenceStatus;
    lastSeen: Date;
    connectedAt: Date;
}

class SessionManager {
    private connectedClientsByUserId = new Map<number, ConnectedClient>();

    connectClient(user: User) {
        const now = new Date();
        this.connectedClientsByUserId.set(user.id, {
            sessionId: user.sessionId,
            userType: user.type,
            username: user.username,
            presenceStatus: 'INITIAL',
            lastSeen: now,
            connectedAt: now,
        });
    }

    updatePresence(userId: number, presence: ClientPresenceStatus) {
        const client = this.connectedClientsByUserId.get(userId);
        if (client) {
            client.presenceStatus = presence;
            client.lastSeen = new Date();
        }
    }
}

export const sessionManager = new SessionManager();
```

## Database Connection Pattern
```typescript
// Import from shared Prisma client
import { prisma } from "@kingsmaker/shared/prisma/prisma";
import type { User } from "@kingsmaker/shared/prisma/generated";

// Use shared database client
const user = await prisma.user.findUnique({ where: { id: userId } });
```

## Shared Types Usage
```typescript
// Import from shared library
import type { 
    SessionManagerUserLoginResponse,
    WaitingRoomMetadata,
    LobbyClientMessage,
    ApiResponse,
    LoginResponse
} from '@kingsmaker/shared/types/types';

// Use in service logic
const sessionData: SessionManagerUserLoginResponse = { ... };
```

## Docker Compose Integration
```yaml
[service-name]:
    build:
        context: .
        dockerfile: services/[service-name]/Dockerfile
    container_name: [service-name]_service
    ports:
        - "70XX:3000"
    depends_on:
        - db
        - sessionmanager  # Services depend on SessionManager instead of Redis
    environment:
        DATABASE_URL: postgresql://postgres:postgres@db:5432/kingsmaker
        SESSION_MANAGER_URL: http://sessionmanager:3000
```

## Environment Variables Pattern
```env
# Database (all services)
DATABASE_URL=postgresql://postgres:postgres@db:5432/kingsmaker

# SessionManager integration
SESSION_MANAGER_URL=http://sessionmanager:3000

# Service-specific
PORT=3000
```

## TypeScript Config Pattern
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["../../shared/*"]
    },
    "types": ["bun-types", "node"],
    "strict": false,
    "skipLibCheck": true
  }
}
```

## Build Process
```bash
# Required order
1. cd shared && bun run build
2. cd services/[service] && bun install  
3. cd services/[service] && bunx prisma generate (if using DB)
4. cd services/[service] && bun run dev
```

## Service Communication Patterns
```typescript
// HTTP REST Communication
// Auth Service → SessionManager Service
await addConnectionToSessionManager(user);
await removeConnectionFromSessionManager(userId);

// Other Services → SessionManager Service
await fetch(`${SESSION_MANAGER_URL}/getConnection`, {
    method: 'POST',
    body: JSON.stringify({ userId })
});

// WebSocket (lobby-service, waiting-room, game-service)
// Session validation through SessionManager HTTP endpoints
```

## Session Management Flow
```typescript
// 1. Auth Service validates credentials
// 2. Auth Service generates/reuses sessionId in PostgreSQL
// 3. Auth Service calls SessionManager.addConnection(user)
// 4. SessionManager tracks presence in-memory
// 5. Other services validate sessions via SessionManager HTTP API
// 6. Presence updates flow through SessionManager.updatePresence()
```

## Error Handling Pattern
```typescript
function isApiResponse(obj: unknown): obj is { success: boolean; data?: unknown; message?: string } {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'success' in obj &&
        typeof (obj as any).success === 'boolean'
    );
}

// Usage in service clients
const json = await response.json();
if (!isApiResponse(json) || !json.success) {
    console.error(`Service call failed: ${json.message || response.status}`);
    return null;
}
``` 