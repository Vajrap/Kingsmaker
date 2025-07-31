// Waiting Room Model - Data layer for waiting room functionality

export interface Player {
    userId: string;
    username: string;
    userType: "registered" | "guest";
    isReady: boolean;
    displayStatus?: string;
    connectionStatus?: "connected" | "disconnected" | "grace_period";
}

export interface WaitingRoomData {
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

export interface RoomSettings {
    name: string;
    turnTimeLimit: number;
    allowSpectators: boolean;
    allowAnonymousSpectators: boolean;
}

export class WaitingRoomModel {
    formatTurnTimeLimit(seconds: number): string {
        if (seconds < 60) {
            return `${seconds}s`;
        } else {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
        }
    }

    getReadyStatus(players: Player[]): { ready: number; total: number; allReady: boolean } {
        const ready = players.filter(p => p.isReady).length;
        const total = players.length;
        const allReady = total >= 2 && ready === total;
        
        return { ready, total, allReady };
    }

    canStartGame(players: Player[]): boolean {
        return players.length >= 2 && players.every(p => p.isReady);
    }

    getPlayerDisplayStatus(player: Player): string {
        if (player.displayStatus) {
            return player.displayStatus;
        }
        
        return player.connectionStatus === 'connected' ? 'Online' : 'Offline';
    }
}

export const waitingRoomModel = new WaitingRoomModel(); 