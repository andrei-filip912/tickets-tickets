import { Publisher, Subjects, TicketCreatedEvent } from "@frst-ticket-app/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    subject : Subjects.TicketCreated = Subjects.TicketCreated;
};