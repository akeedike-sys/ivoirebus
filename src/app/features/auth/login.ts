import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="card auth-card">
      <h1>Connexion</h1>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <div class="form-field">
          <label for="email">Adresse e-mail</label>
          <input id="email" type="email" formControlName="email" autocomplete="email" />
          @if (form.controls.email.touched && form.controls.email.invalid) {
            <span class="field-error">Une adresse e-mail valide est requise.</span>
          }
        </div>

        <div class="form-field">
          <label for="password">Mot de passe</label>
          <input id="password" type="password" formControlName="password" autocomplete="current-password" />
          @if (form.controls.password.touched && form.controls.password.invalid) {
            <span class="field-error">Le mot de passe est obligatoire.</span>
          }
        </div>

        @if (error()) {
          <p class="form-error" role="alert">{{ error() }}</p>
        }

        <div class="actions">
          <button type="submit">Se connecter</button>
          <a routerLink="/inscription">Créer un compte</a>
        </div>
      </form>

      <p class="muted demo-hint">
        Comptes de démonstration : admin&#64;ivoirebus.ci / admin123 — voyageur&#64;ivoirebus.ci / voyageur123
      </p>
    </section>
  `,
  styles: [
    `
      .auth-card {
        max-width: 420px;
        margin: 2rem auto;
      }
      .demo-hint {
        font-size: 0.8rem;
        margin-top: 1rem;
      }
    `,
  ],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly error = signal<string | null>(null);
  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.error.set(null);
    const { email, password } = this.form.getRawValue();
    this.auth
      .login(email, password)
      .then((user) => {
        this.router.navigateByUrl(user.role === 'ADMIN' ? '/admin/tableau-de-bord' : '/recherche');
      })
      .catch((reason: unknown) => {
        this.error.set(reason instanceof Error ? reason.message : 'Connexion impossible');
      });
  }
}
