import { v4 as uuidv4 } from "uuid";
import type { GameRoom } from "@kingsmaker/shared";
import { Player } from "@kingsmaker/shared";
import { PRESENCE_CONFIG } from "./presence";

export class WaitingRoom implements GameRoom {
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

    /**
     * Simplified presence checking using ClientManager directly
     */
    async checkPresence(clientManager: any) {
        const now = new Date();
        const playersToRemove: Player[] = [];

        for (const player of this.players) {
            try {
                // Check if player is still connected via ClientManager
                const isInLobby = clientManager.isPlayerInLobby(player.sessionId!);
                const playerData = clientManager.getPlayerBySessionId(player.sessionId!);
                
                if (!playerData) {
                    // Player no longer exists in ClientManager - remove immediately
                    console.log(`Player ${player.username} no longer in system, removing from room ${this.id}`);
                    playersToRemove.push(player);
                    continue;
                }

                // If player is still in lobby, they probably left the waiting room
                if (isInLobby && playerData.location.location === "lobby") {
                    console.log(`Player ${player.username} returned to lobby, removing from room ${this.id}`);
                    playersToRemove.push(player);
                    continue;
                }

                // Check for actual disconnections using socket status
                const hasActiveSocket = clientManager.lobbyConnections.has(player.sessionId!) || 
                                      clientManager.hasActiveSocket(player.sessionId!);

                if (!hasActiveSocket) {
                    this.handleDisconnectedPlayer(player, now, playersToRemove);
                } else {
                    // Player is connected - update status if needed
                    if (player.connectionStatus !== "connected") {
                        console.log(`Player ${player.username} reconnected to room ${this.id}`);
                        player.connectionStatus = "connected";
                        player.disconnectedAt = null;
                    }
                    player.lastSeen = now.toISOString();
                }

            } catch (err) {
                console.error(
                    `Error checking presence for player ${player.userId}:`,
                    err,
                );
                this.handleDisconnectedPlayer(player, now, playersToRemove);
            }
        }

        // Remove players that exceeded grace period or left intentionally
        playersToRemove.forEach((player) => this.removePlayer(player));

        if (playersToRemove.length > 0) {
            console.log(
                `Removed ${playersToRemove.length} players from room ${this.id}:`,
                playersToRemove.map(
                    (p) => `${p.username} (${p.connectionStatus})`,
                ),
            );
        }
    }

    private handleDisconnectedPlayer(
        player: Player,
        now: Date,
        playersToRemove: Player[],
    ) {
        // First time seeing this player as disconnected
        if (player.connectionStatus === "connected") {
            console.log(
                `Player ${player.username} went offline, starting grace period`,
            );
            player.connectionStatus = "grace_period";
            player.disconnectedAt = now.toISOString();
            return;
        }

        // Player is already in grace period - check if it expired
        if (
            player.connectionStatus === "grace_period" &&
            player.disconnectedAt
        ) {
            const disconnectedTime = new Date(player.disconnectedAt);
            const timeSinceDisconnect =
                now.getTime() - disconnectedTime.getTime();

            if (timeSinceDisconnect > PRESENCE_CONFIG.GRACE_PERIOD_MS) {
                console.log(
                    `Player ${player.username} grace period expired (${Math.round(timeSinceDisconnect / 1000)}s offline)`,
                );
                playersToRemove.push(player);
            } else {
                // Still in grace period
                player.connectionStatus = "disconnected";
                const remainingTime = Math.round(
                    (PRESENCE_CONFIG.GRACE_PERIOD_MS - timeSinceDisconnect) /
                        1000,
                );
                console.log(
                    `Player ${player.username} still in grace period (${remainingTime}s remaining)`,
                );
            }
        }
    }

    addPlayer(player: Player) {
        if (this.players.length < this.maxPlayers) {
            // Ensure new players start with proper connection status
            player.connectionStatus = "connected";
            player.disconnectedAt = null;
            player.lastSeen = new Date().toISOString();
            this.players.push(player);
        }
    }

    removePlayer(player: Player) {
        this.players = this.players.filter((p) => p.userId !== player.userId);
    }

    getPlayersWithStatus(): Array<Player & { displayStatus: string }> {
        return this.players.map((player) => ({
            ...player,
            displayStatus: this.getPlayerDisplayStatus(player),
        }));
    }

    private getPlayerDisplayStatus(player: Player): string {
        switch (player.connectionStatus) {
            case "connected":
                return "Online";
            case "disconnected":
            case "grace_period":
                const disconnectedAt = player.disconnectedAt
                    ? new Date(player.disconnectedAt)
                    : null;
                if (disconnectedAt) {
                    const secondsOffline = Math.round(
                        (Date.now() - disconnectedAt.getTime()) / 1000,
                    );
                    return `⚠️ Disconnected (${secondsOffline}s ago)`;
                }
                return "⚠️ Disconnected";
            default:
                return "Unknown";
        }
    }
}
