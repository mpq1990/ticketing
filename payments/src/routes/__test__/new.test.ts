import { OrderState } from '@mpqticket/common';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';

jest.mock('../../stripe');

it('returns a 404 when purchasing an order that does not exists', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'asdf',
      orderId: mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it('returns a 401 when purchasing an order that doesnt belong to that user', async () => {
  const order = await Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    version: 1,
    price: 20,
    userId: 'asdf',
    status: OrderState.Created,
  });

  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'asdf',
      orderId: order.id,
    })
    .expect(401);
});

it('returns a 400 when purchasing a cancelled order', async () => {
  const userId = mongoose.Types.ObjectId().toHexString();

  const order = await Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    version: 1,
    price: 20,
    userId: userId,
    status: OrderState.Cancelled,
  });

  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'asdf',
      orderId: order.id,
    })
    .expect(400);
});

it('returns a 200 with valid inputs', async () => {
  const userId = mongoose.Types.ObjectId().toHexString();

  const order = await Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    version: 1,
    price: 20,
    userId: userId,
    status: OrderState.Created,
  });

  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201);

  const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];

  expect(chargeOptions.source).toEqual('tok_visa');
  expect(chargeOptions.amount).toEqual(2000);
  expect(chargeOptions.currency).toEqual('usd');

  const payment = await Payment.findOne({
    orderId: order.id,
  });

  expect(payment).not.toBeUndefined();
});
