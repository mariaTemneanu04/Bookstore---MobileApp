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

const log = getLogger('Book');

interface ItemPropsExt extends ItemProps {
    onEdit: (id?: string) => void;
}

const Item: React.FC<ItemPropsExt> = ({ id, title, author, published, available, photo, latitude, longitude, onEdit }) => {
    const normalizedDate = Array.isArray(published)
        ? new Date(published[0], published[1] - 1, published[2], published[3], published[4])
        : new Date(published);

    const formattedDate = published ? format(normalizedDate, 'dd/MM/yyyy') : '';
    const webviewPath = `data:image/jpeg;base64,${photo}`;

    log(`render ${title}`);

    const latText = latitude !== undefined && latitude !== null ? latitude.toFixed(4) : 'null';
    const lngText = longitude !== undefined && longitude !== null ? longitude.toFixed(4) : 'null';

    return (
        <IonCard
            button
            onClick={() => onEdit(id)}
            className={`book-card ${available ? 'available-card' : 'unavailable-card'}`}
        >
            <IonCardHeader>
                <div className="book-header">
                    <IonCardTitle className="book-title">{title}</IonCardTitle>
                    <IonBadge color={available ? 'success' : 'danger'}>
                        {available ? 'Available' : 'Unavailable'}
                    </IonBadge>
                </div>

                <p className="book-coordinates">
                    <small>📍 Lat: {latText}, Lng: {lngText}</small>
                </p>

                <IonCardSubtitle>by {author || 'Unknown author'}</IonCardSubtitle>
            </IonCardHeader>

            <IonCardContent>
                <div className="book-content">
                    {photo ? (
                        <img
                            src={webviewPath}
                            alt={`${id}.jpg`}
                            className="book-image"
                        />
                    ) : (
                        <div className="book-fallback">
                            <span>No cover</span>
                        </div>
                    )}
                    <div className="book-details">
                        <p><strong>Published:</strong> {formattedDate}</p>
                    </div>
                </div>
            </IonCardContent>
        </IonCard>
    );
};

export default memo(Item);
