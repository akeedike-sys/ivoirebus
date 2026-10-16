import { TestBed } from '@angular/core/testing';
import { BookingService } from './booking.service';
import { TripService } from './trip.service';

describe('TripService', () => {
  let service: TripService;
  let bookings: BookingService;

  const future = (): string => new Date(Date.now() + 86_400_000).toISOString();
  const input = () => ({
    departureCityId: 'city-a',
    arrivalCityId: 'city-b',
    departureAt: future(),
    price: 3000,
    capacity: 40,
  });

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(TripService);
    bookings = TestBed.inject(BookingService);
  });

  it('crée un trajet valide', () => {
    const trip = service.create(input());
    expect(service.trips()).toHaveLength(1);
    expect(trip.price).toBe(3000);
  });

  it('refuse des villes identiques', () => {
    expect(() => service.create({ ...input(), arrivalCityId: 'city-a' })).toThrow(
      'Les villes de départ et d’arrivée doivent être différentes',
    );
  });

  it('refuse un prix ou une capacité non positifs', () => {
    expect(() => service.create({ ...input(), price: 0 })).toThrow(
      'Le prix doit être strictement positif',
    );
    expect(() => service.create({ ...input(), capacity: -1 })).toThrow(
      'La capacité doit être strictement positive',
    );
  });

  it('refuse une capacité inférieure aux sièges réservés', () => {
    const trip = service.create(input());
    bookings.createBooking(trip.id, 1, 'user-1');
    bookings.createBooking(trip.id, 2, 'user-2');

    expect(() => service.update(trip.id, { ...input(), capacity: 1 })).toThrow(
      'La capacité ne peut pas être inférieure au nombre de sièges réservés',
    );
  });

  it('autorise la mise à jour lorsque la capacité reste suffisante', () => {
    const trip = service.create(input());
    bookings.createBooking(trip.id, 1, 'user-1');

    service.update(trip.id, { ...input(), capacity: 10 });
    expect(service.byId(trip.id)?.capacity).toBe(10);
  });

  it('supprime un trajet sans réservation', () => {
    const trip = service.create(input());
    service.remove(trip.id);
    expect(service.trips()).toHaveLength(0);
  });

  it('refuse la suppression d’un trajet réservé', () => {
    const trip = service.create(input());
    bookings.createBooking(trip.id, 1, 'user-1');

    expect(() => service.remove(trip.id)).toThrow('Ce trajet comporte des réservations');
  });
});
