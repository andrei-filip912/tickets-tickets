import express from 'express';
require('express-async-errors');    // required for handling async error,  without this request gets stuck in loop
import { errorHandler, NotFoundError, currentUser } from '@frst-ticket-app/common';
import mongoose from 'mongoose';
import cookieSession from 'cookie-session';

import { createTicketRouter } from './routes/new';
import { showTicketRouter} from './routes/show';
import { indexTicketRouter } from './routes';
import { updateTicketRouter } from './routes/update';

const app = express();
app.set('trust proxy', true);   // add to trust the nginx proxy
app.use(express.json());
// cookie session has to be run before currentUser
app.use(
    cookieSession({
    signed: false,  // disable encryption
    // true value allows https.
    secure: false
    })
);
app.use(currentUser);

app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter);

// throw exception for all path unmatched requests
app.all('*', async () => {
    throw new NotFoundError();
})

app.use(errorHandler);

export { app };