import type { User } from "../shared/prisma/generated";
import type { SessionData } from "../shared/types/types";

const SESSION_MANAGER_URL = process.env.SESSION_MANAGER_URL || "http://sessionmanager:3000";

function isApiResponse(obj: unknown): obj is { success: boolean; data?: unknown; message?: string } {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'success' in obj &&
        typeof (obj as any).success === 'boolean'
    );
}

export async function getSession(sessionId: string): Promise<SessionData | null> {
    try {

        const response = await fetch(`${SESSION_MANAGER_URL}/getSession`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId }),    
        });

        const json = await response.json();

        if (!isApiResponse(json)) {
            console.error(`SessionManager /getSession returned invalid structure`, json);
            return null;
        }

        if (!response.ok || !json.success) {
            console.error(`SessionManager /getSession failed: ${json.message || response.status}`);
            return null;
        }

        return json.data as SessionData;
    } catch (error) {
        console.error(`Failed to call SessionManager /getSession:`, error);
        return null;
    }
}

export async function updatePresenceInSessionManager(sessionId: string, presenceStatus: string): Promise<SessionData | null> {
    try {
        const response = await fetch(`${SESSION_MANAGER_URL}/updatePresence`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId, presenceStatus }),
        });

        const json = await response.json();

        if (!isApiResponse(json)) {
            console.error(`SessionManager /updatePresence returned invalid structure`, json);
            return null;
        }

        if (!response.ok || !json.success) {
            console.error(`SessionManager /updatePresence failed: ${json.message || response.status}`);
            return null;
        }

        return json.data as SessionData;
    } catch (error) {
        console.error(`Failed to call SessionManager /updatePresence:`, error);
        return null;
    }
}


export async function addConnectionToSessionManager(user: User): Promise<SessionData | null> {
    try {
        const response = await fetch(`${SESSION_MANAGER_URL}/addConnection`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
        });

        const json = await response.json();

        if (!isApiResponse(json)) {
            console.error(`SessionManager /addConnection returned invalid structure`, json);
            return null;
        }

        if (!response.ok || !json.success) {
            console.error(`SessionManager addConnection failed: ${json.message || response.status}`);
            return null;
        }

        return json.data as SessionData;
    } catch (error) {
        console.error(`Failed to call SessionManager /addConnection:`, error);
        return null;
    }
}

export async function resumeConnectionInSessionManager(user: User): Promise<SessionData | null> {
    try {
        const response = await fetch(`${SESSION_MANAGER_URL}/resumeConnection`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
        });

        const json = await response.json();

        if (!isApiResponse(json)) {
            console.error(`SessionManager /resumeConnection returned invalid structure`, json);
            return null;
        }

        if (!response.ok || !json.success) {
            console.error(`SessionManager resumeConnection failed: ${json.message || response.status}`);
            return null;
        }

        return json.data as SessionData;
    } catch (error) {
        console.error(`Failed to call SessionManager /resumeConnection:`, error);
        return null;
    }
}

export async function removeConnectionFromSessionManager(userId: number): Promise<boolean> {
    try {
        const response = await fetch(`${SESSION_MANAGER_URL}/removeConnection`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            // Do we need to do Json string here
            body: JSON.stringify({ userId })
        });

        const json = await response.json();

        if (!isApiResponse(json)) {
            console.error(`SessionManager /removeConnection returned invalid structure`, json);
            return false;
        }

        if (!response.ok || !json.success) {
            console.warn(`SessionManager /removeConnection failed: ${json.message || response.status}`)
            return false;
        }

        return true;
    } catch (error) {
        console.error(`Failed to call SessionManager /removeConnection`, error);
        return false
    }
}
