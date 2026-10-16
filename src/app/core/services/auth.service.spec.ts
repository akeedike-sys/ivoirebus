import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { STORAGE_KEYS } from '../storage-keys';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  it('inscrit un nouveau compte avec le rôle VOYAGEUR et ouvre une session', async () => {
    const user = await service.register('Awa Traoré', 'awa@example.ci', 'secret123');

    expect(user.role).toBe('VOYAGEUR');
    expect(service.currentUser()?.email).toBe('awa@example.ci');
    expect(service.isAuthenticated()).toBe(true);
  });

  it('refuse une adresse e-mail déjà utilisée', async () => {
    await service.register('Awa', 'awa@example.ci', 'secret123');

    await expect(service.register('Autre', 'AWA@example.ci', 'autre123')).rejects.toThrow(
      'Cet e-mail est déjà utilisé',
    );
  });

  it('connecte un utilisateur avec des identifiants valides', async () => {
    await service.register('Awa', 'awa@example.ci', 'secret123');
    service.logout();

    const user = await service.login('awa@example.ci', 'secret123');

    expect(user.name).toBe('Awa');
    expect(service.isAuthenticated()).toBe(true);
  });

  it('rejette des identifiants invalides avec un message générique', async () => {
    await service.register('Awa', 'awa@example.ci', 'secret123');
    service.logout();

    await expect(service.login('awa@example.ci', 'mauvais')).rejects.toThrow(
      'E-mail ou mot de passe incorrect',
    );
    await expect(service.login('inconnu@example.ci', 'secret123')).rejects.toThrow(
      'E-mail ou mot de passe incorrect',
    );
  });

  it('met fin à la session lors de la déconnexion', async () => {
    await service.register('Awa', 'awa@example.ci', 'secret123');
    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem(STORAGE_KEYS.session)).toBeNull();
  });

  it('restaure la session persistée après recréation du service', async () => {
    await service.register('Awa', 'awa@example.ci', 'secret123');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const restored = TestBed.inject(AuthService);

    expect(restored.isAuthenticated()).toBe(true);
    expect(restored.currentUser()?.email).toBe('awa@example.ci');
  });
});
