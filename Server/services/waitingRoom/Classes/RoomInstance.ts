import type { SessionData, Player, GameRoom } from "@kingsmaker/shared/types/types";
import { v4 as uuidv4 } from "uuid";
import { PRESENCE_CONFIG } from "../config/presence";

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

    /**
     * Smart presence checking with grace periods and different removal strategies
     */
    async checkPresence() {
        const now = new Date();
        const playersToRemove: Player[] = [];

        const checks = this.players.map(async (player) => {
            try {
                const res = await fetch(
                    `http://sessionManager:3000/getConnection`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            userId: parseInt(player.userId),
                        }),
                    },
                );
                const session = (await res.json()) as SessionResponse;

                if (session.status === "success" && session.data) {
                    await this.handlePlayerPresence(player, session.data, now, playersToRemove);
                } else {
                    // No session found - handle as disconnected
                    console.warn(`User ${player.userId} session not found`);
                    await this.handleDisconnectedPlayer(player, now, playersToRemove);
                }
            } catch (err) {
                console.error(`Error checking presence for player ${player.userId}:`, err);
                await this.handleDisconnectedPlayer(player, now, playersToRemove);
            }
        });

        await Promise.all(checks);

        // Remove players that exceeded grace period or left intentionally
        playersToRemove.forEach(player => this.removePlayer(player));
        
        if (playersToRemove.length > 0) {
            console.log(`Removed ${playersToRemove.length} players from room ${this.id}:`, 
                       playersToRemove.map(p => `${p.username} (${p.connectionStatus})`));
        }
    }

    /**
     * Handle player presence based on their session status
     */
    private async handlePlayerPresence(
        player: Player, 
        sessionData: SessionData, 
        now: Date,
        playersToRemove: Player[]
    ) {
        const currentStatus = sessionData.presenceStatus;

        // Immediate removal cases (intentional navigation away)
        if (PRESENCE_CONFIG.IMMEDIATE_REMOVAL_STATUSES.includes(currentStatus as any)) {
            console.log(`Player ${player.username} intentionally left (status: ${currentStatus})`);
            playersToRemove.push(player);
            return;
        }

        // Player is in correct status - restore to connected if needed
        if (PRESENCE_CONFIG.VALID_ROOM_STATUSES.includes(currentStatus as any)) {
            if (player.connectionStatus !== "connected") {
                console.log(`Player ${player.username} reconnected to room ${this.id}`);
                player.connectionStatus = "connected";
                player.disconnectedAt = undefined;
            }
            player.lastSeen = now.toISOString();
            return;
        }

        // Handle other statuses (might be temporary issues)
        await this.handleDisconnectedPlayer(player, now, playersToRemove);
    }

    /**
     * Handle disconnected or problematic player connections
     */
    private async handleDisconnectedPlayer(
        player: Player, 
        now: Date,
        playersToRemove: Player[]
    ) {
        // First time seeing this player as disconnected
        if (player.connectionStatus === "connected") {
            console.log(`Player ${player.username} went offline, starting grace period`);
            player.connectionStatus = "grace_period";
            player.disconnectedAt = now.toISOString();
            return;
        }

        // Player is already in grace period - check if it expired
        if (player.connectionStatus === "grace_period" && player.disconnectedAt) {
            const disconnectedTime = new Date(player.disconnectedAt);
            const timeSinceDisconnect = now.getTime() - disconnectedTime.getTime();

            if (timeSinceDisconnect > PRESENCE_CONFIG.GRACE_PERIOD_MS) {
                console.log(`Player ${player.username} grace period expired (${Math.round(timeSinceDisconnect / 1000)}s offline)`);
                playersToRemove.push(player);
            } else {
                // Still in grace period
                player.connectionStatus = "disconnected";
                const remainingTime = Math.round((PRESENCE_CONFIG.GRACE_PERIOD_MS - timeSinceDisconnect) / 1000);
                console.log(`Player ${player.username} still in grace period (${remainingTime}s remaining)`);
            }
        }
    }

    addPlayer(player: Player) {
        if (this.players.length < this.maxPlayers) {
            // Ensure new players start with proper connection status
            player.connectionStatus = "connected";
            player.disconnectedAt = undefined;
            player.lastSeen = new Date().toISOString();
            this.players.push(player);
        }
    }

    removePlayer(player: Player) {
        this.players = this.players.filter((p) => p.userId !== player.userId);
    }

    /**
     * Get players with their current connection status for UI
     */
    getPlayersWithStatus(): Array<Player & { displayStatus: string }> {
        return this.players.map(player => ({
            ...player,
            displayStatus: this.getPlayerDisplayStatus(player)
        }));
    }

    /**
     * Get user-friendly display status for a player
     */
    private getPlayerDisplayStatus(player: Player): string {
        switch (player.connectionStatus) {
            case "connected":
                return "Online";
            case "disconnected":
            case "grace_period":
                const disconnectedAt = player.disconnectedAt ? new Date(player.disconnectedAt) : null;
                if (disconnectedAt) {
                    const secondsOffline = Math.round((Date.now() - disconnectedAt.getTime()) / 1000);
                    return `⚠️ Disconnected (${secondsOffline}s ago)`;
                }
                return "⚠️ Disconnected";
            default:
                return "Unknown";
        }
    }
}
