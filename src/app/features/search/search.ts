import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CityService } from '../../core/services/city.service';
import { SearchResult, TripSearchService } from '../../core/services/trip-search.service';

@Component({
  selector: 'app-search',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, CurrencyPipe],
  template: `
    <section class="card">
      <h1>Rechercher un trajet</h1>
      <form [formGroup]="form" (ngSubmit)="search()" class="search-form">
        <div class="form-field">
          <label for="departure">Ville de départ (optionnel)</label>
          <select id="departure" formControlName="departure">
            <option value="">Toutes les villes</option>
            @for (city of cities(); track city.id) {
              <option [value]="city.id">{{ city.name }}</option>
            }
          </select>
        </div>

        <div class="form-field">
          <label for="destination">Destination</label>
          <select id="destination" formControlName="destination">
            <option value="">Sélectionner une ville</option>
            @for (city of cities(); track city.id) {
              <option [value]="city.id">{{ city.name }}</option>
            }
          </select>
          @if (form.controls.destination.touched && form.controls.destination.invalid) {
            <span class="field-error">La destination est obligatoire.</span>
          }
        </div>

        <div class="form-field">
          <label for="date">Date de départ</label>
          <input id="date" type="date" formControlName="date" [min]="today" />
          @if (form.controls.date.touched && form.controls.date.invalid) {
            <span class="field-error">La date est obligatoire.</span>
          }
        </div>

        @if (error()) {
          <p class="form-error" role="alert">{{ error() }}</p>
        }

        <div class="actions">
          <button type="submit">Rechercher</button>
        </div>
      </form>
    </section>

    @if (searched()) {
      <section class="results">
        @if (results().length === 0) {
          <p class="card muted">Aucun trajet ne correspond à votre recherche.</p>
        } @else {
          @for (result of results(); track result.trip.id) {
            <article class="card result">
              <div>
                <h3>{{ cityName(result.trip.departureCityId) }} → {{ cityName(result.trip.arrivalCityId) }}</h3>
                <p class="muted">
                  Départ le {{ result.trip.departureAt | date: 'fullDate' }} à
                  {{ result.trip.departureAt | date: 'shortTime' }}
                </p>
              </div>
              <div class="result-side">
                <span class="price">{{ result.trip.price | currency: 'XOF' : 'symbol' : '1.0-0' }}</span>
                @if (result.isFull) {
                  <span class="badge cancelled">Complet</span>
                } @else {
                  <span class="badge confirmed">{{ result.availableSeats }} sièges disponibles</span>
                }
                @if (!result.isFull) {
                  <a class="choose" [routerLink]="['/sieges', result.trip.id]">Choisir un siège</a>
                }
              </div>
            </article>
          }
        }
      </section>
    }
  `,
  styles: [
    `
      .search-form {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 0.75rem;
        align-items: end;
      }
      .result {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
        align-items: center;
      }
      .result h3 {
        margin: 0 0 0.25rem;
      }
      .result-side {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.4rem;
      }
      .price {
        font-size: 1.2rem;
        font-weight: 700;
        color: #0b3d91;
      }
      .choose {
        font-weight: 600;
      }
    `,
  ],
})
export class SearchComponent {
  private readonly fb = inject(FormBuilder);
  private readonly citiesService = inject(CityService);
  private readonly searchService = inject(TripSearchService);

  protected readonly cities = this.citiesService.cities;
  protected readonly results = signal<SearchResult[]>([]);
  protected readonly searched = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly today = this.toDateInput(new Date());

  protected readonly form = this.fb.nonNullable.group({
    departure: '',
    destination: ['', Validators.required],
    date: [this.today, Validators.required],
  });

  protected cityName(id: string): string {
    return this.citiesService.nameOf(id);
  }

  protected search(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.error.set(null);
    const { departure, destination, date } = this.form.getRawValue();
    try {
      const found = this.searchService.search({
        destination,
        date,
        departure: departure || undefined,
      });
      this.results.set(found);
      this.searched.set(true);
    } catch (reason: unknown) {
      this.error.set(reason instanceof Error ? reason.message : 'Recherche impossible');
    }
  }

  private toDateInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
