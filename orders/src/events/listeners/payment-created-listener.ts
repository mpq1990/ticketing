import {
  Listener,
  OrderState,
  PaymentCreatedEvent,
  Subjects,
} from '@mpqticket/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/order';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId);
    if (!order) {
      return console.error('order not found', data.orderId);
    }

    order.set({
      status: OrderState.Complete,
    });

    await order.save();
    msg.ack();
  }
}
