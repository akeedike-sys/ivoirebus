import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly platformId = inject(PLATFORM_ID);

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  get<T>(key: string, fallback: T): T {
    if (!this.isBrowser) {
      return fallback;
    }
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : (JSON.parse(raw) as T);
    } catch {
      return fallback;
    }
  }

  set<T>(key: string, value: T): void {
    if (!this.isBrowser) {
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Stockage indisponible (quota, navigation privée) : ignoré pour le MVP.
    }
  }

  remove(key: string): void {
    if (!this.isBrowser) {
      return;
    }
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignoré.
    }
  }
}
