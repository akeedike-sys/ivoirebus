import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('renvoie la valeur de secours sans accéder au stockage hors navigateur', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }, StorageService],
    });
    const service = TestBed.inject(StorageService);

    expect(service.get('missing', 'fallback')).toBe('fallback');

    service.set('key', 'value');
    expect(localStorage.length).toBe(0);
  });

  it('persiste et relit une valeur en environnement navigateur', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, StorageService],
    });
    const service = TestBed.inject(StorageService);

    service.set('key', { value: 42 });
    expect(service.get('key', null)).toEqual({ value: 42 });

    service.remove('key');
    expect(service.get('key', 'default')).toBe('default');
  });
});
