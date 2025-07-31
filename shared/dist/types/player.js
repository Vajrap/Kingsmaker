export class Player {
    userId;
    username;
    userType;
    nameAlias;
    isReady = false;
    profile;
    lastSeen;
    connectionStatus;
    disconnectedAt = null;
    stats;
    location;
    sessionId;
    constructor(user) {
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
