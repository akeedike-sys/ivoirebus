import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BookingService } from '../../core/services/booking.service';
import { CityService } from '../../core/services/city.service';
import { TripService } from '../../core/services/trip.service';

@Component({
  selector: 'app-seat-selection',
  imports: [DatePipe, RouterLink],
  template: `
    @if (trip(); as currentTrip) {
      <section class="card">
        <h1>Choisir un siège</h1>
        <p class="muted">
          {{ cityName(currentTrip.departureCityId) }} → {{ cityName(currentTrip.arrivalCityId) }} ·
          {{ currentTrip.departureAt | date: 'fullDate' }} à {{ currentTrip.departureAt | date: 'shortTime' }}
        </p>

        <div class="legend">
          <span><i class="seat free"></i> Libre</span>
          <span><i class="seat occupied"></i> Occupé</span>
          <span><i class="seat selected"></i> Sélectionné</span>
        </div>

        <div class="bus">
          @for (seat of seats(); track seat) {
            <button
              type="button"
              class="seat-cell"
              [class.occupied]="isOccupied(seat)"
              [class.selected]="selected() === seat"
              [disabled]="isOccupied(seat)"
              (click)="select(seat)"
            >
              {{ seat }}
            </button>
          }
        </div>

        @if (notice()) {
          <p class="form-error" role="alert">{{ notice() }}</p>
        }

        <div class="actions confirm-bar">
          <span class="muted">
            @if (selected(); as seat) {
              Siège sélectionné : {{ seat }}
            } @else {
              Aucun siège sélectionné
            }
          </span>
          <button type="button" [disabled]="selected() === null" (click)="confirm()">
            Confirmer la réservation
          </button>
        </div>
      </section>
    } @else {
      <p class="card muted">Trajet introuvable. <a routerLink="/recherche">Retour à la recherche</a></p>
    }
  `,
  styles: [
    `
      .legend {
        display: flex;
        gap: 1.25rem;
        margin: 0.75rem 0 1rem;
        font-size: 0.85rem;
      }
      .legend span {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
      }
      .seat {
        width: 14px;
        height: 14px;
        border-radius: 3px;
        display: inline-block;
        border: 1px solid #d7dee9;
      }
      .seat.free {
        background: #ffffff;
      }
      .seat.occupied {
        background: #cbd5e1;
      }
      .seat.selected {
        background: #f4a300;
      }
      .bus {
        display: grid;
        grid-template-columns: repeat(4, 48px);
        gap: 0.5rem;
        margin: 1rem 0;
      }
      .seat-cell {
        height: 44px;
        border-radius: 6px;
        border: 1px solid #0b3d91;
        background: #ffffff;
        color: #0b3d91;
        font-weight: 600;
      }
      .seat-cell.occupied {
        background: #cbd5e1;
        border-color: #cbd5e1;
        color: #64748b;
      }
      .seat-cell.selected {
        background: #f4a300;
        border-color: #f4a300;
        color: #102a43;
      }
      .confirm-bar {
        justify-content: space-between;
        border-top: 1px solid #d7dee9;
        padding-top: 1rem;
      }
    `,
  ],
})
export class SeatSelectionComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly bookings = inject(BookingService);
  private readonly cities = inject(CityService);
  private readonly trips = inject(TripService);

  private readonly tripId = this.route.snapshot.paramMap.get('tripId') ?? '';
  protected readonly trip = computed(() => this.trips.byId(this.tripId));
  protected readonly selected = signal<number | null>(null);
  protected readonly notice = signal<string | null>(null);

  protected readonly seats = computed(() => {
    const currentTrip = this.trip();
    if (!currentTrip) {
      return [];
    }
    return Array.from({ length: currentTrip.capacity }, (_, index) => index + 1);
  });

  private readonly occupied = computed(() => new Set(this.bookings.occupiedSeats(this.tripId)));

  protected isOccupied(seat: number): boolean {
    return this.occupied().has(seat);
  }

  protected cityName(id: string): string {
    return this.cities.nameOf(id);
  }

  protected select(seat: number): void {
    if (this.isOccupied(seat)) {
      this.notice.set('Ce siège n’est pas disponible.');
      return;
    }
    this.notice.set(null);
    this.selected.set(seat);
  }

  protected confirm(): void {
    const seat = this.selected();
    const user = this.auth.currentUser();
    if (seat === null) {
      this.notice.set('Veuillez choisir un siège avant de continuer.');
      return;
    }
    if (!user) {
      this.router.navigateByUrl('/connexion');
      return;
    }
    try {
      const booking = this.bookings.createBooking(this.tripId, seat, user.id);
      this.router.navigate(['/reservation', booking.id]);
    } catch (reason: unknown) {
      this.notice.set(reason instanceof Error ? reason.message : 'Réservation impossible');
      this.selected.set(null);
    }
  }
}
