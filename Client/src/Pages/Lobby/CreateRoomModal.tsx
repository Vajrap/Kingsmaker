import React, { useState } from 'react';
import type { RoomSettings } from '@shared/types';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (name: string, settings: RoomSettings) => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onCreateRoom
}) => {
  const [roomName, setRoomName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState<2 | 3 | 4>(4);
  const [spectatorMode, setSpectatorMode] = useState(false);
  const [turnTimeLimit, setTurnTimeLimit] = useState<number>(300);
  const [hasTimeLimit, setHasTimeLimit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = () => {
    const newErrors: { [key: string]: string } = {};

    if (!roomName.trim()) {
      newErrors.roomName = 'Room name is required';
    } else if (roomName.trim().length < 3) {
      newErrors.roomName = 'Room name must be at least 3 characters';
    } else if (roomName.trim().length > 30) {
      newErrors.roomName = 'Room name must be less than 30 characters';
    }

    if (hasTimeLimit && (turnTimeLimit < 30 || turnTimeLimit > 1800)) {
      newErrors.turnTimeLimit = 'Turn time must be between 30 seconds and 30 minutes';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const settings: RoomSettings = {
      maxPlayers,
      spectatorMode,
      turnTimeLimit: hasTimeLimit ? turnTimeLimit : undefined
    };

    setIsLoading(true);
    onCreateRoom(roomName.trim(), settings);
    
    setRoomName('');
    setMaxPlayers(4);
    setSpectatorMode(false);
    setTurnTimeLimit(300);
    setHasTimeLimit(false);
    setErrors({});
    setIsLoading(false);
  };

  const handleClose = () => {
    setRoomName('');
    setMaxPlayers(4);
    setSpectatorMode(false);
    setTurnTimeLimit(300);
    setHasTimeLimit(false);
    setErrors({});
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>Create Game Room</h2>
          <button 
            onClick={handleClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '24px', 
              cursor: 'pointer' 
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Room Name
            </label>
            <input
              type="text"
              placeholder="Enter room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              maxLength={30}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
            {errors.roomName && (
              <div style={{ color: '#e53e3e', fontSize: '14px', marginTop: '4px' }}>{errors.roomName}</div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Maximum Players
            </label>
            <select
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(parseInt(e.target.value) as 2 | 3 | 4)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            >
              <option value={2}>2 Players</option>
              <option value={3}>3 Players</option>
              <option value={4}>4 Players</option>
            </select>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <div style={{ fontWeight: 'bold' }}>Turn Time Limit</div>
                <div style={{ fontSize: '14px', color: '#718096' }}>
                  Set a time limit for each player's turn
                </div>
              </div>
              <input
                type="checkbox"
                checked={hasTimeLimit}
                onChange={(e) => setHasTimeLimit(e.target.checked)}
              />
            </div>
          </div>

          {hasTimeLimit && (
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Time Limit (seconds)
              </label>
              <input
                type="number"
                value={turnTimeLimit}
                onChange={(e) => setTurnTimeLimit(parseInt(e.target.value) || 300)}
                min={30}
                max={1800}
                step={30}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
              <div style={{ fontSize: '12px', color: '#a0aec0', marginTop: '4px' }}>
                {Math.floor(turnTimeLimit / 60)}:{(turnTimeLimit % 60).toString().padStart(2, '0')} minutes
              </div>
              {errors.turnTimeLimit && (
                <div style={{ color: '#e53e3e', fontSize: '14px', marginTop: '4px' }}>{errors.turnTimeLimit}</div>
              )}
            </div>
          )}

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <div style={{ fontWeight: 'bold' }}>Spectator Mode</div>
                <div style={{ fontSize: '14px', color: '#718096' }}>
                  Allow others to watch the game
                </div>
              </div>
              <input
                type="checkbox"
                checked={spectatorMode}
                onChange={(e) => setSpectatorMode(e.target.checked)}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <button
            onClick={handleClose}
            style={{
              padding: '8px 16px',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: isLoading ? '#a0aec0' : '#3182ce',
              color: 'white',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Creating...' : 'Create Room'}
          </button>
        </div>
      </div>
    </div>
  );
}; 