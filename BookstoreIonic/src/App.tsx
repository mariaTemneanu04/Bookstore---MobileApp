import {Redirect, Route} from 'react-router-dom';
import {
    IonApp, IonIcon, IonLabel,
    IonRouterOutlet, IonTabBar, IonTabButton, IonTabs,
    setupIonicReact,
} from '@ionic/react';

import {IonReactRouter} from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Dark mode and theme variables */
// import '@ionic/react/css/palettes/var';
import './theme/variables.css';

import ItemList from './components/ItemList';
import ItemSave from "./components/ItemSave";
import ItemFilter from "./components/ItemFilter";
import {add, book, filter} from "ionicons/icons";
import React from "react";
import {ItemProvider} from "./providers/ItemProvider";
import {AuthProvider} from "./providers/AuthProvider";
import {Login} from "./components/Login";
import {PrivateRoute} from "./providers/PrivateRoute";
import ItemEdit from "./components/ItemEdit";

setupIonicReact();

const App: React.FC = () => (
    <IonApp>
        <IonReactRouter>
            <IonTabs>
                <IonRouterOutlet>
                    <AuthProvider>
                        <Route path="/login" component={Login} exact={true}/>
                        <ItemProvider>
                            <PrivateRoute component={ItemList} path="/books" exact={true}/>
                            <PrivateRoute component={ItemSave} path="/add" exact={true}/>
                            <PrivateRoute component={ItemFilter} path="/filter" exact={true}/>
                            <PrivateRoute component={ItemEdit} path="/edit/:id" exact={true}/>
                        </ItemProvider>

                        <Route exact path="/" render={() => <Redirect to="/books" />} />
                    </AuthProvider>
                </IonRouterOutlet>

                <IonTabBar slot="bottom">
                    <IonTabButton tab="books" href="/books">
                        <IonIcon icon={book}/>
                        <IonLabel>Books</IonLabel>
                    </IonTabButton>

                    <IonTabButton tab="add" href="/add">
                        <IonIcon icon={add}/>
                        <IonLabel>Add Book</IonLabel>
                    </IonTabButton>

                    <IonTabButton tab="filter" href="/filter">
                        <IonLabel>Filter</IonLabel>
                        <IonIcon icon={filter}/>
                    </IonTabButton>

                </IonTabBar>
            </IonTabs>
        </IonReactRouter>
    </IonApp>
);

export default App;
