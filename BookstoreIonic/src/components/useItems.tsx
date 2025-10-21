import { ItemProps } from "./ItemProps";
import {useCallback, useEffect, useReducer} from "react";
import {getItems} from "../rest/itemApi";
import { getLogger } from "../utils";

const log = getLogger('useItems');
const FETCH_ITEMS_FAILED = 'FETCH_ITEMS_FAILED';
const FETCH_ITEMS_SUCCEEDED = 'FETCH_ITEMS_SUCCEEDED';
const FETCH_ITEMS_STARTED = 'FETCH_ITEMS_STARTED'


export interface ItemsState {
    items?: ItemProps[],
    fetching: boolean,
    fetchingError?: Error,
}

interface ActionProps {
    type: string;
    payload?: any;
}

const initialState: ItemsState = {
    items: undefined,
    fetching: false,
    fetchingError: undefined,
}

export interface ItemsProps extends ItemsState {
    addItem: () => void;
}

const reducer: (state: ItemsState, action: ActionProps) => ItemsState =
    (state, { type, payload } )=> {
        switch (type) {
            case FETCH_ITEMS_STARTED:
                return {...state, fetching: true};

            case FETCH_ITEMS_SUCCEEDED:
                return {...state, items: payload.items, fetching: false};

            case FETCH_ITEMS_FAILED:
                return {...state, fetchingError: payload.error, fetching: false};

            default:
                return state;
        }
};


export const useItems: () => ItemsProps = () => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { items, fetching, fetchingError } = state;

    const addItem = useCallback(() => {
        log('adding a book');
    }, []);

    useEffect(getItemsEffect, []);
    log(`returns - fetching = ${fetching}, items = ${JSON.stringify(items)}`);

    return {
        items,
        fetching,
        fetchingError,
        addItem,
    };

    function getItemsEffect() {
        let cancelled = false;
        fetchItems();
        return () => {
            cancelled = true;
        }

        async function fetchItems() {
            try {
                log('fetchItems started');
                dispatch({ type: FETCH_ITEMS_STARTED });
                const items = await getItems();
                log('fetchItems succeeded');

                if (!cancelled) {
                    dispatch({ type: FETCH_ITEMS_SUCCEEDED, payload: { items }});
                }
            } catch (error) {
                if (!cancelled) {
                    dispatch({ type: FETCH_ITEMS_FAILED, payload: { error }});
                }
            }
        }
    }
}

