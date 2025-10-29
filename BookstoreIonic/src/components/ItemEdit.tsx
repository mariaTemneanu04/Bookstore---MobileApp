import React, {useContext, useState, useCallback, useEffect} from 'react';
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
    IonLoading, IonCheckbox, IonImg, IonFab, IonIcon, IonFabButton, IonActionSheet,
} from '@ionic/react';
import './css/ItemSave.css';
import {ItemProps} from './props/ItemProps';
import {getLogger} from '../utils';
import {ItemContext} from '../providers/ItemProvider';
import {RouteComponentProps, useHistory, useLocation, useParams} from 'react-router';
import {format} from "date-fns";
import {MyPhoto, usePhotos} from "../hooks/usePhoto";
import {camera, trash, close} from "ionicons/icons";

const log = getLogger('ItemSave');

interface RouteParams {
    id: string;
}

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

const ItemEdit: React.FC<RouteComponentProps> = () => {
    log('render ItemEdit page');

    const {id} = useParams<RouteParams>();
    const location = useLocation<{ item?: ItemProps }>();
    const history = useHistory();

    const {items, saveItem, saving, savingError} = useContext(ItemContext);
    const {photos, takePhoto, deletePhoto} = usePhotos();

    const [book, setBook] = useState<ItemProps | undefined>(undefined);
    const [original, setOriginal] = useState<ItemProps | undefined>(undefined);
    const [photoToDelete, setPhotoToDelete] = useState<MyPhoto>();

    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [published, setPublished] = useState<Date | undefined>(undefined);
    const [available, setAvailable] = useState(false);
    const [photo, setPhoto] = useState<string | undefined>(undefined);

    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        let foundItem: ItemProps | undefined = location.state?.item;

        if (!foundItem && items) {
            foundItem = items.find((item) => item.id === id);
        }

        if (foundItem) {
            setBook(foundItem);
            setOriginal(foundItem);
            setTitle(foundItem.title || '');
            setAuthor(foundItem.author || '');
            setAvailable(foundItem.available || false);
            setPhoto(foundItem.photo);

            if (foundItem.published) {
                const parsed = new Date(foundItem.published);
                if (!isNaN(parsed.getTime())) {
                    setPublished(parsed);
                }
            }

            log('Loaded item for edit:', foundItem);
        }
    }, [id, location.state, items]);

    // const myPhoto: MyPhoto | undefined = photo ? {
    //     filepath: `${book.id}.jpeg`,
    //     webviewPath: `fata:image/jpeg;base64,${photo}`
    //     } : undefined;

    useEffect(() => {
        if (!original) return;

        const changed =
            title !== (original.title || '') ||
            author !== (original.author || '') ||
            available !== (original.available || false) ||
            photo !== (original.photo || '') ||
            (published && original.published
                ? new Date(published).getTime() !== new Date(original.published).getTime()
                : published !== original.published);

        setHasChanges(changed);
    }, [title, author, published, available, photo, original]);

    const handleEdit = useCallback(async () => {
        if (!title) {
            alert("title is required");
            return;
        }

        const edited: ItemProps = {
            id: book?.id,
            title,
            author,
            published: published || new Date(),
            available,
            photo,
        };

        setHasChanges(false);
        log('handleEdit - Saveing edited book');

        if (saveItem) {
            saveItem(edited).then(() => {
                log('handleEdit - Book saved successfully. Navigating back.');
                history.goBack();
            });
        }
    }, [book, saveItem, title, author, published, available, photo, history]);

    return (
        <IonPage>
            <IonContent fullscreen className="ion-padding add-book-content">
                <IonCard className="add-book-card">
                    <IonCardHeader>
                        <IonCardTitle className="title-style">Edit Book</IonCardTitle>
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
                                onIonChange={(e) => setTitle(e.detail.value || '')}
                            />
                        </IonItem>

                        <IonItem lines="full">
                            <IonLabel position="fixed" className="label-style">Author</IonLabel>
                            <IonInput
                                className="custom-textfield"
                                placeholder="Enter author name"
                                value={author}
                                onIonChange={(e) => setAuthor(e.detail.value || '')}
                            />
                        </IonItem>

                        <IonItem lines="full">
                            <IonLabel position="fixed" className="label-style">Published</IonLabel>
                            <IonInput
                                className="custom-textfield"
                                placeholder="dd/MM/yyyy"
                                value={published ? format(new Date(published), 'dd/MM/yyyy') : ''}
                                onIonChange={(e) => {
                                    const inputDate = parseDDMMYYYY(e.detail.value || '');
                                    if (inputDate) setPublished(inputDate);
                                }}
                            />
                        </IonItem>

                        <IonItem lines="full">
                            {photos.map((photo) => (
                                <IonImg onClick={() => setPhotoToDelete(photo)} src={photo.webviewPath}/>
                            ))}
                        </IonItem>

                        <IonFab horizontal="center" slot="fixed">
                            <IonFabButton onClick={() => takePhoto()}>
                                <IonIcon icon={camera}/>
                            </IonFabButton>
                        </IonFab>

                        <IonActionSheet
                            isOpen={!!photoToDelete}
                            buttons={[{
                                text: 'Delete',
                                role: 'destructive',
                                icon: trash,
                                handler: () => {
                                    if (photoToDelete) {
                                        deletePhoto(photoToDelete);
                                        setPhotoToDelete(undefined);
                                    }
                                }
                            }, {
                                text: 'Cancel',
                                icon: close,
                                role: 'cancel',
                            }]}
                            onDidDismiss={() => setPhotoToDelete(undefined)}/>

                        {/* Availability */}
                        <IonItem lines="none">
                            <IonLabel>Available</IonLabel>
                            <IonCheckbox
                                checked={available}
                                onIonChange={(e) => setAvailable(e.detail.checked)}
                            />
                        </IonItem>

                        {/* Save changes */}
                        <IonButton
                            expand="block"
                            className="save-button"
                            onClick={handleEdit}
                            disabled={!hasChanges || saving}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
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

export default ItemEdit;