import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="card auth-card">
      <h1>Créer un compte voyageur</h1>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <div class="form-field">
          <label for="name">Nom complet</label>
          <input id="name" type="text" formControlName="name" autocomplete="name" />
          @if (form.controls.name.touched && form.controls.name.invalid) {
            <span class="field-error">Le nom est obligatoire.</span>
          }
        </div>

        <div class="form-field">
          <label for="email">Adresse e-mail</label>
          <input id="email" type="email" formControlName="email" autocomplete="email" />
          @if (form.controls.email.touched && form.controls.email.invalid) {
            <span class="field-error">Une adresse e-mail valide est requise.</span>
          }
        </div>

        <div class="form-field">
          <label for="password">Mot de passe</label>
          <input id="password" type="password" formControlName="password" autocomplete="new-password" />
          @if (form.controls.password.touched && form.controls.password.invalid) {
            <span class="field-error">Le mot de passe doit contenir au moins 6 caractères.</span>
          }
        </div>

        @if (error()) {
          <p class="form-error" role="alert">{{ error() }}</p>
        }

        <div class="actions">
          <button type="submit">S'inscrire</button>
          <a routerLink="/connexion">J'ai déjà un compte</a>
        </div>
      </form>
    </section>
  `,
  styles: [
    `
      .auth-card {
        max-width: 420px;
        margin: 2rem auto;
      }
    `,
  ],
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly error = signal<string | null>(null);
  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.error.set(null);
    const { name, email, password } = this.form.getRawValue();
    this.auth
      .register(name, email, password)
      .then(() => {
        this.router.navigateByUrl('/recherche');
      })
      .catch((reason: unknown) => {
        this.error.set(reason instanceof Error ? reason.message : 'Inscription impossible');
      });
  }
}
