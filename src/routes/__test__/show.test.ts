import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';


test('should return 404 if no ticket is found', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    const response = await request(app)
        .get(`/api/tickets/${id}`)
        .send()
        .expect(404);
    
});

// fix failing test
test('should return the actual ticket, if it exists', async () => {
    const title = 'concert';
    const price = 42;
    const date= new Date();
    const location = 'asd';

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: title,
            price: price,
            date: date,
            location: location
        })
        .expect(201);
    
    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send()
        .expect(200);

    expect(ticketResponse.body.title).toEqual(title);
    expect(ticketResponse.body.price).toEqual(price);
 });
