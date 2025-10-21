import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../utils';
import { login as loginApi } from '../rest/authApi';
import { Preferences } from "@capacitor/preferences";

const log = getLogger('AuthProvider');

type LoginFn = (username?: string, password?: string) => void;

export interface AuthState {
    authenticationError: Error | null;
    isAuthenticated: boolean;
    isAuthenticating: boolean;
    isLoading: boolean; // ✅ nou
    login?: LoginFn;
    pendingAuthentication?: boolean;
    username?: string;
    password?: string;
    token: string;
}

const initialState: AuthState = {
    isAuthenticated: false,
    isAuthenticating: false,
    isLoading: true, // ✅ pornim în starea de „loading”
    authenticationError: null,
    pendingAuthentication: false,
    token: '',
};

export const AuthContext = React.createContext<AuthState>(initialState);

interface AuthProviderProps {
    children: PropTypes.ReactNodeLike;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [state, setState] = useState<AuthState>(initialState);
    const { isAuthenticated, isAuthenticating, authenticationError, pendingAuthentication, token, isLoading } = state;
    const login = useCallback<LoginFn>(loginCallback, []);

    useEffect(() => {
        loadUserFromPreferences();
    }, []);

    useEffect(() => {
        authenticationEffect();
    }, [pendingAuthentication]);

    const value = { isAuthenticated, login, isAuthenticating, authenticationError, token, isLoading };

    log('render');
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );

    function loginCallback(username?: string, password?: string): void {
        log('login');
        setState(prev => ({
            ...prev,
            pendingAuthentication: true,
            username,
            password
        }));
    }

    async function loadUserFromPreferences() {
        try {
            const userString = await Preferences.get({ key: 'user' });
            if (userString && userString.value) {
                const user = JSON.parse(userString.value);
                log('Loaded user from Preferences');
                setState(prev => ({
                    ...prev,
                    isAuthenticated: true,
                    token: user.token,
                    isLoading: false, // ✅ am terminat
                }));
            } else {
                setState(prev => ({ ...prev, isLoading: false })); // ✅ nimic găsit → terminăm loading-ul
            }
        } catch (error) {
            log('Error loading user from Preferences:', error);
            setState(prev => ({ ...prev, isLoading: false }));
        }
    }

    function authenticationEffect() {
        let canceled = false;

        if (!pendingAuthentication) {
            return;
        }

        (async () => {
            try {
                log('authenticate...');
                setState(prev => ({
                    ...prev,
                    isAuthenticating: true,
                }));

                const { username, password } = state;
                const { token } = await loginApi(username, password);

                if (canceled) return;

                log('authenticate succeeded');

                await Preferences.set({
                    key: 'user',
                    value: JSON.stringify({ token }),
                });

                setState(prev => ({
                    ...prev,
                    token,
                    pendingAuthentication: false,
                    isAuthenticated: true,
                    isAuthenticating: false,
                }));
            } catch (error) {
                if (canceled) return;
                log('authenticate failed');
                setState(prev => ({
                    ...prev,
                    authenticationError: error as Error,
                    pendingAuthentication: false,
                    isAuthenticating: false,
                }));
            }
        })();

        return () => {
            canceled = true;
        };
    }
};
