import {Directory, Filesystem} from '@capacitor/filesystem';
import {useCallback} from 'react';

export function useFilesystem() {
    const readFile = useCallback<(path: string) => Promise<string>>(
        (path) =>
            Filesystem.readFile({
                path,
                directory: Directory.Data,
            }).then(result => result.data as string | ''), []);

    const writeFile = useCallback<(path: string, data: string) => Promise<any>>(
        async (path, data) => {
            try {
                const existingData = await readFile(path);

                if (existingData === null || existingData !== data) {
                    return Filesystem.writeFile({
                        path,
                        data,
                        directory: Directory.Data,
                    });
                }

                return Promise.resolve();
            } catch (e) {
                return Filesystem.writeFile({
                    path,
                    data,
                    directory: Directory.Data,
                })
            }

        }, [readFile]);

    const deleteFile = useCallback<(path: string) => Promise<void>>(
        (path) =>
            Filesystem.deleteFile({
                path,
                directory: Directory.Data,
            }), []);

    return {
        readFile,
        writeFile,
        deleteFile,
    };
}