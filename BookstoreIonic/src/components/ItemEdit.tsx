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
    IonLoading,
    IonCheckbox,
    IonImg,
    IonIcon,
    IonActionSheet,
    createAnimation
} from '@ionic/react';
import '../theme/variables.css'
import {ItemProps} from './props/ItemProps';
import {getLogger} from '../utils';
import {ItemContext} from '../providers/ItemProvider';
import {RouteComponentProps} from 'react-router';
import {format} from "date-fns";
import {MyPhoto, usePhotos} from "../hooks/usePhoto";
import {camera, trash, close} from "ionicons/icons";
import {useMyLocation} from "../hooks/useMyLocation";
import MyMap from "./custom/MyMap";

const log = getLogger('ItemEdit');

interface ItemEditProps extends RouteComponentProps<{ id?: string }> { }

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

const ItemEdit: React.FC<ItemEditProps> = ({ history, match }) => {
    log('RENDER ITEMEDIT PAGE <333');

    const {items, saveItem, saving, savingError} = useContext(ItemContext);
    const {takePhoto, deletePhoto} = usePhotos();
    const myLocation = useMyLocation();

    const [book, setBook] = useState<ItemProps | undefined>(undefined);
    const [photoToDelete, setPhotoToDelete] = useState<MyPhoto>();
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [published, setPublished] = useState<Date | undefined>(undefined);
    const [available, setAvailable] = useState(false);
    const [photo, setPhoto] = useState<string | undefined>(undefined);
    const [lat, setLat] = useState<number | undefined>(46.77333635695063);
    const [lng, setLng] = useState<number | undefined>( 23.621393999977975);
    const [unsavedChanges, setUnsavedChanges] = useState(false);
    const [shakeAnimation, setShakeAnimation] = useState(false);

    // Set location defaults
    useEffect(() => {
        if (myLocation.position?.coords && !lat && !lng) {
            const { latitude, longitude } = myLocation.position.coords;
            setLat(latitude);
            setLng(longitude);
        }
    }, [myLocation]);

    // Load item details
    useEffect(() => {
        log('useEffect - Fetching book details');
        const routeId = match.params.id || '';
        const foundItem = items?.find((i) => i.id === routeId);

        if (foundItem) {
            setBook(foundItem);
            setTitle(foundItem.title || '');
            setAuthor(foundItem.author || '');
            setAvailable(foundItem.available || false);
            setPhoto(foundItem.photo);

            if (foundItem.latitude && foundItem.longitude) {
                setLat(foundItem.latitude);
                setLng(foundItem.longitude);
            }

            if (foundItem.published) {
                const parsed = new Date(foundItem.published);
                if (!isNaN(parsed.getTime())) {
                    setPublished(parsed);
                }
            }

            log('Loaded item for edit:', foundItem);
        }
    }, [match.params.id, items]);

    const myPhoto: MyPhoto | undefined = photo ? {
        filepath: `${book?.id}.jpeg`,
        webviewPath: `data:image/jpeg;base64,${photo}`
    } : undefined;

    // Handle save
    const handleEdit = useCallback(async () => {
        if (!title.trim()) {
            setShakeAnimation(true);
            setTimeout(() => setShakeAnimation(false), 1000);
            return;
        }

        const edited: ItemProps = {
            id: book?.id,
            title,
            author,
            published: published || new Date(),
            available,
            photo,
            latitude: lat,
            longitude: lng,
        };

        setUnsavedChanges(false);
        log('handleEdit - Saving edited book');

        if (saveItem) {
            saveItem(edited).then(() => {
                log('handleEdit - Book saved successfully. Navigating back.');
                history.goBack();
            });
        }
    }, [book, saveItem, title, author, published, available, photo, lat, lng, history]);

    const handleCancel = useCallback(() => {
        if (unsavedChanges) {
            const confirmLeave = window.confirm("You have unsaved changes. Discard them?");
            if (!confirmLeave) return;
        }
        log('handleCancel - Navigating back without saving');
        history.goBack();
    }, [unsavedChanges, history]);

    const handleMapClick = useCallback((latLng: { latitude: number; longitude: number }) => {
        const { latitude, longitude } = latLng;
        setLat(latitude);
        setLng(longitude);
        setUnsavedChanges(true);
    }, []);

    useEffect(() => {
        if (shakeAnimation) {
            const emptyFields: HTMLElement[] = [];

            if (!title.trim()) {
                const titleInput = document.querySelector('.inputContainer.title input');
                if (titleInput) emptyFields.push(titleInput as HTMLElement);
            }

            emptyFields.forEach((field) => {
                const container = field.closest('.inputContainer');
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
    }, [shakeAnimation, title, author]);

    return (
        <IonPage>
            <IonContent fullscreen className="ion-padding edit-book-content">
                <IonCard className="input-book-container">
                    <IonCardHeader>
                        <IonCardTitle className="page-title">Edit Book</IonCardTitle>
                    </IonCardHeader>

                    <IonCardContent>
                        <div className="inputContainer title">
                            <IonItem lines="full">
                                <IonLabel position="fixed" className="label">
                                    Title <IonText color="danger">*</IonText>
                                </IonLabel>
                                <IonInput
                                    className="textfield"
                                    placeholder="Enter book title"
                                    value={title}
                                    onIonChange={(e) => {
                                        setUnsavedChanges(true);
                                        setTitle(e.detail.value || '');
                                    }}
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
                                    onIonChange={(e) => {
                                        setUnsavedChanges(true);
                                        setAuthor(e.detail.value || '');
                                    }}
                                />
                            </IonItem>
                        </div>

                        <div className="inputContainer published">
                            <IonItem lines="full">
                                <IonLabel position="fixed" className="label">Published</IonLabel>
                                <IonInput
                                    className="textfield"
                                    placeholder="dd/MM/yyyy"
                                    value={published ? format(new Date(published), 'dd/MM/yyyy') : ''}
                                    onIonChange={(e) => {
                                        const inputDate = parseDDMMYYYY(e.detail.value || '');
                                        if (inputDate) {
                                            setPublished(inputDate);
                                            setUnsavedChanges(true);
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
                                    onIonChange={(e) => {
                                        setAvailable(e.detail.checked);
                                        setUnsavedChanges(true);
                                    }}
                                />
                            </IonItem>
                        </div>

                        <IonItem lines="full">
                            {myPhoto && (
                                <IonImg
                                    onClick={() => setPhotoToDelete(myPhoto)}
                                    src={myPhoto.webviewPath}
                                    alt={myPhoto.filepath}
                                    style={{width: '100%', height: 'auto'}}/>
                            )}

                            <IonButton
                                expand="block"
                                className="button"
                                onClick={async () => {
                                    const newPhoto = await takePhoto();
                                    setPhoto(newPhoto);
                                    setUnsavedChanges(true);
                                }}>
                                <IonIcon icon={camera} slot="start"/>
                                Take Picture
                            </IonButton>
                        </IonItem>

                        <IonActionSheet
                            isOpen={!!photoToDelete}
                            buttons={[
                                {
                                    text: 'Delete',
                                    role: 'destructive',
                                    icon: trash,
                                    handler: async () => {
                                        if (photoToDelete) {
                                            try {
                                                await deletePhoto(photoToDelete.filepath);
                                            } catch {
                                                log('deletePhoto skipped');
                                            }
                                            setPhoto(undefined);
                                            setPhotoToDelete(undefined);
                                            setUnsavedChanges(true);
                                        }
                                    },
                                },
                                { text: 'Cancel', icon: close, role: 'cancel' },
                            ]}
                            onDidDismiss={() => setPhotoToDelete(undefined)}
                        />

                        {lat && lng && <MyMap lat={lat} lng={lng} onMapClick={handleMapClick}/>}

                        <IonButton
                            expand="block"
                            className="button"
                            onClick={handleEdit}
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </IonButton>

                        <IonButton
                            expand="block"
                            className="button"
                            color="medium"
                            onClick={handleCancel}
                        >
                            Cancel
                        </IonButton>

                        <IonLoading isOpen={saving} message="Saving book..."/>

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