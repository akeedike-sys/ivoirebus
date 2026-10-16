import { TestBed } from '@angular/core/testing';
import { provideRouter, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { adminGuard } from './admin.guard';
import { authGuard } from './auth.guard';
import { BookingService } from '../services/booking.service';
import { bookingOwnerGuard } from './booking-owner.guard';
import { Booking } from '../models';

const routeState = {} as never;

function runGuard(guard: typeof authGuard, paramMapValue?: string) {
  const route = { paramMap: { get: () => paramMapValue ?? null } } as never;
  return TestBed.runInInjectionContext(() => guard(route, routeState));
}

describe('guards', () => {
  let authMock: {
    isAuthenticated: () => boolean;
    isAdmin: () => boolean;
    currentUser: () => { id: string; role: string } | null;
  };

  beforeEach(() => {
    localStorage.clear();
    authMock = {
      isAuthenticated: () => false,
      isAdmin: () => false,
      currentUser: () => null,
    };
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: authMock }],
    });
  });

  it('authGuard laisse passer un utilisateur authentifié', () => {
    authMock.isAuthenticated = () => true;
    expect(runGuard(authGuard)).toBe(true);
  });

  it('authGuard redirige un visiteur anonyme vers /connexion', () => {
    authMock.isAuthenticated = () => false;
    const result = runGuard(authGuard);
    expect(result).toBeInstanceOf(UrlTree);
    expect(String(result)).toBe('/connexion');
  });

  it('adminGuard autorise un administrateur', () => {
    authMock.isAdmin = () => true;
    expect(runGuard(adminGuard)).toBe(true);
  });

  it('adminGuard redirige un voyageur authentifié vers /recherche', () => {
    authMock.isAdmin = () => false;
    authMock.isAuthenticated = () => true;
    const result = runGuard(adminGuard);
    expect(result).toBeInstanceOf(UrlTree);
    expect(String(result)).toBe('/recherche');
  });

  it('adminGuard redirige un visiteur anonyme vers /connexion', () => {
    authMock.isAdmin = () => false;
    authMock.isAuthenticated = () => false;
    const result = runGuard(adminGuard);
    expect(result).toBeInstanceOf(UrlTree);
    expect(String(result)).toBe('/connexion');
  });

  it('bookingOwnerGuard refuse l’accès à la réservation d’un autre voyageur', () => {
    const booking = { id: 'b1', userId: 'owner' } as Booking;
    authMock.currentUser = () => ({ id: 'other', role: 'VOYAGEUR' });
    const bookingsMock = {
      byId: () => booking,
      canAccess: (b: Booking, userId: string | null, isAdmin: boolean) =>
        isAdmin || b.userId === userId,
    };
    TestBed.overrideProvider(BookingService, { useValue: bookingsMock });

    const result = runGuard(bookingOwnerGuard, 'b1');
    expect(result).toBeInstanceOf(UrlTree);
    expect(String(result)).toBe('/reservations');
  });

  it('bookingOwnerGuard autorise le propriétaire de la réservation', () => {
    const booking = { id: 'b1', userId: 'owner' } as Booking;
    authMock.currentUser = () => ({ id: 'owner', role: 'VOYAGEUR' });
    const bookingsMock = {
      byId: () => booking,
      canAccess: (b: Booking, userId: string | null, isAdmin: boolean) =>
        isAdmin || b.userId === userId,
    };
    TestBed.overrideProvider(BookingService, { useValue: bookingsMock });

    expect(runGuard(bookingOwnerGuard, 'b1')).toBe(true);
  });
});
