import request from 'supertest';
import { app } from '../../app';

it('it responds with details about the current user', async () => {
  const cookie = await global.signin();

  const response = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie)
    .send()
    .expect(201);

  expect(response.body.currentUser.email).toEqual('test@test.de');
});

it('it responds with unauthorized if not signed in', async () => {
  const response = await request(app)
    .get('/api/users/currentuser')
    .send()
    .expect(401);
});
