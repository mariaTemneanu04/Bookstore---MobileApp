import axios from 'axios';
import { ItemsProps } from '../components/useItems';

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
