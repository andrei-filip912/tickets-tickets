import request from "supertest";
import mongoose from "mongoose";
import { app } from '../../app';
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

const initialTicket = {
    title: 'asdf',
    price: 20
};

const newTicket = {
    title: 'new ticket',
    price: 9292
}

test('should return 404 if there is no ticket with the provided id',async() => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', global.signin())
        .send({
            title: 'fasdf',
            price: 66
        })
        .expect(404);
});

test('should return 401 if the user is not authenticated',async() => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .send({
            title: 'fasdf',
            price: 66
        })
        .expect(401);
});

test('should return 401 if the user does not own the ticket',async() => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: initialTicket.title,
            price: initialTicket.price
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', global.signin()) // signin generates a new id each time
        .send({
            title: newTicket.title,
            price: newTicket.price
        })
        .expect(401);
    const updatedTicket = await Ticket.findById(response.body.id);

    // comparing with initial title and price
    expect(updatedTicket!.title).toBe(initialTicket.title);
    expect(updatedTicket!.price).toBe(initialTicket.price);
});

test('should return 400 for invalid props(title, price)',async() => {
    const cookie = global.signin();

    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
        title: initialTicket.title,
        price: initialTicket.price
    });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: '',
            price: 20
        })
        .expect(400);
    
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'gasdf',
            price: -32
        })
        .expect(400);
});

test('should update the ticket',async() => {
    const cookie = global.signin();

    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
        title: initialTicket.title,
        price: initialTicket.price
    });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: newTicket.title,
            price: newTicket.price
        })
        .expect(200);
    
    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send();
    
    expect(ticketResponse.body.title).toEqual(newTicket.title);
    expect(ticketResponse.body.price).toEqual(newTicket.price);
});

test('should publish an event', async () => {
    const cookie = global.signin();

    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
        title: initialTicket.title,
        price: initialTicket.price
    });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: newTicket.title,
            price: newTicket.price
        })
        .expect(200);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});

test('should reject updates if the ticket is reserved', async () => {
    const cookie = global.signin();

    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
        title: initialTicket.title,
        price: initialTicket.price
    });
    
    const ticket = await Ticket.findById(response.body.id);
    ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
    await ticket!.save();

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: newTicket.title,
            price: newTicket.price
        })
        .expect(400);
});