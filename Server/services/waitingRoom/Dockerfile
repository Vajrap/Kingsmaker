FROM oven/bun:1.0.35 AS base

WORKDIR /app

# Copy shared package first (from root context)
COPY shared ./shared

# Set up environment for Pris`ma
RUN echo "DATABASE_URL=postgresql://postgres:postgres@db:5432/kingsmaker" > .env

# Install shared dependencies and generate Prisma client
RUN cd shared && bun install && bunx prisma generate --schema=./prisma/schema.prisma

# Build shared library with correct imports
RUN cd shared && bun run build

# Copy the waitingRoom service (from root context)
COPY Server/services/waitingRoom ./waitingRoom

# Fix the file dependency issue by removing the problematic shared dependency
RUN cd waitingRoom && sed 's/"@kingsmaker\/shared": "file:..\/..\/shared",//g' package.json > package.json.tmp && mv package.json.tmp package.json

# Install waitingRoom service dependencies
RUN cd waitingRoom && bun install

# Copy shared library into waitingRoom service (bypass symlink issues)
RUN mkdir -p waitingRoom/shared && cp -r shared/* waitingRoom/shared/

# Fix the binary issue by copying the correct Linux binary
RUN cp waitingRoom/shared/node_modules/@prisma/engines/libquery_engine-linux-arm64-openssl-1.1.x.so.node waitingRoom/shared/prisma/generated/

# Build the waitingRoom service
RUN cd waitingRoom && bun build ./index.ts --outdir ./dist --target node

# Set working directory to the waitingRoom service
WORKDIR /app/waitingRoom

# Start the service
CMD ["bun", "run", "dist/index.js"]
