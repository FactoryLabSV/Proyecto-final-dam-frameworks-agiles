import type { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthSession } from '../services/auth-session';

/**
 * Envía el token en cada consulta (HU-17). Si la API responde 401,
 * la sesión ya no sirve y se vuelve al inicio de sesión.
 */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const session = inject(AuthSession);
  const router = inject(Router);

  const isLogin = request.url.endsWith('/auth/login');
  const token = session.token;

  const authRequest =
    token && !isLogin
      ? request.clone({
          setHeaders: { Authorization: `Bearer ${token}` },
        })
      : request;

  return next(authRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isLogin) {
        session.clear();
        void router.navigate(['/login'], {
          queryParams: { expired: 1 },
        });
      }

      return throwError(() => error);
    }),
  );
};
