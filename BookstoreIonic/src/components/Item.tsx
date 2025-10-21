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
import { ItemProps } from './ItemProps';
import { format } from 'date-fns';
import './ItemList.css';

const log = getLogger('Book');

const Item: React.FC<ItemProps> = ({ title, author, published, available }) => {
    const normalizedDate = Array.isArray(published)
        ? new Date(published[0], published[1] - 1, published[2], published[3], published[4])
        : new Date(published);

    const formattedDate = published ? format(normalizedDate, 'dd/MM/yyyy') : '';

    log(`render ${title}`);

    return (
        <IonCard className={`book-card ${available ? 'available-card' : 'unavailable-card'}`}>
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
