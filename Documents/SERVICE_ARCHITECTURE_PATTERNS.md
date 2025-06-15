# AI CONTEXT: KingsMaker Service Architecture Patterns

> **AI Data Assistance**: This document provides service implementation patterns for code assistance. Not intended for human documentation.

## Service Directory Structure
```
services/[service-name]/
├── index.ts              # Main entry point
├── package.json          # Dependencies + @kingsmaker/shared
├── Dockerfile           # Bun container pattern
├── tsconfig.json        # TypeScript config
├── lib/                 # Service utilities (redis.ts, state.ts, db.ts)
├── routes/              # HTTP handlers (auth service only)
└── prisma/              # Database schema (if needed)
    └── schema.prisma
```

## Package.json Pattern
```json
{
  "name": "@kingsmaker/[service-name]-service",
  "dependencies": {
    "@kingsmaker/shared": "file:../../shared",
    "@prisma/client": "^6.9.0",
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

## Prisma Per-Service Pattern
```prisma
// services/auth/prisma/schema.prisma
generator client {
    provider = "prisma-client-js"
    output   = "../generated/prisma"
}

datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
}

// Service owns its models only
model User { ... }
model Session { ... }
```

## Redis Client Pattern
```typescript
// services/[service]/lib/redis.ts
import { Redis } from 'ioredis';

const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    retryStrategy: (times) => Math.min(times * 100, 2000),
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
});

const subscriber = new Redis({ /* same config */ });
const publisher = new Redis({ /* same config */ });

export { redis, subscriber, publisher };
```

## State Manager Pattern
```typescript
// services/[service]/lib/state.ts
import { redis, publisher } from './redis';

export class ServiceStateManager {
    // Store with TTL
    async storeData(key: string, data: any, ttl: number): Promise<void> {
        await redis.setex(key, ttl, JSON.stringify(data));
    }

    // Retrieve data
    async getData(key: string): Promise<any | null> {
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
    }

    // Publish events
    async publishEvent(channel: string, data: any): Promise<void> {
        await publisher.publish(channel, JSON.stringify(data));
    }
}
```

## Database Connection Pattern
```typescript
// services/[service]/lib/db.ts (if service uses DB)
import { PrismaClient } from '../generated/prisma';

const db = new PrismaClient();
export default db;
```

## Shared Types Usage
```typescript
// Import from shared library
import type { 
    SessionData, 
    WaitingRoomMetadata,
    LobbyClientMessage 
} from '@kingsmaker/shared/types/types';

// Use in service logic
const sessionData: SessionData = { ... };
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
        - redis    # All services depend on Redis
    environment:
        DATABASE_URL: postgresql://postgres:postgres@db:5432/kingsmaker
        REDIS_HOST: redis
        REDIS_PORT: 6379
```

## Environment Variables Pattern
```env
# Database (all services)
DATABASE_URL=postgresql://postgres:postgres@db:5432/kingsmaker

# Redis (services using Redis)
REDIS_HOST=redis
REDIS_PORT=6379

# Service-specific
PORT=3000
JWT_SECRET=your-secret (auth service only)
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
// HTTP REST (auth-service only)
app.post('/auth/login', handler)

// WebSocket (lobby, waiting-room, game)
const wss = new WebSocketServer({ port: PORT });

// Redis Pub/Sub (inter-service)
subscriber.on('message', (channel, message) => { ... });
await publisher.publish('event_name', JSON.stringify(data));

// Redis State (all services)
await redis.setex(`key:${id}`, TTL, JSON.stringify(data));
``` 