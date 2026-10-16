import { Component, computed, effect, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import * as QRCode from 'qrcode';
import { AuthService } from '../../core/services/auth.service';
import { BookingService } from '../../core/services/booking.service';
import { CityService } from '../../core/services/city.service';
import { TripService } from '../../core/services/trip.service';
import { TicketPayload, ticketForBooking } from '../../core/utils/ticket';

@Component({
  selector: 'app-ticket',
  imports: [RouterLink, DatePipe, CurrencyPipe],
  template: `
    @if (payload(); as ticket) {
      <section class="card ticket" id="ticket">
        <header class="ticket-header">
          <h1>Billet électronique</h1>
          <span class="brand">IvoireBus</span>
        </header>

        <div class="ticket-body">
          <div class="ticket-info">
            <p class="route">{{ ticket.data.from }} → {{ ticket.data.to }}</p>
            <dl>
              <div><dt>Passager</dt><dd>{{ ticket.data.passenger }}</dd></div>
              <div><dt>Départ</dt><dd>{{ ticket.data.departureAt | date: 'fullDate' }} à {{ ticket.data.departureAt | date: 'shortTime' }}</dd></div>
              <div><dt>Siège</dt><dd>{{ ticket.data.seatNumber }}</dd></div>
              <div><dt>Montant</dt><dd>{{ ticket.data.amount | currency: 'XOF' : 'symbol' : '1.0-0' }}</dd></div>
              <div><dt>Référence</dt><dd>{{ ticket.data.bookingId }}</dd></div>
            </dl>
          </div>

          <div class="ticket-qr">
            @if (qrDataUrl(); as url) {
              <img [src]="url" alt="QR code du billet" width="180" height="180" />
            } @else {
              <p class="muted">Génération du QR code…</p>
            }
          </div>
        </div>
      </section>

      <div class="actions">
        <a routerLink="/reservations">Mes réservations</a>
      </div>
    } @else if (bookingExists()) {
      <p class="card muted">
        Cette réservation est annulée : aucun billet valide n'est disponible.
        <a routerLink="/reservations">Retour à mes réservations</a>
      </p>
    } @else {
      <p class="card muted">Billet introuvable. <a routerLink="/reservations">Mes réservations</a></p>
    }
  `,
  styles: [
    `
      .ticket {
        border: 2px dashed #0b3d91;
      }
      .ticket-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        border-bottom: 1px solid #d7dee9;
        padding-bottom: 0.75rem;
      }
      .ticket-header h1 {
        font-size: 1.35rem;
        margin: 0;
      }
      .brand {
        font-weight: 700;
        color: #0b3d91;
      }
      .ticket-body {
        display: flex;
        justify-content: space-between;
        gap: 1.5rem;
        flex-wrap: wrap;
        margin-top: 1rem;
      }
      .route {
        font-size: 1.2rem;
        font-weight: 700;
        margin: 0 0 0.75rem;
      }
      .ticket-info dl {
        display: grid;
        gap: 0.5rem;
        margin: 0;
      }
      .ticket-info dt {
        font-size: 0.75rem;
        color: #64748b;
        text-transform: uppercase;
      }
      .ticket-info dd {
        margin: 0.1rem 0 0;
        font-weight: 600;
      }
      .ticket-qr {
        display: flex;
        align-items: center;
      }
    `,
  ],
})
export class TicketComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly bookings = inject(BookingService);
  private readonly cities = inject(CityService);
  private readonly trips = inject(TripService);

  private readonly bookingId = this.route.snapshot.paramMap.get('bookingId') ?? '';
  protected readonly qrDataUrl = signal<string | null>(null);

  protected readonly booking = computed(() => this.bookings.byId(this.bookingId));
  protected readonly bookingExists = computed(() => this.booking() !== undefined);

  protected readonly payload = computed<TicketPayload | null>(() => {
    const booking = this.booking();
    const user = this.auth.currentUser();
    if (!booking || !user) {
      return null;
    }
    const trip = this.trips.byId(booking.tripId);
    if (!trip) {
      return null;
    }
    return ticketForBooking(
      booking,
      trip,
      this.cities.nameOf(trip.departureCityId),
      this.cities.nameOf(trip.arrivalCityId),
      user.name,
    );
  });

  constructor() {
    effect(() => {
      const current = this.payload();
      if (!current) {
        this.qrDataUrl.set(null);
        return;
      }
      QRCode.toDataURL(current.encoded, { width: 180, margin: 1 })
        .then((url) => this.qrDataUrl.set(url))
        .catch(() => this.qrDataUrl.set(null));
    });
  }
}
