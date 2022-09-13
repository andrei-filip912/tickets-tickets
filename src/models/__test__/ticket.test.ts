import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async () => {
    // create instance of ticket
    const ticket = Ticket.build({
        title: 'concert',
        price: 40,
        userId: '123'
    });

    // save to db
    await ticket.save();

    // fetch ticket twice
    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);

    // make 2 separate changes to the tickets we fetched
    firstInstance!.set({ price: 10 });
    secondInstance!.set({ price: 15 });

    //save the first fetched ticket
    await firstInstance!.save();

    // save the second fetched ticket expect error
    try{
        await secondInstance!.save();
    } catch(err) {
        return;
    }

    throw new Error('Should not reach this point');
    // did not work
    // expect(async () => {await secondInstance!.save()}).toThrowError();
});

test('increments version number on successive saves', async () => {
   const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        userId: '523'
   });

   await ticket.save();
   expect(ticket.version).toEqual(0);

   await ticket.save();
   expect(ticket.version).toEqual(1);
});