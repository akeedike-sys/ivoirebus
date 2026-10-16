import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { STORAGE_KEYS } from '../storage-keys';
import { AuthService } from './auth.service';
import { CityService } from './city.service';
import { TripService } from './trip.service';

@Injectable({ providedIn: 'root' })
export class SeedService {
  private readonly storage = inject(StorageService);
  private readonly auth = inject(AuthService);
  private readonly cities = inject(CityService);
  private readonly trips = inject(TripService);

  async seed(): Promise<void> {
    if (this.storage.get<boolean>(STORAGE_KEYS.seeded, false)) {
      return;
    }

    await this.auth.seedUser('Administrateur', 'admin@ivoirebus.ci', 'admin123', 'ADMIN');
    await this.auth.seedUser('Voyageur Démo', 'voyageur@ivoirebus.ci', 'voyageur123', 'VOYAGEUR');

    const abidjan = this.cities.create('Abidjan');
    const yamoussoukro = this.cities.create('Yamoussoukro');
    const bouake = this.cities.create('Bouaké');
    const korhogo = this.cities.create('Korhogo');
    const sanPedro = this.cities.create('San-Pédro');

    this.trips.create({
      departureCityId: abidjan.id,
      arrivalCityId: yamoussoukro.id,
      departureAt: this.futureDate(1, 7, 30),
      price: 3000,
      capacity: 40,
    });
    this.trips.create({
      departureCityId: abidjan.id,
      arrivalCityId: bouake.id,
      departureAt: this.futureDate(1, 9, 0),
      price: 3500,
      capacity: 45,
    });
    this.trips.create({
      departureCityId: abidjan.id,
      arrivalCityId: korhogo.id,
      departureAt: this.futureDate(3, 6, 15),
      price: 8000,
      capacity: 50,
    });
    this.trips.create({
      departureCityId: yamoussoukro.id,
      arrivalCityId: abidjan.id,
      departureAt: this.futureDate(3, 15, 45),
      price: 3000,
      capacity: 40,
    });
    this.trips.create({
      departureCityId: abidjan.id,
      arrivalCityId: sanPedro.id,
      departureAt: this.futureDate(5, 8, 0),
      price: 6000,
      capacity: 35,
    });

    this.storage.set(STORAGE_KEYS.seeded, true);
  }

  private futureDate(days: number, hours: number, minutes: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
  }
}
