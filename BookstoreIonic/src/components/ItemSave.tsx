import React, {useState} from 'react';
import {
    IonPage,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonToggle,
    IonButton,
    IonText, IonDatetime,
} from '@ionic/react';
import './ItemSave.css';
import {ItemProps} from './ItemProps';
import {getLogger} from '../utils';

const log = getLogger('ItemSave');

const ItemSave: React.FC = () => {
    log('render ItemSave page');

    const [book, setBook] = useState<ItemProps>({
        title: '',
        author: '',
        published: '',
        available: false,
    });

    const handleChange = (field: keyof ItemProps, value: any) => {
        setBook(prev => ({...prev, [field]: value}));
    };

    const handleSave = () => {
        log('Saving book:', book);
        // TODO
        alert(`Book "${book.title}" saved!`);
    };

    return (
        <IonPage>
            <IonContent fullscreen className="ion-padding add-book-content">
                <IonCard className="add-book-card">
                    <IonCardHeader>
                        <IonCardTitle className="title-style">Book Details</IonCardTitle>
                    </IonCardHeader>

                    <IonCardContent>
                        <IonItem lines="full">
                            <IonLabel position="fixed" className="label-style">Title <IonText color="danger">*</IonText></IonLabel>
                            <IonInput
                                className="custom-textfield"
                                placeholder="Enter book title"
                                value={book.title}
                                onIonChange={e => handleChange('title', e.detail.value!)}
                            />
                        </IonItem>


                        <IonItem lines="full">
                            <IonLabel position="fixed" className="label-style">Author</IonLabel>
                            <IonInput
                                className="custom-textfield"
                                placeholder="Enter author name"
                                value={book.author || ''}
                                onIonChange={e => handleChange('author', e.detail.value!)}
                            />
                        </IonItem>

                        <IonItem lines="full">
                            <IonLabel position="fixed" className="label-style">Published Date</IonLabel>
                            <IonDatetime
                                preferWheel={true}
                                presentation="date"
                                value={book.published}
                                onIonChange={e => handleChange('published', e.detail.value!)}/>
                        </IonItem>

                        <IonItem lines="none">
                            <IonLabel>Available</IonLabel>
                            <IonToggle
                                checked={book.available}
                                onIonChange={e => handleChange('available', e.detail.checked)}
                            />
                        </IonItem>

                        <IonButton
                            className="save-button"
                            onClick={handleSave}>
                            Save Book
                        </IonButton>

                    </IonCardContent>
                </IonCard>
            </IonContent>
        </IonPage>
    );
};

export default ItemSave;
