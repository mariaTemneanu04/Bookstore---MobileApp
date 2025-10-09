import React from 'react';
import {
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonList,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar,
    IonIcon
} from '@ionic/react';
import { add } from 'ionicons/icons';
import { useItems } from './useItems';
import Item from './Item';

const ItemList: React.FC = () => {
    const { items, fetching, fetchingError, addItem } = useItems();

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Bookstore</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent>
                <IonLoading isOpen={fetching} message="Loading books..." />

                {items && (
                    <IonList>
                        {items.map(({ id, title, author, published, available }) => (
                            <Item
                                key={id}
                                id={id}
                                title={title}
                                author={author}
                                published={published}
                                available={available}
                            />
                        ))}
                    </IonList>
                )}

                {fetchingError && (
                    <div>{fetchingError.message || 'Error at fetching books'}</div>
                )}

                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={addItem}>
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );
};

export default ItemList;
