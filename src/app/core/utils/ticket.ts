import { Booking, TicketData, Trip } from '../models';

export interface TicketPayload {
  data: TicketData;
  encoded: string;
}

export function buildTicketData(
  booking: Booking,
  trip: Trip,
  from: string,
  to: string,
  passenger: string,
): TicketData {
  return {
    bookingId: booking.id,
    seatNumber: booking.seatNumber,
    passenger,
    from,
    to,
    departureAt: trip.departureAt,
    amount: booking.amount,
    status: booking.status,
  };
}

/**
 * Sérialise un billet de façon déterministe : un même billet produit
 * toujours la même chaîne, ce qui rend le QR code stable.
 */
export function encodeTicket(data: TicketData): string {
  return JSON.stringify([
    'IVOIREBUS',
    data.bookingId,
    data.seatNumber,
    data.passenger,
    data.from,
    data.to,
    data.departureAt,
    data.amount,
    data.status,
  ]);
}

/**
 * Retourne le billet et sa charge utile QR pour une réservation confirmée.
 * Une réservation annulée ne produit aucun billet valide (retourne null).
 */
export function ticketForBooking(
  booking: Booking,
  trip: Trip,
  from: string,
  to: string,
  passenger: string,
): TicketPayload | null {
  if (booking.status !== 'CONFIRMEE') {
    return null;
  }
  const data = buildTicketData(booking, trip, from, to, passenger);
  return { data, encoded: encodeTicket(data) };
}
