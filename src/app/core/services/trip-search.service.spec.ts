import { TestBed } from '@angular/core/testing';
import { BookingService } from './booking.service';
import { TripService } from './trip.service';
import { TripSearchService } from './trip-search.service';

describe('TripSearchService', () => {
  let search: TripSearchService;
  let trips: TripService;
  let bookings: BookingService;

  const now = new Date(2030, 5, 1, 0, 0, 0);
  const onDate = (day: number, hour: number): Date => new Date(2030, 5, day, hour, 0, 0);

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    search = TestBed.inject(TripSearchService);
    trips = TestBed.inject(TripService);
    bookings = TestBed.inject(BookingService);
  });

  it('retourne les trajets correspondant à la destination et à la date', () => {
    trips.create({
      departureCityId: 'abidjan',
      arrivalCityId: 'bouake',
      departureAt: onDate(10, 8).toISOString(),
      price: 3500,
      capacity: 40,
    });
    trips.create({
      departureCityId: 'abidjan',
      arrivalCityId: 'korhogo',
      departureAt: onDate(10, 9).toISOString(),
      price: 8000,
      capacity: 40,
    });

    const results = search.search({ destination: 'bouake', date: '2030-06-10' }, now);

    expect(results).toHaveLength(1);
    expect(results[0].trip.arrivalCityId).toBe('bouake');
  });

  it('exclut les trajets déjà partis', () => {
    trips.create({
      departureCityId: 'abidjan',
      arrivalCityId: 'bouake',
      departureAt: onDate(10, 8).toISOString(),
      price: 3500,
      capacity: 40,
    });

    const results = search.search({ destination: 'bouake', date: '2030-06-10' }, onDate(10, 12));

    expect(results).toHaveLength(0);
  });

  it('filtre par ville de départ lorsque précisée', () => {
    trips.create({
      departureCityId: 'abidjan',
      arrivalCityId: 'bouake',
      departureAt: onDate(10, 8).toISOString(),
      price: 3500,
      capacity: 40,
    });
    trips.create({
      departureCityId: 'yamoussoukro',
      arrivalCityId: 'bouake',
      departureAt: onDate(10, 10).toISOString(),
      price: 2000,
      capacity: 40,
    });

    const results = search.search(
      { destination: 'bouake', date: '2030-06-10', departure: 'yamoussoukro' },
      now,
    );

    expect(results).toHaveLength(1);
    expect(results[0].trip.departureCityId).toBe('yamoussoukro');
  });

  it('calcule les sièges disponibles et signale un trajet complet', () => {
    const trip = trips.create({
      departureCityId: 'abidjan',
      arrivalCityId: 'bouake',
      departureAt: onDate(10, 8).toISOString(),
      price: 3500,
      capacity: 2,
    });
    bookings.createBooking(trip.id, 1, 'user-1');
    bookings.createBooking(trip.id, 2, 'user-2');

    const results = search.search({ destination: 'bouake', date: '2030-06-10' }, now);

    expect(results[0].availableSeats).toBe(0);
    expect(results[0].isFull).toBe(true);
  });

  it('refuse une recherche sans destination ou sans date', () => {
    expect(() => search.search({ destination: '', date: '2030-06-10' }, now)).toThrow(
      'La destination et la date sont obligatoires',
    );
  });
});
