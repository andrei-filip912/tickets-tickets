import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
    validateRequest,
    NotFoundError,
    requireAuth,
    UnauthorizedError,
    BadRequestError
} from '@frst-ticket-app/common';
import { Ticket } from '../models/ticket';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put('/api/tickets/:id', requireAuth, [
    body('title')
        .not()
        .isEmpty()
        .withMessage('Title is required'),
    body('price')
        .isFloat({ gt: 0 })
        .withMessage('Please provide a price greater than 0'),
    body('date')
        .not()
        .isEmpty()
        .withMessage('Date is required'),
    body('location')
        .not()
        .isEmpty()
        .withMessage('Location is required'),
],
    validateRequest,
    async (req: Request, res: Response) => {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            throw new NotFoundError();
        }

        if (ticket.orderId) {
            throw new BadRequestError('The ticket cannot be edited, since it already is reserved');
        }

        if (ticket.userId !== req.currentUser!.id) {
            throw new UnauthorizedError();
        }

        ticket.set({
            title: req.body.title,
            price: req.body.price,
            date: req.body.date,
            location: req.body.location,
            description: req.body.description
        });
        await ticket.save();
        new TicketUpdatedPublisher(natsWrapper.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            date: ticket.date,
            location: ticket.location,
            description: ticket.description,
            userId: ticket.userId,
            version: ticket.version
        })
        res.send(ticket);
    });

export { router as updateTicketRouter };