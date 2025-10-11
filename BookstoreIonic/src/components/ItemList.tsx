import React from 'react';
import {
    IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle,
    IonContent,
    IonHeader, IonLoading,
    IonPage,
    IonSearchbar,

} from '@ionic/react';
import { searchCircle } from 'ionicons/icons';
import { useItems } from './useItems';
import './ItemList.css';

const ItemList: React.FC = () => {
    const { items, fetching, fetchingError } = useItems();

    // de adaugat un log ceva

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
                <IonLoading isOpen={fetching} message="Loading books..."/>

                {items && items.length > 0 ? (
                    items.map(({ id, title, author, published, available }) => (
                        <IonCard key={id} className={`book-card ${available ? 'available-card' : 'unavailable-card'}`}>
                            <IonCardHeader>
                                <div className="book-header">
                                    <IonCardTitle className="book-title">{title}</IonCardTitle>
                                    <span className={`availability-tag ${ available ? 'available' : 'unavailable' }`}>
                                        {available ? 'Available' : 'Unavailable'}
                                    </span>
                                </div>
                                <IonCardSubtitle>by {author}</IonCardSubtitle>
                            </IonCardHeader>
                            <IonCardContent>
                                <p>
                                    <strong>Published:</strong>{' '}
                                    {new Date(published).toLocaleDateString()}
                                </p>
                            </IonCardContent>
                        </IonCard>
                    ))
                ) : (
                    !fetching && <p className="empty-message">No books available yet</p>
                )}

                {
                    fetchingError && (
                        <div className="error-message">
                            {fetchingError.message || 'Error fetching books'}
                        </div>
                    )
                }

            </IonContent>

        </IonPage>
    )
}

// const ItemList: React.FC = () => {
//     const { items, fetching, fetchingError, addItem } = useItems();
//
//     return (
//         <IonPage>
//             <IonHeader translucent>
//                 <IonToolbar color="primary">
//                     <IonButtons slot="start">
//                         <IonMenuButton />
//                     </IonButtons>
//                     <IonTitle className="ion-text-center">Bookstore</IonTitle>
//                 </IonToolbar>
//             </IonHeader>
//
//
//             <IonContent fullscreen className="ion-padding item-list-content">
//                 <IonLoading isOpen={fetching} message="Loading books..." />
//
//                 {fetchingError && (
//                     <div className="error-message">
//                         {fetchingError.message || 'Error fetching books'}
//                     </div>
//                 )}
//
//                 {items && items.length > 0 ? (
//                     items.map(({ id, title, author, published, available }) => (
//                         <IonCard key={id} className="book-card">
//                             <IonCardHeader>
//                                 <div className="book-header">
//                                     <IonCardTitle className="book-title">{title}</IonCardTitle>
//                                     <span
//                                         className={`availability-tag ${
//                                             available ? 'available' : 'unavailable'
//                                         }`}
//                                     >
//                     {available ? 'Available' : 'Unavailable'}
//                   </span>
//                                 </div>
//                                 <IonCardSubtitle>by {author}</IonCardSubtitle>
//                             </IonCardHeader>
//                             <IonCardContent>
//                                 <p>
//                                     <strong>Published:</strong>{' '}
//                                     {new Date(published).toLocaleDateString()}
//                                 </p>
//                             </IonCardContent>
//                         </IonCard>
//                     ))
//                 ) : (
//                     !fetching && <p className="empty-message">No books available yet 📖</p>
//                 )}
//
//                 <IonFab vertical="bottom" horizontal="end" slot="fixed">
//                     <IonFabButton color="success" onClick={addItem}>
//                         <IonIcon icon={add} />
//                     </IonFabButton>
//                 </IonFab>
//             </IonContent>
//         </IonPage>
//     );
// };

export default ItemList;
