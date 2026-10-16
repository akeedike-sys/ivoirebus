import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CityService } from '../../core/services/city.service';
import { TripInput, TripService } from '../../core/services/trip.service';

@Component({
  selector: 'app-trip-admin',
  imports: [ReactiveFormsModule, DatePipe, CurrencyPipe],
  template: `
    <section class="card">
      <h1>{{ editingId() ? 'Modifier un trajet' : 'Nouveau trajet' }}</h1>

      <form [formGroup]="form" (ngSubmit)="submit()" class="trip-form">
        <div class="form-field">
          <label for="departureCity">Ville de départ</label>
          <select id="departureCity" formControlName="departureCityId">
            <option value="">Sélectionner</option>
            @for (city of cities(); track city.id) {
              <option [value]="city.id">{{ city.name }}</option>
            }
          </select>
        </div>

        <div class="form-field">
          <label for="arrivalCity">Ville d'arrivée</label>
          <select id="arrivalCity" formControlName="arrivalCityId">
            <option value="">Sélectionner</option>
            @for (city of cities(); track city.id) {
              <option [value]="city.id">{{ city.name }}</option>
            }
          </select>
        </div>

        <div class="form-field">
          <label for="departureAt">Date et heure de départ</label>
          <input id="departureAt" type="datetime-local" formControlName="departureAt" />
        </div>

        <div class="form-field">
          <label for="price">Prix (XOF)</label>
          <input id="price" type="number" min="1" formControlName="price" />
        </div>

        <div class="form-field">
          <label for="capacity">Capacité (sièges)</label>
          <input id="capacity" type="number" min="1" formControlName="capacity" />
        </div>

        @if (form.invalid && form.touched) {
          <p class="form-error">Tous les champs sont obligatoires.</p>
        }
        @if (message(); as info) {
          <p [class.form-error]="isError()" [class.form-success]="!isError()" role="alert">{{ info }}</p>
        }

        <div class="actions">
          <button type="submit">{{ editingId() ? 'Enregistrer' : 'Créer le trajet' }}</button>
          @if (editingId()) {
            <button type="button" class="secondary" (click)="cancelEdit()">Annuler</button>
          }
        </div>
      </form>
    </section>

    <section class="card">
      @if (trips().length === 0) {
        <p class="muted">Aucun trajet enregistré.</p>
      } @else {
        <table>
          <thead>
            <tr>
              <th>Trajet</th>
              <th>Départ</th>
              <th>Prix</th>
              <th>Capacité</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (trip of trips(); track trip.id) {
              <tr>
                <td>{{ cityName(trip.departureCityId) }} → {{ cityName(trip.arrivalCityId) }}</td>
                <td>{{ trip.departureAt | date: 'short' }}</td>
                <td>{{ trip.price | currency: 'XOF' : 'symbol' : '1.0-0' }}</td>
                <td>{{ trip.capacity }}</td>
                <td>
                  <div class="actions">
                    <button type="button" class="secondary" (click)="edit(trip.id)">Modifier</button>
                    <button type="button" class="danger" (click)="remove(trip.id)">Supprimer</button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </section>
  `,
  styles: [
    `
      .trip-form {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 0.75rem;
        align-items: end;
      }
    `,
  ],
})
export class TripAdminComponent {
  private readonly fb = inject(FormBuilder);
  private readonly cityService = inject(CityService);
  private readonly tripService = inject(TripService);

  protected readonly cities = this.cityService.cities;
  protected readonly trips = this.tripService.trips;
  protected readonly editingId = signal<string | null>(null);
  protected readonly message = signal<string | null>(null);
  protected readonly isError = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    departureCityId: ['', Validators.required],
    arrivalCityId: ['', Validators.required],
    departureAt: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(1)]],
    capacity: [0, [Validators.required, Validators.min(1)]],
  });

  protected cityName(id: string): string {
    return this.cityService.nameOf(id);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const input: TripInput = {
      departureCityId: raw.departureCityId,
      arrivalCityId: raw.arrivalCityId,
      departureAt: new Date(raw.departureAt).toISOString(),
      price: Number(raw.price),
      capacity: Number(raw.capacity),
    };
    try {
      const currentId = this.editingId();
      if (currentId) {
        this.tripService.update(currentId, input);
        this.notify('Trajet mis à jour.', false);
      } else {
        this.tripService.create(input);
        this.notify('Trajet créé.', false);
      }
      this.cancelEdit();
    } catch (reason: unknown) {
      this.notify(this.errorMessage(reason), true);
    }
  }

  protected edit(id: string): void {
    const trip = this.tripService.byId(id);
    if (!trip) {
      return;
    }
    this.editingId.set(id);
    this.form.setValue({
      departureCityId: trip.departureCityId,
      arrivalCityId: trip.arrivalCityId,
      departureAt: this.toLocalInput(trip.departureAt),
      price: trip.price,
      capacity: trip.capacity,
    });
    this.message.set(null);
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
    this.form.reset({ departureCityId: '', arrivalCityId: '', departureAt: '', price: 0, capacity: 0 });
  }

  protected remove(id: string): void {
    try {
      this.tripService.remove(id);
      this.notify('Trajet supprimé.', false);
      if (this.editingId() === id) {
        this.cancelEdit();
      }
    } catch (reason: unknown) {
      this.notify(this.errorMessage(reason), true);
    }
  }

  private toLocalInput(iso: string): string {
    const date = new Date(iso);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  private notify(message: string, isError: boolean): void {
    this.message.set(message);
    this.isError.set(isError);
  }

  private errorMessage(reason: unknown): string {
    return reason instanceof Error ? reason.message : 'Opération impossible';
  }
}
