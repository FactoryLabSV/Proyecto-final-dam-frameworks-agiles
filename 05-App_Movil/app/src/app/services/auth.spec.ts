import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../environments/environment';
import type { LoginResponse } from '../models/auth';

import { Auth } from './auth';
import { AuthSession } from './auth-session';

const loginResponse: LoginResponse = {
  accessToken: 'token-de-prueba',
  tokenType: 'Bearer',
  expiresIn: 3600,
  user: {
    id: 4,
    username: 'kalvarado',
    fullName: 'Karla Alvarado',
    role: 'SELLER',
  },
};

describe('Auth', () => {
  let service: Auth;
  let session: AuthSession;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [Auth, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(Auth);
    session = TestBed.inject(AuthSession);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('envía la interfaz app y guarda la sesión', async () => {
    const promise = firstValueFrom(service.login('  kalvarado  ', 'secreta'));

    const request = httpMock.expectOne(`${environment.apiUrl}/auth/login`);

    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('X-Client-Interface')).toBe('app');
    expect(request.request.body).toEqual({
      username: 'kalvarado',
      password: 'secreta',
    });

    request.flush(loginResponse);

    await expect(promise).resolves.toEqual(loginResponse);
    expect(session.token).toBe('token-de-prueba');
    expect(session.currentUser()).toEqual(loginResponse.user);
    expect(session.hasValidSession()).toBe(true);
  });

  it('traduce las credenciales inválidas a un mensaje claro', async () => {
    const promise = firstValueFrom(service.login('kalvarado', 'incorrecta'));

    const request = httpMock.expectOne(`${environment.apiUrl}/auth/login`);

    request.flush({ message: 'Credenciales inválidas' }, { status: 401, statusText: 'Unauthorized' });

    await expect(promise).rejects.toMatchObject({
      name: 'AuthError',
      status: 401,
      message: 'Credenciales inválidas. Verificá tu usuario y contraseña.',
    });
    expect(session.token).toBeNull();
  });

  it('limpia la sesión al cerrar sesión', async () => {
    const promise = firstValueFrom(service.login('kalvarado', 'secreta'));
    const request = httpMock.expectOne(`${environment.apiUrl}/auth/login`);

    request.flush(loginResponse);
    await promise;

    service.logout();

    expect(session.token).toBeNull();
    expect(session.currentUser()).toBeNull();
    expect(session.hasValidSession()).toBe(false);
  });
});
