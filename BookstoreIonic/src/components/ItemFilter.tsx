import { RouteComponentProps } from "react-router";
import React, { useContext, useEffect, useState } from "react";
import { ItemContext } from "../providers/ItemProvider";
import {
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCheckbox,
    IonContent,
    IonItem,
    IonLabel,
    IonList,
    IonPage,
    IonSelect,
    IonSelectOption,
} from "@ionic/react";
import './css/ItemSave.css';
import { getLogger } from "../utils";
import Item from "./Item";
import { AuthContext } from "../providers/AuthProvider";
import { getAuthors } from "../rest/itemApi";

const log = getLogger('BookFilter');

const ItemFilter: React.FC<RouteComponentProps> = ({ history }) => {
    const { items = [] } = useContext(ItemContext);
    const { token } = useContext(AuthContext);

    const [filteredItems, setFilteredItems] = useState<any[]>([]);
    const [availabilityFilter, setAvailabilityFilter] = useState<boolean | undefined>(undefined);
    const [authorFilter, setAuthorFilter] = useState<string | undefined>(undefined);
    const [authors, setAuthors] = useState<string[]>([]);

    useEffect(() => {
        if (token) {
            getAuthors(token)
                .then(setAuthors)
                .catch(err => log('Error fetching authors: ', err));
        }
    }, [token]);

    useEffect(() => {
        const filterBooks = () => {
            return items.filter((b) => {
                const authorMatch = !authorFilter || b.author === authorFilter;
                const availabilityMatch =
                    availabilityFilter === undefined || b.available === availabilityFilter;
                return authorMatch && availabilityMatch;
            });
        };

        const result = filterBooks();
        setFilteredItems(result);
    }, [authorFilter, availabilityFilter, items]);

    return (
        <IonPage>
            <IonContent fullscreen className="ion-padding book-list-content">
                <IonCard className="add-book-card">
                    <IonCardHeader>
                        <IonCardTitle className="title-text">Filter Books</IonCardTitle>
                    </IonCardHeader>

                    <IonCardContent>
                        <IonItem lines="none">
                            <IonLabel>Available</IonLabel>
                            <IonCheckbox
                                checked={availabilityFilter}
                                onIonChange={(e) => {
                                    const checked = e.detail.checked;
                                    setAvailabilityFilter(checked ? true : undefined);
                                }}
                            />
                        </IonItem>

                        <IonItem lines="none">
                            <IonSelect
                                value={authorFilter}
                                placeholder="Select Author"
                                onIonChange={e => setAuthorFilter(e.detail.value)}
                            >
                                {authors.map(a => (
                                    <IonSelectOption key={a} value={a}>
                                        {a}
                                    </IonSelectOption>
                                ))}
                            </IonSelect>
                        </IonItem>
                    </IonCardContent>
                </IonCard>

                {filteredItems.length > 0 ? (
                    <IonList>
                        {filteredItems.map(({ id, title, author, published, available, photo, latitude, longitude }) => (
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
                ) : (
                    <p className="empty-message">No books found</p>
                )}
            </IonContent>
        </IonPage>
    );
};

export default ItemFilter;