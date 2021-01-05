import request from 'supertest';
import { app } from '../../app';
import mongoose, { mongo } from 'mongoose';
import { Ticket } from '../../models/ticket';

it('returns a 404 if the provided id does not exists', async () => {
  const id = mongoose.Types.ObjectId();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'title',
      price: 20,
    })
    .expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
  const id = mongoose.Types.ObjectId();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'title',
      price: 20,
    })
    .expect(401);
});

it('returns a 401 if the user does not own the ticket', async () => {
  const ticket1Response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'title 1',
      price: 20,
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${ticket1Response.body.id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'title2',
      price: 20,
    })
    .expect(401);
});

it('returns a 400 if the user provides an invalid title or price', async () => {
  const cookie = global.signin();

  const ticket1Response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'title 1',
      price: 20,
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${ticket1Response.body.id}`)
    .set('Cookie', cookie)
    .send({
      price: 20,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${ticket1Response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: '',
      price: 20,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${ticket1Response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'title 2',
      price: -20,
    })
    .expect(400);
});

it('updates the ticket with valid payload', async () => {
  const cookie = global.signin();

  const ticket1Response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'title 1',
      price: 20,
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${ticket1Response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'title 2',
      price: 20,
    })
    .expect(200);

  const ticket = await Ticket.findById(ticket1Response.body.id);
  expect(ticket!.title).toEqual('title 2');
});
