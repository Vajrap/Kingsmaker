FROM oven/bun:1.0.35 AS base

WORKDIR /app

# Copy the root workspace package.json to set up the workspace
COPY Server/package.json ./
COPY Server/package-lock.json* ./

# Copy shared package
COPY shared ./shared
COPY Server/database ./database

# Copy the specific service
COPY Server/services/waitingRoom ./services/waitingRoom

# Set up environment for Prisma
RUN echo "DATABASE_URL=postgresql://postgres:postgres@db:5432/kingsmaker" > .env

# Install all workspace dependencies
RUN bun install

# Generate Prisma client first
RUN cd database && bunx prisma generate

# Generate Prisma client in shared
RUN cd shared && bunx prisma generate --schema=./prisma/schema.prisma

# Build shared dependencies first
RUN cd shared && bun run build

# Build the waitingRoom service
RUN cd services/waitingRoom && bun build ./index.ts --outdir ./dist --target node

# Set working directory to the waitingRoom service
WORKDIR /app/services/waitingRoom

# Start the service
CMD ["bun", "run", "dist/index.js"]
