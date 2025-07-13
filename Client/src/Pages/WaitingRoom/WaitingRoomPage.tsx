import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WaitingRoomViewModel } from './WaitingRoomViewModel';

export const WaitingRoomPage: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!roomId) {
            console.error('No room ID provided in URL');
            setError('No room ID provided');
            // Redirect to lobby after a short delay
            setTimeout(() => {
                navigate('/lobby');
            }, 2000);
        }
    }, [roomId, navigate]);

    if (error) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                flexDirection: 'column' 
            }}>
                <h2>Error</h2>
                <p>{error}</p>
                <p>Redirecting to lobby...</p>
            </div>
        );
    }

    if (!roomId) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <div>Loading...</div>
            </div>
        );
    }

    return <WaitingRoomViewModel roomId={roomId} />;
};

export default WaitingRoomPage; 