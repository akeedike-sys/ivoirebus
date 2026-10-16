import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { bookingOwnerGuard } from './core/guards/booking-owner.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'recherche' },
  {
    path: 'connexion',
    loadComponent: () => import('./features/auth/login').then((module) => module.LoginComponent),
  },
  {
    path: 'inscription',
    loadComponent: () => import('./features/auth/register').then((module) => module.RegisterComponent),
  },
  {
    path: 'recherche',
    loadComponent: () => import('./features/search/search').then((module) => module.SearchComponent),
  },
  {
    path: 'sieges/:tripId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/seats/seat-selection').then((module) => module.SeatSelectionComponent),
  },
  {
    path: 'reservation/:bookingId',
    canActivate: [authGuard, bookingOwnerGuard],
    loadComponent: () =>
      import('./features/bookings/booking-confirmation').then(
        (module) => module.BookingConfirmationComponent,
      ),
  },
  {
    path: 'reservations',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/bookings/booking-history').then((module) => module.BookingHistoryComponent),
  },
  {
    path: 'billet/:bookingId',
    canActivate: [authGuard, bookingOwnerGuard],
    loadComponent: () => import('./features/ticket/ticket').then((module) => module.TicketComponent),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'tableau-de-bord' },
      {
        path: 'villes',
        loadComponent: () =>
          import('./features/cities/city-admin').then((module) => module.CityAdminComponent),
      },
      {
        path: 'trajets',
        loadComponent: () =>
          import('./features/trips/trip-admin').then((module) => module.TripAdminComponent),
      },
      {
        path: 'tableau-de-bord',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then((module) => module.DashboardComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'recherche' },
];
