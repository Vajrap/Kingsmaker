import { redis } from '../redis/redis';
import type { SessionData } from '../types/types';

export class SessionManager {
    private static SESSION_TTL = 24 * 60 * 60; // 24 hours in seconds

    /**
     * Store session data in Redis with TTL
     */
    static async createSession(sessionId: string, sessionData: SessionData): Promise<void> {
        const key = `session:${sessionId}`;
        await redis.setex(key, this.SESSION_TTL, JSON.stringify(sessionData));
        
        // Track active sessions for user
        const userSessionsKey = `user-sessions:${sessionData.userId}`;
        await redis.sadd(userSessionsKey, sessionId);
        await redis.expire(userSessionsKey, this.SESSION_TTL);
    }

    /**
     * Retrieve session data from Redis
     */
    static async getSession(sessionId: string): Promise<SessionData | null> {
        const key = `session:${sessionId}`;
        const data = await redis.get(key);
        
        if (!data) {
            return null;
        }

        try {
            return JSON.parse(data) as SessionData;
        } catch (error) {
            console.error('Error parsing session data:', error);
            return null;
        }
    }

    /**
     * Update session activity and extend TTL
     */
    static async refreshSession(sessionId: string): Promise<boolean> {
        const sessionData = await this.getSession(sessionId);
        if (!sessionData) {
            return false;
        }

        // Update last activity
        sessionData.lastSeen = new Date().toISOString();
        
        // Store with fresh TTL
        await this.createSession(sessionId, sessionData);
        return true;
    }

    /**
     * Remove session from Redis
     */
    static async deleteSession(sessionId: string): Promise<void> {
        const sessionData = await this.getSession(sessionId);
        
        if (sessionData) {
            // Remove from user sessions set
            const userSessionsKey = `user-sessions:${sessionData.userId}`;
            await redis.srem(userSessionsKey, sessionId);
        }

        // Remove session data
        const key = `session:${sessionId}`;
        await redis.del(key);
    }

    /**
     * Get all active sessions for a user
     */
    static async getUserSessions(userId: string): Promise<string[]> {
        const userSessionsKey = `user-sessions:${userId}`;
        return await redis.smembers(userSessionsKey);
    }

    /**
     * Validate if session exists and is active
     */
    static async validateSession(sessionId: string): Promise<SessionData | null> {
        return await this.getSession(sessionId);
    }
} 