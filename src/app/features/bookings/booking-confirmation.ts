import { Component, computed, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BookingService } from '../../core/services/booking.service';
import { CityService } from '../../core/services/city.service';
import { TripService } from '../../core/services/trip.service';

@Component({
  selector: 'app-booking-confirmation',
  imports: [RouterLink, DatePipe, CurrencyPipe],
  template: `
    @if (booking(); as currentBooking) {
      <section class="card">
        <h1>Réservation confirmée</h1>
        @if (trip(); as currentTrip) {
          <p>
            {{ cityName(currentTrip.departureCityId) }} → {{ cityName(currentTrip.arrivalCityId) }}
          </p>
          <p class="muted">
            Départ le {{ currentTrip.departureAt | date: 'fullDate' }} à
            {{ currentTrip.departureAt | date: 'shortTime' }}
          </p>
        }
        <dl class="summary">
          <div><dt>Référence</dt><dd>{{ currentBooking.id }}</dd></div>
          <div><dt>Siège</dt><dd>{{ currentBooking.seatNumber }}</dd></div>
          <div><dt>Montant</dt><dd>{{ currentBooking.amount | currency: 'XOF' : 'symbol' : '1.0-0' }}</dd></div>
          <div>
            <dt>Statut</dt>
            <dd>
              @if (currentBooking.status === 'CONFIRMEE') {
                <span class="badge confirmed">Confirmée</span>
              } @else {
                <span class="badge cancelled">Annulée</span>
              }
            </dd>
          </div>
        </dl>

        <div class="actions">
          <a class="ticket-link" [routerLink]="['/billet', currentBooking.id]">Voir le billet électronique</a>
          <a routerLink="/reservations">Mes réservations</a>
        </div>
      </section>
    } @else {
      <p class="card muted">Réservation introuvable. <a routerLink="/reservations">Mes réservations</a></p>
    }
  `,
  styles: [
    `
      .summary {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 0.75rem;
        margin: 1rem 0;
      }
      .summary dt {
        font-size: 0.8rem;
        color: #64748b;
        text-transform: uppercase;
      }
      .summary dd {
        margin: 0.15rem 0 0;
        font-weight: 600;
      }
      .ticket-link {
        font-weight: 600;
      }
    `,
  ],
})
export class BookingConfirmationComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly bookings = inject(BookingService);
  private readonly cities = inject(CityService);
  private readonly trips = inject(TripService);

  private readonly bookingId = this.route.snapshot.paramMap.get('bookingId') ?? '';
  protected readonly booking = computed(() => this.bookings.byId(this.bookingId));
  protected readonly trip = computed(() => {
    const current = this.booking();
    return current ? this.trips.byId(current.tripId) : undefined;
  });

  protected cityName(id: string): string {
    return this.cities.nameOf(id);
  }
}
