import { Publisher, Subjects, TicketUpdatedEvent } from "@frst-ticket-app/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    subject : Subjects.TicketUpdated = Subjects.TicketUpdated;
};