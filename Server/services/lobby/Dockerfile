FROM oven/bun:1.0.35 as base

WORKDIR /app

# Copy the root workspace package.json to set up the workspace
COPY package.json ./
COPY package-lock.json* ./

# Copy shared package
COPY ../shared ./shared
COPY database ./database

# Copy the specific service
COPY services/lobby ./services/lobby

# Set up environment for Prisma
RUN echo "DATABASE_URL=postgresql://postgres:postgres@db:5432/kingsmaker" > .env

# Install all workspace dependencies
RUN bun install

# Generate Prisma client first
RUN cd database && bunx prisma generate

# Build shared dependencies first
RUN cd shared && bun run build

# Build the lobby service
RUN cd services/lobby && bun build ./index.ts --outdir ./dist --target node

# Set working directory to the lobby service
WORKDIR /app/services/lobby

# Start the service
CMD ["bun", "run", "dist/index.js"]
