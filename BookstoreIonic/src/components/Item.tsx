import React, { memo } from 'react';
import { getLogger } from "../utils";
import {
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonBadge
} from '@ionic/react';
import { ItemProps } from './props/ItemProps';
import { format } from 'date-fns';
import './css/ItemList.css';
import {useHistory} from "react-router";

const log = getLogger('Book');

const Item: React.FC<ItemProps> = ({ id, title, author, published, available }) => {
    const history = useHistory();

    const normalizedDate = Array.isArray(published)
        ? new Date(published[0], published[1] - 1, published[2], published[3], published[4])
        : new Date(published);

    const formattedDate = published ? format(normalizedDate, 'dd/MM/yyyy') : '';

    log(`render ${title}`);

    const handleClick = () => {
        log(`Navigating to edit for item: ${id}`);
        history.push({
            pathname: `/edit/${id}`,
            state: { item: {id, title, author, published, available } },
        });
    }

    return (
        <IonCard
            button
            onClick={handleClick}
            className={`book-card ${available ? 'available-card' : 'unavailable-card'}`}>
            <IonCardHeader>
                <div className="book-header">
                    <IonCardTitle className="book-title">{title}</IonCardTitle>
                    <IonBadge color={available ? 'success' : 'danger'}>
                        {available ? 'Available' : 'Unavailable'}
                    </IonBadge>
                </div>
                <IonCardSubtitle>by {author || 'Unknown author'}</IonCardSubtitle>
            </IonCardHeader>

            <IonCardContent>
                <p>
                    <strong>Published:</strong> {formattedDate}
                </p>
            </IonCardContent>
        </IonCard>
    );
};

export default memo(Item);
