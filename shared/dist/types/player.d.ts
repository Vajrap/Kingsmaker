export interface Player {
    userId: string;
    username: string;
    userType: "registered" | "guest";
    isReady: boolean;
    profile: {
        portraitId?: string;
        skinId?: string;
    };
    lastSeen: string;
    character?: PlayerCharacterSetup;
}
export interface PlayerLocation {
    location: "lobby" | "waiting-room" | "game";
    roomId?: string;
    gameId?: string;
    lastSeen: string;
}
export interface PlayerCharacterSetup {
    portraitId: string;
    name: string;
    stats: {
        might: number;
        intelligence: number;
        dexterity: number;
    };
}
//# sourceMappingURL=player.d.ts.map