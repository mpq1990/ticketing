import mongoose from 'mongoose';
import { TicketUpdatedEvent } from '@mpqticket/common';
import { Message } from 'node-nats-streaming';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  const listener = new TicketUpdatedListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });

  await ticket.save();

  const data: TicketUpdatedEvent['data'] = {
    version: ticket.version + 1,
    id: ticket.id,
    title: 'new concert',
    price: 100,
    userId: mongoose.Types.ObjectId().toHexString(),
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return {
    listener,
    data,
    msg,
  };
};

it('finds, updates and saves a ticket', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const ticket = await Ticket.findById(data.id);
  expect(ticket).toBeDefined();

  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it('it acks the message', async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  const ticket = await Ticket.findById(data.id);
  expect(ticket).toBeDefined();
  expect(msg.ack).toHaveBeenCalled();
});

it('it does not acks the message if version number is the same', async () => {
  const { listener, data, msg } = await setup();
  data.version = 0;
  await listener.onMessage(data, msg);
  expect(msg.ack).not.toHaveBeenCalled();
});

it('it does not acks the message if version number is in the future', async () => {
  const { listener, data, msg } = await setup();
  data.version = 3;
  await listener.onMessage(data, msg);
  expect(msg.ack).not.toHaveBeenCalled();
});
