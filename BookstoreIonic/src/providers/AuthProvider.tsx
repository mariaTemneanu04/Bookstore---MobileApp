import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../utils';
import { login as loginApi } from '../rest/authApi';
import { Preferences } from "@capacitor/preferences";

const log = getLogger('AuthProvider');

type LoginFn = (username?: string, password?: string) => void;
type LogoutFn = () => void;

export interface AuthState {
    authenticationError: Error | null;
    isAuthenticated: boolean;
    isAuthenticating: boolean;
    login?: LoginFn;
    pendingAuthentication?: boolean;
    username?: string;
    password?: string;
    token: string;
    logout?: LogoutFn;
}

const initialState: AuthState = {
    isAuthenticated: false,
    isAuthenticating: false,
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
    const { isAuthenticated, isAuthenticating, authenticationError, pendingAuthentication, token } = state;
    const login = useCallback<LoginFn>(loginCallback, []);
    const logout = useCallback<LogoutFn>(logoutCallback, []);

    useEffect(() => {
        loadUserFromPreferences();
        authenticationEffect();
    }, [pendingAuthentication]);

    const value = { isAuthenticated, login, isAuthenticating, authenticationError, token, logout};

    log('render');
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );

    function loginCallback(username?: string, password?: string): void {
        log('login');
        setState({
            ...state,
            pendingAuthentication: true,
            username,
            password
        });
    }

    function logoutCallback() {
        log('logout');
        Preferences.clear();
        setState({
            ...initialState
        });
    }

    async function loadUserFromPreferences() {
        try {
            const userString = await Preferences.get({ key: 'user' });
            if (userString && userString.value) {
                const user = JSON.parse(userString.value);
                log('Loaded user from Preferences');

                setState({
                    ...state,
                    isAuthenticated: true,
                    token: user.token,
                });
            }

        } catch (error) {
            log('Error loading user from Preferences:', error);
            setState(prev => ({ ...prev, isLoading: false }));
        }
    }

    function authenticationEffect() {
        let canceled = false;
        authenticate();

        return () => {
            canceled = true;
        }

        async function authenticate() {
            if (!pendingAuthentication) {
                log('now we are waiting for user to press login');
                return;
            }

            try {
                log('authenticate...');
                setState({
                    ...state,
                    isAuthenticating: true,
                });

                const { username, password } = state;
                const result = await loginApi(username, password);


                const { token } = result;
                if (canceled) {
                    return;
                }

                log('authenticate succeeded');
                setState({
                    ...state,
                    token,
                    pendingAuthentication: false,
                    isAuthenticated: true,
                    isAuthenticating: false,
                });

                Preferences.set({
                    key: 'user',
                    value: JSON.stringify({ token })
                })
            } catch (error) {
                if (canceled) {
                    return;
                }

                log('authenticate failed');
                setState({
                    ...state,
                    authenticationError: error as Error,
                    pendingAuthentication: false,
                    isAuthenticating: false,
                })
            }
        }
    }
};
