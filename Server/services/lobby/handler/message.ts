import type { LobbyClientMessage, LobbyServerMessage, SessionData } from "@kingsmaker/shared/types/types";
import { handleGetWaitingRoomList } from "./getRoomList";
import { handleJoinRoom } from "./joinRoom";
import { handleCreateRoom } from "./createRoom";
import { connections } from "../logic/connections";
import { validateWSSession, createWSErrorMessage } from "@kingsmaker/shared/session/sessionManagerClient";
import { prisma } from "@kingsmaker/shared/prisma/prisma";

// Helper function for session validation
async function getUserIdFromSessionId(sessionId: string): Promise<number | null> {
    const user = await prisma.user.findFirst({
        where: { sessionId },
        select: { id: true },
    });
    return user?.id || null;
}

export async function handleMessage(ws: any, msg: LobbyClientMessage): Promise<void> {
    // Validate session using standardized approach
    const validation = await validateWSSession(msg, getUserIdFromSessionId);

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
    if (!connections.getConnectionBySessionId(sessionId)) {
        // Set player into the lobby => add into connections map
        connections.addConnection(ws, sessionData!);
        console.log(`User with ID: ${sessionData!.userId} connected to lobby`);

        // Send initial room list for first connection
        if (msg.type === "GET_ROOM_LIST") {
            const roomList = await handleGetWaitingRoomList();
            return ws.send(JSON.stringify(roomList));
        }
    }

    // Handle different message types
    let response: LobbyServerMessage;
    console.log(`Received message type: ${msg.type}`);
    console.log(`Session Data:`, sessionData);
    console.log(`Message:`, msg);
    
    switch (msg.type) {
        case "GET_ROOM_LIST": {
            response = await handleGetWaitingRoomList(sessionData, msg);
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
            ) as LobbyServerMessage;
        }
    }

    ws.send(JSON.stringify(response));
} 