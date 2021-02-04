import { Subjects } from './subjects';

export interface ExpirationCompleteEvent {
  subjects: Subjects.ExpirationComplete;
  data: {
    orderId: string;
  };
}
