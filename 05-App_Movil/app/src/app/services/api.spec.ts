import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';

import { Api, type ApiError } from './api';

describe('Api', () => {
  let service: Api;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Api, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(Api);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('debe realizar una solicitud GET', () => {
    const categorias = [{ id: 1, name: 'Herramientas' }];

    service.get('categories').subscribe((resultado) => {
      expect(resultado).toEqual(categorias);
    });

    const solicitud = httpMock.expectOne(environment.apiUrl + '/categories');

    expect(solicitud.request.method).toBe('GET');
    solicitud.flush(categorias);
  });

  it('debe manejar errores de conexión', () => {
    service.get('categories').subscribe({
      next: () => {
        throw new Error('Se esperaba un error');
      },
      error: (error: ApiError) => {
        expect(error.message).toBe('No se pudo conectar con el servidor.');
        expect(error.status).toBe(0);
      },
    });

    const solicitud = httpMock.expectOne(environment.apiUrl + '/categories');

    solicitud.flush(null, {
      status: 0,
      statusText: 'Unknown Error',
    });
  });

  it('debe conservar el código HTTP en el error', () => {
    service.get('products').subscribe({
      next: () => {
        throw new Error('Se esperaba un error');
      },
      error: (error: ApiError) => {
        expect(error.status).toBe(404);
        expect(error.message).toBe('No se encontró el recurso solicitado.');
      },
    });

    const solicitud = httpMock.expectOne(environment.apiUrl + '/products');

    solicitud.flush(null, {
      status: 404,
      statusText: 'Not Found',
    });
  });
});
