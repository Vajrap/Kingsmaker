// Export all shared types and utilities
export * from './types/types';
export * from './prisma/prisma';
export * from './redis/redis';
export * from './session/session';
export * from './session/sessionManagerClient';
export * from './utils/jsonPost';

// Export Prisma types
export type { User } from './prisma/generated';

// export * from './utils/email';
// export * from './utils/validation';

// Session management exports
export { sessionManagerClient } from './session/sessionManagerClient';
export type { SessionData } from './types/types';

// WebSocket validation utilities
export { 
    validateWSSession, 
    createWSErrorMessage,
    type WSMessage,
    type WSValidationResult 
} from './session/sessionManagerClient'; 