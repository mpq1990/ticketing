import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Ticket, TicketDoc } from '../../models/ticket';

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

it('should not allow an unauthenticated user to view an order', async () => {
  await request(app)
    .get(`/api/orders/${mongoose.Types.ObjectId().toHexString()}`)
    .send()
    .expect(401);
});

it('should not allow an authenticated user to view an order belong to another user', async () => {
  const ticketOne = await buildTicket('concert');
  const ticketTwo = await buildTicket('museum');

  const userOne = global.signin();
  const userTwo = global.signin();

  const orderOne = await buildOrder(userOne, ticketOne);
  await buildOrder(userTwo, ticketTwo);

  const response = await request(app)
    .get(`/api/orders/${orderOne.id}`)
    .set('Cookie', userTwo)
    .send()
    .expect(401);
});

it('should allow an authenticated user to view an order belong to them', async () => {
  const ticketOne = await buildTicket('concert');
  const ticketTwo = await buildTicket('museum');

  const userOne = global.signin();
  const userTwo = global.signin();

  const orderOne = await buildOrder(userOne, ticketOne);
  await buildOrder(userTwo, ticketTwo);

  const response = await request(app)
    .get(`/api/orders/${orderOne.id}`)
    .set('Cookie', userOne)
    .send()
    .expect(200);

  expect(response.body.ticket.title).toEqual(ticketOne.title);
});
