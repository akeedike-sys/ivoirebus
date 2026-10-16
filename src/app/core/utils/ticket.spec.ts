import { Booking, Trip } from '../models';
import { encodeTicket, ticketForBooking } from './ticket';

const booking = (overrides: Partial<Booking> = {}): Booking => ({
  id: 'booking-1',
  tripId: 'trip-1',
  seatNumber: 12,
  userId: 'user-1',
  createdAt: '2030-06-01T10:00:00.000Z',
  status: 'CONFIRMEE',
  amount: 3000,
  ...overrides,
});

const trip: Trip = {
  id: 'trip-1',
  departureCityId: 'abidjan',
  arrivalCityId: 'bouake',
  departureAt: '2030-06-10T08:00:00.000Z',
  price: 3000,
  capacity: 40,
};

describe('ticket utils', () => {
  it('produit un contenu identique pour un même billet', () => {
    const payloadA = ticketForBooking(booking(), trip, 'Abidjan', 'Bouaké', 'Awa');
    const payloadB = ticketForBooking(booking(), trip, 'Abidjan', 'Bouaké', 'Awa');

    expect(payloadA).not.toBeNull();
    expect(payloadA?.encoded).toBe(payloadB?.encoded);
  });

  it('retourne null pour une réservation annulée', () => {
    expect(ticketForBooking(booking({ status: 'ANNULEE' }), trip, 'Abidjan', 'Bouaké', 'Awa')).toBeNull();
  });

  it('encode les données d’identification du billet', () => {
    const payload = ticketForBooking(booking(), trip, 'Abidjan', 'Bouaké', 'Awa');
    const encoded = payload ? encodeTicket(payload.data) : '';

    expect(encoded).toContain('booking-1');
    expect(encoded).toContain('Awa');
    expect(payload?.data.seatNumber).toBe(12);
  });
});
