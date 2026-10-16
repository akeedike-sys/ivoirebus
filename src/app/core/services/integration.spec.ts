import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { BookingService } from './booking.service';
import { CityService } from './city.service';
import { DashboardService } from './dashboard.service';
import { SeedService } from './seed.service';
import { TripService } from './trip.service';
import { TripSearchService } from './trip-search.service';
import { ticketForBooking } from '../utils/ticket';

const localDate = (iso: string): string => {
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

describe('Parcours d’intégration du MVP', () => {
  let auth: AuthService;
  let bookings: BookingService;
  let cities: CityService;
  let trips: TripService;
  let search: TripSearchService;
  let dashboard: DashboardService;

  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    auth = TestBed.inject(AuthService);
    bookings = TestBed.inject(BookingService);
    cities = TestBed.inject(CityService);
    trips = TestBed.inject(TripService);
    search = TestBed.inject(TripSearchService);
    dashboard = TestBed.inject(DashboardService);
    await TestBed.inject(SeedService).seed();
  });

  it('parcours voyageur : recherche → siège → réservation → billet → historique', async () => {
    const user = await auth.register('Awa Traoré', 'awa@example.ci', 'secret123');
    const target = trips.trips()[0];
    expect(target).toBeDefined();

    const results = search.search(
      { destination: target.arrivalCityId, date: localDate(target.departureAt) },
      new Date(),
    );
    expect(results.length).toBeGreaterThan(0);

    const chosen = results[0];
    const booking = bookings.createBooking(chosen.trip.id, 1, user.id);
    expect(booking.status).toBe('CONFIRMEE');
    expect(booking.amount).toBe(chosen.trip.price);

    const payload = ticketForBooking(
      booking,
      chosen.trip,
      cities.nameOf(chosen.trip.departureCityId),
      cities.nameOf(chosen.trip.arrivalCityId),
      user.name,
    );
    expect(payload).not.toBeNull();
    expect(payload?.encoded).toContain(booking.id);

    const history = bookings.historyFor(user.id);
    expect(history).toHaveLength(1);
    expect(history[0].id).toBe(booking.id);
  });

  it('parcours administrateur : le tableau de bord reflète les réservations créées', async () => {
    const before = dashboard.metrics();
    const user = await auth.register('Awa', 'awa@example.ci', 'secret123');
    const target = trips.trips()[0];
    bookings.createBooking(target.id, 1, user.id);

    const after = dashboard.metrics();

    expect(after.confirmedBookings).toBe(before.confirmedBookings + 1);
    expect(after.totalBookings).toBe(before.totalBookings + 1);
    expect(after.trips).toBe(before.trips);
    expect(after.cities).toBe(before.cities);
    expect(after.recentBookings[0]?.id).toBe(bookings.historyFor(user.id)[0].id);
    const fill = after.fill.find((row) => row.trip.id === target.id);
    expect(fill?.reserved).toBe(1);
  });
});
