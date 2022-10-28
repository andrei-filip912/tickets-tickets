import mongoose, { Mongoose } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

// interface that describes a Ticket's properties types
interface TicketAttributes {
    title: string;
    price: number;
    date: Date;
    location: string;
    description?: string;
    userId: string;
}

// interface that describes the types of a ticket document
interface TicketDocument extends mongoose.Document {
    title: string;
    price: number;
    date: Date;
    location: string;
    description?: string;
    userId: string;
    version: number;
    orderId?: string;
}

// interface that defines param and return types for a model build method
interface TicketModel extends mongoose.Model<TicketDocument> {
    build(attr: TicketAttributes): TicketDocument;
}

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    description : {
        type: String
    },
    userId: {
        type: String,
        required: true
    },
    orderId: {
        type: String
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

// updateIfCurrent plugin
ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (attr: TicketAttributes) => {
    return new Ticket(attr);
}

const Ticket = mongoose.model<TicketDocument, TicketModel>('Ticket', ticketSchema);

export { Ticket };

