import { Redis } from 'ioredis';
import 'dotenv/config';

// Main Redis client for data operations
const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    retryStrategy: (times) => Math.min(times * 100, 2000),
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
    lazyConnect: true,
});

// Separate Redis client for pub/sub operations
const subscriber = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    retryStrategy: (times) => Math.min(times * 100, 2000),
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
    lazyConnect: true,
});

// Publisher client (can reuse main redis client, but separate for clarity)
const publisher = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    retryStrategy: (times) => Math.min(times * 100, 2000),
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
    lazyConnect: true,
});

// Connection event handlers
redis.on('connect', () => {
    console.log('✅ Redis client connected');
});

redis.on('error', (err) => {
    console.error('❌ Redis client error:', err);
});

subscriber.on('connect', () => {
    console.log('✅ Redis subscriber connected');
});

subscriber.on('error', (err) => {
    console.error('❌ Redis subscriber error:', err);
});

publisher.on('connect', () => {
    console.log('✅ Redis publisher connected');
});

publisher.on('error', (err) => {
    console.error('❌ Redis publisher error:', err);
});

export { redis, subscriber, publisher }; 