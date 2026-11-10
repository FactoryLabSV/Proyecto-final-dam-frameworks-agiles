
import { Component } from '@angular/core';
import { Router } from '@angular/router';
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

import {
  Producto,
  PRODUCTOS_SIMULADOS
} from '../models/producto';

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
  ],
})
export class Tab1Page {

  productos: Producto[] = PRODUCTOS_SIMULADOS;

  resultados: Producto[] = [];

  constructor(private router: Router) {
    this.resultados = this.productos;
  }

  verDetalle(producto: Producto) {
    this.router.navigate(['/tabs/tab1/producto', producto.id]);
  }

  buscar(event: any) {
    const texto = (event.detail.value || '').trim().toLowerCase();

    if (texto === '') {
      this.resultados = this.productos;
      return;
    }

    this.resultados = this.productos.filter(producto => {
      const nombre = producto.name.toLowerCase();
      const codigo = producto.code.toLowerCase();

      return nombre.includes(texto) || codigo === texto;
    });
  }
}
