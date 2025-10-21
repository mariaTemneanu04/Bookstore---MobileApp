import React, { useContext } from 'react';
import {
    IonContent,
    IonHeader,
    IonLoading,
    IonPage,
    IonSearchbar,
    IonList
} from '@ionic/react';
import { searchCircle } from 'ionicons/icons';
import { RouteComponentProps } from "react-router";
import { ItemContext } from "../providers/ItemProvider";
import Item from './Item';
import './ItemList.css';

const ItemList: React.FC<RouteComponentProps> = () => {
    const { items, fetching, fetchingError } = useContext(ItemContext);

    return (
        <IonPage>
            <IonHeader>
                <IonSearchbar
                    className="custom-searchbar"
                    searchIcon={searchCircle}
                    showClearButton="focus"
                    animated={true}
                    placeholder="Search for a Book"
                />
            </IonHeader>

            <IonContent fullscreen className="ion-padding book-list-content">
                <IonLoading isOpen={fetching} message="Loading books..." />

                {items && items.length > 0 ? (
                    <IonList>
                        {items.map(({ id, title, author, published, available }) => (
                            <Item
                                key={id}
                                title={title}
                                author={author}
                                published={published}
                                available={available}
                            />
                        ))}
                    </IonList>
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
