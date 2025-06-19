import { Redis } from 'ioredis';
import 'dotenv/config';
// Main Redis client for session operations
const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    retryStrategy: (times) => Math.min(times * 100, 2000),
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
    lazyConnect: true,
});
// Connection event handlers
redis.on('connect', () => {
    console.log('✅ Auth Redis client connected');
});
redis.on('error', (err) => {
    console.error('❌ Auth Redis client error:', err);
});
export { redis };
