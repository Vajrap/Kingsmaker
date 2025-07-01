import type { SessionData, Player, GameRoom } from "../shared/types/types";
import { v4 as uuidv4 } from "uuid";

interface SessionResponse {
    status: "success" | "error";
    data: SessionData | null;
}

export class RoomInstance implements GameRoom {
    id: string;
    name: string;
    state: "WAITING" | "STARTING" | "IN_PROGRESS";
    players: Player[];
    maxPlayers: 2 | 3 | 4;
    turnTimeLimit: number;
    spectators: Player[];
    allowSpectators: boolean;
    allowAnonymousSpectators: boolean;
    createdAt: string;

    constructor(data: GameRoom) {
        const id = uuidv4();
        this.id = id;
        this.name = data.name;
        this.state = data.state;
        this.players = data.players;
        this.maxPlayers = data.maxPlayers;
        this.turnTimeLimit = data.turnTimeLimit;
        this.spectators = data.spectators;
        this.allowSpectators = data.allowSpectators;
        this.allowAnonymousSpectators = data.allowAnonymousSpectators;
        this.createdAt = Date.now().toString();

        console.log(`New Room Id: ${id}`);
    }

    isFull(): boolean {
        return this.players.length === this.maxPlayers;
    }

    isEmpty(): boolean {
        return this.players.length === 0;
    }

    async checkPresence() {
        const checks = this.players.map(async (player) => {
            try {
                const res = await fetch(
                    `http://sessionManager:3000/user/${player.userId}`,
                );
                const session = (await res.json()) as SessionResponse;

                if (session.status === "success" && session.data) {
                    if (session.data.presenceStatus !== "IN_WAITING_ROOM") {
                        this.removePlayer(player);
                    }
                } else {
                    console.warn(`User ${player.userId} is offline or invalid`);
                    this.removePlayer(player);
                }
            } catch (err) {
                console.error(
                    `Error checking presence for player ${player.userId}:`,
                    err,
                );
            }
        });

        await Promise.all(checks);
    }

    addPlayer(player: Player) {
        if (this.players.length < this.maxPlayers) {
            this.players.push(player);
        }
    }

    removePlayer(player: Player) {
        this.players = this.players.filter((p) => p.userId !== player.userId);
    }
}
