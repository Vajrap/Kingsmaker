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

# Copy the auth service (from root context)
COPY Server/services/auth ./auth

# Fix the file dependency issue by removing the problematic shared dependency
RUN cd auth && sed 's/"@kingsmaker\/shared": "file:..\/..\/shared",//g' package.json > package.json.tmp && mv package.json.tmp package.json

# Install auth service dependencies
RUN cd auth && bun install

# Copy shared library into auth service (bypass symlink issues)
RUN mkdir -p auth/shared && cp -r shared/* auth/shared/

# Fix the binary issue by copying the correct Linux binary
RUN cp auth/shared/node_modules/@prisma/engines/libquery_engine-linux-arm64-openssl-1.1.x.so.node auth/shared/prisma/generated/

# Build the auth service
RUN cd auth && bun build ./index.ts --outdir ./dist --target node

# Set working directory to the auth service
WORKDIR /app/auth

# Start the service
CMD ["bun", "run", "dist/index.js"]
