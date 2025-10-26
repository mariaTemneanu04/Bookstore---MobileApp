import axios from 'axios';
import {authConfig, getLogger} from "../utils";
import {ItemProps} from "../components/ItemProps";
import { withLogs, baseUrl } from "../utils";


const itemUrl = `http://${baseUrl}/api/book`;
const authorsUrl = `http://${baseUrl}/api/book/authors`;

export const getItems: (token: string) => Promise<ItemProps[]> = token => {
    return withLogs(axios.get(itemUrl, authConfig(token)), 'getItems');
}

export const createItem: (token: string, item: ItemProps) => Promise<ItemProps[]> = (token, item) => {
    return withLogs(axios.post(itemUrl, item, authConfig(token)), 'createItem');
}

export const getAuthors: (token: string) => Promise<string[]> = (token) => {
    return withLogs(axios.get(authorsUrl, authConfig(token)), 'getAuthors');
}

interface MessageData {
    type: string;
    payload: ItemProps;
}

const log = getLogger("websocket");

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
    try {
        const ws = new WebSocket(`ws://${baseUrl}`)
        ws.onopen = () => {
            log('web socket onopen');
            ws.send(JSON.stringify({ type: 'authorization', payload: { token } }));
        };
        ws.onclose = () => {
            log('web socket onclose');
        };
        ws.onerror = error => {
            log('web socket onerror', error);
        };
        ws.onmessage = messageEvent => {
            log('web socket onmessage', messageEvent.data);
            onMessage(JSON.parse(messageEvent.data));
        };
        return () => {
            log('web socket onclose PROBLEM HERE MAYBE???');
            ws.close();
        }
    }
    catch (error) {
        log('We are offline, so no ws can be established: ', error);
    }
}