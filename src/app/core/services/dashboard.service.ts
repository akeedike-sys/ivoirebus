import { Injectable, computed, inject } from '@angular/core';
import { Booking, Trip } from '../models';
import { BookingService } from './booking.service';
import { CityService } from './city.service';
import { TripService } from './trip.service';

export interface TripFill {
  trip: Trip;
  reserved: number;
  rate: number;
}

export interface DashboardMetrics {
  confirmedBookings: number;
  cancelledBookings: number;
  totalBookings: number;
  trips: number;
  cities: number;
  recentBookings: Booking[];
  fill: TripFill[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly bookingService = inject(BookingService);
  private readonly tripService = inject(TripService);
  private readonly cityService = inject(CityService);

  readonly metrics = computed<DashboardMetrics>(() => {
    const bookings = this.bookingService.bookings();
    const trips = this.tripService.trips();
    const confirmed = bookings.filter((booking) => booking.status === 'CONFIRMEE');
    const cancelled = bookings.filter((booking) => booking.status === 'ANNULEE');

    const recentBookings = bookings
      .slice()
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
      .slice(0, 5);

    const fill: TripFill[] = trips.map((trip) => {
      const reserved = confirmed.filter((booking) => booking.tripId === trip.id).length;
      const rate = trip.capacity > 0 ? reserved / trip.capacity : 0;
      return { trip, reserved, rate };
    });

    return {
      confirmedBookings: confirmed.length,
      cancelledBookings: cancelled.length,
      totalBookings: bookings.length,
      trips: trips.length,
      cities: this.cityService.cities().length,
      recentBookings,
      fill,
    };
  });
}
