import type { LobbyServerMessage, LobbyClientMessage, SessionData } from '../shared/types/types';

export async function handleJoinRoom(
    session: SessionData,
    msg: LobbyClientMessage
): Promise<LobbyServerMessage> {
    try {
        // Extract roomId from message
        if (msg.type !== "JOIN_ROOM" || !msg.data?.roomId) {
            return {
                type: "ERROR",
                data: {
                    code: "INVALID_REQUEST",
                    message: "Room ID is required"
                }
            };
        }

        const { roomId } = msg.data;

        // Send join request to waiting room service
        const roomServiceResponse: {
            status: "success" | "error";
            data: { success: boolean } | null;
        } = await fetch("http://waitingRoom:3000/joinRoom", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                roomId: roomId,
                playerSessionId: session.sessionId,
            }),
        }).then((res) => {
            console.log("JoinRoom - Response status:", res.status);
            return res.json();
        });

        console.log("JoinRoom response:", roomServiceResponse);

        if (roomServiceResponse.status === "error" || !roomServiceResponse.data) {
            return {
                type: "ROOM_JOINED",
                data: {
                    roomId: roomId,
                    success: false
                }
            };
        }

        return {
            type: "ROOM_JOINED",
            data: {
                roomId: roomId,
                success: roomServiceResponse.data.success
            }
        };
    } catch (err) {
        console.error("Failed to join room:", err);
        return {
            type: "ERROR",
            data: {
                code: "JOIN_ROOM_FETCH_FAIL",
                message: "Room service unreachable or crashed"
            }
        };
    }
}
