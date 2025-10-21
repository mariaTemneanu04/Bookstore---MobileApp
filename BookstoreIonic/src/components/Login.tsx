import React, { useCallback, useContext, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { IonButton, IonContent, IonHeader, IonInput, IonLoading, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { AuthContext } from '../providers/AuthProvider';
import { getLogger } from '../utils';

const log = getLogger('Login');

interface LoginState {
    username?: string;
    password?: string;
}

export const Login: React.FC<RouteComponentProps> = ({ history }) => {
    const { isAuthenticated, isAuthenticating, login, authenticationError } = useContext(AuthContext);
    const [state, setState] = useState<LoginState>({
        username: '',
        password: '',
    });

    const { username, password } = state;
    const isLoginDisabled = !username || !password;

    const handlePasswwordChange = useCallback((e: any) => setState({
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
    }, [isAuthenticated, history]);

    useEffect(() => {
        if (authenticationError) {
            alert("Authentication Error");
        }
    }, [authenticationError, history]);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle
                        className="custom-title"
                    >Login</IonTitle>
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
                    onIonChange={handlePasswwordChange} />
                <IonLoading isOpen={isAuthenticating} />
                <IonButton
                    className="custom-button"
                    disabled={isLoginDisabled}
                    onClick={handleLogin}>
                    Login
                </IonButton>
            </IonContent>
        </IonPage>
    );
};