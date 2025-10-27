import {useEffect, useState} from 'react';
import {Network, ConnectionStatus} from '@capacitor/network';
import {PluginListenerHandle} from '@capacitor/core';
import {getLogger} from '../utils';

const initialState = {
    connected: null as boolean | null,
    connectionType: 'unknown',
    shouldSync: 'unknown' as string,
};

const log = getLogger('useNetwork');

export const useNetwork = () => {
    const [networkStatus, setNetworkStatus] = useState(initialState);

    useEffect(() => {
        let handler: PluginListenerHandle | undefined;

        const registerNetworkStatusChange = async () => {
            handler = await Network.addListener('networkStatusChange', handleNetworkStatusChange);
        };

        const initializeNetworkStatus = async () => {
            const initialStatus = await Network.getStatus();
            handleNetworkStatusChange(initialStatus);
        };

        registerNetworkStatusChange();
        initializeNetworkStatus();

        let canceled = false;
        return () => {
            canceled = true;
            handler?.remove();
        };

        async function handleNetworkStatusChange(status: ConnectionStatus) {
            log('useNetwork - status change', status);

            if (!canceled) {
                setNetworkStatus((prev) => ({
                    connected: status.connected,
                    connectionType: status.connectionType,
                    shouldSync: prev.connected === null ? 'do-not-sync' : prev.connected === true ? 'connected' : 'disconnected',
                }));
            }
        }
    }, []);

    return {networkStatus};
};
