import { Injectable, inject, signal } from '@angular/core';
import { Booking, Trip } from '../models';
import { StorageService } from './storage.service';
import { STORAGE_KEYS } from '../storage-keys';
import { uid } from '../utils/id';

export interface TripInput {
  departureCityId: string;
  arrivalCityId: string;
  departureAt: string;
  price: number;
  capacity: number;
}

@Injectable({ providedIn: 'root' })
export class TripService {
  private readonly storage = inject(StorageService);
  private readonly tripsSignal = signal<Trip[]>(
    this.storage.get<Trip[]>(STORAGE_KEYS.trips, []),
  );

  readonly trips = this.tripsSignal.asReadonly();

  byId(id: string): Trip | undefined {
    return this.tripsSignal().find((trip) => trip.id === id);
  }

  create(input: TripInput): Trip {
    this.validate(input);
    const trip: Trip = { id: uid(), ...this.normalize(input) };
    this.persist([...this.tripsSignal(), trip]);
    return trip;
  }

  update(id: string, input: TripInput): void {
    this.validate(input);
    const normalized = this.normalize(input);
    if (normalized.capacity < this.reservedSeats(id)) {
      throw new Error('La capacité ne peut pas être inférieure au nombre de sièges réservés');
    }
    this.persist(
      this.tripsSignal().map((trip) => (trip.id === id ? { ...trip, ...normalized } : trip)),
    );
  }

  remove(id: string): void {
    if (this.hasBookings(id)) {
      throw new Error('Ce trajet comporte des réservations');
    }
    this.persist(this.tripsSignal().filter((trip) => trip.id !== id));
  }

  reservedSeats(tripId: string): number {
    return this.bookings().filter(
      (booking) => booking.tripId === tripId && booking.status === 'CONFIRMEE',
    ).length;
  }

  private hasBookings(tripId: string): boolean {
    return this.bookings().some((booking) => booking.tripId === tripId);
  }

  private bookings(): Booking[] {
    return this.storage.get<Booking[]>(STORAGE_KEYS.bookings, []);
  }

  private validate(input: TripInput): void {
    if (!input.departureCityId || !input.arrivalCityId) {
      throw new Error('Les villes de départ et d’arrivée sont obligatoires');
    }
    if (input.departureCityId === input.arrivalCityId) {
      throw new Error('Les villes de départ et d’arrivée doivent être différentes');
    }
    if (!input.departureAt) {
      throw new Error('La date et l’heure de départ sont obligatoires');
    }
    if (!Number.isFinite(input.price) || input.price <= 0) {
      throw new Error('Le prix doit être strictement positif');
    }
    if (!Number.isFinite(input.capacity) || input.capacity <= 0) {
      throw new Error('La capacité doit être strictement positive');
    }
  }

  private normalize(input: TripInput): TripInput {
    return {
      departureCityId: input.departureCityId,
      arrivalCityId: input.arrivalCityId,
      departureAt: input.departureAt,
      price: Math.round(input.price),
      capacity: Math.round(input.capacity),
    };
  }

  private persist(trips: Trip[]): void {
    this.tripsSignal.set(trips);
    this.storage.set(STORAGE_KEYS.trips, trips);
  }
}
