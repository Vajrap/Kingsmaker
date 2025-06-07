# Shared Types

This folder contains TypeScript types that are shared between the Server and Client applications.

## Structure

```
shared/
├── types/
│   ├── messages.ts    # WebSocket/API message types
│   └── index.ts       # Main export file
├── tsconfig.json      # TypeScript configuration
└── README.md          # This file
```

## Usage

### In Server
```typescript
import type { ClientMessage, ServerMessage, ServerError } from '@shared/types';
```

### In Client
```typescript
import type { ClientMessage, ServerMessage, ServerError } from '@shared/types';
```

## Adding New Types

1. Create a new file in `types/` folder (e.g., `user.ts`)
2. Export your types from that file
3. Add the export to `types/index.ts`:
   ```typescript
   export * from './user';
   ```

## Benefits

- ✅ **Single Source of Truth**: Types defined once, used everywhere
- ✅ **Type Safety**: Compile-time errors if Server/Client types mismatch
- ✅ **Auto-completion**: Full IDE support across projects
- ✅ **Refactoring**: Change types once, get errors everywhere they're used wrong
- ✅ **Documentation**: Types serve as API documentation

## Type Checking

Run type checking for shared types:
```bash
npm run check-types
```

## Migration from Duplicate Types

Instead of maintaining separate message types in:
- `Server/Request-Respond/messages.ts`
- `Client/src/Request-Respond/messages.ts`

We now have a single source in `shared/types/messages.ts` that both projects import. 