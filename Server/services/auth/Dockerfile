FROM oven/bun:1.0.35 as base

WORKDIR /app

# Copy the root workspace package.json to set up the workspace
COPY package.json ./
COPY package-lock.json* ./

# Copy shared package
COPY shared ./shared
COPY database ./database

# Copy the specific service
COPY services/auth ./services/auth

# Install all workspace dependencies
RUN bun install

# Generate Prisma client for auth service AFTER install
RUN cd services/auth && bunx prisma generate --schema=./prisma/schema.prisma

# Build shared dependencies first
RUN cd shared && bun run build

# Build the auth service
RUN cd services/auth && bun build ./index.ts --outdir ./dist --target node

# Set working directory to the auth service
WORKDIR /app/services/auth

# Start the service
CMD ["bun", "run", "dist/index.js"]
