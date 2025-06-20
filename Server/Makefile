schema=database/prisma/schema.prisma

.PHONY: generate build up down logs clean auth chat game lobby waitingroom store dev test-auth copy-shared clean-shared help

# Prisma commands
generate:
	npx prisma generate --schema=$(schema)

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
build:
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
	@echo "  generate     - Generate Prisma client"
	@echo "  copy-shared  - Copy shared library to all services for local development"
	@echo "  clean-shared - Remove copied shared libraries from all services"
	@echo "  build        - Build all Docker services"
	@echo "  up           - Start all services in background"
	@echo "  down         - Stop all services"
	@echo "  logs         - Show logs for all services"
	@echo "  clean        - Remove all containers, volumes, and images"
	@echo "  dev          - Copy shared, start services and show logs"
	@echo "  auth         - Build and run auth service with logs"
	@echo "  chat         - Build and run chat service with logs"
	@echo "  game         - Build and run game service with logs"
	@echo "  lobby        - Build and run lobby service with logs"
	@echo "  waitingroom  - Build and run waitingroom service with logs"
	@echo "  store        - Build and run store service with logs"
	@echo "  test-auth    - Test build auth service"
	@echo "  help         - Show this help message"
