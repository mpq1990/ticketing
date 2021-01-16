import express, { Request, Response } from 'express';

import {
  NotAuthorizedError,
  NotFoundError,
  OrderState,
  requireAuth,
} from '@mpqticket/common';
import { Order } from '../models/order';

const router = express.Router();

router.delete(
  '/api/orders/:id',
  requireAuth,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id).populate('ticket');

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    order.status = OrderState.Cancelled;
    order.save();

    res.status(204).send({});
  }
);

export { router as deleteOrderRouter };
