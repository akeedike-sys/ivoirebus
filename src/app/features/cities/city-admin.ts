import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CityService } from '../../core/services/city.service';

@Component({
  selector: 'app-city-admin',
  imports: [ReactiveFormsModule],
  template: `
    <section class="card">
      <h1>Gestion des villes</h1>

      <form [formGroup]="createForm" (ngSubmit)="create()" class="inline-form">
        <div class="form-field">
          <label for="cityName">Nouvelle ville</label>
          <input id="cityName" type="text" formControlName="name" placeholder="Ex. Abidjan" />
          @if (createForm.controls.name.touched && createForm.controls.name.invalid) {
            <span class="field-error">Le nom est obligatoire.</span>
          }
        </div>
        <button type="submit">Ajouter</button>
      </form>

      @if (message(); as info) {
        <p [class.form-error]="isError()" [class.form-success]="!isError()" role="alert">{{ info }}</p>
      }
    </section>

    <section class="card">
      @if (cities().length === 0) {
        <p class="muted">Aucune ville enregistrée.</p>
      } @else {
        <table>
          <thead>
            <tr>
              <th>Ville</th>
              <th>Renommer</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (city of cities(); track city.id) {
              <tr>
                <td>{{ city.name }}</td>
                <td>
                  <div class="actions">
                    <input
                      type="text"
                      [value]="city.name"
                      #renameInput
                      aria-label="Nouveau nom"
                    />
                    <button type="button" class="secondary" (click)="rename(city.id, renameInput.value)">
                      Renommer
                    </button>
                  </div>
                </td>
                <td>
                  <button type="button" class="danger" (click)="remove(city.id)">Supprimer</button>
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
      .inline-form {
        display: flex;
        gap: 0.75rem;
        align-items: flex-end;
      }
      .inline-form .form-field {
        margin-bottom: 0;
        flex: 1 1 auto;
      }
    `,
  ],
})
export class CityAdminComponent {
  private readonly fb = inject(FormBuilder);
  private readonly cityService = inject(CityService);

  protected readonly cities = this.cityService.cities;
  protected readonly message = signal<string | null>(null);
  protected readonly isError = signal(false);

  protected readonly createForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
  });

  protected create(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    try {
      const city = this.cityService.create(this.createForm.getRawValue().name);
      this.notify(`Ville « ${city.name} » ajoutée.`, false);
      this.createForm.reset({ name: '' });
    } catch (reason: unknown) {
      this.notify(this.errorMessage(reason), true);
    }
  }

  protected rename(id: string, name: string): void {
    try {
      this.cityService.rename(id, name);
      this.notify('Ville renommée.', false);
    } catch (reason: unknown) {
      this.notify(this.errorMessage(reason), true);
    }
  }

  protected remove(id: string): void {
    try {
      this.cityService.remove(id);
      this.notify('Ville supprimée.', false);
    } catch (reason: unknown) {
      this.notify(this.errorMessage(reason), true);
    }
  }

  private notify(message: string, isError: boolean): void {
    this.message.set(message);
    this.isError.set(isError);
  }

  private errorMessage(reason: unknown): string {
    return reason instanceof Error ? reason.message : 'Opération impossible';
  }
}
