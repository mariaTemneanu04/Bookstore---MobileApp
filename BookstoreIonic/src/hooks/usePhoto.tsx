import { useEffect, useState } from 'react';
import { useCamera } from './useCamera';
import { useFilesystem } from './useFilesystem';
import { usePreferences } from './usePreferences';

export interface MyPhoto {
    filepath: string;
    webviewPath?: string;
}

const PHOTOS = 'photos';

export function usePhotos() {
    const [photos, setPhotos] = useState<MyPhoto[]>([]);
    const { getPhoto } = useCamera();
    const { readFile, writeFile, deleteFile } = useFilesystem();
    const { get, set } = usePreferences();
    useEffect(loadPhotos, [get, readFile, setPhotos]);
    return {
        photos,
        takePhoto,
        deletePhoto,
        savePhotoLocally,
    };

    async function takePhoto() {
        const data = await getPhoto();
        const filepath = new Date().getTime() + '.jpeg';
        await writeFile(filepath, data.base64String!);
        const webviewPath = `data:image/jpeg;base64,${data.base64String}`
        const newPhoto = { filepath, webviewPath };
        const newPhotos = [newPhoto, ...photos];
        await set(PHOTOS, JSON.stringify(newPhotos.map(p => ({ filepath: p.filepath }))));
        setPhotos(newPhotos);
    }

    async function deletePhoto(photo: MyPhoto) {
        const newPhotos = photos.filter(p => p.filepath !== photo.filepath);
        await set(PHOTOS, JSON.stringify(newPhotos));
        await deleteFile(photo.filepath);
        setPhotos(newPhotos);
    }

    async function savePhotoLocally(photo: MyPhoto) {
        return;
    }

    function loadPhotos() {
        loadSavedPhotos();

        async function loadSavedPhotos() {
            const savedPhotoString = await get(PHOTOS);
            const savedPhotos = (savedPhotoString ? JSON.parse(savedPhotoString) : []) as MyPhoto[];
            console.log('load', savedPhotos);
            for (const photo of savedPhotos) {
                const data = await readFile(photo.filepath);
                photo.webviewPath = `data:image/jpeg;base64,${data}`;
            }
            setPhotos(savedPhotos);
        }
    }
}
