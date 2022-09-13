import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { OrderCancelledEvent } from "@frst-ticket-app/common";
import { Ticket } from "../../../models/ticket";
import mongoose from "mongoose";

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const orderId = new mongoose.Types.ObjectId().toHexString();
    const ticket = Ticket.build({
        title: 'asdf',
        price: 432,
        userId: 'fasdf',
    });
    ticket.set({ orderId });
    await ticket.save();

    const data: OrderCancelledEvent['data'] = { 
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id
        }
    };
    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { msg, data, ticket, orderId, listener };
}

test('should update the ticket', async () => { 
    const { msg, data, ticket, orderId, listener } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).not.toBeDefined();
});

test('should ack the message', async () => { 
    const { msg, data, ticket, orderId, listener } = await setup();

    await listener.onMessage(data, msg);
    
    expect(msg.ack).toHaveBeenCalled();
});

test('should publish ticket updated event', async () => { 
    const { msg, data, ticket, orderId, listener } = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const ticketUpdated = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(ticketUpdated.orderId).not.toBeDefined();
});