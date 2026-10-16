export type Role = 'ADMIN' | 'VOYAGEUR';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
}

export interface City {
  id: string;
  name: string;
}

export interface Trip {
  id: string;
  departureCityId: string;
  arrivalCityId: string;
  departureAt: string;
  price: number;
  capacity: number;
}

export type BookingStatus = 'CONFIRMEE' | 'ANNULEE';

export interface Booking {
  id: string;
  tripId: string;
  seatNumber: number;
  userId: string;
  createdAt: string;
  status: BookingStatus;
  amount: number;
}

export interface TicketData {
  bookingId: string;
  seatNumber: number;
  passenger: string;
  from: string;
  to: string;
  departureAt: string;
  amount: number;
  status: BookingStatus;
}
