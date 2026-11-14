import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

import { AuthSession } from '../services/auth-session';

/** Solo permite entrar si hay una sesión válida (token vigente). */
export const authGuard: CanActivateFn = () => {
  const session = inject(AuthSession);
  const router = inject(Router);

  if (session.hasValidSession()) {
    return true;
  }

  session.clear();

  return router.createUrlTree(['/login']);
};

/** Si ya hay sesión, el login no se muestra: se va a la pantalla principal. */
export const guestGuard: CanActivateFn = () => {
  const session = inject(AuthSession);
  const router = inject(Router);

  if (session.hasValidSession()) {
    return router.createUrlTree(['/tabs/tab1']);
  }

  session.clear();

  return true;
};
