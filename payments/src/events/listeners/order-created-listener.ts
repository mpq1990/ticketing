import { Listener, OrderCreatedEvent, Subjects } from '@mpqticket/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group.name';
import { Order } from '../../models/order';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  queueGroupName = queueGroupName;
  subject: Subjects.OrderCreated = Subjects.OrderCreated;

  async onMessage(data: OrderCreatedEvent['data'], message: Message) {
    const order = Order.build({
      id: data.id,
      price: data.ticket.price,
      status: data.state,
      userId: data.userId,
      version: data.version,
    });

    await order.save();

    message.ack();
  }
}
