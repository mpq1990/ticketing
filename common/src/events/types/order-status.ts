export enum OrderState {
  // When the order is created but the ticket is not reserved
  Created = 'created',

  // Ticket is already reserved or user cancels, order expires before payment
  Cancelled = 'cancelled',

  // successfully reserved the ticket
  AwaitingPayment = 'awaiting:payment',

  // order reserved and successful payment
  Complete = 'complete',
}
