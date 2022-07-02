import mongoose, { Mongoose } from 'mongoose';
// interface that describes a Ticket's properties types
interface TicketAttributes {
    title: string;
    price: number;
    userId: string;
}

// interface that describes the types of a ticket document
interface TicketDocument extends mongoose.Document {
    title: string;
    price: number;
    userId: string;
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
    userId: {
        type: String,
        required: true
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

ticketSchema.statics.build = (attr: TicketAttributes) => {
    return new Ticket(attr);
}

const Ticket = mongoose.model<TicketDocument, TicketModel>('Ticket', ticketSchema);

export { Ticket };

