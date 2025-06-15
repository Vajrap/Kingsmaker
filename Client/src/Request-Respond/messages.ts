// Re-export shared types for backward compatibility
// Note: These types are deprecated, use LobbyClientMessage/LobbyServerMessage instead
export type { LobbyClientMessage as ClientMessage, LobbyServerMessage as ServerMessage } from '@shared/types/types';

// Legacy ServerError type for auth API compatibility
export interface ServerError {
  type: "ERROR";
  data: { message: string; code: string };
}
