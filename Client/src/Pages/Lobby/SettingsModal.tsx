import React, { useState, useEffect } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;
  musicVolume: number;
  animationSpeed: 'slow' | 'normal' | 'fast';
  confirmActions: boolean;
  autoEndTurn: boolean;
  showTurnTimer: boolean;
  theme: 'light' | 'dark' | 'auto';
}

const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  soundVolume: 70,
  musicVolume: 50,
  animationSpeed: 'normal',
  confirmActions: true,
  autoEndTurn: false,
  showTurnTimer: true,
  theme: 'light'
};

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('kingsmaker-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }, []);

  if (!isOpen) return null;

  const handleSettingChange = (key: keyof GameSettings, value: boolean | number | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    localStorage.setItem('kingsmaker-settings', JSON.stringify(settings));
    setHasChanges(false);
    onClose();
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setHasChanges(true);
  };

  const handleCancel = () => {
    // Reload from localStorage to discard changes
    const savedSettings = localStorage.getItem('kingsmaker-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (error) {
        console.error('Failed to load settings:', error);
        setSettings(DEFAULT_SETTINGS);
      }
    } else {
      setSettings(DEFAULT_SETTINGS);
    }
    setHasChanges(false);
    onClose();
  };

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
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '24px',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '16px'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#2d3748' }}>
            ⚙️ Settings
          </h2>
          <button 
            onClick={handleCancel}
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '24px', 
              cursor: 'pointer',
              color: '#718096',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>

        {/* Settings Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Audio Settings */}
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', margin: '0 0 16px 0', color: '#2d3748' }}>
              🔊 Audio
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#f7fafc', padding: '20px', borderRadius: '8px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ fontSize: '14px', color: '#4a5568' }}>Sound Effects</label>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ fontSize: '14px', color: '#4a5568' }}>Background Music</label>
                <input
                  type="checkbox"
                  checked={settings.musicEnabled}
                  onChange={(e) => handleSettingChange('musicEnabled', e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ fontSize: '14px', color: '#4a5568' }}>Sound Volume</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.soundVolume}
                    onChange={(e) => handleSettingChange('soundVolume', parseInt(e.target.value))}
                    disabled={!settings.soundEnabled}
                    style={{ width: '100px' }}
                  />
                  <span style={{ fontSize: '14px', color: '#718096', minWidth: '35px' }}>
                    {settings.soundVolume}%
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ fontSize: '14px', color: '#4a5568' }}>Music Volume</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.musicVolume}
                    onChange={(e) => handleSettingChange('musicVolume', parseInt(e.target.value))}
                    disabled={!settings.musicEnabled}
                    style={{ width: '100px' }}
                  />
                  <span style={{ fontSize: '14px', color: '#718096', minWidth: '35px' }}>
                    {settings.musicVolume}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Gameplay Settings */}
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', margin: '0 0 16px 0', color: '#2d3748' }}>
              🎮 Gameplay
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#f7fafc', padding: '20px', borderRadius: '8px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ fontSize: '14px', color: '#4a5568' }}>Animation Speed</label>
                <select
                  value={settings.animationSpeed}
                  onChange={(e) => handleSettingChange('animationSpeed', e.target.value)}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <option value="slow">Slow</option>
                  <option value="normal">Normal</option>
                  <option value="fast">Fast</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ fontSize: '14px', color: '#4a5568' }}>Confirm Actions</label>
                <input
                  type="checkbox"
                  checked={settings.confirmActions}
                  onChange={(e) => handleSettingChange('confirmActions', e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ fontSize: '14px', color: '#4a5568' }}>Auto-End Turn</label>
                <input
                  type="checkbox"
                  checked={settings.autoEndTurn}
                  onChange={(e) => handleSettingChange('autoEndTurn', e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ fontSize: '14px', color: '#4a5568' }}>Show Turn Timer</label>
                <input
                  type="checkbox"
                  checked={settings.showTurnTimer}
                  onChange={(e) => handleSettingChange('showTurnTimer', e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>

          {/* Interface Settings */}
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', margin: '0 0 16px 0', color: '#2d3748' }}>
              🎨 Interface
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#f7fafc', padding: '20px', borderRadius: '8px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ fontSize: '14px', color: '#4a5568' }}>Theme</label>
                <select
                  value={settings.theme}
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (System)</option>
                </select>
              </div>

              <div style={{
                padding: '12px',
                backgroundColor: '#e6fffa',
                color: '#234e52',
                borderRadius: '6px',
                fontSize: '14px'
              }}>
                💡 More interface customization options coming soon!
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'flex-end',
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '1px solid #e2e8f0'
        }}>
          <button
            onClick={handleReset}
            style={{
              padding: '10px 20px',
              border: '1px solid #e53e3e',
              borderRadius: '6px',
              backgroundColor: 'white',
              color: '#e53e3e',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Reset to Defaults
          </button>
          <button
            onClick={handleCancel}
            style={{
              padding: '10px 20px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              backgroundColor: 'white',
              color: '#4a5568',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: hasChanges ? '#3182ce' : '#a0aec0',
              color: 'white',
              cursor: hasChanges ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}; 