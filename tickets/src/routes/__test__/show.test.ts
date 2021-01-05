import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

it('returns a 404 if thee ticket is not found', async () => {
  await request(app)
    .get(`/api/tickets/${mongoose.Types.ObjectId()}`)
    .send()
    .expect(404);
});

it('returns the ticket if the ticket is found', async () => {
  const ticket = await request(app)
    .post('/api/tickets/')
    .set('Cookie', global.signin())
    .send({
      title: 'rave',
      price: 99,
    })
    .expect(201);

  const response = await request(app)
    .get(`/api/tickets/${ticket.body.id}`)
    .send()
    .expect(200);

  expect(response.body.title).toEqual('rave');
  expect(response.body.price).toEqual(99);
});
