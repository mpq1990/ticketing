import { Subjects } from './subjects';
import { OrderState } from './types/order-status';

export interface OrderCancelledEvent {
  subject: Subjects.OrderCancelled;
  data: {
    id: string;
    ticket: {
      id: string;
    };
  };
}
