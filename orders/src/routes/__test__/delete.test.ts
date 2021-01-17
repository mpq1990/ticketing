import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Ticket, TicketDoc } from '../../models/ticket';
import { Order } from '../../models/order';
import { OrderState } from '@mpqticket/common';
import { natsWrapper } from '../../nats-wrapper';

const buildTicket = async (event: string) => {
  const ticket = Ticket.build({
    title: event,
    price: 20,
  });
  await ticket.save();
  return ticket;
};

const buildOrder = async (user: any, ticket: TicketDoc) => {
  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  return response.body;
};

it('should not allow an unauthenticated user to delete an order', async () => {
  await request(app)
    .delete(`/api/orders/${mongoose.Types.ObjectId().toHexString()}`)
    .send()
    .expect(401);
});

it('should not allow an authenticated user to delete an order belonging to another user', async () => {
  const ticketOne = await buildTicket('concert');
  const ticketTwo = await buildTicket('museum');

  const userOne = global.signin();
  const userTwo = global.signin();

  const orderOne = await buildOrder(userOne, ticketOne);
  await buildOrder(userTwo, ticketTwo);

  const response = await request(app)
    .delete(`/api/orders/${orderOne.id}`)
    .set('Cookie', userTwo)
    .send()
    .expect(401);
});

it('should send back a not found error if order not present', async () => {
  const response = await request(app)
    .delete(`/api/orders/${mongoose.Types.ObjectId()}`)
    .set('Cookie', global.signin())
    .send()
    .expect(404);
});

it('should allow an authenticated user to delete an order belonging to them', async () => {
  const ticketOne = await buildTicket('concert');
  const ticketTwo = await buildTicket('museum');

  const userOne = global.signin();
  const userTwo = global.signin();

  const orderOne = await buildOrder(userOne, ticketOne);
  await buildOrder(userTwo, ticketTwo);

  const response = await request(app)
    .delete(`/api/orders/${orderOne.id}`)
    .set('Cookie', userOne)
    .send()
    .expect(204);

  const updatedOrder = await Order.findById(orderOne.id);
  expect(updatedOrder!.status).toEqual(OrderState.Cancelled);
});

it('publishes an event of order cancel', async () => {
  const ticketOne = await buildTicket('concert');
  const ticketTwo = await buildTicket('museum');

  const userOne = global.signin();
  const userTwo = global.signin();

  const orderOne = await buildOrder(userOne, ticketOne);
  await buildOrder(userTwo, ticketTwo);

  const response = await request(app)
    .delete(`/api/orders/${orderOne.id}`)
    .set('Cookie', userOne)
    .send()
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
