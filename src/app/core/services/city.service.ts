import { Injectable, inject, signal } from '@angular/core';
import { City, Trip } from '../models';
import { StorageService } from './storage.service';
import { STORAGE_KEYS } from '../storage-keys';
import { uid } from '../utils/id';

@Injectable({ providedIn: 'root' })
export class CityService {
  private readonly storage = inject(StorageService);
  private readonly citiesSignal = signal<City[]>(this.storage.get<City[]>(STORAGE_KEYS.cities, []));

  readonly cities = this.citiesSignal.asReadonly();

  byId(id: string): City | undefined {
    return this.citiesSignal().find((city) => city.id === id);
  }

  nameOf(id: string): string {
    return this.byId(id)?.name ?? 'Inconnue';
  }

  create(name: string): City {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error('Le nom de la ville est obligatoire');
    }
    if (this.exists(trimmed)) {
      throw new Error('Cette ville existe déjà');
    }
    const city: City = { id: uid(), name: trimmed };
    this.persist([...this.citiesSignal(), city]);
    return city;
  }

  rename(id: string, name: string): void {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error('Le nom de la ville est obligatoire');
    }
    if (this.citiesSignal().some((city) => city.id !== id && this.sameName(city.name, trimmed))) {
      throw new Error('Cette ville existe déjà');
    }
    this.persist(
      this.citiesSignal().map((city) => (city.id === id ? { ...city, name: trimmed } : city)),
    );
  }

  remove(id: string): void {
    const trips = this.storage.get<Trip[]>(STORAGE_KEYS.trips, []);
    if (trips.some((trip) => trip.departureCityId === id || trip.arrivalCityId === id)) {
      throw new Error('Cette ville est utilisée par un trajet');
    }
    this.persist(this.citiesSignal().filter((city) => city.id !== id));
  }

  private exists(name: string): boolean {
    return this.citiesSignal().some((city) => this.sameName(city.name, name));
  }

  private sameName(left: string, right: string): boolean {
    return left.trim().toLowerCase() === right.trim().toLowerCase();
  }

  private persist(cities: City[]): void {
    this.citiesSignal.set(cities);
    this.storage.set(STORAGE_KEYS.cities, cities);
  }
}
