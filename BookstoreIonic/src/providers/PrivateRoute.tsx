import React, { useContext } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { AuthContext, AuthState } from './AuthProvider';
import { IonLoading } from '@ionic/react';
import { getLogger } from '../utils';

const log = getLogger('PrivateRoute');

export interface PrivateRouteProps {
    component: any;
    path: string;
    exact?: boolean;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ component: Component, ...rest }) => {
    const { isAuthenticated, isLoading } = useContext<AuthState>(AuthContext);

    log('render, isAuthenticated', isAuthenticated, 'isLoading', isLoading);

    return (
        <Route
            {...rest}
            render={props => {
                if (isLoading) {
                    return <IonLoading isOpen={true} message="Loading..." />;
                }
                if (isAuthenticated) {
                    return <Component {...props} />;
                }
                return <Redirect to={{ pathname: '/login' }} />;
            }}
        />
    );
};
