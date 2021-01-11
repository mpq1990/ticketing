import { Publisher, Subjects, TicketCreatedEvent } from '@mpqticket/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
