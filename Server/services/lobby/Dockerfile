FROM oven/bun:1.0.35 AS base

WORKDIR /app

# Copy shared package first (from root context)
COPY shared ./shared

# Set up environment for Prisma
RUN echo "DATABASE_URL=postgresql://postgres:postgres@db:5432/kingsmaker" > .env

# Install shared dependencies and generate Prisma client
RUN cd shared && bun install && bunx prisma generate --schema=./prisma/schema.prisma

# Build shared library with correct imports
RUN cd shared && bun run build

# Copy the lobby service (from root context)
COPY Server/services/lobby ./lobby

# Install lobby service dependencies
RUN cd lobby && bun install

# Copy shared library into lobby service (bypass symlink issues)
RUN mkdir -p lobby/shared && cp -r shared/* lobby/shared/

# Build the lobby service
RUN cd lobby && bun build ./index.ts --outdir ./dist --target node

# Set working directory to the lobby service
WORKDIR /app/lobby

# Start the service
CMD ["bun", "run", "dist/index.js"]
