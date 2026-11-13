import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBadge,
  IonAlert
} from '@ionic/angular';

import { Api } from '../services/api';
import { Producto } from '../models/producto';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSearchbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonBadge,
    IonAlert
  ]
})
export class Tab1Page implements OnInit {

  resultados: Producto[] = [];
  busquedaActual = 0;
  textoBusqueda = '';

  cargando = false;
  errorConexion = false;
  mostrarAlerta = false;

  botonesAlerta = [
    {
      text: 'Reintentar',
      handler: () => {
        this.mostrarAlerta = false;
        this.cargarProductos(this.textoBusqueda);
      }
    }
  ];

  constructor(
    private api: Api,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarProductos('');
  }

  cargarProductos(texto: string) {
    this.textoBusqueda = texto;
    this.cargando = true;
    this.errorConexion = false;

    const busqueda = ++this.busquedaActual;
    const params = new HttpParams().set('search', texto);

    this.api.get<{ content: Producto[] }>('app/products', params).subscribe({
      next: (respuesta) => {
        if (busqueda === this.busquedaActual) {
          this.resultados = respuesta.content;
          this.cargando = false;
          this.errorConexion = false;
          this.mostrarAlerta = false;
          this.cdr.markForCheck();
        }
      },
      error: (error) => {
        if (busqueda === this.busquedaActual) {
          console.error('Error al cargar productos:', error);

          this.resultados = [];
          this.cargando = false;
          this.errorConexion = true;
          this.mostrarAlerta = true;

          this.cdr.markForCheck();
        }
      }
    });
  }

  buscar(event: CustomEvent) {
    const texto = (event.detail.value || '').trim();
    this.cargarProductos(texto);
  }

  verDetalle(producto: Producto) {
    this.router.navigate(['/tabs/tab1/producto', producto.id]);
  }
}
