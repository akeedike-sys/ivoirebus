import { TestBed } from '@angular/core/testing';
import { BookingService } from './booking.service';
import { TripService } from './trip.service';

describe('BookingService', () => {
  let service: BookingService;
  let trips: TripService;

  const createTrip = (capacity = 5, hoursAhead = 24): string => {
    const trip = trips.create({
      departureCityId: 'abidjan',
      arrivalCityId: 'bouake',
      departureAt: new Date(Date.now() + hoursAhead * 3_600_000).toISOString(),
      price: 3500,
      capacity,
    });
    return trip.id;
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(BookingService);
    trips = TestBed.inject(TripService);
  });

  it('crée une réservation CONFIRMEE associée à l’utilisateur avec le montant du trajet', () => {
    const tripId = createTrip();

    const booking = service.createBooking(tripId, 1, 'user-1');

    expect(booking.status).toBe('CONFIRMEE');
    expect(booking.userId).toBe('user-1');
    expect(booking.amount).toBe(3500);
    expect(service.historyFor('user-1')).toHaveLength(1);
  });

  it('refuse la réservation d’un siège déjà occupé', () => {
    const tripId = createTrip();
    service.createBooking(tripId, 1, 'user-1');

    expect(() => service.createBooking(tripId, 1, 'user-2')).toThrow(
      'Ce siège a été réservé entre-temps',
    );
  });

  it('signale l’indisponibilité d’un siège et la disponibilité restante', () => {
    const tripId = createTrip(2);
    service.createBooking(tripId, 1, 'user-1');

    expect(service.isSeatAvailable(tripId, 1)).toBe(false);
    expect(service.isSeatAvailable(tripId, 2)).toBe(true);
    expect(service.occupiedSeats(tripId)).toEqual([1]);
    expect(service.availableSeats(trips.byId(tripId)!)).toBe(1);
  });

  it('trie l’historique du voyageur de la plus récente à la plus ancienne et exclut les autres', () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date('2030-06-01T08:00:00.000Z'));
      const tripId = createTrip(5);
      const first = service.createBooking(tripId, 1, 'user-1');
      vi.setSystemTime(new Date('2030-06-01T09:00:00.000Z'));
      const second = service.createBooking(tripId, 2, 'user-1');
      vi.setSystemTime(new Date('2030-06-01T10:00:00.000Z'));
      service.createBooking(tripId, 3, 'user-2');

      const history = service.historyFor('user-1');

      expect(history).toHaveLength(2);
      expect(history[0].id).toBe(second.id);
      expect(history[1].id).toBe(first.id);
      expect(history.every((item) => item.userId === 'user-1')).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('annule une réservation confirmée et libère le siège', () => {
    const tripId = createTrip();
    const booking = service.createBooking(tripId, 1, 'user-1');

    service.cancelBooking(booking.id, 'user-1');

    expect(service.byId(booking.id)?.status).toBe('ANNULEE');
    expect(service.isSeatAvailable(tripId, 1)).toBe(true);
  });

  it('refuse l’annulation après le départ du trajet', () => {
    const tripId = createTrip(5, -1);
    const booking = service.createBooking(tripId, 1, 'user-1');

    expect(() => service.cancelBooking(booking.id, 'user-1')).toThrow(
      'Le délai d’annulation est dépassé',
    );
  });

  it('refuse l’annulation d’une réservation déjà annulée', () => {
    const tripId = createTrip();
    const booking = service.createBooking(tripId, 1, 'user-1');
    service.cancelBooking(booking.id, 'user-1');

    expect(() => service.cancelBooking(booking.id, 'user-1')).toThrow(
      'Cette réservation est déjà annulée',
    );
  });

  it('refuse l’accès à la réservation d’un autre voyageur', () => {
    const tripId = createTrip();
    const booking = service.createBooking(tripId, 1, 'owner');

    expect(service.canAccess(booking, 'other', false)).toBe(false);
    expect(service.canAccess(booking, 'owner', false)).toBe(true);
    expect(service.canAccess(booking, 'admin', true)).toBe(true);
  });
});
