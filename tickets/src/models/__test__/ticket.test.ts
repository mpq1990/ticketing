import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async (done) => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 12,
    userId: 'abc',
  });

  await ticket.save();

  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 15 });

  await firstInstance!.save();

  try {
    await secondInstance!.save();
  } catch (err) {
    return done();
  }

  throw new Error('Should not reach this point');
});

it('increments the version number on multiple saves', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 12,
    userId: 'abc',
  });

  await ticket.save();

  expect(ticket.version).toEqual(0);

  const firstInstance = await Ticket.findById(ticket.id);
  firstInstance!.set({ price: 10 });
  await firstInstance!.save();
  expect(firstInstance!.version).toEqual(1);

  const secondInstance = await Ticket.findById(ticket.id);
  secondInstance!.set({ price: 15 });
  await secondInstance!.save();
  expect(secondInstance!.version).toEqual(2);

  const thirdInstance = await Ticket.findById(ticket.id);
  expect(thirdInstance!.version).toEqual(2);
});
