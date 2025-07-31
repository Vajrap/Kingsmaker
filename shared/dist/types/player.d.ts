import { User } from "../prisma/generated";
export declare class Player {
    userId: number;
    username: string;
    userType: "admin" | "registered" | "guest";
    nameAlias: string;
    isReady: boolean;
    profile: {
        portrait: string;
        skin: string;
    };
    lastSeen: string;
    connectionStatus: "connected" | "disconnected" | "grace_period";
    disconnectedAt: string | null;
    stats: {
        might: number;
        intelligence: number;
        dexterity: number;
    };
    location: PlayerLocation;
    sessionId: string | null;
    constructor(user: User);
}
export interface PlayerLocation {
    location: "lobby" | "waiting-room" | "game";
    roomId: string | null;
    gameId: string | null;
}
//# sourceMappingURL=player.d.ts.map