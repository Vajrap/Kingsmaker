# AI CONTEXT: KingsMaker Service Architecture Patterns

> **AI Data Assistance**: This document provides service implementation patterns for code assistance. **UPDATED** to reflect SessionManager service, shared library build process, and advanced presence management.

## Service Directory Structure
```
services/[service-name]/
├── index.ts              # Main entry point
├── package.json          # Dependencies + @kingsmaker/shared
├── Dockerfile           # Bun container pattern
├── tsconfig.json        # TypeScript config
├── lib/                 # Service utilities (sessionServiceClient.ts)
├── routes/              # HTTP handlers
├── config/              # Service configuration (e.g., presence.ts)
├── entity/              # Service-specific entities (sessionManager only)
└── Classes/             # Service business logic classes
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

## Critical Build Process Pattern

**⚠️ IMPORTANT**: The project uses **dual import patterns** for development vs Docker builds:

### **Development Pattern (IDE Support):**
```typescript
// Use @kingsmaker/shared imports for IDE IntelliSense
import { prisma } from "@kingsmaker/shared/prisma/prisma";
import type { User } from "@kingsmaker/shared/prisma/generated";
import { sessionManagerClient } from "@kingsmaker/shared/session/sessionManagerClient";
```

### **Docker Build Pattern (Automatic Conversion):**
```typescript
// Dockerfile automatically converts to relative imports:
import { prisma } from "../shared/prisma/prisma";
import type { User } from "../shared/prisma/generated";
import { sessionManagerClient } from "../shared/session/sessionManagerClient";
```

### **Build Process:**
```bash
# Streamlined process (no physical copying needed):
1. cd Server && make build          # Builds shared lib + Docker containers with import conversion

# For development only (if needed):
2. cd services/[service] && bun install  # If package.json changed
```

**Why This Works:**
- **Development**: `@kingsmaker/shared` provides IDE support via `file:../../shared` package reference
- **Docker Build**: Dockerfile automatically converts imports to `../shared/` and copies files internally
- **Import Conversion**: Automatic `sed` replacement during Docker build
- **No Physical Copying**: Docker handles all file copying internally

## Dockerfile Pattern
```dockerfile
FROM oven/bun:1.0.35 as base
WORKDIR /app
COPY package.json ./
COPY shared ./shared
COPY database ./database
COPY services/[SERVICE-NAME] ./services/[SERVICE-NAME]
RUN echo "DATABASE_URL=postgresql://postgres:postgres@db:5432/kingsmaker" > .env
RUN bun install
RUN cd database && bunx prisma generate
RUN cd shared && bunx prisma generate --schema=./prisma/schema.prisma && bun run build
RUN cd services/[SERVICE-NAME] && sed 's/"@kingsmaker\/shared": "file:..\/..\/shared"/"@kingsmaker\/shared": "file:.\/shared"/g' package.json > package.json.tmp && mv package.json.tmp package.json

# 🔧 CRITICAL: Convert @kingsmaker/shared imports to ../shared imports for Docker build
RUN find services/[SERVICE-NAME] -name "*.ts" -type f -exec sed -i 's|from "@kingsmaker/shared/|from "../shared/|g' {} \;
RUN find services/[SERVICE-NAME] -name "*.ts" -type f -exec sed -i 's|from "@kingsmaker/shared"|from "../shared"|g' {} \;

RUN cd services/[SERVICE-NAME] && bun install
RUN mkdir -p services/[SERVICE-NAME]/shared && cp -r shared/* services/[SERVICE-NAME]/shared/
RUN cd services/[SERVICE-NAME] && bun build ./index.ts --outdir ./dist --target node
WORKDIR /app/services/[SERVICE-NAME]
CMD ["bun", "run", "dist/index.js"]
```

## SessionManager Integration Pattern
```typescript
// Use the shared SessionManagerClient
import { sessionManagerClient } from "@kingsmaker/shared/session/sessionManagerClient";

// In auth service - establish connection
const sessionData = await sessionManagerClient.addConnection(user);
const resumedSession = await sessionManagerClient.resumeConnection(user);

// In other services - validate sessions
const sessionData = await sessionManagerClient.getConnection(userId);
const success = await sessionManagerClient.updatePresence(userId, 'IN_WAITING_ROOM');

// WebSocket validation pattern
import { validateWSSession, createWSErrorMessage } from "@kingsmaker/shared/session/sessionManagerClient";

async function handleWebSocketMessage(ws: WebSocket, message: WSMessage) {
    const validation = await validateWSSession(message, getUserIdFromSessionId);
    
    if (!validation.isValid) {
        ws.send(JSON.stringify(createWSErrorMessage("AUTH_ERROR", validation.errorMessage)));
        return;
    }
    
    // Continue with authenticated user logic
    const { userId, sessionData } = validation;
}
```

## SessionManager Entity Pattern (In-Memory)
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

    // Session cleanup and validation methods
    isConnected(userId: number): boolean {
        return this.connectedClientsByUserId.has(userId);
    }

    disconnectClient(userId: number) {
        this.connectedClientsByUserId.delete(userId);
    }
}

export const sessionManager = new SessionManager();
```

## Advanced Presence Management Pattern

**New: Grace Period & Connection State Tracking**

```typescript
// services/waitingRoom/config/presence.ts
export const PRESENCE_CONFIG = {
    // How often to check all room presences (2 minutes)
    CHECK_INTERVAL_MS: 2 * 60 * 1000,
    
    // Grace period before removing offline players (3 minutes)
    GRACE_PERIOD_MS: 3 * 60 * 1000,
    
    // Quick removal scenarios (no grace period)
    IMMEDIATE_REMOVAL_STATUSES: ['IN_LOBBY', 'OFFLINE'] as const,
    
    // Statuses that should keep player in room
    VALID_ROOM_STATUSES: ['IN_WAITING_ROOM'] as const,
} as const;

// Enhanced Player type with connection tracking
interface Player {
    userId: string;
    username: string;
    userType: "registered" | "guest";
    isReady: boolean;
    profile: { portraitId?: string; skinId?: string; };
    lastSeen: string;
    connectionStatus: "connected" | "disconnected" | "grace_period"; // NEW
    disconnectedAt?: string; // NEW - ISO timestamp when player went offline
    character?: PlayerCharacterSetup;
}

// Smart presence checking with grace periods
class RoomInstance {
    async checkPresence() {
        const now = new Date();
        const playersToRemove: Player[] = [];

        for (const player of this.players) {
            const sessionData = await sessionManagerClient.getConnection(parseInt(player.userId));
            
            if (sessionData?.presenceStatus === 'IN_WAITING_ROOM') {
                // Player is online - restore if needed
                if (player.connectionStatus !== "connected") {
                    console.log(`Player ${player.username} reconnected`);
                    player.connectionStatus = "connected";
                    player.disconnectedAt = undefined;
                }
            } else if (PRESENCE_CONFIG.IMMEDIATE_REMOVAL_STATUSES.includes(sessionData?.presenceStatus as any)) {
                // Immediate removal - user left intentionally
                playersToRemove.push(player);
            } else {
                // Handle disconnection with grace period
                this.handleDisconnectedPlayer(player, now, playersToRemove);
            }
        }

        // Remove players after grace period
        playersToRemove.forEach(player => this.removePlayer(player));
    }

    private handleDisconnectedPlayer(player: Player, now: Date, playersToRemove: Player[]) {
        if (player.connectionStatus === "connected") {
            // First time offline - start grace period
            player.connectionStatus = "grace_period";
            player.disconnectedAt = now.toISOString();
        } else if (player.disconnectedAt) {
            // Check if grace period expired
            const disconnectedTime = new Date(player.disconnectedAt);
            const timeSinceDisconnect = now.getTime() - disconnectedTime.getTime();
            
            if (timeSinceDisconnect > PRESENCE_CONFIG.GRACE_PERIOD_MS) {
                playersToRemove.push(player); // Grace period expired
            } else {
                player.connectionStatus = "disconnected"; // Still in grace period
            }
        }
    }
}
```

## Database Connection Pattern
```typescript
// Import from shared Prisma client (SSOT)
import { prisma } from "@kingsmaker/shared/prisma/prisma";
import type { User } from "@kingsmaker/shared/prisma/generated";

// All services use the same schema from shared/prisma/schema.prisma
const user = await prisma.user.findUnique({ 
    where: { id: userId },
    select: {
        id: true,
        username: true,
        sessionId: true,        // Embedded session approach
        sessionExpireAt: true,  // Embedded session approach
        type: true,
        nameAlias: true
    }
});
```

## Shared Types Usage
```typescript
// Import from shared library
import type { 
    SessionData,
    ApiResponse,
    Player,
    GameRoom,
    WSMessage,
    WSValidationResult
} from '@kingsmaker/shared/types/types';

// Enhanced types for connection tracking
import type { Player } from '@kingsmaker/shared/types/player'; // Includes connectionStatus fields
```

## Docker Compose Integration
```yaml
# SessionManager service is the central authority
sessionmanager:
    build:
        context: ..
        dockerfile: Server/services/sessionManager/Dockerfile
    container_name: sessionmanager_service
    ports:
        - "7007:3000"
    depends_on:
        - db
    environment:
        DATABASE_URL: postgresql://postgres:postgres@db:5432/kingsmaker

# Other services depend on SessionManager (not Redis for sessions)
[service-name]:
    build:
        context: ..
        dockerfile: Server/services/[service-name]/Dockerfile
    container_name: [service-name]_service
    ports:
        - "70XX:3000"
    depends_on:
        - db
        - sessionmanager  # KEY: Session dependency, not Redis
    environment:
        DATABASE_URL: postgresql://postgres:postgres@db:5432/kingsmaker
        SESSION_MANAGER_URL: http://sessionmanager:3000
        # Note: No Redis session environment variables
```

## Build Process Workflow
```bash
# Development workflow
make copy-shared        # Copy shared lib to all services
make dev               # Build and start all services with logs

# Production workflow  
make build             # Copy shared + build Docker containers
make up                # Start all services

# Individual service testing
make [service-name]    # Build and run specific service

# Debugging shared library issues
make clean-shared      # Remove copied shared libraries
make copy-shared       # Re-copy fresh shared library
```

## Error Handling Pattern
```typescript
// Use shared validation utilities
function isApiResponse(obj: unknown): obj is { success: boolean; data?: unknown; message?: string } {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'success' in obj &&
        typeof (obj as any).success === 'boolean'
    );
}

// Enhanced error handling with retry logic
async function fetchWithRetry<T>(url: string, options: RequestInit, retries = 3): Promise<T | null> {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            const json = await response.json();
            
            if (isApiResponse(json) && json.success) {
                return json.data as T;
            }
        } catch (error) {
            console.error(`Attempt ${i + 1} failed:`, error);
            if (i === retries - 1) return null;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
        }
    }
    return null;
}
```

## Session Management Flow (No Redis)
```typescript
// 1. Auth Service validates credentials against PostgreSQL
// 2. Auth Service generates/reuses sessionId + sessionExpireAt in User table
// 3. Auth Service calls SessionManager.addConnection(user) [In-Memory]
// 4. SessionManager tracks presence/connection state in Map<userId, ConnectedClient>
// 5. Other services validate sessions via SessionManager HTTP API
// 6. Presence updates flow through SessionManager.updatePresence() [In-Memory]
// 7. Session cleanup handled by SessionManager expiration + graceful disconnection
``` 