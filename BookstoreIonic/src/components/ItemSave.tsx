import React, { useContext, useState, useCallback, useEffect } from 'react';
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
    IonLoading,
    IonCheckbox,
    createAnimation
} from '@ionic/react';

import '../theme/variables.css';
import { ItemProps } from './props/ItemProps';
import { getLogger } from '../utils';
import { ItemContext } from '../providers/ItemProvider';
import { RouteComponentProps } from 'react-router';
import { format } from 'date-fns';

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
    const [book] = useState<ItemProps | undefined>(undefined);

    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [published, setPublished] = useState<Date | undefined>(undefined);
    const [available, setAvailable] = useState(false);
    const [shakeAnimation, setShakeAnimation] = useState(false);

    const handleSave = useCallback(async () => {
        try {
            if (!title) {
                setShakeAnimation(true);
                setTimeout(() => {
                    setShakeAnimation(false);
                }, 1000);
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
    
    useEffect(() => {
        if (shakeAnimation) {
            const emptyInputFields: HTMLElement[] = [];

            if (!title.trim()) {
                const titleInput = document.querySelector('.inputContainer.title input');
                if (titleInput) {
                    emptyInputFields.push(titleInput as HTMLElement);
                }
            }

            if (emptyInputFields.length > 0) {
                emptyInputFields.forEach((inputField) => {
                    const container = inputField.closest('.inputContainer');
                    if (container) {
                        const animation = createAnimation()
                            .addElement(container)
                            .duration(500)
                            .direction('alternate')
                            .iterations(3)
                            .keyframes([
                                { offset: 0, transform: 'translateX(0)' },
                                { offset: 0.25, transform: 'translateX(-10px)' },
                                { offset: 0.5, transform: 'translateX(10px)' },
                                { offset: 0.75, transform: 'translateX(-10px)' },
                                { offset: 1, transform: 'translateX(0)' },
                            ]);
                        animation.play();
                    }
                });
            }
        }
    }, [shakeAnimation, title, author]);

    return (
        <IonPage>
            <IonContent fullscreen className="ion-padding add-book-content">
                <IonCard className="input-book-container">
                    <IonCardHeader>
                        <IonCardTitle className="page-title">Book Details</IonCardTitle>
                    </IonCardHeader>

                    <IonCardContent>
                        {/* 🔹 Am adăugat clase pentru selectare în animație */}
                        <div className="inputContainer title">
                            <IonItem lines="full">
                                <IonLabel position="fixed" className="label">
                                    Title <IonText color="danger">*</IonText>
                                </IonLabel>
                                <IonInput
                                    className="textfield"
                                    placeholder="Enter book title"
                                    value={title}
                                    onIonChange={(e) => setTitle(e.detail.value || '')}
                                />
                            </IonItem>
                        </div>

                        <div className="inputContainer author">
                            <IonItem lines="full">
                                <IonLabel position="fixed" className="label">Author</IonLabel>
                                <IonInput
                                    className="textfield"
                                    placeholder="Enter author name"
                                    value={author}
                                    onIonChange={(e) => setAuthor(e.detail.value || '')}
                                />
                            </IonItem>
                        </div>

                        <div className="inputContainer published">
                            <IonItem lines="full">
                                <IonLabel position="fixed" className="label">
                                    Published Date
                                </IonLabel>
                                <IonInput
                                    className="textfield"
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
                        </div>

                        <div className="inputContainer availability">
                            <IonItem lines="none">
                                <IonLabel>Available</IonLabel>
                                <IonCheckbox
                                    checked={available}
                                    onIonChange={(e) => setAvailable(e.detail.checked)}
                                />
                            </IonItem>
                        </div>

                        <IonButton
                            expand="block"
                            className="button"
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
