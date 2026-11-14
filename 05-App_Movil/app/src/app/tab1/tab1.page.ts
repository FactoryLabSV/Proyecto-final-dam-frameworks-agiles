
import { Component, inject } from '@angular/core';
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
  IonBadge,
  IonButtons,
  IonButton,
  IonIcon
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';

import {
  Producto,
  PRODUCTOS_SIMULADOS
} from '../models/producto';
import { Auth } from '../services/auth';

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
    IonButtons,
    IonButton,
    IonIcon
  ],
})
export class Tab1Page {

  private readonly auth = inject(Auth);

  productos: Producto[] = PRODUCTOS_SIMULADOS;

  resultados: Producto[] = [];

  constructor(private router: Router) {
    addIcons({ logOutOutline });
    this.resultados = this.productos;
  }

  verDetalle(producto: Producto) {
    this.router.navigate(['/tabs/tab1/producto', producto.id]);
  }

  cerrarSesion(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login', { replaceUrl: true });
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
