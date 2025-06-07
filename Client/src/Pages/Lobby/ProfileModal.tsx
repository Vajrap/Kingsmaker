import React from 'react';
import { sessionManager } from '@/singleton/sessionManager';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const session = sessionManager.getSession();
  
  if (!session) {
    return null;
  }

  const formatLoginTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAccountTypeBadge = () => {
    if (session.userType === 'registered') {
      return {
        text: 'Registered Account',
        color: '#38a169',
        bgColor: '#f0fff4'
      };
    } else {
      return {
        text: 'Guest Account',
        color: '#ed8936',
        bgColor: '#fffaf0'
      };
    }
  };

  const badge = getAccountTypeBadge();

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
        maxWidth: '500px',
        width: '90%',
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
            Player Profile
          </h2>
          <button 
            onClick={onClose}
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

        {/* Profile Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* User Avatar & Basic Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#4a5568'
            }}>
              {session.username[0]?.toUpperCase() || '?'}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                {session.username}
              </h3>
              <div style={{
                backgroundColor: badge.bgColor,
                color: badge.color,
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '14px',
                fontWeight: '500',
                display: 'inline-block'
              }}>
                {badge.text}
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div style={{
            backgroundColor: '#f7fafc',
            borderRadius: '8px',
            padding: '20px'
          }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 'bold', margin: '0 0 16px 0', color: '#2d3748' }}>
              Account Information
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#718096' }}>User ID:</span>
                <span style={{ fontFamily: 'monospace', color: '#4a5568' }}>{session.userID}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#718096' }}>Last Login:</span>
                <span style={{ color: '#4a5568' }}>{formatLoginTime(session.loginTime)}</span>
              </div>
            </div>
          </div>

          {/* Game Stats (Placeholder) */}
          <div style={{
            backgroundColor: '#f7fafc',
            borderRadius: '8px',
            padding: '20px'
          }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 'bold', margin: '0 0 16px 0', color: '#2d3748' }}>
              Game Statistics
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3182ce' }}>0</div>
                <div style={{ fontSize: '14px', color: '#718096' }}>Games Played</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#38a169' }}>0</div>
                <div style={{ fontSize: '14px', color: '#718096' }}>Games Won</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ed8936' }}>0%</div>
                <div style={{ fontSize: '14px', color: '#718096' }}>Win Rate</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#805ad5' }}>0</div>
                <div style={{ fontSize: '14px', color: '#718096' }}>Hours Played</div>
              </div>
            </div>
            <div style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#e6fffa',
              color: '#234e52',
              borderRadius: '6px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              💡 Game statistics will be tracked once you start playing!
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            {session.userType === 'guest' && (
              <button
                style={{
                  padding: '10px 20px',
                  border: '1px solid #3182ce',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  color: '#3182ce',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                onClick={() => {
                  // TODO: Navigate to registration
                  alert('Registration feature coming soon!');
                }}
              >
                Create Account
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: '#3182ce',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 