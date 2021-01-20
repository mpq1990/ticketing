import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket, TicketDoc } from '../../models/ticket';

const buildTicket = async (event: string) => {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
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

it('should not allow an unauthenticated user to get order list', async () => {
  await request(app).get('/api/orders').send().expect(401);
});

it('should return empty when no Orders present', async () => {
  const response = await request(app)
    .get('/api/orders')
    .set('Cookie', global.signin())
    .send()
    .expect(200);

  expect(response.body).toEqual([]);
});

it('returns orders that belong to the user', async () => {
  const ticketOne = await buildTicket('concert');
  const ticketTwo = await buildTicket('museum');
  const ticketThree = await buildTicket('basketball');

  const userOne = global.signin();
  const userTwo = global.signin();

  await buildOrder(userOne, ticketOne);
  await buildOrder(userTwo, ticketTwo);
  await buildOrder(userTwo, ticketThree);

  const responseOne = await request(app)
    .get('/api/orders')
    .set('Cookie', userOne)
    .send()
    .expect(200);

  expect(responseOne.body.length).toEqual(1);
  expect(responseOne.body[0].ticket.title).toEqual(ticketOne.title);

  const responseTwo = await request(app)
    .get('/api/orders')
    .set('Cookie', userTwo)
    .send()
    .expect(200);

  expect(responseTwo.body.length).toEqual(2);
  expect(responseTwo.body[0].ticket.title).toEqual(ticketTwo.title);
  expect(responseTwo.body[1].ticket.title).toEqual(ticketThree.title);
});
