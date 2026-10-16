import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { CityService } from './city.service';
import { SeedService } from './seed.service';
import { TripService } from './trip.service';

describe('SeedService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('alimente villes, trajets et comptes de démonstration au premier lancement', async () => {
    const seed = TestBed.inject(SeedService);
    await seed.seed();

    const auth = TestBed.inject(AuthService);
    const cities = TestBed.inject(CityService);
    const trips = TestBed.inject(TripService);

    expect(cities.cities().length).toBeGreaterThan(0);
    expect(trips.trips().length).toBeGreaterThan(0);
    expect(auth.users().some((user) => user.role === 'ADMIN')).toBe(true);
    expect(auth.users().some((user) => user.role === 'VOYAGEUR')).toBe(true);
  });

  it('ne réinitialise pas les données déjà présentes', async () => {
    const seed = TestBed.inject(SeedService);
    await seed.seed();
    const cities = TestBed.inject(CityService);
    const count = cities.cities().length;

    await seed.seed();

    expect(cities.cities().length).toBe(count);
  });
});
