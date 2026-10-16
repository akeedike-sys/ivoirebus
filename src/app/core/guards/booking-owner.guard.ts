import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { BookingService } from '../services/booking.service';

export const bookingOwnerGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const bookings = inject(BookingService);
  const router = inject(Router);

  const bookingId = route.paramMap.get('bookingId');
  const user = auth.currentUser();
  if (!bookingId || !user) {
    return router.createUrlTree(['/connexion']);
  }

  const booking = bookings.byId(bookingId);
  if (!booking) {
    return router.createUrlTree(['/reservations']);
  }

  if (bookings.canAccess(booking, user.id, user.role === 'ADMIN')) {
    return true;
  }
  return router.createUrlTree(['/reservations']);
};
