import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';

const start = async ()  => {
    if(! process.env.JWT_KEY){
        throw new Error('JWT_KEY must be defined')
    }

    if(! process.env.MONGO_URI){
        throw new Error('MONGO_URI must be defined')
    }
    
    try {
        await natsWrapper.connect('ticketing', 'gasdgas', 'http://nats-srv:4222');
        natsWrapper.client.on('close', () => {
            console.log('Nats connection closed');
    
            process.exit();
        });
        
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

        await mongoose.connect(process.env.MONGO_URI);
    } catch (error) {
        console.error(error);
    }
    app.listen(3000, ()  => {
        console.log('Listening to 3000 !!!!!');
    });
}

start();