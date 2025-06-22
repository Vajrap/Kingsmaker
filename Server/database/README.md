# Database Service

This service provides database connection utilities and configuration.

> **⚠️ Architecture Change**: Prisma client and schema are now managed from the shared library (`@kingsmaker/shared`). This service only provides database utilities.

## Features

- Database connection configuration
- Environment variable management

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string

## Usage

All database operations should now use the shared Prisma client:

```typescript
import { prisma } from '@kingsmaker/shared';
```

## Build

```bash
bun run build
```

This project uses [Bun](https://bun.sh) as the JavaScript runtime.
