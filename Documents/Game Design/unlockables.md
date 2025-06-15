# KingsMaker Unlockables & Customization System Architecture

## Overview

KingsMaker offers a variety of unlockable and customizable items for users, including:
- **Portraits**: User avatars/character images
- **Card Backs**: Aesthetic backs for cards (used for character/item/skill representation)
- **Soldier Tokens**: Visual tokens for each troop type (see troops.md)
- **Winning Banners**: Special banners shown on victory
- **Emotion Images**: Emotes for use in chat

Users can unlock these items through achievements, purchases, or events, and can select which customizations are active in their profile or during gameplay.

---

## Data Model & Table Structure

### 1. Unlockable Items Table
A single table to store all unlockable items, with type and metadata.

| Field         | Type      | Description                        |
|---------------|-----------|------------------------------------|
| id            | string    | Unique unlockable item ID          |
| type          | enum      | 'portrait', 'card_back', 'soldier_token', 'banner', 'emote' |
| name          | string    | Display name                       |
| imageUrl      | string    | Path or URL to image asset         |
| troopType     | string?   | (For soldier_token) Infantry, Cavalry, etc. |
| ...           | ...       | Additional metadata as needed      |

### 2. UserUnlockables Table
Tracks which unlockables each user owns.

| Field         | Type      | Description                        |
|---------------|-----------|------------------------------------|
| id            | string    | Unique row ID                      |
| userId        | string    | Linked user                        |
| unlockableId  | string    | Linked unlockable item             |
| unlockedAt    | datetime  | When the item was unlocked         |

### 3. UserCustomizations Table
Tracks which unlockables the user has currently activated for each customizable part.

| Field         | Type      | Description                        |
|---------------|-----------|------------------------------------|
| id            | string    | Unique row ID                      |
| userId        | string    | Linked user                        |
| part          | enum      | 'card_back', 'soldier_token', 'banner', 'emote' |
| value         | string    | unlockableId (or troopType for soldier_token)  |
| setAt         | datetime  | When the customization was set      |

---

## Troop Types (from troops.md)

Supported soldier tokens (one unlockable per type):
- Infantry
- Cavalry
- Archer
- Mage
- Cleric
- Siege

---

## Usage & Extensibility

- **Portraits**: User can select before game start; not stored in UserCustomizations table, but as a field in user profile or game session.
- **Card Backs, Banners, Emotes**: Stored in UserCustomizations for persistent selection.
- **Soldier Tokens**: User can unlock and select a token for each troop type; store as separate rows for each troop type in UserCustomizations.
- **Extensible**: New unlockable types can be added by extending the Unlockable Items table and updating enums.

---

## Example Flow

1. **User unlocks a new card back**
   - Row added to UserUnlockables
2. **User sets a new card back as active**
   - Row added/updated in UserCustomizations (part: 'card_back', value: unlockableId)
3. **User unlocks a new soldier token for 'Mage'**
   - Row added to UserUnlockables (type: 'soldier_token', troopType: 'Mage')
   - User can set this as active for 'Mage' in UserCustomizations

---

## Notes

- Unlockables and customizations are stored in separate tables for flexibility and normalization.
- Portrait selection is handled at game start or in user profile, not as a persistent customization.
- All unlockable types can be extended with new fields or types as the game grows. 