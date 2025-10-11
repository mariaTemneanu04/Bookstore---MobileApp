import React, { memo } from 'react';
import { getLogger } from "../utils";
import { IonItem, IonLabel, IonNote, IonBadge } from '@ionic/react';
import { ItemProps } from './ItemProps';
import {text} from "ionicons/icons";

const log = getLogger('Book');

const Item: React.FC<ItemProps> = ({ title, author, published, available }) => {
    const publishedDate = new Date(published).toLocaleDateString('ro-RO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    log(`render ${text}`);

    return (
        <IonItem>
            <IonLabel>
                <h2>{title}</h2>
                <p>{author || 'Unknown author'}</p>
                <IonNote color="medium">Published: {publishedDate}</IonNote>
            </IonLabel>
            <IonBadge color={available ? 'success' : 'danger'}>
                {available ? 'Available' : 'Unavailable'}
            </IonBadge>
        </IonItem>
    );
};

export default memo(Item);
