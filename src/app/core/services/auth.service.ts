import { Injectable, computed, inject, signal } from '@angular/core';
import { Role, User } from '../models';
import { StorageService } from './storage.service';
import { STORAGE_KEYS } from '../storage-keys';
import { hashPassword } from '../utils/password';
import { uid } from '../utils/id';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storage = inject(StorageService);
  private readonly usersSignal = signal<User[]>(this.storage.get<User[]>(STORAGE_KEYS.users, []));
  private readonly sessionSignal = signal<User | null>(
    this.storage.get<User | null>(STORAGE_KEYS.session, null),
  );

  readonly users = this.usersSignal.asReadonly();
  readonly currentUser = this.sessionSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.sessionSignal() !== null);
  readonly isAdmin = computed(() => this.sessionSignal()?.role === 'ADMIN');

  async register(name: string, email: string, password: string): Promise<User> {
    return this.createUser(name, email, password, 'VOYAGEUR', true);
  }

  async seedUser(name: string, email: string, password: string, role: Role): Promise<User> {
    return this.createUser(name, email, password, role, false);
  }

  async login(email: string, password: string): Promise<User> {
    const normalized = email.trim().toLowerCase();
    const passwordHash = await hashPassword(password);
    const user = this.usersSignal().find(
      (candidate) => candidate.email === normalized && candidate.passwordHash === passwordHash,
    );
    if (!user) {
      throw new Error('E-mail ou mot de passe incorrect');
    }
    this.openSession(user);
    return user;
  }

  logout(): void {
    this.sessionSignal.set(null);
    this.storage.remove(STORAGE_KEYS.session);
  }

  private async createUser(
    name: string,
    email: string,
    password: string,
    role: Role,
    openSession: boolean,
  ): Promise<User> {
    const trimmedName = name.trim();
    const normalized = email.trim().toLowerCase();
    if (!trimmedName || !normalized || !password) {
      throw new Error('Tous les champs sont obligatoires');
    }
    if (this.usersSignal().some((candidate) => candidate.email === normalized)) {
      throw new Error('Cet e-mail est déjà utilisé');
    }
    const user: User = {
      id: uid(),
      name: trimmedName,
      email: normalized,
      passwordHash: await hashPassword(password),
      role,
    };
    this.usersSignal.set([...this.usersSignal(), user]);
    this.storage.set(STORAGE_KEYS.users, this.usersSignal());
    if (openSession) {
      this.openSession(user);
    }
    return user;
  }

  private openSession(user: User): void {
    this.sessionSignal.set(user);
    this.storage.set(STORAGE_KEYS.session, user);
  }
}
