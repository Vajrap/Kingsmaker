import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { LobbyStateManager } from './lib/state';
import { subscriber } from './lib/redis';
import type {
  LobbyClientMessage,
  LobbyServerMessage, 
  WaitingRoomMetadata
} from '@kingsmaker/shared/types/types';
import 'dotenv/config';

const PORT = parseInt(process.env.PORT || '3000');
const stateManager = new LobbyStateManager();

// WebSocket Server Setup
const wss = new WebSocketServer({ port: PORT });

console.log(`🚀 Lobby Service is running on port ${PORT}`);

// Connection tracking
const connections = new Map<string, any>(); // sessionId -> { ws, userData }

// Connection tracking

// WebSocket connection handler
wss.on('connection', async (ws: WebSocket, request: IncomingMessage) => {
    console.log('🔌 New WebSocket connection');
    
    // Extract sessionId from query params or headers
    const url = new URL(request.url!, `http://${request.headers.host}`);
    const sessionId = url.searchParams.get('sessionId');
    
    if (!sessionId) {
        ws.close(1008, 'Missing sessionId');
        return;
    }

    // Verify session exists in Redis
    const sessionData = await stateManager.getSession(sessionId);
    if (!sessionData) {
        ws.close(1008, 'Invalid session');
        return;
    }

    // Store connection
    connections.set(sessionId, { ws, userData: sessionData });
    
    // Update player location to lobby
    await stateManager.setPlayerLocation(sessionData.userId, {
        location: 'lobby',
        lastSeen: new Date().toISOString()
    });

    console.log(`✅ Player connected: ${sessionData.username} (${sessionData.userType})`);

    // Send initial lobby state
    await sendLobbyState(sessionId);

    // Handle messages
    ws.on('message', async (data: Buffer) => {
        try {
            const message: LobbyClientMessage = JSON.parse(data.toString());
            await handleClientMessage(sessionId, message);
        } catch (error) {
            console.error('❌ Error handling message:', error);
            sendErrorMessage(sessionId, 'Invalid message format');
        }
    });

    // Handle disconnection
    ws.on('close', async () => {
        console.log(`👋 Player disconnected: ${sessionData.username}`);
        connections.delete(sessionId);
        await stateManager.removePlayerLocation(sessionData.userId);
    });
});

// Message handler
async function handleClientMessage(sessionId: string, message: LobbyClientMessage) {
    const connection = connections.get(sessionId);
    if (!connection) return;

    console.log(`📨 Message from ${connection.userData.username}:`, message.type);

    switch (message.type) {
        case 'GET_ROOM_LIST':
            await sendRoomList(sessionId);
            break;
            
        case 'CREATE_ROOM':
            await handleCreateRoom(sessionId, message.data);
            break;
            
        case 'JOIN_ROOM':
            await handleJoinRoom(sessionId, message.data.roomId);
            break;
            
        case 'LEAVE_ROOM':
            await handleLeaveRoom(sessionId, message.data.roomId);
            break;
            
        case 'REFRESH_LOBBY':
            await sendLobbyState(sessionId);
            break;
            
        default:
            sendErrorMessage(sessionId, `Unknown message type: ${message.type}`);
    }
}

// Room creation handler
async function handleCreateRoom(sessionId: string, roomData: { name: string; maxPlayers: 2 | 3 | 4 }) {
    const connection = connections.get(sessionId);
    if (!connection) return;

    const userData = connection.userData;
    const roomId = generateRoomId();
    
    const room = {
        id: roomId,
        name: roomData.name,
        hostId: userData.userId,
        hostUsername: userData.username,
        state: 'WAITING' as const,
        maxPlayers: roomData.maxPlayers,
        currentPlayers: 1,
        createdAt: new Date().toISOString(),
        playerList: [userData.username]
    };

    // Store room in Redis
    await stateManager.storeRoom(roomId, room);
    
    // Add host as first player
    const hostPlayer = {
        userId: userData.userId,
        username: userData.username,
        userType: userData.userType,
        isReady: false,
        profile: {},
        lastSeen: new Date().toISOString()
    };
    
    await stateManager.addPlayerToRoom(roomId, hostPlayer);
    
    // Publish room creation event
    await stateManager.publishRoomCreated(roomId, room);
    
    // Send confirmation to creator
    sendMessage(sessionId, {
        type: 'ROOM_CREATED',
        data: { room }
    });

    // Broadcast lobby update to all clients
    await broadcastLobbyUpdate();
    
    console.log(`🏠 Room created: ${roomData.name} by ${userData.username}`);
}

// Room joining handler
async function handleJoinRoom(sessionId: string, roomId: string) {
    const connection = connections.get(sessionId);
    if (!connection) return;

    const userData = connection.userData;
    const room = await stateManager.getRoom(roomId);
    
    if (!room) {
        sendErrorMessage(sessionId, 'Room not found');
        return;
    }
    
    if (room.currentPlayers >= room.maxPlayers) {
        sendErrorMessage(sessionId, 'Room is full');
        return;
    }
    
    // Add player to room
    const player = {
        userId: userData.userId,
        username: userData.username,
        userType: userData.userType,
        isReady: false,
        profile: {},
        lastSeen: new Date().toISOString()
    };
    
    await stateManager.addPlayerToRoom(roomId, player);
    
    // Update room player count
    room.currentPlayers++;
    room.playerList.push(userData.username);
    await stateManager.storeRoom(roomId, room);
    
    // Publish player joined event
    await stateManager.publishPlayerJoined(roomId, userData.userId, player);
    
    // Send confirmation
    sendMessage(sessionId, {
        type: 'ROOM_JOINED',
        data: { roomId, success: true }
    });

    // Update player location
    await stateManager.setPlayerLocation(userData.userId, {
        location: 'waiting-room',
        roomId,
        lastSeen: new Date().toISOString()
    });
    
    // Broadcast lobby update
    await broadcastLobbyUpdate();
    
    console.log(`🚪 ${userData.username} joined room: ${room.name}`);
}

// Room leaving handler
async function handleLeaveRoom(sessionId: string, roomId: string) {
    const connection = connections.get(sessionId);
    if (!connection) return;

    const userData = connection.userData;
    const room = await stateManager.getRoom(roomId);
    
    if (!room) return;
    
    // Remove player from room
    await stateManager.removePlayerFromRoom(roomId, userData.userId);
    
    // Update room player count
    room.currentPlayers = Math.max(0, room.currentPlayers - 1);
    room.playerList = room.playerList.filter(name => name !== userData.username);
    
    if (room.currentPlayers === 0) {
        // Remove empty room
        await stateManager.removeRoom(roomId);
        await stateManager.publishRoomClosed(roomId, 'Empty room');
    } else {
        await stateManager.storeRoom(roomId, room);
    }
    
    // Publish player left event
    await stateManager.publishPlayerLeft(roomId, userData.userId);
    
    // Update player location back to lobby
    await stateManager.setPlayerLocation(userData.userId, {
        location: 'lobby',
        lastSeen: new Date().toISOString()
    });
    
    // Broadcast lobby update
    await broadcastLobbyUpdate();
    
    console.log(`👋 ${userData.username} left room: ${room.name}`);
}

// Send room list to specific client
async function sendRoomList(sessionId: string) {
    const rooms = await stateManager.getAllRooms();
    sendMessage(sessionId, {
        type: 'ROOM_LIST',
        data: { rooms }
    });
}

// Send complete lobby state
async function sendLobbyState(sessionId: string) {
    const rooms = await stateManager.getAllRooms();
    const onlinePlayers = await stateManager.getOnlinePlayerCount();
    
    sendMessage(sessionId, {
        type: 'LOBBY_UPDATE',
        data: { rooms, onlinePlayers }
    });
}

// Broadcast lobby update to all connected clients
async function broadcastLobbyUpdate() {
    const rooms = await stateManager.getAllRooms();
    const onlinePlayers = await stateManager.getOnlinePlayerCount();
    
    const message = {
        type: 'LOBBY_UPDATE',
        data: { rooms, onlinePlayers }
    };
    
    connections.forEach((connection) => {
        if (connection.ws.readyState === 1) { // WebSocket.OPEN
            connection.ws.send(JSON.stringify(message));
        }
    });
}

// Send message to specific client
function sendMessage(sessionId: string, message: LobbyServerMessage) {
    const connection = connections.get(sessionId);
    if (connection && connection.ws.readyState === 1) {
        connection.ws.send(JSON.stringify(message));
    }
}

// Send error message
function sendErrorMessage(sessionId: string, errorMessage: string) {
    sendMessage(sessionId, {
        type: 'ERROR',
        data: { message: errorMessage, code: 'LOBBY_ERROR' }
    });
}

// Generate unique room ID
function generateRoomId(): string {
    return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Subscribe to Redis pub/sub events from other services
subscriber.on('message', async (channel: string, message: string) => {
    console.log(`📡 Received pub/sub message on ${channel}`);
    
    try {
        const data = JSON.parse(message);
        
        switch (channel) {
            case 'room_closed':
                // A waiting room service closed a room
                await broadcastLobbyUpdate();
                break;
                
            case 'game_ended':
                // A game ended, players might return to lobby
                await broadcastLobbyUpdate();
                break;
        }
    } catch (error) {
        console.error('❌ Error handling pub/sub message:', error);
    }
});

// Subscribe to relevant channels
subscriber.subscribe('room_closed', 'game_ended');

// Periodic cleanup
setInterval(async () => {
    await stateManager.cleanupExpiredData();
}, 5 * 60 * 1000); // Every 5 minutes

// Health check endpoint (if needed)
process.on('SIGINT', async () => {
    console.log('🛑 Shutting down lobby service...');
    wss.close();
    process.exit(0);
});

console.log('✅ Lobby service initialized successfully');
