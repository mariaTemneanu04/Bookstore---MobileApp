import {getLogger} from "../utils";
import {ItemProps} from "../components/ItemProps";
import React, {useCallback, useContext, useEffect, useReducer} from "react";
import PropTypes from "prop-types";
import {createItem, getItems, newWebSocket} from "../rest/itemApi";
import { Preferences } from '@capacitor/preferences';
import {AuthContext} from "./AuthProvider";

const log = getLogger('ItemProvider');

type SaveItemFn = (item: ItemProps) => Promise<any>;

export interface ItemsState {
    items?: ItemProps[],
    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,
    saveItem?: SaveItemFn,
}

interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: ItemsState = {
    fetching: false,
    saving: false,
};

const FETCH_ITEMS_STARTED = 'FETCH_ITEMS_STARTED';
const FETCH_ITEMS_SUCCEEDED = 'FETCH_ITEMS_SUCCEEDED';
const FETCH_ITEMS_FAILED = 'FETCH_ITEMS_FAILED';
const SAVE_ITEM_STARTED = 'SAVE_ITEM_STARTED';
const SAVE_ITEM_SUCCEEDED = 'SAVE_ITEM_SUCCEEDED';
const SAVE_ITEM_FAILED = 'SAVE_ITEM_FAILED';

const reducer: (state: ItemsState, action: ActionProps) => ItemsState =
    (state, { type, payload }) => {
        switch(type) {
            case FETCH_ITEMS_STARTED:
                return { ...state, fetching: true, fetchingError: null };
            case FETCH_ITEMS_SUCCEEDED:
                return { ...state, items: payload.items, fetching: false };
            case FETCH_ITEMS_FAILED:
                return { ...state, fetchingError: payload.error, fetching: false };
            case SAVE_ITEM_STARTED:
                return { ...state, savingError: null, saving: true };
            case SAVE_ITEM_SUCCEEDED: {
                const items = [...(state.items || [])];
                const item = payload.item;
                const index = items.findIndex(b => b.id === item.id);

                if (index === -1) {
                    items.splice(item.length, 0, item);
                } else {
                    items[index] = item;
                }

                log('books in SAVE_BOOK_SUCCEEDED:', items);
                return { ...state, items, savingError: null, saving: false };
            }


            case SAVE_ITEM_FAILED:
                return { ...state, savingError: payload.error, saving: false };
            default:
                return state;
        }
    };

export const ItemContext = React.createContext<ItemsState>(initialState);

interface ItemProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const ItemProvider: React.FC<ItemProviderProps> = ({ children }) => {
    const { token } = useContext(AuthContext);

    const [state, dispatch] = useReducer(reducer, initialState);
    const { items, fetching, fetchingError, saving, savingError } = state;

    useEffect(getItemsEffect, [token]);
    useEffect(wsEffect, [token, items]);

    const saveItem = useCallback<SaveItemFn>(saveItemCallback, [token]);
    const value = { items, fetching, fetchingError, saving, savingError, saveItem };

    log('returns');
    return (
        <ItemContext.Provider value={value}>
            {children}
        </ItemContext.Provider>
    );

    function getItemsEffect() {
        let canceled = false;

        if (token) {
            fetchItems();
        }

        return () => {
            canceled = true;
        }

        async function fetchItems() {
            try {
                log('fetchItems started');
                dispatch({ type: FETCH_ITEMS_STARTED });
                const items = await getItems(token);

                await Preferences.set({ key: 'books', value: JSON.stringify(items) });

                // asteapta
                await new Promise(resolve => setTimeout(resolve, 60));

                log('fetchItems succeeded');
                if (!canceled) {
                    dispatch({ type: FETCH_ITEMS_SUCCEEDED, payload: { items } });
                }

            } catch (error) {
                log('fetchItems failed');
                if (!canceled) {
                    dispatch({ type: FETCH_ITEMS_FAILED, payload: { error } });
                }
            }
        }
    }

    async function saveItemCallback(item: ItemProps) {
        try {
            log('saveItem started');
            dispatch({ type: SAVE_ITEM_STARTED });

            const savedItem = await (createItem(token, item));

            log('saveItem succeeded');
            dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { item: savedItem } });

        } catch (error) {
            log('saveItem failed');
            dispatch({ type: SAVE_ITEM_FAILED, payload: { error } });
        }
    }

    function wsEffect() {
        let cancelled = false;
        log('wsEffect - connecting');

        let closeWebSocket: (() => void) | undefined;

        if (token?.trim()) {
            closeWebSocket = newWebSocket(token, message => {
                if (cancelled) {
                    return;
                }

                const { type, payload: item } = message;
                log(`ws message, item ${type}`);

                if (type === 'created') {
                    if (items) {
                        const array = [...items];
                        const index = array.findIndex(b => b.id === item.id);
                        if (index === -1) {
                            array.splice(array.length, 0, item);
                        } else {
                            array[index] = item;
                        }

                        Preferences.set({ key: 'books', value: JSON.stringify(array) });
                    }

                    dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { item } });
                }
            });
        }

        return() => {
            log('wsEffect - disconnecting');
            cancelled = true;
            closeWebSocket?.();
        }
    }
};
