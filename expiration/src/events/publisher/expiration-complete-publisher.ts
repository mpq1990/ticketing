import {
  Publisher,
  Subjects,
  ExpirationCompleteEvent,
} from '@mpqticket/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
