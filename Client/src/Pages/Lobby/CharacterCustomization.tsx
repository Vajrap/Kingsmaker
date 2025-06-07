import React, { useState, useEffect } from 'react';
import type { PlayerCharacterSetup } from '@shared/types';

interface CharacterCustomizationProps {
  currentCharacter?: PlayerCharacterSetup;
  onUpdate: (character: PlayerCharacterSetup) => void;
}

// Mock portraits - TODO: Replace with actual unlockables from backend
const AVAILABLE_PORTRAITS = [
  { id: 'knight', name: 'Knight', url: 'https://bit.ly/dan-abramov' },
  { id: 'wizard', name: 'Wizard', url: 'https://bit.ly/kent-c-dodds' },
  { id: 'archer', name: 'Archer', url: 'https://bit.ly/ryan-florence' },
  { id: 'warrior', name: 'Warrior', url: 'https://bit.ly/prosper-baba' },
  { id: 'mage', name: 'Mage', url: 'https://bit.ly/code-beast' },
  { id: 'rogue', name: 'Rogue', url: 'https://bit.ly/sage-adebayo' },
];

export const CharacterCustomization: React.FC<CharacterCustomizationProps> = ({
  currentCharacter,
  onUpdate
}) => {
  const [selectedPortrait, setSelectedPortrait] = useState(
    currentCharacter?.portraitId || AVAILABLE_PORTRAITS[0].id
  );
  const [characterName, setCharacterName] = useState(
    currentCharacter?.name || ''
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (currentCharacter) {
      setSelectedPortrait(currentCharacter.portraitId || AVAILABLE_PORTRAITS[0].id);
      setCharacterName(currentCharacter.name || '');
    }
  }, [currentCharacter]);

  const handleSave = () => {
    const newErrors: { [key: string]: string } = {};

    // Validate character name
    if (characterName.trim().length === 0) {
      newErrors.characterName = 'Character name is required';
    } else if (characterName.trim().length < 2) {
      newErrors.characterName = 'Character name must be at least 2 characters';
    } else if (characterName.trim().length > 20) {
      newErrors.characterName = 'Character name must be less than 20 characters';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const updatedCharacter: PlayerCharacterSetup = {
      portraitId: selectedPortrait,
      name: characterName.trim(),
      stats: {
        might: 0,
        intelligence: 0,
        dexterity: 0
      }
    };

    onUpdate(updatedCharacter);
  };

  const getPortraitById = (id: string) => {
    return AVAILABLE_PORTRAITS.find(p => p.id === id) || AVAILABLE_PORTRAITS[0];
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{
        backgroundColor: '#bee3f8',
        color: '#2a69ac',
        padding: '12px',
        borderRadius: '4px'
      }}>
        <div style={{ fontSize: '14px' }}>
          Customize your character appearance and name. Stats will be set to 0 at game start.
        </div>
      </div>

      {/* Portrait Selection */}
      <div>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold' }}>Portrait</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '12px' 
        }}>
          {AVAILABLE_PORTRAITS.map((portrait) => (
            <div key={portrait.id}>
              <div
                style={{
                  border: selectedPortrait === portrait.id ? '2px solid #3182ce' : '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px',
                  cursor: 'pointer',
                  backgroundColor: selectedPortrait === portrait.id ? '#f7fafc' : 'white',
                  textAlign: 'center'
                }}
                onClick={() => setSelectedPortrait(portrait.id)}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#e2e8f0',
                    backgroundImage: `url(${portrait.url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }} />
                  <div style={{ fontSize: '14px', fontWeight: '500' }}>
                    {portrait.name}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
            
      {/* Character Name */}
      <div>
        <label style={{ display: 'block', marginBottom: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Character Name</h3>
        </label>
        <input
          type="text"
          placeholder="Enter character name"
          value={characterName}
          onChange={(e) => setCharacterName(e.target.value)}
          maxLength={20}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
        {errors.characterName && (
          <div style={{ color: '#e53e3e', fontSize: '14px', marginTop: '4px' }}>{errors.characterName}</div>
        )}
      </div>

      {/* Preview */}
      <div style={{
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '16px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontWeight: 'bold' }}>Preview</div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#e2e8f0',
              backgroundImage: `url(${getPortraitById(selectedPortrait).url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontWeight: 'bold' }}>
                {characterName || 'Unnamed Character'}
              </div>
              <div style={{ fontSize: '14px', color: '#718096' }}>
                Portrait: {getPortraitById(selectedPortrait).name}
              </div>
              <div style={{ fontSize: '14px', color: '#718096' }}>
                Starting Stats: Might 0, Intelligence 0, Dexterity 0
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <button 
        onClick={handleSave}
        style={{
          padding: '12px 24px',
          border: 'none',
          borderRadius: '4px',
          backgroundColor: '#3182ce',
          color: 'white',
          fontSize: '16px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Save Character
      </button>
    </div>
  );
}; 