import {getLogger} from "../utils";
import {ItemProps} from "../components/ItemProps";
import React, {useCallback, useContext, useEffect, useReducer} from "react";
import PropTypes from "prop-types";
import {createItem, getItems, newWebSocket} from "../rest/itemApi";
import {Preferences} from '@capacitor/preferences';
import {AuthContext} from "./AuthProvider";
import {useNetwork} from "../hooks/useNetwork";

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
    (state, {type, payload}) => {
        switch (type) {
            case FETCH_ITEMS_STARTED:
                return {...state, fetching: true, fetchingError: null};
            case FETCH_ITEMS_SUCCEEDED:
                return {...state, items: payload.items, fetching: false};
            case FETCH_ITEMS_FAILED:
                return {...state, fetchingError: payload.error, fetching: false};
            case SAVE_ITEM_STARTED:
                return {...state, savingError: null, saving: true};
            case SAVE_ITEM_SUCCEEDED: {
                const items = [...(state.items || [])];
                const item = payload.item;
                const index = items.findIndex(b => b.id === item.id);

                if (index === -1) {
                    items.splice(items.length, 0, item);
                } else {
                    items[index] = item;
                }

                log('books in SAVE_BOOK_SUCCEEDED:', items);
                return {...state, items, savingError: null, saving: false};
            }
            case SAVE_ITEM_FAILED:
                return {...state, savingError: payload.error, saving: false};
            default:
                return state;
        }
    };

export const ItemContext = React.createContext<ItemsState>(initialState);

interface ItemProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const ItemProvider: React.FC<ItemProviderProps> = ({children}) => {
    const {token} = useContext(AuthContext);
    const {networkStatus} = useNetwork();

    const [state, dispatch] = useReducer(reducer, initialState);
    const {items, fetching, fetchingError, saving, savingError} = state;

    useEffect(getItemsEffect, [token]);
    useEffect(wsEffect, [token, items]);

    const saveItem = useCallback<SaveItemFn>(saveItemCallback, [token, networkStatus]);
    const value = {items, fetching, fetchingError, saving, savingError, saveItem};

    useEffect(() => {
        if (networkStatus.connected) {
            log('Went online → syncing items');
            syncItems();
        }
    }, [networkStatus.connected]);

    log('returns');
    return (
        <ItemContext.Provider value={value}>
            {children}
        </ItemContext.Provider>
    );

    function syncItems() {
        log('syncBooks - networkStatus.connected', networkStatus.connected);
        log('syncBooks - networkStatus.shouldSync', networkStatus.shouldSync);

        if (networkStatus.connected && networkStatus.shouldSync === 'disconnected') {
            syncItemsCallback();
        }

        async function syncItemsCallback() {
            const localItems = await Preferences.get({ key: 'books' });
            log('localItems:', localItems);

            if (localItems.value) {
                let itemsArray: ItemProps[] = JSON.parse(localItems.value);
                const dirtyItems = itemsArray.some((b) => b?.dirty?.valueOf() === true);

                if (dirtyItems) {

                    for (let item of itemsArray) {
                        try {
                            if (item?.dirty?.valueOf() === true) {
                                item = { ...item, dirty: false };

                                const saved = await saveItem(item);

                                if (item.id && saved.id) {
                                    if (parseFloat(item.id) < 0) {
                                        itemsArray = itemsArray.filter((b) => b.id !== item.id);
                                        itemsArray.push(saved);
                                    }

                                    else {
                                        const index = itemsArray.findIndex((b) => b.id === item.id);
                                        if (index !== -1) {
                                            itemsArray[index] = saved;
                                        }
                                    }
                                }
                            }

                        } catch (error) {
                            log('Error syncing book:', error);
                        }
                    }

                    Preferences.set({key: 'books', value: JSON.stringify(itemsArray)});
                    dispatch({type: FETCH_ITEMS_SUCCEEDED, payload: {items: itemsArray}});
                    // if (token) {
                    //     log('Fetching updated items from server after sync...');
                    //     const refreshedItems = await getItems(token);
                    //
                    //     await Preferences.set({ key: 'books', value: JSON.stringify(refreshedItems) });
                    //     dispatch({ type: FETCH_ITEMS_SUCCEEDED, payload: { items: refreshedItems } });
                    //
                    //     log('Books successfully refreshed after sync.');
                    // }

                }
            }
        }
    }

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
                dispatch({type: FETCH_ITEMS_STARTED});
                let items = await getItems(token);

                const dirty = false;
                items = items.map((i: ItemProps) => {
                    return { ...i, dirty: dirty };
                });

                await Preferences.set({key: 'books', value: JSON.stringify(items)});

                // asteapta
                await new Promise(resolve => setTimeout(resolve, 60));

                log('fetchItems succeeded');
                if (!canceled) {
                    dispatch({type: FETCH_ITEMS_SUCCEEDED, payload: {items}});
                }

            } catch (error) {
                log('fetchItems failed');
                if (!canceled) {
                    dispatch({type: FETCH_ITEMS_FAILED, payload: {error}});
                }
            }
        }
    }

    async function saveItemCallback(item: ItemProps) {
        try {
            if (networkStatus.connected) {
                log('saveItem started');
                dispatch({type: SAVE_ITEM_STARTED});

                const savedItem = await createItem(token, item);

                log('saveItem succeeded');
                dispatch({type: SAVE_ITEM_SUCCEEDED, payload: {item: savedItem}});

                return savedItem;
            } else {
                log('saveItem failed > store the item in local storage');

                const itemId = item.id ? item.id : (-(Math.random() * 1000000)).toString();
                const itemToSave = {...item, id: itemId, dirty: true};
                const items = await Preferences.get({key: 'books'});

                let itemsArray: ItemProps[] = [];
                if (items.value) {
                    itemsArray = JSON.parse(items.value);
                }

                const index = itemsArray.findIndex(b => b.id === itemToSave.id);
                if (index !== -1) {
                    itemsArray[index] = itemToSave;
                } else {
                    itemsArray.push(itemToSave);
                }

                await Preferences.set({key: 'books', value: JSON.stringify(itemsArray)});

                alert("You are offline. The book was saved locally and will be uploaded when you're back online.");

                const error = {message: "The book could not be save on the server right now, but it will be as soon as you are back online!"};
                dispatch({type: SAVE_ITEM_FAILED, payload: {error}});
            }

        } catch (error) {
            log('saveItem failed');
            dispatch({type: SAVE_ITEM_FAILED, payload: {error}});
        }
    }

    function wsEffect() {
        let cancelled = false;
        log('wsEffect - connecting');

        let closeWebSocket: (() => void) | undefined;

        if (token?.trim()) {
            closeWebSocket = newWebSocket(token, async message => {
                if (cancelled) {
                    return;
                }

                const {type, payload: item} = message;
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

                        Preferences.set({key: 'books', value: JSON.stringify(array)});
                    }

                    dispatch({type: SAVE_ITEM_SUCCEEDED, payload: {item}});
                }
            });
        }

        return () => {
            log('wsEffect - disconnecting');
            cancelled = true;
            closeWebSocket?.();
        }
    }
};
