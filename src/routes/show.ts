import { NotFoundError, validateRequest } from '@frst-ticket-app/common';
import express, {Request, Response} from 'express';
import { Ticket } from '../models/ticket';
import { param } from 'express-validator';
import { Types as MongooseTypes} from 'mongoose';

const router = express.Router();

router.get('/api/tickets/:id', [
        param('id')
            .custom((idVal) => MongooseTypes.ObjectId.isValid(idVal))
            .withMessage('The id must be a valid MongoDB ObjectId'),
    ],
    validateRequest, 
    async (req :Request, res : Response) => {
    // params is used as 
    const ticket = await Ticket.findById(req.params.id);

    if(!ticket){
        throw new NotFoundError();
    }

    res.send(ticket);
})

export { router as showTicketRouter}