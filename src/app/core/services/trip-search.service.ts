import { Injectable, inject } from '@angular/core';
import { Trip } from '../models';
import { TripService } from './trip.service';
import { BookingService } from './booking.service';

export interface SearchCriteria {
  destination: string;
  date: string;
  departure?: string;
}

export interface SearchResult {
  trip: Trip;
  availableSeats: number;
  isFull: boolean;
}

@Injectable({ providedIn: 'root' })
export class TripSearchService {
  private readonly trips = inject(TripService);
  private readonly bookings = inject(BookingService);

  search(criteria: SearchCriteria, now: Date = new Date()): SearchResult[] {
    if (!criteria.destination || !criteria.date) {
      throw new Error('La destination et la date sont obligatoires');
    }
    return this.trips
      .trips()
      .filter((trip) => trip.arrivalCityId === criteria.destination)
      .filter((trip) => !criteria.departure || trip.departureCityId === criteria.departure)
      .filter((trip) => this.sameDay(trip.departureAt, criteria.date))
      .filter((trip) => new Date(trip.departureAt).getTime() > now.getTime())
      .map((trip) => {
        const availableSeats = this.bookings.availableSeats(trip);
        return { trip, availableSeats, isFull: availableSeats <= 0 };
      })
      .sort(
        (left, right) =>
          new Date(left.trip.departureAt).getTime() - new Date(right.trip.departureAt).getTime(),
      );
  }

  private sameDay(isoDate: string, date: string): boolean {
    const value = new Date(isoDate);
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}` === date;
  }
}
