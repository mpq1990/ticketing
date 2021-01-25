import { Message } from 'node-nats-streaming';
import { Subjects, Listener, TicketUpdatedEvent } from '@mpqticket/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;
  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    const { title, price } = data;
    // const { title, price, version } = data;
    const ticket = await Ticket.findByEvent(data);

    console.log('found the ticket', ticket);

    if (!ticket) {
      return console.error('Ticket not found!');
    }

    ticket.set({
      title,
      price,
    });

    // ticket.set({
    //   title,
    //   price,
    //   version
    // });

    await ticket.save();

    msg.ack();
  }
}
