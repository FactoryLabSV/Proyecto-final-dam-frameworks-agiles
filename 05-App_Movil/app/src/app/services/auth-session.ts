import { Injectable, computed, signal } from '@angular/core';

import type { LoginResponse, SessionUser } from '../models/auth';

const TOKEN_KEY = 'tamachihua.accessToken';
const USER_KEY = 'tamachihua.user';
const EXPIRES_AT_KEY = 'tamachihua.expiresAt';

/**
 * Guarda la sesión en el dispositivo y la comparte con la app.
 * No depende de HttpClient para que el interceptor pueda usarlo sin ciclos.
 */
@Injectable({ providedIn: 'root' })
export class AuthSession {
  private readonly user = signal<SessionUser | null>(this.readUser());

  readonly currentUser = this.user.asReadonly();

  readonly isAuthenticated = computed(() => this.user() !== null && this.hasValidSession());

  get token(): string | null {
    return this.storageGet(TOKEN_KEY);
  }

  get expiresAt(): number | null {
    const value = this.storageGet(EXPIRES_AT_KEY);
    const expiresAt = value === null ? Number.NaN : Number(value);

    return Number.isFinite(expiresAt) ? expiresAt : null;
  }

  save(response: LoginResponse): void {
    const expiresIn = response.expiresIn > 0 ? response.expiresIn : 3600;
    const expiresAt = Date.now() + expiresIn * 1000;

    this.storageSet(TOKEN_KEY, response.accessToken);
    this.storageSet(USER_KEY, JSON.stringify(response.user));
    this.storageSet(EXPIRES_AT_KEY, String(expiresAt));

    this.user.set(response.user);
  }

  clear(): void {
    this.storageRemove(TOKEN_KEY);
    this.storageRemove(USER_KEY);
    this.storageRemove(EXPIRES_AT_KEY);

    this.user.set(null);
  }

  hasValidSession(): boolean {
    if (!this.token) {
      return false;
    }

    const expiresAt = this.expiresAt;

    return expiresAt === null || Date.now() < expiresAt;
  }

  private readUser(): SessionUser | null {
    const raw = this.storageGet(USER_KEY);

    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<SessionUser>;

      if (
        typeof parsed.id === 'number' &&
        typeof parsed.username === 'string' &&
        typeof parsed.fullName === 'string' &&
        typeof parsed.role === 'string'
      ) {
        return parsed as SessionUser;
      }
    } catch {
      // Si el dato guardado está corrupto se descarta la sesión.
    }

    return null;
  }

  private storageGet(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private storageSet(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Si el dispositivo no permite almacenar, la sesión dura solo la pantalla.
    }
  }

  private storageRemove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // Nada que hacer: la sesión igual se limpia en memoria.
    }
  }
}
