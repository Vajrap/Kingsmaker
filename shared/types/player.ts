import { User } from "../prisma/generated";

export class Player {
    userId: number;
    username: string;
    userType: "admin" | "registered" | "guest";
    nameAlias: string;
    isReady: boolean = false;
    profile: {
        portrait: string;
        skin: string;
    };
    lastSeen: string;
    connectionStatus: "connected" | "disconnected" | "grace_period";
    disconnectedAt: string | null = null;
    stats: {
        might: number;
        intelligence: number;
        dexterity: number;
    };
    location: PlayerLocation;
    sessionId: string | null;
    constructor(user: User) {
        this.userId = user.id;
        this.username = user.username;
        this.userType = user.type;
        this.nameAlias = user.nameAlias;
        this.profile = {
            portrait: user.portrait,
            skin: user.skin,
        };
        this.lastSeen = new Date().toISOString();
        this.connectionStatus = "connected";
        this.stats = {
            might: user.might,
            intelligence: user.intelligence,
            dexterity: user.dexterity,
        };
        this.location = {
            location: "lobby",
            roomId: null,
            gameId: null,
        };
        this.sessionId = user.sessionId;
    }
}

export interface PlayerLocation {
    location: "lobby" | "waiting-room" | "game";
    roomId: string | null;
    gameId: string | null;
}
