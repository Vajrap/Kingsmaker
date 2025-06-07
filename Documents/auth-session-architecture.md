# KingsMaker Auth & Session System Architecture

## Overview

KingsMaker supports two types of users:
- **Registered Users**: Accounts linked to an email, persistent stats, achievements, and unlockables.
- **Guest Users**: Temporary accounts with a random name, tracked stats, but no unlockables or achievements.

Both user types are tracked with sessions and tokens for authentication and state management.

---

## User Types

### 1. Registered User
- **Registration**: Via email, username, password.
- **Persistent Data**:
  - Statistics (games played, win/loss, etc.)
  - Achievements (array of string IDs)
  - Unlockables (future: array of string IDs or a more structured format)
- **Authentication**: Email + password.
- **Session**: Issued a token on login.

### 2. Guest User
- **Login**: Randomly generated guest name.
- **Persistent Data**:
  - Statistics (tracked per session or optionally per device)
  - No achievements or unlockables.
- **Authentication**: None (just a guest name).
- **Session**: Issued a token on login.

---

## Session & Token Management

### Session Token
- **What is it?**  
  A signed token (e.g., JWT or random session ID) that authenticates the user (guest or registered) for API requests.
- **What does it contain?**
  - User ID (registered or guest)
  - User type (registered/guest)
  - Expiry timestamp
  - (Optional) Permissions/roles

### Token Lifecycle
- **Issued on login** (register or guest login).
- **Expiration**:  
  - Tokens have a time limit (e.g., 24 hours).
  - Each time the user performs an action, the server can refresh the expiration (sliding window).
- **Storage**:  
  - On the client: stored in localStorage or cookies.
  - On the server: session data is stored in DB (for session IDs) or stateless (for JWTs).

### Token Refresh
- **Sliding Expiry**:  
  - Each valid request can refresh the token's expiry time.
  - If the token is expired, the user must log in again.

---

## Data Model (Simplified)

### User Table
| Field         | Type      | Description                        |
|---------------|-----------|------------------------------------|
| id            | string    | Unique user ID                     |
| email         | string    | (Registered only)                  |
| username      | string    | Display name                       |
| passwordHash  | string    | (Registered only)                  |
| type          | enum      | 'registered' or 'guest'            |
| stats         | JSON      | Game statistics                    |
| achievements  | string[]  | (Registered only)                  |
| unlockables   | string[]  | (Registered only, future)          |
| createdAt     | datetime  |                                    |
| updatedAt     | datetime  |                                    |

### Session Table (if not using JWT)
| Field         | Type      | Description                        |
|---------------|-----------|------------------------------------|
| id            | string    | Session token                      |
| userId        | string    | Linked user                        |
| expiresAt     | datetime  | Expiry timestamp                   |
| createdAt     | datetime  |                                    |

---

## API Endpoints

- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login with email/password
- `POST /api/auth/guest` — Login as guest (returns guest token)
- `POST /api/auth/logout` — Invalidate session/token
- `GET /api/user/me` — Get current user info (requires token)
- `POST /api/user/stats` — Update stats (requires token)
- `POST /api/user/achievements` — Update achievements (registered only)
- `POST /api/user/unlockables` — Update unlockables (registered only, future)

---

## Security & Best Practices

- **Passwords**: Always store as hashes (never plain text).
- **Tokens**: Use secure, random values or JWTs with proper signing.
- **Token Expiry**: Enforce expiry and refresh on activity.
- **Guest Data**: Optionally, allow guests to "upgrade" to registered accounts and keep their stats.

---

## Extensibility

- **Unlockables**: Store as array of item IDs or a more structured JSON for future features.
- **Achievements**: Array of string IDs is sufficient.
- **Guest to Registered**: Allow guests to register and migrate their stats.

---

## Example Flow

1. **User opens app**  
   → Chooses Login or Guest  
2. **Login**  
   → Receives token  
   → Token used for all API requests  
3. **Session expires**  
   → User must log in again

---

## Notes

- Guest users are almost like registered users, but with limited features.
- All users (guest or registered) are tracked with a session token.
- Stats are tracked for both, but only registered users get achievements/unlockables. 