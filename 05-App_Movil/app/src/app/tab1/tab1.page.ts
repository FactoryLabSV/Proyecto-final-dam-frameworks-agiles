import { Component, OnInit } from '@angular/core';
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
  IonBadge
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
    IonBadge
  ]
})
export class Tab1Page implements OnInit {

  resultados: Producto[] = [];
  busquedaActual = 0;

  constructor(
    private api: Api,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarProductos('');
  }

  cargarProductos(texto: string) {
    const busqueda = ++this.busquedaActual;
    const params = new HttpParams().set('search', texto);

    this.api.get<{ content: Producto[] }>('app/products', params).subscribe({
      next: (respuesta) => {
        if (busqueda === this.busquedaActual) {
          this.resultados = respuesta.content;
        }
      },
      error: (error) => {
        if (busqueda === this.busquedaActual) {
          console.error('Error al cargar productos:', error.message);
          this.resultados = [];
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
