import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { OrderState } from '@mpqticket/common';

it('should not allow an unauthenticated user to create an order', async () => {
  await request(app).post('/api/orders').send({}).expect(401);
});

it('should respond with bad request when ticket id not in the body', async () => {
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({})
    .expect(400);
});

it('should respond with not found error when ticket does not exist', async () => {
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      ticketId: mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it('returns an error if the ticket is already reserved', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
  });
  await ticket.save();

  const order = Order.build({
    ticket,
    userId: 'abcdefghi',
    status: OrderState.Created,
    expiresAt: new Date(),
  });
  await order.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(400);
});

it('reserves a ticket', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
  });
  await ticket.save();

  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  expect(response.body.ticket.title).toEqual('concert');
});

it.todo('emits an order created event');
