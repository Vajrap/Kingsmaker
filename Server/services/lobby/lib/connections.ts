import { ElysiaWS } from "elysia/dist/ws";
import type { SessionData } from '../shared/types/types';

export const connections = new Map<string, {
    ws: ElysiaWS,
    session: SessionData
}>();
