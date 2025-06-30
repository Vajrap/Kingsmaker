import type {
    LobbyClientMessage,
    LobbyServerMessage,
    SessionData,
} from "./shared/types/types";
import "dotenv/config";
import { Elysia, t } from "elysia";
import { handleGetRoomList } from "./handler/getRoomList";
import { sessionManagerClient } from "./shared/session/sessionManagerClient";
import { prisma } from "./shared/prisma/prisma";
import { handleJoinRoom } from "./handler/joinRoom";
import { handleCreateRoom } from "./handler/createRoom";
import { ElysiaWS } from "elysia/dist/ws";

const PORT = parseInt(process.env.PORT || "3000");

const connections = new Map<
    string,
    {
        ws: ElysiaWS;
        session: SessionData;
    }
>();

// Helper function for session validation
async function getUserIdFromSessionId(
    sessionId: string,
): Promise<number | null> {
    const user = await prisma.user.findFirst({
        where: { sessionId },
        select: { id: true },
    });
    return user?.id || null;
}

// WebSocket validation utilities (inline)
interface WSMessage {
    type: string;
    data?: {
        sessionId?: string;
        [key: string]: any;
    };
}

interface WSValidationResult {
    isValid: boolean;
    userId?: number;
    sessionData?: SessionData;
    errorMessage?: string;
}

async function validateWSSession(
    message: WSMessage,
    getUserIdFromSessionId: (sessionId: string) => Promise<number | null>,
): Promise<WSValidationResult> {
    const sessionId = message.data?.sessionId;
    if (!sessionId) {
        return {
            isValid: false,
            errorMessage: "MISSING_SESSION_ID",
        };
    }

    try {
        const sessionData = await sessionManagerClient.getSessionBySessionId(
            sessionId,
            getUserIdFromSessionId,
        );

        if (!sessionData) {
            return {
                isValid: false,
                errorMessage: "INVALID_SESSION",
            };
        }

        return {
            isValid: true,
            userId: sessionData.userId,
            sessionData,
        };
    } catch (error) {
        console.error("Session validation error:", error);
        return {
            isValid: false,
            errorMessage: "SESSION_VALIDATION_ERROR",
        };
    }
}

function createWSErrorMessage(
    type: string,
    errorCode: string,
    message?: string,
): LobbyServerMessage {
    return {
        type: "ERROR",
        data: {
            code: errorCode,
            message: message || errorCode,
        },
    } as LobbyServerMessage;
}

new Elysia()
    .ws("/lobby", {
        body: t.Object({
            type: t.String(),
            data: t.Optional(t.Any()),
        }),
        async open(ws) {
            console.log(
                "New WebSocket connection opened, waiting for first message...",
            );
            // Don't validate here - wait for first message with sessionId
        },
        async message(ws, msg: LobbyClientMessage) {
            // Validate session using standardized approach
            const validation = await validateWSSession(
                msg,
                getUserIdFromSessionId,
            );

            if (!validation.isValid) {
                return ws.send(
                    JSON.stringify(
                        createWSErrorMessage(
                            "VALIDATION_ERROR",
                            validation.errorMessage!,
                        ),
                    ),
                );
            }

            const { sessionData } = validation;
            const sessionId = msg.data?.sessionId!;

            // Store connection if not already stored
            if (!connections.has(sessionId)) {
                // Handle presence status on first connection
                switch (sessionData!.presenceStatus) {
                    case "IN_WAITING_ROOM": {
                        // TODO: Check if WaitingRoom is still valid
                        // Check the send player back into the waiting room
                        // If the waiting room is not found, set the player into the lobby
                    }
                    case "IN_GAME": {
                        // TODO: Check if Game ended
                        // This one will need to send the player back to the game is the game is still running
                        // But if the game is ended, not found, just set the player into the lobby
                    }
                }

                // Set player into the lobby => add into connections map
                connections.set(sessionId, { ws, session: sessionData! });
                console.log(
                    `User with ID: ${sessionData!.userId} connected to lobby`,
                );

                // Send initial room list for first connection
                if (msg.type === "GET_ROOM_LIST") {
                    const roomList = await handleGetRoomList();
                    return ws.send(JSON.stringify(roomList));
                }
            }

            // Handle different message types
            let response: LobbyServerMessage;
            console.log(`Received message type: ${msg.type}`);
            console.log(`Session Data:`);
            console.log(sessionData);
            console.log(`Message:`);
            console.log(msg);
            switch (msg.type) {
                case "GET_ROOM_LIST": {
                    response = await handleGetRoomList(sessionData, msg);
                    break;
                }
                case "JOIN_ROOM": {
                    response = await handleJoinRoom(sessionData!, msg);
                    break;
                }
                case "CREATE_ROOM": {
                    response = await handleCreateRoom(sessionData!, msg);
                    break;
                }
                default: {
                    response = createWSErrorMessage(
                        "MESSAGE_ERROR",
                        "UNKNOWN_MESSAGE_TYPE",
                    );
                }
            }

            ws.send(JSON.stringify(response));
        },
        close(ws) {
            // Remove connection from map when client disconnects
            for (const [sessionId, connection] of connections) {
                if (connection.ws === ws) {
                    connections.delete(sessionId);
                    console.log(`User disconnected from lobby: ${sessionId}`);
                    break;
                }
            }
        },
    })
    .listen(PORT);

console.log(`🚀 Lobby service running on http://localhost:${PORT}`);
