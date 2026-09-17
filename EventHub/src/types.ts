export type UserRole = 'USER' | 'ORGANIZER';
export type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrganizerSummary {
  id: string;
  name: string;
  email: string;
}

export interface EventItem {
  id: string;
  organizerId: string;
  organizer?: OrganizerSummary;
  name: string;
  image: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Booking {
  id: string;
  userId: string;
  eventId: string;
  event?: EventItem;
  user?: User;
  numberOfSeats: number;
  totalAmount: number;
  status: BookingStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthSession {
  token: string;
  user: User;
}
