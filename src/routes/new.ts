import express, { Request, Response } from 'express';
import { requireAuth, validateRequest } from '@frst-ticket-app/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post('/api/tickets', requireAuth, [
    body('title')
        .not()
        .isEmpty()
        .withMessage('Title is required'),
    body('price')
        .isFloat({ gt: 0 }) // check for val > 0
        .withMessage('Price must be > 0'),
    body('date')
        .not()
        .isEmpty()
        .withMessage('Date is required')
        .custom(value => {
            const date = new Date(value)
            if(date < new Date()) {
                throw new Error('Date cannot be in the past');
            }
            return true;
        }),
    body('location')
        .not()
        .isEmpty()
        .withMessage('Location is required'),
], validateRequest,

    async (req: Request, res: Response) => {
        const { title, price, date, location, description } = req.body;
        const ticket = Ticket.build({
            title,
            price,
            date,
            location,
            description,
            userId: req.currentUser!.id
        });
        await ticket.save();
        new TicketCreatedPublisher(natsWrapper.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            date: ticket.date,
            location: ticket.location,
            description: ticket.description,
            userId: ticket.userId,
            version: ticket.version
        })
        res.status(201).send(ticket);
    });

export { router as createTicketRouter }