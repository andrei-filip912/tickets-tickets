import request from "supertest";
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from "../../nats-wrapper";

test('has a route handler listening to /api/tickets for post requests', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .send({});

    expect(response.status).not.toEqual(404);
});

test('can only be accessed by a signed in user', async () => {
    await request(app)
        .post('/api/tickets')
        .send({})
        .expect(401);
});

test('returns a status different from 401', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({});

    expect(response.status).not.toEqual(401);
});

test('returns error if invalid title is provided', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: '',
            price: 10,
            date: new Date(),
            location: 'somewhere',
            descriptiom: 'fsdfs'
        })
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            price: 10
        })
        .expect(400);
});

test('returns an error if invalid price is provided', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'fasdf',
            price: -312,
            date: new Date(),
            location: 'somewhere'
        })
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: '',
        })
        .expect(400);

});

test('returns an error if invalid date is provided', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'fasdf',
            price: -312,
            date: 'fsd',
            location: 'somewhere'
        })
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: '',
        })
        .expect(400);

});

test('returns an error if invalid location is provided', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'fasdf',
            price: -312,
            date: new Date(),
            location: 234
        })
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: '',
        })
        .expect(400);

});

test('creates ticket with valid inputs', async () => {
    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);

    const mockTicket = {
        title: 'asdfasd',
        price: 20,
        date: new Date(),
        location: 'somewhere',
        description: 'fasd'
    };
    // add save ticket check
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: mockTicket.title,
            price: mockTicket.price,
            date: mockTicket.date,
            location: mockTicket.location
        })
        .expect(201);

    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
});

test('publishes an event', async () => {
    const mockTicket = {
        title: 'asdfasd',
        price: 20,
        date: new Date(),
        location: 'somewhere'
    };
    // add save ticket check
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: mockTicket.title,
            price: mockTicket.price,
            date: mockTicket.date,
            location: mockTicket.location
        })
        .expect(201);
    expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);
});
