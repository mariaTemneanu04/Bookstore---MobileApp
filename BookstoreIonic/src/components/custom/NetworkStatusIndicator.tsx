import React, { useEffect, useState } from 'react';
import { IonText, IonSpinner } from '@ionic/react';

interface NetworkStatusProps {
    connected: boolean | null;
}

const NetworkStatusIndicator: React.FC<NetworkStatusProps> = ({ connected }) => {
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [displayStatus, setDisplayStatus] = useState(connected);

    useEffect(() => {
        if (connected === null) return;

        setIsTransitioning(true);

        const timer = setTimeout(() => {
            setDisplayStatus(connected);
            setIsTransitioning(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, [connected]);

    return (
        <IonText color={displayStatus ? 'success' : 'danger'}>
            {isTransitioning ? (
                <>
                    <IonSpinner name="dots" style={{ marginRight: 8 }} />
                    {connected ? 'Connecting...' : 'Reconnecting...'}
                </>
            ) : (
                <>
                    {displayStatus ? '🟢 Online' : '🔴 Offline'}
                </>
            )}
        </IonText>
    );
};

export default NetworkStatusIndicator;
