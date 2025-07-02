import { Elysia, t } from "elysia";
import type { GameRoom } from "@kingsmaker/shared/types/types";
import { roomManager } from "./Classes/RoomManager";

const PORT = parseInt(process.env.PORT || "3000");

console.log("Waiting Room service running.");

// Request/Response interfaces
interface CreateRoomRequest {
    hostSessionId: string;
    gameRoomData: GameRoom;
}

interface JoinRoomRequest {
    roomId: string;
    playerSessionId: string;
}

// WebSocket message types
interface RoomWSMessage {
    type: "GET_ROOM_DATA" | "PLAYER_UPDATE" | "LEAVE_ROOM";
    data: {
        sessionId: string;
        roomId: string;
        [key: string]: any;
    };
}

new Elysia()
    // REST API endpoints for lobby service
    .post("/createRoom", async ({ body }: { body: CreateRoomRequest }) => {
        console.log("Creating room with data:", body);

        try {
            const result = await roomManager.createNewRoom(
                body.gameRoomData,
                body.hostSessionId,
            );

            if (!result.success) {
                return {
                    status: "error",
                    data: null,
                    message: result.message,
                };
            }

            return {
                status: "success",
                data: { roomId: result.data.roomId },
            };
        } catch (error) {
            console.error("Error creating room:", error);
            return {
                status: "error",
                data: null,
                message: "Failed to create room",
            };
        }
    })
    .get("/getRoomList", async () => {
        console.log("Getting room list");

        try {
            const rooms = roomManager.getAllRooms();
            return {
                status: "success",
                data: { rooms },
            };
        } catch (error) {
            console.error("Error getting room list:", error);
            return {
                status: "error",
                data: null,
                message: "Failed to get room list",
            };
        }
    })
    .post("/joinRoom", async ({ body }: { body: JoinRoomRequest }) => {
        console.log("Joining room:", body);

        try {
            const success = await roomManager.addPlayerToRoom(
                body.roomId,
                body.playerSessionId,
            );
            return {
                status: "success",
                data: { success },
            };
        } catch (error) {
            console.error("Error joining room:", error);
            return {
                status: "error",
                data: null,
                message: "Failed to join room",
            };
        }
    })
    // WebSocket endpoint for real-time room management
    .ws("/room", {
        body: t.Object({
            type: t.String(),
            data: t.Object({
                sessionId: t.String(),
                roomId: t.String(),
            }),
        }),
        async message(ws, msg: RoomWSMessage) {
            const { sessionId, roomId } = msg.data;

            switch (msg.type) {
                case "GET_ROOM_DATA": {
                    const room = roomManager.getRoom(roomId);
                    if (!room) {
                        return ws.send(
                            JSON.stringify({
                                type: "ERROR",
                                data: { message: "Room not found" },
                            }),
                        );
                    }

                    const player = room.players.find(
                        (p) => p.userId === sessionId,
                    );
                    if (!player) {
                        return ws.send(
                            JSON.stringify({
                                type: "ERROR",
                                data: { message: "Not in room" },
                            }),
                        );
                    }

                    const isHost = room.players[0]?.userId === sessionId;

                    // Get enhanced player data with connection status
                    const playersWithStatus = room.getPlayersWithStatus();

                    ws.send(
                        JSON.stringify({
                            type: "ROOM_DATA",
                            data: {
                                room: {
                                    id: room.id,
                                    name: room.name,
                                    state: room.state,
                                    players: playersWithStatus,
                                    maxPlayers: room.maxPlayers,
                                    turnTimeLimit: room.turnTimeLimit,
                                    allowSpectators: room.allowSpectators,
                                    allowAnonymousSpectators:
                                        room.allowAnonymousSpectators,
                                    spectators: room.spectators,
                                },
                                playerRole: isHost ? "host" : "player",
                                connectionInfo: {
                                    connectedPlayers: playersWithStatus.filter(p => p.connectionStatus === "connected").length,
                                    disconnectedPlayers: playersWithStatus.filter(p => p.connectionStatus !== "connected").length,
                                },
                            },
                        }),
                    );
                    break;
                }
                // Add more message types as needed
            }
        },
    })
    .listen(PORT);

console.log(`🚀 Waiting Room service running on http://localhost:${PORT}`);
