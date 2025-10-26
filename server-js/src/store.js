import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

export class BookStore {
    constructor({ filename }) {
        this.filename = filename;
    }

    async init() {
        this.db = await open({
            filename: this.filename,
            driver: sqlite3.Database,
        });

        await this.db.run(`
        create table if not exists books (
            id integer primary key autoincrement,
            title varchar(100) not null,
            author varchar(100),
            published varchar(30),
            isAvailable integer,
            userId varchar(50)
        );`)
    }

    async find(props) {
        const { userId } = props;
        const rows = await this.db.all('select * from books where userId = ?', [userId]);
        return rows.map(b => ({
            ...b,
            available: !!b.isAvailable, // convert integer to boolean
        }));
    }


    async insert(book) {
        if (!book.title) {
            throw new Error('Book title cannot be empty');
        }

        const { title, author, published, available, userId } = book;

        await this.db.run(
        'insert into books (title, author, published, isAvailable, userId) values (?, ?, ?, ?, ?)',
            [title, author, published, available, userId]);

        const { lastID } = await this.db.get('select last_insert_rowid() as lastID');
        book.id = lastID.toString();

        return book;
    }

    async getAuthors() {
        const rows = await this.db.all(
            'select distinct author from books where author is not null order by author asc'
        );

        return rows.map(b => b.author);
    }
}

const bookStore = new BookStore({ filename: 'src\\bookstoredb.db' });
await bookStore.init();

export { bookStore };