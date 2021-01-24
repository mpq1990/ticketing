import express, { Request, Response } from 'express';
import {
  BadRequestError,
  NotFoundError,
  OrderState,
  requireAuth,
  validateRequest,
} from '@mpqticket/common';
import mongoose, { Mongoose } from 'mongoose';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

const router = express.Router();

router.post(
  '/api/orders',
  requireAuth,
  [
    body('ticketId')
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('Ticket id must be provided'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    // Find the ticket
    const { ticketId } = req.body;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }

    // Ticket is not already reserved
    if (await ticket.isReserved()) {
      throw new BadRequestError('Ticket is already reserved');
    }

    // Calculate an expiration date
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // Build and save the order
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderState.Created,
      expiresAt: expiration,
      ticket: ticket,
    });

    await order.save();

    // Publish an event that order was created
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      state: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      version: order.version,
      ticket: {
        id: ticketId,
        price: ticket.price,
      },
    });

    res.status(201).send(order);
  }
);

export { router as createOrderRouter };
