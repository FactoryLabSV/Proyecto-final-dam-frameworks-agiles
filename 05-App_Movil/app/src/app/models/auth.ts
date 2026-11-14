export interface LoginRequest {
  username: string;
  password: string;
}

export interface SessionUser {
  id: number;
  username: string;
  fullName: string;
  role: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: SessionUser;
}

/**
 * Error de inicio de sesión con el código HTTP para distinguir
 * credenciales inválidas (401), rol sin permiso (403) o falta de conexión (0).
 */
export class AuthError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'AuthError';
  }

  get isOffline(): boolean {
    return this.status === 0;
  }
}
