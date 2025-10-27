import {RouteComponentProps} from "react-router";
import React, {useContext, useEffect, useState} from "react";
import {ItemContext} from "../providers/ItemProvider";
import {
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCheckbox,
    IonContent,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonItem,
    IonLabel,
    IonList,
    IonPage,
    IonSelect,
    IonSelectOption,
} from "@ionic/react";
import './css/ItemSave.css';
import {getLogger} from "../utils";
import Item from "./Item";
import {AuthContext} from "../providers/AuthProvider";
import {getAuthors} from "../rest/itemApi";

const log = getLogger('BookFilter');

const ItemFilter: React.FC<RouteComponentProps> = () => {
    const { items = [] } = useContext(ItemContext);
    const { token } = useContext(AuthContext);

    const [loading, setLoading] = useState(true);
    const [loaded, setLoaded] = useState<any[]>([]);
    const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(false);
    const [filteredItems, setFilteredItems] = useState<any[]>([]);
    const [availabilityFilter, setAvailabilityFilter] = useState<boolean | undefined>(undefined);
    const [authorFilter, setAuthorFilter] = useState<string | undefined>(undefined);
    const [authors, setAuthors] = useState<string[]>([]);

    log('entered');

    useEffect(() => {
        if (token) {
            getAuthors(token)
                .then(setAuthors)
                .catch(err => log('Error fetching authors: ', err));
        }
    }, [token]);

    async function fetchData() {
        const nextSet = filteredItems.slice(loaded.length, loaded.length + 4);
        setLoaded([...loaded, ...nextSet]);
        setDisableInfiniteScroll(loaded.length + nextSet.length >= filteredItems.length);
    }

    async function searchNext($event: CustomEvent<void>) {
        await fetchData();
        await new Promise(resolve => setTimeout(resolve, 3000));
        await ($event.target as HTMLIonInfiniteScrollElement).complete();
    }

    async function filterBooks() {
        return items?.filter((b) => {
            const authorMatch =
                !authorFilter || b.author === authorFilter;

            const availabilityMatch =
                availabilityFilter === undefined ||
                b.available === availabilityFilter;

            return authorMatch && availabilityMatch;
        });
    }

    useEffect(() => {
        setLoading(true);
        filterBooks().then((result) => {
            setFilteredItems(result);
            setLoading(false);

            const firstPage = result.slice(0, 4);
            setLoaded(firstPage);
            setDisableInfiniteScroll(firstPage.length >= result?.length);
            setLoading(false);
        });
    }, [authorFilter, availabilityFilter]);

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
                            <IonSelect value={authorFilter} placeholder="Select Author" onIonChange={e => setAuthorFilter(e.detail.value)}>
                                {authors.map(a => (
                                    <IonSelectOption key={a} value={a}>
                                        {a}
                                    </IonSelectOption>
                                ))}
                            </IonSelect>
                        </IonItem>
                    </IonCardContent>
                </IonCard>

                {loaded.length > 0 ? (
                    <>
                        <IonList>
                            {!loading && loaded.map(({id, title, author, published, available}) => (
                                <Item
                                    key={id}
                                    title={title}
                                    author={author}
                                    published={published}
                                    available={available}
                                />
                            ))}
                        </IonList>

                        <IonInfiniteScroll
                            threshold="60px"
                            disabled={disableInfiniteScroll}
                            onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}>

                            <IonInfiniteScrollContent
                                loadingSpinner="bubbles"
                                loadingText="Loading more books..."/>
                        </IonInfiniteScroll>
                    </>
                ) : <p className="empty-message">No books available yet</p> }
            </IonContent>

        </IonPage>
    )
}

export default ItemFilter;