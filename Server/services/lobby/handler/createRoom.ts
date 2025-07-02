import type {
    LobbyServerMessage,
    LobbyClientMessage,
    SessionData,
    GameRoom,
} from "@kingsmaker/shared/types/types";

export async function handleCreateRoom(
    session: SessionData,
    msg: LobbyClientMessage,
): Promise<LobbyServerMessage> {
    /*
    Create Room flow:
    - lobby service received create room request
    - lobby service send create room request to room service await for response
        - room service -> await create room, using in-memory room list for unique room id
        - room service -> send room created event to lobby service with roomId
    - lobby service -> send room created event to client with roomId
    - client move to room HTML page with roomId
    - client 'connect' ws to room service, with roomId
    - room service send join_room event to session service
        - session service update presence of user to 'waiting_room'
    - room service send room_data to client
    - client render the room UI
    */

    try {
        // Extract the GameRoom data from the message
        if (msg.type !== "CREATE_ROOM" || !msg.data?.data) {
            return {
                type: "ERROR",
                data: {
                    code: "INVALID_REQUEST",
                    message: "Invalid room data provided",
                },
            };
        }

        const gameRoomData: GameRoom = msg.data.data;

        const roomServiceResponse: {
            status: "success" | "error";
            data: { roomId: string } | null;
        } = await fetch("http://waitingRoom:3000/createRoom", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                hostSessionId: session.sessionId,
                gameRoomData: gameRoomData,
            }),
        }).then((res) => {
            console.log("Response headers:", res.headers);
            console.log("Status:", res.status);
            return res.json();
        });

        console.log(`Get response:`);
        console.log(roomServiceResponse);

        if (roomServiceResponse.status === "error") {
            return {
                type: "ERROR",
                data: {
                    code: "CREATE_ROOM_ERROR_STATUS",
                    message: "Failed to create room",
                },
            };
        }

        if (!roomServiceResponse.data?.roomId) {
            return {
                type: "ERROR",
                data: {
                    code: "CREATE_ROOM_ERROR_NULL",
                    message: "Failed to create room - no room ID returned",
                },
            };
        }

        return {
            type: "ROOM_CREATED",
            data: { roomId: roomServiceResponse.data.roomId },
        };
    } catch (err) {
        console.error("Failed to create room:", err);
        return {
            type: "ERROR",
            data: {
                code: "CREATE_ROOM_FETCH_FAIL",
                message: "Room service unreachable or crashed",
            },
        };
    }
}
