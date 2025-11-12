import React, { useCallback, useContext, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import {
    IonButton,
    IonContent,
    IonHeader,
    IonInput,
    IonLoading,
    IonPage,
    IonText,
    IonToolbar
} from '@ionic/react';
import { AuthContext } from '../providers/AuthProvider';
import { getLogger } from '../utils';
import {useNetwork} from "../hooks/useNetwork";
import { useIonToast} from "../hooks/useIonToast";

import '../theme/variables.css'

const log = getLogger('Login');

interface LoginState {
    username?: string;
    password?: string;
}

export const Login: React.FC<RouteComponentProps> = ({ history }) => {
    const { isAuthenticated, isAuthenticating, login, authenticationError } = useContext(AuthContext);
    const { networkStatus } = useNetwork();

    const [state, setState] = useState<LoginState>({
        username: '',
        password: '',
    });

    const { username, password } = state;
    const { showToast, ToastComponent, getErrorMessage } = useIonToast();

    const isLoginDisabled = !username || !password;

    const handlePasswordChange = useCallback((e: any) => setState({
        ...state,
        password: e.detail.value || ''
    }), [state]);
    const handleUsernameChange = useCallback((e: any) => setState({
        ...state,
        username: e.detail.value || ''
    }), [state]);

    const handleLogin = useCallback(() => {
        if (!isLoginDisabled) {
            log('handleLogin...');
            login?.(username, password);
        }

    }, [username, password, isLoginDisabled, login]);

    log('render');
    useEffect(() => {
        if (isAuthenticated) {
            log('redirecting to home');
            history.push('/');
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (authenticationError) {
            showToast({
                message: getErrorMessage(authenticationError) || 'Failed to authenticate.',
            });
        }
    }, [authenticationError, showToast]);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <div className="network-status">
                        <IonText color={networkStatus.connected ? 'success' : 'danger'}>
                            {networkStatus.connected ? '🟢 Online' : '🔴 Offline'}
                        </IonText>
                    </div>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonInput
                    style={{ marginTop: '20px' }}
                    className="custom-input"
                    placeholder="Username"
                    value={username}
                    autofocus={true}
                    onIonChange={handleUsernameChange} />
                <IonInput
                    className="custom-input"
                    placeholder="Password"
                    value={password}
                    onIonChange={handlePasswordChange} />
                <IonLoading isOpen={isAuthenticating} />
                <IonButton
                    className="custom-button"
                    disabled={isLoginDisabled}
                    onClick={handleLogin}>
                    Login
                </IonButton>
                {ToastComponent}
            </IonContent>
        </IonPage>
    );
};

export default Login;