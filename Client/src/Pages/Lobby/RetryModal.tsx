import React from 'react';

interface RetryModalProps {
  isOpen: boolean;
  onRetry: () => void;
  onGoToLogin: () => void;
  isRetrying?: boolean;
}

export const RetryModal: React.FC<RetryModalProps> = ({ 
  isOpen, 
  onRetry, 
  onGoToLogin, 
  isRetrying = false 
}) => {
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
        borderRadius: '8px',
        padding: '32px',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
            🔌
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 8px 0', color: '#2d3748' }}>
            Connection Lost
          </h2>
          <p style={{ color: '#718096', margin: 0, lineHeight: '1.5' }}>
            Your connection to the lobby server has been lost. Would you like to try reconnecting?
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={onGoToLogin}
            disabled={isRetrying}
            style={{
              padding: '12px 24px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              backgroundColor: 'white',
              color: '#4a5568',
              cursor: isRetrying ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              opacity: isRetrying ? 0.6 : 1
            }}
          >
            Back to Login
          </button>
          <button
            onClick={onRetry}
            disabled={isRetrying}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#3182ce',
              color: 'white',
              cursor: isRetrying ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              opacity: isRetrying ? 0.8 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {isRetrying && (
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            )}
            {isRetrying ? 'Retrying...' : 'Try Again'}
          </button>
        </div>

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}; 