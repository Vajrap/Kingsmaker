import type { LobbyServerMessage, LobbyClientMessage, SessionData, GameRoom } from '@kingsmaker/shared/types/types';

export async function handleGetRoomList(
    session?: SessionData,
    msg?: LobbyClientMessage
): Promise<LobbyServerMessage> {
    try {
        // Get room list from waiting room service
        const roomServiceResponse: {
            status: "success" | "error";
            data: { rooms: GameRoom[] } | null;
        } = await fetch("http://waitingRoom:3000/getRoomList", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        }).then((res) => {
            console.log("GetRoomList - Response status:", res.status);
            return res.json();
        });

        console.log("GetRoomList response:", roomServiceResponse);

        if (roomServiceResponse.status === "error" || !roomServiceResponse.data) {
            console.warn("Failed to get room list from waiting room service");
            return {
                type: "ROOM_LIST",
                data: { rooms: [] }
            };
        }

        return {
            type: "ROOM_LIST",
            data: { rooms: roomServiceResponse.data.rooms }
        };
    } catch (err) {
        console.error("Failed to fetch room list:", err);
        return {
            type: "ROOM_LIST",
            data: { rooms: [] }
        };
    }
}
