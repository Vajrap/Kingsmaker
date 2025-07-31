// Lobby Model - Data layer for lobby functionality

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

export interface Player {
    userId: string;
    username: string;
    userType: "registered" | "guest";
    isReady?: boolean;
}

export interface CreateRoomSettings {
    roomName: string;
    maxPlayers: 2 | 3 | 4;
    turnTimeLimit: number;
    allowSpectators: boolean;
    allowAnonymousSpectators: boolean;
}

export interface CreateRoomValidationResult {
    isValid: boolean;
    errors: string[];
}

export class LobbyModel {
    validateCreateRoomSettings(settings: CreateRoomSettings): CreateRoomValidationResult {
        const errors: string[] = [];

        // Validate room name
        if (!settings.roomName.trim()) {
            errors.push('Room name is required');
        } else if (settings.roomName.trim().length < 3) {
            errors.push('Room name must be at least 3 characters');
        } else if (settings.roomName.trim().length > 30) {
            errors.push('Room name must be less than 30 characters');
        }

        // Validate max players
        if (![2, 3, 4].includes(settings.maxPlayers)) {
            errors.push('Max players must be 2, 3, or 4');
        }

        // Validate turn time limit
        if (settings.turnTimeLimit < 30) {
            errors.push('Turn time limit must be at least 30 seconds');
        } else if (settings.turnTimeLimit > 600) {
            errors.push('Turn time limit must be less than 10 minutes');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    sanitizeRoomName(roomName: string): string {
        return roomName.trim();
    }

    formatTurnTimeLimit(seconds: number): string {
        if (seconds < 60) {
            return `${seconds}s`;
        } else {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
        }
    }

    getRoomStateDisplay(state: GameRoom['state']): { text: string; className: string } {
        switch (state) {
            case 'WAITING':
                return { text: 'Waiting', className: 'status-waiting' };
            case 'STARTING':
                return { text: 'Starting', className: 'status-starting' };
            case 'IN_PROGRESS':
                return { text: 'In Progress', className: 'status-in-progress' };
            default:
                return { text: 'Unknown', className: 'status-unknown' };
        }
    }
}

export const lobbyModel = new LobbyModel(); 