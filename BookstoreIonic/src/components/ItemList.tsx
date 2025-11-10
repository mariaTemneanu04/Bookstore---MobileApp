import React, {useContext, useEffect, useState} from 'react';
import {
    IonContent,
    IonHeader,
    IonLoading,
    IonPage,
    IonSearchbar,
    IonList, IonButton, IonIcon, IonButtons, IonToolbar,
    IonItem
} from '@ionic/react';
import {logOutOutline, searchCircle} from 'ionicons/icons';
import {RouteComponentProps} from "react-router";
import {ItemContext} from "../providers/ItemProvider";
import Item from './Item';
import './css/ItemList.css';
import {AuthContext} from "../providers/AuthProvider";
import {useNetwork} from "../hooks/useNetwork";
import NetworkStatusIndicator from "./custom/NetworkStatusIndicator";

const ItemList: React.FC<RouteComponentProps> = ({ history }) => {
    const { items = [], fetching, fetchingError } = useContext(ItemContext);
    const { logout } = useContext(AuthContext);
    const { networkStatus } = useNetwork();

    // const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(false);
    // const [loaded, setLoaded] = useState<any[]>([]);
    const [search, setSearch] = useState<string>('');
    const [filteredItems, setFilteredItems] = useState<any[]>([]);

    // filtrarea la fiecare modificare a searchText
    useEffect(() => {
        let filtered;
        if (search.trim() === '')
            filtered = items;
        else
            filtered = items.filter(b =>
                b.title?.toLowerCase().includes(search.toLowerCase()) ||
                b.author?.toLowerCase().includes(search.toLowerCase())
            );

        setFilteredItems(filtered);
    }, [items, search]);

    // useEffect(() => {
    //     const firstPage = filteredItems.slice(0, 4);
    //     setLoaded(firstPage);
    //     setDisableInfiniteScroll(firstPage.length >= filteredItems.length);
    // }, [filteredItems]);

    // incarcare urmatoarele carti la scroll
    // async function fetchData() {
    //     const nextSet = filteredItems.slice(loaded.length, loaded.length + 5);
    //     setLoaded([...loaded, ...nextSet]);
    //     setDisableInfiniteScroll(loaded.length + nextSet.length >= filteredItems.length);
    // }
    //
    // async function searchNext($event: CustomEvent<void>) {
    //     await fetchData();
    //     await new Promise(resolve => setTimeout(resolve, 3000));
    //     await ($event.target as HTMLIonInfiniteScrollElement).complete();
    // }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>

                    <div className="network-status">
                        <IonItem lines="none">
                            <NetworkStatusIndicator connected={networkStatus.connected ?? false} />
                        </IonItem>
                    </div>

                    <IonSearchbar
                        className="custom-searchbar"
                        searchIcon={searchCircle}
                        showClearButton="focus"
                        debounce={300}
                        placeholder="Search for a Book"
                        onIonInput={e => setSearch(e.detail.value || '')}
                    />
                    <IonButtons slot="end">
                        <IonButton color="medium" onClick={logout}>
                            <IonIcon icon={logOutOutline} color="danger" slot="icon-only"/>
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen className="ion-padding book-list-content">
                <IonLoading isOpen={fetching} message="Loading books..."/>

                {filteredItems.length > 0 ? (
                    <>
                        <IonList>
                            {filteredItems.map(({id, title, author, published, available, photo, latitude, longitude}) => (
                                <Item
                                    key={id}
                                    id={id}
                                    title={title}
                                    author={author}
                                    published={published}
                                    available={available}
                                    photo={photo}
                                    latitude={latitude}
                                    longitude={longitude}
                                    onEdit={(id) => history.push(`/edit/${id}`)}
                                />
                            ))}
                        </IonList>

                        {/*<IonInfiniteScroll*/}
                        {/*    threshold="100px"*/}
                        {/*    disabled={disableInfiniteScroll}*/}
                        {/*    onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}>*/}

                        {/*    <IonInfiniteScrollContent*/}
                        {/*        loadingSpinner="bubbles"*/}
                        {/*        loadingText="Loading more books..."/>*/}
                        {/*</IonInfiniteScroll>*/}
                    </>
                ) : (
                    !fetching && <p className="empty-message">No books available yet</p>
                )}

                {fetchingError && (
                    <div className="error-message">
                        {fetchingError.message || 'Error fetching books'}
                    </div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default ItemList;
