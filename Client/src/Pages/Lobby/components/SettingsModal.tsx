import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
} from '@chakra-ui/react';
import {
  dialogBoxStyle,
  headingStyle,
  subHeadingStyle,
  buttonStyle,
} from '@/theme/styles';
import { currentTheme } from '@/singleton/currentTheme';

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
    <Flex
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="rgba(0, 0, 0, 0.5)"
      align="center"
      justify="center"
      zIndex={1000}
    >
      <Box {...dialogBoxStyle} maxWidth="600px" width="90%" maxHeight="90vh" overflow="auto">
        {/* Header */}
        <Flex
          justify="space-between"
          align="center"
          mb={6}
          borderBottom="1px solid"
          borderColor={currentTheme.borderColor}
          pb={4}
        >
          <Heading {...headingStyle}>⚙️ Settings</Heading>
          <Button
            onClick={handleCancel}
            bg="transparent"
            border="none"
            fontSize="24px"
            cursor="pointer"
            p={0}
            minW="auto"
            h="auto"
            color={currentTheme.mutedTextColor}
            _hover={{ bg: "transparent", opacity: 0.7 }}
          >
            ×
          </Button>
        </Flex>

        {/* Settings Content */}
        <Box display="flex" flexDirection="column" gap={8}>
          
          {/* Audio Settings */}
          <Box>
            <Text {...subHeadingStyle} mb={4}>🔊 Audio</Text>
            <Box display="flex" flexDirection="column" gap={4} bg={currentTheme.hudBackgroundColor} p={5} borderRadius="md">
              
              <Flex align="center" justify="space-between">
                <Text fontSize="sm" color={currentTheme.textColor}>Sound Effects</Text>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
              </Flex>

              <Flex align="center" justify="space-between">
                <Text fontSize="sm" color={currentTheme.textColor}>Background Music</Text>
                <input
                  type="checkbox"
                  checked={settings.musicEnabled}
                  onChange={(e) => handleSettingChange('musicEnabled', e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
              </Flex>

              <Flex align="center" justify="space-between">
                <Text fontSize="sm" color={currentTheme.textColor}>Sound Volume</Text>
                <Flex align="center" gap={3}>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.soundVolume}
                    onChange={(e) => handleSettingChange('soundVolume', parseInt(e.target.value))}
                    disabled={!settings.soundEnabled}
                    style={{ width: '100px' }}
                  />
                  <Text fontSize="sm" color={currentTheme.mutedTextColor} minW="35px">
                    {settings.soundVolume}%
                  </Text>
                </Flex>
              </Flex>

              <Flex align="center" justify="space-between">
                <Text fontSize="sm" color={currentTheme.textColor}>Music Volume</Text>
                <Flex align="center" gap={3}>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.musicVolume}
                    onChange={(e) => handleSettingChange('musicVolume', parseInt(e.target.value))}
                    disabled={!settings.musicEnabled}
                    style={{ width: '100px' }}
                  />
                  <Text fontSize="sm" color={currentTheme.mutedTextColor} minW="35px">
                    {settings.musicVolume}%
                  </Text>
                </Flex>
              </Flex>
            </Box>
          </Box>

          {/* Gameplay Settings */}
          <Box>
            <Text {...subHeadingStyle} mb={4}>🎮 Gameplay</Text>
            <Box display="flex" flexDirection="column" gap={4} bg={currentTheme.hudBackgroundColor} p={5} borderRadius="md">
              
              <Flex align="center" justify="space-between">
                <Text fontSize="sm" color={currentTheme.textColor}>Animation Speed</Text>
                <select
                  value={settings.animationSpeed}
                  onChange={(e) => handleSettingChange('animationSpeed', e.target.value)}
                  style={{
                    padding: '6px 12px',
                    border: `1px solid ${currentTheme.borderColor}`,
                    borderRadius: '4px',
                    backgroundColor: currentTheme.panelBackgroundColor,
                    color: currentTheme.textColor,
                    cursor: 'pointer'
                  }}
                >
                  <option value="slow">Slow</option>
                  <option value="normal">Normal</option>
                  <option value="fast">Fast</option>
                </select>
              </Flex>

              <Flex align="center" justify="space-between">
                <Text fontSize="sm" color={currentTheme.textColor}>Confirm Actions</Text>
                <input
                  type="checkbox"
                  checked={settings.confirmActions}
                  onChange={(e) => handleSettingChange('confirmActions', e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
              </Flex>

              <Flex align="center" justify="space-between">
                <Text fontSize="sm" color={currentTheme.textColor}>Auto-End Turn</Text>
                <input
                  type="checkbox"
                  checked={settings.autoEndTurn}
                  onChange={(e) => handleSettingChange('autoEndTurn', e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
              </Flex>

              <Flex align="center" justify="space-between">
                <Text fontSize="sm" color={currentTheme.textColor}>Show Turn Timer</Text>
                <input
                  type="checkbox"
                  checked={settings.showTurnTimer}
                  onChange={(e) => handleSettingChange('showTurnTimer', e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
              </Flex>
            </Box>
          </Box>

          {/* Interface Settings */}
          <Box>
            <Text {...subHeadingStyle} mb={4}>🎨 Interface</Text>
            <Box display="flex" flexDirection="column" gap={4} bg={currentTheme.hudBackgroundColor} p={5} borderRadius="md">
              
              <Flex align="center" justify="space-between">
                <Text fontSize="sm" color={currentTheme.textColor}>Theme</Text>
                <select
                  value={settings.theme}
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                  style={{
                    padding: '6px 12px',
                    border: `1px solid ${currentTheme.borderColor}`,
                    borderRadius: '4px',
                    backgroundColor: currentTheme.panelBackgroundColor,
                    color: currentTheme.textColor,
                    cursor: 'pointer'
                  }}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (System)</option>
                </select>
              </Flex>

              <Box
                mt={4}
                p={3}
                bg={currentTheme.panelBackgroundColor}
                borderRadius="md"
                fontSize="sm"
                textAlign="center"
                color={currentTheme.mutedTextColor}
              >
                💡 More interface customization options coming soon!
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Flex
          gap={3}
          justify="flex-end"
          mt={8}
          pt={6}
          borderTop="1px solid"
          borderColor={currentTheme.borderColor}
        >
          <Button
            onClick={handleReset}
            variant="outline"
            borderColor={currentTheme.dangerColor}
            color={currentTheme.dangerColor}
            bg="transparent"
            w="auto"
            _hover={{ bg: currentTheme.dangerColor, color: "white" }}
          >
            Reset to Defaults
          </Button>
          <Button
            onClick={handleCancel}
            variant="outline"
            {...buttonStyle}
            bg="transparent"
            color={currentTheme.textColor}
            w="auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            {...buttonStyle}
            w="auto"
            bg={hasChanges ? currentTheme.buttonActive : currentTheme.buttonDeactive}
            color={hasChanges ? currentTheme.buttonTextActive : currentTheme.buttonTextDeactive}
            cursor={hasChanges ? 'pointer' : 'not-allowed'}
          >
            Save Settings
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
}; 