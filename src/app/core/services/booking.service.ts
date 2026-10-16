import { Injectable, inject, signal } from '@angular/core';
import { Booking, Trip } from '../models';
import { StorageService } from './storage.service';
import { STORAGE_KEYS } from '../storage-keys';
import { uid } from '../utils/id';
import { TripService } from './trip.service';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly storage = inject(StorageService);
  private readonly trips = inject(TripService);
  private readonly bookingsSignal = signal<Booking[]>(
    this.storage.get<Booking[]>(STORAGE_KEYS.bookings, []),
  );

  readonly bookings = this.bookingsSignal.asReadonly();

  byId(id: string): Booking | undefined {
    return this.bookingsSignal().find((booking) => booking.id === id);
  }

  occupiedSeats(tripId: string): number[] {
    return this.bookingsSignal()
      .filter((booking) => booking.tripId === tripId && booking.status === 'CONFIRMEE')
      .map((booking) => booking.seatNumber)
      .sort((left, right) => left - right);
  }

  isSeatAvailable(tripId: string, seatNumber: number): boolean {
    return !this.occupiedSeats(tripId).includes(seatNumber);
  }

  availableSeats(trip: Trip): number {
    return Math.max(0, trip.capacity - this.occupiedSeats(trip.id).length);
  }

  createBooking(tripId: string, seatNumber: number, userId: string): Booking {
    const trip = this.trips.byId(tripId);
    if (!trip) {
      throw new Error('Trajet introuvable');
    }
    if (!Number.isInteger(seatNumber) || seatNumber < 1 || seatNumber > trip.capacity) {
      throw new Error('Siège invalide');
    }
    if (!this.isSeatAvailable(tripId, seatNumber)) {
      throw new Error('Ce siège a été réservé entre-temps, veuillez en choisir un autre');
    }
    const booking: Booking = {
      id: uid(),
      tripId,
      seatNumber,
      userId,
      createdAt: new Date().toISOString(),
      status: 'CONFIRMEE',
      amount: trip.price,
    };
    this.persist([...this.bookingsSignal(), booking]);
    return booking;
  }

  cancelBooking(id: string, userId: string): void {
    const booking = this.byId(id);
    if (!booking) {
      throw new Error('Réservation introuvable');
    }
    if (booking.userId !== userId) {
      throw new Error('Accès refusé');
    }
    if (booking.status === 'ANNULEE') {
      throw new Error('Cette réservation est déjà annulée');
    }
    const trip = this.trips.byId(booking.tripId);
    if (trip && new Date(trip.departureAt).getTime() <= Date.now()) {
      throw new Error('Le délai d’annulation est dépassé');
    }
    this.persist(
      this.bookingsSignal().map((bookingItem) =>
        bookingItem.id === id ? { ...bookingItem, status: 'ANNULEE' } : bookingItem,
      ),
    );
  }

  historyFor(userId: string): Booking[] {
    return this.bookingsSignal()
      .filter((booking) => booking.userId === userId)
      .slice()
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
  }

  canAccess(booking: Booking, userId: string | null, isAdmin: boolean): boolean {
    return isAdmin || booking.userId === userId;
  }

  private persist(bookings: Booking[]): void {
    this.bookingsSignal.set(bookings);
    this.storage.set(STORAGE_KEYS.bookings, bookings);
  }
}
