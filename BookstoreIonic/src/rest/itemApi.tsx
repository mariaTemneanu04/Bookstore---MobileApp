import axios from 'axios';
import { ItemsProps } from '../components/useItems';
import {getLogger} from "../utils";

const baseUrl = 'http://localhost:8080';

export const getItems: () => Promise<ItemsProps[]> = () => {
    return axios
        .get(`${baseUrl}/api/bookstore/books`)
        .then(res => {
            return Promise.resolve(res.data);
        })
        .catch(err => {
            return Promise.reject(err);
        });
}

interface MessageData {
    type: string;
    payload: ItemsProps;
}

const log = getLogger("websocket");

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${baseUrl}`);
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
        log('web socket onmessage');
        onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
        ws.close();
    }
}