# 🎯 Developer Guide – Multiplayer Lobby Game (Micro‑services)

> **Scope**  This document tells engineers *what* services exist, *how* they talk (HTTP vs WS), and the exact message contracts you must implement.
> Keep the doc open as you code; do not treat it as a white‑paper—this is the build spec.

---

## 1. Service Inventory

| Service            | Repo / Path   | Runtime               | Core Responsibilities                                       |
| ------------------ | ------------- | --------------------- | ----------------------------------------------------------- |
| **Gateway‑API**    | `gateway/api` | Node + fastify        | HTTPS REST routing → internal gRPC calls                    |
| **Gateway‑WS**     | `gateway/ws`  | Node + uWebSockets.js | Single persistent socket per client; routes by `type` field |
| **AuthService**    | `auth`        | Go                    | Register / login / JWT / password reset                     |
| **StoreService**   | `store`       | Go                    | List items, purchase, update cosmetics                      |
| **FriendService**  | `friend`      | Rust                  | Friend requests, blocks, presence broadcast                 |
| **ChatService**    | `chat`        | Rust                  | Global / room / whisper channels, history, profanity filter |
| **LobbyService**   | `lobby`       | Rust                  | List rooms, create room, return room meta                   |
| **RoomService**    | `room`        | Rust                  | 4‑slot waiting room, ready state, map randomise, start game |
| **GameService**    | `game`        | Rust                  | Match state, player actions, turn loop                      |
| **SessionService** | `session`     | Go                    | Online directory, connection ↔ user map                     |

> **Note**  Each service owns its DB; cross‑data only via API/gRPC.

---

## 2. Protocol Split

| Channel       | Use‑cases                                          | Payload Wrapper                   | Notes                                  |
| ------------- | -------------------------------------------------- | --------------------------------- | -------------------------------------- |
| **HTTP REST** | Auth, store, profile, friend list CRUD             | Standard JSON body                | Idempotent; signed with JWT            |
| **WebSocket** | Chat, lobby/room events, in‑game actions, presence | `{ "type": string, "data": any }` | All realtime flows share *one* socket. |

### 2.1 WebSocket Envelope

```jsonc
// example – player toggles ready in waiting room
{
  "type": "room.toggleReady",   // <service>.<event>
  "data": {
    "roomId": "abc123",
    "isReady": true
  }
}
```

Gateway‑WS route table (excerpt):

```ts
switch (msg.type.split(".")[0]) {
  case "chat":   chatSvc.publish(msg);     break;
  case "friend": friendSvc.handle(msg);    break;
  case "room":   roomSvc.handle(msg);      break;
  case "game":   gameSvc.handle(msg);      break;
}
```

---

## 3. HTTP Route Reference

### 3.1 AuthService

| Method | Path                  | Body               | Notes            |
| ------ | --------------------- | ------------------ | ---------------- |
| `POST` | /auth/register        | `{email,password}` | returns JWT      |
| `POST` | /auth/login           | `{email,password}` | returns JWT      |
| `POST` | /auth/guest           |  `{nickname}`      | returns temp JWT |
| `POST` | /auth/change‑password | `{old,new}`        | JWT required     |

### 3.2 StoreService (cosmetics only)

\| `GET /store/items` | returns list `StoreItem[]` |
\| `POST /store/buy`  | `{itemId}` – deducts coins, unlocks item |
\| `POST /profile/set‑cosmetic` | `{slot:'skin'|'portrait'|'cardBack', itemId}` |

### 3.3 FriendService

\| POST /friend/request | `{targetId}` |
\| POST /friend/accept  | `{requestId}` |
\| POST /friend/block   | `{targetId}` |
\| GET  /friend/list    | – returns current list + online flag |

*(Remaining service routes live in respective repos; follow the same naming style.)*

---

## 4. WebSocket Event Catalogue (v1)

### 4.1 ChatService

\| `chat.global.send` → `{text}` |
\| `chat.global.msg`  ← `{from, text, ts}` (broadcast) |
\| `chat.whisper.send` → `{to, text}` |
\| `chat.whisper.msg`  ← `{from, text, ts}` (private) |

### 4.2 FriendService

\| `friend.online`   ← `{userId}` |
\| `friend.offline`  ← `{userId}` |
\| `friend.request`  ← `{requestId, from}` |

### 4.3 Lobby / Room

\| `lobby.list`       → `{}`  (client ask) |
\| `lobby.rooms`      ← `LobbyRoom[]` |
\| `room.join`        → `{roomId}` |
\| `room.state`       ← `WaitingRoom` (pushed) |
\| `room.toggleReady` → `{roomId,isReady}` |
\| `room.start`       → `{roomId}` – host only |

### 4.4 GameService

\| `game.action`      → varies per match rules |
\| `game.state`       ← full/patch state object |

---

## 5. Presence & Heartbeats

**Heartbeat interval**: client sends `session.ping` every **2.5 s**.
Gateway responds `session.pong`. SessionService updates `lastSeen`. RoomService drops any player stale >3 s; GameService stale >7 s.

```ts
// client
setInterval(() => send({type:"session.ping",data:{}}), 2500);
```

---

## 6. Sequence Diagram – Room Creation to Game Start

```mermaid
title Room create → start
participant Client
participant GW as WS‑Gateway
participant Lobby as LobbySvc
participant Room as RoomSvc
participant Game as GameSvc

Client->GW: room.create {name,maxPlayers}
GW->Lobby: room.create
Lobby-->GW: roomCreated {roomId}
GW-->Client: roomCreated
Client->GW: room.join {roomId}
GW->Room: join
Room-->GW: roomState
GW-->Client: roomState
Client->GW: room.toggleReady
GW->Room: toggleReady
Room-->GW: roomState (broadcast)
GW-->Client: roomState
Client(host)->GW: room.start
GW->Room: start
Room->Game: createGame instance
Game-->Room: gameReady {gameId}
Room-->GW: gameReady {gameId}
GW-->Client: gameReady
```

---

## 7. Notes for Implementation

1. **Stateless Services** – Chat, Lobby, Friend remain stateless; rely on Redis or Kafka for pub/sub and persistence.
2. **DB Choices** –

   * Auth → PostgreSQL
   * Store/Friend → PostgreSQL
   * Chat → Redis Streams
   * Session → Redis (TTL keys)
   * Game → Ephemeral in‑memory + Post‑match write to PostgreSQL
3. **Package Naming** – use kebab‑case repo names; Docker images prefixed `game-<service>`.
4. **CI/CD** – each service has its own pipeline; success deploys to k8s namespace `game‑prod`.

---

End of dev‑doc.
