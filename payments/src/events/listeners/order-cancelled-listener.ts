import {
  Listener,
  OrderCancelledEvent,
  OrderState,
  Subjects,
} from '@mpqticket/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group.name';
import { Order } from '../../models/order';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  queueGroupName = queueGroupName;
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;

  async onMessage(data: OrderCancelledEvent['data'], message: Message) {
    const order = await Order.findByEvent({
      id: data.id,
      version: data.version,
    });

    if (!order) {
      return console.error('Order not found', data.id);
    }

    order.set({ status: OrderState.Cancelled });
    await order.save();

    message.ack();
  }
}
