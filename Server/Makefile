schema=../shared/prisma/schema.prisma

.PHONY: generate migrate migrate-init migrate-deploy migrate-reset db-push db-reset-hard build up down logs clean auth chat game lobby waitingroom store dev test-auth copy-shared clean-shared help

# Prisma commands
generate:
	@echo "🔧 Generating Prisma client from shared schema..."
	cd ../shared && bunx prisma generate --schema=./prisma/schema.prisma

# Database configuration
DATABASE_URL ?= postgresql://postgres:postgres@localhost:7432/kingsmaker

# Database migration commands
migrate:
	@echo "🗄️ Running database migrations from shared schema..."
	cd ../shared && DATABASE_URL=$(DATABASE_URL) bunx prisma migrate dev --schema=./prisma/schema.prisma

migrate-init:
	@echo "🔧 Creating initial migration from shared schema..."
	cd ../shared && DATABASE_URL=$(DATABASE_URL) bunx prisma migrate dev --name init --schema=./prisma/schema.prisma

migrate-deploy:
	@echo "🚀 Deploying database migrations from shared schema..."
	cd ../shared && DATABASE_URL=$(DATABASE_URL) bunx prisma migrate deploy --schema=./prisma/schema.prisma

migrate-reset:
	@echo "⚠️ Resetting database and running migrations from shared schema..."
	cd ../shared && DATABASE_URL=$(DATABASE_URL) bunx prisma migrate reset --schema=./prisma/schema.prisma

db-push:
	@echo "📊 Pushing schema state to database (no migrations)..."
	cd ../shared && DATABASE_URL=$(DATABASE_URL) bunx prisma db push --schema=./prisma/schema.prisma

db-reset-hard:
	@echo "💥 Hard reset: Dropping all tables and recreating from schema..."
	cd ../shared && DATABASE_URL=$(DATABASE_URL) bunx prisma db push --force-reset --schema=./prisma/schema.prisma

# Add @prisma/client to a service (usage: make install SERVICE=auth)
install:
	cd services/$(SERVICE) && bun add @prisma/client

# Regenerate and install for a specific service
refresh:
	make generate && make install SERVICE=$(SERVICE)

# Shared library commands
copy-shared:
	@echo "📦 Copying shared library to all services..."
	@echo "Building shared library first..."
	cd ../shared && bun install && bunx prisma generate --schema=./prisma/schema.prisma && bun run build
	@echo "Copying to auth service..."
	mkdir -p services/auth/shared && cp -r ../shared/* services/auth/shared/
	@echo "Copying to chat service..."
	mkdir -p services/chat/shared && cp -r ../shared/* services/chat/shared/
	@echo "Copying to game service..."
	mkdir -p services/game/shared && cp -r ../shared/* services/game/shared/
	@echo "Copying to lobby service..."
	mkdir -p services/lobby/shared && cp -r ../shared/* services/lobby/shared/
	@echo "Copying to sessionManager service..."
	mkdir -p services/sessionManager/shared && cp -r ../shared/* services/sessionManager/shared/
	@echo "Copying to store service..."
	mkdir -p services/store/shared && cp -r ../shared/* services/store/shared/
	@echo "Copying to waitingRoom service..."
	mkdir -p services/waitingRoom/shared && cp -r ../shared/* services/waitingRoom/shared/
	@echo "✅ Shared library copied to all services!"

clean-shared:
	@echo "🧹 Cleaning copied shared libraries from all services..."
	rm -rf services/*/shared
	@echo "✅ Cleaned all copied shared libraries!"

# Docker Compose commands
build: copy-shared
	@echo "🐳 Building Docker services..."
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

clean:
	docker-compose down -v --rmi all

# Development commands
dev: copy-shared up logs

# Build and run individual services
auth:
	docker-compose up --build -d auth db
	docker-compose logs -f auth

chat:
	docker-compose up --build -d chat db
	docker-compose logs -f chat

game:
	docker-compose up --build -d game db
	docker-compose logs -f game

lobby:
	docker-compose up --build -d lobby db
	docker-compose logs -f lobby

waitingroom:
	docker-compose up --build -d waitingroom db
	docker-compose logs -f waitingroom

store:
	docker-compose up --build -d store db
	docker-compose logs -f store

# Test individual service builds
test-auth:
	docker build -f services/auth/Dockerfile -t test-auth .

test-chat:
	docker build -f services/chat/Dockerfile -t test-chat .

# Help command
help:
	@echo "Available commands:"
	@echo "  generate      - Generate Prisma client from shared schema"
	@echo "  migrate       - Run database migrations from shared schema"
	@echo "  migrate-init  - Create initial migration from shared schema"
	@echo "  migrate-deploy- Deploy database migrations (production)"
	@echo "  migrate-reset - Reset database and run migrations"
	@echo "  db-push       - Push schema to database (no migrations)"
	@echo "  db-reset-hard - Drop all tables and recreate from schema"
	@echo "  copy-shared   - Copy shared library to all services for local development"
	@echo "  clean-shared  - Remove copied shared libraries from all services"
	@echo "  build         - Copy shared and build all Docker services"
	@echo "  up            - Start all services in background"
	@echo "  down          - Stop all services"
	@echo "  logs          - Show logs for all services"
	@echo "  clean         - Remove all containers, volumes, and images"
	@echo "  dev           - Copy shared, start services and show logs"
	@echo "  auth          - Build and run auth service with logs"
	@echo "  chat          - Build and run chat service with logs"
	@echo "  game          - Build and run game service with logs"
	@echo "  lobby         - Build and run lobby service with logs"
	@echo "  waitingroom   - Build and run waitingroom service with logs"
	@echo "  store         - Build and run store service with logs"
	@echo "  test-auth     - Test build auth service"
	@echo "  help          - Show this help message"
