import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Booking } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { BookingService } from '../../core/services/booking.service';
import { CityService } from '../../core/services/city.service';
import { TripService } from '../../core/services/trip.service';

interface BookingRow {
  booking: Booking;
  from: string;
  to: string;
  departureAt: string;
  cancellable: boolean;
}

@Component({
  selector: 'app-booking-history',
  imports: [RouterLink, DatePipe, CurrencyPipe],
  template: `
    <section class="card">
      <h1>Mes réservations</h1>

      @if (rows().length === 0) {
        <p class="muted">Vous n'avez aucune réservation pour le moment.</p>
        <a routerLink="/recherche">Rechercher un trajet</a>
      } @else {
        @if (error()) {
          <p class="form-error" role="alert">{{ error() }}</p>
        }
        <table>
          <thead>
            <tr>
              <th>Trajet</th>
              <th>Départ</th>
              <th>Siège</th>
              <th>Montant</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (row of rows(); track row.booking.id) {
              <tr>
                <td>{{ row.from }} → {{ row.to }}</td>
                <td>{{ row.departureAt | date: 'short' }}</td>
                <td>{{ row.booking.seatNumber }}</td>
                <td>{{ row.booking.amount | currency: 'XOF' : 'symbol' : '1.0-0' }}</td>
                <td>
                  @if (row.booking.status === 'CONFIRMEE') {
                    <span class="badge confirmed">Confirmée</span>
                  } @else {
                    <span class="badge cancelled">Annulée</span>
                  }
                </td>
                <td>
                  <div class="actions">
                    @if (row.booking.status === 'CONFIRMEE') {
                      <a [routerLink]="['/billet', row.booking.id]">Billet</a>
                      @if (row.cancellable) {
                        <button type="button" class="danger" (click)="cancel(row.booking.id)">
                          Annuler
                        </button>
                      }
                    }
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </section>
  `,
})
export class BookingHistoryComponent {
  private readonly auth = inject(AuthService);
  private readonly bookings = inject(BookingService);
  private readonly cities = inject(CityService);
  private readonly trips = inject(TripService);

  protected readonly error = signal<string | null>(null);
  private readonly refresh = signal(0);

  protected readonly rows = computed<BookingRow[]>(() => {
    this.refresh();
    const user = this.auth.currentUser();
    if (!user) {
      return [];
    }
    return this.bookings.historyFor(user.id).map((booking) => {
      const trip = this.trips.byId(booking.tripId);
      const departureAt = trip?.departureAt ?? '';
      const cancellable =
        booking.status === 'CONFIRMEE' && (!trip || new Date(departureAt).getTime() > Date.now());
      return {
        booking,
        from: trip ? this.cities.nameOf(trip.departureCityId) : 'Trajet supprimé',
        to: trip ? this.cities.nameOf(trip.arrivalCityId) : '',
        departureAt,
        cancellable,
      };
    });
  });

  protected cancel(bookingId: string): void {
    const user = this.auth.currentUser();
    if (!user) {
      return;
    }
    try {
      this.bookings.cancelBooking(bookingId, user.id);
      this.error.set(null);
      this.refresh.update((value) => value + 1);
    } catch (reason: unknown) {
      this.error.set(reason instanceof Error ? reason.message : 'Annulation impossible');
    }
  }
}
