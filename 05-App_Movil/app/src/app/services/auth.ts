import { HttpClient, type HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, tap, throwError, type Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { AuthError, type LoginRequest, type LoginResponse } from '../models/auth';

import { AuthSession } from './auth-session';

@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly http = inject(HttpClient);
  private readonly session = inject(AuthSession);
  private readonly loginUrl = `${environment.apiUrl}/auth/login`;

  login(username: string, password: string): Observable<LoginResponse> {
    const body: LoginRequest = {
      username: username.trim(),
      password,
    };

    return this.http
      .post<LoginResponse>(this.loginUrl, body, {
        // La API valida que el rol pueda entrar a la app (HU-17).
        headers: { 'X-Client-Interface': 'app' },
      })
      .pipe(
        tap((response) => this.session.save(response)),
        catchError((error: HttpErrorResponse) => throwError(() => this.toAuthError(error))),
      );
  }

  logout(): void {
    this.session.clear();
  }

  private toAuthError(error: HttpErrorResponse): AuthError {
    if (error.status === 0) {
      return new AuthError(0, 'No se pudo conectar con el servidor. Verificá tu conexión e intentá de nuevo.');
    }

    if (error.status === 401) {
      return new AuthError(401, 'Credenciales inválidas. Verificá tu usuario y contraseña.');
    }

    if (error.status === 403) {
      return new AuthError(
        403,
        this.serverMessage(error) ?? 'Tu rol no tiene permiso para ingresar a la aplicación móvil.',
      );
    }

    if (error.status === 400) {
      return new AuthError(400, this.serverMessage(error) ?? 'Revisá los datos ingresados.');
    }

    if (error.status >= 500) {
      return new AuthError(error.status, 'El servidor presentó un error. Intentá más tarde.');
    }

    return new AuthError(error.status, this.serverMessage(error) ?? 'No se pudo iniciar sesión. Intentá nuevamente.');
  }

  private serverMessage(error: HttpErrorResponse): string | null {
    const body = error.error as { message?: unknown } | null;

    if (body && typeof body.message === 'string' && body.message.trim() !== '') {
      return body.message;
    }

    return null;
  }
}
