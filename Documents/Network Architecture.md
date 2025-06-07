KingsMaker – Network Architecture Dev Log (v0.1)

Last updated: 28 May 2025

⸻

0. Purpose

Design a secure, scalable multiplayer backbone that supports:
• Authenticated players (persistent profile & stats)
• Guests (ephemeral identity)
• Server-authoritative game logic
• Player-hosted rooms with unique state isolation
• Clear separation between login sessions, rooms, and game instances

⸻

1. Glossary / IDs

Term Format Scope Lifetime Notes
authToken JWT (HS256) Player Until logout / expiry Encodes userId, issued by Auth API
guestId guest*<uuid4> Player Browser session Stored in localStorage
roomId room*<uuid4> Lobby Until last player leaves Used for pre-game lobby & chat
gameId game\_<uuid4> Running match Until match archived Linked 1-to-1 with roomId
connectionId WS UUID Player-Server socket Recreated on reconnect Heart-beat monitored

⸻

2. High-Level Component Map

┌─────────────┐ REST / WS ┌─────────────┐
│ Client │ ─────────────────────▶ │ Server │
│ (React +WS) │ ◀────────────────────── │ (Node/Rust)│
└─────────────┘ └─────────────┘
▲ ▲ ▲
│ │ │
Local UI │ roomId gameId │Persistence
│ ───────────────▶ Room‑Mgr ───────▶ DB
│ │
▼ ▼
Anim/FX      Game‑Logic Core (pure functions)

    •	Room Manager: creates, joins, dissolves rooms; spawns a GameInstance when lobby hits Ready.
    •	Game-Logic Core: stateless deterministic functions already implemented in codebase (battle, phases, etc.).

⸻

3. Login & Guest Flow 1. POST /auth/login → returns authToken & minimal PlayerProfile. 2. On first visit without token, client issues POST /auth/guest → receives guestId & starter profile (nameAlias = "Guest-XYZ"). 3. Client stores credentials locally (IndexedDB / localStorage) and includes exactly one of
   • Authorization: Bearer <authToken> or
   • X-Guest-Id: <guestId>
   in every API / WS request.

Guest can later upgrade via /auth/convert (bind guestId → userId).

⸻

4. Room Lifecycle

CREATE → JOIN / LEAVE _…_ → READY → LOCK → START(GameInstance) → FINISH → ARCHIVE

    1.	Create: any authenticated user or guest hits POST /rooms.
    2.	Join: POST /rooms/:roomId/join (capacity 2-4).
    3.	Ready: each player toggles ready flag; host can kick.
    4.	Lock: when every player ready, server locks lobby.
    5.	Start: server clones initial GameState → assigns gameId.
    6.	Finish: on victory / disconnect / timeout.
    7.	Archive: persisted for stats → eventually pruned.

⸻

5. Server-Authoritative Turn Cycle
   1. Server broadcasts PhaseStart(Event) packet with serverTime.
   2. Active player submits ActionSet via WS action message.
   3. Server validates using pure logic functions.
   4. On success, server emits PhaseResult diff to all.
   5. Repeat until EndPhase, then rotate player order.

Dice rolls use serverRand(seed, requestId) to prevent client spoofing.

⸻

6. Message Schema (WS)

interface Envelope<T extends string, P> {
kind: T;
ts: number; // server epoch ms
gameId?: string; // present after start
roomId?: string; // lobby phase
payload: P;
}

// Examples
// Lobby chat
Envelope<'chat', {from: string; text: string}>;

// Player readiness toggle
Envelope<'ready', {ready: boolean}>;

// Submit actions during Action Phase
Envelope<'action', ActionSet>;

// Server broadcast result diff
Envelope<'result', GameDiff>;

⸻

7. Data Models (DB)

model User {
id Int @id @default(autoincrement())
username String @unique
password String
nameAlias String
stats Json
sessions Session[]
}

model Session {
id String @id
userId Int
createdAt DateTime @default(now())
lastSeen DateTime @updatedAt
user User @relation(fields: [userId], references: [id])
}

model Room {
id String @id
hostId Int? // nullable for guest host
state Json // ready list etc.
}

model Game {
id String @id
roomId String @unique
state Json // serialised GameState
finishedAt DateTime?
}

⸻

8. Security & Anti-Cheat
   • All mutating actions executed only on server.
   • Clients send intent, never final result.
   • Randomness via seeded-PRNG with audit log.
   • Host has zero special authority once gameId starts.
   • Rate limiting & JWT expiry (15 min idle / 24 h max).

⸻

9. Scalability Notes
   • Single game instance ≈ small JSON state (<50 KB) → fits in memory.
   • Horizontal scale by routing roomId hash → worker process.
   • Persistent DB write on phase commit → enables crash recovery.

⸻

10. Open Todos
    • Implement guestId endpoint ✔️
    • Deploy redis pub/sub for cross-node room events
    • Add replay export (zip of Envelope log)
    • Stress-test 100 concurrent games

⸻
