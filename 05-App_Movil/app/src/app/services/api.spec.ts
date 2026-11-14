import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';

import { Api } from './api';

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
      error: (error) => {
        expect(error.message).toBe('No se pudo conectar con el servidor.');
      },
    });

    const solicitud = httpMock.expectOne(environment.apiUrl + '/categories');

    solicitud.flush(null, {
      status: 0,
      statusText: 'Unknown Error',
    });
  });
});
