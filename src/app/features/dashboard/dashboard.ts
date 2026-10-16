import { Component, inject } from '@angular/core';
import { CurrencyPipe, DatePipe, PercentPipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { CityService } from '../../core/services/city.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { TripService } from '../../core/services/trip.service';

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, CurrencyPipe, PercentPipe],
  template: `
    @if (metrics(); as data) {
      <section class="card">
        <h1>Tableau de bord</h1>
        <div class="grid-cards">
          <div class="metric"><div class="value">{{ data.totalBookings }}</div><div class="label">Réservations totales</div></div>
          <div class="metric"><div class="value">{{ data.confirmedBookings }}</div><div class="label">Confirmées</div></div>
          <div class="metric"><div class="value">{{ data.cancelledBookings }}</div><div class="label">Annulées</div></div>
          <div class="metric"><div class="value">{{ data.trips }}</div><div class="label">Trajets</div></div>
          <div class="metric"><div class="value">{{ data.cities }}</div><div class="label">Villes</div></div>
        </div>
      </section>

      <section class="card">
        <h2>Réservations récentes</h2>
        @if (data.recentBookings.length === 0) {
          <p class="muted">Aucune réservation pour le moment.</p>
        } @else {
          <table>
            <thead>
              <tr>
                <th>Voyageur</th>
                <th>Trajet</th>
                <th>Siège</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Créée le</th>
              </tr>
            </thead>
            <tbody>
              @for (booking of data.recentBookings; track booking.id) {
                <tr>
                  <td>{{ userName(booking.userId) }}</td>
                  <td>{{ tripLabel(booking.tripId) }}</td>
                  <td>{{ booking.seatNumber }}</td>
                  <td>{{ booking.amount | currency: 'XOF' : 'symbol' : '1.0-0' }}</td>
                  <td>
                    @if (booking.status === 'CONFIRMEE') {
                      <span class="badge confirmed">Confirmée</span>
                    } @else {
                      <span class="badge cancelled">Annulée</span>
                    }
                  </td>
                  <td>{{ booking.createdAt | date: 'short' }}</td>
                </tr>
              }
            </tbody>
          </table>
        }
      </section>

      <section class="card">
        <h2>Taux de remplissage</h2>
        @if (data.fill.length === 0) {
          <p class="muted">Aucun trajet enregistré.</p>
        } @else {
          <table>
            <thead>
              <tr>
                <th>Trajet</th>
                <th>Départ</th>
                <th>Réservés</th>
                <th>Capacité</th>
                <th>Remplissage</th>
              </tr>
            </thead>
            <tbody>
              @for (row of data.fill; track row.trip.id) {
                <tr>
                  <td>{{ tripLabel(row.trip.id) }}</td>
                  <td>{{ row.trip.departureAt | date: 'short' }}</td>
                  <td>{{ row.reserved }}</td>
                  <td>{{ row.trip.capacity }}</td>
                  <td>{{ row.rate | percent: '1.0-0' }}</td>
                </tr>
              }
            </tbody>
          </table>
        }
      </section>
    }
  `,
})
export class DashboardComponent {
  private readonly auth = inject(AuthService);
  private readonly cities = inject(CityService);
  private readonly trips = inject(TripService);
  private readonly dashboard = inject(DashboardService);

  protected readonly metrics = this.dashboard.metrics;

  protected userName(userId: string): string {
    return this.auth.users().find((user) => user.id === userId)?.name ?? 'Inconnu';
  }

  protected tripLabel(tripId: string): string {
    const trip = this.trips.byId(tripId);
    if (!trip) {
      return 'Trajet supprimé';
    }
    return `${this.cities.nameOf(trip.departureCityId)} → ${this.cities.nameOf(trip.arrivalCityId)}`;
  }
}
