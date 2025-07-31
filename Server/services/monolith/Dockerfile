FROM oven/bun:1.0.35 AS base

WORKDIR /app

# Copy shared package first (from root context)
COPY shared ./shared

# Set up environment for Prisma
RUN echo "DATABASE_URL=postgresql://postgres:postgres@db:5432/kingsmaker" > .env

# Install shared dependencies and generate Prisma client
RUN cd shared && bun install && bunx prisma generate --schema=./prisma/schema.prisma

# Build shared library
RUN cd shared && bun run build

# Copy the generated Prisma client to the dist folder
RUN cp -r shared/prisma/generated shared/dist/prisma/

# Copy the monolith service (from root context)
COPY Server/services/monolith ./monolith

# Fix the shared library path for Docker context
RUN cd monolith && sed 's|file:../../shared|file:../shared|g' package.json > package.json.tmp && mv package.json.tmp package.json

# Install monolith service dependencies (using the shared library)
RUN cd monolith && bun install

# Build the monolith service (the @kingsmaker/shared import should resolve properly)
RUN cd monolith && bun build ./index.ts --outdir ./dist --target node

# Set working directory to the monolith service
WORKDIR /app/monolith

# Start the service
CMD ["bun", "run", "dist/index.js"]
