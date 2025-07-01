import type { Player } from "./player.ts";
export interface GameRoom {
    id: string;
    name: string;
    state: "WAITING" | "STARTING" | "IN_PROGRESS";
    players: Player[];
    maxPlayers: 2 | 3 | 4;
    turnTimeLimit: number;
    allowSpectators: boolean;
    allowAnonymousSpectators: boolean;
    spectators: Player[];
}
//# sourceMappingURL=room.d.ts.map