import { Listener, OrderCreatedEvent, Subjects } from "@frst-ticket-app/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        // find the ticket that the order is reserving
        const ticket = await Ticket.findById(data.ticket.id);

        // if no ticket, throw an error
        if(!ticket) {
            throw new Error('Ticket not found');
        }

        // mark ticket as reserved
        // this change will increment version number of ticket
        ticket.set({ orderId: data.id });

        // save the ticket
        await ticket.save();

        // this is required after version was incremented by setting orderId
        new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            price: ticket.price,
            title: ticket.title,
            date: ticket.date,
            location: ticket.location,
            description: ticket.description,
            userId: ticket.userId,
            orderId: ticket.orderId,
            version: ticket.version
        });

        // ack the msg
        msg.ack();
    }
};