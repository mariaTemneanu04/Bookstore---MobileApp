import React, { useContext, useState, useCallback } from 'react';
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
    IonButton,
    IonText,
    IonLoading, IonCheckbox,
} from '@ionic/react';
import './ItemSave.css';
import { ItemProps } from './ItemProps';
import { getLogger } from '../utils';
import { ItemContext } from '../providers/ItemProvider';
import { RouteComponentProps } from 'react-router';
import {format} from "date-fns";

const log = getLogger('ItemSave');

function parseDDMMYYYY(dateString: string) {
    const [day, month, year] = dateString.split('/').map(Number);
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
        log('Invalid date components');
        return null;
    }
    const adjustedMonth = month - 1;
    const parsedDate = new Date(year, adjustedMonth, day);
    if (
        parsedDate.getDate() !== day ||
        parsedDate.getMonth() !== adjustedMonth ||
        parsedDate.getFullYear() !== year
    ) {
        console.error('Invalid date');
        return null;
    }
    if (isNaN(parsedDate.getTime())) {
        log('Invalid date');
        return null;
    }

    return parsedDate;
}

const ItemSave: React.FC<RouteComponentProps> = ({ history }) => {
    log('render ItemSave page');

    const { saving, savingError, saveItem } = useContext(ItemContext);
    const [book, setBook] = useState<ItemProps | undefined>(undefined);

    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [published, setPublished] = useState<Date | undefined>(undefined);
    const [available, setAvailable] = useState(false);

    const handleSave = useCallback(async () => {
        try {
            if (!title) {
                alert("title is required");
                return;
            }

            const newBook: ItemProps = {
                id: book?.id,
                title,
                author,
                published: published || new Date(),
                available,
            };

            await saveItem?.(newBook);
            log('handleSave - Book saved successfully.');
            history.goBack();

        } catch (error) {
            log('Save failed', error);
        }
    }, [book, saveItem, title, author, published, available, history]);

    return (
        <IonPage>
            <IonContent fullscreen className="ion-padding add-book-content">
                <IonCard className="add-book-card">
                    <IonCardHeader>
                        <IonCardTitle className="title-style">Book Details</IonCardTitle>
                    </IonCardHeader>

                    <IonCardContent>
                        <IonItem lines="full">
                            <IonLabel position="fixed" className="label-style">
                                Title <IonText color="danger">*</IonText>
                            </IonLabel>
                            <IonInput
                                className="custom-textfield"
                                placeholder="Enter book title"
                                value={title}
                                onIonChange={(e) => {
                                    setTitle(e.detail.value || '');
                                }}
                            />
                        </IonItem>

                        <IonItem lines="full">
                            <IonLabel position="fixed" className="label-style">Author</IonLabel>
                            <IonInput
                                className="custom-textfield"
                                placeholder="Enter author name"
                                value={author}
                                onIonChange={(e) => {
                                    setAuthor(e.detail.value || '');
                                }}
                            />
                        </IonItem>

                        <IonItem lines="full">
                            <IonLabel position="fixed" className="label-style">
                                Published Date
                            </IonLabel>
                            <IonInput
                                className="custom-textfield"
                                placeholder="dd/MM/yyyy"
                                value={published ? format(new Date(published), 'dd/MM/yyyy') : ''}
                                onIonChange={(e) => {
                                    const inputDate = parseDDMMYYYY(e.detail.value || '');
                                    if (inputDate !== null) {
                                        setPublished(inputDate);
                                    } else {
                                        e.detail.value = published ? format(new Date(published), 'dd/MM/yyyy') : '';
                                    }

                                }}
                            />
                        </IonItem>

                        <IonItem lines="none">
                            <IonLabel>Available</IonLabel>
                            <IonCheckbox
                                checked={available}
                                onIonChange={(e) => {
                                    setAvailable(e.detail.checked);
                                }}
                            />
                        </IonItem>

                        <IonButton
                            expand="block"
                            className="save-button"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save Book'}
                        </IonButton>

                        <IonLoading isOpen={saving} message="Saving book..." />

                        {savingError && (
                            <IonText color="danger">
                                <p>Error saving book!</p>
                            </IonText>
                        )}
                    </IonCardContent>
                </IonCard>
            </IonContent>
        </IonPage>
    );
};

export default ItemSave;
