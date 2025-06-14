# Zed Editor Setup for The Kingsmaker

This guide helps you set up Zed editor to work properly with The Kingsmaker monorepo.

## Quick Setup

1. **Run the setup script**:
   ```bash
   ./setup-editor.sh
   ```

2. **Open Zed**:
   - Open the `Server` directory as your project root (not the entire monorepo)
   - The workspace should now recognize `@kingsmaker/shared` imports

## Manual Setup

If the script doesn't work, follow these steps:

### 1. Build TypeScript Packages

```bash
# Build shared package
cd shared && npm run build

# Build database package  
cd ../database && npm run build

# Or use the Makefile
make build-ts
```

### 2. Verify TypeScript Configuration

The workspace includes these key files:
- `Server/tsconfig.json` - Root workspace configuration
- `Server/shared/tsconfig.json` - Shared package configuration  
- `Server/services/auth/tsconfig.json` - Auth service configuration

### 3. Zed Configuration

The `.zed/settings.json` file includes:
- TypeScript language server configuration
- Auto-import settings for workspace packages

## Troubleshooting

### "Cannot find module '@kingsmaker/shared'" Error

1. **Check if packages are built**:
   ```bash
   ls -la shared/dist/
   ls -la database/dist/
   ```

2. **Rebuild packages**:
   ```bash
   make build-ts
   ```

3. **Restart Zed**:
   - Close Zed completely
   - Reopen the `Server` directory

4. **Check TypeScript language server**:
   - Open Zed's command palette (Cmd+Shift+P)
   - Run "TypeScript: Restart Language Server"

### Still Having Issues?

1. **Verify package.json dependencies**:
   ```bash
   cd services/auth
   cat package.json | grep "@kingsmaker/shared"
   ```

2. **Check if bun install worked**:
   ```bash
   cd services/auth
   ls -la node_modules/@kingsmaker/
   ```

3. **Try alternative path mapping**:
   If the workspace references don't work, you can use relative imports:
   ```typescript
   import { types } from "../../shared/dist/index";
   ```

## Development Workflow

1. **When you modify shared or database packages**:
   ```bash
   make build-ts
   ```

2. **When working on services**:
   ```bash
   make auth  # Build and run auth service
   ```

3. **Full development setup**:
   ```bash
   make dev   # Build TS + start all services
   ```

## Project Structure

```
Server/
├── tsconfig.json              # Root workspace config
├── shared/
│   ├── dist/                  # Built JS + type definitions
│   ├── package.json           
│   └── tsconfig.json
├── database/
│   ├── dist/                  # Built JS + type definitions
│   ├── package.json
│   └── tsconfig.json
└── services/
    └── auth/
        ├── package.json       # Includes "@kingsmaker/shared": "file:../../shared"
        └── tsconfig.json      # Path mapping for imports
```

## Why This Setup?

- **Type Safety**: Full TypeScript support across the monorepo
- **Editor Support**: Proper IntelliSense and auto-imports
- **Build Optimization**: Only shared code is built once and reused
- **Docker Compatibility**: Works with the existing Docker setup 