import { OrderCancelledEvent, OrderState } from '@mpqticket/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Order } from '../../../models/order';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    status: OrderState.Created,
    price: 10,
    userId: 'asdf',
    version: 0,
  });

  await order.save();

  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: 1,
    ticket: {
      id: 'asdf',
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return {
    listener,
    order,
    data,
    msg,
  };
};

it('creates an order item', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const cancelledOrder = await Order.findById(data.id);

  expect(cancelledOrder!.status).toEqual(OrderState.Cancelled);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
