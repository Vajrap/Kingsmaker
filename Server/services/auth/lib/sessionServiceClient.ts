import type { User } from "@shared/prisma/generated";
import type { ApiResponse, SessionManagerResponse } from "@kingsmaker/shared/types/types";

const SESSION_MANAGER_URL = process.env.SESSION_MANAGER_URL || "http://sessionmanager:3000";

// Specific response types for sessionManager endpoints
type RemoveConnectionResponse = { success: boolean };
type UpdatePresenceResponse = { success: boolean };

// Type-safe HTTP client helper
async function makeSessionServiceRequest<T>(
    endpoint: string, 
    body: unknown
): Promise<T | null> {
    try {
        const response = await fetch(`${SESSION_MANAGER_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            console.error(`SessionService ${endpoint} failed: ${response.status}`);
            return null;
        }

        // Parse JSON without explicit casting
        const jsonData = await response.json();
        
        // Basic validation that it has the expected ApiResponse structure
        if (typeof jsonData === 'object' && jsonData !== null && 'success' in jsonData) {
            return jsonData as T;
        }
        
        console.error(`SessionService ${endpoint} returned invalid response structure`);
        return null;
    } catch (error) {
        console.error(`Failed to connect to SessionService ${endpoint}:`, error);
        return null;
    }
}

export async function addConnectionToSessionManager(user: User): Promise<SessionManagerResponse | null> {
    const result = await makeSessionServiceRequest<ApiResponse<SessionManagerResponse>>(
        '/addConnection', 
        user
    );
    
    if (result?.success) {
        return result.data;
    } else if (result) {
        console.error(`SessionManager addConnection error: ${result.message}`);
    }
    
    return null;
}

export async function removeConnectionFromSessionManager(userId: number): Promise<boolean> {
    const result = await makeSessionServiceRequest<ApiResponse<RemoveConnectionResponse>>(
        '/removeConnection', 
        { userId }
    );
    
    return result?.success === true;
}

export async function checkConnectionInSessionManager(userId: number): Promise<SessionManagerResponse | null> {
    const result = await makeSessionServiceRequest<ApiResponse<SessionManagerResponse | null>>(
        '/getConnection', 
        { userId }
    );
    
    return result?.success ? result.data : null;
}

export async function updatePresenceInSessionManager(userId: number, presence: 'IN_LOBBY' | 'IN_WAITING_ROOM' | 'IN_GAME' | 'OFFLINE'): Promise<boolean> {
    const result = await makeSessionServiceRequest<ApiResponse<UpdatePresenceResponse>>(
        '/updatePresence', 
        { userId, presence }
    );
    
    return result?.success === true && result.data.success === true;
} 