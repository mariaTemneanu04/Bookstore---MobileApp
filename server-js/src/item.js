import Router from "koa-router";
import {bookStore} from "./store.js";
import {broadcast} from "./websocket.js";

export const bookRouter = new Router();

bookRouter.get('/', async (ctx) => {
    const userId = ctx.state.user._id;
    const books = await bookStore.find({ userId });
    books.forEach(book => book.id = book.id.toString());
    // make each book isAvailable a boolean
    books.forEach(book => {
        book.isAvailable = book.isAvailable === 1 || book.isAvailable === true || book.isAvailable === 'true';
    });

    ctx.response.body = books;
    ctx.response.status = 200;
});

const createBook = async (ctx, book, response) => {
    try {
        book.userId = ctx.state.user._id;
        const bookToLog = { ...book };
        console.log(bookToLog);
        const newBook = await bookStore.insert(book);
        const newBookToLog = { ...newBook };
        console.log(newBookToLog);
        response.body = newBook;
        response.status = 201;
        broadcast(book.userId, { type: 'created', payload: newBook });
    } catch (err) {
        console.log(err);
        response.body = { message: err.message };
        response.status = 400;
    }
};

bookRouter.post('/', async (ctx) => {
    await createBook(ctx, ctx.request.body, ctx.response);
});

bookRouter.get('/authors', async (ctx) => {
    try {
        ctx.response.body = await bookStore.getAuthors();
        ctx.response.status = 200;
    } catch (err) {
        console.error('Error fetching authors', err);
        ctx.response.status = 500;
        ctx.response.body = { message: 'Internal Server Error' };
    }
});

bookRouter.put('/edit/:id', async (ctx) => {
    const book = ctx.request.body;
    const id = ctx.params.id;
    const bookId = book.id;
    const response = ctx.response;
    if (bookId && bookId !== id) {
        response.body = { message: 'Param id and body _id should be the same' };
        response.status = 400; // bad request
        return;
    }
    if (!bookId || bookId < 0) {
        await createBook(ctx, book, response);
    } else {
        book.userId = ctx.state.user._id;
        const updated = await bookStore.update({ id: parseInt(id) }, book);
        if (updated === 1) {
            response.body = book;
            response.status = 200;
            broadcast(book.userId, { type: 'updated', payload: book });
        } else {
            response.body = { message: `book with id ${bookId} not found` };
            response.status = 405;
        }
    }
});