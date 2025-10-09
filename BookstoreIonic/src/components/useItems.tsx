import { ItemProps } from "./ItemProps";
import {useCallback, useEffect, useState} from "react";
import {getItems} from "../rest/itemApi";

export interface ItemsState {
    items?: ItemProps[],
    fetching: boolean,
    fetchingError?: Error,
}

export interface ItemsProps extends ItemsState {
    addItem: () => void;
}

export const useItems: () => ItemsProps = () => {
    const [fetching, setFetching] = useState<boolean>(false);
    const [items, setItems] = useState<ItemProps[]>();
    const [fetchingError, setFetchingError] = useState<Error>();

    const addItem = useCallback(() => {
        // TODO
    }, []);

    useEffect(getItemsEffect, []);

    return {
        items,
        fetching,
        fetchingError,
        addItem,
    };

    function getItemsEffect() {
        let canceled = false;
        fetchItems();
        return () => {
            canceled = true;
        }

        async function fetchItems() {
            try {
                setFetching(true);
                const items = await getItems();

                if (!canceled) {
                    setFetching(false);
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    setItems(items);
                }
            } catch (error) {
                if (!canceled) {
                    setFetching(false);
                    setFetchingError(error as Error);
                }
            }
        }
    }
}

