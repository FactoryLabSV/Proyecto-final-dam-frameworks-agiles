import { HttpClient } from '@angular/common/http';
import type { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import type { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Api {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(this.buildUrl(endpoint), { params }).pipe(catchError((error) => this.handleError(error)));
  }

  private buildUrl(endpoint: string): string {
    return this.baseUrl + '/' + endpoint;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'Ocurrió un error al consultar el servidor.';

    if (error.status === 0) {
      message = 'No se pudo conectar con el servidor.';
    } else if (error.error && typeof error.error.message === 'string' && error.error.message.trim() !== '') {
      message = error.error.message;
    } else if (error.status === 401) {
      message = 'No tenés autorización para realizar esta consulta.';
    } else if (error.status === 403) {
      message = 'No tenés permiso para acceder a este recurso.';
    } else if (error.status === 404) {
      message = 'No se encontró el recurso solicitado.';
    } else if (error.status >= 500) {
      message = 'El servidor presentó un error. Intentá más tarde.';
    }

    return throwError(() => new Error(message));
  }
}
