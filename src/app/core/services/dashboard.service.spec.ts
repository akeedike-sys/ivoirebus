import { TestBed } from '@angular/core/testing';
import { BookingService } from './booking.service';
import { CityService } from './city.service';
import { DashboardService } from './dashboard.service';
import { TripService } from './trip.service';

describe('DashboardService', () => {
  let dashboard: DashboardService;
  let cities: CityService;
  let trips: TripService;
  let bookings: BookingService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    dashboard = TestBed.inject(DashboardService);
    cities = TestBed.inject(CityService);
    trips = TestBed.inject(TripService);
    bookings = TestBed.inject(BookingService);
  });

  it('retourne des indicateurs à zéro sans données', () => {
    const metrics = dashboard.metrics();
    expect(metrics.totalBookings).toBe(0);
    expect(metrics.confirmedBookings).toBe(0);
    expect(metrics.cancelledBookings).toBe(0);
    expect(metrics.trips).toBe(0);
    expect(metrics.cities).toBe(0);
  });

  it('calcule les totaux, le remplissage et les réservations récentes', () => {
    const abidjan = cities.create('Abidjan');
    const bouake = cities.create('Bouaké');
    const trip = trips.create({
      departureCityId: abidjan.id,
      arrivalCityId: bouake.id,
      departureAt: new Date(Date.now() + 86_400_000).toISOString(),
      price: 3000,
      capacity: 4,
    });

    const confirmed = bookings.createBooking(trip.id, 1, 'user-1');
    const cancelled = bookings.createBooking(trip.id, 2, 'user-2');
    bookings.cancelBooking(cancelled.id, 'user-2');

    const metrics = dashboard.metrics();

    expect(metrics.totalBookings).toBe(2);
    expect(metrics.confirmedBookings).toBe(1);
    expect(metrics.cancelledBookings).toBe(1);
    expect(metrics.trips).toBe(1);
    expect(metrics.cities).toBe(2);
    expect(metrics.recentBookings).toHaveLength(2);
    expect(metrics.recentBookings.map((item) => item.id)).toEqual(
      expect.arrayContaining([confirmed.id, cancelled.id]),
    );
    expect(metrics.fill[0]?.reserved).toBe(1);
    expect(metrics.fill[0]?.rate).toBeCloseTo(0.25);
  });
});
