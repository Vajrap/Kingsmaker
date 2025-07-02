// Presence checking configuration for waiting rooms
export const PRESENCE_CONFIG = {
    // How often to check all room presences (2 minutes)
    CHECK_INTERVAL_MS: 2 * 60 * 1000,
    
    // Grace period before removing offline players (3 minutes)
    GRACE_PERIOD_MS: 3 * 60 * 1000,
    
    // How long to wait before considering a session "stale" (5 minutes)
    SESSION_TIMEOUT_MS: 5 * 60 * 1000,
    
    // Quick removal scenarios (no grace period)
    IMMEDIATE_REMOVAL_STATUSES: ['IN_LOBBY', 'OFFLINE'] as const,
    
    // Statuses that should keep player in room
    VALID_ROOM_STATUSES: ['IN_WAITING_ROOM'] as const,
} as const;

export type ImmediateRemovalStatus = typeof PRESENCE_CONFIG.IMMEDIATE_REMOVAL_STATUSES[number];
export type ValidRoomStatus = typeof PRESENCE_CONFIG.VALID_ROOM_STATUSES[number]; 